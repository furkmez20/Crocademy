export const user = { name: 'Alex', level: 4, title: 'Navigator', streak: 5, xp: 340, nextLevelXp: 500 };
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
