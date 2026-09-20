// Consolidate retired outreach-era pages into relevant, maintained destinations.
// These aliases also power local preview redirects and deployment configuration.
export const LEGACY_REDIRECTS = {
  "/internships/computer-science": "/internships/technology",
  "/internships/data-science": "/internships/technology",
  "/ai-internships": "/internships/technology",
  "/cybersecurity-internships": "/internships/technology",
  "/internships/aerospace-and-defense": "/internships/engineering",
  "/internships/manufacturing-and-industrial": "/internships/engineering",
  "/internships/energy": "/internships/engineering",
  "/mechanical-engineering-internships": "/internships/engineering",
  "/architecture-internships": "/internships/engineering",
  "/internships/finance-and-fintech": "/internships/finance",
  "/accounting-internships": "/internships/finance",
  "/internships/consulting-and-staffing": "/internships/business",
  "/internships/consumer-and-retail": "/internships/business",
  "/internships/logistics-and-transportation": "/internships/business",
  "/internships/real-estate-and-construction": "/internships/business",
  "/internships/travel-and-hospitality": "/internships/business",
  "/internships/agriculture": "/internships/research",
  "/internships/government-and-nonprofit": "/internships/research",
  "/internships/healthcare-and-biotech": "/internships/research",
  "/psychology-internships": "/internships/research",
  "/medicine-internships": "/internships/research",
  "/nursing-internships": "/internships/research",
  "/jay-reddy": "/about",
  "/tools/resume-grader": "/guides/internship-resume-with-no-experience",
  "/tools/cold-email-grader": "/guides/how-to-follow-up-on-an-internship-email",
  "/guides/internship-resume-guide": "/guides/internship-resume-with-no-experience",
  "/guides/internship-with-no-experience": "/guides/internship-resume-with-no-experience",
  "/guides/how-to-get-a-summer-internship": "/guides/when-to-apply-for-summer-internships",
  "/guides/how-to-get-an-internship": "/guides/how-to-apply-for-an-internship",
  "/guides/how-many-internships-should-you-apply-to": "/guides/how-to-find-internships",
};
for (const slug of ["how-to-ask-for-an-internship", "how-to-email-a-recruiter-about-an-internship", "internship-email-templates", "cold-email-vs-applying-online-for-internships", "cold-email-for-internship", "best-time-to-send-a-cold-email"]) LEGACY_REDIRECTS[`/guides/${slug}`] = "/guides/how-to-follow-up-on-an-internship-email";
for (const slug of ["washington-dc", "chicago", "los-angeles", "san-francisco", "boston", "new-york", "education", "marketing", "communications", "legal", "design", "media-and-marketing"]) LEGACY_REDIRECTS[`/internships/${slug}`] = "/internships";
for (const slug of ["journalism", "graphic-design", "law", "ux-design"]) LEGACY_REDIRECTS[`/${slug}-internships`] = "/internships";
for (const slug of ["texas", "florida", "new-york-state", "illinois", "california", "washington", "pennsylvania", "new-jersey", "georgia", "north-carolina", "massachusetts", "virginia"]) LEGACY_REDIRECTS[`/internships-in-${slug}`] = "/internships";
for (const prefix of ["", "paid-", "summer-", "remote-", "stem-", "business-", "finance-", "software-engineering-", "marketing-", "medical-"]) LEGACY_REDIRECTS[`/${prefix}high-school-internships`] = "/";
