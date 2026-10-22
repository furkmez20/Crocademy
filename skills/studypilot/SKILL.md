---
name: studypilot
description: Work with StudyPilot's shared study plan, focus timer, subject confidence, and progress through its MCP tools.
---

# StudyPilot

StudyPilot helps a student organize study tasks, schedule sessions, focus with a persistent timer, and track subject and topic confidence. Its local MCP server uses the same persisted state as the web app. Use the tools when an agent needs to read or change StudyPilot data so the web app stays in sync.

## Tools

- `get_schedule`: Read the whole plan or a day. Use before recommending, completing, or moving a task; task IDs must come from this result.
- `add_task`: Add one concrete study block. Include a specific subject, due date, start time, duration, and topic when known.
- `complete_task`: Mark a task complete by its exact ID from `get_schedule`.
- `reschedule_task`: Move a known task ID to a new 24-hour time and, when needed, a new date. Do not overwrite unrelated tasks.
- `create_study_plan`: Create consecutive daily study blocks for a subject. Use only when the student asks for a multi-day plan.
- `start_focus_session`: Start the shared focus timer for a requested duration and optionally select a task by ID or title.
- `set_topic_confidence`: Update an existing topic's 0–5 confidence rating. Use exact subject and topic names. A rating of 0 means not started; the app derives the topic status and subject mastery.
- `get_progress`: Read completed task, session, study-minute, and subject mastery summaries before making progress claims.

Additional tools support timer controls (`update_focus_timer`) and subject/topic creation (`add_subject`, `add_topic`). Use these only when the requested operation matches their descriptions.

Ask a concise follow-up instead of guessing when a task, subject, date, or time is ambiguous. Do not claim a change succeeded until its tool call returns successfully. Destructive deletion is not exposed through MCP.
