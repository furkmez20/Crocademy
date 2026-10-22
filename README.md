# StudyPilot

StudyPilot is a responsive study planner with Croc, a voice-first study co-pilot. The React app uses a self-hosted Express server for persistent shared state, Amazon Bedrock replies, and StudyPilot MCP tools.

## Requirements

- Node.js 20 or newer
- npm
- Optional Amazon Bedrock access; the keyword brain works without AWS credentials

## Run the app and MCP server

Copy `.env.example` to `.env` in the repository root. Set `BRAIN_PROVIDER=bedrock` to use Bedrock or leave it as `keyword`. Configure `AWS_REGION` and `BEDROCK_MODEL_ID`; AWS credentials come from the standard AWS credential chain (environment, shared credentials/config, SSO, or an attached role). The server never sends credentials to the browser.

Install once and start both services at the repository root:

```bash
npm install
npm run dev
```

Vite prints the frontend URL (normally `http://127.0.0.1:5173`). Express listens on `http://127.0.0.1:8787`, and Vite proxies `/api` requests to it. The MCP Streamable HTTP endpoint is `http://127.0.0.1:8787/mcp`.

Build the frontend with `npm run build`.

## Shared state and persistence

Tasks, subjects, topic confidence ratings, study sessions, the selected task, focus timer state, profile XP/streak, and Croc conversation history live in server state. The browser waits for `GET /api/state` before showing the app and saves changes through `PATCH /api/state`. Conversations store the user message, Croc reply, result card, action, and timestamp. Refreshing the page or restarting the server keeps saved data.

The server persists runtime state to `server/data/state.json`; this generated file is ignored by Git. The tracked `server/data/state.seed.json` contains the original demo data and is used for first startup and reset. In Settings, choose **Reset demo data** to restore it. In Croc Co-Pilot's Conversations tab, **Clear history** removes saved conversation turns after confirmation. MCP tools and REST endpoints use the same state and persistence file.

## MCP tools

The server uses the official `@modelcontextprotocol/sdk` with Streamable HTTP. Available tools include `add_task`, `complete_task`, `reschedule_task`, `create_study_plan`, `start_focus_session`, `get_schedule`, `get_progress`, and `set_topic_confidence`. Croc action handling calls the MCP endpoint through the MCP client SDK at loopback instead of directly mutating task state. Additional tools support timer controls and subject/topic creation.

Run the MCP smoke check from the repository root:

```bash
npm run smoke:mcp
```

It launches an isolated server with a temporary state file, performs the MCP initialize handshake and `tools/list`, calls `add_task`, confirms it appears in `get_schedule`, saves a conversation through REST, restarts the server, and confirms the task and conversation were recovered from disk. It also checks Origin rejection, then removes its temporary state.

Agents can read [`skills/studypilot/SKILL.md`](skills/studypilot/SKILL.md) for the app description and guidance on choosing tools. MCP Origin validation accepts the exact Vite development origins on ports 5173 and 5174, the request's same origin, and exact origins listed in comma-separated `MCP_ALLOWED_ORIGINS` for other deployments.

## Croc voice assistant

The browser uses the Web Speech API for speech recognition and speech synthesis. `app/src/lib/crocBrain.js` calls `POST /api/croc` with the message, recent turns, and app snapshot. `server/bedrock.js` discovers tools from MCP `tools/list` over loopback Streamable HTTP, then runs the Bedrock Converse tool loop (up to four rounds), returning the final spoken reply plus action/card data. A failed Bedrock request logs its full server error and uses the keyword brain for that turn. The provider performs a startup Converse check and continues with fallback if AWS access is not ready. `BRAIN_PROVIDER=bedrock-mock` uses a scripted Converse client for local verification.

## Security

Keep AWS credentials in the standard AWS credential chain on the server. `.gitignore` excludes `.env` while allowing `.env.example`. Never place credentials in frontend code or a `VITE_` variable. The browser calls same-origin `/api` routes and never receives credentials.

## Amazon Bedrock setup

The server calls Amazon Bedrock Runtime's Converse API through `@aws-sdk/client-bedrock-runtime`. `server/bedrock.js` obtains the available tool definitions dynamically from the local MCP server, executes model-requested tools through its loopback Streamable HTTP endpoint, and feeds tool results back to Converse. The loop is limited to four iterations and each request has a 15-second timeout. The final response includes the spoken text and frontend-compatible action/card fields. Tool mutations are marked as already executed so the browser refreshes local state without repeating them.

Set these values in the repository-root `.env`:

```dotenv
BRAIN_PROVIDER=bedrock
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=your-enabled-bedrock-model-id
```

Use a model available in that region and enabled for your account. Provide credentials using an AWS profile/SSO session, environment credentials, or an instance/task role; set `AWS_PROFILE` when using a named profile. The principal needs `bedrock:InvokeModel` on the selected foundation model ARN (Converse is authorized by this action). No AWS access key belongs in client code.

To verify without AWS access, run `npm run test:brain`. The test starts an isolated local MCP/API server, exercises scripted tool use against the real MCP server, checks state and reply, and checks keyword fallback after a simulated Bedrock error. For a live smoke test, set `BRAIN_PROVIDER=bedrock`, configure the region, model, and AWS credential chain, start with `npm run dev`, then submit a request in Croc (for example, “Add a Biology task called Cell Review”). The startup log reports whether a test Converse call succeeded; if AWS verification is still pending, the app continues with keyword fallback.

## Project structure

- `app/` — React, Vite, React Router, Tailwind frontend
- `app/src/data/TaskContext.jsx` — client cache and REST-backed shared state
- `app/src/lib/crocBrain.js` — voice brain API client and keyword fallback
- `server/index.js` — Express REST API, provider selection, startup check, and fallback
- `server/bedrock.js` — Bedrock Converse loop, dynamic MCP tools, and mock client
- `server/keyword.js` — safe keyword fallback brain
- `server/data/state.seed.json` ? tracked demo seed; runtime `state.json` is generated and ignored
- `server/state.js` — shared state and JSON file persistence
- `server/mcp.js` — MCP tools, Streamable HTTP transport, Origin validation, and MCP client helper
- `server/smoke-mcp.js` — isolated MCP smoke script
- `skills/studypilot/SKILL.md` — StudyPilot agent skill

Routes: `/`, `/planner`, `/focus`, `/pilot`, `/subjects`, and `/insights`.
