import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs/promises';
import os from 'node:os';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.once('error',reject);socket.listen(0,'127.0.0.1',()=>{const value=socket.address().port;socket.close(()=>resolve(value));});});
const dataFile=path.join(os.tmpdir(),`studypilot-mcp-smoke-${process.pid}.json`);
let server=spawn(process.execPath,['index.js'],{cwd:here,env:{...process.env,PORT:String(port),STUDYPILOT_DATA_FILE:dataFile,MCP_ALLOWED_ORIGINS:`http://127.0.0.1:${port}`},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',chunk=>logs+=chunk);server.stderr.on('data',chunk=>logs+=chunk);
const base=`http://127.0.0.1:${port}`;let client;
try{
  let ready=false;
  for(let attempt=0;attempt<80;attempt++){
    if(server.exitCode!==null)throw new Error(`Server exited early: ${logs}`);
    try{const response=await fetch(`${base}/api/health`);if(response.ok){ready=true;break;}}catch{}
    await delay(125);
  }
  if(!ready)throw new Error(`Server did not become ready: ${logs}`);
  const transport=new StreamableHTTPClientTransport(new URL(`${base}/mcp`),{requestInit:{headers:{Origin:base}}});
  client=new Client({name:'studypilot-mcp-smoke',version:'1.0.0'});
  await client.connect(transport); // Streamable HTTP initialize handshake.
  const listed=await client.listTools();
  for(const name of ['add_task','complete_task','reschedule_task','create_study_plan','start_focus_session','get_schedule','get_progress','set_topic_confidence']){
    if(!listed.tools.some(tool=>tool.name===name))throw new Error(`Missing MCP tool: ${name}`);
  }
  const title=`MCP smoke task ${Date.now()}`;const date=new Date().toISOString().slice(0,10);
  await client.callTool({name:'add_task',arguments:{title,subject:'Smoke Test',date,time:'12:00',duration:20}});
  const schedule=await client.callTool({name:'get_schedule',arguments:{date}});
  const tasks=JSON.parse(schedule.content.find(item=>item.type==='text').text);
  if(!tasks.some(task=>task.title===title))throw new Error('Added task was not returned by get_schedule.');
  const restState=await fetch(`${base}/api/state`).then(response=>response.json());
  if(!restState.tasks.some(task=>task.title===title))throw new Error('MCP task was not visible through the REST state API.');
  const patched=await fetch(`${base}/api/state`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({activeTaskId:restState.tasks[0]?.id})});
  if(!patched.ok)throw new Error('REST state update failed.');
  const afterPatch=await fetch(`${base}/api/state`).then(response=>response.json());
  if(!afterPatch.tasks.some(task=>task.title===title))throw new Error('REST patch overwrote the MCP task list.');
  const conversation={id:'smoke-conversation',prompt:'Add a task for smoke testing',reply:'Added it to your schedule.',card:{type:'task',title},action:{type:'add_task'},createdAt:new Date().toISOString()};
  const convPatch=await fetch(`${base}/api/state`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({conversations:[conversation]})});
  if(!convPatch.ok)throw new Error('Conversation state update failed.');
  const saved=JSON.parse(await fs.readFile(dataFile,'utf8'));
  if(!saved.tasks.some(task=>task.title===title)||!saved.conversations.some(item=>item.id===conversation.id))throw new Error('Task or conversation was not persisted to the JSON state file.');
  const rejected=await fetch(`${base}/mcp`,{method:'POST',headers:{Origin:'https://example.invalid','content-type':'application/json'},body:'{}'});
  if(rejected.status!==403)throw new Error(`Origin check should reject unknown origins, got ${rejected.status}.`);
  await client.close();client=null;server.kill();await Promise.race([new Promise(resolve=>server.once('exit',resolve)),delay(3000)]);
  server=spawn(process.execPath,['index.js'],{cwd:here,env:{...process.env,PORT:String(port),STUDYPILOT_DATA_FILE:dataFile,MCP_ALLOWED_ORIGINS:`http://127.0.0.1:${port}`},stdio:['ignore','pipe','pipe']});
  server.stdout.on('data',chunk=>logs+=chunk);server.stderr.on('data',chunk=>logs+=chunk);
  let restarted=false;for(let attempt=0;attempt<80;attempt++){try{const response=await fetch(`${base}/api/state`);if(response.ok){const recovered=await response.json();if(!recovered.tasks.some(task=>task.title===title)||!recovered.conversations.some(item=>item.id===conversation.id))throw new Error('Task and conversation did not survive server restart.');restarted=true;break;}}catch(error){if(error.message.includes('survive'))throw error;}await delay(125);}
  if(!restarted)throw new Error(`Server did not restart with saved state: ${logs}`);
  console.log(`MCP smoke passed: initialize, tools/list (${listed.tools.length} tools), add_task/get_schedule, conversation REST save, task+conversation persistence across server restart, Origin rejection.`);
}catch(error){console.error(`MCP smoke failed: ${error.message}`);process.exitCode=1;}
finally{
  await client?.close().catch(()=>{});server.kill();
  await Promise.race([new Promise(resolve=>server.once('exit',resolve)),delay(3000)]);
  await fs.rm(dataFile,{force:true});await fs.rm(`${dataFile}.tmp`,{force:true});
}
