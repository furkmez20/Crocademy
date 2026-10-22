import { deadlines, focusTasks, telemetry, user, weeklyStats } from '../data/mockData';

export function crocBrain(input) {
  const text = String(input || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const organicExam = deadlines.find(item => item.title === 'Organic Chem Midterm');

  if (/(plan|make|build|create).*(3|three).*day.*(sprint|plan|midterm|organic|chem)|organic.*(midterm|chem).*(3|three).*day/.test(text)) {
    return {
      reply: `Absolutely, ${user.name}. I put together a focused three-day Orgo Recovery Sprint for your Organic Chem midterm, ${organicExam?.badge.toLowerCase()||'in 4 days'}.`,
      card: { type: 'sprint', title: 'Orgo Recovery Sprint', subtitle: `${organicExam?.title||'Organic Chem Midterm'} • ${organicExam?.badge||'In 4 Days'}`, days: [
        { day: 'Day 1', title: 'Electrophilic Addition & Resonance', minutes: 60 },
        { day: 'Day 2', title: 'Carbonyl Chemistry & SN1/SN2 Drills', minutes: 75 },
        { day: 'Day 3', title: 'Timed Mock Exam & Flashcard Blitz', minutes: 45 },
      ] },
      action: { type: 'create_plan', label: 'Created a 3-day sprint' },
    };
  }

  if (/(what|show|whats|what s).*(plan|schedule|today)|plan today|schedule today/.test(text)) {
    return {
      reply: `Here’s your study plan, ${user.name}. You have Calculus practice, an Organic Chem review, and a History source session in your mission queue.`,
      card: { type: 'today', title: 'Today’s Flight Plan', items: focusTasks.map((task, index) => ({ title: task.name, subtitle: ['Practice set', 'Midterm in 4 days', 'Term paper draft'][index] })) },
      action: { type: 'show_plan', label: 'Opened today’s flight plan' },
    };
  }

  if (/(start|begin|launch|do).*(25|twenty five).*(minute|min).*(sprint|focus|session)|25.*minute.*(sprint|focus)/.test(text)) {
    return {
      reply: 'Your 25-minute focus sprint is ready. I started the Pomodoro timer in Focus.',
      card: { type: 'timer', title: '25-Minute Focus Sprint', subtitle: focusTasks[0].name, minutes: 25 },
      action: { type: 'start_timer', minutes: 25, label: 'Started a 25-minute sprint' },
    };
  }

  if (/(add|give|extend|another).*(5|five).*(minute|min)|5 more minutes/.test(text)) {
    return {
      reply: 'Done. I added five minutes to your focus timer.',
      card: { type: 'timer', title: 'Five Minutes Added', subtitle: 'Your focus session has been extended.', minutes: 5 },
      action: { type: 'add_time', minutes: 5, label: 'Added five minutes' },
    };
  }

  if (/(how|what).*(do|did).*(week|this week)|weekly.*(summary|progress)|week.*(progress|summary)/.test(text)) {
    return {
      reply: `You’ve logged ${weeklyStats.airtime} this week and kept your ${user.streak}-day streak going. You’re making progress across Calculus, Organic Chem, and History.`,
      card: { type: 'weekly', title: 'Your Study Progress', stats: [{ label: 'Study airtime this week', value: weeklyStats.airtime }, { label: 'Sessions completed', value: weeklyStats.sessions }, { label: 'Missions completed', value: weeklyStats.missionsCompleted }, { label: 'Flight XP', value: weeklyStats.xp }, { label: 'Today’s airtime', value: telemetry.flightTime }, { label: 'Current streak', value: `${user.streak} days` }] },
      action: { type: 'weekly_summary', label: 'Reviewed your study progress' },
    };
  }

  if (/distract|turbulence|got distracted|blip/.test(text)) {
    return { reply: 'Turbulence logged. Take a breath, then we can get right back to your mission.', card: { type: 'note', title: 'Distraction Logged', subtitle: 'No judgement, pilot. Acknowledge it and return when you’re ready.' }, action: { type: 'distraction', label: 'Logged a distraction' } };
  }

  if (/pause|hold|stop/.test(text)) {
    return { reply: 'I paused your focus timer. Say “resume” when you’re ready to continue.', card: { type: 'timer', title: 'Focus Timer Paused', subtitle: 'Your remaining time is saved.' }, action: { type: 'pause_timer', label: 'Paused your focus timer' } };
  }

  return {
    reply: 'I want to make sure I get that right. Which mission should I help with: Calculus, Organic Chem, or History?',
    card: null,
    action: null,
  };
}
