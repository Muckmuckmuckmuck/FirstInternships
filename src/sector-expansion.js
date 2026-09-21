// Sector expansion reviewed 2026-09-20.
//
// Adds insurance and risk as a field, plus agricultural and construction
// equipment coverage, both of which employ large undergraduate intern cohorts
// and had almost no representation in this directory.
//
// Every record below was read from the publisher's own student page on the
// review date. Several of those pages are evergreen employer overviews that
// state very little: where a page does not give a minimum college year, a GPA,
// a term date or a pay figure, this file records that as unknown rather than
// filling it in. `firstYear: null` with an empty `years` array is the honest
// representation of an employer-wide page whose individual openings differ.

const G = {
  apply: "how-to-apply-for-an-internship",
  find: "how-to-find-internships",
  when: "when-to-apply-for-summer-internships",
  pay: "do-internships-pay",
  resume: "internship-resume-with-no-experience",
  interview: "internship-interview-guide",
  assessment: "internship-online-assessment",
  files: "internship-application-file-format",
  offer: "internship-offer-checklist",
};

export const INSURANCE_FIELD = {
  id: "insurance",
  name: "Insurance & Risk",
  title: "Insurance Internships for College Students",
  description: "Compare undergraduate internships in underwriting, claims, actuarial, risk and insurance technology, with sourced eligibility and application guidance.",
  intro: "Insurance hires more undergraduates than most students realize, across underwriting, claims, actuarial science, analytics, technology and finance. Very few applicants arrive having planned for it, which is part of why the route is worth knowing about.",
  sections: [
    ["Learn what the functions actually do", "Underwriting decides which risks the company takes on and at what price. Claims investigates and settles what happens when something goes wrong. Actuarial builds the models the pricing rests on. Risk control advises customers on preventing losses in the first place. Alongside those sit ordinary finance, technology, data and marketing teams. These are genuinely different jobs, and naming the one you want — with a reason — immediately separates your application from the majority that say they are interested in insurance generally."],
    ["Actuarial is its own track with its own exams", "If you are aiming at actuarial work, the professional exam sequence usually starts during a degree rather than after it, and many employers ask what you have sat or are scheduled to sit. Passing an early exam before applying is a strong and very visible signal. If you have not started, say so honestly and say what you are planning — this is a field where a clear plan reads better than a vague interest."],
    ["No particular major is required for most of it", "Actuarial and data roles expect real quantitative coursework, but underwriting, claims, risk control, marketing and operations take students from across the disciplines, and these employers say so on their own pages. What they are screening for is judgment, comfort with detail, and the ability to explain a decision. A history student who can construct an argument from evidence has something genuinely relevant to offer."],
    ["This sector recruits early and converts heavily", "Insurers commonly use the internship as their main graduate pipeline and publish high conversion rates, which is why their summer applications tend to open in the preceding autumn and fill on rolling review. Build your shortlist during the preceding academic year, and treat an early complete application as worth more here than in sectors that hire in one batch."],
    ["Check where the work actually happens", "Some of these roles are office-based in a specific city, some are hybrid, and claims and risk-control work can involve travel to sites. A few employers publish remote or hybrid options explicitly. Confirm the arrangement, the location and the full term dates before applying, because an insurance internship tied to a head office you cannot reach is not a workable option however good the fit."],
  ],
  faqs: [
    ["Do I need to know anything about insurance to apply?", "Generally no, and these employers train from scratch. What helps is being able to say why a particular function interests you — pricing risk, investigating claims, modelling, or the technology behind it — rather than naming the industry in general."],
    ["Is an actuarial exam required before applying?", "Not usually required, but for actuarial tracks it is a strong signal and some postings ask what you have completed or scheduled. For non-actuarial roles it is not expected at all."],
    ["Are insurance internships paid?", "The larger programs generally are, and several publishers say so directly. This directory records what each source states; confirm the figure and the term on the individual opening rather than assuming."],
  ],
};

