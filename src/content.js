import { ADDITIONAL_FIELDS, ADDITIONAL_GUIDES, ADDITIONAL_PROGRAMS, TOPICS as BASE_TOPICS } from "./expanded-content.js";
import { NEW_PROGRAMS } from "./inventory-expansion.js";
import { VARIETY_PROGRAMS } from "./variety-expansion.js";
import { ORGANIC_EXPANSION_PROGRAMS } from "./organic-expansion.js";
import { CONTENT_EXPANSION_2_PROGRAMS } from "./content-expansion-2.js";
import { CONTENT_EXPANSION_3_PROGRAMS } from "./content-expansion-3.js";
import { CONTENT_EXPANSION_4_PROGRAMS } from "./content-expansion-4.js";
import { GUIDE_EXPANSION } from "./guide-expansion.js";
import { GUIDE_EXPANSION_2 } from "./guide-expansion-2.js";
import { GUIDE_EXPANSION_3 } from "./guide-expansion-3.js";
import { GUIDE_EXPANSION_4 } from "./guide-expansion-4.js";
import { GUIDE_EXPANSION_5 } from "./guide-expansion-5.js";
import { GUIDE_EXPANSION_6 } from "./guide-expansion-6.js";
import { GUIDE_EXPANSION_7 } from "./guide-expansion-7.js";
import { SECTOR_PROGRAMS, INSURANCE_FIELD } from "./sector-expansion.js";
import { RESEARCH_PROGRAMS } from "./research-expansion.js";
// Employer batches researched in parallel; each lives in its own module so
// concurrent branches never touch the same file.
import { EMPLOYERS_TECH_PROGRAMS } from "./employers-tech-expansion.js";
import { EMPLOYERS_FINANCE_PROGRAMS } from "./employers-finance-expansion.js";
import { EMPLOYERS_BUSINESS_PROGRAMS } from "./employers-business-expansion.js";
import { EMPLOYERS_INDUSTRY_PROGRAMS } from "./employers-industry-expansion.js";
import { EMPLOYERS_HEALTH_PROGRAMS } from "./employers-health-expansion.js";
import { EMPLOYERS_PUBLIC_MEDIA_PROGRAMS } from "./employers-public-media-expansion.js";
import { EMPLOYERS_QUANT_TECH_PROGRAMS } from "./employers-quant-tech-expansion.js";
import { EMPLOYERS_CAMPUS_PROGRAMS } from "./employers-campus-expansion.js";
import { EMPLOYERS_FALL_2026_PROGRAMS } from "./employers-fall-2026-expansion.js";
import { EMPLOYERS_OCTOBER_2026_INSURANCE_PROGRAMS } from "./employers-october-2026-insurance-expansion.js";
import { OCTOBER_2026_PUBLIC_SERVICE_PROGRAMS } from "./employers-october-2026-public-service-expansion.js";
import { EMPLOYERS_OCTOBER_2026_CONSUMER_MEDIA_PROGRAMS } from "./employers-october-2026-consumer-media-expansion.js";
import { EMPLOYERS_OCTOBER_2026_GROWTH_PROGRAMS } from "./employers-october-2026-growth-expansion.js";
import { EMPLOYERS_OCTOBER_2026_GROWTH_WAVE_2_PROGRAMS } from "./employers-october-2026-growth-wave-2.js";
import { EMPLOYERS_FINANCE_BANKS_WAVE_2_PROGRAMS } from "./employers-finance-banks-wave-2-expansion.js";
import { EMPLOYERS_FINANCE_ALTERNATIVES_WAVE_2_PROGRAMS } from "./employers-finance-alternatives-wave-2-expansion.js";
import { EMPLOYERS_FINANCE_ADVISORY_WAVE_2_PROGRAMS } from "./employers-finance-advisory-wave-2-expansion.js";
import { EMPLOYERS_FINANCE_INVESTING_WAVE_2_PROGRAMS } from "./employers-finance-investing-wave-2-expansion.js";
import { EMPLOYERS_FINANCE_MARKETS_WAVE_3_PROGRAMS } from "./employers-finance-markets-wave-3-expansion.js";
import { EMPLOYERS_FINANCE_CORPORATE_WAVE_3_PROGRAMS } from "./employers-finance-corporate-wave-3-expansion.js";
import { EMPLOYERS_FINANCE_PRIVATE_MARKETS_WAVE_3_PROGRAMS } from "./employers-finance-private-markets-wave-3-expansion.js";
import { EMPLOYERS_TECH_ENGINEERING_WAVE_4_PROGRAMS } from "./employers-tech-engineering-wave-4-expansion.js";
import { EMPLOYERS_HEALTH_CONSUMER_WAVE_4_PROGRAMS } from "./employers-health-consumer-wave-4-expansion.js";
import { EMPLOYERS_INDUSTRIAL_CONSUMER_WAVE_5_PROGRAMS } from "./employers-industrial-consumer-wave-5-expansion.js";
import { EMPLOYERS_CONSUMER_INDUSTRIAL_WAVE_6_PROGRAMS } from "./employers-consumer-industrial-wave-6-expansion.js";
import { EMPLOYERS_LIFE_SCIENCES_WAVE_7_PROGRAMS } from "./employers-life-sciences-wave-7-expansion.js";
import { EMPLOYERS_STUDENT_BRANDS_WAVE_8_PROGRAMS } from "./employers-student-brands-wave-8-expansion.js";
import { EMPLOYERS_TRAVEL_HOSPITALITY_WAVE_9_PROGRAMS } from "./employers-travel-hospitality-wave-9-expansion.js";
import { EMPLOYERS_CONSUMER_FOOD_WAVE_10_PROGRAMS } from "./employers-consumer-food-wave-10-expansion.js";
import { EMPLOYERS_TELECOM_MEDIA_WAVE_11_PROGRAMS } from "./employers-telecom-media-wave-11-expansion.js";
import { EMPLOYERS_INFRASTRUCTURE_WAVE_12_PROGRAMS } from "./employers-infrastructure-wave-12-expansion.js";
import { EMPLOYERS_DESIGN_ENVIRONMENT_WAVE_13_PROGRAMS } from "./employers-design-environment-wave-13-expansion.js";
import { EMPLOYERS_ARCHITECTURE_WAVE_14_PROGRAMS } from "./employers-architecture-wave-14-expansion.js";
import { EMPLOYERS_CONSULTING_WAVE_15_PROGRAMS } from "./employers-consulting-wave-15-expansion.js";
import { EMPLOYERS_ACCOUNTING_ADVISORY_WAVE_16_PROGRAMS } from "./employers-accounting-advisory-wave-16-expansion.js";
import { EMPLOYERS_ACCOUNTING_ADVISORY_WAVE_17_PROGRAMS } from "./employers-accounting-advisory-wave-17-expansion.js";
import { EMPLOYERS_POLICY_RESEARCH_WAVE_18_PROGRAMS, POLICY_RESEARCH_GUIDES } from "./employers-policy-research-wave-18-expansion.js";
import { EMPLOYERS_SPORTS_WAVE_19_PROGRAMS, SPORTS_GUIDES } from "./employers-sports-wave-19-expansion.js";
import { EMPLOYERS_AEROSPACE_WAVE_20_PROGRAMS, AEROSPACE_GUIDES } from "./employers-aerospace-wave-20-expansion.js";
import { EMPLOYERS_INSURANCE_WAVE_21_PROGRAMS, INSURANCE_GUIDES } from "./employers-insurance-wave-21-expansion.js";
import { EMPLOYERS_REAL_ESTATE_WAVE_22_PROGRAMS, REAL_ESTATE_GUIDES } from "./employers-real-estate-wave-22-expansion.js";
import { EMPLOYERS_MARKETING_WAVE_23_PROGRAMS, MARKETING_EXISTING_PROGRAM_IDS, MARKETING_GUIDES } from "./employers-marketing-wave-23-expansion.js";
import { EMPLOYERS_INTERNATIONAL_AFFAIRS_WAVE_24_PROGRAMS, INTERNATIONAL_AFFAIRS_EXISTING_PROGRAM_IDS, INTERNATIONAL_AFFAIRS_GUIDES } from "./employers-international-affairs-wave-24-expansion.js";
import { EMPLOYERS_ENVIRONMENT_CONSERVATION_WAVE_25_PROGRAMS, ENVIRONMENT_CONSERVATION_GUIDES, ENVIRONMENT_CONSERVATION_TOPIC } from "./employers-environment-conservation-wave-25-expansion.js";
import { EMPLOYERS_LOGISTICS_WAVE_26_PROGRAMS, LOGISTICS_GUIDES } from "./employers-logistics-wave-26-expansion.js";
import { EMPLOYERS_CLOUD_SOFTWARE_WAVE_27_PROGRAMS } from "./employers-cloud-software-wave-27-expansion.js";
import { EMPLOYERS_PRODUCT_SOFTWARE_WAVE_28_PROGRAMS } from "./employers-product-software-wave-28-expansion.js";
// Laboratory, research and public-sector programs, in their own browser chunk.
import { LAB_PROGRAMS } from "./programs-labs-expansion.js";
import { RESEARCH_PROGRAMS_2 } from "./programs-research-expansion.js";
import { PUBLIC_PROGRAMS } from "./programs-public-expansion.js";
export const TOPICS = [
  ...BASE_TOPICS.map(topic => topic.slug === "summer-2027-college-internships"
    ? { ...topic, programIds: [...topic.programIds,
      "wwf-bridge-internships-2027",
      "ryder-summer-internship-program",
      "vercel-software-engineering-internships-2027",
      "cloudflare-software-engineer-intern-austin-2027",
      "datadog-software-engineering-intern-summer-2027",
      "mongodb-software-engineering-intern-amer-2027",
      "atlassian-software-engineer-intern-summer-2027",
      "notion-software-engineer-intern-summer-2027",
      "patreon-software-engineering-intern-summer-2027",
      "ibotta-software-engineer-intern-summer-2027",
      "niantic-spatial-software-engineering-intern-2027",
      "sentry-software-engineer-intern-vienna-2027",
    ] }
    : topic),
  ENVIRONMENT_CONSERVATION_TOPIC,
];
export const SITE = "https://firstinternships.com";
export const VERIFIED = "2026-09-19";
// Generated builds provide one shared timestamp to both the prerender and the
// browser bundle. The fallback keeps direct Node imports deterministic in tests.
// This clock decides whether a published cutoff is past; it is not an editorial
// review date and must never be presented as one.
export const RENDERED_AT = import.meta.env?.VITE_RENDER_TIMESTAMP || `${VERIFIED}T00:00:00.000Z`;
export const CONTACT = "contactfirstinternships@gmail.com";
const source = (name, url) => ({ name, url });
const PROGRAM_SEO = {
  "microsoft-explore": ["Microsoft Explore Internship: How to Apply", "Learn who can apply to Microsoft Explore, how the first- and second-year program works, and how to prepare before using the official careers portal."],
  "nasa-ostem": ["NASA OSTEM Internships: Eligibility & Application", "Check NASA OSTEM college eligibility, GPA and citizenship rules, the published Summer 2027 deadline, and practical steps to apply through NASA."],
  "nasa-pathways": ["NASA Pathways Internships: How to Apply", "Understand NASA Pathways college credits, GPA, enrollment and 480-hour requirements before following the official USAJOBS application route."],
  "doe-suli": ["DOE SULI Internship: Requirements & Application", "Check SULI college coursework and GPA requirements, Spring 2027 dates, stipend details, transcripts, references, and the official application route."],
  "doe-cci": ["DOE CCI Internship: How to Apply", "Explore DOE CCI for community-college students: coursework, GPA and enrollment rules, Spring 2027 dates, and the official application checklist."],
  "nsf-reu": ["NSF REU Programs: Eligibility & How to Apply", "Learn how NSF REU site applications work, check undergraduate eligibility, compare research interests and funding, and prepare your site-specific materials."],
  "jpl-summer": ["JPL Summer Internship: Requirements & Application", "Review JPL Summer college eligibility, application materials and preparation advice. The last published cycle is closed; check JPL for future dates."],
  "goldman-sachs-summer-analyst": ["Goldman Sachs Summer Analyst 2027: How to Apply", "Understand Goldman Sachs Summer Analyst 2027, usual penultimate-year timing, business selection, and how to check current official applications."],
  "ey-internships": ["EY Internships: Requirements & How to Apply", "Choose an EY US undergraduate internship service line, check role-specific degree and graduation rules, and prepare for the official application."],
  "deloitte-internships": ["Deloitte Internships: Requirements & Application", "Find the current Deloitte US undergraduate internship route, check track and office qualifications, and prepare an application without guessing class-year rules."],
};

