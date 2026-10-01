// Campus internship programs at large finance, technology and games
// employers — sourced program batch, reviewed 2026-10-01.
//
// Every fact below was read on the employer's own careers site or official job
// board on the review date. Each record quotes the program page or the
// postings reviewed; other postings can set different rules, and each record
// says so.
//
// Pay notes: annual figures for a summer internship are annualized or
// prorated rates, and the records say so rather than implying a year's pay.
//
// Citi already has a guide (citi-summer-analyst-internships), so it is not
// repeated here. Left out rather than guessed: Bridgewater (its 2027 posting states no
// degree, class-year or graduation rule) and Neuralink (postings give no term
// or student status); Optiver, Barclays, Susquehanna, Prudential's actuarial
// posting and United Airlines' Summer 2027 posting returned "not found" or
// "gone" at review; Prudential's and United's program pages state no
// eligibility rules; Roblox, Reddit, Discord, Instacart, Riot Games, Twitch,
// Asana, Toast, Squarespace, Gusto, Esri, SoFi, Ramp and Notion had no intern
// postings on their public job boards, and Visa and McDonald's had none on
// SmartRecruiters.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  resume: "internship-resume-with-no-experience",
  interview: "internship-interview-guide",
  assessment: "internship-online-assessment",
  portfolio: "internship-project-portfolio",
  pay: "do-internships-pay",
  intl: "international-student-internship-questions",
};

