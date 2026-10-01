// Aerospace, defense, automotive, energy and telecom — sourced program batch,
// reviewed 2026-10-01.
//
// Scaffolded 2026-09-28 so that batches researched in parallel never edit the
// same file. This module is already imported and spread into PROGRAMS in
// src/content.js; filling it requires no change anywhere else.
//
// Assigned employers (research each on its own official pages; skip any whose
// official student page cannot be read or does not establish enough to write
// an accurate guide — never fill a gap from memory or a third-party site):
// Northrop Grumman, RTX, General Dynamics, L3Harris, GE Aerospace, GE Vernova,
// Honeywell, 3M, Ford Motor Company, General Motors, Toyota North America,
// ExxonMobil, ConocoPhillips, Duke Energy, Verizon, AT&T, T-Mobile, Comcast.
//
// Records follow the program data model in docs/CLAUDE_CODE_PLAYBOOK.md §6.
// A date published without a time of day goes in `deadlineDate` (YYYY-MM-DD)
// with `deadlineDateLabel`; `deadline` is reserved for an exact instant with a
// published time and zone.
//
// Every fact below was read on the employer's own careers pages or official
// postings on the review date. Thirteen employers were left out rather than
// guessed. Industrial Summer 2027 recruiting runs early, and many postings
// found in search had already closed:
//   RTX, GE Aerospace, Comcast   the Summer 2027 postings opened at review
//               had been removed or returned "no longer posted"; GE
//               Aerospace's FAQ alone did not establish pay or requirements.
//   Northrop Grumman, 3M, Duke Energy   their posting systems did not render
//               readable text.
//   General Dynamics, T-Mobile, AT&T   their careers sites refused automated
//               reads (HTTP 403 or a malformed response).
//   L3Harris, Honeywell, Ford   their student pages gave no eligibility, pay
//               or dates (Honeywell's returned "page not found").
//   ConocoPhillips   its FAQ gives timing, but no eligibility or pay was
//               published for internships.
//
// Year notes: Toyota states its internships are open to undergraduate juniors
// and seniors, so it carries exact years. GM's and Verizon's postings use
// graduation windows, recorded as nonbinding preferredYears.

const G = {
  apply: "how-to-apply-for-an-internship",
  when: "when-to-apply-for-summer-internships",
  resume: "internship-resume-with-no-experience",
  interview: "internship-interview-guide",
  portfolio: "internship-project-portfolio",
  offer: "internship-offer-checklist",
};