// Program directories, not individual job offers. Null eligibility means we
// cannot infer a minimum class year from the publisher's current program page.
export const PROGRAMS = [
  {
    id: "microsoft-explore", company: "Microsoft", title: "Explore Microsoft", initials: "MS", color: "#2876b9",
    fields: ["technology"], firstYear: 1, years: [1, 2], yearLabel: "Years 1–2", pay: "Paid", location: "US & India; check opening", mode: "Role-specific",
    summary: "A software-development introduction specifically designed for students in their first two college years.",
    eligibility: ["Designed for first- and/or second-year college students interested in a technical discipline.", "The US program is 12 weeks; the India program is 8 weeks.", "Country, enrollment, and work-authorization requirements must be checked in the individual opening."],
    timing: "Summer program. A specific Explore application window is not confirmed here; check the current careers listings.", status: "Check openings",
    url: "https://careers.microsoft.com/v2/global/en/exploremicrosoft",
    sources: [source("Explore Microsoft overview", "https://careers.microsoft.com/v2/global/en/exploremicrosoft"), source("University internship pay and hiring guidance", "https://careers.microsoft.com/v2/global/en/universityinternship")],
    steps: ["Find an Explore opening for your country on Microsoft Careers, rather than applying to an unrelated role displayed on the overview page.", "Read its required qualifications and graduation/enrollment rules. Put your expected graduation month and year on your resume.", "Submit through the official careers portal and use its Action Center to track the employer's decision."],
    prepare: ["Use one class or personal software project to show how you approach a problem. Explain the user, your contribution, the technology you chose, and one trade-off. A small working project is easier to discuss than a long list of tools you have barely used.", "Practice describing how you debugged a failure and how you worked with someone else. Our suggestion is to make your learning process visible; this is not a promise about Microsoft's interview questions."],
    pitfall: "Explore's first/second-year focus is not a minimum followed by automatic eligibility for juniors and seniors.",
    materials: ["Resume with graduation date", "Opening-specific eligibility check", "Project examples", "Official portal confirmation"],
  },
  {
    id: "nasa-ostem", company: "NASA", title: "NASA OSTEM Internships", initials: "NA", color: "#173d8e",
    fields: ["engineering", "research", "technology", "business", "aerospace"], firstYear: 1, years: [1, 2, 3, 4], yearLabel: "Undergraduate years 1–4", pay: "Paid", location: "NASA centers; check project", mode: "Project-specific",
    summary: "Project-based college internships across STEM and non-STEM work at NASA.",
    eligibility: ["Current college students may be enrolled full time or part time in a degree-granting program at an accredited institution.", "US citizenship, a cumulative 3.0 GPA, and a minimum age of 16 are program-level requirements.", "A project's skills, education level, and other qualifications still apply. This directory covers the college route only."],
    timing: "NASA lists February 26, 2027 at 11:59 p.m. ET as the Summer 2027 deadline. Summer internships last 10 weeks; spring/fall terms last 15 weeks.", status: "Published deadline", deadline: "2027-02-27T04:59:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Feb 26, 11:59 p.m. ET",
    url: "https://www.nasa.gov/learning-resources/internship-programs/",
    sources: [source("NASA internship programs and dates", "https://www.nasa.gov/learning-resources/internship-programs/"), source("NASA internship eligibility FAQ", "https://www.nasa.gov/learning-resources/internship-programs/intern-frequently-asked-questions/")],
    steps: ["Choose OSTEM on NASA's official internship page and follow the current application link.", "Read each project carefully and match it to coursework, tools, or interests you can demonstrate. Check that the project accepts undergraduates.", "Complete the employer's requested application materials and submit before the term deadline. Keep the project identifier and confirmation in your own records."],
    prepare: ["Start with the project, not the NASA name. For a data project, describe a dataset you cleaned and the conclusion you reached. For communications or business work, show a writing sample, campus organization project, or process you improved.", "A first-year applicant can use laboratory coursework or a small independent project honestly. Identify what you already know and what you would need to learn; do not claim experience with equipment or methods you have only read about."],
    pitfall: "OSTEM and Pathways have different rules and application processes. Eligibility for one does not establish eligibility for the other.",
    materials: ["Project qualification review", "Resume and education details", "Required academic records", "Term availability"],
  },
  {
    id: "nasa-pathways", company: "NASA", title: "NASA Pathways Internships", initials: "NP", color: "#253a67",
    fields: ["engineering", "technology", "business", "aerospace"], firstYear: 1, years: [1, 2, 3, 4], yearLabel: "Year 1+ · credits & time required", pay: "Paid", location: "See USAJOBS announcement", mode: "Role-specific",
    summary: "A paid federal student employment pathway with coursework and remaining-work-time requirements.",
    eligibility: ["US citizenship, at least half-time enrollment, and a cumulative GPA of at least 2.9 are required.", "Complete at least 15 semester or 23 quarter credit hours.", "You must be able to work at least 480 hours before completing your degree. Seniors need to check this carefully.", "The individual federal announcement controls the full requirements and selection process."],
    timing: "Applications follow individual USAJOBS announcements. No universal opening or closing date is asserted here.", status: "Check announcements",
    url: "https://www.nasa.gov/learning-resources/internship-programs/",
    sources: [source("NASA Pathways requirements", "https://www.nasa.gov/learning-resources/internship-programs/")],
    steps: ["Follow NASA's official Pathways link to current USAJOBS student announcements.", "Check the announcement's education, documents, work schedule, location, and closing time. Calculate whether the required hours fit before graduation.", "Use the resume and document instructions in that announcement, complete its questionnaires, and submit through USAJOBS."],
    prepare: ["Treat the federal announcement as a checklist. Map every requirement to a document or a concrete example before drafting. The resume format and detail requested may differ from a private-company campus resume; follow the current announcement rather than a generic template.", "Plan the work schedule with your academic adviser. Semester availability, travel, and graduation timing can determine whether this is workable even when your class year and GPA fit."],
    pitfall: "Potential conversion to federal employment is not a guaranteed full-time offer.",
    materials: ["USAJOBS announcement review", "Required resume format", "Enrollment and transcript documents", "480-hour feasibility check"],
  },
  {
    id: "doe-suli", company: "US Department of Energy", title: "Science Undergraduate Laboratory Internships (SULI)", initials: "DE", color: "#387448",
    fields: ["research", "engineering", "technology"], firstYear: 1, years: [1, 2, 3, 4], yearLabel: "Year 1+ · after one semester", pay: "Paid", location: "US national laboratories", mode: "On-site",
    summary: "Research with a scientist or engineer at a participating national laboratory; eligible first-years need completed college coursework.",
    eligibility: ["For the current-student route: full-time undergraduate enrollment, one completed matriculated semester, 12 total undergraduate credits, and 6 STEM credits by the deadline.", "A cumulative 3.0 GPA, US citizenship or lawful permanent residency at application, and age 18 by the start are required.", "Pre-college/AP credits do not replace the completed-semester or minimum-credit requirements."],
    timing: "Spring 2027 applications are due September 30, 2026 at 5 p.m. ET. The published benefits include a $650 weekly stipend; summer terms are typically 10 weeks and semester terms 16 weeks.", status: "Published deadline", deadline: "2026-09-30T21:00:00Z", deadlineZone: "America/New_York", deadlineLabel: "Spring 2027 · Sep 30, 5 p.m. ET",
    url: "https://science.osti.gov/wdts/suli/How-to-Apply",
    sources: [source("SULI eligibility", "https://science.osti.gov/wdts/suli/Eligibility"), source("Application instructions and deadline", "https://science.osti.gov/wdts/suli/How-to-Apply"), source("Stipend and on-site participation", "https://science.osti.gov/wdts/suli/Benefits")],
    steps: ["Choose laboratory interests and complete the official online application, including its essays.", "Upload the required undergraduate transcripts. DOE requires removal of Social Security numbers and full dates of birth; transcript screenshots and degree audits are not accepted.", "Arrange two letters of support using the current system. Review all sections and submit a complete application before the deadline."],
    prepare: ["Read about a laboratory's current research before explaining your interest. Connect a course, experiment, or coding exercise to a specific question you want to investigate. You do not need to pretend your class project was professional research.", "Give potential recommenders time and context: your resume, why the lab work interests you, the deadline, and a reminder of work they supervised. Track the letters separately from your own application submission."],
    pitfall: "Being in year one is not enough: the completed-semester and credit rules must already be satisfied by the application deadline.",
    materials: ["Credit and GPA check", "Redacted transcript PDFs", "Two letters of support", "Research-interest essays"],
  },
  {
    id: "doe-cci", company: "US Department of Energy", title: "Community College Internships (CCI)", initials: "CC", color: "#548a36",
    fields: ["engineering", "research", "technology"], firstYear: 1, years: [1, 2, 3, 4], yearLabel: "Community / two-year college", pay: "Paid", location: "US national laboratories", mode: "See host requirements",
    summary: "Technical laboratory experience for students enrolled at community colleges and accredited two-year colleges.",
    eligibility: ["Full- or part-time enrollment at a community college or accredited two-year college, plus one completed matriculated semester.", "At least 12 total undergraduate credits, 6 STEM credits, and a cumulative GPA of 2.7. A GPA below 3.0 requires a waiver statement.", "US citizenship or lawful permanent residency at application; age 18 by the internship start.", "Pre-college credits do not replace the minimum coursework requirement."],
    timing: "Spring 2027 applications are due September 30, 2026 at 5 p.m. ET. CCI describes paid 10-week experiences.", status: "Published deadline", deadline: "2026-09-30T21:00:00Z", deadlineZone: "America/New_York", deadlineLabel: "Spring 2027 · Sep 30, 5 p.m. ET",
    url: "https://science.osti.gov/wdts/cci",
    sources: [source("CCI program, pay and deadline", "https://science.osti.gov/wdts/cci"), source("CCI eligibility and GPA waiver", "https://science.osti.gov/wdts/cci/Eligibility")],
    steps: ["Use the official CCI page to find the current application system and checklist.", "Review the technical areas at participating laboratories, then choose interests that match your coursework.", "Prepare the transcripts, recommendations, essays, and any GPA waiver requested by the current checklist. Verify completeness before submitting."],
    prepare: ["A technical course can provide a useful example: a measurement you took, a part you designed, code you tested, or a safety procedure you followed. Explain your contribution and how you checked the result.", "Talk to a faculty member about which laboratory areas match your training. If transferring to a four-year institution, confirm that your enrollment situation still meets CCI's rules for the term instead of assuming the opportunity transfers with you."],
    pitfall: "CCI is not a generic four-year-college internship. Enrollment type matters as much as class year.",
    materials: ["Community-college enrollment check", "Completed coursework review", "Current application checklist", "GPA waiver if required"],
  },
  {
    id: "nsf-reu", company: "NSF-funded research sites", title: "Research Experiences for Undergraduates (REU)", initials: "NS", color: "#4564a5",
    fields: ["research", "engineering", "technology"], firstYear: 1, years: [1, 2, 3, 4], yearLabel: "Undergraduates · site-specific", pay: "Paid", location: "Participating research sites", mode: "Site-specific",
    summary: "Funded undergraduate research opportunities offered by individual universities and research organizations, not one centralized internship.",
    eligibility: ["NSF-funded REU participants must be undergraduate students pursuing an associate or bachelor's degree and US citizens, US nationals, or permanent residents.", "Individual sites can set additional coursework, class-year, or other eligibility criteria.", "There is no blanket rule that all REU sites accept first-years or graduating seniors."],
    timing: "Dates vary by site. NSF says participants receive stipends and many sites provide help with housing, meals, or travel; confirm each site's package.", status: "Site-specific dates",
    url: "https://www.nsf.gov/funding/initiatives/reu/students",
    sources: [source("NSF REU student eligibility and site directory", "https://www.nsf.gov/funding/initiatives/reu/students"), source("NSF undergraduate application overview", "https://www.nsf.gov/funding/undergraduates")],
    steps: ["Find sites in NSF's REU directory or ETAP. Not every site uses ETAP, so follow each site's own application instructions.", "Check the site's specific eligibility, research themes, dates, stipend, and housing arrangements.", "Submit the site's requested materials, which may include a statement of interest, academic records, and references. Track each deadline separately."],
    prepare: ["Build a short comparison of research questions, not just university names. Read the site description and identify which methods you have used in class and which you hope to learn. Explain why that particular research setting fits your next step.", "For your statement, describe a question that caught your attention and what you did to explore it. Our advice is to use an honest, specific example rather than broad claims about loving science since childhood."],
    pitfall: "NSF does not collect one universal application for all REUs. Site requirements and student-status rules differ.",
    materials: ["Site eligibility and dates", "Research statement", "Site-requested academic records", "References if requested"],
  },
  {
    id: "jpl-summer", company: "NASA Jet Propulsion Laboratory", title: "JPL Summer Internship Program", initials: "JP", color: "#b85030",
    fields: ["research", "engineering", "technology", "aerospace"], firstYear: 1, years: [1, 2, 3, 4], yearLabel: "Undergraduates · STEM", pay: "Paid", location: "JPL · Pasadena, California", mode: "Check program arrangements",
    summary: "A 10-week, full-time STEM internship at JPL. The last published summer deadline has passed; use this guide to prepare for a future cycle.",
    eligibility: ["The program accepts undergraduate and graduate STEM students at accredited US universities.", "A 3.0 GPA at the current active institution and US citizenship or lawful permanent residency are required.", "No college class-year minimum is stated on the program page; project and enrollment rules still matter."],
    timing: "The last published deadline was March 13, 2026 at 5 p.m. PDT, which has passed. A new cycle is not confirmed here. JPL describes 10 weeks at 40 hours per week and a variable monthly monetary award.", status: "Last cycle closed", deadline: "2026-03-14T00:00:00Z", deadlineZone: "America/Los_Angeles", deadlineLabel: "Summer 2026 · Mar 13, 5 p.m. PDT",
    url: "https://www.jpl.nasa.gov/edu/internships/apply/jpl-summer-internship-program/",
    sources: [source("JPL summer requirements, materials and published deadline", "https://www.jpl.nasa.gov/edu/internships/apply/jpl-summer-internship-program/"), source("JPL internship FAQ", "https://www.jpl.nasa.gov/edu/internships/faq/")],
    steps: ["Check the official program page for a new application cycle before starting an application.", "Prepare the resume and unofficial transcript identified by the program, and follow the official application-system link.", "Describe relevant research interests and availability. Mentors may interview candidates before selecting them; an application is not an offer."],
    prepare: ["Connect your experience to a technical problem: controls, robotics, sensing, software, materials, or another relevant area. Describe what you measured or built, what failed, and how you verified an improvement.", "Plan the practical side alongside the application. Ask about the actual work arrangement, relocation costs, and award details before accepting. Do not assume housing is automatically provided or that you can participate remotely."],
    pitfall: "An evergreen program page is not proof that a current internship is open. This record intentionally shows the passed deadline.",
    materials: ["New-cycle confirmation", "Resume", "Unofficial transcript", "Full-time summer availability"],
  },
  {
    id: "goldman-sachs-summer-analyst", company: "Goldman Sachs", title: "2027 Summer Analyst Program", initials: "GS", color: "#5681a0",
    fields: ["finance", "business"], firstYear: null, years: [], preferredYears: [3], yearLabel: "Usually year 3 / penultimate", pay: "Check opening", location: "Americas · opening-specific", mode: "Role-specific",
    summary: "A nine- to ten-week undergraduate summer program, usually undertaken during the third or penultimate year of study.",
    eligibility: ["Candidates are currently pursuing a college or university degree.", "Goldman describes third or penultimate year as the usual timing, not a universal minimum-year rule.", "Business, location, and graduation-date requirements must be confirmed in the selected application."],
    timing: "Summer 2027. The program page says applications for select businesses are open; verify availability for the business and location you select.", status: "Select businesses listed open",
    url: "https://www.goldmansachs.com/careers/students/programs-and-internships/americas/2027-summer-analyst-program",
    sources: [source("Goldman Sachs 2027 Summer Analyst overview", "https://www.goldmansachs.com/careers/students/programs-and-internships/americas/2027-summer-analyst-program")],
    steps: ["Use the program's official Apply Now link to see available businesses and locations.", "Read the exact application's degree and graduation-date criteria. Choose a business because its work fits your interests, not solely because of its brand.", "Tailor your resume to that business and submit through the official student application portal. Follow any assessment instructions you receive."],
    prepare: ["Be able to explain what your chosen business does and why it fits your interests. For an analytical team, a coursework model, investment write-up, or data exercise can show how you reason; label academic and simulated work clearly.", "Prepare a concise discussion of a current business question you understand. Explain the assumptions and uncertainty rather than memorizing a confident prediction. This is editorial preparation advice, not a statement of Goldman's interview format."],
    pitfall: "A four-year junior and a penultimate-year student on a different degree timeline may not have the same graduation date. Read the actual opening.",
    materials: ["Business and location selection", "Graduation-date check", "Tailored resume", "Portal and assessment tracking"],
  },
  {
    id: "ey-internships", company: "EY US", title: "EY College Internships", initials: "EY", color: "#75621c",
    fields: ["business", "finance", "consulting"], firstYear: null, years: [], yearLabel: "Year depends on opening", pay: "Check opening", location: "US · office-specific", mode: "Role-specific",
    summary: "Summer and winter internship routes; use the individual listing to confirm service line, degree, and graduation criteria.",
    eligibility: ["EY's overview includes undergraduate and graduate internship routes. We cover undergraduate applications here.", "A universal minimum class year is not stated on the overview page.", "An assurance, tax, consulting, or other opening may have specific degree, coursework, professional-qualification, and graduation requirements."],
    timing: "EY says summer applications are generally available in the preceding fall and reviewed on a rolling basis. Availability and dates remain role-specific.", status: "Check openings",
    url: "https://www.ey.com/en_us/careers/internships-student-programs",
    sources: [source("EY internships and student programs", "https://www.ey.com/en_us/careers/internships-student-programs"), source("EY application timing FAQ", "https://www.ey.com/en_us/careers/frequently-asked-questions")],
    steps: ["Start on EY's official student-program page and follow the current US opening links.", "Choose a service line and office, then review the exact degree, coursework, and graduation requirements. Check any CPA-related education requirements if relevant.", "Submit the requested resume and information through the official recruiting site. Keep a copy of the listing and any assessment invitation."],
    prepare: ["Make your reason for choosing the service line concrete. An accounting course, student organization's budget, analytics exercise, or client-facing campus job can provide a grounded example of relevant work.", "Before selecting an office, confirm your ability to work there for the full term. Use your campus career center for application review, but do not mistake a campus event or informational conversation for an official application."],
    pitfall: "Do not treat all EY internships as having identical eligibility or assume a first-year program exists because a previous cycle had one.",
    materials: ["Specific role eligibility", "Service line and office choice", "Resume", "Academic/professional qualification review"],
  },
  {
    id: "deloitte-internships", company: "Deloitte US", title: "Deloitte College Internships", initials: "DL", color: "#4d6c24",
    fields: ["business", "finance", "technology", "consulting"], firstYear: null, years: [], yearLabel: "Year depends on opening", pay: "Check opening", location: "US · office-specific", mode: "Role-specific",
    summary: "Student internship opportunities across different teams. Confirm the current track and requirements before applying.",
    eligibility: ["Use an individual undergraduate internship opening to establish eligibility.", "Deloitte's current general internship page does not establish one minimum college year for every track.", "Service line, office, coursework, graduation date, and authorization criteria can differ. Past Discovery descriptions should not be substituted for a current opening."],
    timing: "Recruiting windows and availability depend on the current opening; no universal deadline is stated here.", status: "Check openings",
    url: "https://www.deloitte.com/us/en/careers/internships.html",
    sources: [source("Deloitte US current internship directory", "https://www.deloitte.com/us/en/careers/internships.html"), source("Deloitte US student careers", "https://www.deloitte.com/us/en/careers/student-careers.html")],
    steps: ["Follow View Open Roles from the official internship page and locate a student internship relevant to your degree.", "Read the track and office's required qualifications. Verify the posting is for the term you want, not an expired prior-year cycle.", "Complete the official application and requested assessments. Record the role identifier so you can distinguish multiple applications."],
    prepare: ["Translate a project into the team's work. Explain a problem, your analysis, what you recommended, and the evidence supporting it. For a technical team, show the implementation as well as the presentation.", "Prepare examples of collaborating through an ambiguous task. Be precise about which part you owned and how the group made a decision. Our advice is to demonstrate judgment, not to recite a generic consulting script."],
    pitfall: "An old Discovery program article does not establish eligibility for a newly posted Discovery or client-service internship.",
    materials: ["Current role and term", "Track-specific qualifications", "Resume", "Role identifier and confirmation"],
  },
  ...ADDITIONAL_PROGRAMS,
  ...NEW_PROGRAMS,
  ...VARIETY_PROGRAMS,
  ...ORGANIC_EXPANSION_PROGRAMS,
  ...CONTENT_EXPANSION_2_PROGRAMS,
  ...CONTENT_EXPANSION_3_PROGRAMS,
  ...CONTENT_EXPANSION_4_PROGRAMS,
  ...SECTOR_PROGRAMS,
  ...RESEARCH_PROGRAMS,
  ...EMPLOYERS_TECH_PROGRAMS,
  ...EMPLOYERS_FINANCE_PROGRAMS,
  ...EMPLOYERS_BUSINESS_PROGRAMS,
  ...EMPLOYERS_INDUSTRY_PROGRAMS,
  ...EMPLOYERS_HEALTH_PROGRAMS,
  ...EMPLOYERS_PUBLIC_MEDIA_PROGRAMS,
  ...EMPLOYERS_QUANT_TECH_PROGRAMS,
  ...EMPLOYERS_CAMPUS_PROGRAMS,
  ...EMPLOYERS_FALL_2026_PROGRAMS,
  ...EMPLOYERS_OCTOBER_2026_INSURANCE_PROGRAMS,
  ...OCTOBER_2026_PUBLIC_SERVICE_PROGRAMS,
  ...EMPLOYERS_OCTOBER_2026_CONSUMER_MEDIA_PROGRAMS,
  ...EMPLOYERS_OCTOBER_2026_GROWTH_PROGRAMS,
  ...EMPLOYERS_OCTOBER_2026_GROWTH_WAVE_2_PROGRAMS,
  ...EMPLOYERS_FINANCE_BANKS_WAVE_2_PROGRAMS,
  ...EMPLOYERS_FINANCE_ALTERNATIVES_WAVE_2_PROGRAMS,
  ...EMPLOYERS_FINANCE_ADVISORY_WAVE_2_PROGRAMS,
  ...EMPLOYERS_FINANCE_INVESTING_WAVE_2_PROGRAMS,
  ...EMPLOYERS_FINANCE_MARKETS_WAVE_3_PROGRAMS,
  ...EMPLOYERS_FINANCE_CORPORATE_WAVE_3_PROGRAMS,
  ...EMPLOYERS_FINANCE_PRIVATE_MARKETS_WAVE_3_PROGRAMS,
  ...EMPLOYERS_TECH_ENGINEERING_WAVE_4_PROGRAMS,
  ...EMPLOYERS_HEALTH_CONSUMER_WAVE_4_PROGRAMS,
  ...EMPLOYERS_INDUSTRIAL_CONSUMER_WAVE_5_PROGRAMS,
  ...EMPLOYERS_CONSUMER_INDUSTRIAL_WAVE_6_PROGRAMS,
  ...EMPLOYERS_LIFE_SCIENCES_WAVE_7_PROGRAMS,
  ...EMPLOYERS_STUDENT_BRANDS_WAVE_8_PROGRAMS,
  ...EMPLOYERS_TRAVEL_HOSPITALITY_WAVE_9_PROGRAMS,
  ...EMPLOYERS_CONSUMER_FOOD_WAVE_10_PROGRAMS,
  ...EMPLOYERS_TELECOM_MEDIA_WAVE_11_PROGRAMS,
  ...EMPLOYERS_INFRASTRUCTURE_WAVE_12_PROGRAMS,
  ...EMPLOYERS_DESIGN_ENVIRONMENT_WAVE_13_PROGRAMS,
  ...EMPLOYERS_ARCHITECTURE_WAVE_14_PROGRAMS,
  ...EMPLOYERS_CONSULTING_WAVE_15_PROGRAMS,
  ...EMPLOYERS_ACCOUNTING_ADVISORY_WAVE_16_PROGRAMS,
  ...EMPLOYERS_ACCOUNTING_ADVISORY_WAVE_17_PROGRAMS,
  ...EMPLOYERS_POLICY_RESEARCH_WAVE_18_PROGRAMS,
  ...EMPLOYERS_SPORTS_WAVE_19_PROGRAMS,
  ...EMPLOYERS_AEROSPACE_WAVE_20_PROGRAMS,
  ...EMPLOYERS_INSURANCE_WAVE_21_PROGRAMS,
  ...EMPLOYERS_REAL_ESTATE_WAVE_22_PROGRAMS,
  ...EMPLOYERS_MARKETING_WAVE_23_PROGRAMS,
  ...EMPLOYERS_INTERNATIONAL_AFFAIRS_WAVE_24_PROGRAMS,
  ...EMPLOYERS_ENVIRONMENT_CONSERVATION_WAVE_25_PROGRAMS,
  ...EMPLOYERS_LOGISTICS_WAVE_26_PROGRAMS,
  ...EMPLOYERS_CLOUD_SOFTWARE_WAVE_27_PROGRAMS,
  ...EMPLOYERS_PRODUCT_SOFTWARE_WAVE_28_PROGRAMS,
  ...LAB_PROGRAMS,
  ...RESEARCH_PROGRAMS_2,
  ...PUBLIC_PROGRAMS,
].map(program => {
  const addMarketing = MARKETING_EXISTING_PROGRAM_IDS.includes(program.id);
  const addInternationalAffairs = INTERNATIONAL_AFFAIRS_EXISTING_PROGRAM_IDS.includes(program.id);
  let fields = program.fields;
  let guideSlugs = program.guideSlugs;
  if (addMarketing && !fields.includes("marketing")) fields = [...fields, "marketing"];
  if (addInternationalAffairs && !fields.includes("international-affairs")) fields = [...fields, "international-affairs"];
  if (addMarketing && !(guideSlugs || []).includes("how-to-get-a-marketing-or-advertising-internship")) guideSlugs = [...(guideSlugs || []), "how-to-get-a-marketing-or-advertising-internship"];
  if (addInternationalAffairs && !(guideSlugs || []).includes("how-to-get-an-international-affairs-internship")) guideSlugs = [...(guideSlugs || []), "how-to-get-an-international-affairs-internship"];
  return {
    ...program,
    fields,
    guideSlugs,
    verified: program.verified || VERIFIED,
    seoTitle: program.seoTitle || PROGRAM_SEO[program.id][0],
    seoDescription: program.seoDescription || PROGRAM_SEO[program.id][1],
  };
});

