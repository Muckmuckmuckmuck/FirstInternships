// National laboratory, federal research and federally funded R&D center
// internships — sourced program batch, reviewed 2026-10-01.
//
// Every fact below was read on the laboratory's or agency's own pages on the
// review date. DOE's SULI and Community College Internships already have their
// own guides, so a laboratory page that only describes those programs is not
// repeated here. Left out rather than guessed:
//   Los Alamos, Oak Ridge   their program pages state no eligibility rules
//               (Oak Ridge lists programs and fall deadlines only), and the
//               Los Alamos posting reviewed in search returned "not found".
//   Argonne, PNNL, AFRL Scholars, NREIP, Fermilab, NREL   their pages
//               refused automated reads or could not be reached at review.
//   Brookhaven   its undergraduate page describes DOE SULI, which already
//               has a guide.
//
// Notes on dates: NIST says its 2027 SURF applications are due "at the end of
// January 2027" without a date, and LLNL gives a computing application window
// alongside a note that windows vary by position, so neither carries a
// structured cutoff. Stipend figures labelled with a past year are past-cohort
// amounts, not 2027 commitments.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  statement: "research-internship-personal-statement",
  references: "ask-for-internship-recommendation-letter",
  files: "internship-application-file-format",
  interview: "internship-interview-guide",
  portfolio: "internship-project-portfolio",
};

