import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export const SYSTEM_PROMPT = `You are Croc, a study planning app co-pilot. Replies are spoken, 1-2 short sentences, with no markdown or emojis. Use only real supplied app state and tool results. If ambiguous, ask ONE short follow-up. Confirm before destructive actions and never perform them without confirmation. Answer off-topic questions briefly, then steer back to studying. Use tools for app actions and facts.`;

function mcpUrl(){return new URL(`http://127.0.0.1:${Number(process.env.PORT)||8787}/mcp`);}
export async function listMcpTools(){
  const client=new Client({name:'studypilot-bedrock',version:'1.0.0'}),transport=new StreamableHTTPClientTransport(mcpUrl());
  try{await client.connect(transport);return await client.listTools();}finally{await client.close();}
}
async function invokeMcpTool(name,args){
  const client=new Client({name:'studypilot-bedrock',version:'1.0.0'}),transport=new StreamableHTTPClientTransport(mcpUrl());
  try{await client.connect(transport);return await client.callTool({name,arguments:args});}finally{await client.close();}
}

export function createMockConverseClient(){
  let call=0;
  return {async send(command){
    if(command instanceof ConverseCommand){call++;if(call===1)return {output:{message:{role:'assistant',content:[{toolUse:{toolUseId:'mock-add-task',name:'add_task',input:{title:'Mock study task',subject:'Biology',duration:30}}}]}}};
      return {output:{message:{role:'assistant',content:[{text:'I added a 30-minute Biology study task to your plan.'}]}}};}
    throw new Error('Unsupported mock command');
  }};
}
export function createFailingMockClient(){return {async send(){throw new Error('Simulated Bedrock access denied');}};}

export async function runBedrockBrain({message,history=[],state,client=new BedrockRuntimeClient({region:process.env.AWS_REGION}),callTool=invokeMcpTool,tools,signal=AbortSignal.timeout(15000)}={}){
  const discovered=tools||await listMcpTools();
  const toolConfig={tools:discovered.tools.map(tool=>({toolSpec:{name:tool.name,description:tool.description||tool.name,inputSchema:{json:tool.inputSchema}}}))};
  const conversation=[];
  for(const turn of history.slice(-6)){
    if(turn.prompt)conversation.push({role:'user',content:[{text:String(turn.prompt).slice(0,1000)}]});
    if(turn.reply)conversation.push({role:'assistant',content:[{text:String(turn.reply).slice(0,1000)}]});
  }
  conversation.push({role:'user',content:[{text:`Current app state:\n${JSON.stringify(state)}\n\nUser request: ${message}`} ]});
  const results=[];
  for(let iteration=0;iteration<4;iteration++){
    const response=await client.send(new ConverseCommand({modelId:process.env.BEDROCK_MODEL_ID,system:[{text:SYSTEM_PROMPT}],messages:conversation,toolConfig,inferenceConfig:{temperature:0.3,maxTokens:500}}),{abortSignal:signal});
    const assistant=response.output?.message;
    if(!assistant)throw new Error('Bedrock returned no assistant message');
    conversation.push(assistant);
    const uses=(assistant.content||[]).filter(block=>block.toolUse).map(block=>block.toolUse);
    if(!uses.length){
      const reply=(assistant.content||[]).map(block=>block.text||'').join(' ').trim();
      if(!reply)throw new Error('Bedrock returned empty final text');
      const last=results.at(-1);
      const action=last?.action||null;
      const card=last?.card||null;
      return {reply:reply.slice(0,1200),action,card};
    }
    const content=[];
    for(const use of uses){
      let result;try{result=await callTool(use.name,use.input||{});results.push({name:use.name,args:use.input||{},result,action:actionFromToolResult(use.name,use.input||{},result)});}
      catch(error){result={isError:true,content:[{type:'text',text:error.message||'Tool failed'}]};results.push({name:use.name,args:use.input||{},result,action:null});}
      const text=result.content?.filter(item=>item.type==='text').map(item=>item.text).join('\n')||JSON.stringify(result);
      content.push({toolResult:{toolUseId:use.toolUseId,content:[{text}],status:result.isError?'error':'success'}});
    }
    conversation.push({role:'user',content});
  }
  throw new Error('Bedrock exceeded the four-iteration tool limit');
}

export function actionFromToolResult(name,args,result){
  if(result?.isError)return null;
  const params={...args};
  if(name==='add_task')return {type:'add_task',params:{title:args.title,subject:args.subject,minutes:args.duration||45,due:args.date},executed:true};
  if(name==='complete_task')return {type:'complete_task',params:{id:args.id},executed:true};
  if(name==='reschedule_task')return {type:'reschedule_task',params:{id:args.id,newTime:args.newTime},executed:true};
  if(name==='create_study_plan')return {type:'create_plan',params:{subject:args.subject,days:args.days,hoursPerDay:args.hoursPerDay},executed:true};
  if(name==='start_focus_session')return {type:'start_focus',params:{minutes:args.minutes,task:args.task},executed:true};
  if(name==='update_focus_timer')return ({pause:{type:'pause_timer'},resume:{type:'resume_timer'},end:{type:'end_session'},add_minutes:{type:'add_minutes',params:{n:args.minutes||5}}}[args.command]&&{...(args.command==='add_minutes'?{type:'add_minutes',params:{n:args.minutes||5}}:{type:`${args.command}_timer`}),executed:true})||null;
  if(name==='get_schedule')return {type:'show_schedule',params,executed:true};
  if(name==='get_progress')return {type:'show_progress',params,executed:true};
  if(name==='set_topic_confidence')return {type:'set_topic_confidence',params,executed:true};
  return null;
}

export async function startupConverseCheck(){
  const client=new BedrockRuntimeClient({region:process.env.AWS_REGION});
  return client.send(new ConverseCommand({modelId:process.env.BEDROCK_MODEL_ID,system:[{text:'Reply with OK.'}],messages:[{role:'user',content:[{text:'Respond with OK.'}]}],inferenceConfig:{maxTokens:8}}),{abortSignal:AbortSignal.timeout(15000)});
}
