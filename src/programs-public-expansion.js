// Regional Federal Reserve Bank and federal-agency internships — sourced
// program batch, reviewed 2026-10-01.
//
// Every fact below was read on the bank's or agency's own pages on the review
// date. The Federal Reserve Board and the New York Fed already have guides.
// Left out rather than guessed:
//   Boston, St. Louis, Kansas City, Minneapolis Feds   their internship pages
//               state no eligibility rules beyond "students", so a guide would
//               have nothing specific to say.
//   GAO          its student page gives hours and enrollment only.
//   OCC          its student-program pages redirect to a general careers page.
//   National Gallery of Art   its internship page refused automated reads.
//
// Notes on dates: the SF Fed's October 15, 2026 deadline is published without
// a time, so it is a date-only cutoff. The Supreme Court publishes recurring
// window dates without a year, and the SEC's tentative timeline stops at the
// spring 2027 term, so neither carries a structured cutoff. Banks that say
// postings open "in the fall" are not given a guessed 2027 date.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  references: "ask-for-internship-recommendation-letter",
  files: "internship-application-file-format",
  interview: "internship-interview-guide",
  cover: "internship-cover-letter",
  pay: "do-internships-pay",
  resume: "internship-resume-with-no-experience",
  international: "international-student-internship-questions",
};

const FRS_JOBS = "Federal Reserve System job portal";

