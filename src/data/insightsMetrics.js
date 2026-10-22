export const TODAY = '2026-10-21';
const DAY_MS = 24 * 60 * 60 * 1000;
const asDate = value => new Date(`${value}T12:00:00`);
const iso = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const shift = (value, amount) => { const date=asDate(value); date.setDate(date.getDate()+amount); return iso(date); };
const shortDay = value => asDate(value).toLocaleDateString('en-US',{weekday:'short'});
const weekLabel = value => { const start=asDate(value); const end=asDate(shift(value,6)); return `${start.toLocaleDateString('en-US',{month:'short',day:'numeric'})}–${end.toLocaleDateString('en-US',{month:'short',day:'numeric'})}`; };

export function formatMinutes(minutes) {
  const hours=Math.floor(minutes/60), rest=minutes%60;
  return hours ? `${hours}h ${String(rest).padStart(2,'0')}m` : `${rest}m`;
}

export function buildInsights({tasks=[],sessions=[],subjects=[],today=TODAY}) {
  const weekDays=Array.from({length:7},(_,index)=>shift(today,index-6));
  const monthDays=Array.from({length:28},(_,index)=>shift(today,index-27));
  const weekSessions=sessions.filter(session=>weekDays.includes(session.date));
  const monthSessions=sessions.filter(session=>monthDays.includes(session.date));
  const weekMinutes=weekSessions.reduce((total,session)=>total+Number(session.minutes||0),0);
  const todayMinutes=sessions.filter(session=>session.date===today).reduce((total,session)=>total+Number(session.minutes||0),0);
  const activeDates=new Set(sessions.map(session=>session.date));
  let streak=0; for(let date=today;activeDates.has(date);date=shift(date,-1)) streak++;
  const activity=weekDays.map(date=>({date,label:shortDay(date),minutes:weekSessions.filter(session=>session.date===date).reduce((total,session)=>total+Number(session.minutes||0),0)}));
  const monthActivity=[];
  for(let index=0;index<4;index++){
    const days=monthDays.slice(index*7,index*7+7);
    const minutes=monthSessions.filter(session=>days.includes(session.date)).reduce((total,session)=>total+Number(session.minutes||0),0);
    monthActivity.push({date:days[0],label:weekLabel(days[0]),minutes});
  }
  const subjectTotals={};
  weekSessions.forEach(session=>{subjectTotals[session.subject]=(subjectTotals[session.subject]||0)+Number(session.minutes||0);});
  const subjectsByTime=Object.entries(subjectTotals).map(([subject,minutes])=>({subject,minutes})).sort((a,b)=>b.minutes-a.minutes);
  const hourMinutes=Array.from({length:13},(_,index)=>({hour:index+7,minutes:0}));
  weekSessions.forEach(session=>{const hour=Number(String(session.start||'09:00').split(':')[0]);if(hour>=7&&hour<=19)hourMinutes[hour-7].minutes+=Number(session.minutes||0);});
  const productive=hourMinutes.filter(item=>item.hour>=9&&item.hour<11).reduce((total,item)=>total+item.minutes,0);
  const bestHours=productive>=Math.max(...hourMinutes.map(item=>item.minutes))?'9 and 11 AM':`${hourMinutes.reduce((best,item)=>item.minutes>best.minutes?item:best,hourMinutes[0]).hour}:00`;
  const start=shift(today,-27);
  const calendar=monthDays.map(date=>({date,minutes:sessions.filter(session=>session.date===date).reduce((total,session)=>total+Number(session.minutes||0),0)}));
  const monday=shift(today,-((asDate(today).getDay()+6)%7));
  const sunday=shift(monday,6);
  const plannedTasks=tasks.filter(task=>task.date>=monday&&task.date<=sunday);
  const completedTasks=plannedTasks.filter(task=>task.status==='done');
  const xp=weekSessions.reduce((total,session)=>total+Number(session.xp||0),0);
  const orgo=subjects.find(subject=>subject.taskSubject==='Organic Chem'||subject.name==='Organic Chemistry');
  const topics=(orgo?.chapters||[]).flatMap(chapter=>chapter.topics||[]);
  const weakest=topics.filter(topic=>Number(topic.confidence)>0).sort((a,b)=>Number(a.confidence)-Number(b.confidence))[0];
  const behind=orgo?{subject:orgo,topic:weakest,mastery:topics.length?Math.round(topics.reduce((sum,topic)=>sum+Number(topic.confidence||0),0)/topics.length*20):0}:null;
  return {today,weekDays,weekMinutes,todayMinutes,sessions:weekSessions.length,xp,streak,activity,monthActivity,subjectsByTime,hourMinutes,bestHours,calendar,start,plannedTasks:plannedTasks.length,completedTasks:completedTasks.length,completion:plannedTasks.length?Math.round(completedTasks.length/plannedTasks.length*100):0,behind,goalMinutes:45};
}
