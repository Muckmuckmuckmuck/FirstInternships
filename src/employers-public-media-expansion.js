// Federal government, international institutions, news and sports media —
// sourced program batch.
//
// Scaffolded 2026-09-28 so that batches researched in parallel never edit the
// same file. This module is already imported and spread into PROGRAMS in
// src/content.js; filling it requires no change anywhere else.
//
// Assigned employers (research each on its own official pages; skip any whose
// official student page cannot be read or does not establish enough to write
// an accurate guide — never fill a gap from memory or a third-party site):
// CIA student programs, FBI Honors Internship Program, NSA student programs,
// White House Internship Program, U.S. Department of the Treasury, Federal
// Reserve Bank of New York, United Nations internship programme, World Bank,
// International Monetary Fund, The New York Times, The Washington Post,
// Bloomberg, Dow Jones, Associated Press, NBA, NHL.
//
// Records follow the program data model in docs/CLAUDE_CODE_PLAYBOOK.md §6.
// A date published without a time of day goes in `deadlineDate` (YYYY-MM-DD)
// with `deadlineDateLabel`; `deadline` is reserved for an exact instant with a
// published time and zone.
//
// Reviewed 2026-09-29. Every fact below was read on the publisher's own pages:
// agency sites, the official federal announcement system (USAJOBS) for federal
// cycles, and each employer's own applicant-tracking site for current postings.
//
// Not included, and why:
//   IMF        The official 2027 Fund Internship Program posting is for PhD
//              students only; no route for undergraduates was found.
//   Bloomberg  bloomberg.com careers pages return a bot check, and its
//              applicant site showed no internship postings at review.
//   NBA, NHL   Neither official careers site had a readable internship
//              program page or a current internship posting at review.
//
// Date handling worth knowing before editing:
//   fbi-honors-internship       Exact cutoff with a published time; passed.
//   new-york-fed-junior-summer-analyst
//                               Postings give "11:59 PM EST" on October 5,
//                               when New York is on daylight time. The record
//                               uses 11:59 p.m. New York time, the earlier of
//                               the two readings, and says so in `timing`.
//   washington-post-newsroom-internship
//                               Exact cutoff: noon Eastern, October 9, 2026.
//   cia-directorate-of-operations-internship, white-house-internship,
//   nytimes-internships-outside-newsroom
//                               Dates without a time of day → `deadlineDate`.
//   nsa-summer-internships, treasury-headquarters-student-internship,
//   dow-jones-summer-internship Dates stay in prose: NSA's has passed and is
//                               labelled "EST" in September, Treasury's is a
//                               one-term posting closing at review, and Dow
//                               Jones prints a deadline after the internship
//                               ends, so it cannot be relied on.
//
// Several of these programs are explicitly unpaid (White House, Treasury, UN
// Secretariat). Their `pay` value says "Unpaid" because the official source
// says so; it is a stated fact, not an estimate.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  resume: "internship-resume-with-no-experience",
  interview: "internship-interview-guide",
  pay: "do-internships-pay",
  cover: "internship-cover-letter",
  portfolio: "internship-project-portfolio",
  letter: "ask-for-internship-recommendation-letter",
  offer: "internship-offer-checklist",
  assessment: "internship-online-assessment",
  files: "internship-application-file-format",
  international: "international-student-internship-questions",
};

const REVIEWED = "2026-09-29";