export const EMPLOYERS_CAMPUS_PROGRAMS = [
  {
    id: "waymo-summer-internships-2027", company: "Waymo", title: "2027 Summer Internships", initials: "WA", color: "#0b6e6e",
    seoTitle: "Waymo Internship 2027: Roles, Pay & Eligibility",
    seoDescription: "Waymo's 2027 summer internships are posted by degree level, from BS software and supply roles to PhD research. BS postings list $60 an hour, hybrid on-site in the Bay Area.",
    fields: ["technology", "engineering", "operations"],
    firstYear: null, years: [], yearLabel: "Bachelor's, master's, PhD or MBA by posting", pay: "Paid", location: "Mountain View and San Francisco, CA; some London and Warsaw", mode: "Hybrid on-site",
    summary: "Waymo's Summer 2027 internships in software, machine learning, supply management and operations, posted separately by degree level on its Greenhouse job board.",
    eligibility: [
      "Each posting names the degree level in its title — BS, BS/MS, MS/PhD, PhD or MBA. At review, BS-level postings included software engineering for Driver Refinement Foundations and Labeling, and Depot Automation.",
      "The BS Software Engineer, Driver Refinement Foundations posting asks for a bachelor's in software engineering or a related field, strong C++, solid algorithms and data structures, software testing experience and comfort designing metrics.",
      "The BS/MS Global Supply Management posting asks for enrollment in a BS or MS program in supply chain management, electrical or industrial engineering, operations research or a related technical field, plus should-cost modeling and Python or automation skills.",
    ],
    timing: "Waymo lists its internships as 2027 Summer Intern postings, most in Mountain View or San Francisco, California, with a few in London and Warsaw. The postings reviewed describe hybrid on-site internships. Pay is posted per role: the BS Driver Refinement Foundations posting lists $60 an hour, and the Global Supply Management posting lists $60 an hour for bachelor's students and $70 an hour for master's students. Waymo asks candidates who want to be considered for several roles to apply to each one individually, and to apply to the top three roles they are interested in. The postings reviewed gave no start dates or deadline.",
    status: "Summer 2027 postings open at review",
    url: "https://careers.withwaymo.com/jobs?gh_jid=8224900",
    sources: [
      { name: "2027 Summer Intern, BS, Software Engineer, Driver Refinement Foundations: qualifications, pay and hybrid arrangement", url: "https://careers.withwaymo.com/jobs?gh_jid=8224900" },
      { name: "2027 Summer Intern, BS/MS, Global Supply Management: qualifications and pay by degree", url: "https://careers.withwaymo.com/jobs?gh_jid=8201252" },
      { name: "Waymo's Greenhouse job board: current 2027 Summer Intern postings by degree level", url: "https://boards-api.greenhouse.io/v1/boards/waymo/jobs" },
    ],
    steps: [
      "Filter Waymo's 2027 Summer Intern postings by the degree level in the title — BS, BS/MS, MS/PhD, PhD or MBA — and keep only those that match your program.",
      "Choose up to your top three roles and apply to each one individually, as Waymo asks.",
      "Tailor each application to the posting's minimum qualifications, such as C++ and testing for software roles or should-cost modeling for supply management.",
    ],
    prepare: [
      "Waymo's BS software posting asks for proficiency with unit, integration and regression testing. A class or personal project with a real test suite, and a sentence on what the tests caught, is direct evidence. This is our suggestion, not a Waymo rule.",
      "Because you apply to roles one by one, rank them before applying. Pick the three where your coursework most closely matches the minimum qualifications rather than the three with the most appealing team names.",
    ],
    pitfall: "Most of the Summer 2027 postings at review were MS/PhD or PhD roles. An undergraduate who applies to them is unlikely to meet the stated degree level; look for BS or BS/MS in the title.",
    materials: ["Degree-level match (BS, BS/MS, MS/PhD, PhD or MBA)", "Resume tailored to each of up to three roles", "C++ or Python project with tests", "Hybrid on-site availability in the Bay Area"],
    guideSlugs: [G.portfolio, G.interview, G.assessment],
    verified: "2026-10-01",
  },
  {
    id: "point72-investment-services-internship", company: "Point72", title: "2027 Investment Services Internship", initials: "P7", color: "#14213d",
    seoTitle: "Point72 Internship 2027: Investment Services",
    seoDescription: "Point72's 10-week 2027 Investment Services Internship in New York and Stamford is for bachelor's students interested in asset management, at a prorated $75,000 annual base.",
    fields: ["finance", "business"],
    firstYear: null, years: [], yearLabel: "Current bachelor's students", pay: "Paid", location: "New York, NY or Stamford, CT", mode: "10-week summer internship",
    summary: "Point72's 10-week 2027 Investment Services Internship, which places bachelor's students on teams across the firm's Investment Services functions.",
    eligibility: [
      "Applicants should be currently pursuing a bachelor's degree.",
      "The posting asks for a demonstrated interest in asset management.",
      "It also asks for strong analytical, writing and communication skills.",
    ],
    timing: "The 2027 Investment Services Internship is a 10-week summer internship in New York or Stamford. Interns work on teams within Investment Services and take part in mentorship, peer networking events, sessions with senior leaders, technical and presentation skill development, and exposure to different departments. Point72 states an annual base salary of $75,000, prorated for the internship's start and end dates. Applicants are considered for a variety of teams based on their interests, experience and business needs. The posting gives no deadline. Point72's Academy Investment Analyst summer internships posted at review were in Hong Kong, Japan and Singapore, not the US.",
    status: "2027 posting open at review",
    url: "https://boards.greenhouse.io/point72/jobs/8811167002?gh_jid=8811167002",
    sources: [
      { name: "2027 Investment Services Internship: eligibility, program, pay and team placement", url: "https://boards.greenhouse.io/point72/jobs/8811167002?gh_jid=8811167002" },
      { name: "Point72's Greenhouse job board: 2027 internship postings by location", url: "https://boards-api.greenhouse.io/v1/boards/point72/jobs" },
    ],
    steps: [
      "Apply to the 2027 Investment Services Internship on Point72's Greenhouse board; one application is considered for a variety of teams.",
      "Use your resume and any written answers to show a specific interest in asset management, not just finance in general.",
      "Prepare to discuss your analytical, writing and communication work, the three skills the posting names.",
    ],
    prepare: [
      "Because one application is matched to teams, state the Investment Services areas you would most like to see and why. A short line about following a fund's public letters or a market event is more specific than 'interest in finance'. This is our suggestion, not a Point72 rule.",
      "Writing is a stated skill. Keep a one-page sample, such as a stock pitch or a research memo from a class, that you could share if asked.",
    ],
    pitfall: "The $75,000 figure is an annual base prorated to the internship's dates, so a 10-week internship pays a fraction of it. The US Investment Services posting is separate from Point72 Academy, whose 2027 internships at review were in Asia.",
    materials: ["Resume", "Asset-management interest examples", "One-page writing sample", "New York or Stamford availability"],
    guideSlugs: [G.when, G.interview, G.pay],
    verified: "2026-10-01",
  },
  {
    id: "epic-games-internships-2027", company: "Epic Games", title: "2027 Internships", initials: "EG", color: "#2a2a2a",
    seoTitle: "Epic Games Internship 2027: Roles & Requirements",
    seoDescription: "Epic Games posts 2027 internships in Cary, NC and abroad for programming, game and level design, data science, ML and communications, with flexible 2027 start dates.",
    fields: ["technology", "arts", "media"],
    firstYear: null, years: [], yearLabel: "Role-specific; work authorization required", pay: "Check opening", location: "Cary, NC; some London and Montreal postings", mode: "On-site; flexible 2027 start",
    summary: "Epic Games' 2027 internships in programming, game and level design, data science, machine learning, communications and product management, posted on its Greenhouse job board.",
    eligibility: [
      "Applicants must be legally authorized to work in the posting location for the duration of the internship.",
      "The Gameplay Programmer Intern posting asks for strong C++, interest in gameplay programming, strong problem-solving and communication skills, and the ability to respond to constructive feedback.",
      "The Game Design Intern posting asks for practical Unreal Engine experience, Blueprints and the Gameplay Ability System, and a portfolio of playable projects — student, indie or freelance work counts. The Product Management Intern posting is for current MBA students.",
    ],
    timing: "Epic's internship postings say each internship has a flexible start date in 2027 and that recruitment will be ongoing until teams find an ideal match. At review, Cary, North Carolina, postings included Backend Services, Engine, Frontend and Gameplay Programmer, Game Design, Level Design, Data Science, Communications and Product Management interns, with Machine Learning and Engine Programmer postings in London, Montreal and multiple locations. The postings reviewed are not remote-eligible and list no pay or application deadline.",
    status: "2027 postings open at review",
    url: "https://epicgames.com/careers/jobs/6152263004?gh_jid=6152263004",
    sources: [
      { name: "Epic Games' Greenhouse job board: current internship postings and locations", url: "https://boards-api.greenhouse.io/v1/boards/epicgames/jobs" },
      { name: "Gameplay Programmer Intern: qualifications, start date and work authorization", url: "https://epicgames.com/careers/jobs/6152263004?gh_jid=6152263004" },
      { name: "Game Design Intern: Unreal Engine and playable-portfolio requirements", url: "https://epicgames.com/careers/jobs/6193647004?gh_jid=6193647004" },
      { name: "Product Management Intern: MBA requirement and ongoing recruitment", url: "https://epicgames.com/careers/jobs/6161289004?gh_jid=6161289004" },
    ],
    steps: [
      "Pick the posting that fits your discipline — programming, game or level design, data science, machine learning, communications or product management — and check its location.",
      "Confirm you are legally authorized to work in that location for the whole internship.",
      "Build the evidence the posting asks for, such as C++ projects for programming roles or a portfolio of playable Unreal Engine projects for design roles, and apply early, since recruitment continues only until teams find a match.",
    ],
    prepare: [
      "For design roles, Epic asks for playable work. Host each project so it runs without setup, and add a short note on your role, the engine features you used and what you would change. This is our suggestion, not an Epic rule.",
      "For programming roles, a small C++ gameplay system you built — a camera, an ability, an AI behavior — with a short video and a code link shows more than a list of languages.",
    ],
    pitfall: "Epic has not marked these roles as summer-only: each has a flexible 2027 start date, and teams stop recruiting once they find a match. The posting text, not the season, decides when you need to apply.",
    materials: ["Work authorization for the posting location", "C++ project link (programming roles)", "Playable Unreal Engine portfolio (design roles)", "Resume"],
    guideSlugs: [G.portfolio, G.resume, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "de-shaw-summer-internships-2027", company: "D. E. Shaw", title: "Summer 2027 Internships", initials: "DE", color: "#1b365d",
    seoTitle: "D. E. Shaw Internship 2027: Pay & How to Apply",
    seoDescription: "D. E. Shaw's 12-week Summer 2027 internships in New York pay a $25,000 monthly base plus a $25,000 sign-on bonus, with housing. Apply by year-end; selection is rolling.",
    fields: ["finance", "technology", "research"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "All class years · most join before final year", pay: "Paid", location: "New York, NY; also London and Asia offices", mode: "12 weeks, June–August 2027",
    summary: "D. E. Shaw's Summer 2027 internships, including software development and quantitative analysis roles, mostly at its New York headquarters.",
    eligibility: [
      "D. E. Shaw encourages undergraduate and graduate students from all academic disciplines, schools and class years to apply, though most of its interns join the summer before they graduate.",
      "The Software Developer and Quantitative Analyst Intern postings (New York) are for students in full-time degree programs, typically approaching their final year, with strong records in fields such as math, statistics, physics, engineering or computer science.",
      "The Software Developer posting asks for programming skill in Python, Java or C/C++; the Quantitative Analyst posting prefers Python and probability and statistics. Neither requires finance experience.",
    ],
    timing: "Summer internships typically start in early June and run through mid-August; the Software Developer and Quantitative Analyst postings describe a 12-week program from June to August 2027. Those postings list a monthly base salary of $25,000, a $25,000 sign-on bonus, overtime pay, a $3,300 self-study stipend, a $4,000 technology stipend, travel to and from the internship, and either furnished summer housing or a $10,000 housing allowance. Most interns work in New York, with others in London, Hong Kong, Shanghai and Singapore. D. E. Shaw considers applications on a rolling basis, typically completes intern selection early in the first quarter of the internship year, and recommends applying by the end of the previous calendar year — for Summer 2027, by the end of 2026.",
    status: "Summer 2027 postings open at review",
    url: "https://www.deshaw.com/careers/internships",
    sources: [
      { name: "D. E. Shaw internships: who can apply, dates, locations, housing and application timing", url: "https://www.deshaw.com/careers/internships" },
      { name: "Software Developer Intern (New York) – Summer 2027: qualifications and compensation", url: "https://www.deshaw.com/careers/software-developer-intern-new-york-summer-2027-5894" },
      { name: "Quantitative Analyst Intern (New York) – Summer 2027: qualifications and compensation", url: "https://www.deshaw.com/careers/quantitative-analyst-intern-new-york-summer-2027-5890" },
    ],
    steps: [
      "Choose a Summer 2027 posting on D. E. Shaw's careers site, such as the Software Developer or Quantitative Analyst Intern roles in New York.",
      "Apply before the end of 2026, as D. E. Shaw recommends, since it reviews applications on a rolling basis and usually finishes selection early in the first quarter.",
      "Prepare for technical questions in your area: programming for software roles, and probability, statistics and abstract reasoning for quantitative roles.",
    ],
    prepare: [
      "D. E. Shaw says no finance background is needed for its technical internships. Spend your preparation time on fundamentals — data structures for software roles, probability for quantitative roles — rather than finance vocabulary. This is our suggestion, not a D. E. Shaw rule.",
      "Applying in the fall rather than the spring matters most with rolling review. Have a resume with one strong technical project ready before the semester gets busy.",
    ],
    pitfall: "Waiting until spring is risky: selection is usually complete early in the first quarter of the internship year, and the firm recommends applying by the end of 2026 for Summer 2027.",
    materials: ["Resume with a technical or quantitative project", "Transcript showing quantitative coursework", "Python, Java or C/C++ examples", "Probability and statistics practice"],
    guideSlugs: [G.when, G.assessment, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "bny-summer-internship-2027", company: "BNY", title: "Summer Internship Program", initials: "BN", color: "#00507a",
    seoTitle: "BNY Summer Internship 2027: Eligibility & Dates",
    seoDescription: "BNY's 10-week 2027 summer internship is for undergraduates graduating December 2027 to May 2028, open to all majors with a business and technology focus. Applications open.",
    fields: ["finance", "business", "technology"],
    firstYear: null, years: [], yearLabel: "Graduating Dec 2027–May 2028", pay: "Paid", location: "BNY offices; postings by location", mode: "10-week summer program",
    summary: "BNY's 10-week summer internship for undergraduates across core areas of financial services, with an induction program and project work.",
    eligibility: [
      "BNY's eligibility statement reads: \"Current undergraduate students graduating between December 2027 and May 2028 with limited opportunities for those graduating August 2028 not requiring sponsorship for employment visa status, now or in the future.\"",
      "The program is open to all majors, with a strong focus on business-related and technology-related majors.",
      "Individual 2027 postings on BNY's careers portal set role-specific requirements and locations.",
    ],
    timing: "BNY's internship program runs 10 weeks and gives undergraduates real-world experience across core areas of financial services. Interns join an induction experience to meet peers, learn about BNY and hear from leaders, then work on projects solving real business problems. At review, BNY's page said applications were open and invited students to search its 2027 internships; it gives no deadline or pay figure.",
    status: "2027 applications open at review",
    url: "https://www.bny.com/corporate/global/en/about-us/careers/students/internship-program.html",
    sources: [
      { name: "BNY Internship Program: eligibility, majors, program structure and application status", url: "https://www.bny.com/corporate/global/en/about-us/careers/students/internship-program.html" },
    ],
    steps: [
      "Confirm your graduation date falls between December 2027 and May 2028; BNY lists only limited opportunities for August 2028 graduates.",
      "Search BNY's 2027 internships from the program page and choose roles that fit a business or technology major.",
      "Optionally join BNY's Intern Talent Community from the same page to hear about further openings.",
    ],
    prepare: [
      "Before an interview, read BNY's own description of its businesses and pick one you can explain in your own words, tied to the area you applied for. This is our suggestion, not a BNY rule.",
      "If you are not a business or technology major, connect your coursework to a specific BNY project area — for example, writing and communication for client-facing roles, or statistics for analytics.",
    ],
    pitfall: "Read the sponsorship wording carefully: BNY's page ties its eligibility statement to candidates not requiring sponsorship for employment visa status, now or in the future.",
    materials: ["Graduation date (Dec 2027–May 2028)", "Resume", "Business or technology coursework list", "Work-authorization check"],
    guideSlugs: [G.when, G.resume, G.intl],
    verified: "2026-10-01",
  },
];