export const SECTOR_PROGRAMS = [
  {
    id: "travelers-internships", company: "Travelers", title: "Travelers Internships", initials: "TR", color: "#c8102e",
    seoTitle: "Travelers Internships: Areas & How to Apply",
    seoDescription: "Explore Travelers internship areas from underwriting and actuarial to data science and risk control, what the official page confirms, and how to apply.",
    fields: ["insurance", "finance", "business", "technology"],
    firstYear: null, years: [], yearLabel: "Year depends on opening", pay: "Paid", location: "US offices; check opening", mode: "Role-specific",
    summary: "An insurance internship spanning fourteen named areas, from underwriting and actuarial work to data science, geospatial and fire investigation.",
    eligibility: [
      "The internships page lists fourteen areas: actuarial, business insights and analytics, claim professional, data science, finance, fire investigative, geospatial, human resources, operations, product management, risk control, technology, and underwriting for both Bond & Specialty and Business Insurance.",
      "The overview page does not state a minimum college year, a GPA, or a graduation window; individual postings carry their own requirements.",
      "Work authorization and location conditions are set by the specific opening rather than the overview page.",
    ],
    timing: "Travelers describes an intern cohort with a symposium and structured development, and says interns receive competitive compensation, but the overview page publishes no figure, no term dates and no application deadline. Check the individual opening for its term and requirements.",
    status: "Check openings",
    url: "https://careers.travelers.com/emerging-talent/internships/",
    sources: [
      { name: "Internship areas, cohort structure and compensation statement", url: "https://careers.travelers.com/emerging-talent/internships/" },
      { name: "Emerging talent overview and development programs", url: "https://careers.travelers.com/emerging-talent/" },
    ],
    steps: [
      "Pick one of the fourteen listed areas before searching. Underwriting, claim, actuarial and risk control are genuinely different jobs, and the application reads better when it names one.",
      "Open the current postings for that area and read the requirements there, since the overview page sets none. Note the location, the term dates and any stated class-year or coursework condition.",
      "Apply through the Travelers careers portal and keep the requisition number, since postings are removed once filled.",
    ],
    prepare: [
      "For underwriting or claim work, prepare an example of a judgment you made from incomplete information — what you knew, what you assumed, and what you would have wanted to check. That is much closer to the actual work than a general interest in insurance.",
      "For actuarial or data roles, be ready to talk about a model or analysis you built, including where it was weak. Our suggestion is to name a limitation before you are asked; this is not a claim about how Travelers interviews.",
    ],
    pitfall: "The fourteen areas are separate applications with separate requirements. The overview page's lack of a stated class year does not mean a specific opening has none.",
    materials: ["Chosen internship area", "Opening-specific requirements", "Resume with graduation date", "Requisition number and confirmation"],
    guideSlugs: [G.apply, G.interview, G.when],
    verified: "2026-09-20",
  },
  {
    id: "nationwide-internships", company: "Nationwide", title: "Nationwide Internships", initials: "NW", color: "#1c3f94",
    seoTitle: "Nationwide Internships: 12 Weeks, Paid",
    seoDescription: "Nationwide runs a paid 12-week internship across actuarial, underwriting, finance, IT, audit and marketing, with remote and hybrid options on some roles.",
    fields: ["insurance", "finance", "business", "technology"],
    firstYear: null, years: [], yearLabel: "Year depends on opening", pay: "Paid", location: "US; remote and hybrid options listed", mode: "Remote and hybrid opportunities listed",
    summary: "A twelve-week paid insurance internship across actuarial, underwriting, finance, technology, audit, marketing and strategy.",
    eligibility: [
      "Nationwide describes the internship as running over the course of 12 weeks and lists it as a paid internship.",
      "The page says the internships are designed to help graduates and undergraduates, and lists areas including actuary for life and property/casualty, finance, financial services, information technology, internal audit, marketing, product and underwriting, sales, and strategy and innovation.",
      "No minimum college year, GPA or graduation window is stated on the page; individual postings set their own requirements.",
    ],
    timing: "Nationwide publishes a 12-week program length and lists remote and hybrid work opportunities among the program features, but gives no term dates or application deadline on this page. Leadership rotation programs are described separately from the internship.",
    status: "Check openings",
    url: "https://www.nationwide.com/personal/about-us/careers/types/college/",
    sources: [
      { name: "12-week length, paid status, program areas and work arrangements", url: "https://www.nationwide.com/personal/about-us/careers/types/college/" },
      { name: "Current internship postings", url: "https://careers.nationwide.com/" },
    ],
    steps: [
      "Choose an area from the list on the college page, then search the Nationwide careers site for current postings in it.",
      "Read the individual posting for its class-year requirement, location and term dates, since the overview page states none of these.",
      "Apply through the official careers portal and save the posting, since a specific requisition can close before the stated season ends.",
    ],
    prepare: [
      "Twelve weeks is long enough to own something end to end, so come with a question about what an intern in your area actually delivered last cycle. It tells you far more about the placement than the program description does.",
      "Where a posting is listed as remote or hybrid, confirm what that means in practice — which days, which location you are attached to, and whether any travel is expected — before accepting.",
    ],
    pitfall: "The leadership rotation programs described on the same page are a separate route from the internship, with their own application. Do not assume applying to one considers you for the other.",
    materials: ["Chosen internship area", "Posting requirements and location", "Resume with graduation date", "Written confirmation of term and arrangement"],
    guideSlugs: [G.apply, G.pay, G.offer],
    verified: "2026-09-20",
  },
  {
    id: "progressive-internships", company: "Progressive", title: "Progressive Internships", initials: "PG", color: "#0033a0",
    seoTitle: "Progressive Internships: Accounting, Data, Tech",
    seoDescription: "Progressive runs accounting, data and analytics, and technology internships, with the accounting route stated for students graduating within a year of it.",
    fields: ["insurance", "technology", "finance", "business"],
    firstYear: null, years: [], yearLabel: "Year depends on opening", pay: "Check opening", location: "US; check opening", mode: "Role-specific",
    summary: "Accounting, data and analytics, and technology internships at an insurer that publishes a high intern-to-graduate conversion rate.",
    eligibility: [
      "Progressive describes three internship areas: accounting, data and analytics, and technology, the last with specializations including systems engineer, data systems engineer, developer, front-end developer and project manager.",
      "For accounting the page states the program is for people graduating within a year of completing the internship. No equivalent requirement is stated for the other areas.",
      "The page does not state a GPA, pay, term dates, locations or work arrangement; those sit on individual postings.",
    ],
    timing: "Progressive's student page describes the internship as a first stage that can lead into the Accounting Rotational Program or the Analyst Development Program, and says over 80% of its interns take full-time roles after completing their degree. No application window, term length or deadline is published on the page.",
    status: "Check openings",
    url: "https://careers.progressive.com/pages/students-graduates-internships",
    sources: [
      { name: "Internship areas and the accounting graduation-window requirement", url: "https://careers.progressive.com/pages/students-graduates-internships" },
      { name: "Students and graduates overview", url: "https://careers.progressive.com/pages/students-graduates" },
    ],
    steps: [
      "Identify which of the three areas fits, and for accounting check the graduation-window condition against your own expected graduation date before anything else.",
      "Search the Progressive early careers site for a current opening in that area and read its own requirements, which the overview page does not set.",
      "Apply through the official portal and keep the posting and confirmation.",
    ],
    prepare: [
      "The accounting route is explicitly framed as leading into a rotational program, so be ready to say why a rotation through different business areas appeals to you rather than a single specialism.",
      "For technology roles, name the specialization you are applying to and bring one project that matches it. A front-end application and a data systems application should not read identically.",
    ],
    pitfall: "The accounting program's graduation-within-a-year condition is stated on the overview page and is an eligibility rule, not a preference. Check it before investing time in the application.",
    materials: ["Expected graduation month and year", "Chosen area and specialization", "Project examples matched to the role", "Portal confirmation"],
    guideSlugs: [G.apply, G.resume, G.assessment],
    verified: "2026-09-20",
  },
  {
    id: "liberty-mutual-internships", company: "Liberty Mutual", title: "Liberty Mutual Internships", initials: "LM", color: "#ffd000",
    seoTitle: "Liberty Mutual Internships: How to Apply",
    seoDescription: "Liberty Mutual lists undergraduate internships alongside discovery programs open from first year. Eligibility and pay sit on individual postings, not the overview.",
    fields: ["insurance", "technology", "finance", "business"],
    firstYear: null, years: [], yearLabel: "Year depends on opening", pay: "Check opening", location: "US; check opening", mode: "Role-specific",
    summary: "An insurer's undergraduate internship and apprenticeship route, with separate discovery programs described as available from first year.",
    eligibility: [
      "Liberty Mutual's undergraduate page refers to internship and apprenticeship programs and describes discovery programs as available starting your freshman year.",
      "The undergraduate overview page does not state class-year requirements for the internships themselves, a GPA, pay, term dates, locations or work arrangement.",
      "Individual postings in areas such as actuarial, analytics, claims, underwriting, finance and technology carry their own requirements.",
    ],
    timing: "The page says that in a typical year close to 90% of eligible interns receive offers to return or start full time. No application window, term length or deadline is published on the overview page, so the individual posting is the only reliable source for dates.",
    status: "Check openings",
    url: "https://jobs.libertymutualgroup.com/careers/undergraduate-internships/",
    sources: [
      { name: "Undergraduate internships overview and discovery-program availability", url: "https://jobs.libertymutualgroup.com/careers/undergraduate-internships/" },
      { name: "Campus internships listing", url: "https://jobs.libertymutualgroup.com/careers/campus/internships/" },
    ],
    steps: [
      "Decide whether a discovery program or an internship fits your year, since the page describes discovery as available from first year and the internships without a stated year.",
      "Open the postings for the function you want and read the requirements there, because the overview page sets none.",
      "Apply through the official careers site and keep the requisition details and confirmation.",
    ],
    prepare: [
      "Because the overview publishes so little, the individual posting is where your preparation should start. Copy its stated requirements into your own checklist before writing anything.",
      "If you are a first- or second-year student, the discovery route is the one described as open to you. Applying to a summer internship instead, without checking its requirements, is the common way to waste the effort.",
    ],
    pitfall: "A high published conversion rate describes eligible interns who already have a place; it says nothing about how difficult the internship is to obtain.",
    materials: ["Discovery versus internship decision", "Posting requirements", "Resume with graduation date", "Application confirmation"],
    guideSlugs: [G.find, G.apply, G.files],
    verified: "2026-09-20",
  },
  {
    id: "john-deere-internships", company: "John Deere", title: "John Deere Internships", initials: "JD", color: "#367c2b",
    seoTitle: "John Deere Internships & Part-Time Roles",
    seoDescription: "John Deere runs internships across engineering, IT, data, supply management and finance, plus part-time student roles scheduled around classes at some sites.",
    fields: ["engineering", "technology", "manufacturing", "operations", "business"],
    firstYear: null, years: [], yearLabel: "Year depends on opening", pay: "Check opening", location: "US sites incl. Moline, Waterloo, Davenport", mode: "Site-based; some part-time options",
    summary: "Equipment-manufacturer internships across engineering, IT, data, supply management and finance, plus a separate part-time student route.",
    eligibility: [
      "John Deere lists internship programs in accounting and finance, data science and analytics, engineering, information technology, marketing and product support, and supply management.",
      "A separate part-time student program is described, which the company says a few of its locations offer, letting students schedule work around classes while studying full time.",
      "The page does not state a minimum college year, a GPA, pay, or term dates; the company says minimum GPA varies by functional group, so the individual posting governs.",
    ],
    timing: "John Deere points students to in-person autumn campus career fairs and describes a selective in-person immersive event in March 2027. Internship postings are searched and applied for individually; no single application window or deadline is published on the student page.",
    status: "Check openings",
    url: "https://about.deere.com/en-us/careers/students-and-recent-graduates",
    sources: [
      { name: "Internship programs, part-time student program and career-fair guidance", url: "https://about.deere.com/en-us/careers/students-and-recent-graduates" },
      { name: "Current internship and student postings", url: "https://jobs.deere.com/" },
    ],
    steps: [
      "Decide between an internship and the part-time student route, since the latter is designed to run alongside full-time study at selected locations.",
      "Search the John Deere jobs site for current postings in your discipline and read each one's own GPA and coursework requirements, which vary by functional group.",
      "Register ahead for a campus career fair where your institution has one, since the company directs students there explicitly and asks for a resume PDF available on your phone.",
    ],
    prepare: [
      "This is equipment engineering and the supply chain around it, so evidence involving something physical — a design project, a machine shop, a farm or site job, a robotics team — lands well. Describe a constraint you designed around and how you tested the result.",
      "For the part-time route, work out your genuine weekly availability across a term before applying, including exam periods. A schedule you cannot sustain is worse than not applying.",
    ],
    pitfall: "The Early Talent Development Programs on the same page are full-time roles for recent graduates, not internships. Applying to one as a current student is a common misread of that page.",
    materials: ["Internship versus part-time decision", "Posting GPA and coursework requirements", "Resume PDF for career fairs", "Project examples involving physical work"],
    guideSlugs: [G.apply, G.find, G.resume],
    verified: "2026-09-20",
  },
];
