import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AudioLines, CalendarPlus, Check, CircleHelp, History, Keyboard, RotateCcw, Send, Sparkles, StopCircle, Waves, X } from 'lucide-react';
import { Card, PTTButton } from './components';
import { focusTasks, user } from './data/mockData';
import crocMascot from './assets/croc-mascot.png';
import { crocBrain } from './lib/crocBrain';
import { useTasks } from './data/TaskContext';

const commands=['Plan a 3-day sprint for my Organic Chemistry midterm','What’s on my plan today?','Start a 25 minute sprint','Add 5 minutes','How did I do this week?'];
const labels={idle:'Ready when you are',listening:'Croc is listening carefully...',thinking:'Checking your schedule...',speaking:'Croc is speaking...',clarification:'Clarification needed',error:'Didn’t catch that'};

export function usePilotVoice(timer){
  const taskStore=useTasks();
  const [status,setStatus]=useState('idle');
  const [transcript,setTranscript]=useState('');
  const [reply,setReply]=useState(`Hi ${user.name}! Ask me about your study plan or start a focus sprint.`);
  const [history,setHistory]=useState([]);
  const [activeId,setActiveId]=useState(null);
  const [mode,setMode]=useState('voice');
  const [input,setInput]=useState('');
  const [showCommands,setShowCommands]=useState(false);
  const [tab,setTab]=useState('chat');
  const [clarification,setClarification]=useState('');
  const recognitionRef=useRef(null);
  const statusRef=useRef(status);statusRef.current=status;
  const processRef=useRef(null);

  const speak=message=>{
    if(!message)return;
    if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){setStatus('speaking');window.setTimeout(()=>setStatus(current=>current==='speaking'?'idle':current),Math.max(2400,message.length*38));return;}
    window.speechSynthesis.cancel();
    const utterance=new window.SpeechSynthesisUtterance(message);utterance.rate=0.96;utterance.pitch=1.04;
    utterance.onend=()=>setStatus(current=>current==='speaking'?'idle':current);
    utterance.onerror=()=>setStatus(current=>current==='speaking'?'idle':current);
    setStatus('speaking');window.speechSynthesis.speak(utterance);
  };

  const processText=text=>{
    const clean=String(text||'').trim();if(!clean)return;
    recognitionRef.current?.stop();window.speechSynthesis?.cancel();setTranscript(clean);setStatus('thinking');setReply('Checking your schedule...');setClarification('');
    window.setTimeout(()=>{
      const result=crocBrain(clean);const id=`conversation-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      if(result.card?.type==='today')result.card.items=taskStore.tasks.filter(task=>task.date==='2026-10-21').map(task=>({title:task.title,subtitle:`${task.subject} · ${task.start} · ${task.duration} min${task.status==='done'?' · Done':''}`}));
      const snapshot=timer.snapshot();
      const taskSnapshot=taskStore.tasks;
      if(result.action?.type==='start_timer')timer.startPomodoro();
      else if(result.action?.type==='add_time')timer.addFive();
      else if(result.action?.type==='pause_timer')timer.pause();
      else if(result.action?.type==='distraction')timer.command('I got distracted');
      else if(result.action?.type==='add_task')taskStore.addTask(result.action.task);
      else if(result.action?.type==='complete_task'){const target=taskStore.tasks.find(task=>task.id===result.action.taskId)||taskStore.tasks.find(task=>task.subject===result.action.subject&&task.status!=='done');if(target)taskStore.completeTask(target.id);}
      else if(result.action?.type==='reschedule_task'){const target=taskStore.tasks.find(task=>task.id===result.action.taskId)||taskStore.tasks.find(task=>task.subject==='History'&&task.status!=='done');if(target)taskStore.moveTask(target.id,result.action.date,result.action.start);}
      else if(result.action?.type==='create_plan')result.action.tasks.forEach(task=>taskStore.addTask({...task,id:undefined}));
      const entry={id,prompt:clean,reply:result.reply,card:result.card,action:result.action,snapshot,taskSnapshot,calendarAdded:false,undone:false,createdAt:new Date()};
      setHistory(items=>[entry,...items]);setActiveId(id);setReply(result.reply);
      if(!result.card){setClarification(result.reply);setStatus('clarification');return;}
      speak(result.reply);
    },650);
  };
  processRef.current=processText;

  const toggleListening=()=>{
    if(statusRef.current==='speaking'){window.speechSynthesis?.cancel();setStatus('idle');}
    if(statusRef.current==='listening'){recognitionRef.current?.stop();setStatus('idle');return;}
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Recognition){setStatus('error');setMode('text');setReply('Speech recognition is not supported in this browser. Type your request below instead.');return;}
    try{
      const recognition=new Recognition();recognitionRef.current=recognition;recognition.lang='en-US';recognition.interimResults=true;recognition.continuous=false;
      recognition.onstart=()=>{setStatus('listening');setTranscript('');setReply('Listening... speak freely, pilot.');};
      recognition.onresult=event=>{const current=Array.from(event.results).map(result=>result[0].transcript).join('');setTranscript(current);if(event.results[event.results.length-1].isFinal)processRef.current(current);};
      recognition.onerror=event=>{setStatus('error');setMode('text');setReply(event.error==='not-allowed'||event.error==='service-not-allowed'?'Microphone access was denied. Type your request instead.':'Didn’t catch that. Try again or type your request.');};
      recognition.onend=()=>setStatus(current=>current==='listening'?'idle':current);
      recognition.start();
    }catch{setStatus('error');setMode('text');setReply('Croc could not start the microphone. Type your request instead.');}
  };

  const stopSpeaking=()=>{window.speechSynthesis?.cancel();setStatus('idle');};
  const submit=event=>{event?.preventDefault?.();if(input.trim()){processText(input);setInput('');}};
  const chooseClarification=value=>{setClarification('');processText(value==='Organic Chem'?'Plan a 3-day sprint for my Organic Chemistry midterm':`What is on my plan today? Focus on ${value}`);};
  const addToCalendar=id=>setHistory(items=>items.map(item=>item.id===id?{...item,calendarAdded:true}:item));
  const undo=id=>{
    const entry=history.find(item=>item.id===id);if(!entry)return;
    if(entry.calendarAdded){setHistory(items=>items.map(item=>item.id===id?{...item,calendarAdded:false}:item));setReply('Removed that sprint from your calendar.');return;}
    if(entry.action?.type==='add_time')timer.removeFive();
    else if(entry.action?.type==='start_timer'||entry.action?.type==='pause_timer')timer.restore(entry.snapshot);
    if(entry.action?.type==='distraction')timer.undoDistraction();
    if(['add_task','complete_task','reschedule_task','create_plan'].includes(entry.action?.type))taskStore.replaceTasks(entry.taskSnapshot);
    setHistory(items=>items.map(item=>item.id===id?{...item,undone:true}:item));setReply(`Undid: ${entry.action?.label||'that action'}.`);
  };

  useEffect(()=>{
    const handle=event=>{const el=event.target;const focusedInput=el instanceof HTMLElement&&(el.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(el.tagName));if(event.code==='Space'&&!focusedInput){event.preventDefault();toggleListening();}};
    window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);
  },[]);
  useEffect(()=>()=>{recognitionRef.current?.stop();window.speechSynthesis?.cancel();},[]);

  return {status,transcript,reply,history,activeId,activeEntry:history.find(item=>item.id===activeId),mode,input,setInput,showCommands,setShowCommands,tab,setTab,clarification,setClarification,toggleListening,stopSpeaking,submit,processText,chooseClarification,addToCalendar,undo};
}

function VoiceStage({voice}){
  const visual=voice.status;const listening=visual==='listening';const speaking=visual==='speaking';const thinking=visual==='thinking';const error=visual==='error';const clarify=visual==='clarification';
  return <section className="flex flex-col items-center px-2 pb-2 pt-3 text-center"><div className={`relative flex h-52 w-52 items-center justify-center rounded-full sm:h-60 sm:w-60 ${listening?'voice-ring-listening':thinking?'voice-ring-thinking':speaking?'voice-ring-speaking':error?'voice-ring-error':clarify?'voice-ring-clarification':'voice-ring-idle'}`}><div className={`absolute inset-0 rounded-full ${listening?'animate-ping bg-primary-container/20':thinking||clarify?'animate-pulse bg-tertiary-fixed/50':speaking?'animate-pulse bg-primary-fixed/50':error?'bg-error-container/50':'bg-primary-fixed/20'}`}/><div className="absolute inset-4 rounded-full border border-primary-fixed/70"/><div className="relative z-10 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-surface-container-lowest p-1 shadow-[0_12px_32px_-4px_rgba(34,197,94,0.2)] sm:h-44 sm:w-44"><img src={crocMascot} alt="Croc, your StudyPilot voice copilot" className="h-full w-full rounded-full object-cover [mask-image:radial-gradient(ellipse,black_48%,transparent_78%)]"/><div className="absolute bottom-2 flex h-8 items-center gap-1 rounded-full bg-inverse-surface/90 px-2.5 backdrop-blur">{[3,5,2,4].map((n,i)=><span key={i} className={`w-1 rounded-full ${listening||speaking?'animate-bounce':'opacity-70'} bg-primary-container`} style={{height:n*3,animationDelay:`${i*90}ms`}}/>)}</div></div></div><div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${error?'bg-error-container text-on-error-container':thinking||clarify?'bg-tertiary-fixed text-on-tertiary-fixed':'bg-surface-container-high text-primary'}`}><span className={`h-2 w-2 rounded-full ${listening?'animate-ping bg-primary':thinking||clarify?'animate-pulse bg-tertiary':speaking?'animate-pulse bg-primary-container':error?'bg-error':'bg-primary'}`}/>{thinking?'Checking your schedule...':labels[visual]}</div></section>;
}

function TranscriptBubble({voice}){return <Card className="w-full p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-2 text-on-surface-variant"><span className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider"><span className={`h-2 w-2 rounded-full ${voice.status==='listening'?'animate-ping bg-primary':'bg-primary'}`}/>{voice.status==='listening'?'Listening live':'You said'}</span><span className="shrink-0 text-xs">{voice.transcript?'Just now':'Ready'}</span></div><p aria-live="polite" className={`break-words text-sm leading-6 ${voice.transcript?'text-on-surface':'text-on-surface-variant'}`}>{voice.transcript?`“${voice.transcript}”`:voice.status==='listening'?'Speak now...':'Your words will appear here when you speak.'}</p></Card>}

function ReplyBubble({voice}){return <div className="w-full rounded-2xl bg-surface-container-low p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-primary"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white"><Sparkles size={17}/></span><span className="font-label-md text-label-md">Croc</span></div>{voice.status==='speaking'&&<button onClick={voice.stopSpeaking} className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-semibold"><StopCircle size={15} className="text-error"/>Stop</button>}</div><p aria-live="polite" className="break-words text-sm leading-6 text-on-surface">{voice.reply}</p></div>}

function ResultCard({entry,voice}){if(!entry?.card)return null;if(entry.undone)return <Card className="w-full p-4 text-sm text-on-surface-variant">Undone: {entry.action?.label||'the previous action'}.</Card>;const card=entry.card;return <Card className="w-full space-y-4 p-4 shadow-md sm:p-5"><div className="flex min-w-0 items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"><AudioLines size={18}/></span><div className="min-w-0"><h2 className="break-words font-headline-sm text-headline-sm">{card.title}</h2>{card.subtitle&&<p className="mt-1 break-words text-xs leading-5 text-on-surface-variant">{card.subtitle}</p>}</div></div><span className="shrink-0 rounded-full bg-tertiary-fixed px-2.5 py-1 text-[10px] font-bold text-on-tertiary-fixed">Study plan</span></div>
    {card.type==='sprint'&&<div className="space-y-2">{card.days.map((item,index)=><div key={item.day} className="flex min-w-0 items-start gap-3 rounded-xl bg-surface-container p-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index+1}</span><div className="min-w-0 flex-1"><p className="break-words font-label-md text-label-md">{item.day}: {item.title}</p></div><span className="shrink-0 pt-0.5 text-sm font-bold text-primary">{item.minutes} min</span></div>)}</div>}
    {card.type==='today'&&<div className="space-y-2">{card.items.map((item,index)=><div key={item.title} className="flex min-w-0 items-start gap-3 rounded-xl bg-surface-container p-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index+1}</span><div className="min-w-0"><p className="break-words font-label-md text-label-md">{item.title}</p><p className="mt-1 text-xs text-on-surface-variant">{item.subtitle}</p></div></div>)}</div>}
    {card.type==='weekly'&&<div className="grid gap-2 sm:grid-cols-3">{card.stats.map(item=><div key={item.label} className="min-w-0 rounded-xl bg-surface-container p-3"><p className="text-xs text-on-surface-variant">{item.label}</p><p className="mt-1 break-words font-label-md text-label-md text-on-surface">{item.value}</p></div>)}</div>}
    {card.type==='timer'&&<div className="rounded-xl bg-surface-container p-3"><p className="break-words font-label-md text-label-md">{card.subtitle}</p><p className="mt-1 text-sm font-bold text-primary">{card.minutes?`${card.minutes} minutes`:'Timer updated'}</p></div>}
    {card.type==='task'&&<div className="rounded-xl bg-surface-container p-3"><p className="break-words font-label-md text-label-md">{card.subtitle}</p><p className="mt-1 text-xs text-on-surface-variant">This change is synced to your Home, Focus and Planner screens.</p></div>}
    {card.type==='note'&&<p className="rounded-xl bg-surface-container p-3 text-sm leading-6 text-on-surface-variant">{card.subtitle}</p>}
    <div className="flex flex-col gap-2 border-t border-surface-container pt-3 sm:flex-row">{card.type==='sprint'?<button onClick={()=>voice.addToCalendar(entry.id)} disabled={entry.calendarAdded} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-label-md text-label-md text-white shadow-[0_3px_0_#005321] disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:shadow-none">{entry.calendarAdded?<Check size={18}/>:<CalendarPlus size={18}/>}<span>{entry.calendarAdded?'Added to My Calendar':'Add to My Calendar'}</span></button>:<span className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-on-surface-variant">Action complete</span>}<button onClick={()=>voice.undo(entry.id)} className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface-container-high px-4 py-2.5 font-label-md text-label-md text-on-surface"><RotateCcw size={16}/>Undo</button></div>
  </Card>}

function MessageCard({entry,voice}){return <article className="space-y-3 border-b border-surface-container pb-5 last:border-0"><Card className="bg-surface-container-lowest p-4"><p className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-primary">You said</p><p className="break-words text-sm leading-6">{entry.prompt}</p><p className="mb-1 mt-4 font-label-sm text-label-sm uppercase tracking-wider text-primary">Croc replied</p><p className="break-words text-sm leading-6 text-on-surface-variant">{entry.reply}</p></Card><ResultCard entry={entry} voice={voice}/></article>}

export default function VoicePilot({voice}){
  const navigate=useNavigate();const current=voice.activeEntry;
  const activeVoiceMode=voice.mode==='text';
  const cardCommand=(command)=>{voice.processText(command);voice.setShowCommands(false);};
  return <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-safe pt-safe sm:px-6 min-[768px]:min-h-screen min-[768px]:py-8 min-[768px]:pb-8">
    <header className="sticky top-0 z-20 -mx-4 mb-3 flex items-center justify-between gap-3 bg-surface/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:mb-5 sm:bg-transparent sm:px-0 sm:py-0"><div className="flex min-w-0 items-center gap-3"><button onClick={()=>navigate('/')} aria-label="Back to Cockpit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface min-[768px]:hidden"><ArrowLeft size={20}/></button><div className="min-w-0"><p className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Voice-first study assistant</p><h1 className="truncate font-headline-lg text-headline-lg">Croc Co-Pilot</h1><p className="truncate text-[10px] font-semibold text-on-surface-variant">{user.name} • Level {user.level} • {user.streak}-day streak</p></div></div><div className="flex shrink-0 rounded-full bg-surface-container-low p-1"><button onClick={()=>voice.setTab('chat')} className={`rounded-full px-3 py-1.5 text-xs font-bold ${voice.tab==='chat'?'bg-primary text-white':'text-on-surface-variant'}`}>Chat</button><button onClick={()=>voice.setTab('history')} className={`rounded-full px-3 py-1.5 text-xs font-bold ${voice.tab==='history'?'bg-primary text-white':'text-on-surface-variant'}`}>Conversations</button></div></header>
    {voice.tab==='history'?<section className="min-h-0 flex-1"><div className="mb-4 flex items-center gap-2"><History size={20} className="text-primary"/><h2 className="font-headline-sm text-headline-sm">Conversations</h2><span className="ml-auto text-xs text-on-surface-variant">{voice.history.length} saved</span></div><div className="max-h-[calc(100dvh-180px)] space-y-5 overflow-y-auto pr-1">{voice.history.length?voice.history.map(entry=><MessageCard key={entry.id} entry={entry} voice={voice}/>):<Card className="p-6 text-center"><p className="font-label-md text-label-md">No conversations yet</p><p className="mt-1 text-sm text-on-surface-variant">Your voice chats and result cards will be saved here.</p></Card>}</div></section>:<>
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center"><VoiceStage voice={voice}/><div className="mt-6 w-full space-y-3"><TranscriptBubble voice={voice}/><ReplyBubble voice={voice}/>
        {voice.status==='clarification'&&<div className="flex w-full flex-wrap gap-2">{['Calculus','Organic Chem','History'].map(item=><button key={item} onClick={()=>voice.chooseClarification(item)} className="rounded-full bg-surface-container px-4 py-2 text-sm font-bold text-on-surface">{item}</button>)}</div>}
        {voice.status==='error'&&<div className="w-full rounded-2xl bg-error-container p-4 text-on-error-container"><p className="font-label-md text-label-md">Didn’t catch that</p><p className="mt-1 text-sm">{voice.reply}</p><button onClick={()=>voice.setMode('text')} className="mt-3 rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface">Type instead</button></div>}
        {voice.status==='idle'&&!current&&<div className="flex w-full flex-wrap justify-center gap-2">{commands.slice(0,3).map(command=><button key={command} onClick={()=>cardCommand(command)} className="max-w-full rounded-full bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface">{command}</button>)}</div>}
        {current&&<div className="mt-6 w-full"><div className="mb-3 flex items-center gap-2 px-1"><Waves size={18} className="text-primary"/><h2 className="font-headline-sm text-headline-sm">Your result</h2></div><ResultCard entry={current} voice={voice}/></div>}
        {!current&&voice.status!=='idle'&&voice.status!=='clarification'&&voice.status!=='error'&&<Card className="p-4 text-center"><p className="text-sm text-on-surface-variant">Your study answer and action card will appear here.</p></Card>}
        <button onClick={()=>voice.setShowCommands(true)} className="flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface"><CircleHelp size={17}/>What can I say?</button>
      </div></section>
      <footer className="sticky bottom-0 z-20 -mx-4 mt-5 border-t border-surface-container bg-surface/95 px-4 pb-3 pt-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5 sm:pb-4"><div className="mx-auto flex max-w-2xl items-center justify-center gap-6"><button onClick={()=>voice.setMode(activeVoiceMode?'voice':'text')} aria-label="Toggle voice or text input" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${activeVoiceMode?'bg-primary text-white':'bg-surface-container-high text-on-surface'} shadow-sm`}><Keyboard size={21}/></button><PTTButton compact large listening={voice.status==='listening'} onClick={voice.toggleListening} className={voice.status==='listening'?'animate-pulse':''}/><button onClick={()=>voice.setShowCommands(true)} aria-label="Show example voice commands" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface shadow-sm"><CircleHelp size={21}/></button></div>
        {activeVoiceMode&&<form onSubmit={voice.submit} className="mx-auto mt-3 flex max-w-2xl gap-2"><input value={voice.input} onChange={event=>voice.setInput(event.target.value)} autoFocus placeholder="Type a request for Croc..." className="min-w-0 flex-1 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed"/><button type="submit" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white"><Send size={19}/></button></form>}
      </footer>
    </>}
    {voice.showCommands&&<div className="fixed inset-0 z-[70] flex items-end justify-center bg-on-background/40 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="voice-command-title"><button aria-label="Close examples" className="absolute inset-0" onClick={()=>voice.setShowCommands(false)}/><section className="relative z-10 w-full max-w-lg rounded-3xl bg-surface p-5 shadow-2xl sm:p-6"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Voice command guide</p><h2 id="voice-command-title" className="font-headline-lg text-headline-lg">What can I say?</h2></div><button onClick={()=>voice.setShowCommands(false)} className="rounded-full p-2 hover:bg-surface-container-low"><X size={20}/></button></div><div className="space-y-2">{commands.map(command=><button key={command} onClick={()=>cardCommand(command)} className="w-full rounded-xl bg-surface-container-low p-3 text-left text-sm font-semibold text-on-surface hover:bg-surface-container">“{command}”</button>)}<button onClick={()=>cardCommand('I got distracted')} className="w-full rounded-xl bg-surface-container-low p-3 text-left text-sm font-semibold text-on-surface">“I got distracted”</button></div></section></div>}
  </main>;
}
