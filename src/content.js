import { ADDITIONAL_FIELDS, ADDITIONAL_GUIDES, ADDITIONAL_PROGRAMS, TOPICS } from "./expanded-content.js";
import { NEW_PROGRAMS } from "./inventory-expansion.js";
import { VARIETY_PROGRAMS } from "./variety-expansion.js";
import { ORGANIC_EXPANSION_PROGRAMS } from "./organic-expansion.js";
import { CONTENT_EXPANSION_2_PROGRAMS } from "./content-expansion-2.js";
import { CONTENT_EXPANSION_3_PROGRAMS } from "./content-expansion-3.js";
export { TOPICS } from "./expanded-content.js";
export const SITE = "https://firstinternships.com";
export const VERIFIED = "2026-09-19";
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
].map(program => ({ ...program, verified: program.verified || VERIFIED, seoTitle: program.seoTitle || PROGRAM_SEO[program.id][0], seoDescription: program.seoDescription || PROGRAM_SEO[program.id][1] }));

export const YEARS = [
  { id: 1, slug: "freshman-internships", name: "First-year", short: "1st year", color: "#d9f99d", title: "Internships for First-Year College Students", description: "Find freshman internship pathways, check completed-credit rules, and build an application from coursework and projects.",
    intro: "You do not need to wait until junior year to start looking. Begin with programs that explicitly accept early-college students, then check any coursework or enrollment conditions before spending time on an application.",
    sections: [["Start with evidence, not a long work history", "A lab report, small app, campus job, club event, or volunteer project can explain what you can do. Write down the task, your contribution, and the result. Never rename a class exercise as a professional internship."], ["Year one is not the whole eligibility test", "Explore Microsoft focuses on the first two college years. DOE programs require a completed semester and specific credits, so a student in their first fall semester may not yet qualify. Research sites can set their own additional rules."], ["Make a manageable first shortlist", "Choose opportunities whose dates, location, citizenship rules, and costs fit your situation. Use campus research and career resources alongside these national programs. Save a few realistic choices and finish the strongest applications first."]],
  },
  { id: 2, slug: "sophomore-internships", name: "Sophomore", short: "2nd year", color: "#c9e9ff", title: "Internships for College Sophomores", description: "Compare second-year internship pathways, understand credit and enrollment requirements, and turn coursework into application evidence.",
    intro: "Sophomore year is a useful time to move from exploring fields to testing one in practice. You can still consider early-college programs while adding research and technical opportunities that need completed coursework.",
    sections: [["Do not miss early-college windows", "Programs limited to the first two years are different from programs with a minimum of year two. Explore Microsoft may fit a sophomore; it should not be assumed available again in junior year. Confirm which year the opening uses: application time or internship start."], ["Use a course to demonstrate a skill", "Choose one substantial assignment and improve it before listing it. Test your code, check a model's assumptions, or explain an experiment's limitations. Include a clear description and a link only if the work is appropriate to share."], ["Compare the full commitment", "A semester laboratory appointment can overlap with classes, and an on-site placement may involve travel and housing. Ask your adviser about academic scheduling and compare the practical details before committing."]],
  },
  { id: 3, slug: "junior-internships", name: "Junior", short: "3rd year", color: "#ffd8c8", title: "Internships for College Juniors", description: "Find junior and penultimate-year internship routes, compare application requirements, and prepare a focused summer application.",
    intro: "Junior year often aligns with penultimate-year summer recruiting on a four-year degree, but graduation dates are more reliable than class labels. Build your shortlist around the actual opening's degree timeline.",
    sections: [["Check the graduation window", "Goldman Sachs describes its Summer Analyst program as usually taken in the third or penultimate year. That is guidance, not a guarantee that every junior qualifies. Accelerated degrees, transfer credits, and co-op schedules can change the fit."], ["Show depth in one relevant area", "Select work that matches the team's tasks. Explain an analytical decision, a tested design, or a substantial project contribution. A focused resume with evidence is easier to evaluate than an unrelated list of every campus activity."], ["Track assessments and term availability", "After applying, check the employer portal and messages for assessments or scheduling requests. Keep copies of the posting and your application. Return offers are possible outcomes of some programs, not a promise made by this directory."]],
  },
  { id: 4, slug: "senior-internships", name: "Senior", short: "4th year", color: "#e4d8ff", title: "Internships for College Seniors", description: "Explore undergraduate internship routes for seniors and check graduation, student-status, and remaining-work-time restrictions.",
    intro: "A senior can still be an undergraduate applicant, but a graduation date can close an internship route before the placement starts. Check student status for both application and participation, not just today's class year.",
    sections: [["Read the enrollment rule literally", "Some openings require another term of study after the internship. Research sites may require undergraduate status throughout participation. A program accepting undergraduates is not automatic confirmation for someone graduating before its start."], ["Calculate remaining time", "NASA Pathways requires the ability to complete at least 480 work hours before finishing your degree. A final-semester applicant needs a real schedule, not just a qualifying GPA. Discuss leave, credit, and graduation timing with your academic adviser."], ["Separate internships from graduate jobs", "This board covers current-college pathways. If a role's timing does not fit, use the employer's graduate recruiting route instead. A full-time graduate opening is not relabeled as a senior internship here."]],
  },
];