export const PUBLIC_PROGRAMS = [
  {
    id: "sf-fed-summer-internship", company: "Federal Reserve Bank of San Francisco", title: "Summer Internship Program", initials: "SF", color: "#1f4e79",
    seoTitle: "SF Fed Internship 2027: Eligibility & Deadline",
    seoDescription: "The San Francisco Fed's paid 10.5-week summer internship takes students graduating December 2027 to June 2029. 2027 applications close October 15, 2026.",
    fields: ["finance", "public-service", "technology", "research"],
    firstYear: null, years: [], yearLabel: "Dec 2027–Jun 2029 graduation", pay: "Paid", location: "San Francisco or Los Angeles, CA", mode: "Full time, 40 hours a week for 10.5 weeks",
    summary: "The San Francisco Fed's paid summer internship at its San Francisco head office and Los Angeles branch, for full-time students graduating between December 2027 and June 2029.",
    eligibility: [
      "Full-time undergraduate or graduate students currently enrolled at an accredited community college, four-year college or university, with an expected graduation date between December 2027 and June 2029.",
      "U.S. citizenship or permanent residency.",
      "A keen interest in public service and the SF Fed's mission-driven work, demonstrated leadership ability, and the ability to work 40 hours a week for the full 10.5-week internship.",
    ],
    timing: "The SF Fed accepts 2027 Summer Internship applications from September 14, 2026, and the deadline to apply is October 15, 2026. It reviews applications and resumes from September to November, interviews in October and November, and sends selection and acceptance letters between November 2026 and January 2027. The internship begins in May 2027 for semester students and June 2027 for quarter students. Positions are in the San Francisco head office and the Los Angeles branch, across business lines such as Banking Supervision, Identity Access Management, Financial Services and Economic Research. The page describes the internship as paid but gives no pay figure.",
    status: "2027 applications open until Oct 15",
    deadlineDate: "2026-10-15", deadlineDateLabel: "Summer 2027 · Oct 15",
    url: "https://www.frbsf.org/work-with-us/careers/sf-fed-internship-program/",
    sources: [
      { name: "SF Fed Internship Program: eligibility, graduation window, locations and 2027 application timeline", url: "https://www.frbsf.org/work-with-us/careers/sf-fed-internship-program/" },
    ],
    steps: [
      "Check that your expected graduation date falls between December 2027 and June 2029 and that you are a U.S. citizen or permanent resident; both are stated requirements.",
      `Open the SF Fed's internship listings through the program page's "View Open Positions" link in the ${FRS_JOBS} and choose the roles whose business line fits your studies.`,
      "Submit before the October 15, 2026 deadline. Interviews run in October and November, and selection and acceptance letters go out from November through January.",
    ],
    prepare: [
      "Interest in public service is a listed requirement, not a bonus. Prepare two or three sentences on why a central bank's work — supervising banks, running payment services, studying the regional economy — matters to you, tied to something you have actually done. This is our suggestion, not an SF Fed rule.",
      "Demonstrated leadership is also required. Pick two concrete examples, such as organizing a club project or training new coworkers, and note what changed because of you, so you can describe them briefly in an October interview.",
    ],
    pitfall: "The 2027 deadline is October 15, 2026 — earlier than many summer programs. A student who waits for spring recruiting misses this cycle, and quarter-system students should note their start is June rather than May.",
    materials: ["Graduation date between Dec 2027 and Jun 2029", "Resume", "Short answer on interest in public service", "Two leadership examples", "Semester or quarter start-date plan"],
    guideSlugs: [G.when, G.interview, G.apply],
    verified: "2026-10-01",
  },
  {
    id: "atlanta-fed-summer-internships", company: "Federal Reserve Bank of Atlanta", title: "Summer Internship Program", initials: "AF", color: "#2b4c7e",
    seoTitle: "Atlanta Fed Internship: Pay, Eligibility & Dates",
    seoDescription: "The Atlanta Fed pays undergraduate summer interns $18.75 an hour for a full-time, in-person 10–12 week program. Applications open in early fall; offers start in January.",
    fields: ["finance", "public-service", "business"],
    firstYear: null, years: [], yearLabel: "Enrolled students returning to study", pay: "Paid", location: "Atlanta, GA or an Atlanta Fed branch", mode: "In person, full time for 10–12 weeks",
    summary: "The Atlanta Fed's paid, in-person summer internship for undergraduate and graduate students returning to school, with published hourly rates and a January offer timeline.",
    eligibility: [
      "Applicants must be currently enrolled in an undergraduate or graduate degree program at an accredited university and returning to continue their studies after the internship.",
      "For most roles, interns must be U.S. citizens or green card holders. Some roles accept international students eligible for curricular practical training (CPT), and the Atlanta Fed cannot sponsor visas.",
      "Selection weighs scholastic achievement, recommendations, completed relevant coursework and, in some cases, grade point average. Internships are in person at the Atlanta office or a branch office.",
    ],
    timing: "Summer intern applications open in early fall. Interviews and selection begin in late fall, and the Atlanta Fed starts making offers in January. The summer program begins in mid-May and runs until the end of July, depending on the calendar, at 40 hours a week for 10 to 12 weeks. Undergraduate interns are paid $18.75 an hour and graduate interns $22.50 an hour. The Atlanta Fed also describes Survey Center internships with fall and spring (10 to 15 hours a week, hybrid or remote) and summer (up to 30 hours a week, hybrid preferred) schedules.",
    status: "Opens early fall; offers from January",
    url: "https://www.atlantafed.org/who-we-are/careers/internships",
    sources: [
      { name: "Atlanta Fed internships: eligibility, citizenship, pay rates, schedule and timeline", url: "https://www.atlantafed.org/who-we-are/careers/internships" },
    ],
    steps: [
      `From early fall, search the Atlanta Fed's internship openings in the ${FRS_JOBS} and choose roles whose department matches your coursework.`,
      "Prepare a resume and a transcript. Selection considers scholastic achievement, recommendations and relevant coursework, and some roles also look at GPA.",
      "Expect interviews from late fall and offers beginning in January for the mid-May start.",
    ],
    prepare: [
      "Recommendations are a stated selection factor. Ask a professor or supervisor who has seen a specific piece of your work before interviews begin in late fall, and give them a short summary of the role. This is our suggestion, not an Atlanta Fed rule.",
      "If you are an international student, ask your international student office early whether you can use CPT for a summer internship, because only select Atlanta Fed roles are open to CPT-eligible students and no visas are sponsored.",
    ],
    pitfall: "The internship is in person. The page lists hourly pay but no housing support, so plan where you would live near Atlanta or a branch office before you accept.",
    materials: ["Resume", "Transcript", "Recommendation contacts", "Relevant coursework list", "CPT eligibility check (international students)"],
    guideSlugs: [G.references, G.interview, G.pay],
    verified: "2026-10-01",
  },
  {
    id: "dallas-fed-summer-internships", company: "Federal Reserve Bank of Dallas", title: "Summer Internship Program", initials: "DF", color: "#3a5f8f",
    seoTitle: "Dallas Fed Internship: Eligibility & How to Apply",
    seoDescription: "The Dallas Fed's paid, full-time summer internships in Dallas, El Paso, Houston and San Antonio need a 3.0 GPA. Postings open in the fall; apply early.",
    fields: ["finance", "public-service", "research", "technology"],
    firstYear: null, years: [], yearLabel: "Enrolled students · 3.0 GPA", pay: "Paid", location: "Dallas, El Paso, Houston or San Antonio, TX", mode: "Full time, 8 a.m.–5 p.m. weekdays",
    summary: "The Dallas Fed's paid, full-time summer internships across its four Texas offices, for undergraduate and graduate students with at least a 3.0 GPA.",
    eligibility: [
      "Current enrollment in an undergraduate or graduate program at an accredited college or university.",
      "A minimum 3.0 GPA.",
      "The ability to work 40 hours a week throughout the internship.",
    ],
    timing: "Internship postings open in the fall for positions starting the following summer, and the Dallas Fed strongly encourages candidates to apply early. Interns work 8 a.m. to 5 p.m., Monday through Friday. The internships are paid; the bank describes its intern salaries as competitive without publishing a figure. Interns are hired in Dallas, El Paso, Houston and San Antonio across departments including Research, Banking Supervision, IT and Communications.",
    status: "Postings open in the fall",
    url: "https://www.dallasfed.org/careers/intern",
    sources: [
      { name: "Dallas Fed internships: eligibility, GPA, hours, locations and interview process", url: "https://www.dallasfed.org/careers/intern" },
    ],
    steps: [
      `Watch the Dallas Fed's openings in the ${FRS_JOBS} as fall postings appear, and apply early, as the bank encourages.`,
      "Submit a current resume for each opening that matches your major and the office you can work in.",
      "Prepare for a phone interview followed by one or more interviews with the department hiring team.",
    ],
    prepare: [
      "The Dallas Fed asks candidates to apply early, so have your resume finished before the fall semester starts rather than writing it once postings appear. This is our suggestion, not a Dallas Fed rule.",
      "For the phone screen, prepare a two-minute explanation of one project or class assignment where you analyzed data or explained an economic idea, and connect it to the department you applied to.",
    ],
    pitfall: "The 3.0 GPA is a stated minimum, not a guideline. If your cumulative GPA is close to it, check how your college rounds it before applying.",
    materials: ["Current resume", "Cumulative GPA (3.0 minimum)", "Preferred office: Dallas, El Paso, Houston or San Antonio", "Phone-interview examples"],
    guideSlugs: [G.interview, G.when, G.resume],
    verified: "2026-10-01",
  },
  {
    id: "cleveland-fed-internships", company: "Federal Reserve Bank of Cleveland", title: "Summer Internship Program", initials: "CF", color: "#244b6b",
    seoTitle: "Cleveland Fed Internship: Eligibility & Timeline",
    seoDescription: "The Cleveland Fed's paid 10–12 week summer internships in Cleveland, Cincinnati and Pittsburgh take students with a semester left. Openings post September to November.",
    fields: ["finance", "public-service", "research", "technology"],
    firstYear: null, years: [], yearLabel: "At least one semester left to complete", pay: "Paid", location: "Cleveland, OH; Cincinnati, OH; Pittsburgh, PA", mode: "Full time, 40 hours a week for 10–12 weeks",
    summary: "The Cleveland Fed's paid 10- to 12-week summer internships in Cleveland, Cincinnati and Pittsburgh, for undergraduate and graduate students with at least one semester left.",
    eligibility: [
      "Current undergraduate or graduate students who should have at least one semester left to complete in school.",
      "Applicants must be able to work 40 hours a week for a 10- to 12-week internship that starts as early as May and ends as late as September.",
      "Every opening requires a resume, and some roles also require additional documents such as transcripts.",
    ],
    timing: "Internship openings are posted between September and November for positions starting the following summer, and the Cleveland Fed hires candidates from across the country, not only from the Cleveland area. The selection process may include one or more interviews with human resources and the department hiring team. The internships are paid; the bank describes its salaries as competitive without publishing a figure. The Cleveland Fed has offices in Cleveland, Cincinnati and Pittsburgh.",
    status: "Openings post September–November",
    url: "https://www.clevelandfed.org/careers/internships",
    sources: [
      { name: "Cleveland Fed internships: eligibility, schedule, posting window, documents and offices", url: "https://www.clevelandfed.org/careers/internships" },
    ],
    steps: [
      `Look for Cleveland Fed internship openings in the ${FRS_JOBS} between September and November.`,
      "Submit a resume for each opening, plus any additional documents, such as a transcript, that the posting asks for.",
      "Prepare for one or more interviews with human resources and the department hiring team.",
    ],
    prepare: [
      "The posting window closes in November, before many students start a summer search. Put a reminder in early September to check the openings, and keep a transcript download ready for roles that ask for one. This is our suggestion, not a Cleveland Fed rule.",
      "The internship can run from May into September. Compare your college's fall start date with the role's 10- to 12-week schedule before you apply, and mention any constraint early.",
    ],
    pitfall: "Students in their final semester do not meet the stated rule: you should still have at least one semester left to complete after the internship.",
    materials: ["Resume", "Transcript if the role requests one", "Semester-remaining check", "Available summer dates (May–September)"],
    guideSlugs: [G.when, G.interview, G.files],
    verified: "2026-10-01",
  },
  {
    id: "richmond-fed-summer-internships", company: "Federal Reserve Bank of Richmond", title: "Summer Internship Program", initials: "RF", color: "#1e5a7a",
    seoTitle: "Richmond Fed Internship 2027: Eligibility & Dates",
    seoDescription: "The Richmond Fed's paid, on-site summer internship runs 10–12 weeks for college sophomores, juniors, seniors and graduate students. 2027 applications open in the fall.",
    fields: ["finance", "public-service", "technology", "business"],
    firstYear: 2, years: [2, 3, 4], yearLabel: "Sophomores, juniors and seniors", pay: "Paid", location: "Richmond Fed offices (Richmond, Baltimore, Charlotte)", mode: "Paid, on-site; 10–12 weeks",
    summary: "The Richmond Fed's paid, on-site summer internship for college sophomores, juniors, seniors and graduate students, with co-op roles that can last up to a year.",
    eligibility: [
      "College sophomores, juniors, seniors and graduate students may apply during the Richmond Fed's open application periods in early fall and winter.",
      "Summer internships and co-ops are paid, on-site work; co-operative education roles can last up to one year.",
      "The program page states no GPA or citizenship rule; each posting lists its own requirements.",
    ],
    timing: "The Richmond Fed says applications for its 2027 Summer Internship Program will open in the fall, and it takes applications during open periods in early fall and winter. The summer program typically runs 10 to 12 weeks. Interns complete tasks or a project designed to give them a broad understanding of one of the bank's job areas, such as Human Resources, Supervision and Regulation, or Information Technology Systems. The bank's headquarters is in Richmond, with additional offices in Baltimore and Charlotte.",
    status: "2027 applications open in the fall",
    url: "https://www.richmondfed.org/about_us/careers/students_and_recent_graduates/internships",
    sources: [
      { name: "Richmond Fed Internship Program: eligible class years, duration, job areas and 2027 timing", url: "https://www.richmondfed.org/about_us/careers/students_and_recent_graduates/internships" },
    ],
    steps: [
      `Check the Richmond Fed's postings in the ${FRS_JOBS} this fall, when 2027 Summer Internship applications open, and again in winter.`,
      "Read each posting's requirements, since the program page leaves GPA and work-authorization rules to individual roles.",
      "Apply to the job area that fits your studies, such as Human Resources, Supervision and Regulation, or Information Technology Systems.",
    ],
    prepare: [
      "Interns work on a project meant to explain one job area, so say which area you want and why. A sophomore can point to an intro economics, accounting or programming course and one thing they built or analyzed in it. This is our suggestion, not a Richmond Fed rule.",
      "If you would consider a longer placement, read the co-op postings too: they can last up to a year, which may suit a college with a co-op calendar.",
    ],
    pitfall: "First-year students are not in the eligible list. The program names sophomores, juniors, seniors and graduate students.",
    materials: ["Resume", "Preferred job area", "Relevant coursework list", "Summer or co-op availability"],
    guideSlugs: [G.when, G.resume, G.apply],
    verified: "2026-10-01",
  },
  {
    id: "philadelphia-fed-internships", company: "Federal Reserve Bank of Philadelphia", title: "Summer Internship Program", initials: "PF", color: "#2d4f73",
    seoTitle: "Philadelphia Fed Internship: Eligibility & Terms",
    seoDescription: "The Philadelphia Fed's paid summer internships take full-time undergraduate, graduate and Ph.D. students at accredited four-year colleges for 10 weeks at 40 hours a week.",
    fields: ["finance", "public-service", "business", "technology"],
    firstYear: null, years: [], yearLabel: "Full-time students at four-year colleges", pay: "Paid", location: "Philadelphia, PA", mode: "40 hours a week for 10 consecutive weeks",
    summary: "The Philadelphia Fed's paid summer internships for full-time undergraduate, graduate and Ph.D. students at accredited four-year colleges and universities.",
    eligibility: [
      "Applicants must be full-time undergraduate, graduate or Ph.D. students enrolled at an accredited four-year college or university.",
      "A strong academic record and excellent analytical and interpersonal skills.",
      "A demonstrated interest in economics, business, finance, math, marketing, writing and editing, information technology, web and graphic design, or another field relevant to the bank's business functions.",
    ],
    timing: "The Philadelphia Fed says most interns \"join from late May to mid-July\" and work 40 hours a week for 10 consecutive weeks in the summer. Depending on departmental needs, there may be opportunities to keep working part-time after the internship or to start an internship at another time of year. The internships are paid, but the page gives no pay figure and no posting dates. The bank is at Ten Independence Mall in Philadelphia.",
    status: "Check current postings",
    url: "https://www.philadelphiafed.org/careers/internships",
    sources: [
      { name: "Philadelphia Fed internships: eligibility, schedule and fields of interest", url: "https://www.philadelphiafed.org/careers/internships" },
    ],
    steps: [
      `Search the ${FRS_JOBS} for Philadelphia Fed internship postings.`,
      "Match your application to one of the interest areas the bank names, such as economics, finance, marketing, writing and editing, information technology or design.",
      "Show your analytical and interpersonal skills with one example of each in your resume or cover letter.",
    ],
    prepare: [
      "The bank names both analytical and interpersonal skills. One resume line with a measurable analysis and one about working with people (tutoring, a team project, customer service) covers both. This is our suggestion, not a Philadelphia Fed rule.",
      "If you are in design or writing, keep a short portfolio link ready: the eligible interests include writing and editing and web and graphic design, not only economics.",
    ],
    pitfall: "The enrollment rule names accredited four-year colleges and universities and full-time study. Community-college and part-time students do not meet it as written.",
    materials: ["Resume", "Cover letter if the posting asks", "Full-time enrollment check", "Portfolio link for design or writing roles"],
    guideSlugs: [G.cover, G.resume, G.apply],
    verified: "2026-10-01",
  },
  {
    id: "chicago-fed-summer-internships", company: "Federal Reserve Bank of Chicago", title: "Summer Internship Program", initials: "CH", color: "#27496d",
    seoTitle: "Chicago Fed Internship: Timeline & How to Apply",
    seoDescription: "The Chicago Fed's paid summer internships post from October through January and start in June, for undergraduate and graduate students in many disciplines.",
    fields: ["finance", "public-service", "business", "technology"],
    firstYear: null, years: [], yearLabel: "Undergraduate and graduate students", pay: "Paid", location: "Chicago, IL", mode: "Full time, 40 hours a week; June start",
    summary: "The Chicago Fed's paid summer internship for undergraduate and graduate students across marketing, human resources, public relations, IT, project management, finance and economics.",
    eligibility: [
      "The program is designed for undergraduate and graduate students and hires interns across marketing, human resources, public relations, information technology, project management, finance, economics and more.",
      "Candidates should show demonstrated leadership and teamwork abilities and strong oral and written communication skills.",
      "Candidates need knowledge of Microsoft Office products and the ability to work 40 hours a week throughout the internship.",
    ],
    timing: "Internships are posted from October through January, and the Chicago Fed encourages candidates to apply to all openings that meet their qualifications. From January to May, selected candidates are assigned to one department and complete onboarding activities, and all interns begin in June. The page describes the program as a paid summer internship but gives no pay figure.",
    status: "Postings October–January; June start",
    url: "https://www.chicagofed.org/careers/internship",
    sources: [
      { name: "Chicago Fed internship program: timeline, disciplines and candidate qualifications", url: "https://www.chicagofed.org/careers/internship" },
    ],
    steps: [
      `Between October and January, search the Chicago Fed's internship postings in the ${FRS_JOBS}.`,
      "Apply to every opening that meets your qualifications, as the Chicago Fed encourages; selected interns are assigned to one department.",
      "If selected, complete onboarding between January and May before the June start.",
    ],
    prepare: [
      "Because the bank invites applications to every qualifying opening, tailor a short version of your resume to each discipline — a marketing role and a finance role should lead with different examples. This is our suggestion, not a Chicago Fed rule.",
      "Communication skills are a stated qualification. Have a writing sample or presentation ready to mention, and list the Microsoft Office tools you actually use, such as Excel formulas or PowerPoint decks.",
    ],
    pitfall: "Postings close as the October–January window ends. A student who starts looking in spring will find the cycle already in onboarding.",
    materials: ["Resume tailored to each discipline", "Leadership and teamwork examples", "Writing or presentation sample", "Microsoft Office skills list"],
    guideSlugs: [G.when, G.resume, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "supreme-court-internship-program", company: "Supreme Court of the United States", title: "Internship Program", initials: "SC", color: "#5a4632",
    seoTitle: "Supreme Court Internship: Eligibility & Deadlines",
    seoDescription: "The Supreme Court's paid internship takes undergraduates after two semesters of study; graduate and law students can't apply. Each term's USAJOBS window lasts two weeks.",
    fields: ["public-service"],
    firstYear: null, years: [], yearLabel: "Two semesters completed · no grad or law students", pay: "Paid", location: "Washington, DC", mode: "Fall, spring or summer term; full time preferred",
    summary: "The Supreme Court's paid internship for undergraduates who have completed two semesters, with fall, spring and summer terms and two-week USAJOBS application windows.",
    eligibility: [
      "Applicants must have completed two semesters of undergraduate study and be enrolled in a bachelor's program for the whole internship term, return to a bachelor's program immediately afterward, or take part in a federal fellowship program after the internship.",
      "Law students and graduate students are not eligible.",
      "Internships are open to U.S. citizens, nationals and those who owe allegiance to the United States.",
    ],
    timing: "Applications open on USAJOBS for two weeks beginning May 22 for fall placement, September 12 for spring placement and February 15 for summer placement. Fall and spring interns should plan to work 16 weeks; summer interns are expected to work at least 8 weeks and no more than 90 days. The Court gives preference to applicants who can work eight-hour days, five days a week, though some offices accept interns available at least four days a week. The program is paid; the page gives no stipend amount.",
    status: "Summer window opens Feb 15",
    url: "https://www.supremecourt.gov/jobs/internship/internshipprogram.aspx",
    sources: [
      { name: "Supreme Court Internship Program: eligibility, terms, application windows and materials", url: "https://www.supremecourt.gov/jobs/internship/internshipprogram.aspx" },
    ],
    steps: [
      "Note the two-week USAJOBS window for your term: it opens May 22 for fall, September 12 for spring and February 15 for summer.",
      "Prepare a one-page cover letter, a resume, a college transcript (official or unofficial) and the questionnaire on USAJOBS.",
      "Arrange two recommendation letters, at least one from a course instructor. Letters may be sent to internships@supremecourt.gov in Word or PDF format.",
    ],
    prepare: [
      "Ask both recommenders at least a month before the window opens; two weeks is too short to request, write and send letters from scratch. This is our suggestion, not a Court rule.",
      "The cover letter is limited to one page. Use it to explain which office's work interests you and one example of careful, detail-oriented work, rather than general interest in the law.",
    ],
    pitfall: "Each application window lasts only two weeks. Missing the February 15 summer window means waiting for a later term, and graduate or law students are not eligible at all.",
    materials: ["One-page cover letter", "Resume", "College transcript (official or unofficial)", "Two recommendation letters, one from an instructor", "USAJOBS questionnaire"],
    guideSlugs: [G.references, G.cover, G.files],
    verified: "2026-10-01",
  },
  {
    id: "fdic-financial-institution-intern", company: "FDIC", title: "Financial Institution Intern Program", initials: "FD", color: "#0f4c75",
    seoTitle: "FDIC Financial Institution Intern: Eligibility",
    seoDescription: "The FDIC's paid Financial Institution Intern Program takes U.S. citizens who have completed junior year in economics, finance or accounting, with a 3.4 GPA.",
    fields: ["finance", "public-service", "business"],
    firstYear: null, years: [], yearLabel: "Junior year completed · 3.4 GPA", pay: "Paid", location: "FDIC field offices; varies by posting", mode: "Summer, with bank examinations",
    summary: "The FDIC's paid summer program in which economics, finance and accounting students join on-site bank examinations, with a possible path to a Financial Institution Specialist role.",
    eligibility: [
      "U.S. citizenship and enrollment at least half-time in a bachelor's degree program at an accredited college or university.",
      "Completion of the junior year with a major in economics, finance or accounting, three credits of accounting, and at least a 3.4 GPA to enter the program.",
      "Successful completion of the FDIC's background investigation, and Selective Service registration for men born after December 31, 1959.",
    ],
    timing: "Financial Institution Interns gain hands-on experience evaluating bank operations, risk management strategies and consumer protection practices, and take part in on-site bank examinations with FDIC staff. After the summer, an intern may be offered part-time work or work during school breaks while still a student, and some who complete the program may be offered full-time post-graduation positions as Financial Institution Specialists. The FDIC says available locations vary and may change with each posting, and describes the pay as a competitive salary without publishing a figure. The page gives no application dates.",
    status: "Apply through FDIC recruiting",
    url: "https://www.fdic.gov/careers/financial-institution-intern-program",
    sources: [
      { name: "FDIC Financial Institution Intern Program: eligibility, work, locations and how to connect", url: "https://www.fdic.gov/careers/financial-institution-intern-program" },
    ],
    steps: [
      "Join the FDIC Talent Network with your contact information so recruiters can tell you about new internship openings.",
      "Talk to an FDIC recruiter at a participating campus recruiting event, or ask your career placement office whether your school is an FDIC targeted school.",
      "Before you apply, confirm you will have completed your junior year, three accounting credits and a 3.4 GPA, and that you can pass a background investigation.",
    ],
    prepare: [
      "Bank examinations involve reading loan files and financial statements. If you have time before the summer, an intermediate accounting or financial statement analysis course gives you something specific to discuss with a recruiter. This is our suggestion, not an FDIC rule.",
      "Ask your career office early whether the FDIC recruits at your school. If it does not, the Talent Network is the documented way to be contacted.",
    ],
    pitfall: "The three accounting credits apply to every major. An economics or finance student without them does not meet the stated requirements, whatever their GPA.",
    materials: ["Transcript showing junior-year completion", "Three accounting credits", "GPA of 3.4 or higher", "Background-investigation documents", "Selective Service registration if required"],
    guideSlugs: [G.apply, G.interview, G.resume],
    verified: "2026-10-01",
  },
  {
    id: "fdic-financial-management-scholars", company: "FDIC", title: "Financial Management Scholars Program", initials: "FD", color: "#155d8b",
    seoTitle: "FDIC Financial Management Scholars: Eligibility",
    seoDescription: "FDIC Financial Management Scholars work 11–12 salaried summer weeks on bank examinations, with frequent overnight travel. Needs U.S. citizenship and a 3.25 GPA.",
    fields: ["finance", "public-service", "business"],
    firstYear: null, years: [], yearLabel: "College students · 3.25 GPA", pay: "Paid", location: "FDIC sites nationwide; frequent travel", mode: "Summer, 11–12 weeks; overnight travel",
    summary: "The FDIC's salaried summer program for economics, business, finance, accounting and related majors, in Consumer Protection or Risk Management examination tracks.",
    eligibility: [
      "U.S. citizenship and Selective Service registration, as the FDIC lists.",
      "At least a cumulative 3.25 GPA, maintained throughout the internship.",
      "Passing a background investigation and an automated writing assessment, and agreeing to very frequent overnight travel — up to four nights a week at most locations — and work at remote or multiple sites.",
    ],
    timing: "Financial Management Scholars work 11 to 12 weeks during the summer in one of two tracks: Consumer Protection, assessing banks' compliance with lending and consumer protection laws, or Risk Management, examining institutions' safety, soundness and risk management practices. The program is aimed at students majoring in economics, business administration, finance, accounting or a related field, including mathematics and statistics. Positions are salaried, and scholars may be eligible for certain federal employee benefits. Those who complete the program and pass the writing assessment may be offered full-time positions starting after graduation. The page gives no application dates.",
    status: "Join FDIC Talent Network",
    url: "https://www.fdic.gov/careers/join-fdic-financial-management-scholar-fms",
    sources: [
      { name: "FDIC Financial Management Scholars: eligibility, tracks, travel, pay and conversion", url: "https://www.fdic.gov/careers/join-fdic-financial-management-scholar-fms" },
    ],
    steps: [
      "Join the FDIC Talent Network so recruiters can contact you about Financial Management Scholar openings.",
      "Decide between the Consumer Protection and Risk Management tracks, based on whether compliance law or financial risk interests you more.",
      "Prepare for the background investigation and the automated writing assessment, which also affects any later full-time offer.",
    ],
    prepare: [
      "The automated writing assessment matters twice: for entry and for a full-time offer. Practice writing a short, plain summary of a financial article in 20 minutes, then check it for clarity and errors. This is our suggestion, not an FDIC rule.",
      "Mathematics and statistics majors are named as related fields. If you come from one, connect a statistics project to risk measurement when you talk to a recruiter.",
    ],
    pitfall: "Up to four nights a week of overnight travel at most locations is a condition of the role. Check it against summer classes, family commitments or other work before you apply.",
    materials: ["Transcript with cumulative GPA (3.25 minimum)", "Track preference: Consumer Protection or Risk Management", "Writing-assessment practice", "Background-investigation documents", "Travel availability check"],
    guideSlugs: [G.apply, G.files, G.pay],
    verified: "2026-10-01",
  },
  {
    id: "sec-scholars-program", company: "SEC", title: "SEC Scholars Program", initials: "SE", color: "#1d3c5a",
    seoTitle: "SEC Scholars Program: Eligibility & Deadlines",
    seoDescription: "The SEC Scholars Program is an unpaid 10-week internship for U.S. citizen students with a 2.5 GPA, on-site at least 16 hours a week at SEC headquarters or regional offices.",
    fields: ["finance", "public-service", "business"],
    firstYear: null, years: [], yearLabel: "Enrolled students · 2.5 GPA", pay: "Unpaid", location: "Washington, DC or SEC regional offices", mode: "Part or full time; 16+ hours a week on-site",
    summary: "The Securities and Exchange Commission's unpaid 10-week internship for U.S. citizen undergraduate, graduate and law students, with business and legal tracks.",
    eligibility: [
      "U.S. citizenship.",
      "Current enrollment in an accredited degree or certificate program. The program is aimed at undergraduate, graduate, first- and second-year law, and LLM students.",
      "A minimum cumulative GPA of 2.5 on a 4.0 scale or equivalent.",
    ],
    timing: "The SEC Scholars Program is a 10-week internship and is currently unpaid; the SEC tells participants to work with their college or university on whether they can receive credit. Scholars may work part-time or full-time on a schedule agreed with their supervisor, but must work on-site at least 16 hours a week, at the Washington, D.C. headquarters or a regional office. The SEC's tentative timeline at review listed announcements for summer 2026 (December 1, 2025 to January 5, 2026), fall 2026 (March 12 to April 16, 2026) and spring 2027 (July 23 to August 27, 2026), with selections in February, April–May and September–October 2026. Dates for the summer 2027 term were not posted.",
    status: "Summer 2027 dates not yet posted",
    url: "https://www.sec.gov/about/careers-securities-exchange-commission/students-recent-graduates-programs/sec-scholars-program",
    sources: [
      { name: "SEC Scholars Program: eligibility, pay, schedule, locations and tentative timeline", url: "https://www.sec.gov/about/careers-securities-exchange-commission/students-recent-graduates-programs/sec-scholars-program" },
    ],
    steps: [
      "Watch USAJOBS, where the SEC posts Scholars Program opportunities when they become available, including Business Program roles at headquarters and regional offices.",
      "Prepare your most recent transcript and proof of current enrollment.",
      "Before applying, ask your college or university whether it will award credit for this unpaid internship.",
    ],
    prepare: [
      "Because the program is unpaid but needs only 16 on-site hours a week, some students combine it with paid work. Map out a weekly schedule before you apply so you can answer honestly when a supervisor asks about availability. This is our suggestion, not an SEC rule.",
      "The SEC's work is enforcement and examinations. A short, specific interest — reading a company's 10-K, a securities law class, or a market event you followed — is more useful than general interest in finance.",
    ],
    pitfall: "The program is unpaid. Budget for living and commuting costs, and do not count on credit until your college confirms it.",
    materials: ["Most recent transcript", "Proof of current enrollment", "USAJOBS profile", "Weekly availability plan (16+ on-site hours)"],
    guideSlugs: [G.pay, G.when, G.files],
    verified: "2026-10-01",
  },
];
