# Claude Code & Development Guide

## Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

### File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to where you run the gemini command.

#### Examples:

**Single file analysis:**
```bash
gemini -p "@src/main.py Explain this file's purpose and structure"
```

**Multiple files:**
```bash
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"
```

**Entire directory:**
```bash
gemini -p "@src/ Summarize the architecture of this codebase"
```

**Multiple directories:**
```bash
gemini -p "@src/ @tests/ Analyze test coverage for the source code"
```

**Current directory and subdirectories:**
```bash
gemini -p "@./ Give me an overview of this entire project"
```

**Or use --all_files flag:**
```bash
gemini --all_files -p "Analyze the project structure and dependencies"
```

### Implementation Verification Examples

**Check if a feature is implemented:**
```bash
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"
```

**Verify authentication implementation:**
```bash
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"
```

**Check for specific patterns:**
```bash
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"
```

**Verify error handling:**
```bash
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"
```

**Check for rate limiting:**
```bash
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"
```

**Verify caching strategy:**
```bash
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"
```

**Check for specific security measures:**
```bash
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"
```

**Verify test coverage for features:**
```bash
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"
```

### When to Use Gemini CLI

Use `gemini -p` when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

### Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results

---

## Project Information

**Project:** SMS Automations
**Technology Stack:**
- React with Vite
- Tailwind CSS
- JavaScript (JSX files)
- ESLint & Prettier
- Git version control

**Development Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run format` - Auto-format code with Prettier

---

## Supabase Edge Function: `send-campaign`

This project uses a Supabase Edge Function to send campaign SMS messages via Telnyx and track delivery status.

### Function location

- Function name: `send-campaign`
- Files:
  - `supabase/functions/send-campaign/index.ts`
  - `supabase/functions/send-campaign/telnyxSendMessage.ts`
  - `supabase/functions/send-campaign/telnyxFetchStatus.ts`

The React app triggers this function via:

```js
// src/services/campaignMessagingService.js
supabase.functions.invoke('send-campaign', {
  body: { campaignId, customers, message },
})
```

### Required environment variables (Edge Function)

Set these in your Supabase project (Functions → Settings or via Supabase CLI secrets):

- `SUPABASE_URL` – project URL (available automatically in the Edge environment).
- `SERVICE_ROLE_KEY` – service role key (set this via `supabase secrets set`).
- `TELNYX_API_KEY` – your Telnyx API key (you already added this locally).
- `TELNYX_FROM_NUMBER` – optional; defaults to `+18334905225` if not set.

### Deploying the function (Supabase CLI)

From the project root (where `supabase/` exists):

```bash
# 1) Ensure you are logged in and linked to your project
supabase login
supabase link --project-ref <your-project-ref>

# 2) Set function secrets (one-time or when keys change)
supabase secrets set SERVICE_ROLE_KEY="<your-service-role-key>" \
  TELNYX_API_KEY="<your-telnyx-api-key>" \
  TELNYX_FROM_NUMBER="+18334905225"

# 3) Deploy the Edge Function
supabase functions deploy send-campaign
```

After deployment, the frontend call `supabase.functions.invoke('send-campaign', ...)` will hit this function in your Supabase project environment.
