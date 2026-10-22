import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attachMcpRoutes, callMcpTool } from './mcp.js';
import { getState, replaceState, resetState, updateState } from './state.js';
import { createMockConverseClient, runBedrockBrain, startupConverseCheck } from './bedrock.js';
import { keywordBrain } from './keyword.js';

const here=path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path:path.resolve(here,'../.env')});
const app=express();
app.use(express.json({limit:'2mb'}));
attachMcpRoutes(app);
const brainProvider=()=>process.env.BRAIN_PROVIDER||'keyword';
function cleanHistory(value){return Array.isArray(value)?value.slice(-6).map(turn=>({prompt:String(turn?.prompt||'').slice(0,1000),reply:String(turn?.reply||'').slice(0,1000)})).filter(turn=>turn.prompt||turn.reply):[];}
function appContext(browserState={}){
  const current=getState(),today=new Date().toISOString().slice(0,10);
  const subjects=current.subjects.map(subject=>{const topics=(subject.chapters||[]).flatMap(chapter=>chapter.topics||[]);return {...subject,mastery:topics.length?Math.round(topics.reduce((sum,topic)=>sum+Number(topic.confidence||0),0)/topics.length*20):0,topics};});
  return {...browserState,todayMissions:current.tasks.filter(task=>task.date===today).map(task=>({...task,time:task.start,minutes:task.duration})),subjects,timer:{...current.timer,task:current.tasks.find(task=>task.id===current.timer.taskId)?.title||'',minutesRemaining:Math.ceil(Number(current.timer.seconds||0)/60)},tasks:current.tasks,sessions:current.sessions};
}
app.get('/api/health',(_req,res)=>res.json({ok:true,provider:brainProvider()}));
app.get('/api/state',(_req,res)=>res.json(getState()));
app.post('/api/state/reset',async(_req,res)=>{try{return res.json(await resetState());}catch{return res.status(500).json({error:'Could not reset demo data.'});}});
app.put('/api/state',async(req,res)=>{try{return res.json(await replaceState(req.body));}catch(error){return res.status(400).json({error:error.message});}});
app.patch('/api/state',async(req,res)=>{const allowed=['tasks','subjects','sessions','timer','activeTaskId','profile','conversations'];const patch=Object.fromEntries(Object.entries(req.body||{}).filter(([key])=>allowed.includes(key)));try{return res.json(await updateState(current=>({...current,...patch,timer:patch.timer?{...current.timer,...patch.timer}:current.timer})));}catch(error){return res.status(400).json({error:error.message});}});
app.post('/api/mcp/tool',async(req,res)=>{const allowed=['add_task','complete_task','reschedule_task','create_study_plan','start_focus_session','get_schedule','get_progress','set_topic_confidence','update_focus_timer','add_subject','add_topic'];if(!allowed.includes(req.body?.name))return res.status(400).json({error:'Unsupported StudyPilot MCP tool.'});try{const result=await callMcpTool(req.body.name,req.body.arguments||{});const text=result.content?.find(item=>item.type==='text')?.text;return res.json(text?JSON.parse(text):result);}catch(error){console.error(`[MCP client] ${error?.stack||error}`);return res.status(502).json({error:'MCP tool call failed.'});}});
app.post('/api/croc',async(req,res)=>{
  const message=typeof req.body?.message==='string'?req.body.message.trim():'';
  if(!message||message.length>2000){console.log(`[Croc] brain=none attempted=false fallback=false reason=invalid_input`);return res.status(400).json({error:'Message must contain 1-2000 characters.',brain:'none'});}
  const history=cleanHistory(req.body.history),state=appContext(req.body.state);
  if(brainProvider()==='keyword'){
    try{const result=await keywordBrain(message,state);console.log('[Croc] brain=keyword attempted=false fallback=false');return res.json({...result,brain:'keyword'});}
    catch(error){const message=String(error?.message||error);console.log(`[Croc] brain=keyword attempted=false fallback=false error=${JSON.stringify(message)}`);return res.status(502).json({error:'Keyword brain could not complete that request.',brain:'keyword'});}
  }
  try{
    const client=brainProvider()==='bedrock-mock'?createMockConverseClient():undefined;
    const result=await runBedrockBrain({message,history,state,client});
    console.log(`[Croc] brain=bedrock attempted=true fallback=false`);
    return res.json({...result,brain:'bedrock'});
  }catch(error){
    const fullError=String(error?.message||error);
    const reason=error?.name==='TimeoutError'||error?.name==='AbortError'?'Bedrock timed out':error?.name==='CredentialsProviderError'?'AWS credentials unavailable':error?.name==='AccessDeniedException'?'AWS access denied':error?.name==='ThrottlingException'?'Bedrock is throttling requests':error?.name==='ResourceNotFoundException'?'Bedrock model not found':error?.name==='ValidationException'?'Bedrock rejected the model or request configuration':'Bedrock is unavailable';
    try{const result=await keywordBrain(message,state);console.log(`[Croc] brain=keyword attempted=true fallback=true error=${JSON.stringify(fullError)} reason=${JSON.stringify(reason)}`);return res.json({...result,brain:'keyword',fallback:true,reason});}
    catch(fallbackError){const fallbackMessage=String(fallbackError?.message||fallbackError);console.log(`[Croc] brain=keyword attempted=true fallback=true error=${JSON.stringify(fullError)} reason=${JSON.stringify(reason)} fallbackError=${JSON.stringify(fallbackMessage)}`);return res.json({reply:`${reason}. I can still help with your study plan; what would you like to do?`,action:null,card:null,brain:'keyword',fallback:true,reason});}
  }
});
const port=Number(process.env.PORT)||8787;
app.listen(port,'127.0.0.1',async()=>{
  console.log(`[Startup] BRAIN_PROVIDER=${process.env.BRAIN_PROVIDER||'keyword'} AWS_REGION=${process.env.AWS_REGION||'(unset)'} BEDROCK_MODEL_ID=${process.env.BEDROCK_MODEL_ID||'(unset)'}`);
  console.log(`StudyPilot API listening on http://localhost:${port}`);
  if(brainProvider()==='bedrock')try{await startupConverseCheck();console.log('[Bedrock] Startup Converse check succeeded.');}catch(error){console.error('[Bedrock] Startup Converse check failed; keyword fallback remains active:',error);}
});