export const LAB_PROGRAMS = [
  {
    id: "nist-surf", company: "NIST", title: "Summer Undergraduate Research Fellowship (SURF)", initials: "NI", color: "#2c5f8d",
    seoTitle: "NIST SURF 2027: Eligibility, Stipend & Deadline",
    seoDescription: "NIST's 11-week SURF program in Gaithersburg or Boulder is open to first-years through graduating seniors. 2027 applications are expected on USAJobs, due end of January.",
    fields: ["research", "engineering", "technology", "public-service"],
    firstYear: 1, years: [1, 2, 3, 4], yearLabel: "First-years through graduating seniors", pay: "Paid", location: "Gaithersburg, MD or Boulder, CO", mode: "In person, 40 hours a week for 11 weeks",
    summary: "NIST's 11-week paid summer research fellowship at its Gaithersburg and Boulder laboratories, open to full-time undergraduates from the first year through graduation.",
    eligibility: [
      "Applicants must be U.S. citizens or U.S. permanent residents and able to provide proof with the application.",
      "Applicants must be full-time undergraduate students at an accredited two-year or four-year college in the U.S. NIST says first-year undergraduates and graduating seniors taking part in a winter or spring commencement are eligible and encouraged to apply.",
      "Participants must be at least 18, pass a background check, provide proof of health insurance and receive payments by direct deposit.",
    ],
    timing: "NIST expects the 2027 vacancy announcement to open on USAJobs in mid-October 2026, with applications due at the end of January 2027; program dates were still to be determined at review. SURF runs 11 weeks in Gaithersburg, Maryland, or Boulder, Colorado, with accommodations for schedules such as quarter systems, and participants work 40 hours a week. NIST's pages give $7,810 as the stipend for recent 11-week programs ($710 a week), plus a housing allowance of up to $4,500 and travel support of up to $500 for students who relocate; the 2027 amount was not yet published. NIST's FAQ says applicants receive offers by April 20.",
    status: "2027 announcement expected mid-October",
    url: "https://www.nist.gov/surf",
    sources: [
      { name: "SURF page: eligibility, hours, stipend, housing support and 2027 application timeline", url: "https://www.nist.gov/surf" },
      { name: "SURF FAQs: program length, locations, required documents, references and offer timing", url: "https://www.nist.gov/surf/surf-faqs" },
    ],
    steps: [
      "Watch USAJobs for the SURF vacancy announcement, which NIST expects to open in mid-October 2026.",
      "Prepare every required document: a resume with any research experience, an unofficial transcript with your Social Security number and date of birth removed, proof of U.S. citizenship or permanent residency, a copy of your health insurance card and a personal statement.",
      "Line up two recommendation letters, ideally from professors, department heads, past mentors or advisers. You must notify your references through the online application system, then submit before the end-of-January deadline.",
    ],
    prepare: [
      "NIST places students on projects partly by the skills they bring, and the personal statement is where staff learn what those are. Name concrete techniques you have used — a lab instrument, a programming language, a statistics method — and the kind of measurement problem you want to work on, so a mentor can see where you fit.",
      "Two letters are required, and a first-year student may not yet know two professors well. Choose instructors from a lab section or a small seminar where you did visible work, ask early in the fall, and give them a one-page summary of what you did in their class. This is our suggestion, not a NIST rule.",
    ],
    pitfall: "Every document is required. An application missing proof of health insurance or of citizenship or permanent residency is not considered, and it is your job, not your references', to trigger their letter requests in the system.",
    materials: ["USAJobs account and saved announcement", "Resume and unofficial transcript (SSN and birth date removed)", "Proof of citizenship or permanent residency", "Health insurance card copy", "Personal statement and two recommenders"],
    guideSlugs: [G.statement, G.references, G.files],
    verified: "2026-10-01",
  },
  {
    id: "sandia-internships", company: "Sandia National Laboratories", title: "Student Internships and Co-ops", initials: "SN", color: "#1a5a8c",
    seoTitle: "Sandia Internship: Eligibility, GPA & Terms",
    seoDescription: "Sandia's paid internships and co-ops need full-time enrollment and a 3.0 GPA for technical or business roles, run 10–12 weeks in summer, and need US citizenship for cleared jobs.",
    fields: ["engineering", "research", "technology", "public-service"],
    firstYear: null, years: [], yearLabel: "Full-time students; GPA by role", pay: "Paid", location: "Albuquerque, NM and Livermore, CA", mode: "Summer, year-round or co-op",
    summary: "Sandia National Laboratories' paid summer, year-round and co-op positions for full-time students, posted individually in Albuquerque and Livermore.",
    eligibility: [
      "Applicants need full-time enrollment — typically 12 units for undergraduates — at an accredited college, university or high school, and must be at least 16.",
      "The minimum cumulative GPA, which Sandia does not round, is 3.0 for research and development, technical or business positions and 2.5 for clerical or laborer positions.",
      "U.S. citizenship is required for positions that need a security clearance or where the job posting states it.",
    ],
    timing: "Summer internships typically run 10 to 12 weeks, generally from May to the last Thursday in August, at up to 40 hours a week. Year-round interns can work up to 25 hours a week during the academic term and up to 40 during breaks, and co-ops typically run three to eight months during the term at up to 40 hours a week. All interns are non-exempt temporary employees paid hourly according to their classification and degree level. At review, openings were listed in Albuquerque, New Mexico, and Livermore, California.",
    status: "Openings posted individually",
    url: "https://www.sandia.gov/careers/career-possibilities/students-and-postdocs/internships-co-ops/",
    sources: [
      { name: "Internships and co-ops page: eligibility, GPA rules, program types, hours, pay basis and locations", url: "https://www.sandia.gov/careers/career-possibilities/students-and-postdocs/internships-co-ops/" },
    ],
    steps: [
      "Create an account in Sandia's careers tool.",
      "Search the student openings and apply to each job separately; Sandia does not route one application to several roles.",
      "Check each posting for citizenship or clearance requirements and make sure your unrounded GPA meets the minimum for that position type.",
    ],
    prepare: [
      "Because every role is a separate application, tailor each one. Lead with the coursework or project closest to the posting's work — a circuits lab for an electrical role, a finite-element model for mechanical, a security project for cyber — rather than sending one general resume to many openings.",
      "Year-round internships let you keep working part time during the semester. If you are near Albuquerque or Livermore, a summer role that continues into the school year can build much deeper experience than one summer; ask about it in interviews. This is our suggestion, not a Sandia rule.",
    ],
    pitfall: "Sandia does not round GPAs. A 2.99 does not meet the 3.0 minimum for research, technical or business positions.",
    materials: ["Sandia careers account", "Unrounded cumulative GPA", "Proof of full-time enrollment", "Citizenship documents for cleared roles", "Resume tailored to each posting"],
    guideSlugs: [G.apply, G.portfolio, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "mit-lincoln-lab-summer-research", company: "MIT Lincoln Laboratory", title: "Summer Research Program", initials: "LL", color: "#8a1f2a",
    seoTitle: "MIT Lincoln Lab Summer Research Program Guide",
    seoDescription: "MIT Lincoln Laboratory's paid Summer Research Program runs mid-May to mid-August for US citizens who have finished sophomore year, with travel help and discounted housing.",
    fields: ["research", "engineering", "technology", "public-service"],
    firstYear: 3, years: [3, 4], yearLabel: "Completed sophomore year", pay: "Paid", location: "Lexington, MA", mode: "Mid-May to mid-August",
    summary: "MIT Lincoln Laboratory's paid summer research program for undergraduates who have finished their sophomore year and graduate students, placed with individual research groups.",
    eligibility: [
      "Students must have completed at least their sophomore year of college or be enrolled in a master's or doctoral program.",
      "Students must have maintained an excellent academic record.",
      "Students must be U.S. citizens.",
    ],
    timing: "The program runs from mid-May through mid-August with competitive weekly pay. Students relocating from more than 50 miles outside the Boston area receive round-trip travel expense assistance and discounted housing on Northeastern University's campus for up to 11 weeks, and a free weekday shuttle runs from the Northeastern and MIT campuses to the Laboratory. Positions are posted by research group on Lincoln Laboratory's careers site.",
    status: "Search current group postings",
    url: "https://www.ll.mit.edu/careers/student-opportunities/summer-research-program",
    sources: [
      { name: "Summer Research Program page: eligibility, dates, pay, travel, housing and shuttle", url: "https://www.ll.mit.edu/careers/student-opportunities/summer-research-program" },
    ],
    steps: [
      "Search Lincoln Laboratory's careers site for Summer Research Program postings; each is tied to a research group and its technical area.",
      "Confirm you will have completed your sophomore year by the start and that you are a U.S. citizen.",
      "Apply to the groups whose work matches your coursework, and ask about housing if you live more than 50 miles from Boston.",
    ],
    prepare: [
      "Postings are written by research groups, from radar and space systems to biotechnology, so read the group's description and match one project or course to it directly. A short line such as \"built a software-defined radio receiver in ECE 4xx\" tells a radar group more than a list of languages.",
      "The program is research, not routine engineering. Prepare to explain one technical problem you could not solve at first and how you found a way forward; that is closer to the daily work than a polished final result. This is our suggestion, not Lincoln Laboratory's process.",
    ],
    pitfall: "Completing sophomore year is the floor: a first- or second-year student who will not have finished sophomore year by the summer start is not eligible, regardless of skills.",
    materials: ["Chosen research-group postings", "Transcript showing completed sophomore year", "Proof of U.S. citizenship", "Project tied to the group's work", "Housing and travel plan if relocating"],
    guideSlugs: [G.statement, G.portfolio, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "llnl-computing-internships", company: "Lawrence Livermore National Laboratory", title: "Computing Internships", initials: "LN", color: "#24557a",
    seoTitle: "Lawrence Livermore Internship: Computing Roles",
    seoDescription: "LLNL's paid computing internships for undergraduate and graduate students run 10–12 weeks. LLNL lists applications from Sept. 1, 2026 to Jan. 15, 2027; windows vary by role.",
    fields: ["technology", "research", "engineering"],
    firstYear: null, years: [], yearLabel: "Undergraduate and graduate students", pay: "Paid", location: "Livermore, CA", mode: "Most programs 10–12 weeks",
    summary: "Lawrence Livermore National Laboratory's paid computing internships for undergraduate and graduate students, posted by program on LLNL's careers site, including a technical program for community college students.",
    eligibility: [
      "Computing internships are for currently enrolled undergraduate and graduate students in computer science and related STEM fields.",
      "Interns must be 18 or older at the start of the internship.",
      "U.S. citizens and foreign nationals can apply, depending on the position. LLNL's Technical Internship Program is aimed at currently enrolled community college students interested in IT and networking.",
    ],
    timing: "LLNL's computing intern FAQ lists applications from September 1, 2026 through January 15, 2027, and also notes that application periods open and close throughout the year, so check each posting. Most programs run 10 to 12 weeks. Positions are paid at what LLNL calls industry-competitive rates, and relocation reimbursement is available with exceptions.",
    status: "2027 computing applications open at review",
    url: "https://computing.llnl.gov/careers/interns/faq",
    sources: [
      { name: "Computing intern FAQ: eligibility, citizenship, pay, length, application window and how to apply", url: "https://computing.llnl.gov/careers/interns/faq" },
    ],
    steps: [
      "Browse the computing intern positions on LLNL's careers website; each program and position lists its own requirements.",
      "Check whether the position is open to foreign nationals, since that varies.",
      "Choose the position and select Apply Now, ideally well before January 15, 2027.",
    ],
    prepare: [
      "LLNL computing spans high-performance computing, data science, cybersecurity and IT. Pick the program closest to your evidence and show it plainly: a parallel-programming assignment, a data pipeline you built, a capture-the-flag result or a home network you configured.",
      "Community college students interested in IT and networking have a dedicated route in the Technical Internship Program. Treat hands-on work — help-desk shifts, lab administration, certifications you are studying for — as real evidence and describe what you fixed or configured. This is our suggestion, not an LLNL requirement.",
    ],
    pitfall: "Eligibility for foreign nationals varies by position. Read each posting's requirements rather than assuming one answer applies across LLNL's computing programs.",
    materials: ["Chosen computing program and posting", "Proof of current enrollment", "Project matched to the program", "Citizenship status for the posting", "Relocation questions"],
    guideSlugs: [G.portfolio, G.apply, G.when],
    verified: "2026-10-01",
  },
  {
    id: "jhu-apl-college-internships", company: "Johns Hopkins Applied Physics Laboratory", title: "College Summer Internships", initials: "AP", color: "#00305e",
    seoTitle: "Johns Hopkins APL Internship: Who Can Apply",
    seoDescription: "Johns Hopkins APL's paid summer internships need a 3.0 GPA and full-time enrollment the semester after. Postings appear each fall on a rolling basis and stay open until filled.",
    fields: ["engineering", "research", "technology", "public-service"],
    firstYear: null, years: [], yearLabel: "Full-time next semester; 3.0 GPA", pay: "Paid", location: "Laurel, MD main campus", mode: "Summer",
    summary: "Johns Hopkins Applied Physics Laboratory's paid summer internships for college students, posted individually each fall and filled on a rolling basis.",
    eligibility: [
      "APL asks for a minimum GPA of 3.0.",
      "Interns must be enrolled as full-time students for the semester following the internship.",
      "The internships page does not set a class year or field of study; each posting lists its own discipline and any security requirements.",
    ],
    timing: "APL describes an immersive summer internship working on real-world challenges alongside students from across the country, with competitive pay, paid holidays and networking. Internship opportunities are posted each fall on a rolling basis and remain open until filled, so 2027 roles appear through the autumn and can disappear quickly. The main campus is in Laurel, Maryland.",
    status: "2027 roles posted through the fall",
    url: "https://www.jhuapl.edu/careers/internships",
    sources: [
      { name: "College internships page: GPA, enrollment rule, pay and posting timeline", url: "https://www.jhuapl.edu/careers/internships" },
    ],
    steps: [
      "Search APL's careers portal for college internships starting in the fall; new roles are posted on a rolling basis.",
      "Read each posting for its field of study and any security requirements.",
      "Apply soon after a matching role appears, since postings close once filled.",
    ],
    prepare: [
      "Rolling postings reward early, complete applications. Keep a resume ready by September that names your GPA, expected graduation and the lab or design project closest to APL's work, so you can apply the week a role is posted.",
      "Many APL roles support defense and space programs, where careful documentation matters. Describe a project where you wrote up requirements, tests or results for someone else to use; it shows the habit the work depends on. This is our suggestion, not APL's process.",
    ],
    pitfall: "You must return as a full-time student the semester after the internship, so a student graduating in the spring before the summer does not qualify.",
    materials: ["Resume with GPA and graduation date", "Proof of full-time enrollment next semester", "Project matched to the posting", "Job alerts on APL's portal", "Answers to any security questions in the posting"],
    guideSlugs: [G.apply, G.when, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "mitre-internships", company: "MITRE", title: "Summer Internships and Co-ops", initials: "MI", color: "#1d4f91",
    seoTitle: "MITRE Internship: Eligibility, Timing & Sites",
    seoDescription: "MITRE's 10–12 week internships, mostly for rising juniors and seniors, start late May or early June in Bedford, McLean and 50+ sites. MITRE does not sponsor work visas.",
    fields: ["technology", "engineering", "research", "public-service"],
    firstYear: null, years: [], preferredYears: [3, 4], yearLabel: "Mostly rising juniors and seniors", pay: "Check opening", location: "Bedford, MA; McLean, VA; 50+ other sites", mode: "10–12 weeks, late May or June start",
    summary: "MITRE's summer internships and co-ops, mostly for rising college juniors and seniors in computing, engineering, cybersecurity and data science, at its Bedford and McLean campuses and other sites.",
    eligibility: [
      "MITRE says most interns are rising college juniors or seniors, but it hires exceptional students at every level, even in high school; graduate students are about 15% of interns.",
      "MITRE does not hire students who will need sponsorship to work in the U.S. now or in the future; some positions are open to people authorized to work permanently in the U.S.",
      "It hires many computer science, electrical and computer engineering students, has a growing need for cybersecurity and data science, and also values behavioral science and humanities students.",
    ],
    timing: "Internships last 10 to 12 weeks. Interns choose one of three start dates in late May or early June and one of three end dates in late July or early August. Many positions are in Bedford, Massachusetts, or McLean, Virginia, with more than 50 other sites. Most internships do not require a clearance. MITRE says students who will not be considered that year hear by early November, and that hiring continues through spring. The page does not publish pay.",
    status: "Hiring continues through spring",
    url: "https://careers.mitre.org/us/en/co-ops-interns",
    sources: [
      { name: "Co-ops and interns page: who MITRE hires, sponsorship, length, start dates, sites, clearance and hiring timeline", url: "https://careers.mitre.org/us/en/co-ops-interns" },
    ],
    steps: [
      "Search MITRE's careers site for intern and co-op postings in your field and preferred site.",
      "Confirm you will not need work-visa sponsorship now or in the future.",
      "Apply in the fall if you can; if you have not heard by November, MITRE says hiring continues through spring.",
    ],
    prepare: [
      "MITRE works for government sponsors on public problems, and it says it looks for an interest in serving the public. Connect your strongest project to a public outcome — safer systems, better data for a city, an accessibility tool — and explain who would benefit.",
      "Behavioral science and humanities students are a stated interest. If that is you, show a methods-heavy project, such as a survey you designed or an analysis of interview data, and how its findings could inform a technical system. This is our suggestion, not a MITRE requirement.",
    ],
    pitfall: "Not hearing back by November is not a rejection: MITRE says it tells students by early November if they will not be considered, and continues hiring through spring.",
    materials: ["Chosen postings and site", "Work authorization without future sponsorship", "Project tied to a public outcome", "Preferred start and end dates", "Resume with graduation date"],
    guideSlugs: [G.apply, G.interview, G.portfolio],
    verified: "2026-10-01",
  },
];
