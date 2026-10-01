// Banking, markets, asset management and payments — sourced program batch,
// reviewed 2026-10-01.
//
// Scaffolded 2026-09-28 so that batches researched in parallel never edit the
// same file. This module is already imported and spread into PROGRAMS in
// src/content.js; filling it requires no change anywhere else.
//
// Assigned employers (research each on its own official pages; skip any whose
// official student page cannot be read or does not establish enough to write
// an accurate guide — never fill a gap from memory or a third-party site):
// Morgan Stanley, Wells Fargo, Citadel, Jane Street, Two Sigma, Barclays, UBS,
// Fidelity Investments, Vanguard, Charles Schwab, State Street, PNC, U.S. Bank,
// Truist, Visa, PayPal, Moody's, S&P Global, Evercore, Blackstone.
//
// Records follow the program data model in docs/CLAUDE_CODE_PLAYBOOK.md §6.
// A date published without a time of day goes in `deadlineDate` (YYYY-MM-DD)
// with `deadlineDateLabel`; `deadline` is reserved for an exact instant with a
// published time and zone.
//
// Every fact below was read on the employer's own careers pages or official
// postings on the review date. Thirteen employers were left out rather than
// guessed:
//   Morgan Stanley, Citadel, Blackstone   their careers sites refused automated
//               reads (HTTP 503 or 403), so no official text could be checked.
//   Jane Street  its program pages publish no eligibility, pay or dates, and
//               the one New York intern posting visible was a niche role.
//   Vanguard, Truist   their student and posting pages were too long to read
//               in full at review, so requirements could not be confirmed.
//   Barclays, PNC, U.S. Bank   their US Summer 2027 postings had closed or been
//               removed, and the remaining program pages lacked eligibility.
//   State Street  its 2027 listings were full-time development programs, not
//               internships.
//   Visa         no US Summer 2027 intern posting was listed.
//   Evercore, S&P Global   no undergraduate summer-analyst specifics were
//               published, and the S&P Global posting did not render.
//
// Notes on dates: no record here carries a structured cutoff. Wells Fargo's
// Technology posting end date (October 12, 2026) and Moody's per-posting
// windows apply to single postings inside records that span several, so they
// are stated in prose, as for multi-posting records elsewhere.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  resume: "internship-resume-with-no-experience",
  interview: "internship-interview-guide",
  assessment: "internship-online-assessment",
  portfolio: "internship-project-portfolio",
};

