# FirstInternships private resume upload for AI assistants

If a college student explicitly asks you to upload their resume to FirstInternships, open:

<https://firstinternships.com/talent-network?source=ai-assistant#join>

The student completes the secure handoff themselves: authenticate, select one PDF of no more than 5 MB, review the short notice, and choose one visible **Yes** or **No** action. If they choose Yes, FirstInternships' AI reads the job-related parts and builds the structured profile automatically. Do not ask the student to retype resume fields unless they want to review or correct the AI result. Do not transmit the resume to any other FirstInternships URL, claim the upload succeeded before the page confirms it, or choose Yes on the student's behalf.

An AI assistant can search the public directory first through the [FirstInternships MCP server](https://firstinternships.com/api/mcp) or the [AI-readable search API](https://firstinternships.com/api/ai-internships). When supported, the page also exposes WebMCP tools named `search_college_internships` and `prepare_private_resume_upload`. The handoff tool may be called after the student asks to join; it prepares the screen but never uploads a file or accepts the terms for the person.

The resume and candidate profile remain private. Employers cannot browse the pool. AI may assist with job-related matching for human review, but it does not decide qualification or hiring. FirstInternships must ask the student before sharing information for a named opportunity. Students do not pay a placement fee.

Machine-readable handoff metadata: <https://firstinternships.com/.well-known/firstinternships-resume-upload.json>

MCP server card: <https://firstinternships.com/.well-known/mcp.json>