export const EMPLOYERS_INDUSTRY_PROGRAMS = [
  {
    id: "ge-vernova-summer-internships", company: "GE Vernova", title: "Summer 2027 Internships", initials: "GV", color: "#1f6f5c",
    seoTitle: "GE Vernova Internship 2027: Eligibility & Pay",
    seoDescription: "GE Vernova posts Summer 2027 internships by business and site. The Wind Engineering posting pays $1,000–$2,000 a week by years completed and needs an ABET-accredited program.",
    fields: ["engineering", "manufacturing", "technology"],
    firstYear: null, years: [], yearLabel: "Full-time undergraduate or graduate students", pay: "Paid", location: "Greenville, SC; Schenectady, NY; other sites by posting", mode: "Between May and August 2027",
    summary: "GE Vernova's Summer 2027 internships, posted individually by business and site; the reviewed Wind Engineering internship pays weekly by years of study completed.",
    eligibility: [
      "The Wind Engineering Internship – Summer 2027 requires current full-time enrollment in an undergraduate or graduate engineering program at an ABET-accredited university, in mechanical, electrical or aero engineering.",
      "The posting prefers an overall GPA of 3.2 out of 4.0 or higher.",
      "Applicants must be able to work in the United States for an unlimited amount of time without sponsorship.",
    ],
    timing: "The Wind Engineering posting lists Greenville, South Carolina and Schenectady, New York, says all internships take place between May and August 2027, and publishes weekly pay of $1,000 to $2,000 based on years of undergraduate or graduate study completed. It was posted on August 20, 2026 and said it would remain open for at least seven days. GE Vernova posts its other Summer 2027 internships separately by business and site, each with its own requirements.",
    status: "Summer 2027 postings by business",
    url: "https://careers.gevernova.com/wind-engineering-internship-summer-2027/job/R5045680",
    sources: [
      { name: "Wind Engineering Internship – Summer 2027 posting: eligibility, locations, dates, pay and posting window", url: "https://careers.gevernova.com/wind-engineering-internship-summer-2027/job/R5045680" },
    ],
    steps: [
      "Search GE Vernova's careers site for Summer 2027 internships and filter by business and site.",
      "Check each posting's major, ABET accreditation, GPA preference and sponsorship rule against your situation.",
      "Apply soon after a posting appears; the posting reviewed promised only that it would stay open for at least seven days.",
    ],
    prepare: [
      "Engineering roles in wind and power reward evidence of working with real loads, systems or field data: a capstone, a design-team vehicle or turbine, or a lab where you analyzed measurements. Name the tool you used, such as CAD, MATLAB or Python, and the design decision your analysis informed.",
      "With postings that may close a week after they appear, keep an up-to-date resume and unofficial transcript ready and set job alerts for the businesses you want, so you can apply the day a role is posted. This is our planning advice, not a GE Vernova rule.",
    ],
    pitfall: "The Wind Engineering posting requires an engineering program at an ABET-accredited university. Check your specific program's accreditation, not just your university's, before applying.",
    materials: ["Chosen Summer 2027 posting and site", "Resume with completed years of study", "Program's ABET accreditation status", "One engineering project with data or design decisions", "Work authorization without sponsorship"],
    guideSlugs: [G.portfolio, G.apply, G.when],
    verified: "2026-10-01",
  },
  {
    id: "gm-summer-internships-2027", company: "General Motors", title: "2027 Summer Internships", initials: "GM", color: "#1c5aa6",
    seoTitle: "GM Internship 2027: Dates, Pay & Eligibility",
    seoDescription: "General Motors' 12-week 2027 summer internships start May 24 or June 14, 2027, are hybrid, and include a relocation stipend; the software posting pays $6,400–$10,300 a month.",
    fields: ["engineering", "technology", "business", "manufacturing"],
    firstYear: null, years: [], preferredYears: [2, 3], yearLabel: "Graduation window varies by posting", pay: "Paid", location: "Warren, MI; Austin, TX; Mountain View, CA; Milford, MI; Lynnwood, WA", mode: "Hybrid; on site at least three days a week",
    summary: "General Motors' 12-week 2027 summer internships, posted by function from sales to software engineering, with fixed start dates and a relocation stipend for eligible students.",
    eligibility: [
      "The 2027 Summer Intern – Sales Intern posting requires pursuing a bachelor's degree in business, sales or a related field and graduating between December 2027 and June 2029.",
      "The 2027 Summer Intern – Digital Product: Software Engineering posting requires pursuing a bachelor's in computer science, computer engineering, data science, information systems, mechanical engineering or a related field, with at least one more quarter or semester of school after the internship.",
      "The Sales posting states that GM does not provide immigration-related sponsorship for the role and asks applicants not to apply if they will need it now or in the future.",
    ],
    timing: "Both postings describe 12-week internships with start dates of May 24 and June 14, 2027. The roles are hybrid, with at least three days a week at the assigned site. The software posting publishes a monthly salary range of $6,400 to $10,300 and lists Austin, Lynnwood, Milford, Mountain View and Warren; the sales posting is in Warren and lists no pay. GM provides a one-time, taxable lump-sum stipend to eligible students in its 2027 Student Program to help with relocation. Neither posting gives an application deadline.",
    status: "2027 postings open at review",
    url: "https://search-careers.gm.com/en/jobs/jr-202620546/2027-summer-intern-digital-product-software-engineering/",
    sources: [
      { name: "2027 Summer Intern – Digital Product: Software Engineering posting: dates, locations, eligibility, pay and relocation stipend", url: "https://search-careers.gm.com/en/jobs/jr-202620546/2027-summer-intern-digital-product-software-engineering/" },
      { name: "2027 Summer Intern – Sales Intern posting: dates, hybrid rule, graduation window and sponsorship", url: "https://search-careers.gm.com/en/jobs/jr-202619694/2027-summer-intern-sales-intern/" },
    ],
    steps: [
      "Search GM's careers site for \"2027 Summer Intern\" and open the postings in your field; requirements and graduation windows differ by posting.",
      "Choose the start date you can make — May 24 or June 14, 2027 — and confirm you can work from the site at least three days a week.",
      "Apply while the posting is listed; the postings reviewed give no deadline.",
    ],
    prepare: [
      "The software posting accepts mechanical engineering alongside computing majors, which suits students who have built software for physical systems. If you have written code for a vehicle team, robot or sensor, describe what it controlled or measured and how you tested it on real hardware.",
      "For sales and fleet roles, GM's work runs through dealers and fleet customers. A job where you advised customers, handled objections or tracked sales numbers is relevant; quantify it where you can. This is our suggestion, not a GM requirement.",
    ],
    pitfall: "The relocation help is a one-time taxable lump sum, not housing arranged by GM. Budget for the tax and plan to find housing yourself near the assigned site.",
    materials: ["Chosen 2027 posting and site", "Start date: May 24 or June 14, 2027", "Resume with graduation date", "Housing plan using the relocation stipend", "Work authorization without sponsorship"],
    guideSlugs: [G.apply, G.offer, G.interview],
    verified: "2026-10-01",
  },
  {
    id: "toyota-student-internships", company: "Toyota North America", title: "Student Internships", initials: "TY", color: "#b52a2a",
    seoTitle: "Toyota Internship: Who Can Apply & How",
    seoDescription: "Toyota's paid 12-week internships are for undergraduate juniors and seniors with a 2.7 GPA, reliable transportation and US work authorization, at facilities across the US.",
    fields: ["engineering", "manufacturing", "business", "technology"],
    firstYear: 3, years: [3, 4], yearLabel: "Juniors and seniors", pay: "Paid", location: "Toyota facilities in MI, KY, IN, TX, CA, NC and other states", mode: "12 weeks during your school's summer",
    summary: "Toyota's 12-week paid internships for undergraduate juniors and seniors, typically based at one of its facilities across the United States during your university's summer months.",
    eligibility: [
      "Toyota says its internships are open to undergraduate juniors and seniors currently enrolled at an accredited university.",
      "Applicants must be at least 18, enrolled full time in a bachelor's or master's program, have a cumulative GPA of 2.7 or higher, and have reliable transportation to and from the work location.",
      "Applicants must have the legal right to work in the United States without sponsorship now or in the future.",
    ],
    timing: "Toyota describes a 12-week program that runs during your university's designated summer months, typically at one of its facilities in states including Michigan, Kentucky, Indiana, Texas, California and North Carolina. Interns and co-ops are paid every two weeks. At review, a 2027 Summer Internship posting found in search had already closed, so check the open positions on Toyota's careers site for current roles.",
    status: "Check open positions",
    url: "https://careers.toyota.com/us/en/students",
    sources: [
      { name: "Students page: class years, program length, locations, eligibility criteria and pay", url: "https://careers.toyota.com/us/en/students" },
    ],
    steps: [
      "Build a profile on Toyota's careers site.",
      "Search the open internship positions; Toyota also points students to Handshake, LinkedIn and Glassdoor.",
      "Apply to roles at facilities you can commute to reliably, and confirm your GPA and work authorization meet the stated criteria.",
    ],
    prepare: [
      "Many Toyota internships sit at manufacturing and engineering facilities. Show that you understand how work gets done on a floor or in a lab: a process you documented, a defect you traced to its cause, or a safety step you followed and why it mattered. Specific, small examples beat broad claims about efficiency.",
      "Because the program runs during your university's own summer months, write your exact available dates on the application and in interviews, so the team can see the 12 weeks fit. This is our suggestion, not a Toyota requirement.",
    ],
    pitfall: "Reliable transportation to the work location is a stated eligibility requirement. Confirm how you would get to the specific facility before you accept, not after.",
    materials: ["Toyota careers profile", "Cumulative GPA of 2.7 or higher", "Commute plan for the facility", "Exact summer availability", "Work authorization without sponsorship"],
    guideSlugs: [G.apply, G.resume, G.offer],
    verified: "2026-10-01",
  },
  {
    id: "exxonmobil-internships", company: "ExxonMobil", title: "US Internships and Co-ops", initials: "XM", color: "#c8102e",
    seoTitle: "ExxonMobil Internship: STEM & Business Roles",
    seoDescription: "ExxonMobil's US student postings cover STEM and business internships of about three months and STEM co-ops of about four, at sites from Spring, Texas to Joliet, Illinois.",
    fields: ["engineering", "manufacturing", "business", "finance"],
    firstYear: null, years: [], yearLabel: "Bachelor's or master's students", pay: "Paid", location: "Spring, TX and sites in TX, LA, IL, NJ, NM, ND, WY and KS", mode: "Summer ~3 months; co-ops ~4 months",
    summary: "ExxonMobil's US internships and co-ops for STEM and business students, recruited through pipeline postings that cover many plant, field and headquarters sites.",
    eligibility: [
      "The STEM posting is for students currently pursuing a bachelor's or master's degree in a STEM discipline who show strong academic performance and strong analytical and problem-solving skills.",
      "The Business & Commercial posting is for current undergraduate and graduate students pursuing a bachelor's, master's or MBA in a business-related discipline, from accounting and economics to supply chain management and statistics.",
      "Neither posting states a GPA or class-year minimum.",
    ],
    timing: "ExxonMobil's student postings describe summer internships of about three months, and the STEM posting also covers fall and spring co-ops of about four months. STEM locations include Baton Rouge, Baytown, Beaumont, Joliet, Midland, Spring, Williston and other sites; business internships are mainly at the Spring, Texas headquarters. Pay is set by degree, discipline, skills and experience; for Illinois positions the postings publish annualized ranges of $50,000–$135,000 (STEM) and $40,000–$145,000 (business). The STEM posting says support is provided for those relocating. Neither posting gives an application deadline.",
    status: "Pipeline postings open at review",
    url: "https://jobs.exxonmobil.com/job/Spring-STEM-Students-Seeking-Internship-or-Co-op-Opportunities-TX-77389/1415276000/",
    sources: [
      { name: "STEM Students Seeking Internship or Co-op Opportunities posting: eligibility, terms, locations, pay and relocation", url: "https://jobs.exxonmobil.com/job/Spring-STEM-Students-Seeking-Internship-or-Co-op-Opportunities-TX-77389/1415276000/" },
      { name: "Business & Commercial Students Seeking Internship Opportunities posting: eligibility, disciplines, locations and pay", url: "https://jobs.exxonmobil.com/job/Spring-Business-&-Commercial-Students-Seeking-Internship-Opportunities-TX-77389/1415260100/" },
    ],
    steps: [
      "Choose the STEM or Business & Commercial posting that matches your degree; each is a pipeline posting covering many assignments.",
      "Decide which sites and terms you would genuinely accept — a summer internship, or a fall or spring co-op for STEM students.",
      "Apply through ExxonMobil's careers site with a resume that names your discipline and the technical or business work you can do.",
    ],
    prepare: [
      "Pipeline postings are matched to assignments after you apply, so the resume has to do the routing. For STEM, name the area you fit — process engineering, reservoir work, controls, project management — and one project that proves it; for business, name the function, such as supply chain or commercial analysis, and the tools you used.",
      "Plant and field sites are often far from campus. Before interviews, decide how far you would relocate and for how long, so you can answer location questions clearly and quickly. This is our suggestion, not an ExxonMobil requirement.",
    ],
    pitfall: "These are pipeline postings: one application may be considered for sites from Spring, Texas to Williston, North Dakota. List the locations you would truly accept rather than assuming you will be placed at headquarters.",
    materials: ["STEM or business pipeline posting", "Resume naming your discipline and target area", "Locations and terms you would accept", "One project matched to that area", "Relocation questions for the recruiter"],
    guideSlugs: [G.apply, G.resume, G.offer],
    verified: "2026-10-01",
  },
  {
    id: "verizon-summer-internships-2027", company: "Verizon", title: "Summer 2027 Internships", initials: "VZ", color: "#cd040b",
    seoTitle: "Verizon Internship 2027: Dates & Eligibility",
    seoDescription: "Verizon's 10-week Summer 2027 internships are hybrid and need a December 2027–June 2028 graduation. The Data Science posting closed October 3, 2026; others closed earlier.",
    fields: ["technology", "business", "finance"],
    firstYear: null, years: [], preferredYears: [3], yearLabel: "Dec 2027–Jun 2028 graduation", pay: "Check opening", location: "Irving, TX and other sites by posting", mode: "Hybrid; three office days a week",
    summary: "Verizon's 10-week Summer 2027 internships, posted individually by business, with short application windows that had already closed for several roles by early October.",
    eligibility: [
      "The Network and Technology: Data Science Summer 2027 Internship requires current enrollment in a bachelor's program with a graduation date between December 2027 and June 2028, in good academic standing.",
      "It requires authorization to work in the US without restrictions or need for future sponsorship.",
      "The role is hybrid in Irving, Texas, with work from home and at least three days a week in the office.",
    ],
    timing: "The Data Science posting describes a 10-week internship between June and August 2027 and asked applicants to apply before its end date of October 3, 2026; no time of day is given. Several other Verizon Summer 2027 internship postings found in search had already been removed at review, so windows are short. The posting reviewed does not publish pay.",
    status: "Short posting windows; several closed",
    url: "https://mycareer.verizon.com/jobs/r-1101384/verizon-network-and-technology-data-science-summer-2027-internship/",
    sources: [
      { name: "Network and Technology: Data Science Summer 2027 Internship posting: dates, hybrid rule, eligibility, sponsorship and end date", url: "https://mycareer.verizon.com/jobs/r-1101384/verizon-network-and-technology-data-science-summer-2027-internship/" },
    ],
    steps: [
      "Search Verizon's careers site for Summer 2027 internships and note each posting's end date.",
      "Check the graduation window and work-authorization rule on the posting before applying.",
      "Apply before the posting's end date; for the Data Science internship that was October 3, 2026.",
    ],
    prepare: [
      "For data science, show the whole path from question to decision: the data you pulled, how you cleaned it, the model or analysis you chose and what someone did differently because of it. A smaller project with a clear business answer beats a larger one with only a model score.",
      "Short windows mean the deciding factor is often simply applying in time. Set alerts in late summer and early fall for the business you want, and keep a resume ready to send the week a posting appears. This is our planning advice, not a Verizon rule.",
    ],
    pitfall: "Verizon's Summer 2027 postings closed early: the Data Science posting's end date was October 3, 2026, and several other 2027 postings were already gone at review. Waiting until winter break means missing this cycle.",
    materials: ["Posting end dates you are tracking", "Graduation date in Dec 2027–Jun 2028", "Data project from question to decision", "Work authorization without sponsorship", "Availability for three office days a week"],
    guideSlugs: [G.when, G.apply, G.interview],
    verified: "2026-10-01",
  },
];