export const FIELDS = [
  ...ADDITIONAL_FIELDS,
  { id: "technology", name: "Technology", title: "Technology Internships for College Students", description: "Software, data, and technical internship pathways with college-year eligibility and practical application guidance.", intro: "Choose the work before choosing the company: software development, data analysis, research computing, and technical operations call for different evidence.", sections: [["Build something you can explain", "Show a small working project with a readable description, setup steps, and tests where appropriate. Explain your contribution and a trade-off. Keep private data and course work subject to academic restrictions out of public repositories."], ["Match the technical requirements", "Distinguish required tools from preferred ones in the opening. Identify what you have used, how you used it, and what you would need to learn. An interest in technology is not evidence that you meet a specific advanced role's prerequisites."]] },
  { id: "engineering", name: "Engineering", title: "Engineering Internships for College Students", description: "Compare engineering and laboratory internship programs, completed-credit rules, and preparation advice for undergraduate applicants.", intro: "Engineering experience can begin in a classroom lab or design team. The useful question is what you designed, measured, tested, or improved—and how you know it worked.", sections: [["Explain the verification", "In a project description, name the constraint, the approach, and the test. A prototype that failed can still show sound reasoning if you explain what the result taught you. Do not imply you operated equipment independently if you worked under supervision."], ["Check location and academic scheduling", "Laboratory and hardware work often has an on-site component. DOE SULI explicitly requires on-site participation. Check the actual work arrangement, safety training, dates, and housing support before comparing an award with your living costs."]] },
  { id: "research", name: "Research", title: "Research Internships for Undergraduates", description: "Explore NSF REU, NASA, JPL, and DOE research pathways with eligibility checks, application steps, and source links.", intro: "An undergraduate research application should explain what you want to investigate and why the lab or site is the right setting. It is not just a list of institutions you admire.", sections: [["Read the research themes first", "Find two or three questions in the site's description that genuinely interest you. Connect one to coursework or a project and explain what you hope to learn. You can acknowledge gaps without pretending to be an experienced researcher."], ["Give recommenders useful context", "Ask someone familiar with your work, give them the relevant program description and deadline, and explain why it fits. Keep a separate record of reference requests, since your own submission may not complete the application."]] },
  { id: "finance", name: "Finance & Accounting", title: "Finance and Accounting Internships for College Students", description: "Compare finance and accounting internship pathways, penultimate-year guidance, and role-specific degree requirements.", intro: "Banking, assurance, tax, and corporate finance are different routes. Identify the team's work, degree requirements, and office before building an application.", sections: [["Graduation dates matter more than labels", "A junior on a standard four-year timeline may fit penultimate-year recruiting; a student on an accelerated or extended degree may not. Check the selected role's expected graduation window, not a generic internet rule about juniors."], ["Use evidence appropriate to the service line", "For finance, explain assumptions in a model or an analytical write-up. For accounting, connect coursework and any relevant education plans to the opening. Clearly label simulated work and do not offer invented returns or exaggerated client responsibilities."]] },
  { id: "business", name: "Business", title: "Business Internships for College Students", description: "College business internship routes with service-line selection, eligibility checks, and actionable application preparation.", intro: "Business is a broad category, not one job. Operations, consulting, finance, and public-sector administration reward different forms of practical evidence.", sections: [["Translate campus work into relevant skills", "A student organization's budget, an event plan, a customer-facing job, or a process improvement can show useful experience. Explain scope honestly: what you owned, who you worked with, and what changed."], ["Select a team and location deliberately", "Read what the team actually does and confirm you can work in its office for the full term. Use a short explanation of why that work fits your interests; replacing the employer name in a generic paragraph rarely produces a useful application."]] },
];

