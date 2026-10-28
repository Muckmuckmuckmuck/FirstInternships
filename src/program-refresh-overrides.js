const REVIEWED = "2026-10-28";

// Stable employer-owned destinations for records whose original requisition URL
// was removed after review. The guide keeps its sourced historical details, but
// the primary action must never strand a student on a 404.
const REFRESHES = Object.freeze({
  "boeing-communications-2027": { url: "https://jobs.boeing.com/internships", status: "Reviewed 2027 listing ended — check current Boeing internships", availability: "closed" },
  "boeing-facilities-engineering-2027": { url: "https://jobs.boeing.com/internships", status: "Reviewed 2027 listing ended — check current Boeing internships", availability: "closed" },
  "cisco-product-internship-2027": { url: "https://careers.cisco.com/global/en/internships-and-co-ops", status: "Reviewed role removed — check current Cisco internships", availability: "closed" },
  "servicenow-finance-intern-2027": { url: "https://careers.servicenow.com/early-careers/", status: "Reviewed role removed — check current ServiceNow internships", availability: "closed" },
  "moodys-summer-internship": { url: "https://careers.moodys.com/en/early-careers", status: "Reviewed 2027 windows ended — check current Moody's internships", availability: "closed" },
  "verizon-summer-internships-2027": { url: "https://mycareer.verizon.com/jobs/?pagesize=20&team=Campus+%26+Apprenticeships", status: "Current 2027 campus roles available — requirements vary by posting", availability: "open" },
  "akuna-capital-internships": { url: "https://akunacapital.com/careers/", status: "Check Akuna's current internship openings", availability: "check" },
  "waymo-summer-internships-2027": { url: "https://careers.withwaymo.com/jobs/search", status: "Check Waymo's current 2027 internship openings", availability: "check" },
  "loreal-research-innovation-internship-2027": { url: "https://careers.loreal.com/en/internship-apprenticeship?locale=en_US", status: "Summer 2027 application window closed — check current internships", availability: "closed" },
  "harvey-software-engineering-internship-2027": { url: "https://jobs.ashbyhq.com/harvey", status: "Published Summer 2027 deadline passed — check current Harvey roles", availability: "closed" },
  "barclays-banking-summer-internship-london-2027": { url: "https://search.jobs.barclays/internships", status: "Reviewed listing removed — check current Barclays internships", availability: "closed" },
  "barclays-capital-markets-london-2027": { url: "https://search.jobs.barclays/internships", status: "Reviewed listing removed — check current Barclays internships", availability: "closed" },
  "barclays-sales-trading-structuring-london-2027": { url: "https://search.jobs.barclays/internships", status: "Reviewed listing removed — check current Barclays internships", availability: "closed" },
  "amgen-us-value-access-internship-2027": { url: "https://careers.amgen.com/en/business/custom_fields.careeropportunities/interns/87/50000000", status: "Reviewed listing removed — check current Amgen internships", availability: "closed" },
  "mars-sophomore-experience": { url: "https://careers.mars.com/us/en/students-graduates", status: "Check current Mars student opportunities", availability: "check" },
  "church-dwight-finance-internship-2027": { url: "https://careers.churchdwight.com/winning-together/early-careers/how-do-i-apply-for-a-student-internship/", status: "Reviewed finance listing removed — check current student internships", availability: "closed" },
  "t-mobile-software-engineering-internship-2027": { url: "https://careers.t-mobile.com/summer-2027-software-engineering-internship/job/93AA7D7A75DABA68B952461425002009", status: "Summer 2027 posting available at review", availability: "open" },
  "cox-automotive-product-management-intern-2027": { url: "https://jobs.coxenterprises.com/en/career-areas/early-career/internships/", status: "Reviewed product role removed — check current Cox internships", availability: "closed" },
  "jacobs-global-internship-program": { url: "https://careers.jacobs.com/en_US/careers/EarlyCareers", status: "Check current Jacobs early-career openings", availability: "check" },
  "cushman-wakefield-boston-commercial-real-estate-intern-2027": { url: "https://careers.cushmanwakefield.com/en/life-at-cw/global-early-careers-programs/early-careers-north-america/internships/", status: "Reviewed Boston listing removed — check current C&W internships", availability: "closed" },
  "cushman-wakefield-client-accounting-tempe-2027": { url: "https://careers.cushmanwakefield.com/en/life-at-cw/global-early-careers-programs/early-careers-north-america/internships/", status: "Reviewed Tempe listing removed — check current C&W internships", availability: "closed" },
  "niantic-spatial-software-engineering-intern-2027": { url: "https://jobs.ashbyhq.com/niantic-spatial/898b2da7-03cd-486e-96e3-3430a148c8fd/?embed=true", status: "Summer 2027 posting available at review", availability: "open" },
});

export function applyProgramRefresh(program) {
  const refresh = REFRESHES[program.id];
  if (!refresh) return program;
  const sources = [
    ...(program.sources || []).filter(source => source.url !== refresh.url),
    { name: `Official current application route checked ${REVIEWED}`, url: refresh.url },
  ];
  return { ...program, ...refresh, linkVerified: REVIEWED, sources };
}

export const PROGRAM_REFRESH_IDS = Object.freeze(Object.keys(REFRESHES));
