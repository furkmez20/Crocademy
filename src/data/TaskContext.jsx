import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialSessions, initialSubjects, initialTasks } from './mockData';

const TaskContext = createContext(null);
const normalizeSubjects = subjects => subjects.map(subject => ({...subject,chapters:(subject.chapters||[]).map(chapter=>({...chapter,topics:(chapter.topics||[]).map(({status,...topic})=>topic)}))}));
const initialState=()=>({tasks:initialTasks,subjects:normalizeSubjects(initialSubjects),sessions:initialSessions,timer:{mode:'pomodoro',seconds:1500,totalSeconds:1500,running:false,taskId:'organic',startedAt:null},activeTaskId:'organic',profile:{name:'Alex',level:4,title:'Navigator',streak:5,xp:340,nextLevelXp:500},conversations:[]});

export function TaskProvider({ children }) {
  const [data,setData]=useState(initialState);
  const [loading,setLoading]=useState(true);
  const dataRef=useRef(data);const writes=useRef(Promise.resolve());const revision=useRef(0);
  useEffect(()=>{let alive=true;fetch('/api/state').then(response=>{if(!response.ok)throw new Error(`State API ${response.status}`);return response.json();}).then(remote=>{if(alive&&revision.current===0){const next={...initialState(),...remote,subjects:normalizeSubjects(remote.subjects||[])};dataRef.current=next;setData(next);}}).catch(error=>console.error('[State] Could not load server state',error)).finally(()=>alive&&setLoading(false));return()=>{alive=false;};},[]);
  const commit=useCallback(updater=>{revision.current++;const previous=dataRef.current;const next=updater(previous);const patch=Object.fromEntries(['tasks','subjects','sessions','timer','activeTaskId','profile','conversations'].filter(key=>next[key]!==previous[key]).map(key=>[key,next[key]]));dataRef.current=next;setData(next);if(Object.keys(patch).length)writes.current=writes.current.catch(()=>{}).then(async()=>{const response=await fetch('/api/state',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(patch)});if(!response.ok)throw new Error(`State save failed (${response.status})`);}).catch(error=>console.error('[State] Could not save shared state',error));return next;},[]);
  const addTask=useCallback(task=>{const next={priority:'medium',status:'todo',subtasks:[],...task,id:task.id||`task-${Date.now()}-${Math.random().toString(36).slice(2,6)}`};commit(current=>({...current,tasks:[...current.tasks,next]}));return next;},[commit]);
  const updateTask=useCallback((id,changes)=>commit(current=>({...current,tasks:current.tasks.map(task=>task.id===id?{...task,...changes}:task)})),[commit]);
  const deleteTask=useCallback(id=>commit(current=>({...current,tasks:current.tasks.filter(task=>task.id!==id)})),[commit]);
  const replaceTasks=useCallback(next=>commit(current=>({...current,tasks:next})),[commit]);
  const completeTask=useCallback(id=>updateTask(id,{status:'done'}),[updateTask]);
  const moveTask=useCallback((id,date,start,duration)=>updateTask(id,{date,start,...(duration?{duration}:{})}),[updateTask]);
  const recordSession=useCallback(session=>{const next={...session,id:session.id||`session-${Date.now()}-${Math.random().toString(36).slice(2,6)}`};commit(current=>({...current,sessions:[...current.sessions,next]}));return next;},[commit]);
  const replaceSessions=useCallback(next=>commit(current=>({...current,sessions:next})),[commit]);
  const addSubject=useCallback(subject=>{const next={category:'STEM',chapters:[],...subject,id:subject.id||`subject-${Date.now()}`};commit(current=>({...current,subjects:[...current.subjects,next]}));return next;},[commit]);
  const updateSubject=useCallback((id,changes)=>commit(current=>({...current,subjects:current.subjects.map(subject=>subject.id===id?{...subject,...changes}:subject)})),[commit]);
  const deleteSubject=useCallback(id=>commit(current=>({...current,subjects:current.subjects.filter(subject=>subject.id!==id)})),[commit]);
  const replaceSubjects=useCallback(next=>commit(current=>({...current,subjects:normalizeSubjects(next)})),[commit]);
  const addTopic=useCallback((subjectId,chapterId,topic)=>commit(current=>({...current,subjects:current.subjects.map(subject=>{
    if(subject.id!==subjectId)return subject;const {status,...topicData}=topic;const nextTopic={confidence:0,...topicData,id:topic.id||`topic-${Date.now()}-${Math.random().toString(36).slice(2,5)}`};
    if(!subject.chapters.length)return {...subject,chapters:[{id:`chapter-${Date.now()}`,name:topic.chapterName||'Chapter 1',topics:[nextTopic]}]};const targetId=chapterId||subject.chapters[0].id;
    return {...subject,chapters:subject.chapters.map(chapter=>chapter.id===targetId?{...chapter,topics:[...chapter.topics,nextTopic]}:chapter)};
  })})),[commit]);
  const updateTopic=useCallback((subjectId,topicId,changes)=>commit(current=>{
    const subjects=current.subjects.map(subject=>subject.id!==subjectId?subject:{...subject,chapters:subject.chapters.map(chapter=>({...chapter,topics:chapter.topics.map(topic=>topic.id===topicId?{...topic,...changes}:topic)}))});
    return {...current,subjects};
  }),[commit]);
  const deleteTopic=useCallback((subjectId,topicId)=>commit(current=>{
    const subjects=current.subjects.map(subject=>subject.id!==subjectId?subject:{...subject,chapters:subject.chapters.map(chapter=>({...chapter,topics:chapter.topics.filter(topic=>topic.id!==topicId)}))});
    return {...current,subjects};
  }),[commit]);
  const setTopicConfidence=useCallback((subjectId,topicId,confidence)=>updateTopic(subjectId,topicId,{confidence:Number(confidence)}),[updateTopic]);
  const updateTimer=useCallback(changes=>commit(current=>({...current,timer:{...current.timer,...changes}})),[commit]);
  const setActiveTaskId=useCallback(id=>commit(current=>({...current,activeTaskId:id,timer:{...current.timer,taskId:id}})),[commit]);
  const addConversation=useCallback(async entry=>{commit(current=>({...current,conversations:[entry,...current.conversations.filter(item=>item.id!==entry.id)]}));await writes.current;return entry;},[commit]);
  const updateConversation=useCallback((id,changes)=>commit(current=>({...current,conversations:current.conversations.map(item=>item.id===id?{...item,...changes}:item)})),[commit]);
  const clearConversations=useCallback(()=>commit(current=>({...current,conversations:[]})),[commit]);
  const resetDemo=useCallback(async()=>{await writes.current.catch(()=>{});const response=await fetch('/api/state/reset',{method:'POST'});if(!response.ok)throw new Error(`State reset failed (${response.status})`);const remote=await response.json();revision.current++;const next={...initialState(),...remote,subjects:normalizeSubjects(remote.subjects||[])};dataRef.current=next;setData(next);return next;},[]);
  const refresh=useCallback(async()=>{await writes.current.catch(()=>{});const response=await fetch('/api/state');if(!response.ok)throw new Error(`State API ${response.status}`);const remote=await response.json();const next={...initialState(),...remote,subjects:normalizeSubjects(remote.subjects||[])};dataRef.current=next;setData(next);return next;},[]);
  const value=useMemo(()=>({...data,loading,refresh,resetDemo,addConversation,updateConversation,clearConversations,updateTimer,setActiveTaskId,addTask,updateTask,deleteTask,replaceTasks,completeTask,moveTask,recordSession,replaceSessions,addSubject,updateSubject,deleteSubject,replaceSubjects,addTopic,updateTopic,deleteTopic,setTopicConfidence}),[data,loading,refresh,resetDemo,addConversation,updateConversation,clearConversations,updateTimer,setActiveTaskId,addTask,updateTask,deleteTask,replaceTasks,completeTask,moveTask,recordSession,replaceSessions,addSubject,updateSubject,deleteSubject,replaceSubjects,addTopic,updateTopic,deleteTopic,setTopicConfidence]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(){const value=useContext(TaskContext);if(!value)throw new Error('useTasks must be used inside TaskProvider');return value;}
