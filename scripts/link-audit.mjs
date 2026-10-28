import { PROGRAMS } from "../src/content.js";

const strict = process.argv.includes("--strict");
const concurrency = 8;
const queue = [...new Map(PROGRAMS.map(program => [program.url, program])).values()];
const failures = [];
let cursor = 0;

async function inspect(program) {
  try {
    const response = await fetch(program.url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "FirstInternships-LinkAudit/1.0 (+https://firstinternships.com/about)" },
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 404 || response.status === 410) failures.push({ program, status: response.status });
  } catch (error) {
    failures.push({ program, status: error?.name || "request-error" });
  }
}

async function worker() {
  while (cursor < queue.length) {
    const program = queue[cursor++];
    await inspect(program);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
if (failures.length) {
  console.error(`Found ${failures.length} official destinations that need review:`);
  for (const { program, status } of failures) console.error(`${status}\t${program.id}\t${program.url}`);
  if (strict) process.exitCode = 1;
} else {
  console.log(`Checked ${queue.length} unique official destinations with no hard failures.`);
}
