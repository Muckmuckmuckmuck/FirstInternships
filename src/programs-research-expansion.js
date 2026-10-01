// Independent-institute and university summer research programs — sourced
// program batch, reviewed 2026-10-01.
//
// Every fact below was read on the host institution's own pages on the review
// date. Left out rather than guessed:
//   Harvard SHURP, Yale SURF   both take applications through the Leadership
//               Alliance Summer Research-Early Identification Program, which
//               already has its own guide.
//   UCSF SRTP, Stowers, Johns Hopkins DSIP, LPI   their pages refused
//               automated reads at review.
//   HHMI Janelia, Santa Fe Institute, Purdue SURF, NYU Langone SURP,
//               Dana-Farber   no 2027 details, or no current program details,
//               were published at review.
//   Mount Sinai SURP4US   its page and its search listing disagreed about which
//               class years may apply.
//   MBL          its summer program is an NSF REU site, covered by the REU guide.
//
// Date notes: MSK publishes an 8:00 a.m. Eastern close and MD Anderson an
// 11:59 p.m. Central close, so both carry exact instants. UT Southwestern
// publishes a date without a time. WHOI, STScI, Caltech WAVE and the Big Ten
// SROP give dates without a year or only the last cycle's dates, so those stay
// in prose. Stipends labelled with a past year are past-cohort amounts.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  statement: "research-internship-personal-statement",
  references: "ask-for-internship-recommendation-letter",
  files: "internship-application-file-format",
  portfolio: "internship-project-portfolio",
  intl: "international-student-internship-questions",
};