// Year-hub titles and descriptions state how many programs an official source
// confirms for that year, so the headline always matches the list on the page.
const yearInventory = id => { const list = PROGRAMS.filter(p => p.years.includes(id)); return { count: list.length, paid: list.filter(p => p.pay === "Paid").length }; };
const [Y1, Y2, Y3, Y4] = [1, 2, 3, 4].map(yearInventory);
export const YEARS = [
  { id: 1, slug: "freshman-internships", updated: "2026-10-18", name: "First-year", short: "1st year", color: "#d9f99d", title: `Freshman Internships: ${Y1.count} Programs Open to First-Years`, description: `${Y1.count} internships and early-college programs whose official sources confirm they accept first-year students (${Y1.paid} paid), with eligibility rules, dates and how to apply.`,
    intro: "You do not need to wait until junior year to start looking. Begin with programs that explicitly accept early-college students, then check any coursework or enrollment conditions before spending time on an application.",
    sections: [["Start with evidence, not a long work history", "A lab report, small app, campus job, club event, or volunteer project can explain what you can do. Write down the task, your contribution, and the result. Never rename a class exercise as a professional internship."], ["Year one is not the whole eligibility test", "Explore Microsoft focuses on the first two college years. DOE programs require a completed semester and specific credits, so a student in their first fall semester may not yet qualify. Research sites can set their own additional rules."], ["Make a manageable first shortlist", "Choose opportunities whose dates, location, citizenship rules, and costs fit your situation. Use campus research and career resources alongside these national programs. Save a few realistic choices and finish the strongest applications first."], ["Where first-year students actually get in", "The realistic routes are narrower than the internet suggests, and knowing them saves months. Programs designed explicitly for early-college students are one. Undergraduate research at your own institution is another, and it is badly underused — faculty often take first-years who simply asked. Campus jobs with real responsibility, local organisations and non-profits that never post nationally, and short early-insight programs in finance round it out. A national program aimed at penultimate-year students is not where your first yes is likely to come from."], ["What counts as evidence when you have none", "Every applicant at this stage is in the same position, and reviewers know it. What distinguishes an application is the ability to describe something concretely: a lab report where you explain what the data actually showed, a small piece of software that works, an event you helped run and what went wrong, a class project you would now approach differently. Specificity is the whole game. Never relabel a class exercise as professional experience — describing it accurately as coursework is both honest and perfectly acceptable."], ["Use the resources already attached to your tuition", "Your careers service, your academic adviser, departmental noticeboards, and faculty office hours are free, largely unused by first-years, and connected to opportunities that never reach a job board. Ask your adviser which students in your department found something last summer and how. Ask a professor whose subject you enjoy whether their group takes undergraduates. These conversations are how a large share of first-year placements actually happen."]], faqs: [["Is it too early to apply for anything?", "No, but be selective. Some programs take first-years explicitly and some do not; this directory labels which where the publisher states it. Applying to a handful you are genuinely eligible for beats a long list you are not."], ["Will I be rejected just for being a first-year?", "For programs that require completed credits or a later graduation window, eligibility is the deciding factor rather than a judgment about you. That is why checking the stated requirements first saves so much effort."], ["What if I get nothing this summer?", "That is a normal outcome and not a verdict on later years. A course, a personal project, a summer job, or research with a professor at your own institution all give you something concrete to describe next time, which is exactly what this year is short of."], ["Can freshmen get internships?", "Yes, though fewer programs take first-year students, and many that do were designed for them. Every program in the confirmed list on this page has an official source saying first-years can apply; for anything else, the posting's graduation-date rule decides."], ["I'm a first-year applying for next summer. Where else should I look?", "Check the sophomore page too. A program for rising sophomores means a student who has finished first year by the summer, and this directory files it under the year you will be entering, so some of those programs fit you even though they appear there."], ["When should first-year students apply?", "Often earlier than expected. Several early-college programs recruit in the fall or winter before the summer, and some windows are short: NVIDIA Ignite's 2027 window was October 5 to 18, 2026. Check each guide's published dates and the deadline calendar."]],
  },
  { id: 2, slug: "sophomore-internships", updated: "2026-10-18", name: "Sophomore", short: "2nd year", color: "#c9e9ff", title: `Sophomore Internships: ${Y2.count} Programs for Second-Years`, description: `${Y2.count} internships whose official sources confirm second-year students can apply (${Y2.paid} paid), including sophomore-only programs, with eligibility, dates and application steps.`,
    intro: "Sophomore year is a useful time to move from exploring fields to testing one in practice. You can still consider early-college programs while adding research and technical opportunities that need completed coursework.",
    sections: [["Do not miss early-college windows", "Programs limited to the first two years are different from programs with a minimum of year two. Explore Microsoft may fit a sophomore; it should not be assumed available again in junior year. Confirm which year the opening uses: application time or internship start."], ["Use a course to demonstrate a skill", "Choose one substantial assignment and improve it before listing it. Test your code, check a model's assumptions, or explain an experiment's limitations. Include a clear description and a link only if the work is appropriate to share."], ["Compare the full commitment", "A semester laboratory appointment can overlap with classes, and an on-site placement may involve travel and housing. Ask your adviser about academic scheduling and compare the practical details before committing."], ["A good year to test a field rather than commit to one", "Second year is when a vague interest can become an informed one, and the cheapest way to find out you dislike something is a summer rather than a career. If you are between two directions, choosing the placement that teaches you more about the one you know least is usually the better investment. Nothing about a second-year placement locks you in, and employers do not read one summer as a permanent declaration."], ["Do not assume the early-college window stays open", "Programs built for the first two years of study are a distinct category, not a minimum you can return to later. If a program states first- and second-year eligibility, this may be your last cycle for it. Check whether eligibility is assessed at application or at the internship start date, because those can fall in different academic years for the same person, and that detail decides whether you are inside the window."], ["Build the thing you will talk about next year", "Penultimate-year recruiting arrives sooner than it feels, and the evidence you bring to it is largely what you build now. One substantial project, one role with real responsibility, or one piece of research you can explain properly does more for next year's applications than several shallow entries. Choose with next year's conversation in mind."]], faqs: [["Should I apply to first-year programs as a sophomore?", "Check each one. Some accept both first- and second-year students, some are first-year only. The eligibility line on the official page decides, and this directory records the accepted years where a publisher states them."], ["Is it a problem that I had no internship last summer?", "No. Most students do not. What matters is being able to describe what you did do — coursework, a job, a project, research — clearly and specifically."], ["How many applications is reasonable?", "Enough that each one is actually finished and specific. A smaller number of complete, tailored applications generally outperforms a long list submitted thinly, particularly where essays or references are involved."], ["Are there internships just for sophomores?", "Yes. Some programs are built for second-year students and will not take you again as a junior, so a sophomore-only program is worth prioritizing this year. Each guide on this page states which years its official source accepts."], ["When should sophomores apply for summer internships?", "Usually in the fall and winter before the summer, and some finance and technology programs open as early as late summer. Use each guide's published dates rather than assuming spring is the season."], ["Can a sophomore apply to junior-level internships?", "Only where the posting allows it. Many large programs set a graduation window aimed at penultimate-year students; if your expected graduation date falls inside that window, the date matters more than your class label."]],
  },
  { id: 3, slug: "junior-internships", updated: "2026-10-18", name: "Junior", short: "3rd year", color: "#ffd8c8", title: `Junior Internships: ${Y3.count} Programs for College Juniors`, description: `${Y3.count} internships whose official sources confirm college juniors can apply (${Y3.paid} paid), plus how graduation windows and penultimate-year rules decide the rest.`,
    intro: "Junior year often aligns with penultimate-year summer recruiting on a four-year degree, but graduation dates are more reliable than class labels. Build your shortlist around the actual opening's degree timeline.",
    sections: [["Check the graduation window", "Goldman Sachs describes its Summer Analyst program as usually taken in the third or penultimate year. That is guidance, not a guarantee that every junior qualifies. Accelerated degrees, transfer credits, and co-op schedules can change the fit."], ["Show depth in one relevant area", "Select work that matches the team's tasks. Explain an analytical decision, a tested design, or a substantial project contribution. A focused resume with evidence is easier to evaluate than an unrelated list of every campus activity."], ["Track assessments and term availability", "After applying, check the employer portal and messages for assessments or scheduling requests. Keep copies of the posting and your application. Return offers are possible outcomes of some programs, not a promise made by this directory."], ["The calendar is the thing most juniors get wrong", "In several sectors, recruiting for the following summer opens during the preceding autumn and closes on rolling review well before any stated deadline. Finance, consulting and large technology employers are the usual examples. If you wait until the spring term to start, the cohort may already be full. Build the shortlist early, have a resume ready before windows open, and check official pages rather than waiting for an announcement to find you."], ["Depth is now worth more than breadth", "Earlier years reward exploring. This one rewards being able to go deep on something. Reviewers will ask you to explain a project, a decision, or an analysis in detail and will follow up on the answer. One piece of work you understand thoroughly — including its limitations — is more persuasive than a longer list you can only describe at surface level."], ["Know what a return offer is and is not", "Some employers use the penultimate-year summer as their main pipeline into graduate hiring, and a return offer can follow. That is a possible outcome of some programs, never a promise, and no directory can tell you the odds. It is a fair thing to ask a recruiter about directly — how often it happens and what the timeline looks like — and a reasonable factor in choosing between placements."]], faqs: [["What if I am not on a standard four-year degree?", "Then your graduation date matters more than the word junior. Penultimate-year language maps onto graduation windows, not class labels, and accelerated, transfer and extended programs break the mapping. Work from the expected graduation window the posting names."], ["Have I missed the deadlines if it is already spring?", "Not necessarily. Sectors differ a great deal, and research, government, non-profit and smaller employers often recruit far later than large corporate programs. Check current openings rather than assuming the season is over."], ["Does a return offer mean I stop applying?", "Only once you have one in writing and have accepted it. Until then, keep other applications moving — an expected offer is not an offer."], ["When do junior-year internships open?", "Earlier than many students expect. Large finance, technology and government programs in this directory open applications from late summer through the fall for the following summer, and several close on a rolling basis, so check each guide's dates now rather than in spring."], ["What does 'penultimate year' mean?", "The second-to-last year of your degree. On a four-year bachelor's that is usually junior year, but a five-year program, transfer credits or early graduation change it, which is why many employers state a graduation window instead."]],
  },
  { id: 4, slug: "senior-internships", updated: "2026-10-18", name: "Senior", short: "4th year", color: "#e4d8ff", title: `Senior Internships: ${Y4.count} Programs for College Seniors`, description: `${Y4.count} internships whose official sources confirm seniors can apply (${Y4.paid} paid), with the return-to-school and graduation-date rules that decide whether a final-year student fits.`,
    intro: "A senior can still be an undergraduate applicant, but a graduation date can close an internship route before the placement starts. Check student status for both application and participation, not just today's class year.",
    sections: [["Read the enrollment rule literally", "Some openings require another term of study after the internship. Research sites may require undergraduate status throughout participation. A program accepting undergraduates is not automatic confirmation for someone graduating before its start."], ["Calculate remaining time", "NASA Pathways requires the ability to complete at least 480 work hours before finishing your degree. A final-semester applicant needs a real schedule, not just a qualifying GPA. Discuss leave, credit, and graduation timing with your academic adviser."], ["Separate internships from graduate jobs", "This board covers current-college pathways. If a role's timing does not fit, use the employer's graduate recruiting route instead. A full-time graduate opening is not relabeled as a senior internship here."], ["Work out which thing you are actually eligible for", "By final year the genuine question is often whether a given opening is an internship you can still take or a graduate role you should be applying to instead. Many internships require you to be enrolled throughout, or to return to study afterwards, which a student graduating in the spring cannot satisfy. Read that condition first. Where the internship route does not fit, the employer's graduate recruiting page is usually the right door, and this directory does not relabel full-time graduate openings as senior internships."], ["Time it around graduation honestly", "If an internship runs past your graduation date, or requires a minimum number of work hours before you finish, do the arithmetic before applying and talk to your academic adviser about it. Some students delay graduation deliberately to remain eligible, and that is a real decision with financial and visa implications rather than a technicality. Decide it deliberately rather than discovering it after an offer."], ["If the internship route has closed, there are still good moves", "A final-year student who cannot take an internship is not out of options. Graduate schemes, entry-level roles, research assistant positions, fellowships, and part-time or term-time work in a relevant setting all build the same evidence. Your careers service is set up for exactly this transition, and asking them early in the final year is far more useful than asking in the last term."]], faqs: [["Can seniors do internships at all?", "Some, yes — but read the enrollment condition carefully. Programs requiring continued study after the placement will not fit a student graduating first, and that is an eligibility rule rather than a preference."], ["Should I be applying to graduate roles instead?", "Often, yes, and frequently to both. Graduate recruitment usually runs on its own calendar, commonly beginning in the final autumn term, so it is worth mapping both timelines side by side."], ["Is it too late to build experience?", "No. A final-year project, a research assistantship, part-time work in a relevant setting, or a substantial piece of independent work all count, and all can be described in exactly the same concrete way an internship would be."], ["Can I intern after I graduate?", "Sometimes. Many programs require you to return to school after the internship, which rules out a spring graduate, while a few accept recent graduates or students continuing to a graduate program. Read each guide's enrollment rule before applying."], ["Do senior internships lead to full-time jobs?", "Some employers describe their internship as a route into full-time hiring, but that is never a promise. Treat a return offer as possible, keep graduate-role applications moving, and stop only once you have accepted a written offer."]],
  },
];

