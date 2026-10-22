import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir=path.join(path.dirname(fileURLToPath(import.meta.url)),'data');
const dataFile=process.env.STUDYPILOT_DATA_FILE||path.join(dataDir,'state.json');
const seedFile=path.join(dataDir,'state.seed.json');
const seedData=JSON.parse(await fs.readFile(seedFile,'utf8'));
const seed=()=>structuredClone(seedData);
let state=seed();
let writeQueue=Promise.resolve();

await fs.mkdir(path.dirname(dataFile),{recursive:true});
try{state={...seed(),...JSON.parse(await fs.readFile(dataFile,'utf8'))};}
catch(error){if(error.code!=='ENOENT')console.error(`[State] Could not read persisted state: ${error.message}`);await persist();}

async function persist(){
  const snapshot=JSON.stringify(state,null,2);
  writeQueue=writeQueue.then(async()=>{const temp=`${dataFile}.tmp`;await fs.writeFile(temp,snapshot,'utf8');await fs.rename(temp,dataFile);});
  await writeQueue;
}

export function getState(){const snapshot=structuredClone(state);if(snapshot.timer?.running&&snapshot.timer.startedAt){const elapsed=Math.floor((Date.now()-new Date(snapshot.timer.startedAt).getTime())/1000);snapshot.timer.seconds=Math.max(0,Number(snapshot.timer.seconds||0)-Math.max(0,elapsed));if(!snapshot.timer.seconds)snapshot.timer.running=false;}return snapshot;}
export async function replaceState(next){
  if(!next||!Array.isArray(next.tasks)||!Array.isArray(next.subjects)||!Array.isArray(next.sessions))throw new Error('State must include tasks, subjects, and sessions arrays.');
  state={...state,...structuredClone(next),timer:{...state.timer,...(next.timer||{})}};
  await persist();
  return getState();
}
export async function resetState(){state=seed();await persist();return getState();}
export async function updateState(updater){
  const next=updater(getState());
  if(!next||typeof next!=='object')throw new Error('State update did not return a state object.');
  state={...state,...next};
  await persist();
  return getState();
}

export async function addTask(task){
  const next={priority:'medium',status:'todo',subtasks:[],...task,id:task.id||`task-${Date.now()}-${Math.random().toString(36).slice(2,7)}`};
  await updateState(current=>({...current,tasks:[...current.tasks,next]}));return next;
}
export async function completeTask(id){
  let found=false;await updateState(current=>({...current,tasks:current.tasks.map(task=>{if(task.id!==id)return task;found=true;return {...task,status:'done'};})}));
  if(!found)throw new Error(`Task not found: ${id}`);return getState().tasks.find(task=>task.id===id);
}
export async function rescheduleTask(id,newTime,date){
  let found=false;await updateState(current=>({...current,tasks:current.tasks.map(task=>{if(task.id!==id)return task;found=true;return {...task,start:newTime,...(date?{date}:{})};})}));
  if(!found)throw new Error(`Task not found: ${id}`);return getState().tasks.find(task=>task.id===id);
}
export async function createStudyPlan(subject,days,hoursPerDay){
  const tasks=[];const current=getState();
  for(let day=0;day<days;day++){
    const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+day);
    tasks.push({title:`${subject} Study Session`,subject,topic:`Day ${day+1} of study plan`,priority:'medium',duration:Math.round(hoursPerDay*60),date:date.toISOString().slice(0,10),start:'10:00',status:'todo',subtasks:[]});
  }
  const added=tasks.map(task=>({...task,id:`task-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}));
  await updateState(value=>({...value,tasks:[...current.tasks,...added]}));return added;
}
export async function startFocusSession(minutes,task){
  const safe=Math.max(1,Math.min(240,Number(minutes)||25));const tasks=getState().tasks;
  const selected=task?tasks.find(item=>item.id===task||item.title.toLowerCase().includes(String(task).toLowerCase())):null;
  const timer={...getState().timer,mode:'pomodoro',seconds:safe*60,totalSeconds:safe*60,running:true,taskId:selected?.id||getState().timer.taskId,startedAt:new Date().toISOString()};
  await updateState(current=>({...current,timer,activeTaskId:timer.taskId}));return timer;
}
export function getSchedule(date){return getState().tasks.filter(task=>!date||task.date===date).sort((a,b)=>`${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));}
export function getProgress(){
  const current=getState();const done=current.tasks.filter(task=>task.status==='done').length;
  return {tasksCompleted:done,totalTasks:current.tasks.length,sessionsCompleted:current.sessions.length,studyMinutes:current.sessions.reduce((sum,session)=>sum+Number(session.minutes||0),0),subjects:current.subjects.map(subject=>{const topics=(subject.chapters||[]).flatMap(chapter=>chapter.topics||[]);return {name:subject.name,mastery:topics.length?Math.round(topics.reduce((sum,topic)=>sum+Number(topic.confidence||0),0)/topics.length*20):0};})};
}
export async function setTopicConfidence(subjectName,topicName,confidence){
  let found=false;const safe=Math.max(0,Math.min(5,Number(confidence)||0));
  await updateState(current=>({...current,subjects:current.subjects.map(subject=>({...subject,chapters:(subject.chapters||[]).map(chapter=>({...chapter,topics:(chapter.topics||[]).map(topic=>{if(subject.name.toLowerCase()===subjectName.toLowerCase()&&topic.name.toLowerCase()===topicName.toLowerCase()){found=true;return {...topic,confidence:safe};}return topic;})}))}))}));
  if(!found)throw new Error(`Topic not found: ${subjectName} / ${topicName}`);return {subject:subjectName,topic:topicName,confidence:safe};
}
export async function addSubject(subject){const next={category:'STEM',chapters:[],...subject,id:subject.id||`subject-${Date.now()}-${Math.random().toString(36).slice(2,6)}`};await updateState(current=>({...current,subjects:[...current.subjects,next]}));return next;}
export async function addTopic(subjectName,topicName,chapterName='Chapter 1'){
  const current=getState();let found=false;const id=`topic-${Date.now()}-${Math.random().toString(36).slice(2,5)}`;
  await updateState(state=>({...state,subjects:state.subjects.map(subject=>{if(subject.name.toLowerCase()!==subjectName.toLowerCase())return subject;found=true;const chapter=subject.chapters?.[0];const nextTopic={id,name:topicName,confidence:0};if(!chapter)return {...subject,chapters:[{id:`chapter-${Date.now()}`,name:chapterName,topics:[nextTopic]}]};return {...subject,chapters:subject.chapters.map((item,index)=>index===0?{...item,topics:[...(item.topics||[]),nextTopic]}:item)};})}));
  if(!found)throw new Error(`Subject not found: ${subjectName}`);return {subject:subjectName,topic:topicName,id};
}
export async function updateFocusTimer(changes){const timer={...getState().timer,...changes};await updateState(current=>({...current,timer,activeTaskId:timer.taskId||current.activeTaskId}));return timer;}
