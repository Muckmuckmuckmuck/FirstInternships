// Consulting, accounting, retail and consumer goods — sourced program batch,
// reviewed 2026-10-01.
//
// Scaffolded 2026-09-28 so that batches researched in parallel never edit the
// same file. This module is already imported and spread into PROGRAMS in
// src/content.js; filling it requires no change anywhere else.
//
// Assigned employers (research each on its own official pages; skip any whose
// official student page cannot be read or does not establish enough to write
// an accurate guide — never fill a gap from memory or a third-party site):
// McKinsey & Company, Bain & Company, Grant Thornton, RSM US, BDO USA, Crowe,
// Booz Allen Hamilton, Oliver Wyman, The Home Depot, Lowe's, Costco, Kroger,
// Starbucks, The Coca-Cola Company, Unilever, L'Oreal USA, Kraft Heinz,
// General Mills, Mondelez International, Nestle USA.
//
// Records follow the program data model in docs/CLAUDE_CODE_PLAYBOOK.md §6.
// A date published without a time of day goes in `deadlineDate` (YYYY-MM-DD)
// with `deadlineDateLabel`; `deadline` is reserved for an exact instant with a
// published time and zone.
//
// Every fact below was read on the employer's own careers pages or official
// postings on the review date. Fourteen employers were left out rather than
// guessed:
//   McKinsey     its careers site returned HTTP 503 to every request.
//   Crowe, Lowe's, Nestle USA   their Summer 2027 postings had been filled or
//               were no longer accepting applications.
//   BDO USA      its pages state that internships are paid but give no
//               eligibility, timing or locations for them.
//   Oliver Wyman, General Mills, L'Oreal USA, Unilever   no readable official
//               page described a current US undergraduate cycle.
//   The Home Depot, Kraft Heinz, The Coca-Cola Company   their posting pages
//               did not render readable text; Kraft Heinz's details appeared
//               only in search summaries, which are not a source here.
//   Costco       its listed internships were graduate pharmacy roles.
//   Kroger       no current program page or 2027 posting could be read.
//
// Year notes: Starbucks states its undergraduate program is for students in
// their junior year (third year for international students), so it carries an
// exact year. Mondelez's FAQ lists undergraduate internships under junior-year
// students, and Booz Allen's postings use graduation dates, so both carry
// nonbinding preferredYears. RSM uses completed credit hours, which do not map
// reliably to a class year.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  resume: "internship-resume-with-no-experience",
  interview: "internship-interview-guide",
  assessment: "internship-online-assessment",
  portfolio: "internship-project-portfolio",
  intl: "international-student-internship-questions",
};