export const FIELDS = [
  INSURANCE_FIELD,
  ...ADDITIONAL_FIELDS.map(field => field.id === "operations" ? {
    ...field,
    updated: "2026-10-23",
    title: `${PROGRAMS.filter(program => program.fields.includes("operations")).length} Supply Chain & Logistics Internships`,
    description: `Compare ${PROGRAMS.filter(program => program.fields.includes("operations")).length} sourced college internships in supply chain, logistics, transportation, procurement, fulfillment and operations analytics.`,
    guideSlugs: ["how-to-get-a-supply-chain-or-logistics-internship", ...(field.guideSlugs || [])],
  } : field),
  { id: "technology", name: "Technology", title: "Technology Internships for College Students", description: "Software, data, and technical internship pathways with college-year eligibility and practical application guidance.", intro: "Choose the work before choosing the company: software development, data analysis, research computing, and technical operations call for different evidence.", sections: [["Decide which kind of technical work you want", "Software engineering, data analysis, research computing, IT and technical operations, and product or QA work all sit under the same heading and reward completely different evidence. Read what an opening actually asks you to do before deciding it fits. A student who can say they want to work on backend services because of a specific project they built is easier to place than one who says they are interested in technology, and the narrowing also makes your own shortlist far shorter and more finishable."], ["Build one thing you can explain end to end", "One small project you understand completely beats five you half-finished. Be able to say what problem it solves, who would use it, why you chose the approach, what you would do differently, and how you know it works. A README that explains setup and a couple of tests do more for you than extra features. Keep anything subject to academic-integrity rules, and any private or scraped data, out of a public repository — a reviewer noticing that is a much worse outcome than a thinner portfolio."], ["Read requirements as two separate lists", "Technical postings mix required qualifications with preferred ones, and students disqualify themselves on the second list constantly. Separate them. For each required item, decide honestly whether you have used it, studied it, or only read about it. For preferred items, a nearby language or a related framework is usually fine to say so. Never list a tool on a resume you could not discuss for a minute, because technical interviews find that out quickly and it costs you more than the gap would have."], ["Expect an automated stage, and prepare for its format", "Many technical internships put a timed coding exercise, an online assessment, or recorded video answers between the application and a human. Practice in the language you will actually use, get comfortable working without your usual editor and autocomplete, and rehearse explaining your reasoning aloud while you type. Follow whatever the employer says about permitted tools and assistance, including whether any AI help is allowed — those rules vary, and you agree to them before you start."], ["Classes and clubs are real evidence here", "If you have no internship yet, the honest raw material is coursework, a hackathon, a campus job automating something tedious, a contribution to an open-source project, or a group assignment where you owned a component. Describe your own contribution, the constraint you worked under, and what the result showed. The gap between a first-year applicant and a third-year one is usually depth of explanation rather than a longer list of technologies."]], faqs: [["Do I need a computer science degree?", "Often no, but the opening decides. Many technical internships accept any major with demonstrable skills, while some specify a degree or coursework. Read the individual posting rather than assuming, and check whether the requirement is worded as required or preferred."], ["How many projects should be on my resume?", "Two or three you can discuss in depth is a reasonable target. A long list you cannot explain works against you in an interview, and reviewers are reading quickly — the ones nearest the top get the attention."], ["Are open-source contributions worth including?", "Yes, when they are genuinely yours and you can explain them. A small merged fix you understand is more persuasive than a large repository you forked. Link to the specific contribution rather than a profile page."]] },
  { id: "engineering", name: "Engineering", title: "Engineering Internships for College Students", description: "Compare engineering and laboratory internship programs, completed-credit rules, and preparation advice for undergraduate applicants.", intro: "Engineering experience can begin in a classroom lab or design team. The useful question is what you designed, measured, tested, or improved—and how you know it worked.", sections: [["Explain what you designed, measured, or verified", "Engineering applications turn on evidence of method, not on the scale of the project. Name the constraint, the approach you chose, how you tested it, and what the measurement told you. A prototype that failed still demonstrates sound reasoning if you can explain what you learned and what you changed. Be precise about your own role: working under supervision is normal and expected for an undergraduate, and implying you operated equipment independently when you did not is easy to catch."], ["Coursework, labs and design teams count", "Formula and rocketry teams, senior design projects, laboratory sequences, and machine-shop training are all legitimate evidence, and reviewers who hire undergraduates know exactly what they involve. Describe the subsystem you owned, the interfaces you had to respect, and the trade-off you made. A student who can explain why a tolerance mattered is more convincing than one who lists the team name and leaves it there."], ["Check the site, the training, and the schedule early", "Hardware and laboratory work usually has an on-site component, and some programs state that explicitly. Before you invest in the application, check where the work happens, whether safety or security training is required before you start, what the term dates are, and whether housing or relocation support exists. These constraints eliminate options faster than anything on your resume, so applying them first saves the most time."], ["Discipline requirements are often specific", "Mechanical, electrical, civil, chemical, materials and industrial routes frequently name particular coursework, software, or accreditation expectations. Read for those before assuming an engineering opening is open to any engineering student. Where a posting names a tool you have not used, say what you have used instead and how quickly you expect to pick it up — that reads better than silence or an inflated claim."], ["Hardware timelines are not software timelines", "Recruiting for hardware, aerospace, energy and manufacturing roles often runs on a different and sometimes later calendar than software, and security or citizenship screening can add weeks between an offer and a start date. Plan for a longer process, keep the official posting saved, and do not read a slower response as a decision."]], faqs: [["Is a low GPA disqualifying?", "It depends on the program. Some state a minimum explicitly and enforce it; many do not state one at all. Check the posting, and where no minimum is given, let the rest of the application carry the weight rather than ruling yourself out in advance."], ["Do I need experience with professional CAD or simulation tools?", "Not usually for an undergraduate internship. Coursework exposure is normally enough to state honestly. Name the tools you have actually used and at what level, and treat an unfamiliar tool in a posting as something to learn rather than a reason not to apply."], ["Can first- and second-year students apply?", "For some programs, yes. Others require completed credits or specific coursework first. This directory labels the accepted years where a publisher states them and says so plainly when it does not — an unstated minimum is a question for the opening, not an automatic no."]] },
  { id: "research", name: "Research", title: "Research Internships for Undergraduates", description: "Explore NSF REU, NASA, JPL, and DOE research pathways with eligibility checks, application steps, and source links.", intro: "An undergraduate research application should explain what you want to investigate and why the lab or site is the right setting. It is not just a list of institutions you admire.", sections: [["Start from the research, not the institution", "An undergraduate research application should explain what you want to investigate and why this site is the right setting for it. Read the actual project or theme descriptions and find two or three questions that genuinely hold your attention. Naming a specific theme and connecting it to a course or project you have done is the single strongest thing you can do, and it separates a real application from a list of prestigious places you admire."], ["Understand how the selection usually works", "Many research programs are not decided by one central committee. Individual investigators or laboratory groups often select their own students from the pool, which is why a statement written for the site in general can land nowhere in particular. Where a program invites you to name or contact potential mentors, follow its instructions exactly — and where it tells you not to contact them, that instruction matters just as much."], ["References are part of the deadline, not after it", "Research applications commonly require one or two recommendation letters, and in many systems your submission is not complete until those arrive. Ask early, give each referee the program description, the deadline, the submission link and a short reminder of what you worked on together. Track their deadline separately from your own, and check the portal to confirm each letter landed rather than assuming it did."], ["Check citizenship, enrollment and site restrictions first", "Research programs at federal agencies and national laboratories frequently carry citizenship, enrollment or site-access conditions that no amount of preparation can work around, and some require you to remain enrolled throughout. Read those before writing anything. It is far better to discover a restriction in ten minutes than after drafting a personal statement."], ["A stipend is a stipend, not a salary", "Research awards are usually a fixed stipend for a defined term, sometimes with housing or travel support, sometimes without. Read what the published figure actually covers, when it is paid, and whether support is provided directly or reimbursed later. A reimbursement that arrives in August does not help with a deposit due in May, so build the real budget before accepting."]], faqs: [["Do I need previous research experience?", "Frequently not — many undergraduate programs exist specifically to provide a first research experience. A carefully described course project and a clear account of what interests you can be enough. What rarely works is claiming familiarity with methods you have only read about."], ["Should I email a professor before applying?", "Only if the program says to. Some explicitly invite contact with potential mentors and some explicitly discourage it. Follow the program's own instructions, and if you do write, be specific about which work of theirs interests you and keep it short."], ["Can I apply to several programs at once?", "Generally yes, and for site-based programs each site is usually its own application with its own materials and dates. Track them separately rather than treating one submission as covering the group."]] },
  { id: "finance", name: "Finance & Accounting", title: "Finance and Accounting Internships for College Students", description: "Compare finance and accounting internship pathways, penultimate-year guidance, and role-specific degree requirements.", intro: "Banking, assurance, tax, and corporate finance are different routes. Identify the team's work, degree requirements, and office before building an application.", sections: [["These are genuinely different jobs", "Investment banking, sales and trading, asset and wealth management, corporate finance, audit and assurance, tax, and risk all recruit undergraduates and all want different things. The work, the hours, the skills and often the recruiting calendar differ. Decide which one you are applying for before writing anything, because a generic finance application reads as undirected to every one of them."], ["Your graduation date matters more than your class label", "Much of this sector recruits around the penultimate year of study, which is often but not always junior year. Accelerated degrees, transfer credit, co-op schedules and five-year programs all break the mapping. Work from the expected graduation window the posting names rather than from a general rule about juniors, and put your own expected graduation month and year somewhere obvious on your resume."], ["Know the difference between an insight program and a summer internship", "Many firms run short early-insight, spring-week or first-year discovery programs alongside their main summer internships. They have separate eligibility, separate applications and much earlier deadlines, and they are often the realistic route for a first- or second-year student. Do not assume a firm has nothing for you because its summer analyst role targets penultimate-year students."], ["Bring evidence that suits the service line", "For markets or corporate finance roles, be ready to explain the assumptions behind an analysis you actually did and where it could be wrong. For assurance and tax, connect coursework and any professional qualification plans to the work. Label simulated or coursework portfolios clearly as such. Never present invented returns or overstate your responsibility on a team project — these interviews probe exactly there."], ["The calendar runs earlier than most students expect", "Applications for a summer frequently open a year or more ahead, and many run on rolling review that closes when the cohort fills. Build your shortlist during the preceding academic year, have a resume ready before the window opens, and treat an early submission as genuinely worth something in this sector specifically."]], faqs: [["Do I need to be a finance or accounting major?", "Often not for the broader roles, though some openings name a degree or specific coursework, and accounting routes more often do. Read the individual posting; where a major is preferred rather than required, relevant coursework and a clear reason for your interest can carry it."], ["What is rolling review, and does applying early help?", "Rolling review means applications are assessed as they arrive rather than all at once after a deadline, so a program can fill before its stated closing date. Where a posting describes rolling recruitment, submitting early genuinely matters."], ["Are first-year students eligible for anything?", "Sometimes, through early-insight and discovery programs rather than summer analyst roles. Check each firm's student pages for a first-year route, and check its eligibility separately from the main summer program."]] },
  { id: "business", name: "Business", title: "Business Internships for College Students", description: "College business internship routes with service-line selection, eligibility checks, and actionable application preparation.", intro: "Business is a broad category, not one job. Operations, consulting, finance, and public-sector administration reward different forms of practical evidence.", sections: [["Business is a category, not a job", "Operations, supply chain, marketing, human resources, strategy, consulting, general management and public administration all appear under this heading, and each rewards a different kind of evidence. Pick the function before the employer. A student who can say why operations interests them and point at something they organized is far easier to evaluate than one applying to business roles generally."], ["Translate campus work without inflating it", "A society budget you managed, an event you ran, a shift rota you owned, a customer-facing job, or a process you improved are all legitimate and reviewers read them fluently. State the real scope — how many people, over what period, with what constraint — and the outcome you can defend. Accurate and modest reads as credible; a vague claim of leadership does not."], ["Understand rotational versus fixed placements", "Some programs rotate you through several functions and some place you on one team for the whole term. Neither is better, but they suit different people and the application often asks you to express a preference. Read which one an opening is, and if it asks for a function preference, give a real one with a short reason rather than saying you are open to anything."], ["Choose the location deliberately", "Many business internships are tied to a specific office, and some require you to be there for the full term. Confirm you can actually live and work there for those dates before applying, including the cost of doing so. A placement you cannot attend in full is not an option, however well the application goes."], ["Numbers only help when you measured them", "Quantifying is good advice that is often followed badly. Use a figure when you genuinely recorded a before and after; otherwise describe the scope accurately and leave it there. An invented percentage is a straightforward thing for an interviewer to unpick, and losing credibility on one bullet casts doubt over the rest."]], faqs: [["Does my major matter for business internships?", "Frequently less than students expect — many openings accept any discipline. Some name a degree or coursework, particularly in accounting, analytics and supply chain. Read the posting, and where a major is preferred rather than required, make your reason for interest concrete."], ["I have only retail or hospitality jobs. Is that useful?", "Yes. Customer-facing work demonstrates reliability, communication under pressure, and handling things going wrong, and employers hiring undergraduates understand what those roles involve. Describe the responsibility accurately rather than dressing it up."], ["Is a cover letter expected?", "Follow the posting. Where one is requested, write something specific to that function and employer. Where it is optional, a short and genuinely specific letter can add context a resume cannot — a generic one adds nothing and costs you time."]] },
];

