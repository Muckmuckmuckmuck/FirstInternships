// Undergraduate research expansion reviewed 2026-09-20.
//
// Independent-institute and consortium research programs, chosen because their
// official pages publish what students most need and this directory most
// lacked: real cutoffs, real stipends and real participation conditions.
//
// Note the three different date situations here, which are not interchangeable:
//   jax-summer-student   a future cutoff with an exact time and zone, so it
//                        carries a `deadline` and reaches the deadline hub.
//   broad-bsrp           a cutoff that has already passed. Recorded as passed;
//                        the next cycle's dates are not inferred from it.
//   leadership-alliance  a date with no published time. The schema needs an
//                        exact instant, and inventing 23:59 would be a
//                        fabricated cutoff, so this record carries no
//                        `deadline` and states the date in prose instead.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  pay: "do-internships-pay",
  statement: "research-internship-personal-statement",
  letter: "ask-for-internship-recommendation-letter",
  files: "internship-application-file-format",
};

export const RESEARCH_PROGRAMS = [
  {
    id: "jax-summer-student", company: "The Jackson Laboratory", title: "JAX Summer Student Program", initials: "JX", color: "#00558c",
    seoTitle: "JAX Summer Student Program: Apply by Jan 25",
    seoDescription: "A 10-week genetics and genomics research program with a $7,500 stipend plus room, board and travel. Applications for 2027 close January 25, 2027 at 5 p.m. ET.",
    fields: ["research", "life-sciences", "healthcare"],
    firstYear: null, years: [], yearLabel: "Undergraduate; year not stated", pay: "Paid", location: "Bar Harbor, Maine & Farmington, Connecticut", mode: "In person, 40 hours per week",
    summary: "A ten-week mentored genetics and genomics research project at an independent biomedical institute, with a stipend, housing and travel covered.",
    eligibility: [
      "JAX states a $7,500 stipend for the 10-week program including room and board, with round-trip travel between the student's home and the laboratory also provided.",
      "Participation is full time: a 40-hour week, in person, covering lab work, weekly professional development sessions and a weekly journal club. Students must not hold another job or internship, or take summer classes, during the program.",
      "Students are required to attend the entire program, and JAX says it no longer accepts high school seniors. The admission page does not state a minimum college year; its eligibility detail sits behind a separate FAQ.",
    ],
    timing: "JAX publishes a 2027 cutoff of January 25, 2027 at 5:00 p.m. ET and says the 2027 application cycle opens in November. Acceptances are sent by email by March 31. The Farmington campus is described as not residential, which is a material difference from Bar Harbor if you need housing.",
    status: "2027 cutoff published",
    deadline: "2027-01-25T22:00:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Jan 25, 5 p.m. ET",
    url: "https://www.jax.org/education-and-learning/high-school-students-and-undergraduates/learn-earn-and-explore/admission",
    sources: [
      { name: "Stipend, program length, participation rules and the 2027 cutoff", url: "https://www.jax.org/education-and-learning/high-school-students-and-undergraduates/learn-earn-and-explore/admission" },
      { name: "Summer Student Program overview", url: "https://www.jax.org/education-and-learning/high-school-students-and-undergraduates/learn-earn-and-explore" },
    ],
    steps: [
      "Wait for the application to open in November, then start it early — the portal lets you save and return, and you can edit until the posted cutoff.",
      "Prepare the checklist items inside the application itself. JAX states that supplemental materials are not permitted, so anything outside the requested form will not be considered.",
      "Submit formally inside the portal before January 25, 2027 at 5:00 p.m. ET. An unsubmitted or incomplete application is not reviewed, and saving progress is not submitting.",
    ],
    prepare: [
      "JAX says it reviews for a deep desire to conduct an independent mentored research project in genetics and genomics, alongside curiosity, resilience and the ability to work both independently and in a team. Write about one question that genuinely held your attention and what you did to explore it, rather than listing admiration for the field.",
      "Resolve the summer conflict question before applying. The program forbids another job, internship or summer class, and asks students with significant conflicts such as overseas study to apply in a different year. Working that out now is cheaper than withdrawing later.",
    ],
    pitfall: "Saving progress in the portal is not submitting. JAX states that applications must be formally submitted by the cutoff and that incomplete or unsubmitted ones are not reviewed.",
    materials: ["Application portal account", "Genetics or genomics research interest statement", "Summer availability with no conflicting job or class", "Formal submission confirmation"],
    guideSlugs: [G.statement, G.apply, G.when],
    verified: "2026-09-20",
  },
  {
    id: "broad-bsrp", company: "Broad Institute", title: "Broad Summer Research Program", initials: "BI", color: "#00857d",
    seoTitle: "Broad Summer Research Program (BSRP) Guide",
    seoDescription: "A nine-week genomics research program with a $5,400 stipend, housing and travel. The 2026 cycle has closed; updated eligibility is expected in October 2026.",
    fields: ["research", "life-sciences", "technology"],
    firstYear: null, years: [], yearLabel: "Graduation-window based", pay: "Paid", location: "Cambridge, Massachusetts", mode: "In person, full time",
    summary: "A nine-week computational or experimental genomics research program at the Broad Institute, aimed at undergraduates intending to pursue a PhD or MD-PhD.",
    eligibility: [
      "The Broad states the program is nine weeks and full time, with a $5,400 stipend, free housing at partner university facilities, and air or ground travel to and from Boston within the US.",
      "For the closed 2026 cycle the Broad listed: enrolment in a four-year US college with a graduation date of December 2026 or later, a major in physical, biological or computer sciences, engineering or mathematics, a minimum 3.2 GPA, legal authorization to work in the US at the time of applying, and a strong interest in a PhD or MD-PhD. No previous research experience was required.",
      "The Broad says to check back in October 2026 for updated eligibility requirements for the next cycle, so the criteria above describe the cycle that has closed rather than the next one.",
    ],
    timing: "The application period for the 2026 program has closed. Its published dates were an application cutoff of January 11, 2026 at 11:59 p.m. ET, a recommendation-letter cutoff of January 13, notifications in mid-March, and program dates of June 1 to July 31, 2026. Next-cycle dates are not published yet and are not inferred here.",
    status: "Last published cycle closed",
    deadline: "2026-01-12T04:59:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2026 · Jan 11, 11:59 p.m. ET (passed)",
    url: "https://www.broadinstitute.org/bsrp/broad-summer-research-program-bsrp",
    sources: [
      { name: "Program length, stipend, benefits, closed-cycle eligibility and dates", url: "https://www.broadinstitute.org/bsrp/broad-summer-research-program-bsrp" },
      { name: "BSRP frequently asked questions", url: "https://www.broadinstitute.org/bsrp/frequently-asked-questions-about-bsrp" },
    ],
    steps: [
      "Check the BSRP page from October 2026 for the updated eligibility requirements, since the Broad says those are revised between cycles.",
      "Line up two recommendation letters early. The closed cycle set the letter cutoff two days after the application cutoff, so referees effectively worked to the same week.",
      "Prepare the unofficial transcript, CV or resume and short essay responses the application requires, and confirm you can commit to the full nine weeks with no other course or employment.",
    ],
    prepare: [
      "The program is explicitly oriented toward students intending a PhD or MD-PhD, and asks for a demonstrated interest in biomedical research rather than prior experience. Write about a question in genomics you want to work on and what you have already done to understand it, however modest.",
      "The exclusivity condition is strict: no other courses, no graduate-admission prep courses, no outside employment. Check that against any summer earning you were relying on before you apply, not after.",
    ],
    pitfall: "The eligibility list on the page belongs to the closed 2026 cycle, including its graduation-date window. Treat it as a guide to the shape of the requirements, not as the rule you will be assessed against.",
    materials: ["Updated eligibility check from October 2026", "Unofficial transcript", "Two recommendation letters", "Short essay responses"],
    guideSlugs: [G.statement, G.letter, G.when],
    verified: "2026-09-20",
  },
  {
    id: "leadership-alliance-sreip", company: "The Leadership Alliance", title: "Summer Research Early Identification Program", initials: "LA", color: "#7a2048",
    seoTitle: "Leadership Alliance SR-EIP: How to Apply",
    seoDescription: "One application reaches three of twenty research sites for a fully paid 8-10 week summer research placement. Citizenship, GPA and semester conditions apply.",
    fields: ["research", "life-sciences", "healthcare", "public-service"],
    firstYear: null, years: [], yearLabel: "Completed-semester based", pay: "Paid", location: "20 member research institutions across the US", mode: "In person; site-specific",
    summary: "A consortium program placing undergraduates in mentored research across the sciences, social sciences and humanities, with one application reaching three sites.",
    eligibility: [
      "Participants spend 8 to 10 weeks at a Leadership Alliance institution and receive a stipend plus travel and housing expenses from the research institution.",
      "The program states you must be a US citizen, non-citizen national, or permanent resident at the time of application; it says international students studying in the US on an F-1 visa are not eligible, nor are individuals seeking asylum or refugees.",
      "It also requires full-time enrolment at an accredited US institution, a GPA of 3.0 or better, a committed interest in a PhD or MD-PhD, and completion of at least two semesters with at least one semester remaining by the start of the summer program.",
    ],
    timing: "The page describes the 2026 cycle, which opened on November 1, 2025 and set a February 3, 2026 deadline for the complete package including two letters of recommendation and official transcripts. That date is given without a time of day, so no exact cutoff instant is recorded here. The 2027 cycle's dates are not yet published.",
    status: "Last published cycle closed",
    url: "https://theleadershipalliance.org/summer-research-early-identification-program",
    sources: [
      { name: "Program length, funding, eligibility conditions and 2026 cycle dates", url: "https://theleadershipalliance.org/summer-research-early-identification-program" },
    ],
    steps: [
      "Check the citizenship condition first. It is stated plainly and no part of the application can work around it, so it decides whether the rest is worth your time.",
      "Work out whether you meet the semester rule by the start of the summer: at least two semesters completed, and at least one still remaining afterwards.",
      "Review the list of member research sites and choose three deliberately, since one application covers three and each site publishes its own opportunities and requirements.",
    ],
    prepare: [
      "Because one application reaches three sites, the temptation is to write something general enough to suit all of them. Resist it — read what each site actually researches and let your choice of three be the thing that shows focus.",
      "The program states it is not designed for students heading toward law, business administration, clinical medicine or the allied health professions. If your goal is medical practice rather than research, this is worth reading carefully before applying.",
    ],
    pitfall: "The semester rule cuts at both ends. A student in their final semester has none remaining afterwards and does not meet it, even though they are still an undergraduate.",
    materials: ["Citizenship or residency status check", "Completed and remaining semester count", "Three chosen research sites", "Two recommendation letters and official transcripts"],
    guideSlugs: [G.statement, G.letter, G.files],
    verified: "2026-09-20",
  },
];