export const EMPLOYERS_BUSINESS_PROGRAMS = [
  {
    id: "bain-associate-consultant-internship", company: "Bain & Company", title: "Associate Consultant Internship", initials: "BA", color: "#b0302b",
    seoTitle: "Bain ACI Internship: Eligibility, Pay & Applying",
    seoDescription: "Bain's Associate Consultant Internship puts students with one full summer left before graduation on real case teams, at $9,000 a month in the US. Deadlines vary by office.",
    fields: ["consulting", "business"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "One full summer left before graduation", pay: "Paid", location: "US offices; deadlines vary by office", mode: "Staffed on a client case team",
    summary: "Bain's Associate Consultant Internship places bachelor's and master's students with one full summer left before graduation on real client case teams after up to a week of training.",
    eligibility: [
      "Bain says the program is typically for current bachelor's and master's students with one full summer left before graduation.",
      "All disciplines and degrees are welcome. Bain looks for a strong academic background and analytical skills, plus outstanding interpersonal skills.",
      "The application asks for a resume, educational background, work experience and relevant test scores where applicable; exact requirements and deadlines vary by office.",
    ],
    timing: "Bain says exact deadlines vary by region, so check the office pages. Interns start with up to a week of intensive training led by consultants, then join a case team and own a distinct piece of a client project. US compensation is a monthly base salary of $9,000 plus benefits, and Bain pays 100% of individual employee premiums for medical, dental and vision. For second-year students, Bain's First Forward program — a 1.5-day in-person summit for sophomores in the US or Canada who are the first in their family to attend college or grew up in a lower socio-economic household — had closed applications at review and does not itself lead to an internship.",
    status: "Deadlines vary by office",
    url: "https://www.bain.com/careers/work-with-us/internships-programs/associate-consultant-internship/",
    sources: [
      { name: "Associate Consultant Internship page: who it is for, the work, training, requirements and US pay", url: "https://www.bain.com/careers/work-with-us/internships-programs/associate-consultant-internship/" },
      { name: "First Forward page: sophomore eligibility, summit format and application status", url: "https://www.bain.com/careers/work-with-us/internships-programs/first-forward/" },
    ],
    steps: [
      "Choose the office you want on Bain's site and read its deadline and requirements; Bain says both vary by region.",
      "Submit your resume, education details, work experience and any relevant test scores through the application.",
      "If you are a sophomore, watch for First Forward's next cycle. Bain encourages students it does not select to apply for the Associate Consultant Internship in the summer before their third year.",
    ],
    prepare: [
      "Interns own a distinct piece of a live case and present findings, so the resume should show that you have owned part of an analysis from start to finish: a question you scoped, the information you gathered and the recommendation you made. A club or class project with a clear decision at the end is relevant; describe the decision, not just the activity.",
      "Because all disciplines are welcome, a non-business major is not something to explain away. Pick one example where your field's way of thinking — a historian weighing sources, an engineer testing assumptions — improved a group's conclusion, and be ready to walk through it with numbers where you have them. This is our suggestion, not Bain's process.",
    ],
    pitfall: "\"One full summer left before graduation\" is the intended timing. A student graduating before the summer has no internship summer left, and Bain points sophomores to the internship in the summer before their third year.",
    materials: ["Target office and its deadline", "Resume", "Education details and any test scores", "One end-to-end analysis example", "First Forward timing if you are a sophomore"],
    guideSlugs: [G.interview, G.apply, G.resume],
    verified: "2026-10-01",
  },
  {
    id: "grant-thornton-internships", company: "Grant Thornton", title: "Audit, Tax and Advisory Internships", initials: "GT", color: "#5b2c83",
    seoTitle: "Grant Thornton Internship: Terms & How to Apply",
    seoDescription: "Grant Thornton's audit, tax and advisory internships for undergraduate and graduate students run in winter, summer or fall. Freshmen and sophomores can try Empower first.",
    fields: ["consulting", "finance", "business"],
    firstYear: null, years: [], yearLabel: "Undergraduate and graduate students", pay: "Check opening", location: "Offices nationwide", mode: "Winter, summer or fall terms",
    summary: "Grant Thornton's audit and assurance, tax and advisory internships for undergraduate and graduate students, offered in winter, summer and fall terms at offices nationwide, plus a one-day Empower program for freshmen and sophomores.",
    eligibility: [
      "Grant Thornton says its internships in audit and assurance, tax and advisory are open to students in undergraduate and graduate programs.",
      "Its Empower program is for college freshmen and sophomores with an interest in accounting; it is a development program, not an internship.",
      "The students page states no GPA, class year or pay for the internships themselves; individual postings carry those details.",
    ],
    timing: "Grant Thornton offers winter (January to March or April), summer (June to July or August) and fall (September to November or December) internships nationwide. Interns get a coaching structure of buddies, coaches and mentors, plus social events, leadership development and community service projects. Empower is a virtual one-day program in June that covers professional and leadership skills and mentorship sessions; sign-ups for the 2027 program were open at review. The pages reviewed publish no internship pay or deadline.",
    status: "Internships by posting; 2027 Empower sign-up open",
    url: "https://www.grantthornton.com/careers/students",
    sources: [
      { name: "Students page: service lines, eligibility, internship terms, support and the Empower program", url: "https://www.grantthornton.com/careers/students" },
      { name: "Empower page: one-day virtual June program and 2027 sign-up", url: "https://www.grantthornton.com/careers/students/jump-start-your-future-with-empower" },
    ],
    steps: [
      "Choose a service line — audit and assurance, tax or advisory — and a term. Winter internships fall during the spring academic term, so check credit and class arrangements with your school first.",
      "Apply through Grant Thornton's job portal from the students page, or ask your local campus recruiter which postings fit your office and term.",
      "If you are a freshman or sophomore, sign up for Empower, the virtual one-day June program, as an earlier first step.",
    ],
    prepare: [
      "Winter internships run from January to March or April, the busiest stretch of audit and tax work. If you choose a winter term, plan how you will keep your credits on track, and ask the recruiter what hours to expect before you accept. This is our planning advice.",
      "For audit and tax, the most persuasive evidence is often unglamorous: reconciling a club's books, preparing returns in a volunteer tax-help program, or a spreadsheet check that caught an error. Describe what you checked and what you found, because that is close to the work itself.",
    ],
    pitfall: "Winter internships run from January to March or April, during the academic spring term. Accepting one without arranging your coursework can delay graduation.",
    materials: ["Service line and preferred term", "Office location", "Resume with accounting coursework", "Plan for spring classes if choosing winter", "Empower sign-up (freshmen and sophomores)"],
    guideSlugs: [G.apply, G.resume, G.when],
    verified: "2026-10-01",
  },
  {
    id: "rsm-tax-assurance-internships", company: "RSM US", title: "Tax and Assurance Internships, 2027", initials: "RS", color: "#0f6b8a",
    seoTitle: "RSM US Internship 2027: Tax & Assurance Roles",
    seoDescription: "RSM US posts Summer and Winter 2027 tax and assurance internships by office. The tax posting reviewed requires 90 credit hours and an accounting major and pays $30–$35 an hour.",
    fields: ["finance", "consulting", "business"],
    firstYear: null, years: [], yearLabel: "90 credit hours (tax posting)", pay: "Paid", location: "Cincinnati and other offices by posting", mode: "Client travel required",
    summary: "RSM US's tax and assurance internships, posted by office and specialty for Summer 2027 and Winter 2027, with credit-hour and accounting-major requirements and travel to client sites.",
    eligibility: [
      "The Accounting Methods and Periods Tax Intern – Summer 2027 posting requires 90 completed credit hours and work toward a bachelor's degree from an accredited university as an accounting major; a 3.0 GPA is preferred.",
      "RSM says it does not intend to hire entry-level candidates who require sponsorship now or in the future.",
      "Travel to assigned client locations is required, along with access to reliable transportation.",
    ],
    timing: "RSM posts separate Summer 2027 and Winter 2027 internships by office and specialty, including tax and assurance roles. The Cincinnati tax posting publishes pay of $30 to $35 an hour and gives no application deadline or internship dates. Check each posting for its own requirements, since specialty and office change the details.",
    status: "Summer and Winter 2027 postings listed",
    url: "https://jobs.rsmus.com/posting/accounting-methods-and-periods-tax-intern---summer-2027/JR117381/",
    sources: [
      { name: "Accounting Methods and Periods Tax Intern – Summer 2027 posting: credit hours, major, GPA, sponsorship, travel and pay", url: "https://jobs.rsmus.com/posting/accounting-methods-and-periods-tax-intern---summer-2027/JR117381/" },
    ],
    steps: [
      "Search RSM's job site for Summer 2027 or Winter 2027 internships in your office and specialty.",
      "Check the posting's credit-hour, major, GPA and sponsorship requirements against your transcript.",
      "Apply with a resume that shows completed credit hours, GPA and the accounting courses you have finished.",
    ],
    prepare: [
      "Completed credit hours, not class year, set the threshold. Count the credits you will have finished by the start date, including transfer and AP credit your school has accepted, and state the total on your resume so a reviewer does not have to calculate it.",
      "Client travel is part of the job. Be ready to say how you will get to client sites, and treat it as a chance to show reliability: a job where you managed your own schedule across locations is relevant evidence. This is our suggestion, not an RSM requirement.",
    ],
    pitfall: "The tax posting requires 90 completed credit hours — on a typical 120-credit degree, about three years of full-time study — so count your credits rather than relying on your class label.",
    materials: ["Chosen office, specialty and term", "Completed credit-hour total", "Transcript with accounting courses and GPA", "Reliable transportation plan for client travel", "Work authorization without sponsorship"],
    guideSlugs: [G.apply, G.resume, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "booz-allen-summer-games", company: "Booz Allen Hamilton", title: "Summer Games Internship 2027", initials: "BH", color: "#2f4b7c",
    seoTitle: "Booz Allen Summer Games Internship 2027",
    seoDescription: "Booz Allen's 2027 Summer Games internships put teams of interns on challenge projects. Postings ask for a STEM bachelor's by summer 2028 or 2029 and Secret clearance eligibility.",
    fields: ["technology", "consulting", "engineering", "public-service"],
    firstYear: null, years: [], preferredYears: [2, 3], yearLabel: "STEM bachelor's by summer 2028 or 2029", pay: "Paid", location: "McLean, VA; Atlanta, GA; and other offices by posting", mode: "Hybrid; frequent on-site work",
    summary: "Booz Allen's Summer Games internship puts interns in teams that each tackle a challenge project with mentors, ending in a Challenge Cup competition and presentation to senior leaders.",
    eligibility: [
      "The 2027 Summer Games Data Scientist (Atlanta) and Software Developer (McLean) postings require being scheduled to obtain a bachelor's degree in a technology, engineering or mathematics field by summer 2028 or summer 2029.",
      "Both require the ability to obtain a Secret clearance, and selected applicants are subject to a security investigation.",
      "Neither posting states a GPA requirement. Booz Allen's university page lists other 2027 Summer Games roles, such as systems engineering, posted separately.",
    ],
    timing: "Summer Games interns work in teams on challenge projects, each with mentorship, and finish with a Challenge Cup competition and a presentation to senior leadership. The postings are hybrid, with frequent work from a Booz Allen facility. Pay is published as annualized ranges: $61,900 to $141,000 for the Atlanta Data Scientist posting and $53,000 to $108,000 for the McLean Software Developer posting. Each posting closes within 90 days of its posting date and gives no internship dates.",
    status: "2027 postings open at review",
    url: "https://careers.boozallen.com/talent/university",
    sources: [
      { name: "University talent page: current 2027 Summer Games intern postings", url: "https://careers.boozallen.com/talent/university" },
      { name: "2027 Summer Games Data Scientist Intern (Atlanta) posting: program, degree timing, clearance, work model and pay", url: "https://careers.boozallen.com/jobs/JobDetail/Atlanta-University-2027-Summer-Games-Data-Scientist-Intern-Atlanta-GA-R0248140/129565" },
      { name: "2027 Summer Games Software Developer Intern (McLean) posting: degree timing, clearance, work model and pay", url: "https://careers.boozallen.com/talent/JobDetail?jobId=129513" },
    ],
    steps: [
      "Open the university talent page and choose a 2027 Summer Games posting by role and location; each lists its own requirements and pay.",
      "Confirm your degree field and graduation timing match, and that you can obtain a Secret clearance.",
      "Apply before the posting closes; each closes within 90 days of being posted.",
    ],
    prepare: [
      "The Summer Games is a team competition, so show how you work in a small team under a deadline: a hackathon, a capstone or a competition entry where you can say what you built, what a teammate built and how you decided between approaches.",
      "Clearance processing relies on accurate, consistent personal history. Gather addresses, employment dates and references before you apply, and answer every form question the same way each time. This is our suggestion; follow the security office's instructions if you are selected.",
    ],
    pitfall: "Secret clearance eligibility is a requirement, not a preference, and the security investigation happens after selection. A student who cannot obtain a Secret clearance cannot take these roles, however strong the technical fit.",
    materials: ["Chosen Summer Games posting", "STEM degree and graduation date", "Team project example", "Personal history details for a clearance", "Preferred office location"],
    guideSlugs: [G.portfolio, G.interview, G.apply],
    verified: "2026-10-01",
  },
  {
    id: "starbucks-summer-internship", company: "Starbucks", title: "Summer Internship Program", initials: "SB", color: "#1e6b4d",
    seoTitle: "Starbucks Internship: Who Can Apply & When",
    seoDescription: "Starbucks' paid, full-time 10-week internship at its Seattle headquarters is for students in their junior year of college. Applications open around fall each year.",
    fields: ["consumer", "business", "technology"],
    firstYear: 3, years: [3], yearLabel: "Junior year (third year intl.)", pay: "Paid", location: "Seattle headquarters", mode: "Full time, 40 hours a week",
    summary: "Starbucks' 10-week paid summer internship at its Seattle headquarters for college students in their junior year, with project work, executive roundtables and relocation support available.",
    eligibility: [
      "Starbucks says college students who are considered in their junior year of college, or third year for international students, can apply for the undergraduate internship program.",
      "Students in the second year of an MBA program apply to a separate MBA Internship Program.",
      "The internship is paid and full time, at 40 hours a week, for 10 weeks at Starbucks' Seattle headquarters.",
    ],
    timing: "Starbucks describes a 10-week program at its headquarters in Seattle with meaningful project work, roundtables with executives and leadership, and professional development workshops; relocation support is available. Applications open around fall each year. The program page names no year, dates or deadline, so search the Career Hub for current internship postings.",
    status: "Applications open around fall",
    url: "https://careers.starbucks.com/discover-opportunities/internships/",
    sources: [
      { name: "Internships page: eligibility, length, location, pay, perks and application timing", url: "https://careers.starbucks.com/discover-opportunities/internships/" },
    ],
    steps: [
      "Log in to Starbucks' Career Hub and search \"Internship\" to see the postings currently open.",
      "If none fit yet, create a job alert; Starbucks says applications open around fall each year.",
      "Apply to the postings that match your work, and plan for 10 weeks of full-time work in Seattle.",
    ],
    prepare: [
      "Starbucks frames the internship around a meaningful project. Choose one past project you can describe like a work assignment — the goal, who relied on it, what you delivered and how you knew it worked — and lead with it, so the reviewer can picture you owning a summer project.",
      "Store experience counts, but describe it in business terms: a process you improved, a peak-hour problem you solved, or numbers you tracked. A barista job described only by its duties undersells what a corporate team would value. This is our suggestion, not a Starbucks requirement.",
    ],
    pitfall: "The undergraduate program is for students considered in their junior year (third year for international students). Being a sophomore at application time or a senior does not match the stated group.",
    materials: ["Career Hub account and job alert", "Resume led by one project", "Confirmation you are in your junior year", "Availability for 10 weeks in Seattle", "Questions about relocation support"],
    guideSlugs: [G.apply, G.resume, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "mondelez-summer-internship", company: "Mondelēz International", title: "Taste The Future Summer Internships", initials: "MD", color: "#4b2a7b",
    seoTitle: "Mondelez Internship: Eligibility, Pay & Housing",
    seoDescription: "Mondelēz's paid 10–12 week US summer internships recruit from early September with rolling interviews through February, and eligible interns get subsidized furnished housing.",
    fields: ["consumer", "manufacturing", "business", "operations"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "Junior-year undergraduates (FAQ)", pay: "Paid", location: "US sites by function", mode: "Full summer program",
    summary: "Mondelēz International's paid 10-to-12-week US summer internships across R&D, sales, packaging, finance, supply chain and manufacturing, with about 90 to 100 interns each summer.",
    eligibility: [
      "Mondelēz's early-careers FAQ lists its undergraduate summer internships for undergraduates in their junior year of study, across functions such as research and development, manufacturing and IT.",
      "Students must be enrolled in a four-year college program pursuing a bachelor's degree (or an MBA or master's program) and be available for the full summer program.",
      "Students must be authorized to work in the US on a full-time and permanent basis without requiring sponsorship now or in the future.",
    ],
    timing: "Applications for summer internships open in early September, with on-campus and virtual interviews on a rolling basis through February. The program lasts 10 to 12 weeks and has 90 to 100 summer interns a year across US functions, including research and development, sales, packaging, corporate finance, customer service and supply chain logistics, and manufacturing. All summer interns are paid, and fully furnished subsidized housing is provided for interns who meet the eligibility guidelines. Pay rates are not published on these pages.",
    status: "Applications open early September; rolling interviews",
    url: "https://www.mondelezinternational.com/united-states/early-careers/",
    sources: [
      { name: "US early careers page: program length, functions, work authorization and housing", url: "https://www.mondelezinternational.com/united-states/early-careers/" },
      { name: "US early careers FAQ: application timing, class year, requirements, pay and housing", url: "https://www.mondelezinternational.com/United-States/Early-Careers/Early-Careers-Program-FAQ/" },
    ],
    steps: [
      "Pick the function that matches your degree — R&D, manufacturing, packaging, finance, supply chain, sales or IT — from the early careers pages.",
      "Apply from early September through Mondelēz's job search; interviews run on campus and virtually on a rolling basis through February.",
      "Confirm you meet the work-authorization rule and can be available for the whole summer, and ask about housing eligibility if you need it.",
    ],
    prepare: [
      "Because interviews are rolling from September to February, an early application is reviewed while more places remain open. Have a resume ready for September that names the function you want and one project that matches it, such as a food-science lab, a packaging design or a supply-chain case.",
      "Manufacturing and packaging roles reward practical evidence: a lab where you followed a safety or quality procedure, a machine shop project, or a time you found the cause of a defect. Describe the procedure and the result, not just the course title. This is our suggestion, not a Mondelēz requirement.",
    ],
    pitfall: "The work-authorization rule is strict: permanent US authorization without needing sponsorship now or in the future. Students who will need sponsorship after graduation do not meet it.",
    materials: ["Chosen function", "Resume naming one matching project", "Permanent US work authorization", "Full-summer availability", "Housing eligibility question"],
    guideSlugs: [G.when, G.apply, G.intl],
    verified: "2026-10-01",
  },
];
