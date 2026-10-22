import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialTasks } from './mockData';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks);
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
  const value = useMemo(() => ({ tasks, activeTaskId, setActiveTaskId, addTask, updateTask, deleteTask, replaceTasks, completeTask, moveTask }), [tasks, activeTaskId, addTask, updateTask, deleteTask, replaceTasks, completeTask, moveTask]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const value = useContext(TaskContext);
  if (!value) throw new Error('useTasks must be used inside TaskProvider');
  return value;
}