// The pay guide answers its title question from the directory's own sourced
// pay values, so the figures follow the catalog instead of going stale.
const payCount = value => PROGRAMS.filter(p => p.pay === value).length;
const listOf = names => names.length < 3 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
const unpaidPublishers = listOf([...new Set(PROGRAMS.filter(p => p.pay === "Unpaid").map(p => p.company))]);
const PAY_ANSWER = `Many do, but not all, and "paid" covers several different arrangements. Of the ${PROGRAMS.length} programs in this directory, ${payCount("Paid")} are paid according to their official sources, whether as an hourly wage, a salary, a stipend or a research award. The publisher's own description makes ${payCount("Unpaid")} unpaid: the programs from ${unpaidPublishers}. For the other ${PROGRAMS.length - payCount("Paid") - payCount("Unpaid")}, the official sources we reviewed state no pay for the program as a whole; it may depend on the opening, the host or the written offer, so we label them to check rather than guess. Whatever the label, the amount that counts is the one in the written offer for your role, set against what the term will cost you.`;

export const GUIDES = [
  ...GUIDE_EXPANSION,
  ...GUIDE_EXPANSION_2,
  ...GUIDE_EXPANSION_3,
  ...GUIDE_EXPANSION_4,
  ...GUIDE_EXPANSION_5,
  ...GUIDE_EXPANSION_6,
  ...GUIDE_EXPANSION_7,
  ...POLICY_RESEARCH_GUIDES,
  ...SPORTS_GUIDES,
  ...AEROSPACE_GUIDES,
  ...INSURANCE_GUIDES,
  ...REAL_ESTATE_GUIDES,
  ...MARKETING_GUIDES,
  ...INTERNATIONAL_AFFAIRS_GUIDES,
  ...ENVIRONMENT_CONSERVATION_GUIDES,
  ...LOGISTICS_GUIDES,
  ...ADDITIONAL_GUIDES,
  { slug: "how-to-apply-for-an-internship", updated: "2026-09-20", title: "How to Apply for a College Internship", description: "A practical internship application process: verify eligibility, prepare evidence, submit through the official portal, and track the next step.", intro: "Start by checking whether you can actually participate. A polished application cannot fix an incompatible graduation date, required credit count, citizenship restriction, or work schedule.", sections: [
    ["1. Turn the listing into a checklist", "Before writing anything, copy the essentials out of the posting: employer, role title and identifier, term dates, location and work arrangement, deadline with its time zone, and the required documents. Separate required qualifications from preferred ones — they are not the same test, and many students disqualify themselves over a preferred item. Check whether class year is assessed when you apply or when the internship begins, because those can be different years for the same person. Where a mandatory rule is genuinely unclear, use the employer's published contact route rather than guessing."],
    ["2. Confirm you can actually participate", "This is the step most worth doing early, because no amount of polish fixes an incompatible graduation date, a credit requirement you have not met, a citizenship or authorization restriction, or a term you cannot attend in full. Read the eligibility wording literally and check the conditions that apply during the placement as well as at application — some programs require you to remain enrolled throughout, or to return to study afterward. If something here rules you out, that is useful information gained in ten minutes rather than ten hours."],
    ["3. Pick the evidence for this specific work", "Choose two or three examples from classes, projects, jobs, research, or campus activities that connect to what the role actually involves. For each, be able to state the task, what you personally did, and the outcome. Use accurate numbers only where you measured something. Make the connection to the role visible without copying phrases from the posting into your resume — a reviewer can tell, and it reads as padding rather than fit."],
    ["4. Assemble the documents the way they asked", "Follow the format, page limits, naming conventions, and upload requirements exactly. Export to PDF unless told otherwise and open the exported file to check nothing shifted. Verify your contact details and graduation date. If transcripts or references are required, start those early — they depend on other people and other systems. Write a cover letter when it is requested or when it genuinely adds context the resume cannot; it does not substitute for any required part of the application."],
    ["5. Submit through the official route", "Apply on the employer's own portal, reached from their official page rather than an aggregator link. FirstInternships is an independent guide: we do not accept applications, submit on your behalf, or store your resume. Before submitting, review the uploaded files and answer every required question. Afterward, save the confirmation, the role identifier, and a copy of the posting, because listings are edited and taken down and you will want the original when preparing for an interview."],
    ["6. Track what happens next", "Record the submission date and watch for assessments, interview requests, or additional document requests — several employers set short response windows and route mail that lands in spam. Use your saved list here as a personal planning record; the employer portal remains the authoritative source for your actual status. Then keep going. Applying to a realistic number of well-matched programs, rather than waiting on any single one, is what makes the timeline work in your favor."],
  ] },
  { slug: "internship-resume-with-no-experience", updated: "2026-09-20", title: "How to Write an Internship Resume With No Experience", description: "Use coursework, campus jobs, and projects to build an honest college internship resume with clear evidence and a graduation date.", intro: "No previous internship does not mean no relevant experience. Your task is to make what you have done understandable, without dressing class work up as professional employment.", sections: [
    ["Start with education and one real project", "Lead with your degree, institution, and expected graduation month and year — that last detail decides eligibility for many programs and reviewers look for it immediately. Then choose relevant coursework or, better, one substantial project you can discuss in depth. For a team project, say plainly what you did rather than what the group produced. Include a link only if the work is genuinely shareable, loads without a login, and explains itself to someone arriving cold; a broken or empty link is worse than none."],
    ["Write bullets around an action and a result", "Replace worked on a data project with what you actually did and what it showed. For example: cleaned a course dataset of 4,000 records, compared two forecasting approaches, and documented their error on a held-out sample. That is an illustrative sentence, not something to claim unless it describes your real work. Start each bullet with a verb, keep it to one or two lines, and include a number only where you genuinely measured something — an invented percentage is the easiest thing in the world to probe in an interview."],
    ["Use jobs and campus activities honestly", "Customer service, tutoring, scheduling, event organization, and running a club budget all demonstrate reliability, communication, and ownership, and reviewers know how to read them. Name the role accurately, give its real scope, and describe outcomes you can defend. A shift lead who handled a rota for twelve people has something concrete to say. What does not work is inflating the title, implying you ran something you helped with, or describing a class exercise as professional employment."],
    ["Make it easy to read and easy to verify", "Use clear section headings, consistent dates, and a restrained single-column layout — decorative templates frequently lose text when a portal parses them. Follow the employer's file instructions exactly. Proofread the exported document rather than the editor view, and check dates, spelling, links, and your own contact details; a wrong email address quietly ends an application. Leave out anything sensitive that was not asked for, including government identification numbers, your full address, a photograph, and your date of birth."],
    ["Tailor by selecting, not by inventing", "For each application, move the most relevant evidence higher and cut what distracts from it. Read the posting for the specific skills it names and make sure the matching evidence is visible in the top half of the page. If you do not have something the role requires, do not claim it — a small project you can explain properly is far more persuasive than a list of tools you cannot discuss for sixty seconds. Ask a career adviser or someone in the field to read it before you submit."],
    ["Remember what a resume is for", "It is not a complete record of everything you have done; it is an argument that you are worth a conversation. One page is right for almost every undergraduate applicant. If something does not support that argument for this particular role, it can come out — and it can go back in for a different application. Keep a longer private master document with everything, and cut each submitted version down from it rather than rebuilding from scratch every time."],
  ] },
  { slug: "when-to-apply-for-summer-internships", updated: "2026-10-21", topicSlug: "summer-2027-college-internships", title: "When Do Summer Internship Applications Open?", description: "See when summer internship applications usually open, how recruiting windows differ by field, and how to track official 2027 deadlines without guessing dates.", intro: "Summer internship applications do not share one opening date. Large employers may recruit during the preceding fall, research and public programs often follow winter calendars, and individual roles can appear at any time. Use the official opening for each program, then work backward from its requirements.", sections: [
    ["Start watching before you feel ready", "There is no single summer internship deadline, and waiting for one costs people opportunities every year. Build a shortlist during the preceding academic year and start checking official employer pages then. Structured programs at large employers often recruit early — sometimes a full year ahead for finance and technology — while research sites, smaller teams, and public-sector programs run on their own schedules, several of them in late winter or spring. Your documents should be ready before the first window you care about opens, not drafted in a rush once it does."],
    ["Tell a deadline apart from rolling review", "A deadline is a published last submission time, usually with a time zone, and it is the same for everyone. Rolling review means applications are read as they arrive and a program can close when it is full, which makes early submission genuinely worth something. An evergreen overview page describing a program in general terms is evidence of neither: it is not proof that an application is currently open. Work from the individual opening and the current cycle announcement, and treat a page with no stated date as a page to re-check rather than one with time to spare."],
    ["Work backward from your dependencies", "The parts of an application other people control set your real timeline. Transcripts have processing times. Recommenders need weeks, the program description, the deadline, and a reminder — and your submission may not count as complete until their letters arrive. Essays need a draft, a gap, and a second read. List these for each application, then set your own submission target several days before the employer cutoff so a portal problem or a slow upload is an inconvenience rather than a lost application."],
    ["Check the dates against your actual year", "Compare the full internship dates with your exam period, any required classes, commencement, and anything already committed. A placement that starts before your term ends or runs past the start of the next one needs a plan agreed with your academic adviser, not an assumption. Confirm the work arrangement, the location, and any housing or relocation support before accepting rather than after, and remember that a published term length is sometimes negotiable at the edges and sometimes not at all."],
    ["Keep closed programs on a watch list", "A passed deadline usually points at a real opportunity in the next cycle, and the requirements are often stable even when the dates are not. Save the official page, note roughly when the last cycle opened, and set a reminder to check well before that point — but never write next year's date into your calendar as though it were announced. Last year's deadline is a hint about timing, not a fact about this year, and a program can move, change, or pause without notice."],
    ["Put the whole thing on one calendar", "Applications fail on forgetting far more often than on merit. Keep every cutoff, opening date, and personal submission target in one calendar you actually look at, with the time zone written down. Add a reminder a week ahead of each, not the day before, so there is room to fix a problem. This site's deadline hub lists the cutoffs we have verified and can export them, and the timeline builder turns a target date into a workback plan — but your own calendar, checked regularly, is what makes either of them useful."],
    ["Use field patterns as planning clues, not promises", "Finance, consulting and some large technology programs can open during the summer or early fall before the internship year. Media, consumer, engineering and corporate programs often appear across fall and winter. Many structured research, government and nonprofit programs publish winter cutoffs, while smaller employers may hire closer to the term. These are broad patterns, not dates you can submit against. An employer can change its cycle, post teams separately or skip a year. Use the pattern to decide when to start checking, then replace it with the official opening date, status and deadline as soon as the current source exists."],
    ["Build a watch routine for employers with rolling postings", "For employers that post separate roles rather than one program application, save the official student or job-search page and use the employer's own alert when available. Check on a realistic schedule—weekly during the expected season is usually more sustainable than refreshing every day. Record the date you checked and the search terms or filters you used, because an empty result is only evidence about that moment. When a matching role appears, read it from the beginning: a familiar employer name does not mean the degree, location, graduation window, authorization or schedule rules match the program page you saw earlier."],
  ], example: {
    title: "A simple application-season tracker",
    text: "Program or employer: [name]\nOfficial page: [URL]\nWhat the source currently says: [open / closed / recurring overview / no current role]\nLast checked: [date]\nPublished opening: [only if announced]\nPublished deadline and time zone: [only if announced]\nMy submission target: [earlier personal date]\nDependencies: [transcript, references, portfolio, assessment]\nNext check: [date]\n\nNever roll a past deadline forward. Replace the watch-list estimate only when the publisher announces the new cycle.",
  } },
  { slug: "internship-interview-guide", updated: "2026-10-21", title: "Internship Interview Guide: Questions & Preparation", description: "Prepare for a college internship interview with a practical evidence bank, common question plan, project walkthrough, employer research and day-of checklist.", relatedGuideSlugs: ["tell-me-about-yourself-internship-interview", "why-do-you-want-this-internship-answer"], intro: "Internship interview preparation means being able to explain your work, connect it to the role and think aloud without pretending to know everything. Build a small evidence bank, practice the format the employer named and keep every example accurate.", sections: [
    ["Build a short evidence bank", "Prepare four or five examples you can use flexibly rather than memorizing an answer per question. Useful ones: solving a problem where the first approach failed, learning something unfamiliar under time pressure, working with someone you disagreed with, and handling a mistake you made. For each, know the situation in a sentence, what you personally did, what happened, and what you would do differently. The same example can answer several different questions if you know it well, which is why depth beats breadth here. This is general editorial preparation advice; the employer's own instructions determine the actual format."],
    ["Explain one project from end to end", "Expect to talk through something you have built, analyzed, or researched. Be ready with the purpose, the constraints, the approach you chose and what you rejected, and how you knew it worked. Separate your contribution from your teammates' clearly and without diminishing either. Practice the explanation on someone outside your field first, then add technical depth when asked — being able to adjust the level is itself a signal. Name a limitation honestly; a candidate who says what their project does not handle is more credible than one who claims everything worked."],
    ["Study the actual team's work", "Read the posting and the official team or program pages, and arrive with a specific reason this work interests you. 'I admire the company' is not a reason; 'the role involves X and I spent last semester on Y' is. Prepare for the format the employer described: for a technical or case assessment, use the preparation material they supply and any practice resources they permit. Do not seek leaked questions or unauthorized help — it usually breaches the terms you agree to and can end your candidacy."],
    ["Ask questions that help you decide", "You are also evaluating them. Useful questions: what an intern actually worked on last cycle, who provides supervision and how often, how feedback is given, what the team is trying to accomplish this year, and what the working schedule really looks like. Save compensation, location, travel, and enrollment conditions for the recruiter rather than the technical interviewer, and resolve them before accepting anything. Do not assume an internship carries a return offer; if that matters to you, ask directly how often it happens."],
    ["Check the practical details beforehand", "Confirm the time and time zone, the meeting link or the address, who you are meeting, and anything you were asked to bring or prepare. For a remote interview, test the platform, camera, microphone, and connection on the actual device you will use, and have a fallback — a phone number or a second network — in case something fails. Ask in advance if you need an accommodation. Arrive a few minutes early and treat everyone you meet as part of the process, because they are."],
    ["Close it out and learn from it", "Write down what you were asked and anything you learned about the role while it is fresh; it is the best preparation for the next round and for other interviews. A brief thank-you note is optional unless the employer says otherwise, and it should be short and specific rather than a second pitch. Then carry on with your other applications while you wait. If you are turned down, you can ask politely whether feedback is available — many employers cannot give it at internship volume, and that is not a reflection on your application."],
    ["Prepare the common questions without scripting them", "Have a concise opening introduction, a role-specific reason for applying, one example of teamwork, one setback or mistake, and one example of learning something quickly. Prepare bullet-point structures rather than paragraphs to memorize. For each story, know the context, your responsibility, what you actually did, the result you can support and what you learned. Expect follow-up questions about trade-offs or your individual contribution. If an example came from a group project, say where your work ended and the team's work began. The goal is not to predict every question; it is to know your evidence well enough to select and adapt it honestly."],
    ["Match your practice to the interview format", "A recruiter screen tests a different thing from a technical assessment, case interview, portfolio review, research conversation or hiring-manager panel. Use the employer's invitation and official preparation material to identify the format, length, tools and rules. For a technical task, practice explaining your reasoning and testing. For a case, structure the question and state assumptions. For research, be ready to discuss methods and limitations. For a portfolio, explain decisions rather than only showing the final artifact. Never use leaked questions, impersonation or unauthorized assistance. If the instructions are unclear, ask the recruiter what format to expect instead of guessing."],
  ], example: {
    title: "A one-page interview preparation sheet",
    text: "Role in one sentence: [what the intern actually does]\nWhy this role: [responsibility + your evidence + next capability]\n60-second introduction: [present + evidence + next]\nProject to explain: [purpose, your contribution, method, result, limitation]\nTeamwork example: [situation, your action, result, learning]\nSetback example: [what changed because of your response]\nQuestions for them: [supervision, intern work, feedback, team priority]\nPractical check: [time zone, link/address, contact, materials, backup plan]\n\nUse prompts, not a script. Every claim should be true and discussable in follow-up questions.",
  } },
  { slug: "how-to-follow-up-on-an-internship-email", updated: "2026-10-26", title: "Internship Follow-Up Email: When to Send + Template", description: "Use a concise internship follow-up email template after applying. Learn when to send it, who to contact, what to include, and when to stop following up.", category: "Interviews & follow-ups", relatedGuideSlugs: ["email-templates-for-internships", "internship-application-status-meanings", "internship-thank-you-email-after-interview"], programIds: ["nvidia-ignite", "pfizer-futures-internship", "capital-one-early-internship", "paramount-internships"], intro: "A useful internship follow-up is a short request for information after the employer's own timeline has passed. It is not a way to skip the portal, create urgency, or persuade someone to overlook a requirement. This guide helps you decide whether a follow-up is appropriate, choose the right person, write one clear message, and move on without turning silence into a full-time project.", sections: [
    ["Check the portal before you email anyone", "Open the employer's application portal and read the current status, messages, task list, and role page first. A request for an assessment, transcript, work-authorization answer, interview time, or additional form is more important than sending a follow-up. Save the role title, requisition number, application date, and any published decision timeline. If the portal says the application is under review, that is usually all the employer is prepared to share. If it says the role is closed or you were not selected, a follow-up asking for a different decision is unlikely to help. The portal remains the authoritative record even when a recruiter replies by email."],
    ["Use the employer's timeline—not a universal rule", "There is no single number of days that fits every internship process. Start with what the employer actually published: an application closing date, interview window, decision week, or statement that applications are reviewed on a rolling basis. Follow up after that milestone has passed. When no timeline exists, waiting about two full weeks after applying is a reasonable editorial default for one polite check-in, but it is not an employer rule. A rolling process can move quickly for one team and slowly for another. Weekends, holidays, campus recruiting events, and a large applicant pool can all create silence that has nothing to do with your candidacy."],
    ["Contact the person connected to your application", "The best recipient is the recruiter or coordinator who contacted you, the applicant-support address listed in the posting, or the person named in your interview schedule. Reply in the existing thread when there is one so the context stays attached. Do not guess an employee's email pattern, send the same note to several people, or message an unrelated executive because you found them on a networking site. If the posting gives no contact and the employer routes every question through the portal, respect that design. A missing contact route is not an invitation to search for private details."],
    ["Write a message that can be answered in one minute", "Put the role and requisition number in the subject line. In the body, identify yourself, state when you applied or interviewed, confirm that you remain interested, ask one narrow question about timing or next steps, and offer to provide anything else needed. That is enough. Do not repeat your cover letter, attach another resume without being asked, list every qualification, or say that you urgently need an answer because another employer is waiting unless you genuinely have a written deadline. The recipient should be able to understand the application, find it, and answer without decoding a long pitch."],
    ["Follow up after an interview differently", "After an interview, first send a brief thank-you message if the process permits it. A later status follow-up should use the timeline the interviewer gave you. If they said decisions would arrive by Friday, wait until at least the next business day before checking. Reply to the scheduling thread or recruiter rather than writing every interviewer. Mention the interview date and the role, then ask whether the decision timeline has changed. Do not ask for interview feedback while the process is still active, and do not interpret a delayed answer as a hidden rejection. Hiring teams regularly wait on approvals, headcount, scheduling, or other candidates."],
    ["Handle a real offer deadline honestly", "If another employer has given you a written offer deadline, tell the recruiter once and use the exact date. Keep the message factual: you remain interested, you have another decision due on a stated date, and you would appreciate any update the team can share. Do not invent an offer or imply one is more advanced than it is. The employer may accelerate, may say the original timeline still applies, or may be unable to decide in time. You then have to evaluate the offer you actually hold rather than the possibility you prefer. An offer-extension request belongs with the employer that made the offer, and the separate extension guide covers that conversation."],
    ["Send one follow-up, then return to your search", "One well-timed message is enough in most application situations. If there is no response, avoid sending the same note every few days. Continue applying, preparing, and checking the portal on a reasonable schedule. Send another message only when something material changes—for example, the employer asks for a document, the published decision date changes, or you receive a genuine offer deadline. This boundary protects your time as much as the recipient's. Internship recruiting is noisy, and a silent application should not stop the rest of your search."],
    ["Keep a clean record for the next conversation", "Record the application date, requisition number, portal status, published timeline, recipient, and follow-up date in your own tracker. Save the message you sent. If an interview invitation arrives weeks later, you will know which version of your resume went with the application and what the role originally said. FirstInternships' planner stores notes locally in your browser, but a spreadsheet or calendar can work too. Do not put private application notes into a public link. The goal is not to monitor the employer obsessively; it is to avoid sending duplicate messages and to be ready when a real next step appears."],
  ], example: {
    title: "Internship application follow-up email to adapt",
    text: "Subject: Application follow-up — [role title], [requisition number]\n\nHello [name or recruiting team],\n\nI applied for the [role title] internship ([requisition number]) on [date]. I remain interested in the opportunity and wanted to ask whether the team has an updated timeline for next steps.\n\nPlease let me know if I can provide anything else for my application. Thank you for your time.\n\nBest,\n[full name]\n[university] · graduating [month and year]\n[phone number, only if it is already part of your application]",
  } },
  { slug: "do-internships-pay", updated: "2026-10-01", topicSlug: "paid-college-internships", title: "Do Internships Pay? Pay, Stipends and Real Costs", description: "Do internships pay? Many do, but not all. See how often sourced programs are paid, then compare salary or stipends with housing, travel and the written terms.", intro: "‘Paid’ is a starting point, not a complete offer. An hourly salary, weekly stipend, and monthly research award can have very different practical implications.", sections: [
    ["The short answer", PAY_ANSWER],
    ["Confirm the written amount and schedule", "Read the individual posting and the written offer for the amount, the payment cadence, the expected hours, the exact dates, and any conditions attached. A program overview often describes compensation in general terms without listing a figure for the role you would actually hold, and a range shown for a whole program is not a commitment to you. Distinguish an hourly wage from a weekly stipend and from a one-off research award: they behave differently when the term runs short, when you work extra hours, or when a holiday falls inside the placement. This directory never converts an unknown figure into an estimated salary."],
    ["Work out what the term actually costs you", "Build a simple budget before comparing offers: rent for the full term plus any deposit, travel to and from the site, daily transport, food, and anything you must buy to start. Then set the pay against it. A well-paid placement in an expensive city can leave you with less than a modest one you can do from home, and a deposit due in May is a real problem even when the total works out over the summer. Ask when the first payment actually arrives — a monthly cycle can mean several weeks of costs before any money does."],
    ["Ask how support is delivered, not just whether it exists", "Housing assistance, travel support, and relocation allowances vary enormously in how they reach you. Provided directly, reimbursed after you submit receipts, paid as a lump sum in the first month, or available only to participants meeting separate conditions are four different things, and only the first helps with money you need upfront. Ask specifically what is covered, what evidence is required, and when it is paid. A reimbursement you receive in August does not pay a deposit in May."],
    ["Check the academic and practical conditions", "Confirm whether you need insurance, school approval, or a particular enrollment status to participate, and whether taking academic credit for the internship carries tuition or fees at your institution — credit is sometimes the more expensive option. Ask whether unpaid overtime is expected, what happens if the term dates shift, and what the arrangement is if you need to leave early for the academic year. Questions about wage law, tax treatment, or immigration rules need current official information and, where it matters, qualified advice; this guide is neither legal nor tax advice."],
    ["Separate an advertised program from your actual offer", "A published stipend is useful context for deciding where to apply. It is not what you are being offered until it appears in writing for your role, with your dates and your hours. Before accepting, get the terms in writing and read them. Weigh the parts that are hard to price as well: what you would actually work on, who would supervise you, whether you would learn something you want, and whether the schedule leaves room for the rest of your life. And never pay a service that offers to submit applications on your behalf."],
  ] },
  { slug: "how-to-find-internships", updated: "2026-09-20", title: "How to Find Internships and Build a Real Shortlist", description: "Find college internships by eligibility, work interests, dates, and location, then save and prioritize applications you can actually complete.", intro: "A shortlist should reduce wasted effort. Begin with eligibility and practical constraints, then compare the work—not just the employer's name.", sections: [
    ["Write down your non-negotiables first", "Before opening a single listing, record your college year, expected graduation month and year, completed credits, the weeks you are actually free, where you can live and work, and your work-authorization situation. These are the filters that remove options fastest, and applying them first saves far more time than applying them after you have written a cover letter. Check mandatory employer rules directly on the official page rather than from a summary. If a program does not state its year requirement, mark it unresolved rather than counting it as a match: an unstated minimum is a question to answer, not a green light."],
    ["Search more than one channel", "Most students search one job board and conclude the market is small. It is not — it is fragmented. Use official employer career pages, your campus career center and its employer relationships, faculty and departmental research opportunities, professional associations in your field, and established program directories. Ask a professor whose class you enjoyed whether their lab takes undergraduates; that conversation surfaces roles that are never posted publicly. FirstInternships helps you interpret selected pathways in depth, but it does not claim to list every available internship, and neither does any single source."],
    ["Compare the work, not the logo", "A recognizable employer name tells you very little about what you would spend the summer doing. For each option, write one sentence on the actual work and one on why it fits something you have already done or genuinely want to learn. If you cannot write either sentence, you do not know enough about the role to write a convincing application for it. This is also the step where a smaller organization often wins: the work is frequently broader, the supervision closer, and the applicant pool smaller."],
    ["Score the effort each application costs", "Applications are not equal in cost. A single-form submission takes twenty minutes; one requiring two essays, a portfolio, and two recommendation letters can take a week of calendar time because other people are involved. Note those dependencies next to each option before committing. Then prioritize deliberately: a few complete, specific applications generally do more for you than a long list submitted thinly, and a deadline you miss because you overcommitted costs you the option entirely."],
    ["Keep a record you will actually use", "Save the official URL, the role identifier, the deadline with its time zone, and a copy of the description — postings are edited and taken down, and you will want the original when preparing for an interview. Use this site's saved list to track planning stages and your next action for each program. That list lives in your own browser on this device, so export it if you want a backup or a copy somewhere else."],
    ["Revisit the list on a schedule", "A shortlist made in September is out of date by November: some cycles will have opened, some closed, and your own interests will have moved. Put a recurring half-hour in your calendar to re-check official pages for the programs you are waiting on, add anything new, and remove what no longer fits. Treating the shortlist as a living document rather than a one-time exercise is what stops a deadline passing unnoticed while you were busy with coursework."],
  ] },
];

