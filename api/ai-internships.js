import { AGENT_SEARCH_FIELDS, searchInternshipsForAgent } from "../lib/agent-internship-search.js";

function publicHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=900, stale-while-revalidate=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export default function handler(req, res) {
  publicHeaders(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const search = searchInternshipsForAgent({
    query: req.query?.q,
    collegeYear: req.query?.year,
    field: req.query?.field,
    location: req.query?.location,
    paidOnly: req.query?.paid,
    limit: req.query?.limit,
  });
  return res.status(200).json({
    service: "FirstInternships AI-readable college internship search",
    fields: AGENT_SEARCH_FIELDS,
    ...search,
  });
}
