import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import * as z from 'zod/v4';
import { addSubject, addTask, addTopic, completeTask, createStudyPlan, getProgress, getSchedule, getState, rescheduleTask, setTopicConfidence, startFocusSession, updateFocusTimer } from './state.js';

function createServer(){
  const server=new McpServer({name:'studypilot',version:'1.0.0'});
  server.registerTool('add_task',{description:'Add a study task to the shared StudyPilot planner.',inputSchema:{title:z.string().min(1).describe('Task title'),subject:z.string().min(1).describe('Subject name'),date:z.string().optional().describe('Due date in YYYY-MM-DD format'),time:z.string().optional().describe('Start time in 24-hour HH:MM format'),duration:z.number().int().min(1).max(600).optional().describe('Duration in minutes'),topic:z.string().optional().describe('Topic covered'),priority:z.enum(['low','medium','high']).optional().describe('Task priority')}},async args=>{const task=await addTask({title:args.title,subject:args.subject,date:args.date||new Date().toISOString().slice(0,10),start:args.time||'10:00',duration:args.duration||45,topic:args.topic||'',priority:args.priority||'medium'});return {content:[{type:'text',text:JSON.stringify(task)}]};});
  server.registerTool('complete_task',{description:'Mark an existing StudyPilot task as complete.',inputSchema:{id:z.string().min(1).describe('Exact task id to complete')}},async({id})=>({content:[{type:'text',text:JSON.stringify(await completeTask(id))}]}));
  server.registerTool('reschedule_task',{description:'Move an existing StudyPilot task to a new date and/or start time.',inputSchema:{id:z.string().min(1).describe('Exact task id to move'),newTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).describe('New start time in 24-hour HH:MM format'),date:z.string().optional().describe('New date in YYYY-MM-DD format')}},async({id,newTime,date})=>({content:[{type:'text',text:JSON.stringify(await rescheduleTask(id,newTime,date))}]}));
  server.registerTool('create_study_plan',{description:'Create daily study tasks for a subject over the requested number of days.',inputSchema:{subject:z.string().min(1).describe('Subject to study'),days:z.number().int().min(1).max(30).describe('Number of consecutive days'),hoursPerDay:z.number().min(0.25).max(12).describe('Study hours to schedule each day')}},async({subject,days,hoursPerDay})=>({content:[{type:'text',text:JSON.stringify(await createStudyPlan(subject,days,hoursPerDay))}]}));
  server.registerTool('start_focus_session',{description:'Start a persistent focus timer, optionally selecting a task by id or title.',inputSchema:{minutes:z.number().int().min(1).max(240).describe('Focus session length in minutes'),task:z.string().optional().describe('Task id or title to study')}},async({minutes,task})=>({content:[{type:'text',text:JSON.stringify(await startFocusSession(minutes,task))}]}));
  server.registerTool('get_schedule',{description:'Read scheduled StudyPilot tasks, optionally for a specific date.',inputSchema:{date:z.string().optional().describe('Filter by YYYY-MM-DD date')}},async({date})=>({content:[{type:'text',text:JSON.stringify(getSchedule(date))}]}));
  server.registerTool('get_progress',{description:'Summarize completed tasks, study sessions, minutes, and per-subject mastery.',inputSchema:{}},async()=>({content:[{type:'text',text:JSON.stringify(getProgress())}]}));
  server.registerTool('set_topic_confidence',{description:'Set a subject topic confidence rating from 0 (not started) to 5 (very confident).',inputSchema:{subject:z.string().min(1).describe('Exact subject name'),topic:z.string().min(1).describe('Exact topic name'),confidence:z.number().min(0).max(5).describe('Confidence rating from 0 to 5')}},async({subject,topic,confidence})=>({content:[{type:'text',text:JSON.stringify(await setTopicConfidence(subject,topic,confidence))}]}));
  server.registerTool('update_focus_timer',{description:'Pause, resume, end, or extend the persistent focus timer.',inputSchema:{command:z.enum(['pause','resume','end','add_minutes']).describe('Timer operation'),minutes:z.number().int().min(1).max(240).optional().describe('Minutes to add when command is add_minutes')}},async({command,minutes})=>{const timer=getState().timer;let changes={};if(command==='pause')changes={running:false,startedAt:null};if(command==='resume')changes={running:true,startedAt:new Date().toISOString()};if(command==='end')changes={running:false,seconds:0,startedAt:null};if(command==='add_minutes')changes={seconds:(timer.seconds||0)+(minutes||5)*60,totalSeconds:(timer.totalSeconds||0)+(minutes||5)*60,startedAt:timer.running?new Date().toISOString():null};return {content:[{type:'text',text:JSON.stringify(await updateFocusTimer(changes))}]};});
  server.registerTool('add_subject',{description:'Add a subject with optional category and chapter structure.',inputSchema:{name:z.string().min(1).describe('Subject name'),category:z.string().optional().describe('Subject category'),chapters:z.array(z.object({name:z.string(),topics:z.array(z.object({name:z.string(),confidence:z.number().min(0).max(5).optional()})).optional()})).optional().describe('Initial chapters and topics')}},async args=>({content:[{type:'text',text:JSON.stringify(await addSubject(args))}]}));
  server.registerTool('add_topic',{description:'Add a topic to a subject, creating a first chapter when needed.',inputSchema:{subject:z.string().min(1).describe('Exact subject name'),topic:z.string().min(1).describe('Topic name'),chapter:z.string().optional().describe('Chapter name')}},async({subject,topic,chapter})=>({content:[{type:'text',text:JSON.stringify(await addTopic(subject,topic,chapter))}]}));
  return server;
}

function originAllowed(origin,req){
  if(!origin)return true;
  let parsed;try{parsed=new URL(origin);}catch{return false;}
  const configured=(process.env.MCP_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);
  const devOrigins=['http://localhost:5173','http://localhost:5174','http://127.0.0.1:5173','http://127.0.0.1:5174'];
  const requestOrigin=`${req.protocol}://${req.get('host')}`;
  return ['http:','https:'].includes(parsed.protocol)&&(origin===requestOrigin||configured.includes(origin)||devOrigins.includes(origin));
}

export function attachMcpRoutes(app){
  app.use('/mcp',(req,res,next)=>{
    if(!originAllowed(req.get('origin'),req))return res.status(403).json({error:'Origin not allowed for MCP.'});
    next();
  });
  app.post('/mcp',async(req,res)=>{
    const server=createServer();const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
    try{await server.connect(transport);await transport.handleRequest(req,res,req.body);res.on('close',()=>{transport.close();server.close();});}
    catch(error){console.error(`[MCP] ${error?.message||'Request failed'}`);if(!res.headersSent)res.status(500).json({error:'MCP request failed.'});await transport.close();await server.close();}
  });
  for(const method of ['get','delete'])app[method]('/mcp',(_req,res)=>res.status(405).json({error:'Streamable HTTP MCP supports POST requests only in stateless mode.'}));
}

export async function callMcpTool(name,args={}){
  const client=new Client({name:'studypilot-voice',version:'1.0.0'});
  const transport=new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${Number(process.env.PORT)||8787}/mcp`));
  try{await client.connect(transport);return await client.callTool({name,arguments:args});}
  finally{await client.close();}
}
