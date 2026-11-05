import { AGENT_SEARCH_FIELDS, searchInternshipsForAgent } from "../lib/agent-internship-search.js";

const SERVER = Object.freeze({ name: "firstinternships", version: "1.0.0" });
const HANDOFF_URL = "https://firstinternships.com/talent-network?source=ai-assistant#join";

const tools = Object.freeze([
  {
    name: "search_college_internships",
    title: "Search FirstInternships",
    description: "Search sourced college internship program guides by interest, college year, field, location, and pay. Results link to FirstInternships guidance and the employer's official route. Results are not offers or placement guarantees.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", maxLength: 160, description: "Role, employer, skill, major, or keyword." },
        collegeYear: { type: "integer", enum: [1, 2, 3, 4], description: "Student's current college year." },
        field: { type: "string", enum: AGENT_SEARCH_FIELDS.map(field => field.id), description: "Broad career field." },
        location: { type: "string", maxLength: 80, description: "Optional city, state, country, or remote preference used to rank results." },
        paidOnly: { type: "boolean", description: "Return only programs described as paid." },
        limit: { type: "integer", minimum: 1, maximum: 10, default: 6 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "prepare_private_resume_handoff",
    title: "Open the private resume handoff",
    description: "Return the secure FirstInternships handoff after the student asks to use the private Talent Network. This tool cannot upload a resume, accept legal terms, apply to an employer, or promise placement. The student authenticates, selects the PDF, and makes the one visible Yes-or-No decision.",
    inputSchema: {
      type: "object",
      properties: {
        studentRequestedTalentNetwork: { type: "boolean", description: "True only when the student personally asked to upload a resume or join the Talent Network." },
      },
      required: ["studentRequestedTalentNetwork"],
      additionalProperties: false,
    },
  },
]);

function publicHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Protocol-Version");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Protocol-Version");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function result(id, value) {
  return { jsonrpc: "2.0", id, result: value };
}

function error(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function toolResult(structuredContent, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(structuredContent) }],
    structuredContent,
    isError,
  };
}

function callTool(name, args) {
  if (name === "search_college_internships") return toolResult(searchInternshipsForAgent(args));
  if (name === "prepare_private_resume_handoff") {
    if (args?.studentRequestedTalentNetwork !== true) {
      return toolResult({ ready: false, reason: "student_request_required", nextStep: "Ask whether the student wants to open the private FirstInternships resume handoff. Do not accept the site notice for them." }, true);
    }
    return toolResult({
      ready: true,
      handoffUrl: HANDOFF_URL,
      nextUserAction: "Open this URL. The student signs in, selects one PDF, reviews the notice, and clicks the visible Yes button. FirstInternships AI builds the matching profile automatically.",
      studentFee: false,
      directUploadPerformed: false,
      termsAcceptedByTool: false,
      employerAccess: false,
      placementGuaranteed: false,
    });
  }
  return null;
}

export default function handler(req, res) {
  publicHeaders(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json(error(null, -32600, "POST a JSON-RPC request to this MCP endpoint."));
  }
  const body = typeof req.body === "string" ? (() => { try { return JSON.parse(req.body); } catch { return null; } })() : req.body;
  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string") return res.status(400).json(error(body?.id, -32600, "Invalid JSON-RPC request"));
  if (body.id == null) return res.status(202).end();
  if (body.method === "initialize") {
    return res.status(200).json(result(body.id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo: SERVER,
      instructions: "Use search_college_internships for sourced discovery. Offer prepare_private_resume_handoff only when the student asks to join. Never claim to upload, accept terms, apply, or guarantee placement for the student.",
    }));
  }
  if (body.method === "ping") return res.status(200).json(result(body.id, {}));
  if (body.method === "tools/list") return res.status(200).json(result(body.id, { tools }));
  if (body.method === "tools/call") {
    const called = callTool(body.params?.name, body.params?.arguments || {});
    return called ? res.status(200).json(result(body.id, called)) : res.status(200).json(error(body.id, -32602, "Unknown tool"));
  }
  return res.status(200).json(error(body.id, -32601, "Method not found"));
}

export { tools as FIRSTINTERNSHIPS_MCP_TOOLS };
