export const user = { name: 'Alex', level: 4, title: 'Navigator', streak: 5, xp: 340, nextLevelXp: 500 };
export const subjectColors = { Calculus: 'blue', 'Organic Chem': 'green', History: 'violet' };
export const initialTasks = [
  { id:'calc', title:'Calculus Morning Deep Work', subject:'Calculus', topic:'Derivatives Set 4', priority:'medium', duration:90, date:'2026-10-21', start:'09:00', status:'done', subtasks:['Complete derivatives set','Check solutions'] },
  { id:'organic', title:'Reaction Mechanisms Flashcards', subject:'Organic Chem', topic:'SN1 vs SN2 nucleophilic substitutions', priority:'high', duration:45, date:'2026-10-21', start:'14:00', status:'todo', subtasks:['Review SN1 transition states','Compare polar protic vs aprotic solvents','Practice stereochemical inversion','Complete final 10 Anki speed cards'] },
  { id:'history', title:'History Essay Outline & Sources', subject:'History', topic:'European Treaties Archive research', priority:'medium', duration:45, date:'2026-10-21', start:'16:30', status:'todo', subtasks:['Gather primary sources','Draft thesis statement'] },
];
export const plannerDeadlines = [
  { date:'2026-10-22', title:'Organic Chem Midterm', subject:'Organic Chem' },
  { date:'2026-10-23', title:'History Term Paper — Draft', subject:'History' },
];
export const initialSubjects = [
  { id:'advanced-calculus', name:'Advanced Calculus', category:'STEM', taskSubject:'Calculus', colorKey:'Calculus', deadline:'November 3 · Problem Set 6', nextBlock:'Calculus Morning Deep Work', chapters:[{id:'calc-series',name:'Series & Approximation',topics:[{id:'taylor-series',name:'Taylor Series',confidence:3.6},{id:'power-series',name:'Power Series',confidence:3.7}]},{id:'calc-multivariable',name:'Multivariable Calculus',topics:[{id:'partial-derivatives',name:'Partial Derivatives',confidence:3.7},{id:'multiple-integrals',name:'Multiple Integrals',confidence:3.8}]}] },
  { id:'organic-chemistry', name:'Organic Chemistry', category:'STEM', taskSubject:'Organic Chem', colorKey:'Organic Chem', deadline:'Thursday · Organic Chem Midterm · 4 days', nextBlock:'Reaction Mechanisms Flashcards', chapters:[{id:'orgo-foundations',name:'Foundations & Reactivity',topics:[{id:'electrophilic-addition',name:'Electrophilic Addition',confidence:4.0},{id:'resonance',name:'Resonance',confidence:4.0}]},{id:'orgo-reactions',name:'Reaction Mechanisms',topics:[{id:'carbonyl-chemistry',name:'Carbonyl Chemistry',confidence:3.8},{id:'sn1-sn2',name:'SN1/SN2',confidence:4.2}]},{id:'orgo-synthesis',name:'Synthesis',topics:[{id:'synthesis-pathways',name:'Synthesis Pathways',confidence:3.5}]}] },
  { id:'world-history', name:'World History', category:'Humanities', taskSubject:'History', colorKey:'History', deadline:'Friday · Term Paper Draft', nextBlock:'History Essay Outline & Sources', chapters:[{id:'history-paper',name:'Term Paper Research',topics:[{id:'cold-war-diplomacy',name:'Cold War Diplomacy',confidence:3.5},{id:'primary-sources',name:'Primary Source Analysis',confidence:3.5}]}] },
];
export const telemetry = { flightTime: '2h 15m', targetTime: '3h 15m', flightPercent: 69, missions: '1 of 3 cleared', missionPercent: 33, xpToday: '+120 XP today' };
export const mission = { subject: 'Organic Chem', time: '2:00 PM', duration: '45 mins', title: 'Reaction Mechanisms Flashcards', cards: '30 Spaced Repetition Cards', unit: 'Unit 4: Carbonyls', launchIn: '15m' };
export const deadlines = [{ badge: 'In 4 Days', date: 'Thursday, 9:00 AM', title: 'Organic Chem Midterm', details: 'Focus: Nucleophilic Addition • Synthesis Pathways', footer: 'Prep Confidence', status: '78% Ready' }, { badge: 'Friday Draft', date: '5 Days Remaining', title: 'History Term Paper', details: 'Cold War Diplomacy • Primary Sources synthesis', footer: 'Outline & Draft', status: 'Step 2 of 4' }];
export const prompts = ['Start my 2 PM flashcards', 'Plan for Chem in 4 days', 'Flight plan update?'];
export const focusTasks = [
  { id: 'organic', subject: 'Organic Chem', name: 'Organic Chemistry Flashcards: Unit 4 Reaction Mechanisms', shortName: 'Organic Chem Flashcards', detail: 'Targeting SN1 vs SN2 polar protic solvent effects, stereochemical inversion, and carbocation rearrangements.' },
  { id: 'calc', subject: 'Calculus', name: 'Calculus: Integration Techniques Practice Set', shortName: 'Calculus Practice Set', detail: 'Work through substitution, integration by parts, and partial fractions.' },
  { id: 'history', subject: 'History', name: 'History: Cold War Diplomacy Primary Sources', shortName: 'History Source Review', detail: 'Compare primary sources and build an evidence based outline.' },
];
export const focusModes = { pomodoro: { label: 'Pomodoro', minutes: 25 }, short: { label: 'Short Break', minutes: 5 }, long: { label: 'Long Break', minutes: 15 } };
export const focusSounds = [
  { id: 'lofi', name: 'Lo-Fi Beats', caption: 'Warm instrumental', icon: 'radio' },
  { id: 'rain', name: 'Cockpit Rain', caption: 'Soft rainfall', icon: 'cloud-rain' },
  { id: 'cafe', name: 'Campus Cafe', caption: 'Subtle chatter', icon: 'coffee' },
  { id: 'forest', name: 'Quiet Forest', caption: 'Breeze & birds', icon: 'trees' },
];
export const focusStats = { airtime: '2h 15m', distractions: 14, xp: 50, completedCards: 48, totalCards: 60 };
export const weeklyStats = { airtime: '8h 40m', sessions: 12, missionsCompleted: '8 of 10', xp: '+680 XP' };
