import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Mic, BookOpen, Sparkles, Flame, Rocket, UserRound, X, AudioLines, CircleHelp } from 'lucide-react';
import { prompts, user } from './data/mockData';
import crocMascot from './assets/croc-mascot.png';

const navigation = [
  { to: '/', label: 'Cockpit', Icon: LayoutDashboard },
  { to: '/planner', label: 'Planner', Icon: CalendarDays },
  { to: '/subjects', label: 'Subjects', Icon: BookOpen },
  { to: '/insights', label: 'Insights', Icon: Sparkles },
  { to: '/focus', label: 'Focus', Icon: CircleHelp },
];

export function Card({ children, className = '' }) { return <section className={`min-w-0 rounded-2xl bg-surface-container-lowest ${className}`}>{children}</section>; }
export function XPBar({ xp = 340, total = 500 }) { return <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary-container" style={{ width: `${Math.min(100, xp / total * 100)}%` }} /></div>; }

export function Sidebar() {
  const { pathname } = useLocation();
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col border-r border-surface-container bg-surface px-3 py-5 min-[1281px]:w-64 min-[768px]:flex">
    <Link to="/" className="mb-8 flex items-center justify-center gap-3 min-[1281px]:justify-start min-[1281px]:px-2">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-white shadow-[0_2px_0_#15803d]"><Rocket size={23}/></span>
      <span className="hidden min-[1281px]:block"><b className="block font-headline-sm text-headline-sm leading-tight">StudyPilot</b><small className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Voice AI</small></span>
    </Link>
    <nav className="flex flex-1 flex-col gap-2">{navigation.map(({to,label,Icon})=>{
      const active = pathname === to || (to === '/subjects' && pathname === '/focus') || (to === '/insights' && pathname === '/pilot');
      return <Link key={to} to={to} title={label} className={`flex h-12 items-center justify-center gap-3 rounded-xl transition min-[1281px]:justify-start min-[1281px]:px-3 ${active?'bg-primary-fixed/40 text-primary':'text-on-surface-variant hover:bg-surface-container-low'}`}><Icon size={21}/><span className="hidden truncate font-label-md text-label-md min-[1281px]:block">{label}</span></Link>;
    })}</nav>
    <div className="mt-auto flex flex-col items-center gap-3 border-t border-surface-container pt-4 min-[1281px]:items-stretch">
      <div className="flex h-10 items-center justify-center gap-2 rounded-xl bg-surface-container-low text-tertiary min-[1281px]:justify-start min-[1281px]:px-3"><Flame size={19}/><span className="hidden font-label-md text-label-md text-on-surface min-[1281px]:inline">{user.streak} day streak</span></div>
      <div className="flex items-center justify-center gap-3 min-[1281px]:justify-start min-[1281px]:px-2"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white"><UserRound size={18}/></div><div className="hidden min-w-0 min-[1281px]:block"><span className="block truncate font-label-md text-label-md">{user.name}</span><span className="block truncate font-label-sm text-label-sm text-on-surface-variant">Lvl {user.level} {user.title}</span></div></div>
    </div>
  </aside>;
}

export function BottomNav({ onPTT }) {
  const { pathname } = useLocation();
  const items = navigation.slice(0, 2).concat(navigation.slice(2, 4));
  return <nav className="fixed inset-x-0 bottom-0 z-40 bg-surface/90 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.04)] backdrop-blur-xl min-[768px]:hidden"><div className="relative mx-auto flex h-20 items-center justify-around px-2">
    {items.slice(0,2).map(({to,label,Icon})=><Link key={to} to={to} className={`flex h-14 w-14 flex-col items-center justify-center ${pathname===to?'text-primary':'text-on-surface-variant'}`}><Icon size={24}/><span className="mt-1 truncate font-label-sm text-label-sm">{label}</span></Link>)}
    <button onClick={onPTT} aria-label="Open Croc voice assistant" className="relative -mt-8 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_0_#005321,0_8px_20px_rgba(0,110,47,0.3)]"><Mic size={29}/><span className="text-[9px] font-extrabold uppercase tracking-wide">PTT</span></button>
    {items.slice(2).map(({to,label,Icon})=><Link key={to} to={to} className={`flex h-14 w-14 flex-col items-center justify-center ${pathname===to?'text-primary':'text-on-surface-variant'}`}><Icon size={24}/><span className="mt-1 truncate font-label-sm text-label-sm">{label}</span></Link>)}
  </div></nav>;
}

export function PTTButton({ onClick, listening = false, compact = false }) {
  return <button onClick={onClick} aria-pressed={listening} className={`flex items-center justify-center gap-3 rounded-full bg-primary text-white shadow-[0_4px_0_#005321,0_10px_20px_rgba(0,110,47,0.22)] transition hover:bg-on-primary-fixed-variant active:translate-y-[2px] ${compact?'h-12 w-12 shrink-0':'min-h-[82px] w-full px-5 py-4'}`}>
    <span className={`flex items-center justify-center rounded-full bg-white/15 ${compact?'h-10 w-10':'h-12 w-12'}`}><Mic size={compact?22:27}/></span>
    {!compact&&<span className="text-left"><span className="block font-label-lg text-label-lg">{listening?'Listening to Croc…':'Tap and tell Croc what you need'}</span><span className="block font-label-sm text-label-sm text-white/90">Press Space or say “Hey Croc”</span></span>}
  </button>;
}

export function CrocPanel({ open, onClose }) {
  const [listening,setListening] = useState(false);
  const [transcript,setTranscript] = useState('Your conversation with Croc will appear here.');
  const toggle = () => setListening(current => { const next = !current; setTranscript(next ? 'Listening… speak whenever you’re ready. We’re all ears!' : 'Listening paused. Ask me for your next study step whenever you’re ready.'); return next; });
  useEffect(()=>{
    const handle=(e)=>{const el=e.target;const typing=el instanceof HTMLElement&&(el.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(el.tagName));if(e.code==='Space'&&!typing){e.preventDefault();toggle();}};
    window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);
  },[]);
  const panel=<><div className="mb-5 flex items-center justify-between"><div><p className="font-label-sm text-label-sm uppercase tracking-widest text-primary">StudyPilot voice AI</p><h2 className="font-headline-lg text-headline-lg">Croc Copilot</h2></div><button onClick={onClose} aria-label="Close Croc panel" className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low min-[1281px]:hidden"><X size={21}/></button></div>
    <div className="relative mx-auto mb-5 flex aspect-square w-[min(76%,280px)] items-center justify-center rounded-full bg-[radial-gradient(circle,#d5ffdc_0%,#ecfff0_53%,transparent_72%)]"><div className="absolute inset-5 rounded-full border border-primary-fixed/50"/><img src={crocMascot} alt="Croc, your StudyPilot copilot" className="relative z-10 h-[86%] w-[86%] rounded-full object-cover [mask-image:radial-gradient(ellipse,black_44%,transparent_76%)]"/><span className="absolute bottom-[14%] right-[9%] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-md"><Rocket size={19}/></span></div>
    <p className="mb-2 text-center font-headline-md text-headline-md">Hey {user.name}, ready to fly?</p><p className="mb-5 text-center text-sm text-on-surface-variant">Ask Croc for a plan, a focus session, or a quick study answer.</p>
    <PTTButton onClick={toggle} listening={listening}/><p className="mt-2 text-center text-xs font-medium text-on-surface-variant">Hey Croc — or press the space bar</p>
    <div className="mt-6"><h3 className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Try asking</h3><div className="flex flex-wrap gap-2">{prompts.map(p=><button key={p} onClick={()=>setTranscript(`You: “${p}”\nCroc: I’m on it!`)} className="max-w-full truncate rounded-full bg-surface-container-low px-3 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container">{p}</button>)}</div></div>
    <div className="mt-6 min-h-32 rounded-2xl border border-surface-container bg-surface-container-low/60 p-4"><div className="mb-3 flex items-center gap-2 text-on-surface-variant"><AudioLines size={18}/><span className="font-label-sm text-label-sm uppercase tracking-wider">Live transcript</span><span className={`ml-auto h-2 w-2 rounded-full ${listening?'animate-pulse bg-primary-container':'bg-outline-variant'}`}/></div><p className="whitespace-pre-line break-words text-sm leading-6 text-on-surface-variant">{transcript}</p></div></>;
  return <><div onClick={onClose} className={`fixed inset-0 z-40 bg-on-background/35 transition-opacity min-[1281px]:hidden ${open?'visible opacity-100':'invisible opacity-0'}`}/><aside className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col overflow-y-auto bg-surface px-6 py-6 shadow-2xl transition-transform duration-300 min-[768px]:max-[1280px]:w-[400px] min-[1281px]:w-[360px] min-[1281px]:translate-x-0 min-[1281px]:border-l min-[1281px]:border-surface-container ${open?'translate-x-0':'translate-x-full'}`}><div className="my-auto py-3">{panel}</div></aside></>;
}

export function AppShell({ children, openCroc = false, onOpenCroc = () => {}, onCloseCroc = () => {} }) {
  return <div className="min-h-screen bg-surface text-on-surface"><Sidebar/><div className="min-h-screen min-[768px]:ml-20 min-[1281px]:ml-64 min-[1281px]:mr-[360px]">{children}</div><BottomNav onPTT={onOpenCroc}/><CrocPanel open={openCroc} onClose={onCloseCroc}/></div>;
}