export const RESEARCH_PROGRAMS_2 = [
  {
    id: "whoi-summer-student-fellowship", company: "Woods Hole Oceanographic Institution", title: "Summer Student Fellowship", initials: "WH", color: "#0b5c7a",
    seoTitle: "WHOI Summer Student Fellowship: Eligibility & Pay",
    seoDescription: "WHOI's 10–12 week Summer Student Fellowship is for undergraduates who will have finished junior year, in any science or engineering field, with a stipend, housing and travel.",
    fields: ["research", "engineering", "life-sciences"],
    firstYear: 3, years: [3], yearLabel: "Juniors (rising seniors)", pay: "Paid", location: "Woods Hole, MA", mode: "Residential, 10–12 weeks",
    summary: "Woods Hole Oceanographic Institution's residential summer research fellowship for undergraduates in their last summer of college, matched with a WHOI scientist's project.",
    eligibility: [
      "Fellowships go to undergraduates who will have completed their junior year by the start of the fellowship; students who will graduate before it begins are not eligible.",
      "Applicants may study any field of science or engineering, including biology, chemistry, engineering, geology, geophysics, mathematics, meteorology, physics, oceanography and marine policy.",
      "International students may apply but must handle visa requirements — F-1 students at US schools discuss CPT or OPT with their school — and 14% US federal income tax is withheld from their stipend, travel allowance and the value of WHOI housing.",
    ],
    timing: "The fellowship is a 10- to 12-week residential program. For summer 2026, WHOI paid a stipend of $721 a week and a travel allowance of up to $720, and provided shared institution housing; 2027 figures were not yet published at review. The 2026 cycle's applications were due February 1, 2026 at 11:59 p.m. EST, with decisions in mid-March, and WHOI selects 25 to 30 fellows each summer. Check the admissions page for the 2027 timeline.",
    status: "2027 timeline not yet posted",
    url: "https://www.whoi.edu/what-we-do/educate/undergraduate-programs/summer-student-fellowship/ssf-admissions/",
    sources: [
      { name: "Admissions page: eligibility, fields, required materials and the 2026 deadline", url: "https://www.whoi.edu/what-we-do/educate/undergraduate-programs/summer-student-fellowship/ssf-admissions/" },
      { name: "Program overview: length, 2026 stipend, housing and travel allowance", url: "https://www.whoi.edu/what-we-do/educate/undergraduate-programs/summer-student-fellowship/ssf-program-overview/" },
      { name: "FAQs: international students, tax withholding, advisor matching and number of fellows", url: "https://www.whoi.edu/what-we-do/educate/undergraduate-programs/summer-student-fellowship/ssf-faqs/" },
    ],
    steps: [
      "Confirm you will have completed your junior year, and not graduated, by the start of the fellowship.",
      "Prepare a CV or resume, an unofficial transcript as a PDF, two letters of recommendation (you may name a third recommender) and answers to five essay questions of up to 200 words each.",
      "Submit by the published deadline; the 2026 cycle closed February 1 at 11:59 p.m. EST. WHOI then matches fellows with staff scientists whose research fits their interests.",
    ],
    prepare: [
      "Five essays of 200 words each leave no room for a general opening. Give each answer one specific example — a field trip, a lab measurement, a model you ran — and say what it taught you about doing research, rather than restating your interest in the ocean.",
      "WHOI matches you with a scientist whose work fits your interests, and projects are agreed jointly. Read a few WHOI researchers' recent work and name the kinds of questions you want to pursue, so the match has something concrete to go on. This is our suggestion, not a WHOI requirement.",
    ],
    pitfall: "The fellowship is meant for the last summer of college: you must have completed junior year by the start, and anyone graduating before it begins is ineligible.",
    materials: ["CV or resume", "Unofficial transcript (PDF)", "Two recommenders, plus an optional third", "Five 200-word essay answers", "Visa and tax plan if international"],
    guideSlugs: [G.statement, G.references, G.intl],
    verified: "2026-10-01",
  },
  {
    id: "stsci-space-astronomy-summer-program", company: "Space Telescope Science Institute", title: "Space Astronomy Summer Program", initials: "ST", color: "#1b2a5c",
    seoTitle: "STScI Space Astronomy Summer Program 2027",
    seoDescription: "STScI's Space Astronomy Summer Program runs May 31–July 30, 2027 in Baltimore, mainly for students between junior and senior year. Applications open January 2027.",
    fields: ["research", "aerospace", "technology"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "Mainly between junior and senior year", pay: "Paid", location: "Baltimore, MD", mode: "May 31–July 30, 2027",
    summary: "The Space Telescope Science Institute's summer program for undergraduates interested in space-based astronomy, engineering or public outreach, held on its Baltimore campus.",
    eligibility: [
      "The program primarily serves undergraduates from the U.S. and other countries between their junior and senior years, and also accepts exceptional undergraduates in earlier years.",
      "STScI says it is primarily open to upper-division undergraduates with a strong interest in space-based astronomy, engineering or public outreach; other candidates may be considered individually.",
      "Accepted interns come to the STScI campus in Baltimore, Maryland.",
    ],
    timing: "The 2027 program runs May 31 through July 30, 2027, and applications open in January 2027. Students receive a stipend, housing assistance and travel reimbursement; amounts are not stated on the program pages. In the 2026 cycle, applications opened January 1 and closed January 31, 2026, and offers went out at the beginning of March with about five business days to accept.",
    status: "Applications open January 2027",
    url: "https://www.stsci.edu/opportunities/space-astronomy-summer-program",
    sources: [
      { name: "Program page: 2027 dates, who it is for, support and application timing", url: "https://www.stsci.edu/opportunities/space-astronomy-summer-program" },
      { name: "Application information: eligibility wording, 2026 dates and offer timing", url: "https://www.stsci.edu/opportunities/space-astronomy-summer-program/application-information" },
    ],
    steps: [
      "Watch for the application to open in January 2027, and plan for a short window; the 2026 window lasted one month.",
      "Complete every required section of the online application.",
      "If you receive an offer in early March, respond within the deadline in the letter — about five business days in the last cycle.",
    ],
    prepare: [
      "The program spans astronomy, engineering and public outreach, so say which you are drawn to and show it: a data-reduction script, an instrument or optics lab, or an outreach event you organized. A clear focus helps match you to a mentor.",
      "If you are earlier than junior year, you are competing as an exceptional case. Make one piece of independent work — research, a technical project or published outreach material — easy to find and easy to evaluate. This is our suggestion, not STScI's process.",
    ],
    pitfall: "Offers must be accepted or declined within about five business days of the early-March letter, so decide how you would rank other summer offers before it arrives.",
    materials: ["Interest area: astronomy, engineering or outreach", "Resume and transcript details", "One example of independent work", "Plan to reach Baltimore May 31, 2027", "Decision plan for early-March offers"],
    guideSlugs: [G.statement, G.when, G.references],
    verified: "2026-10-01",
  },
  {
    id: "msk-summer-undergraduate-research", company: "Memorial Sloan Kettering Cancer Center", title: "Summer Undergraduate Research Programs", initials: "MS", color: "#1d4e89",
    seoTitle: "MSK Summer Research Programs 2027: Apply by Feb 1",
    seoDescription: "MSK's immunology, mechanistic biology and engineering-imaging summer programs take sophomores and juniors, pay $6,500 plus housing, and close Feb 1, 2027 at 8 a.m. ET.",
    fields: ["research", "life-sciences", "healthcare", "engineering"],
    firstYear: 2, years: [2, 3], yearLabel: "Sophomores and juniors", pay: "Paid", location: "New York, NY", mode: "June 1–August 6, 2027",
    summary: "Memorial Sloan Kettering's 10-week summer research programs in immunology, mechanistic biology, and engineering and imaging, for sophomores and juniors considering biomedical research careers.",
    eligibility: [
      "The Immunology Research, Mechanistic Biology, and Engineering and Imaging summer programs are for domestic and international undergraduate sophomores and juniors at US-accredited institutions.",
      "Each asks for a minimum GPA of 3.0 and some advanced science coursework. Mechanistic Biology and Engineering and Imaging list previous research experience; Immunology says lab experience is not required, though most past interns had some.",
      "Non-US citizens enrolled at a US-accredited institution may apply, but accepted interns must show eligibility to work in the US; only F-1 or J-1 student visas are acceptable, and MSK does not sponsor visas.",
    ],
    timing: "For 2027, the application portal opens November 2, 2026 and closes February 1, 2027 at 8:00 a.m. Eastern; recommendation letters must arrive by February 4, 2027, and offers are made by March 15, 2027. The programs run June 1 to August 6, 2027, and each pays a $6,500 stipend and provides housing. Applicants may apply to up to two MSK summer programs; their admissions committees are separate.",
    status: "Published deadline",
    deadline: "2027-02-01T13:00:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Feb 1, 8 a.m. ET",
    url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/application-process-faq",
    sources: [
      { name: "Application process FAQ: deadlines, letters, decisions and the two-program limit", url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/application-process-faq" },
      { name: "Immunology Research Summer Program: eligibility, international applicants, 2027 timeline, stipend and housing", url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/immunology-research-summer-program" },
      { name: "Mechanistic Biology Summer Program: eligibility, 2027 dates, stipend and materials", url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/mechanistic-biology-summer-program" },
      { name: "Engineering and Imaging Summer Program: eligibility, 2027 timeline and stipend", url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/engineering-imaging-summer-program" },
    ],
    steps: [
      "Choose up to two MSK summer programs; the biology programs share these rules, and the Computational Biology program has its own.",
      "Apply in the portal between November 2, 2026 and 8:00 a.m. Eastern on February 1, 2027, with the application form, admissions essay and transcripts.",
      "Ask two faculty members — research mentors preferred — for letters, which must arrive by February 4, 2027.",
    ],
    prepare: [
      "If you apply to two programs, write each essay for that program's science. Immunology, mechanistic biology and imaging ask different questions; name a technique or question from the program you are applying to and connect it to a lab or course you have done.",
      "Faculty research mentors are the preferred recommenders. If you have worked in a lab, ask that mentor early and send a summary of what you did and learned; if not, ask a professor from an advanced science course with a lab component. This is our suggestion, not an MSK rule.",
    ],
    pitfall: "The portal closes at 8:00 a.m. Eastern on February 1, not at midnight. Submit by January 31 to avoid losing the last night.",
    materials: ["Up to two chosen MSK programs", "Application form and admissions essay", "Transcripts (MBSP asks for official copies from all institutions)", "Two faculty recommendations by Feb 4, 2027", "Work-eligibility documents if international"],
    guideSlugs: [G.statement, G.references, G.intl],
    verified: "2026-10-01",
  },
  {
    id: "msk-computational-biology-summer-program", company: "Memorial Sloan Kettering Cancer Center", title: "Computational Biology Summer Program (CBSP)", initials: "MS", color: "#2a5f8f",
    seoTitle: "MSK Computational Biology Summer Program 2027",
    seoDescription: "MSK's Computational Biology Summer Program takes domestic freshmen, sophomores and juniors in CS or applied math, pays $6,500, and closes February 1, 2027 at 8 a.m. ET.",
    fields: ["research", "technology", "life-sciences", "healthcare"],
    firstYear: 1, years: [1, 2, 3], yearLabel: "Domestic freshmen–juniors", pay: "Paid", location: "New York, NY", mode: "June 1–August 6, 2027",
    summary: "Memorial Sloan Kettering's 10-week computational biology summer program for domestic freshmen, sophomores and juniors studying computer science, applied math or related fields.",
    eligibility: [
      "CBSP invites current domestic undergraduate freshmen, sophomores and juniors majoring in computer science, applied math or related fields.",
      "Applicants need a minimum GPA of 3.0 and completed college-level computer science courses in C/C++, Perl, Python, R or other languages; general biology or genetics courses are preferred but not required.",
      "Applicants submit two letters of recommendation, an admissions essay and an unofficial transcript through the online application system.",
    ],
    timing: "The CBSP application portal opens November 2, 2026 and closes February 1, 2027 at 8:00 a.m. Eastern, with offers made by March 15, 2027. The program runs June 1 to August 6, 2027 and pays a $6,500 stipend, and housing is available. MSK's FAQ says applicants may apply to up to two of its summer programs.",
    status: "Published deadline",
    deadline: "2027-02-01T13:00:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Feb 1, 8 a.m. ET",
    url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/computational-biology-summer-program-cbsp",
    sources: [
      { name: "Computational Biology Summer Program: eligibility, coursework, 2027 timeline, stipend and materials", url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/computational-biology-summer-program-cbsp" },
      { name: "Application process FAQ: letter deadline and the two-program limit", url: "https://www.mskcc.org/education-training/summer-scientific-undergraduate-programs/application-process-faq" },
    ],
    steps: [
      "Confirm you are a domestic freshman, sophomore or junior in computer science, applied math or a related major, with programming coursework completed.",
      "Apply in MSK's portal between November 2, 2026 and 8:00 a.m. Eastern on February 1, 2027, with an admissions essay and unofficial transcript.",
      "Arrange two letters of recommendation through the online system.",
    ],
    prepare: [
      "First-year students are eligible, so the programming evidence matters more than seniority. Show one program you wrote that handles real data — parsing files, analyzing a dataset, simulating a process — and describe the problem it solved rather than listing languages.",
      "Biology courses are preferred but not required. If you have none, show curiosity concretely: a genomics tutorial you completed or a short write-up of a biological dataset you explored. This is our suggestion, not an MSK requirement.",
    ],
    pitfall: "CBSP is for domestic students. Unlike MSK's biology programs, its page does not list international applicants as eligible.",
    materials: ["Programming coursework record", "One data-driven coding project", "Admissions essay", "Unofficial transcript", "Two recommenders"],
    guideSlugs: [G.statement, G.portfolio, G.references],
    verified: "2026-10-01",
  },
  {
    id: "md-anderson-cprit-cure", company: "MD Anderson Cancer Center", title: "CPRIT CURE Summer Undergraduate Program", initials: "MD", color: "#a12a2e",
    seoTitle: "MD Anderson CPRIT CURE Summer Program 2027",
    seoDescription: "MD Anderson's CPRIT CURE summer program takes students finishing years 1–3 by June 2027, pays up to $7,200, runs June 7–August 13, 2027, and closes January 13.",
    fields: ["research", "healthcare", "life-sciences"],
    firstYear: 1, years: [1, 2, 3], yearLabel: "Finishing years 1–3 by June 2027", pay: "Paid", location: "MD Anderson Cancer Center (on site)", mode: "10 weeks, June 7–August 13, 2027",
    summary: "MD Anderson's CPRIT CURE summer program, part of its CATALYST summer training programs, offering 10 weeks of cancer research for undergraduates of all majors.",
    eligibility: [
      "Students who will have completed their freshman, sophomore or junior year by June 2027 and are in good academic standing may apply; fifth-year seniors returning in fall 2027 may also apply.",
      "Undergraduates of all majors are welcome, and international students may apply if they hold a current visa through the duration of the program.",
      "Students cannot earn course credit or internship credit from their home institutions for taking part.",
    ],
    timing: "CURE applications open November 16 and close January 13 at 11:59 p.m. Central. MD Anderson's 2027 CATALYST summer program, which includes CURE, runs June 7 to August 13, 2027. On-site participants receive a stipend of up to $7,200 for the 10 weeks, which includes allowances for housing, living and travel; no additional allowances are available. CATALYST shares housing options after offers are returned by the March 4 response deadline.",
    status: "Published deadline",
    deadline: "2027-01-14T05:59:00Z", deadlineZone: "America/Chicago", deadlineLabel: "Summer 2027 · Jan 13, 11:59 p.m. CT",
    url: "https://www.mdanderson.org/education-training/research-training/early-career-pathway-programs/summer-research-programs/programs/cprit-cure.html",
    sources: [
      { name: "CPRIT CURE program page: eligibility, stipend, application window and materials", url: "https://www.mdanderson.org/education-training/research-training/early-career-pathway-programs/summer-research-programs/programs/cprit-cure.html" },
      { name: "CATALYST summer programs page: 2027 dates, stipend and housing process", url: "https://www.mdanderson.org/education-training/research-training/early-career-pathway-programs/summer-research-programs.html" },
    ],
    steps: [
      "Confirm you will have finished your freshman, sophomore or junior year by June 2027, or that you are a fifth-year senior returning in fall 2027.",
      "Gather official transcripts and a statement of your research experience and areas of interest.",
      "Ask two referees to upload letters, and submit between November 16 and 11:59 p.m. Central on January 13.",
    ],
    prepare: [
      "The research statement asks for experience and interests, and first-year students often have little lab work yet. Describe the closest thing you have — a course lab, a data analysis, a science fair project — and name the cancer research questions you want to learn about, so a mentor can see a fit.",
      "Because all majors are welcome, non-biology students should connect their field to cancer research directly: statistics to clinical data, engineering to devices or imaging, public health to prevention. This is our suggestion, not MD Anderson's process.",
    ],
    pitfall: "The up-to-$7,200 stipend covers housing, living and travel together; there is no separate housing allowance, so budget your rent from the stipend.",
    materials: ["Official transcripts", "Statement of research experience and interests", "Two referee letters", "Visa documents if international", "Housing budget from the stipend"],
    guideSlugs: [G.statement, G.references, G.when],
    verified: "2026-10-01",
  },
  {
    id: "big-ten-srop", company: "Big Ten Academic Alliance", title: "Summer Research Opportunities Program (SROP)", initials: "BT", color: "#14365d",
    seoTitle: "Big Ten SROP: Eligibility, Stipends & Deadline",
    seoDescription: "The Big Ten SROP places PhD-bound undergraduates in summer research at member universities. It needs a 3.0 GPA and US citizenship or residency; applications run Nov 1–Feb 10.",
    fields: ["research", "engineering", "life-sciences"],
    firstYear: null, years: [], yearLabel: "Two semesters done; one remaining", pay: "Paid", location: "Big Ten Academic Alliance universities", mode: "Summer research at a host campus",
    summary: "The Big Ten Academic Alliance's Summer Research Opportunities Program, a gateway to graduate education that places PhD-bound undergraduates with faculty mentors at member universities.",
    eligibility: [
      "Applicants need a cumulative GPA of 3.0 or higher and must be US citizens or permanent residents enrolled in a degree-granting program in the United States, Puerto Rico or another US territory.",
      "Applicants must have completed at least two semesters of undergraduate education by the summer and have at least one semester remaining after it.",
      "Applicants must have a strong interest in pursuing a PhD. SROP is not for students pursuing professional degrees such as law, medicine or an MBA, and students who have completed an undergraduate degree are not eligible.",
    ],
    timing: "Applications run November 1 to February 10 through one central system, with one transcript upload and two letters of recommendation in total. Stipends vary by host university, from $4,000 to $6,500 in the comparison the Alliance publishes, with housing and travel listed as provided at the universities shown (the University of Minnesota was marked to be determined).",
    status: "Applications open November 1",
    url: "https://btaa.org/resources-for/students/srop/eligibility",
    sources: [
      { name: "SROP eligibility requirements", url: "https://btaa.org/resources-for/students/srop/eligibility" },
      { name: "How to apply: application period, transcript and letters", url: "https://btaa.org/resources-for/students/srop/how-to-apply" },
      { name: "Program benefits: stipend, housing and travel by university", url: "https://btaa.org/resources-for/students/srop/program-benefits" },
    ],
    steps: [
      "Check the benefits comparison and decide which member universities you want; stipends differ by campus.",
      "Apply between November 1 and February 10 through the central application, uploading one transcript.",
      "Arrange two letters of recommendation in total.",
    ],
    prepare: [
      "SROP is explicitly a PhD pipeline. Your materials should say what kind of research question you want to spend a doctorate on and why, using a course, project or experience as evidence; interest in medicine or law alone does not fit the program.",
      "Because the stipend varies from $4,000 to $6,500 by campus, factor cost of living into your campus choices as well as research fit. This is our planning suggestion.",
    ],
    pitfall: "SROP is for students heading to a PhD: it is not for students aiming at law, medical or MBA degrees, and graduates are ineligible.",
    materials: ["Preferred host universities", "One transcript upload", "Two recommendation letters", "Statement of PhD interest", "Stipend and cost-of-living comparison"],
    guideSlugs: [G.statement, G.references, G.when],
    verified: "2026-10-01",
  },
  {
    id: "ut-southwestern-surf", company: "UT Southwestern Medical Center", title: "Summer Undergraduate Research Fellowship (SURF)", initials: "UT", color: "#0d4c87",
    seoTitle: "UT Southwestern SURF 2027: Deadline & Stipend",
    seoDescription: "UT Southwestern's 10-week SURF runs June 1–August 6, 2027 for science undergraduates past freshman year, US citizens or F-1 holders. $5,000 stipend; apply by Feb 1, 2027.",
    fields: ["research", "life-sciences", "healthcare"],
    firstYear: null, years: [], yearLabel: "Completed freshman year", pay: "Paid", location: "Dallas, TX", mode: "10 weeks, June 1–August 6, 2027",
    summary: "UT Southwestern Graduate School of Biomedical Sciences' 10-week summer research fellowship for undergraduates preparing for PhD or MD/PhD careers.",
    eligibility: [
      "Applicants must be enrolled in an undergraduate science degree program and have completed their freshman year.",
      "Applicants must be U.S. citizens or hold an F-1 visa.",
      "Fellows must commit to not taking courses, holding a job, volunteering or planning a vacation during the 10 weeks; selection weighs college grades, letters of recommendation and a career goal of a PhD or MD/PhD.",
    ],
    timing: "The SURF 2027 application opens November 1, 2026 and is due February 1, 2027; no time of day is given. The 2027 program runs June 1 to August 6, 2027. The stipend for the 10 weeks is $5,000 and is taxable. SURF covers housing for fellows who need it — in a local hotel with daily transport to campus — but fellows pay their own travel.",
    status: "Published deadline",
    deadlineDate: "2027-02-01", deadlineDateLabel: "Summer 2027 · Feb 1",
    url: "https://gsbs.utsouthwestern.edu/research-opportunities/surf/",
    sources: [
      { name: "SURF page: 2027 application window, dates, eligibility, stipend, housing and materials", url: "https://gsbs.utsouthwestern.edu/research-opportunities/surf/" },
    ],
    steps: [
      "Confirm you are in an undergraduate science program, have finished your freshman year, and are a U.S. citizen or F-1 visa holder.",
      "Gather transcripts and arrange two letters of recommendation from mentors, teachers, employers or advisers.",
      "Apply between November 1, 2026 and February 1, 2027, and keep June 1 to August 6, 2027 completely free.",
    ],
    prepare: [
      "Selection weighs a PhD or MD/PhD goal, so make it concrete: name a research question you would like to pursue in graduate school and the experience that led you to it. A short, specific answer beats a broad statement about helping patients.",
      "The no-courses, no-job, no-vacation rule is strict. Before applying, check your summer course plans and any job commitments so you can accept without conditions. This is our suggestion, not a UT Southwestern rule.",
    ],
    pitfall: "Fellows pay their own travel to Dallas, and the $5,000 stipend is taxable; budget for both before accepting.",
    materials: ["Transcripts", "Two recommendation letters", "Statement of PhD or MD/PhD goals", "Clear calendar for June 1–Aug 6, 2027", "Travel budget"],
    guideSlugs: [G.statement, G.references, G.when],
    verified: "2026-10-01",
  },
  {
    id: "caltech-wave-fellows", company: "Caltech", title: "WAVE Fellows Program", initials: "CW", color: "#ff6c0c",
    seoTitle: "Caltech WAVE Fellows: Eligibility & Deadline",
    seoDescription: "Caltech's 10-week WAVE Fellows program is for sophomores to non-graduating seniors with a 3.4 GPA and prior research. The 2027 application opens Nov 1 and is due January 9.",
    fields: ["research", "engineering", "technology"],
    firstYear: 2, years: [2, 3, 4], yearLabel: "Sophomores–non-graduating seniors", pay: "Paid", location: "Caltech, Pasadena, CA", mode: "10 weeks in summer",
    summary: "Caltech's 10-week summer research program for STEM undergraduates from other schools who are seriously considering graduate school, with academic and professional development.",
    eligibility: [
      "WAVE Fellows must be current sophomores, juniors or non-graduating seniors matriculated in a degree-granting undergraduate program, with a cumulative GPA of at least 3.4.",
      "Fellows must be U.S. citizens, permanent residents or have DACA status, have an interest in pursuing a PhD and have prior research experience.",
      "Applicants must not be under any academic or disciplinary sanction.",
    ],
    timing: "Caltech says the WAVE 2027 application opens November 1 and that applications and two faculty recommendations are due on or before January 9; awards are notified on a rolling basis in early March. For 2026, WAVE ran June 15 to August 21 and paid $6,000 for ten weeks plus on-campus housing and a dining and travel supplement of about $1,000; 2027 figures were not yet published. Fellows submit two interim reports, an abstract and a final paper and present at a Seminar Day.",
    status: "2027 application opens November 1",
    url: "https://sfp.caltech.edu/undergraduate-research/programs/wavefellows",
    sources: [
      { name: "WAVE Fellows page: program, 2026 award, housing, dates and requirements", url: "https://sfp.caltech.edu/undergraduate-research/programs/wavefellows" },
      { name: "WAVE eligibility requirements", url: "https://sfp.caltech.edu/undergraduate-research/programs/wavefellows/eligibility" },
      { name: "WAVE application information: deadline, materials, 2027 opening and notification", url: "https://sfp.caltech.edu/undergraduate-research/programs/wavefellows/application_information" },
    ],
    steps: [
      "Check that you meet every requirement, including the 3.4 GPA, prior research and PhD interest.",
      "When the 2027 application opens on November 1, prepare the online application and your unofficial transcript.",
      "Ask two faculty members for recommendations, which are due with your application on or before January 9.",
    ],
    prepare: [
      "Prior research is required, so describe it like a scientist: the question, your specific role, what you found and what you would do next. Reviewers can then judge how ready you are to start a Caltech project quickly.",
      "WAVE includes weekly talks by Caltech faculty and JPL scientists and engineers. Name a Caltech research group or area whose work you would like to join; it shows you have looked beyond the program's reputation. This is our suggestion, not Caltech's process.",
    ],
    pitfall: "Only non-graduating seniors may apply, and the 3.4 GPA minimum is higher than many summer programs set.",
    materials: ["Online application (opens Nov 1)", "Unofficial transcript", "Two faculty recommendations", "Description of prior research", "Statement of PhD interest"],
    guideSlugs: [G.statement, G.references, G.when],
    verified: "2026-10-01",
  },
];
