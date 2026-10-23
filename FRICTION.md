# Amazon Developer Hackathon friction log

Append new entries as problems happen.

### AWS account verification delayed Bedrock access
- **Task attempted:** Call Amazon Bedrock from the Croc brain for the AWS Builder mini-challenge.
- **Steps taken:** I tried to set up Bedrock access for the server-side Croc brain. However, faced a 2 hour verification block given the limited time. I decided to code Bedrock part until system was up. 
- **Expected:** I expected to be able to use Bedrock after setting up access for my account.
- **Actual:** The console said the account was being verified and to email aws-verification@amazon.com if it lasted more than 2 hours. Time waited: TODO.
- **Severity:** I was able to set it up just a little delay. 
- **Workaround:** Built the Bedrock brain behind `BRAIN_PROVIDER` with a mock client and a keyword fallback so development could continue.
- **Suggestion:** Show a clearer verification status and expected wait time, with a direct next step if verification exceeds that estimate.

### Bedrock model access / model ID setup
- **Task attempted:** Choose a model with tool use and get its ID.
- **Steps taken:** I  1. Requested Bedrock access and waited for account verification.
  2. Copied a model ID into .env. The first value (anthropic.claude-3-5-haiku-20241022-v1:0) was a plain model ID that didn't match the model I had access to.
  3. Tested the model directly with the AWS CLI in PowerShell (`aws bedrock-runtime converse --region us-east-1 --model-id us.amazon.nova-2-lite-v1:0`), which returned a normal reply.
  4. Switched .env to BRAIN_PROVIDER=bedrock with the inference profile ID `us.amazon.nova-2-lite-v1:0` in us-east-1.
- **Expected:** Once the model showed as enabled in the console, the server would call it with the same credentials the CLI used.
- **Actual:** The CLI worked, but the app kept answering with the keyword fallback and gave no clear reason. It took extra troubleshooting to find that the provider flag was still set to the fallback and that the model needed the `us.` inference profile ID instead of the plain model ID. 

- **Expected:** I expected to select an enabled model and configure its ID for the server.
- **Actual:** Nova 2 Lite is now configured. However, the system had some troubleshooting to be done as it had hard time figuring out the credentials so I had to try other ways and even verify through powershell link.
- **Severity:** Figured it out just caused a delay.
- **Workaround:** Validated the model and credentials in isolation with the AWS CLI first, then made the app log which brain answered and why Bedrock failed. Added a fallback brain so development could continue while access was pending.
- **Suggestion:** 1. In the Bedrock console, show the exact ID to paste for each model, including the inference profile ID for the user's region, with a copy button.
  2. Make the "model not found" and "on-demand throughput not supported" errors say explicitly that an inference profile ID is required.
  3. Add a short "verify from your machine" snippet (the CLI converse command) to the getting-started page, so people can separate account problems from app problems.

### Building the MCP server (Streamable HTTP)
- **Task attempted:** Expose StudyPilot actions as MCP tools.
- **Steps taken:** : 
. Built the server with the MCP SDK [confirm package: @modelcontextprotocol/sdk], with Origin validation and a smoke script (initialize, tools/list, add_task then get_schedule, persistence check).
  2. Routed the voice brain's actions through the MCP client over loopback HTTP.
  3. When voice commands failed with 502 Bad Gateway, used MCP Inspector to call the tools directly and separate MCP problems from model problems.

- **Expected:** A failed tool call would return a structured MCP error that the client could report cleanly.
- **Actual:** The browser showed repeated 502 Bad Gateway responses from the app's /api/croc endpoint. 
- **Severity:** 
Minor to major (the EPERM/JSON error blocked tool calls until fixed)
- **Workaround:** Used Inspector to test tools in isolation, moved state writes to a retry-and-fallback save, and made tool handlers return proper MCP error results (isError: true) instead of raw strings. Also moved the project out of OneDrive.
- **Suggestion:**  1. In the SDK docs, show a recommended pattern for tool error handling (isError results) with a client example, so tool failures don't surface as JSON parse errors.
  2. Document Inspector's setup for Streamable HTTP servers, including how to pass the Origin header and the session ID, since this is the quickest debugging path.
  3. Add a short troubleshooting section ("tool calls fail but tools/list works") covering file-system and permission errors in tool handlers.

## Other issues (not Amazon tools)

- Gemini free tier allowed only 20 requests per day on `gemini-2.5-flash`.
- Windows EPERM errors occurred when saving state inside a OneDrive folder.