export const programPath = program => `/programs/${program.id}`;
export const yearPath = year => `/${year.slug}`;
export const fieldPath = field => `/internships/${field.id}`;
export const guidePath = guide => `/guides/${guide.slug}`;
export const topicPath = topic => `/${topic.slug}`;
export const FEATURED_PROGRAM_IDS = [
  "capital-one-early-internship",
  "paramount-internships",
  "palantir-year-internship",
  "met-museum-summer-2027",
  "southwest-campus-reach",
  "disney-industrial-engineering-2027",
  "nasa-ostem",
  "fedex-college-connections",
];
// A compact homepage link set for the program pages currently earning search
// demand or carrying newly published 2027 information. Keep this deliberately
// small and reviewed; it is an internal-priority signal, not a live ranking.
export const CURRENT_PROGRAM_IDS = [
  "ge-aerospace-us-internships-coops",
  "enterprise-mobility-management-internship",
  "mars-sophomore-experience",
  "kimberly-clark-engineering-internships-2027",
  "honeywell-university-internships",
  "roblox-software-engineer-intern-2027",
  "tsmc-arizona-engineering-internships-2027",
  "rocket-lab-additive-manufacturing-intern-2027",
  "applied-materials-internship-program",
  "aqr-research-summer-analyst-2027",
  "apollo-credit-trading-summer-analyst-2027",
  "brookfield-energy-fundraise-intern-2026-2027",
  "citadel-associate-program-internship",
  "bridgewater-investment-associate-2027",
  "millennium-internship-program-2027",
  "evercore-investment-banking-summer-analyst",
  "world-bank-wbg-pioneers",
  "nvidia-ignite",
  "pfizer-futures-internship",
  "abbvie-summer-internship",
  "novartis-summer-of-science",
  "capital-one-early-internship",
  "paramount-internships",
  "cleveland-clinic-lih-2027",
  "smithsonian-air-space-summer-2027",
  "whitney-marketing-spring-2027",
  "port-authority-summer-2027",
  "aig-summer-internship-2027",
  "la-times-summer-internships-2027",
  "kp-launch-college-program-2027",
  "nordstrom-corporate-internships-2027",
  "health-career-connection-summer-2027",
];
export const FEATURED_GUIDE_SLUGS = ["how-many-internships-should-i-apply-to", "internship-application-status-meanings", "email-templates-for-internships", "how-to-apply-for-an-internship"];
// Sitewide footer links to the guides that answer the broadest student
// questions, labelled the way students phrase them.
export const FOOTER_GUIDE_LINKS = [
  ["how-to-get-an-internship-with-no-experience", "Getting an internship with no experience"],
  ["how-to-find-internships", "How to find internships"],
  ["when-to-apply-for-summer-internships", "When to apply for summer internships"],
  ["internship-resume-with-no-experience", "Internship resume with no experience"],
  ["email-templates-for-internships", "Internship email templates"],
  ["internship-interview-guide", "Internship interview prep"],
  ["internship-application-status-meanings", "What internship application statuses mean"],
  ["internship-housing-and-relocation", "Internship housing and relocation"],
  ["do-internships-check-gpa", "Do internships check GPA?"],
];
// Sitewide footer links to the program guides students search for most
// (Search Console impressions, October 2026), labelled the way they search.
// Keep this short: it is a handful of high-demand pages, not a directory.
export const FOOTER_PROGRAM_LINKS = [
  ["world-bank-wbg-pioneers", "World Bank internship"],
  ["nvidia-ignite", "NVIDIA Ignite"],
  ["nsa-summer-internships", "NSA internships"],
  ["capital-one-early-internship", "Capital One Early Internship"],
  ["evercore-investment-banking-summer-analyst", "Evercore summer analyst"],
  ["paramount-internships", "Paramount internships"],
  ["gilead-internship-program", "Gilead internships"],
  ["pfizer-futures-internship", "Pfizer summer internship"],
];
export const footerPrograms = () => FOOTER_PROGRAM_LINKS.map(([id, label]) => [PROGRAMS.find(program => program.id === id), label]).filter(([program]) => program);
export const footerGuides = () => FOOTER_GUIDE_LINKS.map(([slug, label]) => [GUIDES.find(guide => guide.slug === slug), label]).filter(([guide]) => guide);
export const featuredPrograms = () => FEATURED_PROGRAM_IDS.map(id => PROGRAMS.find(program => program.id === id)).filter(Boolean);
export const currentPrograms = () => CURRENT_PROGRAM_IDS.map(id => PROGRAMS.find(program => program.id === id)).filter(Boolean);
export const featuredGuides = () => FEATURED_GUIDE_SLUGS.map(slug => GUIDES.find(guide => guide.slug === slug)).filter(Boolean);
export function programHeading(program) {
  const title = program.title.toLowerCase().includes(program.company.toLowerCase()) ? program.title : `${program.company} ${program.title}`;
  return `${title}: Eligibility & How to Apply`;
}
export function programsForTopic(topic) { return topic.filter === "paid" ? PROGRAMS.filter(p => p.pay === "Paid") : topic.programIds.map(id => PROGRAMS.find(p => p.id === id)).filter(Boolean); }
export function guidesForProgram(program) {
  const slugs = program.guideSlugs || (program.fields.includes("research") ? ["research-internship-personal-statement", "ask-for-internship-recommendation-letter", "when-to-apply-for-summer-internships"] : ["how-to-apply-for-an-internship", "internship-resume-with-no-experience", "internship-interview-guide"]);
  return slugs.map(slug => GUIDES.find(g => g.slug === slug)).filter(Boolean);
}
// Related pathways are assigned once for the whole catalog so internal links
// reach every program. An alphabetical tie-break once gave a few A–B employers
// nearly every slot and left half the catalog with none. Other programs from
// the same employer come first; the remaining slots are filled in rounds from
// each page's most similar programs, giving each slot to the candidate linked
// least so far. The result depends only on PROGRAMS, so SSR and hydration agree.
const RELATED_LIMIT = 6;
const RELATED_POOL = 12;
const RELATED_MIN_INBOUND = 2;
const textHash = text => { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
// A stable, well-mixed tie-break for an ordered pair of ID hashes.
const pairTie = (a, b) => { let h = Math.imul(a ^ Math.imul(b, 0x9e3779b1), 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); return (h ^ (h >>> 16)) >>> 0; };
const bitCount = n => { let count = 0; for (; n; n &= n - 1) count++; return count; };
let relatedById;
function assignRelatedPrograms() {
  // Pairs are scored once, with fields and years as bitmasks. Recomputing
  // scores inside a sort comparator blocked a phone's main thread on hydration.
  const n = PROGRAMS.length;
  const fieldBit = new Map([...new Set(PROGRAMS.flatMap(p => p.fields))].map((field, i) => [field, 2 ** i]));
  const mask = values => values.reduce((bits, value) => bits | value, 0);
  const fieldMasks = PROGRAMS.map(p => mask(p.fields.map(field => fieldBit.get(field))));
  const primaryBits = PROGRAMS.map(p => fieldBit.get(p.fields[0]) || 0);
  const yearMasks = PROGRAMS.map(p => mask(p.years.map(year => 2 ** year)));
  const idHashes = PROGRAMS.map(p => textHash(p.id));
  const ranked = PROGRAMS.map((program, a) => {
    const sameEmployer = [], others = [], score = new Float64Array(n), tie = new Uint32Array(n);
    for (let b = 0; b < n; b++) {
      if (b === a) continue;
      const shared = bitCount(fieldMasks[a] & fieldMasks[b]);
      const same = PROGRAMS[b].company === program.company;
      if (!same && !shared) continue;
      const primary = primaryBits[b] === primaryBits[a] ? 2 : fieldMasks[b] & primaryBits[a] ? 1 : 0;
      score[b] = 4 * shared / bitCount(fieldMasks[a] | fieldMasks[b]) + primary + (yearMasks[a] & yearMasks[b] ? 1 : 0);
      tie[b] = pairTie(idHashes[a], idHashes[b]);
      (same ? sameEmployer : others).push(b);
    }
    const closer = (x, y) => score[y] - score[x] || tie[x] - tie[y];
    return { sameEmployer: sameEmployer.sort(closer), others: others.sort(closer) };
  });
  const inbound = new Uint16Array(n);
  const picks = ranked.map(({ sameEmployer }) => sameEmployer.slice(0, RELATED_LIMIT));
  picks.forEach(chosen => chosen.forEach(b => inbound[b]++));
  const pools = ranked.map(({ others }) => others.slice(0, RELATED_POOL));
  // Pools are in rank order, so the first least-linked candidate is also the closest.
  for (let round = 0; round < RELATED_LIMIT; round++) for (let a = 0; a < n; a++) {
    if (picks[a].length >= RELATED_LIMIT) continue;
    let next = -1;
    for (const b of pools[a]) if (!picks[a].includes(b) && (next < 0 || inbound[b] < inbound[next])) next = b;
    if (next >= 0) { picks[a].push(next); inbound[next]++; }
  }
  // A program with one common field can fall outside every page's pool as the
  // catalog grows. Give it the slot of the page that ranks it closest, replacing
  // that page's most-linked pick that stays above the minimum without it.
  for (let b = 0; b < n; b++) while (inbound[b] < RELATED_MIN_INBOUND) {
    let best = null;
    for (let a = 0; a < n; a++) {
      if (a === b || picks[a].includes(b)) continue;
      const rank = ranked[a].others.indexOf(b);
      if (rank < 0 || (best && rank >= best.rank)) continue;
      let drop = -1;
      for (const c of picks[a]) if (PROGRAMS[c].company !== PROGRAMS[a].company && inbound[c] > RELATED_MIN_INBOUND && (drop < 0 || inbound[c] > inbound[drop])) drop = c;
      if (drop >= 0) best = { a, rank, drop };
    }
    if (!best) break;
    picks[best.a][picks[best.a].indexOf(best.drop)] = b;
    inbound[best.drop]--; inbound[b]++;
  }
  const order = a => { const position = new Map([...ranked[a].sameEmployer, ...ranked[a].others].map((b, i) => [b, i])); return (x, y) => position.get(x) - position.get(y); };
  return new Map(PROGRAMS.map((program, a) => [program.id, picks[a].sort(order(a)).map(b => PROGRAMS[b])]));
}
export function relatedPrograms(program, limit = RELATED_LIMIT) {
  relatedById ||= assignRelatedPrograms();
  return (relatedById.get(program.id) || []).slice(0, limit);
}
// First and last source-review dates across a set of programs. Page-level
// review lines show this span rather than one blanket date, because programs
// are reviewed on different days.
export function reviewSpan(programs) {
  const dates = programs.map(p => p.verified).sort();
  return dates.length ? [dates[0], dates.at(-1)] : [VERIFIED, VERIFIED];
}
export function programsForYear(year) { return PROGRAMS.filter(p => p.years.includes(year)); }
export function programsForField(field) { return PROGRAMS.filter(p => p.fields.includes(field)); }
export const ROUTES = ["/", "/internships", ...YEARS.map(yearPath), ...FIELDS.map(fieldPath), ...PROGRAMS.map(programPath), ...TOPICS.map(topicPath), "/guides", ...GUIDES.map(guidePath), "/internship-deadlines", "/application-timeline", "/compare", "/talent-network", "/about", "/partners", "/contact", "/saved", "/account", "/404"];
export function normalizePath(path) { return path.replace(/\.html$/, "").replace(/\/$/, "") || "/"; }
export function resolvePage(pathname) {
  const path = normalizePath(pathname);
  const program = PROGRAMS.find(p => programPath(p) === path);
  if (program) return { type: "program", path, program, title: program.seoTitle, description: program.seoDescription };
  const year = YEARS.find(y => yearPath(y) === path);
  if (year) return { type: "year", path, year, title: year.title, description: year.description };
  const field = FIELDS.find(f => fieldPath(f) === path);
  if (field) return { type: "field", path, field, title: field.title, description: field.description };
  const guide = GUIDES.find(g => guidePath(g) === path);
  if (guide) return { type: "guide", path, guide, title: guide.title, description: guide.description };
  const topic = TOPICS.find(t => topicPath(t) === path);
  if (topic) return { type: "topic", path, topic, title: topic.title, description: topic.description };
  const basic = {
    "/": ["home", "College Internships by Class Year", "College internship pathways with sourced eligibility, application guides, and a free personal application tracker. First-year students through seniors."],
    "/internships": ["directory", `College Internships for Freshmen–Seniors (${PROGRAMS.length})`, `Find ${PROGRAMS.length} sourced college internships for freshmen, sophomores, juniors and seniors. Filter by field, pay and eligibility, then apply on official employer sites.`],
    "/guides": ["guides", "College Internship Application Guides", "College internship guides for finding roles, application volume, resumes, career fairs, interviews, portal statuses, remote work, relocation, offers, and starting well."],
    "/internship-deadlines": ["deadlines", "College Internship Deadlines 2027: Application Calendar", "Published 2027 college internship deadlines from NASA, NIH, the White House, Pfizer, Novartis and more, with time zones, eligibility links and a downloadable calendar."],
    "/application-timeline": ["timeline", "College Internship Application Timeline Builder", "Build a personal college internship preparation timeline, plan references and documents, and download a checklist or all-day calendar. Free; no account needed."],
    "/compare": ["compare", "Compare College Internship Program Requirements", "Compare up to three college internship pathways side by side: class-year guidance, eligibility, pay, location, deadlines, and application preparation."],
    "/about": ["about", "About FirstInternships & Our Editorial Process", "How FirstInternships keeps college internship tools free, verifies pathways, handles eligibility, updates sources, and separates revenue from editorial decisions."],
    "/partners": ["partners", "Advertise to College Students | FirstInternships", "Reach college students through labeled sponsorships, employer campaigns and future advertising that keep FirstInternships free without buying editorial rank."],
    "/contact": ["contact", "Contact FirstInternships", "Report a program correction, suggest an undergraduate opportunity, or contact the FirstInternships directory team."],
    "/saved": ["saved", "Your Saved Internships & Application Tracker", "Plan your internship applications, record next actions, and export your saved list. Stored in your browser, with no account required."],
    "/account": ["account", "Your Personalized Internship Alerts", "Create or manage a free FirstInternships account and choose the college year, fields, location, work arrangements, and email cadence that fit you."],
    "/talent-network": ["talent", "College Internship Talent Network | FirstInternships", "Create a private college internship candidate profile and upload one resume. Free for students; employers cannot browse profiles, and sharing requires opportunity-specific approval."],
  }[path];
  return basic ? { type: basic[0], path, title: basic[1], description: basic[2] } : { type: "404", path, title: "Page Not Found", description: "Find college internship pathways and application guides on FirstInternships." };
}

export function searchPrograms({ query = "", year = "all", field = "all", paid = false, ids = null }) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Preferred-year guidance is a useful lead, but remains in the unknown-minimum
  // group with its qualification caveat rather than becoming a hard eligibility rule.
  return PROGRAMS.filter(p => year === "all" || p.years.includes(Number(year)) || p.preferredYears?.includes(Number(year)))
    .filter(p => field === "all" || p.fields.includes(field))
    .filter(p => !paid || p.pay === "Paid")
    .filter(p => !ids || ids.includes(p.id))
    .filter(p => words.every(word => `${p.company} ${p.title} ${p.summary} ${p.location} ${p.fields.map(id => FIELDS.find(f => f.id === id)?.name || id).join(" ")} ${p.eligibility.join(" ")}`.toLowerCase().includes(word)))
    .sort((a, b) => (a.firstYear ?? 99) - (b.firstYear ?? 99) || a.company.localeCompare(b.company));
}
