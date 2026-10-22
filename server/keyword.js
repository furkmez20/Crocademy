import { callMcpTool } from './mcp.js';

export async function keywordBrain(message,state,callTool=callMcpTool){
  const text=String(message||'').toLowerCase();
  if(/\bsn\s*1\b/.test(text)&&/\bsn\s*2\b/.test(text))return {reply:'SN1 happens in two steps: one part leaves, then another joins. SN2 happens in one step: the new part pushes in as the old one leaves, flipping the molecule.',action:null,card:null};
  const add=text.match(/\b(?:add|create|schedule)\s+(?:me\s+)?(?:a\s+)?(.+?)\s+task\b/i)||text.match(/\b(?:add|create|schedule)\s+(?:a\s+)?(?:study\s+)?task(?: called| titled)?\s*(.*)/i);
  if(add){
    const title=add[1].trim().replace(/\s+(?:due|for)\s+(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*$/i,'').replace(/[.!?]+$/,'').replace(/^(?:a|an|the)\s+/i,'')||'Study session';
    const subject=state.subjects?.find(item=>title.toLowerCase().includes(item.name.toLowerCase())||item.name.toLowerCase().includes(title.toLowerCase().split(/\s+/)[0]))?.name||'General Study';
    const dateRequest=text.match(/\b(?:due|for)\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)?.[1]?.toLowerCase();
    let date;
    if(dateRequest){const now=new Date();now.setHours(12,0,0,0);if(dateRequest==='today'||dateRequest==='tomorrow'){if(dateRequest==='tomorrow')now.setDate(now.getDate()+1);}else{const weekdays=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];const delta=(weekdays.indexOf(dateRequest)-now.getDay()+7)%7;now.setDate(now.getDate()+delta);}date=now.toISOString().slice(0,10);}
    const timeRequest=text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
    let time;
    if(timeRequest){let hour=Number(timeRequest[1]),minute=Number(timeRequest[2]||0);const meridiem=timeRequest[3]?.toLowerCase();if(meridiem==='pm'&&hour<12)hour+=12;if(meridiem==='am'&&hour===12)hour=0;if(!meridiem&&hour>0&&hour<8)hour+=12;time=`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;}
    const args={title,subject,duration:45,...(date?{date}:{}),...(time?{time}:{})};
    await callTool('add_task',args);
    return {reply:`I added ${title} to your study plan${dateRequest?` for ${dateRequest}`:''}${time?` at ${time}`:''}.`,action:{type:'add_task',params:{title,subject,minutes:45,due:date},executed:true},card:null};
  }
  if(/\b(hello|hi|hey)\b/.test(text))return {reply:'Hi! What would you like to work on for your studies?',action:null,card:null};
  return {reply:'I can help with your study plan, tasks, or focus timer. What would you like to do?',action:null,card:null};
}
