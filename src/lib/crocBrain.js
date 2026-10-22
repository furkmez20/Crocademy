import { deadlines, focusTasks, initialTasks, user } from '../data/mockData';

// Local fallback used when the API is offline, unavailable, or takes too long.
function keywordFallback(input) {
  const text = String(input || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const exam = deadlines.find(item => item.title === 'Organic Chem Midterm');
  if (/(plan|make|build|create).*(3|three).*day.*(sprint|plan|midterm|organic|chem)|organic.*(midterm|chem).*(3|three).*day/.test(text)) {
    const tasks = [
      { id:'orgo-sprint-1', title:'Electrophilic Addition & Resonance', subject:'Organic Chem', topic:'Orgo Recovery Sprint · Day 1', priority:'high', duration:60, date:'2026-10-22', start:'10:00', status:'todo', subtasks:[] },
      { id:'orgo-sprint-2', title:'Carbonyl Chemistry & SN1/SN2 Drills', subject:'Organic Chem', topic:'Orgo Recovery Sprint · Day 2', priority:'high', duration:75, date:'2026-10-23', start:'10:00', status:'todo', subtasks:[] },
      { id:'orgo-sprint-3', title:'Timed Mock Exam & Flashcard Blitz', subject:'Organic Chem', topic:'Orgo Recovery Sprint · Day 3', priority:'high', duration:45, date:'2026-10-24', start:'10:00', status:'todo', subtasks:[] },
    ];
    return { reply:`Absolutely, ${user.name}. I put together a focused three-day Orgo Recovery Sprint for your Organic Chem midterm, ${exam?.badge.toLowerCase()||'in 4 days'}.`, card:{ type:'sprint', title:'Orgo Recovery Sprint', subtitle:`${exam?.title||'Organic Chem Midterm'} · ${exam?.badge||'In 4 Days'}`, days:[{day:'Day 1',title:'Electrophilic Addition & Resonance',minutes:60},{day:'Day 2',title:'Carbonyl Chemistry & SN1/SN2 Drills',minutes:75},{day:'Day 3',title:'Timed Mock Exam & Flashcard Blitz',minutes:45}] }, action:{type:'create_plan',label:'Created a 3-day sprint',tasks} };
  }
  if (/(what|show|whats|what s).*(plan|schedule|today)|plan today|schedule today/.test(text)) return { reply:`Here’s your study plan, ${user.name}. You have Calculus practice, an Organic Chem review, and a History source session in your mission queue.`, card:{type:'today',title:'Today’s Flight Plan',items:initialTasks.map(task=>({title:task.title,subtitle:`${task.subject} · ${task.start} · ${task.duration} min`}))}, action:{type:'show_plan',label:'Opened today’s flight plan'} };
  if (/(start|begin|launch|do).*(25|twenty five).*(minute|min).*(sprint|focus|session)|25.*minute.*(sprint|focus)/.test(text)) return { reply:'Your 25-minute focus sprint is ready. I started the Pomodoro timer in Focus.', card:{type:'timer',title:'25-Minute Focus Sprint',subtitle:focusTasks[0].name,minutes:25}, action:{type:'start_timer',minutes:25,label:'Started a 25-minute sprint'} };
  if (/(add|give|extend|another).*(5|five).*(minute|min)|5 more minutes/.test(text)) return { reply:'Done. I added five minutes to your focus timer.', card:{type:'timer',title:'Five Minutes Added',subtitle:'Your focus session has been extended.',minutes:5}, action:{type:'add_time',minutes:5,label:'Added five minutes'} };
  if (/(add|create|schedule).*(task|mission|study block)/.test(text)) {
    const task={title:'Organic Chem review session',subject:'Organic Chem',topic:'Added by Croc',priority:'medium',duration:45,date:'2026-10-21',start:'18:00',status:'todo',subtasks:[]};
    return {reply:'I added a new Organic Chem review block to today’s plan.',card:{type:'task',title:task.title,subtitle:'Today · 6:00 PM · 45 min'},action:{type:'add_task',label:'Added a study task',task}};
  }
  if (/(complete|finish|mark).*(calcul|organic|history|task|mission)|(?:calcul|organic|history).*(done|complete)/.test(text)) {
    const subject=/history/.test(text)?'History':/calcul/.test(text)?'Calculus':'Organic Chem';
    const target=initialTasks.find(task=>task.subject===subject&&task.status!=='done')||initialTasks.find(task=>task.subject===subject);
    return {reply:`Marked your ${subject} mission complete. Nice work, ${user.name}.`,card:{type:'task',title:'Mission completed',subtitle:target?.title||subject},action:{type:'complete_task',label:`Completed a ${subject} task`,taskId:target?.id,subject}};
  }
  if (/(rearrange|reschedule|move).*(task|mission|block|afternoon)|missed task/.test(text)) {
    const target=initialTasks.find(task=>task.id==='history');
    return {reply:'I moved your History block to an earlier open time today.',card:{type:'task',title:'Study block rescheduled',subtitle:`${target?.title||'History'} · Today · 3:30 PM`},action:{type:'reschedule_task',label:'Rescheduled a study task',taskId:target?.id,date:'2026-10-21',start:'15:30'}};
  }
  if (/(falling behind|behind in|weakest subject|most behind)/.test(text)) return {reply:'I’ll check your recent study time, subject confidence and upcoming work to find the best next focus.',card:{type:'weekly',title:'Subject progress check',stats:[]},action:{type:'show_progress',label:'Reviewed subject progress'}};
  if (/(how|what).*(do|did).*(week|this week)|weekly.*(summary|progress)|week.*(progress|summary)/.test(text)) return { reply:'I’ll pull together your real study time, completed work, streak and subject progress for the week.', card:{type:'weekly',title:'Your Study Progress',stats:[]}, action:{type:'show_progress',label:'Reviewed your study progress'} };
  if (/distract|turbulence|got distracted|blip/.test(text)) return {reply:'Turbulence logged. Take a breath, then we can get right back to your mission.',card:{type:'note',title:'Distraction Logged',subtitle:'No judgement, pilot. Acknowledge it and return when you’re ready.'},action:{type:'distraction',label:'Logged a distraction'}};
  if (/pause|hold|stop/.test(text)) return {reply:'I paused your focus timer. Say “resume” when you’re ready to continue.',card:{type:'timer',title:'Focus Timer Paused',subtitle:'Your remaining time is saved.'},action:{type:'pause_timer',label:'Paused your focus timer'}};
  if (/weak|struggling|not confident/.test(text)&&/carbonyl/.test(text)) return {reply:'I lowered your Carbonyl Chemistry confidence rating so we can give that topic more attention.',card:{type:'subject',title:'Carbonyl Chemistry needs work',subtitle:'Organic Chemistry · Confidence set to 2/5'},action:{type:'set_confidence',label:'Updated Carbonyl Chemistry confidence',subjectId:'organic-chemistry',topicId:'carbonyl-chemistry',topicName:'Carbonyl Chemistry',confidence:2}};
  if (/(add|create).*(subject|biochemistry)|add biochemistry/.test(text)) {
    const count=Number(text.match(/(\d+)\s+chapters?/)?.[1]||4);
    const subject={name:'Biochemistry',category:'STEM',taskSubject:'Biochemistry',colorKey:'Organic Chem',deadline:'No upcoming deadline',nextBlock:'No block planned',chapters:Array.from({length:Math.min(12,Math.max(1,count))},(_,index)=>({id:`biochem-chapter-${index+1}`,name:`Chapter ${index+1}`,topics:[]}))};
    return {reply:`Added Biochemistry with ${subject.chapters.length} chapters to your subject library.`,card:{type:'subject',title:'Biochemistry added',subtitle:`STEM · ${subject.chapters.length} chapters`},action:{type:'add_subject',label:'Added Biochemistry',subject}};
  }
  if (/(add|create).*(topic)/.test(text)) {
    const topicName=text.match(/(?:topic\s+|add\s+)([a-z][a-z0-9 -]+?)(?:\s+to\s+)/)?.[1]?.trim()||'New topic';
    const subjectName=/biochem/.test(text)?'Biochemistry':/history/.test(text)?'World History':/calcul/.test(text)?'Advanced Calculus':'Organic Chemistry';
    return {reply:`I added ${topicName} to ${subjectName}.`,card:{type:'subject',title:'Topic added',subtitle:`${topicName} · ${subjectName}`},action:{type:'add_topic',label:`Added ${topicName}`,subjectName,topicName}};
  }
  return {reply:'I want to make sure I get that right. Which mission should I help with: Calculus, Organic Chem, or History?',card:null,action:null};
}

// The API key stays on the Express server. This client sends only the message,
// recent turns, and the current app snapshot to the same-origin proxy.
export async function crocBrain(input,context={}) {
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),11000);
  let reason='Unknown error';
  try{
    let response;
    try{
      response=await fetch('/api/croc',{method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,body:JSON.stringify({message:String(input||''),history:Array.isArray(context.history)?context.history.slice(-6):[],state:context.state||{}})});
    }catch(error){
      if(error?.name==='AbortError')reason='Request timed out';
      else if(error instanceof TypeError)reason='No server';
      else reason='Network error';
      throw error;
    }
    if(!response.ok){
      const body=await response.json().catch(()=>({}));
      reason=body.reason||({401:'Bad API key',403:'Bad API key',404:'Invalid model',429:'Rate limited',502:'Model unavailable',503:'Server not configured'}[response.status]||`Server error (${response.status})`);
      throw new Error(`${reason}: ${body.error||response.statusText||'request failed'}`);
    }
    const result=await response.json();
    if(typeof result.reply!=='string'||!Object.hasOwn(result,'action')||!Object.hasOwn(result,'card')){reason='Invalid server response';throw new Error('Croc API response did not match the expected shape');}
    return result;
  }catch(error){
    console.error(`[Croc] Falling back: ${reason}`,error);
    const fallback=keywordFallback(input);
    return {...fallback,reply:`I'm offline, trying the basics. ${fallback.reply}`,offline:true,fallbackReason:reason};
  }finally{
    window.clearTimeout(timeout);
  }
}
