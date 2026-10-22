import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialSessions, initialSubjects, initialTasks } from './mockData';

const TaskContext = createContext(null);
const normalizeSubjects = subjects => subjects.map(subject => ({...subject,chapters:(subject.chapters||[]).map(chapter=>({...chapter,topics:(chapter.topics||[]).map(({status,...topic})=>topic)}))}));

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [subjects, setSubjects] = useState(() => normalizeSubjects(initialSubjects));
  const [sessions, setSessions] = useState(initialSessions);
  const [activeTaskId, setActiveTaskId] = useState('organic');
  const addTask = useCallback(task => {
    const next = { priority:'medium', status:'todo', subtasks:[], ...task, id:task.id || `task-${Date.now()}-${Math.random().toString(36).slice(2,6)}` };
    setTasks(items => [...items, next]); return next;
  }, []);
  const updateTask = useCallback((id, changes) => setTasks(items => items.map(task => task.id === id ? { ...task, ...changes } : task)), []);
  const deleteTask = useCallback(id => setTasks(items => items.filter(task => task.id !== id)), []);
  const replaceTasks = useCallback(next => setTasks(next), []);
  const completeTask = useCallback(id => updateTask(id, { status:'done' }), [updateTask]);
  const moveTask = useCallback((id, date, start, duration) => updateTask(id, { date, start, ...(duration ? { duration } : {}) }), [updateTask]);
  const recordSession = useCallback(session => {
    const next={...session,id:session.id||`session-${Date.now()}-${Math.random().toString(36).slice(2,6)}`};
    setSessions(items=>[...items,next]); return next;
  },[]);
  const replaceSessions = useCallback(next => setSessions(next),[]);
  const addSubject = useCallback(subject => { const next={category:'STEM',chapters:[],...subject,id:subject.id||`subject-${Date.now()}`};setSubjects(items=>[...items,next]);return next; },[]);
  const updateSubject = useCallback((id, changes) => setSubjects(items=>items.map(subject=>subject.id===id?{...subject,...changes}:subject)),[]);
  const deleteSubject = useCallback(id => setSubjects(items=>items.filter(subject=>subject.id!==id)),[]);
  const replaceSubjects = useCallback(next => setSubjects(normalizeSubjects(next)),[]);
  const addTopic = useCallback((subjectId, chapterId, topic) => setSubjects(items=>items.map(subject=>{
    if(subject.id!==subjectId)return subject;
    const {status,...topicData}=topic;
    const nextTopic={confidence:0,...topicData,id:topic.id||`topic-${Date.now()}-${Math.random().toString(36).slice(2,5)}`};
    if(!subject.chapters.length)return {...subject,chapters:[{id:`chapter-${Date.now()}`,name:topic.chapterName||'Chapter 1',topics:[nextTopic]}]};
    const targetId=chapterId||subject.chapters[0].id;
    return {...subject,chapters:subject.chapters.map(chapter=>chapter.id===targetId?{...chapter,topics:[...chapter.topics,nextTopic]}:chapter)};
  })),[]);
  const updateTopic = useCallback((subjectId, topicId, changes) => setSubjects(items=>items.map(subject=>subject.id!==subjectId?subject:{...subject,chapters:subject.chapters.map(chapter=>({...chapter,topics:chapter.topics.map(topic=>topic.id===topicId?{...topic,...changes}:topic)}))})),[]);
  const deleteTopic = useCallback((subjectId, topicId) => setSubjects(items=>items.map(subject=>subject.id!==subjectId?subject:{...subject,chapters:subject.chapters.map(chapter=>({...chapter,topics:chapter.topics.filter(topic=>topic.id!==topicId)}))})),[]);
  const setTopicConfidence = useCallback((subjectId, topicId, confidence) => updateTopic(subjectId,topicId,{confidence:Number(confidence)}),[updateTopic]);
  const value = useMemo(() => ({ tasks, activeTaskId, setActiveTaskId, addTask, updateTask, deleteTask, replaceTasks, completeTask, moveTask, sessions, recordSession, replaceSessions, subjects, addSubject, updateSubject, deleteSubject, replaceSubjects, addTopic, updateTopic, deleteTopic, setTopicConfidence }), [tasks, activeTaskId, addTask, updateTask, deleteTask, replaceTasks, completeTask, moveTask, sessions, recordSession, replaceSessions, subjects, addSubject, updateSubject, deleteSubject, replaceSubjects, addTopic, updateTopic, deleteTopic, setTopicConfidence]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const value = useContext(TaskContext);
  if (!value) throw new Error('useTasks must be used inside TaskProvider');
  return value;
}