export const GUIDES = [
  ...ADDITIONAL_GUIDES,
  { slug: "how-to-apply-for-an-internship", title: "How to Apply for a College Internship", description: "A practical internship application process: verify eligibility, prepare evidence, submit through the official portal, and track the next step.", intro: "Start by checking whether you can actually participate. A polished application cannot fix an incompatible graduation date, required credit count, citizenship restriction, or work schedule.", sections: [
    ["1. Turn the listing into a checklist", "Record the employer, role identifier, term, location, work arrangement, deadline and time zone. Separate required qualifications from preferred ones. Check whether class year is evaluated when you apply or when the internship begins. If a mandatory rule is unclear, use the employer's published contact route rather than guessing."],
    ["2. Pick evidence for the work", "Choose two or three examples from classes, projects, jobs, research, or campus activities. For each, describe the task, what you personally did, and the outcome. Use accurate numbers only when you can support them. Make the connection to the role visible without stuffing every phrase from the listing into your resume."],
    ["3. Assemble the requested documents", "Follow the opening's format and upload requirements. Check contact details and your graduation date. If transcripts or references are needed, allow extra time and follow any privacy-redaction instructions. A cover letter is useful when requested or when it adds specific context; it does not replace the required application."],
    ["4. Submit to the official employer portal", "Follow the verified employer link. FirstInternships is an independent guide and does not submit applications or collect your resume. Review the uploaded files, complete required questions, and keep the confirmation. Save a copy of the posting because the page may change or disappear."],
    ["5. Track the next action", "Record your submission date and watch for employer assessments, interviews, or requests. Use your saved-program tracker here as a personal planning tool; the employer portal remains the authoritative source for application status. Apply to additional realistic choices while waiting, without repeatedly messaging the same person."],
  ] },
  { slug: "internship-resume-with-no-experience", title: "An Internship Resume With No Previous Internship", description: "Use coursework, campus jobs, and projects to build an honest college internship resume with clear evidence and a graduation date.", intro: "No previous internship does not mean no relevant experience. Your task is to make what you have done understandable, without dressing class work up as professional employment.", sections: [
    ["Start with education and a useful project", "Include your degree, institution, and expected graduation month and year. Then select relevant coursework or a substantial project. For a team project, identify your own contribution. A working link is helpful only if the content is shareable, accessible, and explains the work."],
    ["Write a bullet around an action and result", "Instead of ‘worked on a data project,’ describe the dataset, the work you did, and what the analysis answered. Example: ‘Cleaned a course dataset, compared two forecasting approaches, and documented their error on a held-out sample.’ This is an illustrative sentence, not something to claim unless it describes your actual work."],
    ["Use jobs and campus activities honestly", "Customer service, scheduling, tutoring, event organization, and club budgeting can show responsibility. Name the activity accurately, explain scope, and include outcomes you can defend. Do not add an impressive percentage when you did not measure a before-and-after result."],
    ["Make it easy to read and verify", "Use clear section names and a restrained layout. Follow the employer's file instructions. Proofread dates, spelling, links, and contact details; read the exported document, not just the editor view. Omit unnecessary sensitive information such as a government identification number."],
    ["Tailor by selecting, not fabricating", "Move the most relevant evidence higher and trim distracting details. If you lack a required skill, do not claim it. A small project you can explain in depth is more credible than a tool list you cannot discuss. Ask a career adviser for a review before submitting."],
  ] },
  { slug: "when-to-apply-for-summer-internships", title: "When to Apply for Summer Internships", description: "Plan college internship applications around official deadlines, rolling recruiting, reference requests, and your academic calendar.", intro: "There is no single deadline for summer internships. Build your calendar from the actual programs and roles you want, then work backward from their requirements.", sections: [
    ["Start watching before you feel ready", "Make a shortlist during the preceding academic year and check official employer pages. Some structured programs recruit early; smaller teams and research sites may follow different schedules. Do not wait for a supposed universal ‘internship season’ to begin preparing your documents."],
    ["Distinguish a deadline from rolling review", "A deadline is the last published submission time, often with a time zone. Rolling review can mean opportunities fill before you expect. An evergreen program overview is not evidence that applications are open. Use the individual opening and current-cycle announcement."],
    ["Work backward from dependencies", "Request transcripts and references with enough time for other people to respond. Draft essays, review qualifications, and test upload formats before the last day. Choose a personal submission target earlier than the employer cutoff so you have a buffer for problems."],
    ["Check school and travel dates", "Compare the full internship dates with exams, required classes, and graduation. A semester placement may need an academic plan. Before accepting, confirm the work arrangement and any relocation or housing support rather than assuming the posted award covers every expense."],
    ["Keep closed programs in a preparation list", "A passed deadline can still point to a useful future opportunity, but do not invent next year's dates from last year's. Save the official page and mark it as a future-cycle prospect. Our directory shows the source date so you can see when the information was last reviewed."],
  ] },
  { slug: "internship-interview-guide", title: "Prepare for a College Internship Interview", description: "Prepare project explanations, examples of collaboration, employer questions, and practical checks for a college internship interview.", intro: "Preparation means being able to explain your work clearly and understand the role. This guide is general editorial advice; the employer's interview instructions determine the actual format.", sections: [
    ["Build a short evidence bank", "Prepare examples of solving a problem, learning a tool, collaborating, and responding to a mistake. For each, explain the situation briefly, your own action, the result, and what you learned. Do not memorize a script so tightly that you cannot answer a follow-up question."],
    ["Explain one project from end to end", "Be ready to describe the purpose, constraints, approach, and validation. Identify what you did versus what teammates did. Practice explaining it to someone outside your field, then add technical depth when asked. Discuss limitations honestly instead of pretending everything worked perfectly."],
    ["Study the actual team's work", "Read the opening and official team or program information. Prepare a concrete reason the work interests you. For technical or case assessments, follow the preparation guidance supplied by the employer and use allowed practice resources; do not seek leaked questions or unauthorized assistance."],
    ["Ask questions that help you decide", "Ask about an intern's likely project, supervision, feedback, team collaboration, and the full work schedule. Before accepting, resolve compensation, location, travel, and enrollment conditions with the recruiter. Do not assume an internship includes a return offer."],
    ["Check the practical details", "Confirm the time zone, meeting link or address, accessibility needs, and requested materials. Test your connection for a remote interview. Afterward, write down useful details and any next action. A concise thank-you is optional unless the employer provides different instructions."],
  ] },
  { slug: "how-to-follow-up-on-an-internship-email", title: "How to Follow Up on an Internship Application", description: "Check the official application status, respect employer timelines, and send a concise follow-up only through an appropriate contact route.", intro: "A follow-up should clarify a next step, not create pressure. The employer portal and any timeline you were given are the starting points.", sections: [
    ["Check before sending", "Look for a confirmation, portal status, assessment request, or published decision timeline. Check your inbox and spam folder. If the employer says not to contact recruiters or provides a specific support form, follow that instruction. Silence does not imply rejection or an invitation to repeatedly message staff."],
    ["Use the right contact", "Reply to a recruiter already handling your application or use the published applicant-support route. Do not scrape employees' personal addresses or send the same request to many people. Include the role title and identifier so the recipient can understand the question."],
    ["Keep the note specific", "State when you applied, confirm your continued interest, and ask whether there is a next step you should complete. Example: ‘I applied for [role and ID] on [date]. I remain interested in the opportunity and wanted to check whether any additional information is needed. Thank you for your time.’ Replace brackets only with accurate details."],
    ["Respect the answer—or the lack of one", "If a decision date is provided, wait for that date before asking again. If you receive no response, continue with other applications instead of sending a sequence of escalating messages. Keep your own records, and use the official portal for authoritative status."],
  ] },
  { slug: "do-internships-pay", title: "How to Compare Internship Pay and Costs", description: "Compare internship salary or stipends with housing, travel, schedule, and the employer's written terms before accepting.", intro: "‘Paid’ is a starting point, not a complete offer. An hourly salary, weekly stipend, and monthly research award can have very different practical implications.", sections: [
    ["Confirm the written amount and schedule", "Read the individual posting and written offer for the amount, payment cadence, expected hours, dates, and conditions. A program overview may describe compensation without listing a role-specific amount. This directory never turns an unknown figure into an estimated salary."],
    ["Compare the total cost", "Make a simple budget for housing, transportation, meals, deposits, and any move. Check whether support is provided directly, reimbursed later, or only available to eligible participants. Ask how and when reimbursement works so you can plan cash flow."],
    ["Ask about academic and practical constraints", "Check whether you need insurance, school approval, or a particular enrollment status. Confirm whether academic credit involves tuition or other school costs. Questions about wage law, tax treatment, or immigration rules require current official information and, when needed, qualified advice; this guide is not legal or tax advice."],
    ["Do not confuse a program with an offer", "A published stipend is useful context, but the selected internship's written terms are what you need before deciding. Compare the actual learning, supervision, schedule, and costs of realistic options. Never pay a directory to submit an application for you."],
  ] },
  { slug: "how-to-find-internships", title: "How to Build a Realistic College Internship Shortlist", description: "Find college internships by eligibility, work interests, dates, and location, then save and prioritize applications you can actually complete.", intro: "A shortlist should reduce wasted effort. Begin with eligibility and practical constraints, then compare the work—not just the employer's name.", sections: [
    ["Write down your non-negotiables", "Record your college year, graduation date, completed credits, availability, location constraints, and work-authorization situation. Check mandatory employer rules directly. If a program's year requirements are not stated, mark them unresolved instead of treating them as a match."],
    ["Search more than one channel", "Use official employer pages, your campus career center, faculty research opportunities, and established program directories. A national program is only one part of the market. FirstInternships helps interpret selected pathways; it does not claim to list every available internship."],
    ["Score the work and application effort", "For each realistic option, write why the work fits and what evidence you can submit. Note reference requests, essays, and assessments. Prioritize a few strong, complete applications over an unmanageable list whose deadlines you cannot meet."],
    ["Keep a useful record", "Save the official URL, role identifier, deadline, and a copy of the description. Use this site's saved list to track planning stages and next actions. Browser storage stays on this device; export your list if you want a backup or a copy elsewhere."],
  ] },
];

