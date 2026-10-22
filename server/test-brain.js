import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { runBedrockBrain, createFailingMockClient } from './bedrock.js';
import { keywordBrain } from './keyword.js';
import { callMcpTool } from './mcp.js';

const pass=name=>console.log(`PASS ${name}`),fail=(name,error)=>{console.error(`FAIL ${name}: ${error?.message||error}`);process.exitCode=1;};
const probe=net.createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
process.env.PORT=String(port);
const tempDir=await fs.mkdtemp(path.join(os.tmpdir(),'studypilot-brain-'));
const child=spawn(process.execPath,['index.js'],{cwd:path.dirname(fileURLToPath(import.meta.url)),env:{...process.env,PORT:String(port),BRAIN_PROVIDER:'bedrock-mock',AWS_REGION:'us-east-1',BEDROCK_MODEL_ID:'mock-model',STUDYPILOT_DATA_FILE:path.join(tempDir,'state.json')},stdio:'ignore'});
const base=`http://127.0.0.1:${port}`;
try{
  let ready=false;for(let i=0;i<80;i++){try{if((await fetch(`${base}/api/health`)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
  if(!ready)throw new Error('Mock server did not start');
  const before=await (await fetch(`${base}/api/state`)).json();
  const response=await fetch(`${base}/api/croc`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'add a task',history:[],state:{}})});
  const result=await response.json();
  const after=await (await fetch(`${base}/api/state`)).json();
  if(result.action?.type==='add_task'&&result.action.executed)pass('tool call executed');else throw new Error('Expected executed add_task action');
  if(after.tasks.length===before.tasks.length+1&&after.tasks.some(task=>task.title==='Mock study task'))pass('state changed');else throw new Error('Mock task not present in MCP state');
  if(/added a 30-minute Biology/i.test(result.reply))pass('reply returned');else throw new Error('Expected scripted final reply');
  try{await runBedrockBrain({message:'add a task',state:{},client:createFailingMockClient()});throw new Error('Simulated client unexpectedly succeeded');}catch(error){if(error.message==='Simulated Bedrock access denied'){const fallback=await keywordBrain('add a task Biology',{},async(name,args)=>{const response=await fetch(`${base}/api/mcp/tool`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,arguments:args})});return {content:[{type:'text',text:JSON.stringify(await response.json())}]};});if(fallback.reply&&fallback.action?.executed)pass('fallback used on simulated error');else throw new Error('Keyword fallback did not return an actionable reply');}else throw error;}
}catch(error){fail('brain mock integration',error);}finally{child.kill();await fs.rm(tempDir,{recursive:true,force:true});}