export const EMPLOYERS_FINANCE_PROGRAMS = [
  {
    id: "two-sigma-internships", company: "Two Sigma", title: "Summer 2027 Internships", initials: "2S", color: "#2d5f8a",
    seoTitle: "Two Sigma Internship 2027: Pay & How to Apply",
    seoDescription: "Two Sigma's 10-week Summer 2027 internships in New York: quantitative research, software engineering and more, with published weekly pay by degree and each role's requirements.",
    fields: ["finance", "technology", "research"],
    firstYear: null, years: [], yearLabel: "Role-specific; research role asks ~1 year left", pay: "Paid", location: "New York (Soho office)", mode: "In office, 10 weeks",
    summary: "Two Sigma's 10-week summer internships at its Soho office in New York, posted as separate Summer 2027 roles in quantitative research, software engineering, AI research and hardware engineering.",
    eligibility: [
      "The Software Engineering Internship (Summer 2027) asks for coursework toward a bachelor's, master's or PhD in a technical or quantitative field, experience with a language such as Java, C, C++ or Python, experience with large-scale systems and exceptional programming skills.",
      "The Quantitative Researcher Intern [2027 Summer] posting asks for a degree in a technical or quantitative discipline such as statistics, mathematics, physics, electrical engineering or computer science, with approximately one year remaining in the program; bachelor's through doctoral students are welcome.",
      "The research posting also asks for intermediate skill in at least one programming language and an in-depth research project examining real-world data. Neither posting states a minimum class year or GPA.",
    ],
    timing: "Two Sigma's internships page said 2027 internship applications were open at review. Both postings describe a 10-week summer program at the Soho-based New York City office. Pay is published as weekly base pay by degree level: $3,800, $3,900 and $4,200 a week for bachelor's, master's and PhD software engineering interns, and $4,900, $5,000 and $5,500 a week for quantitative research interns. Neither posting gives an application deadline. AI Research Scientist and TSS Hardware Engineering internships were also listed for Summer 2027.",
    status: "2027 applications open at review",
    url: "https://www.twosigma.com/careers/internships/",
    sources: [
      { name: "Internships page: 2027 applications open and the Summer 2027 roles", url: "https://www.twosigma.com/careers/internships/" },
      { name: "Quantitative Researcher Intern [2027 Summer] posting: requirements, length, location and weekly pay", url: "https://careers.twosigma.com/careers/JobDetail/New-York-New-York-United-States-Quantitative-Researcher-Intern-2027-Summer/13945" },
      { name: "Software Engineering Internship (Summer 2027) posting: requirements, length, location and weekly pay", url: "https://careers.twosigma.com/careers/JobDetail/New-York-New-York-United-States-Software-Engineering-Internship-Summer-2027/14016" },
    ],
    steps: [
      "Open the internships page and choose between the Summer 2027 postings — Quantitative Researcher, Software Engineering, AI Research Scientist and TSS Hardware Engineering — because each lists its own qualifications.",
      "Prepare a resume that names your degree, expected graduation date and the programming languages you actually use; for the research role, make the real-world data project easy to find.",
      "Apply through Two Sigma's careers portal for the posting that matches your evidence. No deadline is published, so apply while the role is still listed rather than waiting.",
    ],
    prepare: [
      "The research posting is unusually specific: it wants an in-depth project on real-world data. A class assignment on a clean textbook dataset is weaker evidence than a smaller project where you collected or cleaned messy data, chose a method and can say what went wrong. Write two lines on the question, the data and how you checked the result, and put them near the top of the resume.",
      "The software posting asks for experience with large-scale systems, which few undergraduates have from a job. Be precise about scale rather than vague: the number of users, records or requests your project handled, or the distributed-systems coursework you completed. An overstated claim is easy to probe in a technical interview; an honest small number with a clear design decision reads better. This is our suggestion, not Two Sigma's process.",
    ],
    pitfall: "The quantitative research role asks for approximately one year remaining in your program. A student graduating at the end of the summer falls outside that, even though every degree level from bachelor's to PhD is welcome.",
    materials: ["One chosen Summer 2027 posting", "Resume with degree and expected graduation date", "Real-world data project summary (research role)", "Programming languages you can be tested in", "Honest notes on the scale of systems you have built"],
    guideSlugs: [G.portfolio, G.assessment, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "wells-fargo-summer-internships", company: "Wells Fargo", title: "2027 Summer Internships", initials: "WF", color: "#b8312f",
    seoTitle: "Wells Fargo Internship 2027: Programs & Dates",
    seoDescription: "Wells Fargo's 10-week 2027 summer internships in technology, finance and banking: a rolling application timeline, Technology pay, and an investment banking cycle a year earlier.",
    fields: ["finance", "business", "technology", "operations"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "Dec 2027–Jun 2028 graduation (Technology)", pay: "Paid", location: "Charlotte, Irving, Chandler/Phoenix, Iselin, St. Louis and others by posting", mode: "Hybrid with on-site presence (Technology posting)",
    summary: "Wells Fargo's 10-week undergraduate summer internships, posted separately by business area, from audit and technology to commercial banking, corporate and investment banking, and wealth management.",
    eligibility: [
      "The 2027 Technology Summer Internship (Software Engineering) requires current pursuit of a bachelor's degree in computer science, computer engineering or a related STEM field, with expected graduation between December 2027 and June 2028.",
      "That posting also requires six or more months of experience, which it says can be shown through work experience, training, military experience or education, or a combination of them.",
      "Wells Fargo only considers candidates who are presently authorized to work for any employer in the United States and who do not require work visa sponsorship. Other business areas publish their own postings and requirements.",
    ],
    timing: "Wells Fargo's application timeline says applications for non-Corporate & Investment Banking Summer 2027 internships opened in June and July 2026, remain open through the fall and close on a rolling basis, while Corporate & Investment Banking applications for Summer 2028 open in January 2027. The Technology posting runs 10 weeks from June to August 2027, requires on-site presence at a listed location on a hybrid schedule, and publishes hourly pay of $48.08 in Arizona, Missouri, North Carolina and Texas and $60.10 in New Jersey, within a $38.46–$63.46 range. Its posting end date was October 12, 2026. At review, the 2027 Finance and Commercial Banking postings were no longer available.",
    status: "Summer 2027 postings close on a rolling basis",
    url: "https://www.wellsfargojobs.com/en/early-careers/undergraduate-programs/",
    sources: [
      { name: "Undergraduate programs: the business areas that recruit interns", url: "https://www.wellsfargojobs.com/en/early-careers/undergraduate-programs/" },
      { name: "Application process: Summer 2027 and Corporate & Investment Banking Summer 2028 timelines", url: "https://www.wellsfargojobs.com/en/early-careers/application-process/" },
      { name: "2027 Technology Summer Internship (Software Engineering) posting: eligibility, dates, locations, pay and posting end date", url: "https://www.wellsfargojobs.com/en/jobs/r-574285/2027-technology-summer-internship-early-careers-software-engineering/" },
    ],
    steps: [
      "Read the application timeline first. Corporate & Investment Banking recruits on its own calendar, with Summer 2028 applications opening in January 2027, while the other areas' Summer 2027 applications opened in June and July 2026.",
      "Choose a business area on the undergraduate programs page and open its current posting; requirements, locations and pay are set per posting.",
      "Apply through the posting before it closes. Postings close on a rolling basis, so a role listed in September may be gone by October.",
    ],
    prepare: [
      "The Technology posting's six-month experience requirement can be met through education, so do not screen yourself out for lacking a prior internship. List the relevant coursework, the projects you built and any campus technical job, with dates, so a reviewer can count them toward six months.",
      "Because postings close on a rolling basis, the order you apply in matters more than at employers with one deadline. Rank the business areas you would genuinely accept and submit your first choice before polishing the others. If you are aiming at Corporate & Investment Banking for Summer 2028, have a resume ready by January 2027. This is our planning advice, not a Wells Fargo rule.",
    ],
    pitfall: "Corporate & Investment Banking runs a year ahead of the other areas: its Summer 2028 applications open in January 2027. Waiting for the next summer's general timeline means applying to investment banking a full cycle late.",
    materials: ["Chosen business area and live posting", "Resume with expected graduation date", "Evidence toward six months of experience (Technology)", "US work authorization without sponsorship", "Preferred on-site location from the posting"],
    guideSlugs: [G.when, G.apply, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "fidelity-undergraduate-internships", company: "Fidelity Investments", title: "Summer 2027 Undergraduate Internships", initials: "FI", color: "#3d7a3a",
    seoTitle: "Fidelity Internship 2027: Eligibility & How to Apply",
    seoDescription: "Fidelity's paid 10-week summer internship: one application for eight skill areas, a mid-September to mid-October window, published hourly pay and a return-to-school rule.",
    fields: ["finance", "technology", "business", "operations"],
    firstYear: null, years: [], preferredYears: [2, 3], yearLabel: "Apply in sophomore or junior fall", pay: "Paid", location: "Boston, Westlake, Durham, Merrimack, Smithfield and others by area", mode: "Most days in office (~75–100%)",
    summary: "Fidelity's 10-week paid summer internship for undergraduates, filled through one application that is considered across eight skill areas, from technology and finance to actuary and client relations.",
    eligibility: [
      "Fidelity's internship page says students apply during the fall of their sophomore or junior year, for an internship that runs from June through August.",
      "The Software and Finance postings each require a current undergraduate who will return to coursework after the internship and is available for the entire 10-week program. Software asks for a bachelor's in computer science, software engineering, computer engineering, information technology or a related field; Finance asks for strong Excel skills and data analysis.",
      "Both postings state that Fidelity is not providing immigration sponsorship for the position.",
    ],
    timing: "Fidelity's page says the application window opens mid-September through mid-October, interviews happen on a rolling basis, and it aims to complete internship hiring by January. The Finance posting gives program dates of June 7 to August 13, 2027. Both postings require working most days in the office (about 75–100%) and publish hourly ranges: $28–$42 for Software and $20–$32 for Finance. Each says its application window closes when the position is filled or unposted, so there is no fixed cutoff.",
    status: "2027 application window open at review",
    url: "https://jobs.fidelity.com/en/students/internships/",
    sources: [
      { name: "Summer internships page: program length, application window, eight skill areas and hiring timeline", url: "https://jobs.fidelity.com/en/students/internships/" },
      { name: "Summer 2027 Undergraduate Internship – Software posting: requirements, assessment, locations and pay", url: "https://jobs.fidelity.com/en/jobs/2134524/summer-2027-undergraduate-internship-software/" },
      { name: "Summer 2027 Undergraduate Internship – Finance posting: requirements, dates, locations and pay", url: "https://jobs.fidelity.com/en/jobs/2134157/summer-2027-undergraduate-internship-finance/" },
    ],
    steps: [
      "Submit one application from the internships page; Fidelity says that single application is considered for all eight skill areas.",
      "If you are selected for the Software track, expect a software engineering skills assessment in Java or Python before interviews.",
      "Apply early in the mid-September to mid-October window. Postings close when filled or unposted, and interviews run on a rolling basis toward hiring by January.",
    ],
    prepare: [
      "Because one application is routed across eight areas, the resume does the sorting. Put the work you most want first — a data project for Finance, an object-oriented build for Software, a customer-facing job for Client Relations — and keep the rest brief, so a recruiter reading for one area finds the right evidence quickly.",
      "The Software assessment is in Java or Python. Practise timed in the language you will actually use, on data-structure problems like your coursework, rather than switching languages for the test. The Finance posting names formulas and pivot tables; build one small worksheet you can walk through step by step. These are our suggestions, not Fidelity requirements.",
    ],
    pitfall: "Both postings require that you return to coursework after the internship. A student who will graduate before the following fall does not meet that requirement, whatever their class label.",
    materials: ["One application, with your preferred skill areas", "Resume with expected graduation date", "Java or Python practice for the Software assessment", "Excel example with formulas and pivot tables (Finance)", "Availability for the full 10 weeks"],
    guideSlugs: [G.assessment, G.apply, G.resume],
    verified: "2026-10-01",
  },
  {
    id: "schwab-internship-academy", company: "Charles Schwab", title: "Internship Academy 2027", initials: "CS", color: "#1f6fa8",
    seoTitle: "Charles Schwab Internship 2027: Dates & Eligibility",
    seoDescription: "Schwab's nine-week paid Internship Academy runs June 7–August 6, 2027, on site, for students graduating Aug 2027–Jun 2028. Technology roles post on Fridays and close Mondays.",
    fields: ["finance", "business", "technology", "operations"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "Aug 2027–Jun 2028 graduation", pay: "Paid", location: "Schwab service centers and branches", mode: "On site; no remote roles",
    summary: "Charles Schwab's nine-week paid summer Internship Academy, with tracks from finance and marketing to the branch network and technology, run on site at Schwab service centers and branches.",
    eligibility: [
      "Applicants must be enrolled in a current undergraduate or graduate program tracking to a bachelor's, master's or PhD and must graduate between August 2027 and June 2028.",
      "Applicants must be available for the full 2027 Internship Academy, June 7 through August 6, 2027; Schwab says there are no exceptions.",
      "All positions are on site at a Schwab service center or branch location, and no remote opportunities are available.",
    ],
    timing: "Schwab began recruiting for its 2027 internships on August 28 and posts new opportunities through the fall. Technology internships are posted each Friday evening from August 28 through October 4, stay open through the weekend and close on Monday. The academy runs June 7 to August 6, 2027. Tracks include Corporate Risk Management, DAFgiving360, Finance, Wealth & Advice Solutions, Human Resources, Internal Audit, Investor Services, Marketing, Operations, Retirement Business Services, Workplace Services, Strategy and Technology.",
    status: "2027 postings released through the fall",
    url: "https://www.schwabjobs.com/internship-academy",
    sources: [
      { name: "Internship Academy page: dates, eligibility, tracks, on-site rule and recruiting timeline", url: "https://www.schwabjobs.com/internship-academy" },
    ],
    steps: [
      "Check schwabjobs.com every three to five days, as Schwab suggests; new internship roles are posted through the fall.",
      "For technology roles, look on Friday evenings and apply before the Monday close. Through October 4, each week's technology postings stay open only through the weekend.",
      "Confirm you can be on site every day from June 7 to August 6, 2027, then apply to the roles that best match your skills.",
    ],
    prepare: [
      "The weekend window for technology roles leaves no time to build materials after a role appears. Keep a resume ready that already leads with your strongest technical project, and a short paragraph on why Schwab's client-facing technology interests you, so a Friday posting can be answered on Saturday.",
      "Investor Services and the branch network are client-facing tracks. A campus job where you handled questions, money or scheduling under time pressure is relevant evidence; describe one situation where you explained something to a customer and what changed as a result. This is our editorial suggestion.",
    ],
    pitfall: "The date rule is strict: Schwab requires availability for the whole June 7–August 6, 2027 program with no exceptions, so a spring term that ends after June 7 can rule you out.",
    materials: ["Availability for June 7–Aug 6, 2027", "Graduation date between Aug 2027 and Jun 2028", "Ready-to-send resume for weekend technology windows", "Preferred track and on-site location", "Client-facing example for Investor Services"],
    guideSlugs: [G.when, G.apply, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "paypal-summer-internship", company: "PayPal", title: "US and Canada Summer Internship", initials: "PP", color: "#22508f",
    seoTitle: "PayPal Internships: Eligibility & How to Apply",
    seoDescription: "PayPal's 12-week US and Canada summer internship for students returning to school afterward, with an August–March recruiting season and roles from software to finance.",
    fields: ["technology", "finance", "business"],
    firstYear: null, years: [], yearLabel: "Must return to school after", pay: "Check opening", location: "US and Canada; check posting", mode: "Home and office flexibility",
    summary: "PayPal's 12-week US and Canada summer internship for undergraduate and graduate students, recruited from August to March in areas from software engineering and data analytics to finance and marketing.",
    eligibility: [
      "The program is available to undergraduate and graduate students currently enrolled at an accredited university who plan to return to school for at least one quarter or semester after the internship.",
      "PayPal's university pages state no minimum class year or GPA. Postings are general advertisements by area of focus, such as Software Engineering, Data Analytics, Risk Management, Product Management, Finance, Sales and Marketing.",
      "PayPal says interns in North America are traditionally required to work 40 hours a week unless otherwise stated.",
    ],
    timing: "The US and Canada summer internship runs from May to September and typically lasts 12 weeks. PayPal says its US and Canada recruitment season runs from August to March each year and applications are considered on an ongoing basis during it. Interns can work between home and an office with their manager's support and receive a company laptop and equipment. The university pages do not publish pay; check the posting for your area.",
    status: "Recruitment season runs August–March",
    url: "https://careers.pypl.com/university-hiring/north-america-latin-america/default.aspx",
    sources: [
      { name: "North America university hiring: length, eligibility, recruitment season and focus areas", url: "https://careers.pypl.com/university-hiring/north-america-latin-america/default.aspx" },
      { name: "Intern hub: work model, weekly hours, equipment and intern programming", url: "https://careers.pypl.com/university-hiring/intern-hub/" },
    ],
    steps: [
      "Pick the area of focus that matches your evidence; PayPal's postings advertise a whole focus area rather than one team's role.",
      "Apply during the August-to-March recruitment season. Applications are considered on an ongoing basis, so there is no published deadline to wait for.",
      "Confirm that you will return to school for at least one term afterward, and read the posting for pay, location and dates.",
    ],
    prepare: [
      "Because a posting covers a whole focus area, your application may be read for many teams at once. Make the resume legible to all of them: if your best project touches payments, such as fraud signals, checkout reliability or reconciling transactions, name that problem plainly along with the tools you used.",
      "PayPal's flexible model means some days may be spent working from home. Show that you deliver without daily supervision: a project with a deadline you set yourself, a remote job, or a team project you coordinated asynchronously. This is our suggestion, not a PayPal requirement.",
    ],
    pitfall: "Graduating students are not covered: the program requires plans to return to school for at least one quarter or semester after the internship.",
    materials: ["Chosen focus area", "Resume showing your return-to-school term", "One project tied to payments or risk, if you have one", "Evidence of independent or remote work", "Pay and location from the posting"],
    guideSlugs: [G.apply, G.resume, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "ubs-us-summer-internship", company: "UBS", title: "US Summer Internship Program", initials: "UB", color: "#a32d2d",
    seoTitle: "UBS Summer Internship: Eligibility & How to Apply",
    seoDescription: "UBS's US summer internships are for students starting their second-to-last undergraduate year with a 3.0 GPA, and you may submit at most three applications per academic year.",
    fields: ["finance", "business"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "Starting second-to-last year", pay: "Check opening", location: "US offices; opening-specific", mode: "Check opening",
    summary: "UBS's US summer internships for students starting their second-to-last year of undergraduate study, with divisions recruiting at different times and a limit of three applications per academic year.",
    eligibility: [
      "UBS asks that you be starting your second-to-last year of undergraduate study; some divisions also accept master's candidates.",
      "Applicants need a cumulative GPA of 3.0 or higher.",
      "You may submit a maximum of three applications across all UBS business divisions and US offices during the same academic year.",
    ],
    timing: "UBS says applications for its US summer internships open at various times during the year, and internships start in June. After the online application with a CV or resume, the process includes assessments, pre-recorded interviews and final-round interviews. The program page publishes no pay or single deadline; individual postings carry their own details.",
    status: "US windows open at different times",
    url: "https://www.ubs.com/global/en/careers/early-careers/summer-internship-program.html",
    sources: [
      { name: "Summer Internship Program page: US eligibility, GPA, application limit, timing and selection steps", url: "https://www.ubs.com/global/en/careers/early-careers/summer-internship-program.html" },
    ],
    steps: [
      "Choose your applications deliberately: the limit of three covers every UBS division and US office in the academic year.",
      "Submit the online application with your CV or resume for each chosen posting.",
      "Prepare for the assessments, pre-recorded interviews and final-round interviews that follow.",
    ],
    prepare: [
      "The three-application cap changes the strategy. Spread your choices across divisions whose work you can actually explain, rather than three versions of the most competitive desk, and keep a written note of which postings you used so an accidental duplicate does not cost you a slot. This is our planning advice.",
      "For the pre-recorded interviews, rehearse a ninety-second answer on why that specific division, naming one product or type of client it serves, and practise with a timer and a camera. A clear, specific answer recorded once is better than a polished generic one.",
    ],
    pitfall: "The cap counts applications, not divisions or cities: three submissions to the same business in different US offices use up the whole year's allowance.",
    materials: ["Three ranked UBS postings", "CV or resume", "Cumulative GPA of 3.0 or higher", "Division-specific answer for recorded interviews", "Record of which applications you have used"],
    guideSlugs: [G.assessment, G.interview, G.when],
    verified: "2026-10-01",
  },
  {
    id: "moodys-summer-internship", company: "Moody's", title: "Summer Internship 2027", initials: "MO", color: "#1d3f73",
    seoTitle: "Moody's Summer Internship 2027: Dates & Pay",
    seoDescription: "Moody's 10-week paid internships run June 7–August 13, 2027 at $35 an hour. Each posting has its own short application window and graduation range; some closed in early October.",
    fields: ["finance", "research", "business", "technology"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "Graduation window varies by role", pay: "Paid", location: "New York, Charlotte and other offices by posting", mode: "Full time; role-specific",
    summary: "Moody's 10-week paid summer internships for June to August 2027, posted as individual roles in ratings and research, compliance, data, technology and business teams, each with a short application window.",
    eligibility: [
      "The Ratings and Research Support Summer Intern posting asks for students pursuing a bachelor's or master's degree, or equivalent, with coursework in finance, accounting, economics, political economy, international relations, statistics, mathematics, public administration or another quantitative field, graduating December 2027 to June 2028.",
      "The Digital Workplace Project Management Summer Intern posting asks for a degree in business, communications, computer science or a related field and accepts a graduation date from December 2027 to June 2029.",
      "Both postings are in New York, and the research posting requires the ability to work full time during the program dates.",
    ],
    timing: "Both New York postings give program dates of June 7 to August 13, 2027 and an hourly rate of $35. Each has its own application window: September 14 to October 1 for Ratings and Research Support, and September 28 to October 9 for Digital Workplace Project Management. At review, other Summer Intern postings, including AI & Business Strategy and a Charlotte data analyst role, had already closed.",
    status: "2027 postings with short fall windows",
    url: "https://careers.moodys.com/en/job/new-york/ratings-and-research-support-summer-intern/49841/100482312640",
    sources: [
      { name: "Ratings and Research Support Summer Intern posting: eligibility, dates, pay and application window", url: "https://careers.moodys.com/en/job/new-york/ratings-and-research-support-summer-intern/49841/100482312640" },
      { name: "Digital Workplace Project Management Summer Intern posting: eligibility, dates, pay and application window", url: "https://careers.moodys.com/en/job/new-york/digital-workplace-project-management-summer-intern/49841/101135844336" },
    ],
    steps: [
      "Search Moody's careers site for Summer Intern postings and note each posting's application window; the windows reviewed lasted between two and three weeks.",
      "Check the graduation range on the posting, because it differs by role, from December 2027–June 2028 to December 2027–June 2029.",
      "Apply inside the window with a resume that names the coursework fields the posting lists.",
    ],
    prepare: [
      "Short windows reward a ready resume. The research posting lists specific fields of study, from political economy to statistics; make your relevant courses visible by name, since a reviewer screening against that list may not infer them from your major alone.",
      "Ratings work is about explaining credit risk in writing. Prepare one short example — a class paper or a one-page analysis of a public company or municipality — that shows you can reach a judgment from financial data and state the main risk plainly. This is our suggestion, not a Moody's requirement.",
    ],
    pitfall: "Windows are short and differ by posting: Ratings and Research Support accepted applications only from September 14 to October 1, so checking the site once a month can miss a role entirely.",
    materials: ["The posting's application window", "Graduation date within the posting's range", "Resume naming relevant coursework", "Short written analysis sample", "Full-time availability June 7–Aug 13, 2027"],
    guideSlugs: [G.apply, G.resume, G.when],
    verified: "2026-10-01",
  },
];