export const programPath = program => `/programs/${program.id}`;
export const yearPath = year => `/${year.slug}`;
export const fieldPath = field => `/internships/${field.id}`;
export const guidePath = guide => `/guides/${guide.slug}`;
export const topicPath = topic => `/${topic.slug}`;
export function programsForTopic(topic) { return topic.filter === "paid" ? PROGRAMS.filter(p => p.pay === "Paid") : topic.programIds.map(id => PROGRAMS.find(p => p.id === id)).filter(Boolean); }
export function guidesForProgram(program) {
  const slugs = program.guideSlugs || (program.fields.includes("research") ? ["research-internship-personal-statement", "ask-for-internship-recommendation-letter", "when-to-apply-for-summer-internships"] : ["how-to-apply-for-an-internship", "internship-resume-with-no-experience", "internship-interview-guide"]);
  return slugs.map(slug => GUIDES.find(g => g.slug === slug)).filter(Boolean);
}
export function relatedPrograms(program, limit = 3) {
  const score = candidate => candidate.fields.filter(field => program.fields.includes(field)).length + (candidate.fields.includes(program.fields[0]) ? 2 : 0);
  return PROGRAMS.filter(candidate => candidate.id !== program.id && candidate.fields.some(field => program.fields.includes(field)))
    .sort((a, b) => score(b) - score(a) || a.company.localeCompare(b.company)).slice(0, limit);
}
export function programsForYear(year) { return PROGRAMS.filter(p => p.years.includes(year)); }
export function programsForField(field) { return PROGRAMS.filter(p => p.fields.includes(field)); }
export const ROUTES = ["/", "/internships", ...YEARS.map(yearPath), ...FIELDS.map(fieldPath), ...PROGRAMS.map(programPath), ...TOPICS.map(topicPath), "/guides", ...GUIDES.map(guidePath), "/internship-deadlines", "/application-timeline", "/compare", "/about", "/contact", "/saved", "/404"];
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
    "/internships": ["directory", "College Internship Directory", "Browse sourced undergraduate internship pathways by college year and field. Check eligibility, learn how to apply, and visit the official employer."],
    "/guides": ["guides", "College Internship Application Guides", "College internship playbooks for resumes, cover letters, research statements, recommendation requests, portfolios, interviews, timelines, and offer decisions."],
    "/internship-deadlines": ["deadlines", "College Internship Deadlines & Application Calendar", "Published college internship deadlines for NASA, DOE and NIH, with term, time zone, eligibility links, and a downloadable application-cutoff calendar."],
    "/application-timeline": ["timeline", "College Internship Application Timeline Builder", "Build a personal college internship preparation timeline, plan references and documents, and download a checklist or all-day calendar. Free; no account needed."],
    "/compare": ["compare", "Compare College Internship Program Requirements", "Compare up to three college internship pathways side by side: class-year guidance, eligibility, pay, location, deadlines, and application preparation."],
    "/about": ["about", "About FirstInternships & Our Editorial Process", "How FirstInternships verifies college internship pathways, handles eligibility, updates sources, and keeps advertising separate from editorial decisions."],
    "/contact": ["contact", "Contact FirstInternships", "Report a program correction, suggest an undergraduate opportunity, or contact the FirstInternships directory team."],
    "/saved": ["saved", "Your Saved Internships & Application Tracker", "Plan your internship applications, record next actions, and export your saved list. Stored in your browser, with no account required."],
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