export const EMPLOYERS_PUBLIC_MEDIA_PROGRAMS = [
  {
    id: "cia-undergraduate-internship-coop", company: "Central Intelligence Agency", title: "Undergraduate Internship & Co-op Program", initials: "CI", color: "#1f3a5f",
    seoTitle: "CIA Internship: Undergraduate & Co-op Programs",
    seoDescription: "Paid CIA internships and co-ops for full-time undergraduates in listed majors. US citizenship and security clearance required; CIA asks for interest 6–12 months ahead.",
    fields: ["public-service", "technology", "engineering", "finance", "business"],
    firstYear: null, years: [], yearLabel: "Full-time undergraduates · year not stated", pay: "Paid", location: "Washington, DC area", mode: "In person; 12-week tours or alternating co-op semesters",
    summary: "Paid, year-round CIA internships and co-ops for full-time undergraduates in designated majors, available only after medical and security processing.",
    eligibility: [
      "CIA describes its undergraduate internship and co-op programs as paid and open to full-time students pursuing a relevant major. Its desired-majors list has four groups — science and technology, digital innovation, support, and analytical — running from engineering and computer science to finance, economics, international affairs and several named foreign languages.",
      "CIA's minimum requirements for any applicant: US citizenship (dual US citizens are eligible), age 18 or older, willingness to move to the Washington, DC area, Selective Service registration if applicable, and completing security and medical evaluations that include a background investigation, a polygraph interview, and physical and psychological examinations. You must be physically in the United States or a US territory when you submit your resume.",
      "Interns complete at least one 12-week work tour before graduating. Co-op students work on an alternating-semester basis for at least three semesters before graduating, which can include a summer session; CIA does not work with a fixed list of school co-op programs, so you arrange academic credit with your school.",
      "The student page does not state a minimum class year, GPA or pay figure for these programs; individual opportunities carry their own requirements.",
    ],
    timing: "Because every student goes through medical and security processing, CIA asks for an expression of interest at least 6–12 months before the desired start date. There is no single cycle deadline for these programs. The Directorate of Operations internship and the scholarship programs follow their own published timetables, and at review CIA said it was not accepting applications for the Summer 2027 Stokes scholarship program.",
    status: "Rolling · apply 6–12 months ahead",
    url: "https://www.cia.gov/careers/student-programs/",
    sources: [
      { name: "Undergraduate internship and co-op structure, desired majors and the 6–12 month lead time", url: "https://www.cia.gov/careers/student-programs/" },
      { name: "Minimum requirements and hiring steps for every CIA applicant", url: "https://www.cia.gov/careers/how-we-hire/" },
    ],
    steps: [
      "Count back from the term you want. CIA asks for an expression of interest at least 6–12 months before the start date, so a summer placement means submitting the previous summer or autumn.",
      "Check your major against the desired-majors list, choose the undergraduate internship or co-op opportunity that fits it, and submit your resume through CIA's MyLINK portal while you are physically in the US.",
      "If invited to apply for a specific position, complete the screening, testing and interviews, then the conditional-offer paperwork (CIA names the SF-86) and the security and medical evaluations before any start date is confirmed.",
    ],
    prepare: [
      "The conditional-offer stage involves federal security paperwork. Our suggestion, not a CIA instruction: keep your own dated record of addresses, jobs and foreign travel as you go, so that stage becomes a matter of copying accurate information rather than reconstructing it under time pressure.",
      "Decide between an internship and a co-op using your school's calendar. A co-op means at least three alternating semesters away from campus, which only works if your department lets you step out and back in on schedule. Ask your co-op office how credit is recorded before you express interest, since CIA says it does not work from a set list of school programs.",
    ],
    pitfall: "Treat the 6–12 month lead time as part of eligibility. An expression of interest sent in spring for the same summer falls well short of the window CIA itself asks for.",
    materials: ["Major checked against the desired-majors list", "Resume for MyLINK", "Target start date 6–12 months out", "Dated personal history for security paperwork"],
    guideSlugs: [G.when, G.apply, G.resume],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "cia-directorate-of-operations-internship", company: "Central Intelligence Agency", title: "Directorate of Operations Undergraduate Internship", initials: "CI", color: "#2b2d42",
    seoTitle: "CIA Operations Internship for Freshmen",
    seoDescription: "CIA's Directorate of Operations internship is for first-year students only: two paid summers in the DC area, a 3.0 GPA preferred, and an interest window of Dec 15–Jan 30.",
    fields: ["public-service", "research"],
    firstYear: 1, years: [1], yearLabel: "First-year students only", pay: "Paid", location: "Washington, DC area", mode: "In person; two 90-day summer tours",
    summary: "A first-year-only CIA track placing undergraduates in two in-person summer tours as staff operations or targeting officers, with a possible route into the Professional Trainee program.",
    eligibility: [
      "The page requires a full-time student in the first year of study toward a bachelor's degree at a four-year institution, with only one semester or quarter completed when expressing interest, who will not graduate before December 2028. It states the internship is open to freshmen only. Students in a two-year program that feeds into an accredited four-year program are considered, but must show acceptance into the four-year program before the first internship.",
      "Candidates must be able to intern in person in the Washington, DC area for 90 days in each of two summers and return to school for at least one semester or quarter before graduating. The current text names the summers of 2027 and 2028.",
      "A 3.0 GPA on a 4-point scale is listed as preferred, but staying in the program requires proof that you maintain it throughout college. CIA's agency-wide conditions also apply: US citizenship (dual citizens eligible), age 18 or older, willingness to move to the DC area, security and medical evaluations, and Selective Service registration if applicable.",
      "The page lists a starting salary of $58,714 and says interns cover the cost of their own housing.",
    ],
    timing: "CIA says the window is closed and will reopen from December 15, 2026 to January 30, 2027; no time of day is published for the close. Part of the qualifications text still describes the previous call — interviews in spring or summer 2026, two sets of follow-on appointments in the DC area in late summer and early winter, and internships in summers 2027 and 2028 — so confirm which summers and interview dates apply to the cohort applying in the new window rather than assuming them. After completing both internships, and depending on hiring needs, interns may be offered conversion into the Professional Trainee program.",
    status: "Window reopens Dec 15, 2026",
    deadlineDate: "2027-01-30", deadlineDateLabel: "DO interest window · Jan 30, 2027",
    url: "https://www.cia.gov/careers/student-programs/undergraduate-internship-program-directorate-of-operations/",
    sources: [
      { name: "First-year eligibility, two-summer structure, salary, required documents and the reopening window", url: "https://www.cia.gov/careers/student-programs/undergraduate-internship-program-directorate-of-operations/" },
      { name: "Student programs page noting the DO internship's separate timetable", url: "https://www.cia.gov/careers/student-programs/" },
    ],
    steps: [
      "Check the timing rule before anything else: you must be in your first year with exactly one semester or quarter completed when you submit interest, so the December–January window has to fall inside that first year.",
      "Prepare the interest-form package: an unofficial transcript for your first semester or quarter showing your program of study and current GPA, plus a completed qualification statement and cover letter uploaded with the form. CIA says resumes without the transcript and all supplemental attachments will not be considered.",
      "Submit between December 15, 2026 and January 30, 2027, then keep your calendar open for the interview period and the two sets of follow-on appointments in the DC area that the page describes.",
    ],
    prepare: [
      "The desired qualifications include STEM exposure, foreign cultural or language ability, and applying learning quickly to complex international issues. With one semester behind you the evidence is small, so make it concrete: a language you are actively studying, a paper where you had to weigh sources you could not fully trust, or time spent working in an unfamiliar setting.",
      "Community-college students: the page asks you to address your plan to earn a bachelor's degree in the cover letter and to prove acceptance to a four-year program before the first internship. Name the transfer institution and the term you expect to start there rather than stating an intention in general terms.",
    ],
    pitfall: "CIA says you will not be able to receive college credit for this internship or list it on your resume. Two summers that cannot appear on a resume are a real cost to weigh against the Professional Trainee route the program may lead to.",
    materials: ["First-semester unofficial transcript with GPA", "Qualification statement", "Cover letter (with bachelor's plan if at a two-year college)", "Two-summer DC availability and housing budget"],
    guideSlugs: [G.cover, G.files, G.when],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "fbi-honors-internship", company: "Federal Bureau of Investigation", title: "Honors Internship Program", initials: "FB", color: "#1b365d",
    seoTitle: "FBI Honors Internship: Eligibility & How to Apply",
    seoDescription: "The FBI Honors Internship is a paid 10-week summer program for full-time US students with a 3.0 GPA. The Summer 2027 cycle closed March 5, 2026; next dates are unpublished.",
    fields: ["public-service", "technology", "business"],
    firstYear: null, years: [], yearLabel: "Graduation-date based; freshmen eligible", pay: "Paid", location: "FBI headquarters, field offices and satellite campuses", mode: "Full time, in person; up to three location preferences",
    summary: "A paid ten-week summer internship at FBI headquarters, field offices and satellite campuses for full-time students, run as a pipeline into entry-level FBI roles.",
    eligibility: [
      "The Summer 2027 announcement required US citizenship, full-time study at an accredited US college or university as an undergraduate, graduate or post-doctoral student, and a minimum age of 18. Students graduating before the June 1, 2027 start date were not eligible unless continuing their education in the semester after graduating.",
      "Applicants needed a current GPA of at least 3.0, maintained through the internship. First-semester freshmen without a college GPA qualified with a 3.0 high school GPA and submitted high school as well as college transcripts.",
      "Selection depended on completing a Top Secret clearance background investigation including a drug test, fingerprinting and a polygraph, and on being in the continental US, Hawaii or San Juan for parts of it. Applicants also had to meet every requirement on the FBI's employment-eligibility page.",
    ],
    timing: "The Summer 2027 program runs from Tuesday, June 1 to Friday, August 6, 2027. Its announcement opened February 9, 2026 and closed March 5, 2026 at 11:59 p.m. ET, about fifteen months before the internship. Pay is on the GS-4/GS-5 scale; the announcement lists base rates of $14.76 and $16.51 an hour before locality pay. Relocation and housing are not provided. Interns with a favorable evaluation can continue working 16 hours a month in the fall and spring. No Summer 2028 announcement had been published at review, and its dates are not inferred here.",
    status: "Summer 2027 cycle closed",
    deadline: "2026-03-06T04:59:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Mar 5, 2026, 11:59 p.m. ET (passed)",
    url: "https://www.usajobs.gov/job/857040400",
    sources: [
      { name: "Summer 2027 announcement: eligibility, program dates, pay, locations, documents and the closed cutoff", url: "https://www.usajobs.gov/job/857040400" },
    ],
    steps: [
      "Set a USAJOBS alert for the FBI Honors Internship Program. The last announcement was open for under four weeks in February and March, more than a year before the summer it filled.",
      "Build the application with the USAJOBS resume builder, giving start and end dates for each experience — the FBI said uploaded resumes would not be reviewed — and upload an unofficial transcript and the Program Terms Acknowledgement Form before the cutoff.",
      "Rank up to three locations among headquarters divisions in Washington, field offices and the satellite campuses in Huntsville, Quantico and Pocatello, and hold off signing a housing lease until you receive a final offer after the background investigation, as the FBI advised.",
    ],
    prepare: [
      "The resume builder asks for exact start and end dates for your experience. Assemble those dates, along with your school enrollment dates, before the window opens; a short announcement leaves little room to reconstruct them.",
      "If you graduate before June 1 of the internship summer, the only way in is continuing your education the following semester. The FBI asked those applicants to show their anticipated post-bachelor's graduation date on the resume, and recommended an optional school certification form confirming graduation date and student status.",
      "Placement depends on the FBI's needs, and a field-office choice can land you at a smaller resident agency. With no relocation or housing support, rank locations by where you could genuinely live for ten weeks, not by which office sounds most interesting.",
    ],
    pitfall: "The application closes more than a year before the internship begins. A student who starts looking in the spring before the summer they want has already missed that summer's cycle.",
    materials: ["USAJOBS resume-builder profile with exact dates", "Unofficial transcript (plus high school transcript if in first semester)", "Program Terms Acknowledgement Form", "Three ranked location preferences"],
    guideSlugs: [G.files, G.when, G.apply],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "nsa-summer-internships", company: "National Security Agency", title: "Summer Internship Programs", initials: "NS", color: "#27405e",
    seoTitle: "NSA Summer Internship: Eligibility & Timeline",
    seoDescription: "NSA runs 30+ paid summer internships for US citizens, from undergraduate freshmen up by program. Summer 2027 applications closed in early September 2026, eight months ahead.",
    fields: ["public-service", "technology", "engineering", "research"],
    firstYear: null, years: [], yearLabel: "Freshman to PhD · program-specific", pay: "Paid", location: "Fort Meade, MD, plus sites in CO, GA, HI, TX and UT", mode: "In person; 10–12 weeks",
    summary: "More than thirty paid summer internship programs in cybersecurity, computer science, mathematics, engineering, languages, intelligence analysis and business, at NSA sites that require a TS/SCI clearance.",
    eligibility: [
      "NSA's Summer 2027 announcements required US citizenship and enrollment in a degree-seeking undergraduate, graduate or doctoral program at the time of application. They describe the programs as open to undergraduate freshmen up to PhD students depending on each program's education requirements.",
      "A cumulative GPA of 3.0 or higher is preferred rather than required. Applicants must be eligible for a TS/SCI clearance after a background investigation, a full-scope polygraph and a psychological evaluation, and some may be asked to complete an unproctored online test of cognitive ability, motivation and English proficiency.",
      "Applicants had to be available and in the US for operational and technical interviews and other processing, in person and remotely, between October 2026 and April 2027.",
    ],
    timing: "NSA's student-program page says its programs are paid, with salary based on education level; the Summer 2027 announcements list pay on the GG-4 to GG-9 scale. Those announcements opened August 15–19, 2026 and closed September 5–6, 2026, with the complete application package due by September 5 (stated as 11:59 p.m. EST). The programs run 10 to 12 weeks, roughly mid-May to mid-August. Students whose school is more than 75 miles from the site are eligible for housing and round-trip travel; daily transport to work is not provided. Summer 2028 dates are not yet published.",
    status: "Summer 2027 cycle closed",
    url: "https://www.intelligencecareers.gov/nsa/students-and-internships",
    sources: [
      { name: "NSA student programs: paid, with salary based on education level", url: "https://www.intelligencecareers.gov/nsa/students-and-internships" },
      { name: "Summer 2027 Fort Meade announcement: eligibility, processing window, pay grades, housing and package deadline", url: "https://www.usajobs.gov/job/880807100" },
      { name: "Summer 2027 field-site announcement: Colorado, Georgia, Hawaii, Texas and Utah locations", url: "https://www.usajobs.gov/job/881307600" },
      { name: "Application steps, interviews and NSA's request for discretion", url: "https://www.intelligencecareers.gov/nsa/application-process" },
    ],
    steps: [
      "Watch for NSA's summer announcements from mid-August. The Summer 2027 programs were posted August 15–19, 2026 and closed about three weeks later.",
      "Apply online and separately email the documents NSA requires — an official transcript (a legible unofficial one is accepted) and a PDF resume, named in the LAST_FIRST format the announcement specifies. NSA said an application is not complete until those arrive, and one set covers every program you apply to.",
      "Keep October through April free for interviews, testing and suitability processing and answer scheduling requests quickly; NSA says most interviews are virtual, often on HireVue.",
    ],
    prepare: [
      "One application can put you in front of several of NSA's programs, so make your strongest fit obvious at the top of your resume: the languages you speak, the mathematics or security courses you have completed, the systems you have built. The announcements name preferred majors and languages — mirror those terms where they are true of you.",
      "NSA asks applicants to use discretion: tell family or close friends if you wish, but otherwise say you applied for a Department of Defense position, and do not post about your application or processing on social media. Start that habit when you apply, not when you are selected.",
    ],
    pitfall: "NSA's cycle runs most of an academic year ahead. Summer 2027 applications closed in early September 2026 for internships starting in mid-May 2027, so a student who begins looking in January has missed that summer.",
    materials: ["Transcript named per the announcement", "PDF resume", "Optional cover letter naming your target programs", "October–April availability for processing"],
    guideSlugs: [G.assessment, G.interview, G.when],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "white-house-internship", company: "The White House", title: "White House Internship Program", initials: "WH", color: "#3b4a6b",
    seoTitle: "White House Internship: Summer 2027 Deadline",
    seoDescription: "The unpaid, full-time White House Internship Program takes US citizens 18+ who have completed two semesters. Summer 2027 applications post Dec 7, 2026 and close Jan 4, 2027.",
    fields: ["public-service"],
    firstYear: null, years: [], yearLabel: "Two semesters completed by start", pay: "Unpaid", location: "Washington, DC", mode: "Full time, in person",
    summary: "An unpaid, full-time, in-person internship serving presidential and vice-presidential offices, run in spring, summer and fall sessions of about 10 to 16 weeks.",
    eligibility: [
      "Every applicant must be a US citizen, at least 18, pass drug testing and security screening, and agree to full-time in-person work.",
      "Students qualify if currently enrolled in an undergraduate or graduate degree program at a college, community college or university and have completed two semesters before the internship start date. Graduates within two years of the start date, and veterans with a high school diploma or equivalent who served on active duty in the preceding two years, also qualify.",
      "The White House lists its selection criteria as a commitment to public service, demonstrated leadership in the community, and a commitment to the mission of the Trump Administration. Its FAQ says political preference is not a deciding factor but that applicants must be dedicated to the ideals and mission of the White House.",
      "Internships are unpaid and no intern housing is provided. Any outside income, funding or housing assistance received as an intern must be pre-approved.",
    ],
    timing: "The published Summer 2027 timeline: application posted December 7, 2026; application deadline January 4, 2027; acceptance notifications begin February 15, 2027; internship from June 2 to August 6, 2027. No time of day is given for the deadline. Applications are reviewed on a rolling basis, and every material, including recommendation letters, must be in by the deadline. Interns should expect to work at least Monday to Friday, 9 a.m. to 6 p.m.; limited exceptions for class requirements still require 4.5 days a week.",
    status: "Summer 2027 application posts Dec 7",
    deadlineDate: "2027-01-04", deadlineDateLabel: "Summer 2027 · Jan 4",
    url: "https://www.whitehouse.gov/internships/apply/",
    sources: [
      { name: "Summer 2027 timeline: posting date, deadline, notifications and term dates", url: "https://www.whitehouse.gov/internships/apply/" },
      { name: "Selection criteria, general requirements and enrollment conditions", url: "https://www.whitehouse.gov/internships/selection-process/" },
      { name: "FAQ: unpaid status, hours, housing and recommendation letters", url: "https://www.whitehouse.gov/internships/faq/" },
      { name: "Program overview: sessions, length and in-person format", url: "https://www.whitehouse.gov/internships/" },
    ],
    steps: [
      "Check the two-semester rule against the June 2, 2027 start. A first-year student who finishes a second semester in May meets it; a student on a quarter calendar should confirm how the rule applies before investing in the application.",
      "Line up recommendation letters early. They can come from anyone who can speak to your qualifications, character and commitment to public service, should be addressed to the White House Internship Program where possible, and must be uploaded through the portal as PDFs.",
      "Apply through the online portal between December 7, 2026 and January 4, 2027. Hard copies are not accepted, and because review is rolling, submit as soon as the package is complete.",
    ],
    prepare: [
      "The selection criteria name community leadership and a commitment to public service. Choose one sustained responsibility — a role you held for a year, a program you ran, people who relied on you — and describe what changed because of your work, rather than listing memberships.",
      "Price the unpaid term before applying: roughly ten weeks of Washington housing and daily costs, with no program housing. The FAQ points to schools and nonprofits for assistance and requires pre-approval of any such funding, so ask your school early what it offers.",
    ],
    pitfall: "Late recommendation letters are penalized. The FAQ says every application material, letters included, must arrive by the deadline, so a letter sent a day late weakens an otherwise complete application.",
    materials: ["Two-semester check against the start date", "Recommendation letters as PDFs", "Summer housing and cost plan", "Portal submission confirmation"],
    guideSlugs: [G.letter, G.pay, G.when],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "treasury-headquarters-student-internship", company: "US Department of the Treasury", title: "Headquarters Student Internship Program", initials: "UT", color: "#2e5e4e",
    seoTitle: "Treasury Internship: Eligibility & How to Apply",
    seoDescription: "Treasury's headquarters internship is unpaid, in person in Washington, DC, and open to enrolled US-citizen students. Summer applications are announced on USAJOBS in December.",
    fields: ["public-service", "finance", "business", "technology"],
    firstYear: 1, years: [1, 2, 3, 4], yearLabel: "Enrolled students · must stay enrolled", pay: "Unpaid", location: "Washington, DC", mode: "In person; part time (20 hrs) or full time",
    summary: "Unpaid spring, summer and fall internships in Treasury's Departmental Offices, supporting economic, financial, national-security and management work in Washington, DC.",
    eligibility: [
      "Students must be US citizens and maintain enrollment throughout the internship. Treasury says students must be enrolled or accepted at an accredited institution, and that graduates may not continue past their graduation date without proof of future enrollment.",
      "The Spring 2027 announcement open at review added: active enrollment at least part time, good academic standing of 2.0 or higher on a 4.0 scale, passing a background investigation, and working at least 20 hours a week between 8 a.m. and 5 p.m. for at least 10 consecutive weeks, in person only, with relocation and housing paid by the student.",
      "Treasury seeks students from social sciences, management and law, and STEM fields. Applicants choose up to three Departmental Offices, such as Domestic Finance, Tax Policy, Economic Policy, International Affairs, or Terrorism and Financial Intelligence.",
    ],
    timing: "Treasury says it typically offers spring (January–May), summer (May–August) and fall (September–December) internships, with applications in October, December and June respectively; the program page gives months, not dates. Every opportunity is announced on USAJOBS, where the internship is listed as without compensation. At review on September 29, 2026, a Spring 2027 announcement was accepting applications with a stated close of 11:59 p.m. on September 30, 2026.",
    status: "Summer cycle: apply in December",
    url: "https://home.treasury.gov/about/careers-at-treasury/studentinternship-programs/headquarters-student-internship-program",
    sources: [
      { name: "Program description, eligibility, offices and seasonal application months", url: "https://home.treasury.gov/about/careers-at-treasury/studentinternship-programs/headquarters-student-internship-program" },
      { name: "Spring 2027 Departmental Offices announcement: conditions, hours and required documents", url: "https://www.usajobs.gov/job/884009600" },
    ],
    steps: [
      "Pick the term, then watch USAJOBS in the month Treasury gives for it: December for summer, June for fall, October for spring.",
      "Read Treasury's office descriptions and choose up to three Departmental Offices whose work you can explain an interest in; the application asks for them.",
      "Apply on USAJOBS with a resume and a current transcript (unofficial is accepted) or proof of acceptance, plus a passport or naturalization certificate if you were not born in the US. A cover letter is optional; incomplete applications are not considered.",
    ],
    prepare: [
      "The duties Treasury lists — briefing materials, talking points, literature summaries, reports on congressional hearings — are writing-heavy. A short policy memo or a tight research summary from a class is the closest thing to the actual work; use the optional cover letter to point to it.",
      "Because the role is unpaid and in person, consider part-time. The Spring 2027 announcement allowed 20 hours a week, so a student already studying in the DC area may find a semester placement more workable than an unpaid full-time summer.",
    ],
    pitfall: "Treasury publishes application months, not deadlines. Each term's openings arrive as a USAJOBS announcement with its own closing date, so gather your transcript and citizenship documents before the month begins rather than after the announcement appears.",
    materials: ["Current transcript or proof of acceptance", "Passport or naturalization certificate if born abroad", "Three Departmental Offices chosen", "Housing and transport plan for an unpaid term"],
    guideSlugs: [G.cover, G.files, G.pay],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "new-york-fed-junior-summer-analyst", company: "Federal Reserve Bank of New York", title: "Junior Summer Analyst Program", initials: "NY", color: "#5a4b2e",
    seoTitle: "New York Fed Summer Analyst Internship 2027",
    seoDescription: "The New York Fed's paid 10-week Junior Summer Analyst Program is for juniors graduating Winter 2027–Spring 2028. Summer 2027 applications close October 5, 2026.",
    fields: ["finance", "public-service", "research", "technology"],
    firstYear: 3, years: [3], yearLabel: "Undergraduate juniors", pay: "Paid", location: "New York, NY; some Markets roles in Chicago", mode: "Full time, on-site; 10 weeks",
    summary: "A paid ten-week summer program placing undergraduate juniors in one New York Fed business area, such as Markets, Research, Supervision, Audit or Technology.",
    eligibility: [
      "The program is for undergraduate juniors, and the Summer 2027 postings specify an expected graduation between Winter 2027 and Spring 2028.",
      "The postings say the roles involve confidential supervisory or FOMC information, access to which is limited to US citizens, lawful permanent residents, individuals meeting the definition of a protected individual under 8 U.S.C. § 1324b(a)(3), and certain other nonimmigrants. Non-citizens granted access must sign a declaration of intent to become a permanent resident and then a citizen when eligible.",
      "Sophomores have a separate Sophomore Career Exploration Program, whose page said Summer 2027 sophomore applications were closed. First-year students are offered a one-hour webinar rather than an internship.",
    ],
    timing: "The Junior Summer Analyst page said Summer 2027 applications were open with a deadline of Monday, October 5. The individual postings give 11:59 p.m. on October 5, 2026 and label it EST; because New York is on daylight time that day, this record uses 11:59 p.m. New York time, the earlier reading. The postings describe a paid internship with wages paid semi-monthly for the 10 weeks from an annual salary of $72,100 in the New York postings reviewed and $63,400 in a Chicago Markets posting. Summer housing is not provided. The summer programs begin in early June.",
    status: "2027 postings open at review",
    deadline: "2026-10-06T03:59:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Oct 5, 11:59 p.m. ET",
    url: "https://www.newyorkfed.org/careers/student-programs-and-internships/junior-summer-analyst-program",
    sources: [
      { name: "Junior Summer Analyst Program: Summer 2027 status, deadline and program structure", url: "https://www.newyorkfed.org/careers/student-programs-and-internships/junior-summer-analyst-program" },
      { name: "Student programs by class year, including the sophomore program and freshman webinar", url: "https://www.newyorkfed.org/careers/student-programs-and-internships" },
      { name: "Summer 2027 Markets Group junior posting (New York): graduation window, pay, housing and access rules", url: "https://rb.wd5.myworkdayjobs.com/FRS/job/New-York-NY/XMLNAME-2027-Summer-Intern----Markets-Group---New-York---Junior-Intern_R-0000033032" },
      { name: "Summer 2027 Markets Group junior posting (Chicago): salary basis", url: "https://rb.wd5.myworkdayjobs.com/FRS/job/Chicago-IL/XMLNAME-2027-Summer-Intern----Markets-Group---Chicago---Junior-Intern_R-0000033030" },
    ],
    steps: [
      "Check the graduation window first: Winter 2027 to Spring 2028. A junior on an accelerated or extended schedule can fall outside it.",
      "Choose one business area. The Summer 2027 junior postings covered Markets (New York and Chicago), Research, Supervision, Audit, Technology, People & Engagement, and Strategy & Operating Services; apply through the Federal Reserve System careers site linked from the program page.",
      "Submit before 11:59 p.m. ET on October 5, 2026, and confirm any posting on the Federal Reserve System careers site itself, which the New York Fed names as the place to verify genuine openings.",
    ],
    prepare: [
      "Each posting names the tools it wants. The Markets posting, for example, asks for spreadsheet and database skills (Excel, SQL) and data visualization (Tableau), with Python or R as a plus. Bring one analysis where you sourced untidy data, built a chart that answered a question, and could summarise the result in two sentences for a policymaker.",
      "Interns spend all ten weeks in one area, so choose deliberately. Read what that area does — open market operations, bank supervision, economic research — and be ready to say what you want to learn there that a commercial bank internship would not teach.",
    ],
    pitfall: "The Federal Reserve Board and the twelve Reserve Banks run separate programs. Applying to the New York Fed's junior program does not put you in the Board's internship pool, and the Board's rules do not govern this one.",
    materials: ["Graduation date within Winter 2027–Spring 2028", "Chosen business area", "Resume naming your quantitative tools", "Citizenship or residency status for information-access rules"],
    guideSlugs: [G.when, G.interview, G.pay],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "un-secretariat-internship", company: "United Nations Secretariat", title: "UN Internship Programme", initials: "UN", color: "#1d6fa5",
    seoTitle: "UN Internship Programme: Who Can Apply",
    seoDescription: "UN Secretariat internships take final-year bachelor's students, graduate students and recent graduates for two to six months. They are unpaid; apply to individual openings.",
    fields: ["public-service", "research", "media"],
    firstYear: null, years: [], yearLabel: "Final-year undergraduates only", pay: "Unpaid", location: "UN offices and duty stations worldwide", mode: "Full or part time; opening-specific",
    summary: "Unpaid, year-round Secretariat internships of two to six months, filled through individual openings posted by UN offices and duty stations worldwide.",
    eligibility: [
      "Undergraduates are eligible only in the final year of a first university degree. Graduate students and recent graduates also qualify; openings describe recent graduates as those typically completing their degree no more than a year before the internship starts. Proof of status is attached to the application, and an official certificate is required later.",
      "The UN says you can apply for any internship regardless of nationality. Openings require fluency in English, treat French as desirable, and require a field of study closely related to the internship; no professional work experience is needed.",
      "The Secretariat does not pay interns. Openings state that travel, visas, accommodation and living costs fall to interns or their sponsoring institutions; interns who are not citizens or residents of the host country may need their own visa and work authorization.",
    ],
    timing: "Internships run at any time of year, full or part time, for a minimum of two months full time and a maximum of six. There is no single cycle: each office posts openings with its own deadline, and the openings listed at review closed between one and four weeks after posting. An internship does not lead automatically to a UN job, and the UN asks former interns to wait at least six months before applying to Professional or Field Service posts. You may be able to earn academic credit, subject to your institution's policy.",
    status: "Rolling openings year-round",
    url: "https://careers.un.org/job-level?language=en",
    sources: [
      { name: "Internship Programme section: who can apply, duration, pay, credit and employment afterwards", url: "https://careers.un.org/job-level?language=en" },
      { name: "Example Secretariat internship opening (OCHA, New York; closes October 20, 2026): eligibility, language and cost terms", url: "https://careers.un.org/jobSearchDescription/284990?language=en" },
    ],
    steps: [
      "Check timing against the final-year rule: you must be in the final year of your bachelor's degree when you apply, or apply as a graduate close enough to your degree that you would start within about a year of completing it.",
      "Search the careers portal for internship openings by duty station and field, and read each one's dates, work arrangement and field-of-study requirement; offices set these individually.",
      "Apply to the specific opening before its deadline, stating which eligibility criterion you meet and attaching proof of enrollment or graduation.",
    ],
    prepare: [
      "Openings require a field of study closely related to the internship, so apply narrowly. A political science student applying to a humanitarian affairs office should connect a specific course, paper or project to that office's work rather than to the UN in general.",
      "Budget before applying. A placement at a headquarters duty station means carrying housing, travel and living costs for at least two months with no stipend. Ask your university early whether it funds UN internships and whether the placement can count for credit, which the UN says is possible.",
    ],
    pitfall: "Final year means final year. A US junior is not eligible for the Secretariat programme, even though graduate students and recent graduates are.",
    materials: ["Proof of final-year enrollment", "Field of study matched to the opening", "English fluency (French a plus)", "Funding plan for an unpaid placement"],
    guideSlugs: [G.international, G.pay, G.apply],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "world-bank-wbg-pioneers", company: "World Bank Group", title: "WBG Pioneers Internship Program", initials: "WB", color: "#00538a",
    seoTitle: "World Bank Internship (WBG Pioneers): How to Apply",
    seoDescription: "WBG Pioneers is the World Bank Group internship, with an undergraduate track for final-year students from member countries. Applications run January–February and July–August.",
    fields: ["public-service", "finance", "research", "engineering"],
    firstYear: null, years: [], yearLabel: "Final-year undergraduates", pay: "Check opening", location: "Washington, DC and country offices", mode: "Position-specific",
    summary: "The World Bank Group's structured internship program, with separate undergraduate and postgraduate tracks and placements in Washington, DC and country offices.",
    eligibility: [
      "The undergraduate track is for final-year students. The postgraduate track is for students pursuing a master's degree or PhD.",
      "Applicants must be citizens of a World Bank Group member country, fluent in English, and have between zero and six years of professional experience.",
      "Every application needs proof of eligibility — transcripts or enrollment letters confirming the track. For no-fee internships, a university letter is also required confirming that the internship meets academic requirements for at least one term, or that the university pays a stipend at least equal to the minimum fee level.",
      "Applicants may apply to at most three positions; applications beyond that limit are not considered.",
    ],
    timing: "The program page lists two cycles: spring/summer, with applications in January–February, a longlist in February, interviews in March and selection in April; and winter/fall, with applications in July–August, a longlist in August, interviews in September and selection in October. It lists a paid internship with a competitive hourly salary among the program features but also describes no-fee internships, so confirm whether a particular position is paid. At review the page listed one undergraduate position (a World Bank Treasury intern in Washington, DC) and one postgraduate position in Seoul.",
    status: "Spring/summer applications Jan–Feb",
    url: "https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers",
    sources: [
      { name: "WBG Pioneers: tracks, eligibility, cycle calendar, materials and application limit", url: "https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers" },
    ],
    steps: [
      "Plan around the cycle months: to intern in spring or summer, apply in January or February; for winter or fall, apply in July or August.",
      "Pick no more than three positions, checking each one's track, location, and whether it is a paid or no-fee position.",
      "Upload a CV of at most two pages, a one-page cover letter, and a transcript or enrollment letter confirming you are a final-year undergraduate — plus the university letter if the position is no-fee.",
    ],
    prepare: [
      "With only three applications allowed, match each one to your coursework. The areas run from economics and private-sector development to agriculture, urban planning and corporate functions such as accounting and IT; an engineering student and a finance student should not be applying to the same three.",
      "The cover letter is capped at one page. Spend it on one piece of work that resembles development work — an analysis of a real country's data, a field project, a policy paper — and on what you personally did in it.",
    ],
    pitfall: "Final year is the undergraduate requirement. Students earlier in their degree cannot use this track, even though the program describes itself as open to undergraduates.",
    materials: ["Two-page CV", "One-page cover letter", "Transcript or enrollment letter confirming final year", "University letter for no-fee positions"],
    guideSlugs: [G.cover, G.international, G.files],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "nytimes-internships-outside-newsroom", company: "The New York Times", title: "Internships Outside the Newsroom", initials: "NT", color: "#333333",
    seoTitle: "New York Times Internship 2027: Dates & Eligibility",
    seoDescription: "The New York Times runs a paid 10-week summer internship outside the newsroom, hybrid in New York. Summer 2027 roles post the week of Oct. 26 and close Nov. 2, 2026.",
    fields: ["media", "business"],
    firstYear: null, years: [], yearLabel: "Degree-seeking students · year not stated", pay: "Paid", location: "New York City headquarters", mode: "Hybrid, based at the New York office",
    summary: "A paid ten-week summer internship on the business side of The New York Times, with speaker sessions and work alongside company teams at its New York headquarters.",
    eligibility: [
      "The Times accepts applications from students in degree-seeking programs and from non-conventional backgrounds, including boot camps, associate programs and recent graduates. The page states no class year, GPA or major requirement.",
      "All internships are hybrid and based out of the New York office; remote internships are not offered.",
      "These are not journalism internships: the Times says it replaced its newsroom internship with a year-long fellowship in 2018. Its separate Times Corps mentorship program, open to rising college freshmen, sophomores and juniors interested in journalism, is unpaid and not employment.",
    ],
    timing: "Summer 2027 internship postings go live the week of October 26, 2026 and close on Monday, November 2, 2026, roughly a week; no closing time is published. Interviews run through the fall and early winter, with offers in late 2026 and early 2027. The Times holds business internship information sessions weekly through the end of October, the first on September 29.",
    status: "Summer 2027 roles post week of Oct 26",
    deadlineDate: "2026-11-02", deadlineDateLabel: "Summer 2027 · Nov 2",
    url: "https://www.nytco.com/careers/early-career-opportunities/internships-outside-the-newsroom/",
    sources: [
      { name: "Summer 2027 timeline, eligibility, hybrid arrangement and application guidance", url: "https://www.nytco.com/careers/early-career-opportunities/internships-outside-the-newsroom/" },
      { name: "Times Corps: a mentorship program for college journalists, not an internship", url: "https://www.nytco.com/careers/early-career-opportunities/times-corps/" },
    ],
    steps: [
      "Register for one of the weekly business internship information sessions the Times runs through October, and follow its company page on Handshake for posting alerts.",
      "When roles go live the week of October 26, read them all together and apply to the two to four most closely aligned with your experience, as the Times recommends.",
      "Submit before postings close on Monday, November 2, 2026; the published timeline has no later round.",
    ],
    prepare: [
      "With a window of about a week, the preparation has to happen before postings appear. Draft your resume and a short, adaptable paragraph on which part of the Times' business interests you — subscriptions, games, cooking, advertising, product — then tailor it to each of your two to four roles.",
      "The Times says it welcomes applicants from boot camps and associate programs. If that is your route, lead with a concrete project and its result rather than explaining the path; the program is telling you the path is not a problem.",
    ],
    pitfall: "Postings go up the week of October 26 and close November 2. Waiting to see the roles before preparing a resume leaves only a few days.",
    materials: ["Information session registration", "Resume tailored to 2–4 roles", "New York commute and hybrid schedule plan", "Submission confirmations"],
    guideSlugs: [G.when, G.apply, G.interview],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "washington-post-newsroom-internship", company: "The Washington Post", title: "Newsroom Summer Internship Program", initials: "WP", color: "#111111",
    seoTitle: "Washington Post Internship 2027: Apply by Oct 9",
    seoDescription: "The Washington Post's paid 2027 newsroom internship takes college juniors, seniors and grad students at $1,021.13 a week. Applications close at noon ET, Friday, Oct. 9, 2026.",
    fields: ["media", "arts", "technology"],
    firstYear: 3, years: [3, 4], yearLabel: "Juniors, seniors and grad students", pay: "Paid", location: "Washington, DC headquarters", mode: "Based at the D.C. newsroom",
    summary: "The Post's flagship summer newsroom internship, treating interns as staff across reporting, editing, visuals, design, audio, graphics and data.",
    eligibility: [
      "Applicants must be college juniors, seniors or graduate students enrolled in a degree program by the application deadline.",
      "Tracks posted for 2027 include reporters, digital and print desk editors, content strategy editors, designers, visual journalists, a graphics reporter, a data journalist and an audio producer, each with its own work-sample requirements.",
      "Positions are based at the Washington, D.C., headquarters, and interns are paid $1,021.13 a week.",
    ],
    timing: "All 2027 newsroom tracks share one deadline: noon Eastern on Friday, October 9, 2026. The postings went up in late August 2026. Summer 2027 program dates are not stated in the postings reviewed.",
    status: "2027 postings open at review",
    deadline: "2026-10-09T16:00:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Oct 9, noon ET",
    url: "https://washpost.wd5.myworkdayjobs.com/washingtonpostcareers",
    sources: [
      { name: "Washington Post careers site listing the 2027 newsroom internship tracks", url: "https://washpost.wd5.myworkdayjobs.com/washingtonpostcareers" },
      { name: "Reporter track: eligibility, deadline, pay and materials", url: "https://washpost.wd5.myworkdayjobs.com/washingtonpostcareers/job/DC-Washington-TWP-Headquarters/Newsroom-Summer-Internship-Program-2027--Reporters_JR-90275895" },
      { name: "Data journalist track: portfolio requirements", url: "https://washpost.wd5.myworkdayjobs.com/washingtonpostcareers/job/DC-Washington-TWP-Headquarters/Newsroom-Summer-Internship-Program-2027--Data-Journalist_JR-90275900" },
      { name: "Designer track: five-example portfolio requirement", url: "https://washpost.wd5.myworkdayjobs.com/washingtonpostcareers/job/DC-Washington-TWP-Headquarters/Newsroom-Summer-Internship-Program-2027--Designer_JR-90275903" },
    ],
    steps: [
      "Choose a track and read its materials list. Reporters send a résumé, an autobiographical essay of no more than 500 words, and no more than three clips with their role in each; data journalists may send a portfolio link or up to three data-driven clips; designers send five digital design examples in one PDF or link.",
      "Upload everything to the single field labeled Resume/Cover Letter/Work Samples, as the Post instructs, and list all professional experience with any gaps explained. Cover letters are not required.",
      "Reporters give an assignment preference in the questionnaire, then everyone submits before noon ET on Friday, October 9, 2026.",
    ],
    prepare: [
      "The reporter posting says the Post values enterprise reporting that shows creative, inventive or investigative skill above conventional coverage of news events. If you have three clips, make at least one a story you found yourself, and say exactly what you did on each, since the posting asks for your role.",
      "The 500-word autobiographical essay takes the place of a cover letter. Use it for how you came to journalism and what you want from a large newsroom, not to restate the clips the editors will already have open.",
    ],
    pitfall: "The deadline is noon Eastern, not midnight. A student in California has until 9 a.m. Pacific on October 9, not the end of that day.",
    materials: ["Autobiographical essay (500 words max)", "Clips or track portfolio with your role noted", "Résumé listing all experience and any gaps", "Assignment preference for the questionnaire"],
    guideSlugs: [G.portfolio, G.files, G.when],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "dow-jones-summer-internship", company: "Dow Jones", title: "Summer Internship Program", initials: "DJ", color: "#0a3d62",
    seoTitle: "Dow Jones Internship 2027: Eligibility & Pay",
    seoDescription: "Dow Jones' paid 10-week Summer 2027 internship runs June 7–Aug. 13, mostly in New York, for 4-year undergraduates graduating Dec. 2027 to July 2029 without visa sponsorship.",
    fields: ["media", "business", "finance", "technology"],
    firstYear: null, years: [], yearLabel: "Graduating Dec 2027–Jul 2029", pay: "Paid", location: "New York; some roles in Houston", mode: "Full time, in office; some roles hybrid",
    summary: "A paid ten-week summer program at the publisher of The Wall Street Journal, Barron's and MarketWatch, spanning business functions and several newsroom roles.",
    eligibility: [
      "Summer 2027 postings require enrollment in a four-year undergraduate degree program with graduation between December 2027 and July 2029 (US).",
      "Applicants must not require sponsorship for employment visa status, now or in the future, in the country where they apply.",
      "Individual roles add coursework minimums — for example at least one year of school toward a bachelor's for the FP&A intern, and at least two years for the business and product strategy, people, and MarketWatch reporter roles.",
      "Interns must be available full time and in office from June 7 to August 13, 2027. The postings reviewed list base pay of $28 an hour.",
    ],
    timing: "Dow Jones describes a 10-week program with more than 100 interns across teams including technology, HR and finance. Summer 2027 postings appeared on its careers site in mid-September 2026 and are reviewed on a rolling basis. Each posting reviewed prints its application deadline as November 13, 2027, which falls after the internship itself ends, so the intended date is unconfirmed and no deadline is recorded here. The Wall Street Journal's newsroom internships and the Dow Jones News Fund are listed as separate programs.",
    status: "2027 postings open at review",
    url: "https://www.dowjones.com/company/careers/teams-programs-offices/",
    sources: [
      { name: "Early-career programs: internship length and size, plus the separate WSJ and News Fund routes", url: "https://www.dowjones.com/company/careers/teams-programs-offices/" },
      { name: "Summer 2027 Business & Product Strategy posting: dates, rolling review and pay", url: "https://dowjones.wd1.myworkdayjobs.com/Dow_Jones_Career/job/NYC---1211-Ave-of-the-Americas/Summer-2027-Internship-Program---Business---Product-Strategy-Intern_Job_Req_55311" },
      { name: "Summer 2027 MarketWatch Reporter posting: program eligibility, graduation window and sponsorship condition", url: "https://dowjones.wd1.myworkdayjobs.com/Dow_Jones_Career/job/New-York-City/Summer-2027-Internship-Program---MarketWatch-Reporter-Intern_Job_Req_55302" },
      { name: "Summer 2027 FP&A posting: one-year coursework minimum", url: "https://dowjones.wd1.myworkdayjobs.com/Dow_Jones_Career/job/New-York-City/Summer-2027-Internship-Program---FP-A-Intern_Job_Req_55318" },
    ],
    steps: [
      "Check the program rules against your plans: a four-year bachelor's, graduation between December 2027 and July 2029, and no need for visa sponsorship.",
      "Search the Dow Jones careers site for Summer 2027 internship postings and read each one's coursework minimum — one year for some roles, two for others — and its location.",
      "Apply early to the roles you fit, since applications are reviewed on a rolling basis, and keep the requisition number from each posting.",
    ],
    prepare: [
      "The business roles want evidence close to the news business: audience or subscription analysis, a marketing test, a budget model. For the MarketWatch or Barron's reporting roles, bring clips that find the money or investing angle in a news event — the MarketWatch posting names that skill directly.",
      "Rolling review with an unreliable printed deadline rewards applying early. Set your own target date soon after the postings appear, and keep one core resume that you adapt for each role instead of starting from scratch each time.",
    ],
    pitfall: "The printed deadline of November 13, 2027 cannot apply to a summer 2027 internship. Do not treat it as extra time; review is rolling, and roles can fill before any deadline.",
    materials: ["Graduation date within Dec 2027–Jul 2029", "Visa sponsorship status check", "Role-specific coursework check", "Clips or work samples for newsroom roles"],
    guideSlugs: [G.apply, G.resume, G.portfolio],
    verified: REVIEWED, updated: REVIEWED,
  },
  {
    id: "ap-global-news-internship", company: "The Associated Press", title: "Global News Internship", initials: "AP", color: "#b01f24",
    seoTitle: "AP Internship: Global News Internship Guide",
    seoDescription: "The AP Global News Internship is paid and open to US and international upperclassmen, grad students and recent grads. AP expects to announce its 2027 plans early next year.",
    fields: ["media", "arts"],
    firstYear: 3, years: [3, 4], yearLabel: "College upperclassmen", pay: "Paid", location: "Recent: New York, DC, LA, Mexico City, London, Cairo, Tokyo", mode: "Location-specific",
    summary: "A paid, selective news internship at the AP, individually tailored and built around cross-format journalism in bureaus in the US and abroad.",
    eligibility: [
      "The AP says the internship is open to US and international students who are college upperclassmen or graduate students, and to recent graduates.",
      "It describes the program as paid, highly selective and individually tailored, with recent locations including New York City, Washington, Los Angeles, Mexico City, London, Cairo and Tokyo.",
      "The AP says it is evolving its internship program and expects to announce plans for 2027 early next year, so eligibility, locations and timing for the next cycle may differ from the description here.",
    ],
    timing: "No 2027 application window, deadline, term length or pay figure is published. The AP says it expects to announce 2027 plans early next year; this record does not infer dates from earlier cycles.",
    status: "2027 plans not yet announced",
    url: "https://www.ap.org/about/careers/",
    sources: [
      { name: "Global News Internship: eligibility, recent locations, application packet and 2027 status", url: "https://www.ap.org/about/careers/" },
    ],
    steps: [
      "Check the AP careers page early in 2027 for the announcement of the next program and its dates.",
      "Assemble the packet the AP describes: a resume showing your projected graduation date or education status, a 300-word personal essay, four to five examples of your best work (links to an online site preferred), and a reference letter from a prior internship supervisor, media employer or faculty adviser on college or university letterhead.",
      "If you work in photo or video, add a link to an online portfolio, then apply through whatever route the AP names when it announces 2027.",
    ],
    prepare: [
      "The 300-word essay asks two specific questions: why the AP, and how this internship fits your career goals. The AP frames the program around cross-format skills in a workplace where every word matters, so ground your answer in a time you filed quickly and got it right, rather than in admiration for the name.",
      "Request the reference letter now. It must come from someone who has supervised or taught your journalism, and it is the item most likely to hold up a packet once a window opens.",
    ],
    pitfall: "The AP has said it is changing its internship program for 2027. Treat the eligibility and packet described here as the last published version, not a promise of the next one.",
    materials: ["300-word personal essay", "Four to five work samples (links preferred)", "Reference letter", "Online portfolio for photo or video"],
    guideSlugs: [G.portfolio, G.letter, G.international],
    verified: REVIEWED, updated: REVIEWED,
  },
];
