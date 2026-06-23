import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ─── SEO INJECTION ────────────────────────────────────────────────────────────
function injectSEO() {
  if (document.getElementById("fi-seo-done")) return;
  const mark = document.createElement("meta");
  mark.id = "fi-seo-done"; document.head.appendChild(mark);

  const setMeta = (name, content, prop = false) => {
    const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let el = document.querySelector(sel);
    if (!el) { el = document.createElement("meta"); el.setAttribute(prop ? "property" : "name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };

  document.title = "Get Your First Internship by Reaching Out — FirstInternships";
  setMeta("description", "The smart way to land your first internship: reach companies directly instead of applying through job boards. AI writes personalized cold emails to real company recruiting inboxes across dozens of industries — you send them from your own Gmail.");
  setMeta("keywords", "internship, get internship, internship outreach, cold email internship, how to get an internship, internship emails, first internship, internship search, entry level jobs, student internships");
  setMeta("robots", "index, follow");
  setMeta("author", "FirstInternships");
  setMeta("viewport", "width=device-width, initial-scale=1, maximum-scale=5");

  setMeta("og:type", "website", true);
  setMeta("og:title", "Get Your First Internship by Reaching Out — FirstInternships", true);
  setMeta("og:description", "Curated company recruiting inboxes. AI-written cold emails. Send from your Gmail in minutes.", true);
  setMeta("og:url", "https://firstinternships.com", true);
  setMeta("og:site_name", "FirstInternships", true);
  setMeta("og:image", "https://firstinternships.com/og-image.png", true);
  setMeta("og:image:width", "1200", true);
  setMeta("og:image:height", "630", true);

  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", "Get Your First Internship by Reaching Out — FirstInternships");
  setMeta("twitter:description", "Curated company contacts. AI cold emails. Send from Gmail in minutes.");
  setMeta("twitter:image", "https://firstinternships.com/og-image.png");
  setMeta("twitter:site", "@firstinternships");

  let canon = document.querySelector("link[rel='canonical']");
  if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
  canon.href = "https://firstinternships.com";

  const ex = document.getElementById("fi-jsonld");
  if (ex) ex.remove();
  const schema = document.createElement("script");
  schema.id = "fi-jsonld"; schema.type = "application/ld+json";
  schema.text = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://firstinternships.com/#website",
        "url": "https://firstinternships.com",
        "name": "FirstInternships",
        "description": "AI-powered internship outreach platform. Access a curated database of company recruiting inboxes and send personalized cold emails directly from your Gmail.",
        "potentialAction": { "@type": "SearchAction", "target": "https://firstinternships.com/app?search={search_term_string}", "query-input": "required name=search_term_string" }
      },
      {
        "@type": "SoftwareApplication",
        "name": "FirstInternships",
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "offers": [
          { "@type": "Offer", "price": "0", "priceCurrency": "USD", "name": "Free plan" },
          { "@type": "Offer", "price": "20", "priceCurrency": "USD", "name": "Pro plan", "billingPeriod": "P1M" }
        ],
        "description": "Reach companies directly for internships. AI writes personalized cold emails you send from your own Gmail.",
        "url": "https://firstinternships.com"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "How does FirstInternships help me get an internship?", "acceptedAnswer": { "@type": "Answer", "text": "FirstInternships gives you a curated database of company recruiting inboxes across dozens of industries. Our AI writes a personalized cold email for each company based on your background, and sends it directly from your Gmail account." } },
          { "@type": "Question", "name": "Do I need experience to use FirstInternships?", "acceptedAnswer": { "@type": "Answer", "text": "No experience required. Students at every level use FirstInternships — from high school to career changers. You just need a Gmail account and a few sentences about yourself." } },
          { "@type": "Question", "name": "How does pricing work?", "acceptedAnswer": { "@type": "Answer", "text": "You spend credits only to unlock a contact the first time you email them — 1 for a database contact, 2 for an AI-discovered one. After that, writing and follow-ups to that contact are unlimited and free. Free unlocks 5 contacts per day; Pro unlocks 1,000 per month and adds AI firm discovery." } },
          { "@type": "Question", "name": "Is cold email better than applying on job boards?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, for most smaller companies. Many firms never post internships publicly — they hire students who reach out directly. A well-written cold email to the right person gets responses that portal applications never do." } },
          { "@type": "Question", "name": "What industries does FirstInternships cover?", "acceptedAnswer": { "@type": "Answer", "text": "All of them. Tech, marketing, design, finance, law, healthcare, media, nonprofits, startups, and more. Filter by industry, company size, location, and remote availability." } }
        ]
      }
    ]
  });
  document.head.appendChild(schema);
}

// ─── FONT ─────────────────────────────────────────────────────────────────────
(() => {
  if (document.getElementById("fi-font")) return;
  const l = document.createElement("link");
  l.id = "fi-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
  document.head.appendChild(l);
})();

// ─── PLANS ────────────────────────────────────────────────────────────────────
const PLANS = {
  free: {
    id:"free", name:"Free", price:0, dailyUnlocks:5, creditsPerMonth:0,
    features:["Unlock 5 contacts per day","Unlimited AI email writing","Unlimited follow-ups","Resume attach & AI personalization","Target lists & reply tracking","Send from your Gmail"],
    missing:["AI firm discovery","1,000 contacts / month","Credit top-ups"],
  },
  pro: {
    id:"pro", name:"Pro", price:20, creditsPerMonth:1000, dailyUnlocks:0,
    features:["Unlock 1,000 contacts / month","AI firm discovery — find firms beyond our database","Unlimited AI email writing & follow-ups","Resume attach & AI personalization","Target lists, pipeline & reply tracking","Send from your Gmail","Top-ups at $5 / 100 credits"],
    missing:[],
  },
};
// Pricing model: unlocking a contact the FIRST time you email them costs credits.
//   • Existing database contact  → 1 credit  (no discovery cost on our side)
//   • AI-discovered contact      → 2 credits (covers Gemini grounded-search cost)
// After unlocking, writing emails and follow-ups to that contact is unlimited & free.
const UNLOCK_COST   = 1;   // preexisting database email
const DISCOVER_COST = 2;   // newly AI-discovered email (covers discovery cost)
const contactCost = (company) => company?.discovered ? DISCOVER_COST : UNLOCK_COST;

// ─── COMPANY DATABASE ─────────────────────────────────────────────────────────
// ─── FIRM DATABASE ────────────────────────────────────────────────────────────
// This is a representative SAMPLE (80 firms) for the preview. The full
// database (4,816 firms from your CSV) ships in two forms:
//   • firmsData.js   — import { COMPANIES } from "./firmsData" to bundle them all
//   • firms-seed.csv — import into the Supabase `firms` table, then fetch at runtime
// In production, replace this array with the import or a Supabase fetch.
// All emails are role-based recruiting inboxes (careers@/jobs@) — curated business
// data, not personal data.
const COMPANIES = [
  { id:1000, dba:"ZipRecruiter", name:"ZipRecruiter", city:"Santa Monica", state:"CA", industry:"Technology", type:"Job Search Platform", size:null, remote:false, email:"careers@ziprecruiter.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Job Search Platform", quote:"", discovered:false },
  { id:1001, dba:"Recruitics", name:"Recruitics", city:"New York", state:"NY", industry:"Technology", type:"Recruitment Marketing", size:null, remote:false, email:"careers@recruitics.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Recruitment Marketing", quote:"", discovered:false },
  { id:1002, dba:"Teradata", name:"Teradata", city:"San Diego", state:"CA", industry:"Technology", type:"Data Analytics / Cloud", size:null, remote:false, email:"teradata.careers@teradata.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Data Analytics / Cloud", quote:"", discovered:false },
  { id:1003, dba:"Silicon Labs", name:"Silicon Labs", city:"Austin", state:"TX", industry:"Technology", type:"Semiconductors", size:null, remote:false, email:"dl.talentacquisition@silabs.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Semiconductors", quote:"", discovered:false },
  { id:1004, dba:"Carrier", name:"Carrier", city:"Palm Beach Gardens", state:"FL", industry:"Industrial Manufacturing", type:"HVAC/Refrigeration", size:null, remote:false, email:"carrier.recruiting@carrier.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"HVAC/Refrigeration", quote:"", discovered:false },
  { id:1005, dba:"Bentork Industries", name:"Bentork Industries", city:"Kochi", state:"Kerala", industry:"Industrial Manufacturing", type:"Electronics", size:null, remote:false, email:"careers@bentork.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Electronics · India", quote:"", discovered:false },
  { id:1006, dba:"Controlled Environments Company", name:"Controlled Environments Company", city:"Cork", state:"County Cork", industry:"Industrial Manufacturing", type:"Controlled Environments", size:null, remote:false, email:"careers@cec.ie", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Controlled Environments · Ireland", quote:"", discovered:false },
  { id:1007, dba:"MGS Manufacturing", name:"MGS Manufacturing", city:"Germantown", state:"WI", industry:"Industrial Manufacturing", type:"Plastics Manufacturing", size:null, remote:false, email:"careers@mgsmfg.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Plastics Manufacturing", quote:"", discovered:false },
  { id:1008, dba:"PG&E (Pacific Gas and Electric)", name:"PG&E (Pacific Gas and Electric)", city:"San Francisco", state:"CA", industry:"Energy", type:"O&G / Utilities / Energy", size:null, remote:false, email:"careers@pge.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"O&G / Utilities / Energy", quote:"", discovered:false },
  { id:1009, dba:"Phillips 66", name:"Phillips 66", city:"Houston", state:"TX", industry:"Energy", type:"O&G / Utilities / Energy", size:null, remote:false, email:"careers66@p66.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"O&G / Utilities / Energy", quote:"", discovered:false },
  { id:1010, dba:"NRG Energy", name:"NRG Energy", city:"Houston", state:"TX", industry:"Energy", type:"O&G / Utilities / Energy", size:null, remote:false, email:"careers@nrg.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"O&G / Utilities / Energy", quote:"", discovered:false },
  { id:1011, dba:"Ameren", name:"Ameren", city:"St. Louis", state:"MO", industry:"Energy", type:"O&G / Utilities / Energy", size:null, remote:false, email:"careers@ameren.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"O&G / Utilities / Energy", quote:"", discovered:false },
  { id:1012, dba:"Mowi", name:"Mowi", city:"Bergen", state:"Vestland", industry:"Agriculture/AgriTech", type:"Seafood & Farming", size:null, remote:false, email:"careers@mowi.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Seafood & Farming · Norway", quote:"", discovered:false },
  { id:1013, dba:"SalMar", name:"SalMar", city:"Frøya", state:"Trøndelag", industry:"Agriculture/AgriTech", type:"Seafood & Farming", size:null, remote:false, email:"careers@salmar.no", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Seafood & Farming · Norway", quote:"", discovered:false },
  { id:1014, dba:"Grieg Seafood", name:"Grieg Seafood", city:"Bergen", state:"Vestland", industry:"Agriculture/AgriTech", type:"Seafood & Farming", size:null, remote:false, email:"careers@griegseafood.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Seafood & Farming · Norway", quote:"", discovered:false },
  { id:1015, dba:"Lerøy Seafood", name:"Lerøy Seafood", city:"Bergen", state:"Vestland", industry:"Agriculture/AgriTech", type:"Seafood & Farming", size:null, remote:false, email:"careers@leroyseafood.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Seafood & Farming · Norway", quote:"", discovered:false },
  { id:1016, dba:"Convergent Nonprofit Solutions", name:"Convergent Nonprofit Solutions", city:"Carson City", state:"NV", industry:"Nonprofit", type:"Consulting", size:null, remote:false, email:"careers@convergentnonprofit.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Consulting", quote:"", discovered:false },
  { id:1017, dba:"Work Opportunities Unlimited (WOU)", name:"Work Opportunities Unlimited (WOU)", city:"Weymouth", state:"MA", industry:"Nonprofit", type:"Employment Services", size:null, remote:false, email:"careers@workopportunities.net", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Employment Services", quote:"", discovered:false },
  { id:1018, dba:"Smithsonian Institution", name:"Smithsonian Institution", city:"Washington", state:"DC", industry:"Nonprofit", type:"Museum & Research", size:null, remote:false, email:"associatescareers@si.edu", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Museum & Research", quote:"", discovered:false },
  { id:1019, dba:"Monterey Bay Aquarium (Seafood Watch)", name:"Monterey Bay Aquarium (Seafood Watch)", city:"Monterey", state:"CA", industry:"Nonprofit", type:"Seafood Sustainability", size:null, remote:false, email:"careers@mbayaq.org", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Seafood Sustainability", quote:"", discovered:false },
  { id:1020, dba:"Cramo", name:"Cramo", city:"Vantaa", state:"Uusimaa", industry:"Construction", type:"Equipment Rental", size:null, remote:false, email:"careers@cramo.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Equipment Rental · Finland", quote:"", discovered:false },
  { id:1021, dba:"YIT", name:"YIT", city:"Helsinki", state:"Uusimaa", industry:"Construction", type:"Construction", size:null, remote:false, email:"careers@yit.fi", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Construction · Finland", quote:"", discovered:false },
  { id:1022, dba:"Enshaat", name:"Enshaat", city:"Kuwait City", state:"Al Asimah", industry:"Construction", type:"Construction", size:null, remote:false, email:"careers@enshaat.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Construction · Kuwait", quote:"", discovered:false },
  { id:1023, dba:"Grandeur Housing", name:"Grandeur Housing", city:"Winkler", state:"MB", industry:"Construction", type:"Homebuilding", size:null, remote:false, email:"careers@grandeurhousing.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Homebuilding · Canada", quote:"", discovered:false },
  { id:1024, dba:"KK Women's and Children's Hospital", name:"KK Women's and Children's Hospital", city:"Singapore", state:"Singapore", industry:"Healthcare", type:"Hospital", size:null, remote:false, email:"careers.medical@kkh.com.sg", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Hospital · Singapore", quote:"", discovered:false },
  { id:1025, dba:"Changi General Hospital", name:"Changi General Hospital", city:"Singapore", state:"Singapore", industry:"Healthcare", type:"Hospital", size:null, remote:false, email:"careers.medical@cgh.com.sg", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Hospital · Singapore", quote:"", discovered:false },
  { id:1026, dba:"Alberta Health Services (AHS)", name:"Alberta Health Services (AHS)", city:"Edmonton", state:"AB", industry:"Healthcare", type:"Healthcare System", size:null, remote:false, email:"youth.careers@ahs.ca", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Healthcare System · Canada", quote:"", discovered:false },
  { id:1027, dba:"Outram Community Hospital", name:"Outram Community Hospital", city:"Singapore", state:"Singapore", industry:"Healthcare", type:"Hospital", size:null, remote:false, email:"careers.medical@och.sg", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Hospital · Singapore", quote:"", discovered:false },
  { id:1028, dba:"Office for People With Developmental Disabilities (OPWDD)", name:"Office for People With Developmental Disabilities (OPWDD)", city:"Albany", state:"NY", industry:"Government", type:"State Government", size:null, remote:false, email:"capitaldistrict.careers@opwdd.ny.gov", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"State Government", quote:"", discovered:false },
  { id:1029, dba:"Ada County", name:"Ada County", city:"Boise", state:"ID", industry:"Government", type:"County Government", size:null, remote:false, email:"acsojobs@adacounty.id.gov", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"County Government", quote:"", discovered:false },
  { id:1030, dba:"Texas Department of Information Resources", name:"Texas Department of Information Resources", city:"Austin", state:"TX", industry:"Government", type:"Government Agency", size:null, remote:false, email:"careers@dir.texas.gov", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Government Agency", quote:"", discovered:false },
  { id:1031, dba:"NCTCOG", name:"NCTCOG", city:"Arlington", state:"TX", industry:"Government", type:"Regional Planning", size:null, remote:false, email:"careers@nctcog.org", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Regional Planning", quote:"", discovered:false },
  { id:1032, dba:"Bank of America", name:"Bank of America", city:"Charlotte", state:"NC", industry:"Financial Services/Banking", type:"Banking", size:null, remote:false, email:"hr.recruiting@bofa.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Banking", quote:"", discovered:false },
  { id:1033, dba:"Mastercard (EMEA)", name:"Mastercard (EMEA)", city:"Waterloo", state:"Belgium", industry:"Financial Services/Banking", type:"Payment Processing", size:null, remote:false, email:"belgium.careers@mastercard.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Payment Processing · Belgium", quote:"", discovered:false },
  { id:1034, dba:"HSBC", name:"HSBC", city:"London", state:"England", industry:"Financial Services/Banking", type:"Banking", size:null, remote:false, email:"hdpi.careers@hsbc.co.in", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Banking · UK", quote:"", discovered:false },
  { id:1035, dba:"D. E. Shaw India", name:"D. E. Shaw India", city:"Hyderabad", state:"Telangana", industry:"Financial Services/Banking", type:"Investment", size:null, remote:false, email:"recruiting.india@deshaw.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Investment · India", quote:"", discovered:false },
  { id:1036, dba:"Alimentation Couche-Tard (Circle K)", name:"Alimentation Couche-Tard (Circle K)", city:"Laval", state:"QC", industry:"Retail/E-Commerce", type:"Convenience Store", size:null, remote:false, email:"careers@circlekeurope.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Convenience Store · Canada", quote:"", discovered:false },
  { id:1037, dba:"7-Eleven", name:"7-Eleven", city:"Irving", state:"TX", industry:"Retail/E-Commerce", type:"Convenience Store", size:null, remote:false, email:"careers@7-eleven.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Convenience Store", quote:"", discovered:false },
  { id:1038, dba:"Sainsbury's", name:"Sainsbury's", city:"London", state:"England", industry:"Retail/E-Commerce", type:"Grocery / Retail", size:null, remote:false, email:"careers@sainsburys.co.uk", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Grocery / Retail · UK", quote:"", discovered:false },
  { id:1039, dba:"Lidl", name:"Lidl", city:"Arlington", state:"VA", industry:"Retail/E-Commerce", type:"Grocery / Retail", size:null, remote:false, email:"careers@lidl.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Grocery / Retail", quote:"", discovered:false },
  { id:1040, dba:"HCA Healthcare", name:"HCA Healthcare", city:"Nashville", state:"TN", industry:"Healthcare/BioTech/Pharma", type:"Hospital Systems", size:null, remote:false, email:"hcajobapplication@hcacareers.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Hospital Systems", quote:"", discovered:false },
  { id:1041, dba:"Walgreens Boots Alliance", name:"Walgreens Boots Alliance", city:"Deerfield", state:"IL", industry:"Healthcare/BioTech/Pharma", type:"Pharmacy / Healthcare Services", size:null, remote:false, email:"corporate.careers@walgreens.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Pharmacy / Healthcare Services", quote:"", discovered:false },
  { id:1042, dba:"Alcon", name:"Alcon", city:"Geneva", state:"Geneva", industry:"Healthcare/BioTech/Pharma", type:"Medical Devices", size:null, remote:false, email:"careers.eu@alcon.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Medical Devices · Switzerland", quote:"", discovered:false },
  { id:1043, dba:"AbbVie Inc.", name:"AbbVie Inc.", city:"North Chicago", state:"IL", industry:"Healthcare/BioTech/Pharma", type:"Pharmaceuticals / Immunology", size:null, remote:false, email:"talentacquisition.de@abbvie.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Pharmaceuticals / Immunology", quote:"", discovered:false },
  { id:1044, dba:"TUI Group", name:"TUI Group", city:"Birkenhead", state:"England", industry:"Travel/Hospitality", type:"Travel & Retail", size:null, remote:false, email:"csretail.careers@tui.co.uk", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Travel & Retail · UK", quote:"", discovered:false },
  { id:1045, dba:"Fairmont Hotels & Resorts", name:"Fairmont Hotels & Resorts", city:"Toronto", state:"ON", industry:"Travel/Hospitality", type:"Luxury Hotel & Resort", size:null, remote:false, email:"ryh.careers@fairmont.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Luxury Hotel & Resort · Canada", quote:"", discovered:false },
  { id:1046, dba:"Flight Centre Travel Group", name:"Flight Centre Travel Group", city:"Philadelphia", state:"PA", industry:"Travel/Hospitality", type:"Travel Agency", size:null, remote:false, email:"careers@us.flightcentre.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Travel Agency", quote:"", discovered:false },
  { id:1047, dba:"IHG (InterContinental Hotels Group)", name:"IHG (InterContinental Hotels Group)", city:"Atlanta", state:"GA", industry:"Travel/Hospitality", type:"Hotels", size:null, remote:false, email:"talentacquisition@ihg.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Hotels", quote:"", discovered:false },
  { id:1048, dba:"Armada Retail Company", name:"Armada Retail Company", city:"Kuwait City", state:"Kuwait", industry:"Retail", type:"Retail", size:null, remote:false, email:"careers@armadagroupco.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Retail · HR Team", quote:"", discovered:false },
  { id:1049, dba:"Ace Hardware", name:"Ace Hardware", city:"Oak Brook", state:"IL", industry:"Retail", type:"Hardware Retail", size:null, remote:false, email:"careers@acehardware.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Hardware Retail", quote:"", discovered:false },
  { id:1050, dba:"Primark", name:"Primark", city:"Dublin", state:"Leinster", industry:"Retail", type:"Apparel Retail", size:null, remote:false, email:"usacareers@primark.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Apparel Retail · Ireland", quote:"", discovered:false },
  { id:1051, dba:"Lincraft", name:"Lincraft", city:"Melbourne", state:"VIC", industry:"Retail", type:"Fabric & Craft Retail", size:null, remote:false, email:"careers@lincraft.com.au", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Fabric & Craft Retail · Australia", quote:"", discovered:false },
  { id:1052, dba:"Union Pacific", name:"Union Pacific", city:"Omaha", state:"NE", industry:"Transportation/Logistics", type:"Railroad", size:null, remote:false, email:"up.jobs@up.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Railroad", quote:"", discovered:false },
  { id:1053, dba:"Enterprise Fleet Management", name:"Enterprise Fleet Management", city:"St. Louis", state:"MO", industry:"Transportation/Logistics", type:"Fleet Management", size:null, remote:false, email:"careers@enterprisefleet.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Fleet Management", quote:"", discovered:false },
  { id:1054, dba:"CSTK Inc.", name:"CSTK Inc.", city:"USA", state:"USA", industry:"Transportation/Logistics", type:"Transportation", size:null, remote:false, email:"careers@cstk.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Transportation · HR Team", quote:"", discovered:false },
  { id:1055, dba:"Ryder System Inc.", name:"Ryder System Inc.", city:"Florida", state:"FL", industry:"Transportation/Logistics", type:"Logistics", size:null, remote:false, email:"careers@ryder.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Logistics", quote:"", discovered:false },
  { id:1056, dba:"Kreditech", name:"Kreditech", city:"Hamburg", state:"Hamburg", industry:"FinTech", type:"Digital Lending", size:null, remote:false, email:"jobs.romania@kreditech.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Digital Lending · Germany", quote:"", discovered:false },
  { id:1057, dba:"Square", name:"Square", city:"San Francisco", state:"CA", industry:"FinTech", type:"Payments", size:null, remote:false, email:"careers@square.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Payments", quote:"", discovered:false },
  { id:1058, dba:"Affirm", name:"Affirm", city:"San Francisco", state:"CA", industry:"FinTech", type:"Buy Now Pay Later", size:null, remote:false, email:"careers@affirm.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Buy Now Pay Later", quote:"", discovered:false },
  { id:1059, dba:"Klarna", name:"Klarna", city:"Stockholm", state:"Stockholm", industry:"FinTech", type:"Buy Now Pay Later", size:null, remote:false, email:"careers@klarna.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Buy Now Pay Later · Sweden", quote:"", discovered:false },
  { id:1060, dba:"Cargotec", name:"Cargotec", city:"Helsinki", state:"Uusimaa", industry:"Logistics", type:"Logistics & Material Handling", size:null, remote:false, email:"careers@cargotec.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Logistics & Material Handling · Finland", quote:"", discovered:false },
  { id:1061, dba:"Post Office Limited", name:"Post Office Limited", city:"London", state:"England", industry:"Logistics", type:"Postal Services", size:null, remote:false, email:"talentacquisition@postoffice.co.uk", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Postal Services · UK", quote:"", discovered:false },
  { id:1062, dba:"Boyd Bros. Transportation", name:"Boyd Bros. Transportation", city:"Clayton", state:"AL", industry:"Logistics", type:"Logistics & Freight", size:null, remote:false, email:"careers@boydtransportation.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Logistics & Freight", quote:"", discovered:false },
  { id:1063, dba:"Anderson Trucking Service", name:"Anderson Trucking Service", city:"St. Cloud", state:"MN", industry:"Logistics", type:"Logistics & Freight", size:null, remote:false, email:"careers@atsinc.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Logistics & Freight", quote:"", discovered:false },
  { id:1064, dba:"USI", name:"USI", city:"Evansville", state:"IN", industry:"Education", type:"Higher Education", size:null, remote:false, email:"careers.usi@usi.edu", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Higher Education", quote:"", discovered:false },
  { id:1065, dba:"Metropolia University of Applied Sciences", name:"Metropolia University of Applied Sciences", city:"Helsinki", state:"Uusimaa", industry:"Education", type:"Higher Education", size:null, remote:false, email:"careers@metropolia.fi", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Higher Education · Finland", quote:"", discovered:false },
  { id:1066, dba:"Turku University of Applied Sciences", name:"Turku University of Applied Sciences", city:"Turku", state:"Southwest Finland", industry:"Education", type:"Higher Education", size:null, remote:false, email:"careers@turkuamk.fi", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Higher Education · Finland", quote:"", discovered:false },
  { id:1067, dba:"Tampere University", name:"Tampere University", city:"Tampere", state:"Pirkanmaa", industry:"Education", type:"Higher Education", size:null, remote:false, email:"careers@tuni.fi", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Higher Education · Finland", quote:"", discovered:false },
  { id:1068, dba:"Valspar (Sherwin-Williams)", name:"Valspar (Sherwin-Williams)", city:"Minneapolis", state:"MN", industry:"Chemicals & Materials", type:"Paints / Coatings", size:null, remote:false, email:"careers@valspar.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Paints / Coatings", quote:"", discovered:false },
  { id:1069, dba:"Sherwin-Williams", name:"Sherwin-Williams", city:"Cleveland", state:"OH", industry:"Chemicals & Materials", type:"Paints / Coatings", size:null, remote:false, email:"jobs@sherwin.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Paints / Coatings", quote:"", discovered:false },
  { id:1070, dba:"Jotun", name:"Jotun", city:"Sandefjord", state:"Vestfold", industry:"Chemicals & Materials", type:"Paints & Coatings", size:null, remote:false, email:"careers@jotun.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Paints & Coatings · Norway", quote:"", discovered:false },
  { id:1071, dba:"Borregaard", name:"Borregaard", city:"Sarpsborg", state:"Viken", industry:"Chemicals & Materials", type:"Biochemicals", size:null, remote:false, email:"careers@borregaard.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Biochemicals · Norway", quote:"", discovered:false },
  { id:1072, dba:"Joby Aviation", name:"Joby Aviation", city:"Santa Cruz", state:"CA", industry:"Satellite/Space/Defense", type:"eVTOL / Advanced Air Mobility", size:null, remote:false, email:"careers@jobyaviation.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"eVTOL / Advanced Air Mobility", quote:"", discovered:false },
  { id:1073, dba:"Accenture Federal Services", name:"Accenture Federal Services", city:"Arlington", state:"VA", industry:"Satellite/Space/Defense", type:"Defense IT Consulting", size:null, remote:false, email:"afs.careers@accenturefederal.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Defense IT Consulting", quote:"", discovered:false },
  { id:1074, dba:"General Dynamics Information Technology", name:"General Dynamics Information Technology", city:"Fairfax", state:"VA", industry:"Satellite/Space/Defense", type:"Defense IT", size:null, remote:false, email:"military.recruiting@gdit.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Defense IT", quote:"", discovered:false },
  { id:1075, dba:"General Dynamics (Land Systems)", name:"General Dynamics (Land Systems)", city:"Sterling Heights", state:"MI", industry:"Satellite/Space/Defense", type:"Defense / Land Systems", size:null, remote:false, email:"military.recruiting@gdls.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Defense / Land Systems", quote:"", discovered:false },
  { id:1076, dba:"Talenti", name:"Talenti", city:"Princeton", state:"NJ", industry:"CPG (Food)", type:"Ice Cream", size:null, remote:false, email:"careers@talenti.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Ice Cream", quote:"", discovered:false },
  { id:1077, dba:"Raisio Group", name:"Raisio Group", city:"Raisio", state:"Southwest Finland", industry:"CPG (Food)", type:"Food Manufacturing", size:null, remote:false, email:"careers@raisiogroup.com", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Food Manufacturing · Finland", quote:"", discovered:false },
  { id:1078, dba:"Valio", name:"Valio", city:"Helsinki", state:"Uusimaa", industry:"CPG (Food)", type:"Food Manufacturing", size:null, remote:false, email:"careers@valio.fi", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Food Manufacturing · Finland", quote:"", discovered:false },
  { id:1079, dba:"Atria", name:"Atria", city:"Seinäjoki", state:"South Ostrobothnia", industry:"CPG (Food)", type:"Food Manufacturing", size:null, remote:false, email:"careers@atria.fi", cname:"", ctitle:"", email2:"", emailConfidence:null, verified:true, intern:true, ugrad:true, compPaid:true, knownFor:"Food Manufacturing · Finland", quote:"", discovered:false },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const SK = { user:"fi_u", sent:"fi_s", credits:"fi_cr", plan:"fi_pl", profile:"fi_pr", cycle:"fi_cy", search:"fi_sc", daily:"fi_dy", resume:"fi_rz", lists:"fi_ls", listOf:"fi_lo", track:"fi_tk" };

// Default target lists seeded on first use (job searches organize around these).
const DEFAULT_LISTS = [
  { id:"dream",     name:"Dream",     color:"#7c3aed" },
  { id:"reach",     name:"Reach",     color:"#1a56db" },
  { id:"realistic", name:"Realistic", color:"#15803d" },
];

// Pipeline statuses for reply/outcome tracking.
const STATUSES = [
  { id:"contacted", label:"Contacted", color:"#64748b" },
  { id:"replied",   label:"Replied",   color:"#1a56db" },
  { id:"interview", label:"Interview", color:"#b45309" },
  { id:"offer",     label:"Offer",     color:"#15803d" },
  { id:"closed",    label:"No / Closed", color:"#9ca3af" },
];
const STATUS = Object.fromEntries(STATUSES.map(s=>[s.id,s]));
const FOLLOWUP_DAYS = 5;   // default "nudge me to follow up" window
const DISCOVERY_CAP = 200; // Pro AI-discovery searches per billing month (margin guardrail)

// ─── DELIVERABILITY GUARDRAILS ────────────────────────────────────────────────
// Cold email from a personal inbox gets the SENDER spam-flagged if they ramp too
// fast or send too much in a day. These caps protect the user's own Gmail.
// Warm-up: as the account ages (days since first send), the safe daily cap rises.
const WARMUP = {
  gmail:     [{ d:0, n:10 }, { d:7, n:20 }, { d:14, n:35 }, { d:21, n:50 }],   // personal @gmail.com
  workspace: [{ d:0, n:25 }, { d:7, n:50 }, { d:14, n:75 }, { d:21, n:120 }],  // Google Workspace
};
const BOUNCE_PAUSE = 0.08;     // auto-pause sending if bounce rate exceeds 8%
const BOUNCE_MIN_SAMPLE = 20;  // ...but only once there's enough sent volume to judge

// Today's safe send cap for an account, given its type and first-send date.
function dailySendLimit(accountType, firstSendAt) {
  const sched = WARMUP[accountType] || WARMUP.gmail;
  const days = firstSendAt ? Math.floor((Date.now() - firstSendAt) / 864e5) : 0;
  let n = sched[0].n;
  for (const s of sched) { if (days >= s.d) n = s.n; }
  return n;
}
// Scan a draft for patterns that trip spam filters on cold email.
function deliverabilityCheck(subject, body) {
  const w = []; const s = (subject || ""); const b = (body || "");
  const links = (b.match(/https?:\/\//g) || []).length;
  if (links > 2) w.push("Several links — cold emails with many links often hit spam. Keep it to 0–1.");
  if (/\b[A-Z]{6,}\b/.test(s + " " + b)) w.push("ALL-CAPS words read as spam. Use normal sentence case.");
  if ((b.match(/!/g) || []).length > 2) w.push("Several exclamation points look promotional.");
  if (/(free money|guaranteed?|act now|limited time|click here|buy now|risk-free|cash bonus|100% off|earn \$)/i.test(b))
    w.push("Contains spam-trigger phrases — reword to sound personal.");
  if (b.length > 1600) w.push("Long email — short, personal notes get more replies and fewer spam flags.");
  if (b.replace(/\s/g, "").length < 140) w.push("Very short — add a specific, personal reason you're reaching out.");
  if (!/\?/.test(b)) w.push("No question/ask — cold emails convert better when they end with one clear ask.");
  return w;
}

// Lightweight analytics. PRODUCTION: forward each event to PostHog / GA / Segment
// (e.g. window.posthog?.capture(event, props)). Here we keep a rolling local log
// so the funnel is inspectable in dev and the call sites are already in place.
function track(event, props = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.__fiAnalytics === "function") window.__fiAnalytics(event, props);
    const log = JSON.parse(localStorage.getItem("fi_events") || "[]");
    log.push({ event, props, t: Date.now() });
    localStorage.setItem("fi_events", JSON.stringify(log.slice(-300)));
  } catch {}
}

// Relative time for the pipeline / dashboard.
function fmtAgo(ts){
  if(!ts) return "recently";
  const d=Math.floor((Date.now()-ts)/864e5);
  if(d<=0) return "today";
  if(d===1) return "yesterday";
  if(d<7) return d+" days ago";
  return Math.floor(d/7)+"w ago";
}
const db = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k)    => { try { localStorage.removeItem(k); } catch {} },
};

// Session storage — for sensitive tokens that must NOT persist across browser sessions.
// TODO (production): replace this with an httpOnly cookie set server-side after OAuth.
// httpOnly cookies cannot be set from client JS. Wire a /auth/callback route that does:
//   res.cookie("fi_gt", token, { httpOnly:true, secure:true, sameSite:"Strict" });
const ss = {
  get: (k)    => { try { return sessionStorage.getItem(k); }  catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); }     catch {} },
  del: (k)    => { try { sessionStorage.removeItem(k); }      catch {} },
};
const GT_KEY = "fi_gt"; // gmail token — session only, never localStorage

// Strip gmailToken before writing profile/user objects to localStorage
function stripToken(obj) {
  if (!obj) return obj;
  const { gmailToken: _drop, ...rest } = obj;
  return rest;
}

// Free plan refills to a small daily allowance (non-accumulating); Pro refills
// monthly and accumulates top-ups.
function initCredits(planId) {
  const plan = PLANS[planId] || PLANS.free;
  if (planId !== "pro") {
    const today = new Date().toISOString().slice(0, 10);
    if (db.get(SK.daily, "") !== today) {
      db.set(SK.daily, today); db.set(SK.credits, plan.dailyUnlocks);
      return plan.dailyUnlocks;
    }
    const s = db.get(SK.credits, null);
    return s !== null ? s : plan.dailyUnlocks;
  }
  const cycle = new Date().toISOString().slice(0, 7);
  if (db.get(SK.cycle, "") !== cycle) {
    db.set(SK.credits, plan.creditsPerMonth); db.set(SK.cycle, cycle);
    return plan.creditsPerMonth;
  }
  const stored = db.get(SK.credits, null);
  return stored !== null ? stored : plan.creditsPerMonth;
}

// ─── FIT SCORE ────────────────────────────────────────────────────────────────
// Honest interest match. Scores ONLY on real data: how well the company's
// industry/type aligns with the student's stated interests, major, and background.
// We deliberately do NOT factor in intern program, remote, comp, or company size,
// because the source data doesn't contain those — inventing them would mislead.
// Returns null when there's nothing real to match on (the UI shows "—").
function calcFit(company, profile) {
  if (!profile) return null;
  const studentText = `${profile.interest||""} ${profile.major||""} ${profile.experience||""}`.toLowerCase();
  if (studentText.replace(/[^a-z]/g,"").length < 3) return null;
  const companyText = `${company.industry||""} ${company.type||""} ${company.knownFor||""}`.toLowerCase();

  let s = 50;
  // 1. Direct word overlap between the student's interests and the company's industry/type.
  const stop = new Set(["the","and","for","with","that","this","into","interested","looking","experience","background","student","studying","study","work","working","want","really","just","like","love"]);
  const words = [...new Set(studentText.split(/[^a-z]+/).filter(w => w.length >= 4 && !stop.has(w)))];
  let overlap = 0;
  words.forEach(w => { if (companyText.includes(w)) overlap++; });
  s += Math.min(34, overlap * 12);

  // 2. Interest-family matching (maps common student phrasings to industry groups).
  const fam = [
    { kw:["software","developer","coding","programming","computer"], ind:["tech","software","saas","ai","fintech","edtech"] },
    { kw:["data","machine learning","analytics"," ai "], ind:["tech","software","ai","data","fintech"] },
    { kw:["finance","investment","banking","fintech","trading","accounting"], ind:["fintech","financ","bank","insurance","invest"] },
    { kw:["marketing","advertising","brand","social media","growth"], ind:["marketing","advertis","media","retail","cpg","consumer"] },
    { kw:["writing","journalism","editorial","content","communication"], ind:["media","editorial","publish","news","communication"] },
    { kw:["design","creative","graphic"," ux"," ui"], ind:["design","creative","media","apparel","retail"] },
    { kw:["consulting","strategy","operations","business","management"], ind:["consult","professional","logistics","manufactur"] },
    { kw:["nonprofit","policy","government","advocacy","law","legal"], ind:["nonprofit","government","legal","education","public"] },
    { kw:["logistics","supply chain","transportation"], ind:["logistic","transport","freight","supply"] },
    { kw:["retail","fashion","apparel","ecommerce"], ind:["retail","apparel","consumer","cpg","commerce"] },
    { kw:["engineering","manufacturing","mechanical","industrial","chemical"], ind:["manufactur","industrial","chemical","materials","energy","construction"] },
    { kw:["health","biology","pharma","medical","biotech"], ind:["health","bio","pharma","medical"] },
  ];
  fam.forEach(f => {
    if (f.kw.some(k => studentText.includes(k)) && f.ind.some(i => companyText.includes(i))) s += 9;
  });

  return Math.min(98, Math.max(40, Math.round(s)));
}

// ─── CAN-SPAM COMPLIANCE FOOTER ───────────────────────────────────────────────
// CAN-SPAM footer for BULK sends. A single 1:1 job email is transactional and
// gets no footer; but once a student fires off many emails at once, a clean
// unsubscribe line protects deliverability (ISPs treat volume as bulk mail).
// PRODUCTION: the sending backend replaces {{UNSUBSCRIBE_URL}} with a unique
// per-recipient opt-out link backed by a suppression list.
function buildComplianceFooter(profile) {
  const who = (profile.name || "").trim();
  if (!who) return "";
  return `\n\n—\n${who}\n\nTo stop receiving these emails, reply with "unsubscribe": {{UNSUBSCRIBE_URL}}`;
}

// ─── EMAIL DRAFT ──────────────────────────────────────────────────────────────
// DEV stand-in for AI email writing. PRODUCTION: replace with a call to
// /api/generate-email, which uses a Gemini model (see api-generate-email.js).
// Writing is unlimited and free for users — the credit is charged on unlock, not
// per draft — so users can regenerate freely.
// opts.commercial appends the CAN-SPAM footer (used for bulk sends). A single
// 1:1 job email omits it, preserving a genuine personal tone.
function buildDraft(company, profile, level, opts = {}) {
  const name = (profile.name || "Jay").trim();
  const rawEdu = profile.eduLevel || profile.year || "student";
  const yr = rawEdu.toLowerCase()
    .replace("bachelor's student — ", "")
    .replace("bachelor's graduate", "recent graduate")
    .replace("master's student", "master's student")
    .replace("master's graduate", "recent master's graduate")
    .replace("military / veteran", "veteran")
    .replace("career changer", "career changer looking to transition");
  const maj  = profile.major || "my field";
  const sch  = profile.school || "university";
  const exp  = (profile.experience || "I have been building skills through coursework, personal projects, and hands-on work that I'm excited to bring to a professional setting.").trim();
  const ref1 = company.knownFor ? company.knownFor.split(".")[0] : `${company.dba}'s work in ${company.industry}`;
  const ref2 = company.quote ? `I keep coming back to the idea that "${company.quote.substring(0, 70)}${company.quote.length > 70 ? "…" : ""}" — it reflects exactly the kind of work I want to be part of.` : "";

  const d = {
    1: `My name is ${name}, and I'm a ${yr} studying ${maj} at ${sch}.\n\nI'm looking for an internship and wanted to reach out to ${company.dba} directly. I'd be glad to contribute wherever I'd be most useful.\n\nHappy to send a resume if that would help.\n\n${name}`,

    2: `My name is ${name}, and I'm a ${yr} in ${maj} at ${sch}.\n\n${exp}\n\nI'm interested in ${company.dba}'s work in ${company.industry.split("/")[0].trim().toLowerCase()} and would love to explore an internship opportunity. I'd work hard to be genuinely useful from day one.\n\nLet me know if a resume would help.\n\n${name}`,

    3: `My name is ${name}, and I'm a ${yr} in ${maj} at ${sch}.\n\n${exp} ${ref1} is what drew me to reach out to ${company.dba} specifically.\n\nI'd love to intern this summer on whatever is most useful — research, support, or execution work. Happy to send a resume.\n\n${name}`,

    4: `My name is ${name}, and I'm a ${yr} in ${maj} at ${sch}.\n\n${exp} The reason I'm reaching out to ${company.dba} directly is that ${ref1.toLowerCase()}. The kind of work happening there isn't something you find everywhere.\n\n${ref2 || `I'd love the chance to contribute, even in a small way, to what ${company.dba} is building.`}\n\n${name}`,

    5: `My name is ${name}, and I'm a ${yr} in ${maj} at ${sch}.\n\n${exp} When I think about where I want to spend my time this summer, ${company.dba} is the answer. ${ref1}. ${ref2}\n\nI would show up early, stay late, and do whatever work is most useful — without needing to be managed closely. If there's any room, I'd be genuinely grateful for the chance.\n\n${name}`,
  };
  const body = d[level] || d[3];
  // If a resume is attached, swap the "happy to send a resume" line for a
  // statement that it's attached (real attach happens in the Gmail send payload).
  let out = body;
  if (opts.resume) {
    out = out
      .replace(/\n\nHappy to send a resume if that would help\./, "\n\nI've attached my resume with more detail.")
      .replace(/\n\nLet me know if a resume would help\./, "\n\nMy resume is attached.")
      .replace(/ Happy to send a resume\./, " My resume is attached.");
    if (out === body) out = body.replace(/\n\n([^\n]+)$/, "\n\nMy resume is attached for more detail.\n\n$1");
  }
  const isCommercial = opts.commercial;
  return isCommercial ? out + buildComplianceFooter(profile) : out;
}


// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const K = {
  ink:"#0c0c0e", ink2:"#3c3c40", ink3:"#6b6b72", ink4:"#adadb8",
  b:"#e4e4ec", bs:"#f2f2f8", surf:"#f7f7fb", surf2:"#f0f0f6",
  grn:"#15803d", grnT:"#f0fdf4", grnB:"#bbf7d0",
  red:"#dc2626", redT:"#fef2f2", redB:"#fecaca",
  amb:"#b45309", ambT:"#fffbeb", ambB:"#fde68a",
  bl:"#1a56db",  blT:"#eef3ff",  blB:"#bfcffd",
};

const fitC  = s => s>=90?K.grn:s>=76?K.bl:s>=63?K.amb:K.ink4;
const fitBg = s => s>=90?K.grnT:s>=76?K.blT:s>=63?K.ambT:K.surf2;
const fitBd = s => s>=90?K.grnB:s>=76?K.blB:s>=63?K.ambB:K.b;
const fitLb = s => s>=90?"Excellent":s>=76?"Strong":s>=63?"Good":"Fair";

const G = (v = "dark", x = {}) => {
  const base = {
    fontFamily:"inherit", fontWeight:600, fontSize:13, border:"none", borderRadius:7,
    cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center",
    gap:5, padding:"8px 16px", textDecoration:"none", whiteSpace:"nowrap",
    lineHeight:1.4, transition:"transform .13s cubic-bezier(.34,1.45,.5,1), box-shadow .2s ease, background .18s ease, border-color .15s ease, color .15s ease, filter .15s ease", outline:"none", boxSizing:"border-box", ...x,
  };
  if (v==="dark")  return { ...base, background:K.ink,  color:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,.18)" };
  if (v==="ghost") return { ...base, background:"transparent", color:K.ink2, border:`1px solid ${K.b}` };
  if (v==="green") return { ...base, background:K.grnT, color:K.grn, border:`1px solid ${K.grnB}` };
  if (v==="red")   return { ...base, background:K.red,  color:"#fff" };
  if (v==="amber") return { ...base, background:K.ambT, color:K.amb, border:`1px solid ${K.ambB}` };
  return base;
};

const F = (x = {}) => ({
  fontFamily:"inherit", fontSize:13, color:K.ink, background:"#fff",
  border:`1px solid ${K.b}`, borderRadius:7, padding:"9px 12px",
  outline:"none", width:"100%", boxSizing:"border-box",
  lineHeight:1.5, transition:"border-color .12s, box-shadow .12s", ...x,
});

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
  body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#f7f7fb;color:#0c0c0e;-webkit-font-smoothing:antialiased;min-height:100vh;line-height:1.5;overflow-x:hidden}
  button{font-family:inherit;-webkit-tap-highlight-color:transparent}
  button:not(:disabled){will-change:transform}
  button:not(:disabled):hover{filter:brightness(.93)}
  button:not(:disabled):active{transform:translateY(2px) scale(.96);transition-duration:.05s}
  button:disabled{opacity:.36;cursor:not-allowed;pointer-events:none}
  /* primary dark buttons lift on hover for extra tactility */
  .btn-lift:not(:disabled):hover{transform:translateY(-1.5px);box-shadow:0 6px 18px rgba(0,0,0,.22) !important;filter:none}
  .btn-lift:not(:disabled):active{transform:translateY(1px) scale(.97)}
  input,select,textarea{font-family:inherit;-webkit-appearance:none;appearance:none}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#1a56db !important;box-shadow:0 0 0 3px rgba(26,86,219,.1)}
  input:hover:not(:focus),select:hover:not(:focus),textarea:hover:not(:focus){border-color:#9494a8}
  ::placeholder{color:#c0c0cc}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-thumb{background:#d0d0da;border-radius:3px}
  ::-webkit-scrollbar-track{background:transparent}

  .lbl{font-size:11px;font-weight:600;color:#6b6b72;letter-spacing:.04em;text-transform:uppercase;display:block;margin-bottom:5px}
  .chip{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;border:1px solid;white-space:nowrap;line-height:1.65}
  .pill{padding:5px 13px;border-radius:100px;border:1px solid #e4e4ec;background:#fff;font-size:12px;font-weight:500;cursor:pointer;color:#6b6b72;font-family:inherit;transition:transform .14s cubic-bezier(.34,1.45,.5,1),border-color .15s,color .15s,background .15s,filter .15s;white-space:nowrap;-webkit-tap-highlight-color:transparent}
  .pill:hover{border-color:#9494a8;color:#3c3c40;transform:translateY(-1px)}
  .pill:active{transform:translateY(1px) scale(.95);transition-duration:.05s}
  .pill.on{background:#0c0c0e;border-color:#0c0c0e;color:#fff}
  .pill.on:hover{filter:brightness(1.3);transform:translateY(-1px)}

  .cb{width:16px;height:16px;min-width:16px;border-radius:3px;border:1.5px solid #c4c4d0;-webkit-appearance:none;appearance:none;cursor:pointer;background:#fff;position:relative;transition:all .12s cubic-bezier(.34,1.45,.5,1);margin:0;padding:0}
  .cb:hover{border-color:#0c0c0e}
  .cb:checked{background:#0c0c0e;border-color:#0c0c0e;animation:cbPop .24s cubic-bezier(.34,1.56,.64,1)}
  .cb:checked::after{content:'';position:absolute;left:4px;top:2px;width:5px;height:8px;border-right:2.5px solid #fff;border-bottom:2.5px solid #fff;transform:rotate(40deg)}
  .cb:indeterminate{background:#0c0c0e;border-color:#0c0c0e}
  .cb:indeterminate::after{content:'';position:absolute;left:3px;top:6.5px;width:8px;height:1.5px;background:#fff;border-radius:1px}
  @keyframes cbPop{0%{transform:scale(.7)}55%{transform:scale(1.18)}100%{transform:scale(1)}}

  .trow{border-bottom:1px solid #f0f0f6;background:#fff;transition:background .12s,box-shadow .12s}
  .trow:hover{background:#f7f9ff;box-shadow:inset 3px 0 0 #1a56db}
  .trow.sel{background:#f0f5ff}
  .trow:last-child{border-bottom:none}

  .srt{background:none;border:none;cursor:pointer;padding:0;display:inline-flex;align-items:center;gap:2px;font-weight:700;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#adadb8;font-family:inherit;transition:color .1s;-webkit-tap-highlight-color:transparent;white-space:nowrap}
  .srt:hover{color:#0c0c0e}
  .srt.on{color:#1a56db}

  .ntab{padding:6px 12px;border-radius:6px;border:none;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:#6b6b72;font-family:inherit;transition:transform .14s cubic-bezier(.34,1.45,.5,1),background .15s,color .15s;-webkit-tap-highlight-color:transparent}
  .ntab:hover{background:#f0f0f6;color:#0c0c0e}
  .ntab:active{transform:scale(.94);transition-duration:.05s}
  .ntab.on{background:#f0f0f6;color:#0c0c0e;font-weight:600}

  .ov{position:fixed;inset:0;background:rgba(12,12,14,.55);z-index:900;display:flex;align-items:flex-end;justify-content:center;padding:0;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
  @media(min-width:600px){.ov{align-items:center;padding:16px}}
  .mo{background:#fff;border-radius:16px 16px 0 0;width:100%;max-height:92dvh;overflow-y:auto;box-shadow:0 -4px 40px rgba(0,0,0,.15);animation:slideUp .2s ease}
  @media(min-width:600px){.mo{border-radius:14px;max-height:calc(100dvh - 32px);box-shadow:0 8px 64px rgba(0,0,0,.2);animation:fadeUp .18s ease}}
  @keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .mhd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e4e4ec;position:sticky;top:0;background:#fff;z-index:10;border-radius:16px 16px 0 0}
  @media(min-width:600px){.mhd{border-radius:0}}
  .mcl{background:none;border:none;cursor:pointer;color:#adadb8;font-size:20px;line-height:1;padding:4px 8px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all .1s;flex-shrink:0;-webkit-tap-highlight-color:transparent}
  .mcl:hover{background:#f0f0f6;color:#0c0c0e;filter:none}

  .slid{-webkit-appearance:none;appearance:none;width:100%;height:3px;border-radius:2px;background:transparent;outline:none;cursor:pointer;position:relative;z-index:2;padding:8px 0;margin:0;box-sizing:content-box}
  .slid::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#0c0c0e;cursor:pointer;border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.2),0 2px 8px rgba(0,0,0,.18);transition:transform .1s;margin-top:-9px}
  .slid::-webkit-slider-thumb:hover{transform:scale(1.12)}
  .slid::-webkit-slider-thumb:active{transform:scale(1.2)}
  .slid::-webkit-slider-runnable-track{height:3px}
  .slid::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#0c0c0e;cursor:pointer;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2)}

  .pb{height:3px;background:#e4e4ec;border-radius:2px;overflow:hidden}
  .pf{height:100%;border-radius:2px;transition:width .3s ease}

  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;background:#0c0c0e;color:#fff;padding:11px 20px;border-radius:9px;font-size:13px;font-weight:500;animation:toastIn .32s cubic-bezier(.34,1.56,.64,1);pointer-events:none;box-shadow:0 8px 30px rgba(0,0,0,.3);white-space:nowrap;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 32px)}
  @keyframes toastIn{0%{opacity:0;transform:translateX(-50%) translateY(20px) scale(.9)}60%{transform:translateX(-50%) translateY(-3px) scale(1.02)}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}

  .sp{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:rot .6s linear infinite;flex-shrink:0;display:inline-block}
  .spb{width:14px;height:14px;border-radius:50%;border:2px solid #bfcffd;border-top-color:#1a56db;animation:rot .6s linear infinite;flex-shrink:0;display:inline-block}
  @keyframes rot{to{transform:rotate(360deg)}}

  .feat-card{background:#fff;border:1px solid #e4e4ec;border-radius:12px;padding:24px;transition:box-shadow .2s,transform .2s}
  .feat-card:hover{box-shadow:0 6px 28px rgba(0,0,0,.07);transform:translateY(-2px)}
  .testi-card{background:#fff;border:1px solid #e4e4ec;border-radius:12px;padding:22px}
  .price-card{border:1.5px solid #e4e4ec;border-radius:12px;padding:26px;background:#fff;transition:box-shadow .25s,transform .25s}
  .price-card:hover{box-shadow:0 10px 34px rgba(0,0,0,.09);transform:translateY(-3px)}
  .price-card.featured{border-color:#0c0c0e}

  .step-in{animation:stepIn .2s ease both}
  @keyframes stepIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
  .page-in{animation:pageIn .22s ease both}
  @keyframes pageIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}



  .nav-base{position:fixed;top:0;left:0;right:0;z-index:100;transition:border-color .2s,background .2s}
  .nav-top{border-bottom:1px solid transparent;background:#fff}
  .nav-scrolled{border-bottom:1px solid #e4e4ec;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}

  @media(max-width:768px){.hm{display:none!important}}
  @media(max-width:520px){.hm2{display:none!important}}

  .section{padding:72px 20px;max-width:1100px;margin:0 auto}
  @media(max-width:600px){.section{padding:52px 16px}}

  .sel-bar{padding:9px 16px;background:#eef3ff;border-bottom:1px solid #bfcffd;display:flex;align-items:center;gap:10px;flex-wrap:wrap;animation:selIn .24s cubic-bezier(.34,1.45,.5,1)}
  @keyframes selIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  .co-name{background:none;border:none;cursor:pointer;padding:0;text-align:left;font-family:inherit}
  .co-name:hover .co-title{color:#1a56db !important}
  .co-title{transition:color .12s}
  .badge-new{animation:badgePop .34s cubic-bezier(.34,1.56,.64,1)}
  @keyframes badgePop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
  :focus-visible{outline:2px solid #1a56db;outline-offset:2px}

  @keyframes creditPulse{0%,100%{opacity:1}50%{opacity:.45}}
  .credit-low{animation:creditPulse 2s ease infinite}

  @media (prefers-reduced-motion: reduce){
    *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}
  }
`;

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const Sp  = () => <span className="sp" />;
const SpB = () => <span className="spb" />;

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast" role="status" aria-live="polite">{msg}</div>;
}

function Chip({ color = "neutral", children }) {
  const m = { green:{background:K.grnT,borderColor:K.grnB,color:K.grn}, blue:{background:K.blT,borderColor:K.blB,color:K.bl}, red:{background:K.redT,borderColor:K.redB,color:K.red}, amber:{background:K.ambT,borderColor:K.ambB,color:K.amb}, neutral:{background:K.surf2,borderColor:K.b,color:K.ink3}, dark:{background:K.ink,borderColor:K.ink,color:"#fff"} };
  return <span className="chip" style={m[color]||m.neutral}>{children}</span>;
}

function InfoBox({ color = "neutral", icon, children }) {
  const m = { blue:{bg:K.blT,bd:K.blB,tx:K.bl}, green:{bg:K.grnT,bd:K.grnB,tx:K.grn}, amber:{bg:K.ambT,bd:K.ambB,tx:K.amb}, red:{bg:K.redT,bd:K.redB,tx:K.red}, neutral:{bg:K.surf,bd:K.b,tx:K.ink3} };
  const s = m[color]||m.neutral;
  return (
    <div role="note" style={{ background:s.bg, border:`1px solid ${s.bd}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:s.tx, lineHeight:1.65, display:"flex", alignItems:"flex-start", gap:8 }}>
      {icon && <span style={{ flexShrink:0, marginTop:1 }} aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

function SortBtn({ label, col, sortCol, sortDir, onSort }) {
  const on = sortCol === col;
  return (
    <button className={`srt${on?" on":""}`} onClick={()=>onSort(col)} aria-label={`Sort by ${label}`}>
      {label} <span style={{fontSize:9}} aria-hidden="true">{on?(sortDir==="asc"?"↑":"↓"):"⇅"}</span>
    </button>
  );
}

function CreditMeter({ credits, planId }) {
  const max = planId==="pro" ? (PLANS.pro.creditsPerMonth||1000) : (PLANS.free.dailyUnlocks||5);
  const pct = Math.min((credits/max)*100, 100);
  const low = credits <= 2;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <div style={{ width:52, height:3, background:K.b, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:low?K.red:K.ink, borderRadius:2, transition:"width .3s" }} />
      </div>
      <span className={low?"credit-low":""} style={{ fontSize:12, fontWeight:600, color:low?K.red:K.ink3 }} aria-label={`${credits} credits remaining`}>{credits}</span>
    </div>
  );
}

function PersonalizationSlider({ value, onChange }) {
  const labels = ["Generic","Light","Tailored","Detailed","Deep"];
  const descs  = [
    "Mentions your school and background only. Works for any company.",
    "References the company's general industry. Feels considered.",
    "References what this company is specifically known for. Feels researched.",
    "Connects your experience to their mission and culture.",
    "Reads like you've studied this company closely. Review before sending.",
  ];
  const pct  = ((value-1)/4)*100;
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span className="lbl" style={{margin:0}}>Personalization level</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, color:K.grn, fontWeight:600 }}>Free · unlimited</span>
          <span style={{ fontSize:12, fontWeight:700, background:K.surf, color:K.ink, padding:"2px 8px", borderRadius:4, border:`1px solid ${K.b}` }}>{labels[value-1]}</span>
        </div>
      </div>
      <div style={{ position:"relative", paddingBottom:2 }}>
        <div style={{ position:"absolute", top:8, left:0, right:0, height:3, background:K.b, borderRadius:2, pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:8, left:0, width:`${pct}%`, height:3, background:K.ink, borderRadius:2, pointerEvents:"none", transition:"width .12s ease" }} />
        <input type="range" className="slid" min={1} max={5} step={1} value={value} onChange={e=>onChange(Number(e.target.value))} aria-label={`Personalization level ${value} of 5`} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, marginTop:4 }}>
        {labels.map((l,i)=><span key={l} style={{ fontSize:10, color:i+1===value?K.ink:K.ink4, fontWeight:i+1===value?700:400 }}>{l}</span>)}
      </div>
      <div style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:7, padding:"9px 12px", fontSize:12, color:K.ink3, lineHeight:1.65 }}>
        <strong style={{color:K.ink2,fontWeight:600}}>Level {value}: </strong>{descs[value-1]}
        {value>=4&&<span style={{color:K.amb,fontWeight:500}}> Review before sending.</span>}
      </div>
    </div>
  );
}

// ─── AUTH MODAL (email + password) ────────────────────────────────────────────
// Account creation and sign-in. Gmail OAuth is a separate step in Onboarding
// and is only for the gmail.send scope — not for authentication.
function AuthModal({ defaultTab = "signin", onSuccess, onClose }) {
  const [tab,  setTab]  = useState(defaultTab);
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [err,  setErr]  = useState("");
  const [load, setLoad] = useState(false);
  const fv = (k, v) => setForm(p => ({ ...p, [k]:v }));

  function validate() {
    if (tab === "signup") {
      if (form.name.trim().length < 2)       return "Enter your full name.";
      if (!/\S+@\S+\.\S+/.test(form.email))  return "Enter a valid email address.";
      if (form.password.length < 8)           return "Password must be at least 8 characters.";
      if (form.password !== form.confirm)     return "Passwords don't match.";
    } else {
      if (!/\S+@\S+\.\S+/.test(form.email))  return "Enter your email address.";
      if (!form.password)                     return "Enter your password.";
    }
    return "";
  }

  async function submit() {
    const msg = validate();
    if (msg) { setErr(msg); return; }
    setErr(""); setLoad(true);

    // ── PRODUCTION ──────────────────────────────────────────────────────────
    // SIGN UP:
    //   const { data, error } = await supabase.auth.signUp({
    //     email: form.email, password: form.password,
    //     options: { data: { name: form.name } },
    //   });
    //   if (error) { setErr(error.message); setLoad(false); return; }
    //   onSuccess({ id: data.user.id, email: form.email, name: form.name });
    //
    // SIGN IN:
    //   const { data, error } = await supabase.auth.signInWithPassword({
    //     email: form.email, password: form.password,
    //   });
    //   if (error) { setErr(error.message); setLoad(false); return; }
    //   const name = data.user.user_metadata?.name || form.email.split("@")[0];
    //   onSuccess({ id: data.user.id, email: form.email, name });
    // ────────────────────────────────────────────────────────────────────────

    await new Promise(r => setTimeout(r, 900));
    setLoad(false);
    onSuccess({
      id:    "u_" + Date.now(),
      email: form.email,
      name:  tab === "signup" ? form.name : form.email.split("@")[0],
    });
  }

  function switchTab(t) { setTab(t); setErr(""); }

  return (
    <div
      role="dialog" aria-modal="true" aria-label={tab === "signup" ? "Create account" : "Sign in"}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
      onClick={onClose}
    >
      <div style={{ background:"#fff", borderRadius:14, width:"100%", maxWidth:400, padding:"28px 28px 24px", boxShadow:"0 8px 48px rgba(0,0,0,.2)" }} onClick={e => e.stopPropagation()}>
        {/* Tab bar */}
        <div style={{ display:"flex", marginBottom:22, borderBottom:`1px solid ${K.b}`, gap:0 }}>
          {[["signin","Sign in"],["signup","Create account"]].map(([t, label]) => (
            <button key={t} onClick={() => switchTab(t)} style={{
              flex:1, padding:"9px 0", fontSize:13, fontWeight:tab===t?700:500,
              color:tab===t?K.ink:K.ink4, background:"none", border:"none",
              borderBottom:tab===t?`2px solid ${K.ink}`:"2px solid transparent",
              cursor:"pointer", marginBottom:-1, transition:"color .15s",
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
          {tab === "signup" && (
            <div>
              <label className="lbl" htmlFor="auth-name">Full name</label>
              <input id="auth-name" style={F()} placeholder="Alex Johnson" value={form.name}
                onChange={e => fv("name", e.target.value)} autoComplete="name" autoFocus />
            </div>
          )}
          <div>
            <label className="lbl" htmlFor="auth-email">Email address</label>
            <input id="auth-email" type="email" style={F()} placeholder="you@email.com" value={form.email}
              onChange={e => fv("email", e.target.value)} autoComplete="email"
              autoFocus={tab === "signin"} />
          </div>
          <div>
            <label className="lbl" htmlFor="auth-pw">Password</label>
            <input id="auth-pw" type="password" style={F()} value={form.password}
              placeholder={tab === "signup" ? "8+ characters" : "Your password"}
              onChange={e => fv("password", e.target.value)}
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              onKeyDown={e => { if (e.key === "Enter" && tab === "signin") submit(); }} />
          </div>
          {tab === "signup" && (
            <div>
              <label className="lbl" htmlFor="auth-confirm">Confirm password</label>
              <input id="auth-confirm" type="password" style={F()} placeholder="Same as above"
                value={form.confirm} onChange={e => fv("confirm", e.target.value)}
                autoComplete="new-password"
                onKeyDown={e => { if (e.key === "Enter") submit(); }} />
            </div>
          )}

          {err && <InfoBox color="red" icon="⚠">{err}</InfoBox>}

          <button
            style={G("dark",{width:"100%",padding:"11px 0",fontSize:14,marginTop:4,borderRadius:8,opacity:load?0.6:1})}
            disabled={load} onClick={submit}
          >
            {load
              ? <><Sp/>{tab === "signup" ? "Creating account…" : "Signing in…"}</>
              : tab === "signup" ? "Create account →" : "Sign in →"}
          </button>

          {tab === "signup" && (
            <p style={{ fontSize:11, color:K.ink4, textAlign:"center", lineHeight:1.65, marginTop:2 }}>
              By creating an account you agree to our{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:K.ink3 }}>Terms</a>{" "}and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:K.ink3 }}>Privacy Policy</a>.
            </p>
          )}
          {tab === "signin" && (
            <p style={{ fontSize:12, color:K.ink4, textAlign:"center", marginTop:2 }}>
              No account?{" "}
              <button onClick={() => switchTab("signup")} style={{ background:"none", border:"none", color:K.ink2, fontSize:12, fontWeight:600, cursor:"pointer", padding:0 }}>
                Create one →
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

// ─── GMAIL CONNECT BUTTON ─────────────────────────────────────────────────────
// Separate from account auth — this only requests gmail.send scope so the
// app can send emails on the user's behalf from their own Gmail address.
function GmailConnectButton({ onSuccess }) {
  const [loading, setLoad] = useState(false);
  function handle() {
    setLoad(true);
    // PRODUCTION: trigger supabase.auth.signInWithOAuth with gmail.send scope only:
    //   supabase.auth.signInWithOAuth({
    //     provider: "google",
    //     options: {
    //       scopes: "https://www.googleapis.com/auth/gmail.send",
    //       redirectTo: `${window.location.origin}/auth/gmail-callback`,
    //       queryParams: { access_type: "offline", prompt: "consent" },
    //     }
    //   });
    // Then in /auth/gmail-callback, store the token in sessionStorage via ss.set(GT_KEY, token).
    setTimeout(() => {
      setLoad(false);
      onSuccess("oauth_" + Date.now());
    }, 1200);
  }
  return (
    <button
      onClick={handle}
      disabled={loading}
      aria-label="Connect Gmail account"
      style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        width:"100%", padding:"11px 16px", border:`1.5px solid ${K.b}`,
        borderRadius:8, background:"#fff", cursor:"pointer", fontSize:14,
        fontWeight:500, color:K.ink, fontFamily:"inherit", transition:"all .15s",
        boxShadow:"0 1px 3px rgba(0,0,0,.06)", WebkitTapHighlightColor:"transparent",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? <Sp /> : (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
      )}
      {loading ? "Connecting…" : "Connect Gmail account"}
    </button>
  );
}
function Landing({ onGetStarted, onAuthSuccess }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [faqOpen,    setFaqOpen]    = useState(null);
  const [modal,      setModal]      = useState(null); // "signin" | "signup" | null

  useEffect(() => {
    injectSEO();
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const faqs = [
    ["How does FirstInternships help me get an internship?","Most companies never post their internships publicly — they hire students who reach out directly. FirstInternships gives you a curated database of company recruiting inboxes and an AI that writes a personalized cold email for each company based on your background. You send it from your own Gmail."],
    ["Do I need experience or a specific background?","No. Students from every background use FirstInternships — high school, college, grad school, military, career changers. You just need a Gmail account and a few sentences about yourself. The AI handles the rest."],
    ["What industries are covered?","All of them. Tech, media, marketing, design, consulting, law, nonprofits, retail, healthcare, startups, and more. You can filter by industry, company size, location, and remote availability."],
    ["Is cold emailing actually effective?","Yes — especially for smaller companies. Many organizations never post internship listings at all. A well-written, direct email to the right person consistently gets responses that job board applications don't. Reaching out directly signals initiative in a way that a submitted application simply can't."],
    ["Will the company know I used AI?","At levels 1–3, no. The emails are short, direct, and written to sound like a real person. At levels 4–5 the emails are more detailed — review before sending. You can always edit the draft before it goes out."],
    ["How does pricing work?","You spend credits only to unlock a contact the first time you email them — 1 credit for a contact from our database, 2 for one our AI discovers for you. After that, writing and sending unlimited emails and follow-ups to that contact is completely free. The free plan unlocks 5 contacts per day; Pro unlocks 1,000 every month and adds AI firm discovery."],
  ];

  return (
    <main style={{ minHeight:"100vh", background:"#fff", overflowX:"hidden" }}>
      <header>
        <nav className={`nav-base ${scrolled?"nav-scrolled":"nav-top"}`} role="navigation" aria-label="Main navigation">
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <a href="/" style={{ fontWeight:800, fontSize:16, letterSpacing:-.6, color:K.ink }}>firstinternships</a>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button style={G("ghost",{fontSize:13,padding:"6px 14px"})} onClick={()=>setModal("signin")}>Sign in</button>
              <button style={G("dark",{fontSize:13,padding:"7px 16px"})} onClick={()=>setModal("signup")}>Get started →</button>
            </div>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section aria-labelledby="hero-h" style={{ paddingTop:120, paddingBottom:72, textAlign:"center", borderBottom:`1px solid ${K.b}` }}>
        <div style={{ maxWidth:700, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:K.blT, border:`1px solid ${K.blB}`, color:K.bl, fontSize:12, fontWeight:600, padding:"4px 14px", borderRadius:100, marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:K.bl, display:"inline-block" }} aria-hidden="true" />
            A direct path to your first internship
          </div>
          <h1 id="hero-h" style={{ fontSize:"clamp(36px,6.5vw,68px)", fontWeight:800, letterSpacing:-2.5, lineHeight:1.07, marginBottom:20 }}>
            Get your first internship.<br />By reaching out, not applying.
          </h1>
          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:K.ink3, lineHeight:1.75, maxWidth:520, margin:"0 auto 32px" }}>
            Access curated company recruiting inboxes across dozens of industries. AI writes a personalized cold email for each one. Send directly from your Gmail — in minutes, not days.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:14 }}>
            <button className="btn-lift" style={G("dark",{fontSize:15,padding:"13px 30px",borderRadius:9,boxShadow:"0 2px 16px rgba(0,0,0,.2)"})} onClick={()=>setModal("signup")}>Get started free →</button>
            <button style={G("ghost",{fontSize:15,padding:"13px 22px",borderRadius:9})} onClick={()=>setModal("signin")}>Sign in</button>
          </div>
          <p style={{ fontSize:12, color:K.ink4 }}>5 free contacts every day · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:K.surf, borderBottom:`1px solid ${K.b}` }}>
        <dl style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[["4,600+","Company contacts"],["40+","Industries"],["Direct","Outreach, not portals"],["Minutes","To your first email"]].map(([n,l],i)=>(
            <div key={n} style={{ padding:"28px 24px", borderRight:i<3?`1px solid ${K.b}`:"none" }}>
              <dt style={{ fontSize:"clamp(20px,3vw,30px)", fontWeight:800, letterSpacing:-1, lineHeight:1 }}>{n}</dt>
              <dd style={{ fontSize:13, color:K.ink3, marginTop:5 }}>{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FEATURES */}
      <section aria-labelledby="why-h" className="section">
        <div style={{ maxWidth:540, marginBottom:48 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:.08, textTransform:"uppercase", color:K.ink3, marginBottom:10 }}>Why FirstInternships</p>
          <h2 id="why-h" style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:-1.2, lineHeight:1.15, marginBottom:14 }}>
            Most students apply.<br />The ones who get offers reach out directly.
          </h2>
          <p style={{ fontSize:15, color:K.ink3, lineHeight:1.78 }}>
            Most companies — especially smaller ones — never post internships publicly. The people who land them send a well-written email to the right person. We built the database and the AI to make that possible for everyone.
          </p>
        </div>
        <ul style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14, listStyle:"none" }}>
          {[
            ["🏢","Real company inboxes","Thousands of real hiring and careers inboxes across dozens of industries — finance, tech, healthcare, retail, logistics, energy, and more. Ready to contact."],
            ["✦","AI email drafting","Enter your background once. AI reads each company's mission and culture and writes a short, direct email that sounds like you wrote it specifically for them."],
            ["📊","Interest matching","Every company is matched against your stated interests and major, so you can focus on the ones whose industry actually fits what you're looking for. We only score on what we know — we don't invent details."],
            ["🎚","Personalization control","A 5-level slider controls how specific each email is. More personalization costs more credits — you decide the tradeoff."],
            ["📬","Send from your Gmail","Every email comes from your Gmail address. Companies see your name, not ours. No shared inboxes, no tricks."],
            ["🔁","Campaign memory","Your sent history persists so you never double-contact the same person. AI auto-selects companies you haven't reached out to yet."],
          ].map(([icon,h,b])=>(
            <li key={h} className="feat-card">
              <div style={{ fontSize:24, marginBottom:14 }} aria-hidden="true">{icon}</div>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:7, letterSpacing:-.2 }}>{h}</h3>
              <p style={{ fontSize:13, color:K.ink3, lineHeight:1.72 }}>{b}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* EARLY ACCESS BANNER */}
      <section aria-label="Early access" style={{ background:K.surf, borderTop:`1px solid ${K.b}`, borderBottom:`1px solid ${K.b}`, padding:"56px 20px" }}>
        <div style={{ maxWidth:620, margin:"0 auto", textAlign:"center" }}>
          <div style={{ display:"inline-block", background:K.ink, color:"#fff", fontSize:10, fontWeight:700, letterSpacing:.08, textTransform:"uppercase", padding:"3px 10px", borderRadius:4, marginBottom:18 }}>Early access</div>
          <h2 style={{ fontSize:"clamp(22px,3.5vw,32px)", fontWeight:800, letterSpacing:-.8, marginBottom:14 }}>Be among the first to run the campaign</h2>
          <p style={{ fontSize:15, color:K.ink3, lineHeight:1.75, marginBottom:0 }}>
            FirstInternships is launching now. Sign up free, run your outreach, and shape the product as it grows.
            Start free — unlock 5 contacts a day, no credit card required.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section aria-labelledby="how-h" className="section" style={{ maxWidth:700 }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:.08, textTransform:"uppercase", color:K.ink3, marginBottom:10 }}>How it works</p>
          <h2 id="how-h" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:800, letterSpacing:-.8 }}>Zero to inbox in under 10 minutes</h2>
        </div>
        <ol style={{ listStyle:"none" }}>
          {[
            ["Tell us about yourself","Name, school or background, and 2 sentences about your experience or interests. That's everything the AI needs."],
            ["Filter and pick your targets","Browse the company database. Sort by interest match, industry, type, or location."],
            ["Generate personalized drafts","One click per company. AI writes a direct, specific email using your background and each company's mission."],
            ["Send from your Gmail","Push to your Gmail inbox. Attach any work samples. Send. Every email comes from your address."],
          ].map(([h,b],i)=>(
            <li key={h} style={{ display:"flex", gap:18, marginBottom:28 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:K.ink, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, marginTop:2 }} aria-hidden="true">{i+1}</div>
              <div><h3 style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{h}</h3><p style={{ fontSize:13, color:K.ink3, lineHeight:1.72 }}>{b}</p></div>
            </li>
          ))}
        </ol>
      </section>

      {/* PRICING */}
      <section aria-labelledby="pricing-h" style={{ background:K.surf, borderTop:`1px solid ${K.b}`, padding:"72px 20px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:12 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:.08, textTransform:"uppercase", color:K.ink3, marginBottom:10 }}>Pricing</p>
            <h2 id="pricing-h" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:800, letterSpacing:-.8, marginBottom:8 }}>Simple, credit-based pricing</h2>
            <p style={{ fontSize:15, color:K.ink3, marginBottom:40 }}>1 credit unlocks a contact from our database, 2 for one our AI discovers for you. Writing emails and follow-ups is always unlimited and free.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14, maxWidth:640, margin:"0 auto" }}>
            <div className="price-card">
              <div style={{ fontSize:11, fontWeight:700, color:K.ink3, marginBottom:10, textTransform:"uppercase", letterSpacing:.04 }}>Free</div>
              <div style={{ fontSize:38, fontWeight:800, letterSpacing:-1.5, lineHeight:1 }}>$0</div>
              <div style={{ fontSize:12, color:K.ink4, marginBottom:20, marginTop:3 }}>always free</div>
              {PLANS.free.features.map(f=><div key={f} style={{display:"flex",gap:8,fontSize:13,color:K.ink2,marginBottom:8,alignItems:"flex-start"}}><span style={{color:K.grn,flexShrink:0}}>✓</span>{f}</div>)}
              {PLANS.free.missing.map(f=><div key={f} style={{display:"flex",gap:8,fontSize:13,color:K.ink4,marginBottom:8,alignItems:"flex-start"}}><span style={{flexShrink:0}}>–</span>{f}</div>)}
              <button style={G("ghost",{width:"100%",padding:"10px 0",marginTop:18,fontSize:14})} onClick={()=>setModal("signup")}>Get started free →</button>
            </div>
            <div className="price-card featured">
              <div style={{ fontSize:10, fontWeight:700, background:K.ink, color:"#fff", padding:"2px 9px", borderRadius:4, display:"inline-block", marginBottom:10, letterSpacing:.04 }}>PRO</div>
              <div style={{ fontSize:38, fontWeight:800, letterSpacing:-1.5, lineHeight:1 }}>$20</div>
              <div style={{ fontSize:12, color:K.ink4, marginBottom:20, marginTop:3 }}>per month</div>
              {PLANS.pro.features.map(f=><div key={f} style={{display:"flex",gap:8,fontSize:13,color:K.ink2,marginBottom:8,alignItems:"flex-start"}}><span style={{color:K.grn,flexShrink:0}}>✓</span>{f}</div>)}
              <button style={G("dark",{width:"100%",padding:"10px 0",marginTop:18,fontSize:14})} onClick={()=>setModal("signup")}>Get started →</button>
            </div>
          </div>
          <div style={{ maxWidth:640, margin:"20px auto 0", background:"#fff", border:`1px solid ${K.b}`, borderRadius:10, padding:"16px 20px" }}>
            <div style={{ fontSize:12, fontWeight:700, color:K.ink2, marginBottom:10 }}>How credits work</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[["Database contact","1 credit","Unlock to email them"],["AI-discovered","2 credits","Found for you by AI"],["Writing & follow-ups","Free","Unlimited, any depth"]].map(([lvl,type,cost])=>(
                <div key={lvl} style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:7, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, fontWeight:600, color:K.ink3, marginBottom:2, textTransform:"uppercase", letterSpacing:.03 }}>{lvl}</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{type}</div>
                  <div style={{ fontSize:11, color:K.ink4, marginTop:2 }}>{cost}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-h" className="section" style={{ maxWidth:700 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:.08, textTransform:"uppercase", color:K.ink3, marginBottom:10 }}>FAQ</p>
          <h2 id="faq-h" style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:800, letterSpacing:-.8 }}>Common questions</h2>
        </div>
        <div>
          {faqs.map(([q,a],i)=>(
            <div key={i} style={{ borderTop:`1px solid ${K.b}` }}>
              <button style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"18px 0", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"inherit", fontSize:15, fontWeight:600, color:K.ink, textAlign:"left", gap:12 }} onClick={()=>setFaqOpen(faqOpen===i?null:i)} aria-expanded={faqOpen===i}>
                <span>{q}</span>
                <span style={{ color:K.ink4, fontSize:18, flexShrink:0, transform:faqOpen===i?"rotate(180deg)":"none", transition:"transform .2s" }} aria-hidden="true">↓</span>
              </button>
              {faqOpen===i && <div style={{ paddingBottom:18 }}><p style={{ fontSize:14, color:K.ink3, lineHeight:1.75 }}>{a}</p></div>}
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${K.b}` }} />
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-h" style={{ padding:"72px 20px", textAlign:"center" }}>
        <div style={{ maxWidth:520, margin:"0 auto" }}>
          <h2 id="cta-h" style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:800, letterSpacing:-2, lineHeight:1.08, marginBottom:16 }}>
            Your first internship<br />starts with one email.
          </h2>
          <p style={{ fontSize:16, color:K.ink3, marginBottom:32, lineHeight:1.72 }}>Start today. 5 free contacts every day. No credit card required.</p>
          <button className="btn-lift" style={G("dark",{fontSize:16,padding:"14px 34px",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,.16)"})} onClick={()=>setModal("signup")}>Get started free →</button>
          <p style={{ fontSize:12, color:K.ink4, marginTop:14 }}>Takes 4 minutes · Emails go from your own Gmail</p>
        </div>
      </section>

      {/* AUTH MODAL */}
      {modal && (
        <AuthModal
          defaultTab={modal}
          onClose={() => setModal(null)}
          onSuccess={u => { setModal(null); onAuthSuccess(u, modal); }}
        />
      )}

      {/* OPT-OUT — B2B contacts only; CAN-SPAM § 7704(b)(1) does not require
           opt-out for transactional/non-commercial messages, but we offer it anyway */}
      <section aria-label="Contact opt-out" style={{ borderTop:`1px solid ${K.b}`, background:K.surf, padding:"18px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
          <p style={{ fontSize:11, color:K.ink4, lineHeight:1.8, maxWidth:560, margin:"0 auto" }}>
            <strong style={{ fontWeight:600, color:K.ink3 }}>Hiring contact opt-out:</strong>{" "}
            If you are a company recruiter or HR contact and would like to be removed from our database,
            email{" "}
            <a href="mailto:optout@firstinternships.com" style={{ color:K.ink3, textDecoration:"underline" }}>
              optout@firstinternships.com
            </a>
            {" "}with the subject line <em>"Remove listing"</em> and your company name.
            We process all requests within 5 business days.
          </p>
        </div>
      </section>

      <footer role="contentinfo" style={{ borderTop:`1px solid ${K.b}`, padding:"20px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <span style={{ fontWeight:800, fontSize:15, letterSpacing:-.5 }}>firstinternships</span>
          <nav aria-label="Footer links" style={{ display:"flex", gap:20 }}>
            <a href="/privacy" style={{ fontSize:12, color:K.ink4 }}>Privacy</a>
            <a href="/terms"   style={{ fontSize:12, color:K.ink4 }}>Terms</a>
            <a href="mailto:hello@firstinternships.com" style={{ fontSize:12, color:K.ink4 }}>Contact</a>
          </nav>
          <span style={{ fontSize:12, color:K.ink4 }}>© 2026 FirstInternships</span>
        </div>
      </footer>
    </main>
  );
}

// ─── EDUCATION OPTIONS ────────────────────────────────────────────────────────
const EDU_LEVELS = [
  "High School Student","High School Graduate","Military / Veteran",
  "Associate's Degree","Bachelor's Student — Freshman","Bachelor's Student — Sophomore",
  "Bachelor's Student — Junior","Bachelor's Student — Senior","Bachelor's Graduate",
  "Master's Student","Master's Graduate","PhD Student","Career Changer","Self-Taught / Bootcamp","Other",
];
const MAJORS = [
  "Computer Science / Engineering","Business / Management","Marketing / Communications",
  "Design / Fine Arts","Journalism / Media","Political Science / Public Policy",
  "Economics","Mathematics / Statistics","Biology / Life Sciences",
  "Psychology / Sociology","Law (Pre-law)","Other",
];

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ user, onDone }) {
  const [step, setStep]         = useState(0);
  const [ageAgreed, setAgeAgreed] = useState(false);
  const [p, setP] = useState({
    name:       user?.name || "",
    school:     "",
    major:      "Business / Management",
    customMajor:"",
    eduLevel:   "Bachelor's Student — Freshman",
    experience: "",
    interest:   "",
    gradYear:   "",
    location:   "",
    linkedin:   "",
    marketingConsent: false,  // opt-in (unchecked) — valid consent under GDPR and CCPA
    gmailToken: user?.gmailToken || "",
  });
  const set = (k, v) => setP(prev => ({ ...prev, [k]:v }));
  const needsSchool = !["High School","Military","Career","Self-Taught"].some(x => p.eduLevel.startsWith(x));

  const steps = [
    {
      h:"What's your name?",
      sub:"Used in every email exactly as written.",
      valid: p.name.trim().length > 1 && ageAgreed,
      body: (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label className="lbl" htmlFor="ob-name">Full name</label>
            <input id="ob-name" autoFocus style={F({fontSize:16,padding:"11px 14px"})} placeholder="Alex Johnson" value={p.name} onChange={e=>set("name",e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&p.name.trim().length>1&&ageAgreed)setStep(1);}} />
          </div>
          <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", userSelect:"none" }}>
            <input
              type="checkbox"
              checked={ageAgreed}
              onChange={e=>setAgeAgreed(e.target.checked)}
              style={{ marginTop:2, flexShrink:0, accentColor:K.ink, width:15, height:15, cursor:"pointer" }}
              aria-required="true"
            />
            <span style={{ fontSize:12, color:K.ink3, lineHeight:1.65 }}>
              I confirm I am <strong>18 or older</strong> and agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:K.ink2, textDecoration:"underline" }}>Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:K.ink2, textDecoration:"underline" }}>Privacy Policy</a>.
            </span>
          </label>
        </div>
      ),
    },
    {
      h:"Where are you in your journey?",
      sub:"We use this to frame you correctly in every email.",
      valid: !needsSchool || p.school.trim().length > 2,
      body: (
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
          <div>
            <label className="lbl" htmlFor="ob-edu">Education / background</label>
            <select id="ob-edu" style={F()} value={p.eduLevel} onChange={e=>set("eduLevel",e.target.value)}>
              {EDU_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {needsSchool && (
            <div>
              <label className="lbl" htmlFor="ob-school">School / Institution</label>
              <input id="ob-school" style={F()} placeholder="University of Michigan" value={p.school} onChange={e=>set("school",e.target.value)} />
            </div>
          )}
          <div>
            <label className="lbl" htmlFor="ob-major">Area of study or focus</label>
            <select id="ob-major" style={F()} value={p.major} onChange={e=>set("major",e.target.value)}>
              {MAJORS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {p.major==="Other"&&(
            <div>
              <label className="lbl" htmlFor="ob-custmajor">Your field</label>
              <input id="ob-custmajor" style={F()} placeholder="e.g. Philosophy, Linguistics…" value={p.customMajor} onChange={e=>set("customMajor",e.target.value)} />
            </div>
          )}
        </div>
      ),
    },
    {
      h:"What kind of work are you after?",
      sub:"This helps the AI target the right companies and write emails that fit.",
      valid: p.interest.trim().length > 3,
      body: (
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
          <div>
            <label className="lbl" htmlFor="ob-interest">Industries you're interested in</label>
            <input id="ob-interest" style={F()} placeholder="Tech, marketing, nonprofits, media, design…" value={p.interest} onChange={e=>set("interest",e.target.value)} />
            <p style={{ fontSize:11, color:K.ink4, marginTop:5 }}>Be as specific or broad as you like.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label className="lbl" htmlFor="ob-grad">Graduation year</label>
              <input id="ob-grad" style={F()} placeholder="2027" value={p.gradYear} onChange={e=>set("gradYear",e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label className="lbl" htmlFor="ob-loc">Location</label>
              <input id="ob-loc" style={F()} placeholder="Austin, TX" value={p.location} onChange={e=>set("location",e.target.value)} />
            </div>
          </div>
          <div>
            <label className="lbl" htmlFor="ob-li">LinkedIn or portfolio <span style={{color:K.ink4,fontWeight:400}}>(optional)</span></label>
            <input id="ob-li" style={F()} placeholder="linkedin.com/in/you" value={p.linkedin} onChange={e=>set("linkedin",e.target.value)} />
          </div>
          <div>
            <label className="lbl" htmlFor="ob-exp">Your background (1–2 sentences)</label>
            <textarea id="ob-exp" style={F({resize:"vertical",minHeight:90,lineHeight:1.75,fontFamily:"inherit",fontSize:14})} placeholder="I've built two personal projects using React and Python, competed in a marketing case competition, and run the social media for a local nonprofit with 12k followers." value={p.experience} onChange={e=>set("experience",e.target.value)} />
            <p style={{ fontSize:11, color:K.ink4, marginTop:5, lineHeight:1.65 }}>Any projects, jobs, coursework, or interests. More detail = better emails.</p>
          </div>
          {/* Marketing / data-sharing consent — kept separate from the ToS agreement so
              it is valid, informed consent. Unchecked by default (opt-in), which is
              valid under both GDPR and CCPA. */}
          <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", userSelect:"none", background:K.surf, border:`1px solid ${K.b}`, borderRadius:8, padding:"11px 12px" }}>
            <input type="checkbox" checked={p.marketingConsent} onChange={e=>set("marketingConsent",e.target.checked)} style={{ marginTop:2, flexShrink:0, accentColor:K.ink, width:15, height:15, cursor:"pointer" }} />
            <span style={{ fontSize:11.5, color:K.ink3, lineHeight:1.6 }}>
              Send me relevant internship, job, and partner opportunities, and let FirstInternships share my profile with vetted partner companies and affiliated services. You can opt out anytime in settings or via any email's unsubscribe link. See our{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:K.ink2, textDecoration:"underline" }}>Privacy Policy</a>.
            </span>
          </label>
        </div>
      ),
    },
    {
      h:"Connect Gmail to start sending.",
      sub:"Every email comes from your account — companies see your name, not ours.",
      valid: true,
      body: (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {p.gmailToken && !p.gmailToken.startsWith("skip") ? (
            <InfoBox color="green" icon="✓">Gmail connected. Ready to send emails from your account.</InfoBox>
          ) : (
            <GmailConnectButton onSuccess={token=>set("gmailToken",token)} />
          )}
          <InfoBox color="neutral" icon="🔒">
            <strong>gmail.send scope only.</strong> We cannot read your inbox. Emails only send when you click Send. Your credentials stay with Google.
          </InfoBox>
          {!p.gmailToken && (
            <button style={{...G("ghost",{fontSize:12,border:"none",color:K.ink4}),alignSelf:"center"}} onClick={()=>{set("gmailToken","skip");setTimeout(()=>{const profile={...p,major:p.major==="Other"?p.customMajor:p.major};db.set(SK.profile,stripToken(profile));onDone(profile);},50);}}>
              Skip for now
            </button>
          )}
        </div>
      ),
    },
  ];

  const curr = steps[step];
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:K.surf, padding:16 }}>
      <div style={{ maxWidth:460, width:"100%", background:"#fff", border:`1px solid ${K.b}`, borderRadius:14, overflow:"hidden", boxShadow:"0 4px 32px rgba(0,0,0,.07)" }} role="main">
        <div style={{ padding:"18px 24px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <span style={{ fontWeight:800, fontSize:15, letterSpacing:-.4 }}>firstinternships</span>
            <span style={{ fontSize:12, color:K.ink4 }}>{step+1} / {steps.length}</span>
          </div>
          <div className="pb"><div className="pf" style={{ width:`${((step+1)/steps.length)*100}%`, background:K.ink }} /></div>
        </div>
        <div className="step-in" key={step} style={{ padding:"26px 24px" }}>
          <h2 style={{ fontSize:21, fontWeight:800, letterSpacing:-.6, marginBottom:7 }}>{curr.h}</h2>
          <p style={{ fontSize:14, color:K.ink3, marginBottom:20, lineHeight:1.65 }}>{curr.sub}</p>
          {curr.body}
        </div>
        <div style={{ padding:"0 24px 22px", display:"flex", gap:10, justifyContent:"space-between" }}>
          {step>0?<button style={G("ghost")} onClick={()=>setStep(s=>s-1)}>← Back</button>:<span/>}
          <button style={G("dark",{minWidth:130})} disabled={!curr.valid} onClick={()=>{
            if(step<steps.length-1){setStep(s=>s+1);}
            else{const profile={...p,major:p.major==="Other"?p.customMajor:p.major};if(profile.gmailToken&&profile.gmailToken!=="skip"){ss.set(GT_KEY,profile.gmailToken);}db.set(SK.profile,stripToken(profile));onDone(profile);}
          }}>
            {step<steps.length-1?"Continue →":"Start sending →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT PAGE (Stripe Elements) ──────────────────────────────────────────
// IMPORTANT: Replace "pk_live_YOUR_KEY_HERE" with your actual Stripe publishable key.
// Before going live you also need a server endpoint that creates a PaymentIntent and
// returns a clientSecret. See https://stripe.com/docs/payments/accept-a-payment
function CheckoutPage({ onBack, onSuccess }) {
  const [loading,  setLoad]  = useState(false);
  const [ready,    setReady] = useState(false);
  const [err,      setErr]   = useState("");
  const [stripe,   setStripe]    = useState(null);
  const cardRef    = useRef(null);   // div that Stripe mounts into
  const cardElRef  = useRef(null);   // Stripe CardElement instance

  // Load Stripe.js once and mount the CardElement
  useEffect(() => {
    let card;
    function mount(s) {
      const els = s.elements({ fonts:[{ cssSrc:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" }] });
      card = els.create("card", {
        style: {
          base: {
            fontFamily:"'Inter', system-ui, sans-serif",
            fontSize:"14px",
            color: "#0c0c0e",
            "::placeholder": { color:"#c0c0cc" },
          },
          invalid: { color:"#dc2626" },
        },
        hidePostalCode: false,
      });
      if (cardRef.current) {
        card.mount(cardRef.current);
        card.on("ready",  ()    => setReady(true));
        card.on("change", evt  => { if(evt.error) setErr(evt.error.message); else setErr(""); });
        cardElRef.current = card;
      }
      setStripe(s);
    }

    if (window.Stripe) { mount(window.Stripe("pk_live_YOUR_KEY_HERE")); }
    else {
      const script  = document.createElement("script");
      script.src    = "https://js.stripe.com/v3/";
      script.async  = true;
      script.onload = () => mount(window.Stripe("pk_live_YOUR_KEY_HERE"));
      document.head.appendChild(script);
    }
    // Cleanup always runs regardless of which branch loaded Stripe
    return () => { try { card?.destroy(); } catch {} };
  }, []);

  async function submit() {
    if (!stripe || !cardElRef.current || loading || !ready) return;
    setLoad(true); setErr("");

    // ── PRODUCTION FLOW ─────────────────────────────────────────────────────
    // 1. Call your server to create a PaymentIntent and get back a clientSecret.
    //    const { clientSecret, error: serverErr } = await fetch("/api/create-payment-intent", {
    //      method: "POST", headers:{ "Content-Type":"application/json" },
    //      body: JSON.stringify({ priceId:"price_YOUR_STRIPE_PRICE_ID" }),
    //    }).then(r=>r.json());
    //    if (serverErr) { setErr(serverErr); setLoad(false); return; }
    //
    // 2. Confirm the card payment — card data never leaves Stripe's iframe.
    //    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    //      payment_method: { card: cardElRef.current },
    //    });
    //    if (error) { setErr(error.message); setLoad(false); return; }
    //    if (paymentIntent.status === "succeeded") onSuccess();
    // ────────────────────────────────────────────────────────────────────────

    // TEMPORARY: remove the block below once the server endpoint above is wired up.
    console.warn("Stripe server integration not yet wired — simulating success for dev.");
    await new Promise(r => setTimeout(r, 1500));
    setLoad(false);
    onSuccess();
  }

  return (
    <div style={{ minHeight:"100vh", background:K.surf, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ maxWidth:480, width:"100%" }}>
        <button style={{...G("ghost",{fontSize:13,marginBottom:20}),display:"inline-flex"}} onClick={onBack}>← Back</button>
        <div style={{ background:"#fff", border:`1px solid ${K.b}`, borderRadius:14, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
          {/* Order summary */}
          <div style={{ padding:"20px 24px", borderBottom:`1px solid ${K.b}`, background:K.surf }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div><h1 style={{ fontWeight:800, fontSize:16 }}>FirstInternships Pro</h1><p style={{ fontSize:13, color:K.ink3, marginTop:2 }}>1,000 credits/month · Billed monthly</p></div>
              <div style={{ textAlign:"right" }}><div style={{ fontWeight:800, fontSize:24 }}>$20</div><div style={{ fontSize:11, color:K.ink4 }}>/month</div></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[["1,000","Credits / mo"],["$5","Per 100 extra"],["All","Industries"]].map(([n,l])=>(
                <div key={l} style={{ background:"#fff", border:`1px solid ${K.b}`, borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                  <div style={{ fontWeight:800, fontSize:16 }}>{n}</div>
                  <div style={{ fontSize:10, color:K.ink4, marginTop:1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Features */}
          <div style={{ padding:"14px 24px", borderBottom:`1px solid ${K.b}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {PLANS.pro.features.map(f=>(
                <div key={f} style={{ display:"flex", gap:7, fontSize:12, color:K.ink2, alignItems:"flex-start" }}>
                  <span style={{ color:K.grn, flexShrink:0, marginTop:1 }}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>
          {/* Payment — Stripe Elements card iframe */}
          <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
            <InfoBox color="neutral" icon="🔒">
              <strong>Secured by Stripe.</strong> Card details are entered directly into Stripe's encrypted iframe — we never see or handle your card number.
            </InfoBox>
            <div>
              <label className="lbl">Card details</label>
              {/* Stripe mounts its secure iframe here — do NOT add custom card inputs */}
              <div ref={cardRef} style={{
                border:`1px solid ${K.b}`, borderRadius:8, padding:"11px 12px",
                background:"#fff", minHeight:42,
                boxShadow: ready ? "none" : undefined,
                transition:"border-color .15s",
              }} aria-label="Card details (secured by Stripe)" />
              {!ready && <p style={{ fontSize:11, color:K.ink4, marginTop:5 }}>Loading secure card form…</p>}
            </div>
            {err && <InfoBox color="red" icon="⚠">{err}</InfoBox>}
            <button
              style={G("dark",{width:"100%",padding:"12px 0",fontSize:15,borderRadius:8,opacity:(loading||!ready)?0.6:1})}
              disabled={loading || !ready}
              onClick={submit}
            >
              {loading ? <><Sp/>Processing…</> : "Pay $20.00 / month"}
            </button>
            <p style={{ textAlign:"center", fontSize:11, color:K.ink4, lineHeight:1.65 }}>
              Cancel anytime. Monthly billing. Renews until cancelled.<br/>
              By subscribing you agree to our <a href="/terms" style={{color:K.ink3}}>Terms</a> and <a href="/privacy" style={{color:K.ink3}}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAYWALL MODAL ─────────────────────────────────────────────────────────────
function Paywall({ credits, onClose, onUpgrade }) {
  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="pw-title">
      <div className="mo" style={{ maxWidth:480 }}>
        <div className="mhd">
          <div><h2 id="pw-title" style={{ fontWeight:800, fontSize:15 }}>Upgrade to Pro</h2><p style={{ fontSize:13, color:K.ink3, marginTop:2 }}>{credits<=0?"No credits remaining":`${credits} credit${credits!==1?"s":""} left`}</p></div>
          <button className="mcl" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div style={{ padding:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div style={{ border:`1px solid ${K.b}`, borderRadius:10, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:K.ink3, textTransform:"uppercase", letterSpacing:.04, marginBottom:8 }}>Free</div>
              <div style={{ fontSize:32, fontWeight:800, letterSpacing:-1.5, lineHeight:1 }}>20</div>
              <div style={{ fontSize:11, color:K.ink4, marginBottom:14, marginTop:2 }}>credits total</div>
              {PLANS.free.features.map(f=><div key={f} style={{display:"flex",gap:7,fontSize:12,color:K.ink2,marginBottom:6,alignItems:"flex-start"}}><span style={{color:K.grn,flexShrink:0}}>✓</span>{f}</div>)}
              {PLANS.free.missing.map(f=><div key={f} style={{display:"flex",gap:7,fontSize:12,color:K.ink4,marginBottom:6,alignItems:"flex-start"}}><span style={{flexShrink:0}}>–</span>{f}</div>)}
              <div style={{ marginTop:12, padding:"7px 0", textAlign:"center", borderRadius:6, border:`1px solid ${K.b}`, fontSize:12, color:K.ink3, fontWeight:500 }}>Current plan</div>
            </div>
            <div style={{ border:`2px solid ${K.ink}`, borderRadius:10, padding:18, position:"relative" }}>
              <div style={{ position:"absolute", top:-11, left:12, background:K.ink, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 9px", borderRadius:4, letterSpacing:.04 }}>BEST VALUE</div>
              <div style={{ fontSize:11, fontWeight:700, color:K.ink3, textTransform:"uppercase", letterSpacing:.04, marginBottom:8 }}>Pro</div>
              <div style={{ fontSize:32, fontWeight:800, letterSpacing:-1.5, lineHeight:1 }}>1,000</div>
              <div style={{ fontSize:11, color:K.ink4, marginBottom:14, marginTop:2 }}>credits / month</div>
              {PLANS.pro.features.map(f=><div key={f} style={{display:"flex",gap:7,fontSize:12,color:K.ink2,marginBottom:6,alignItems:"flex-start"}}><span style={{color:K.grn,flexShrink:0}}>✓</span>{f}</div>)}
              <button style={G("dark",{width:"100%",padding:"9px 0",fontSize:13,marginTop:12})} onClick={()=>{onClose();onUpgrade();}}>Upgrade · $20/mo →</button>
            </div>
          </div>
          <InfoBox color="neutral">Credits reset monthly on Pro. Need more mid-month? Buy 10 credits for $0.99 in Settings.</InfoBox>
        </div>
      </div>
    </div>
  );
}

// ─── TOP-UP MODAL ──────────────────────────────────────────────────────────────
function TopupModal({ onClose, onTopup }) {
  const [qty,  setQty]  = useState(1);
  const [load, setLoad] = useState(false);
  const total = qty*5;
  async function buy(){setLoad(true);await new Promise(r=>setTimeout(r,900));setLoad(false);onTopup(qty*100);onClose();}
  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="tu-title">
      <div className="mo" style={{ maxWidth:360 }}>
        <div className="mhd"><h2 id="tu-title" style={{ fontWeight:700, fontSize:14 }}>Buy extra credits</h2><button className="mcl" onClick={onClose} aria-label="Close">×</button></div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
          <p style={{ fontSize:13, color:K.ink3, lineHeight:1.65 }}>Each unlocks a new contact (writing to them stays free). These stack on top of your monthly 1,000 and don't expire.</p>
          <div>
            <span className="lbl">Quantity ($5 per 100 credits)</span>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:6 }}>
              <button style={G("ghost",{padding:"7px 16px",fontSize:18,fontWeight:800})} onClick={()=>setQty(q=>Math.max(1,q-1))} aria-label="Decrease">−</button>
              <div style={{ textAlign:"center", minWidth:80 }}>
                <div style={{ fontSize:26, fontWeight:800, letterSpacing:-.5 }}>{qty*100}</div>
                <div style={{ fontSize:11, color:K.ink4 }}>credits</div>
              </div>
              <button style={G("ghost",{padding:"7px 16px",fontSize:18,fontWeight:800})} onClick={()=>setQty(q=>Math.min(50,q+1))} aria-label="Increase">+</button>
            </div>
          </div>
          <div style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:8, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:K.ink3 }}>Total</span>
            <span style={{ fontSize:16, fontWeight:800 }}>${total}</span>
          </div>
          <button style={G("dark",{width:"100%",padding:"11px 0",fontSize:14})} onClick={buy} disabled={load}>
            {load?<><Sp/>Processing…</>:`Buy ${qty*100} credits · $${total}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RESUME MODAL ─────────────────────────────────────────────────────────────
// Upload + store a resume. Its text feeds the AI (so emails reference real
// experience) and the file is attached to the Gmail send in production.
function ResumeModal({ resume, onSave, onClose }) {
  const [name, setName] = useState(resume?.name || "");
  const [text, setText] = useState(resume?.text || "");
  const fileRef = useRef(null);
  function onFile(e){
    const f = e.target.files && e.target.files[0]; if(!f) return;
    setName(f.name);
    if(f.name.toLowerCase().endsWith(".txt")){
      const r=new FileReader(); r.onload=()=>setText(String(r.result||"")); r.readAsText(f);
    }
    // PRODUCTION: upload the file to Supabase Storage and parse PDF/DOCX text
    // server-side to populate the text box automatically.
  }
  function save(){ onSave({ name: name||"resume.pdf", text: text.trim(), updatedAt: Date.now() }); onClose(); }
  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="rz-title">
      <div className="mo" style={{ maxWidth:520 }}>
        <div className="mhd"><h2 id="rz-title" style={{ fontWeight:700, fontSize:14 }}>Your resume</h2><button className="mcl" onClick={onClose} aria-label="Close">×</button></div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
          <p style={{ fontSize:13, color:K.ink3, lineHeight:1.6 }}>Attach a resume to send with your cold emails — and paste its text so the AI tailors each email to your real experience. Emails with a resume get far more replies.</p>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={onFile} style={{display:"none"}} />
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button style={G("ghost",{fontSize:13})} onClick={()=>fileRef.current&&fileRef.current.click()}>Choose file…</button>
            <span style={{ fontSize:12, color: name?K.grn:K.ink4, fontWeight: name?600:400 }}>{name? "📎 "+name : "No file selected"}</span>
          </div>
          <div>
            <span className="lbl">Resume text (used by the AI)</span>
            <textarea style={F({resize:"vertical",minHeight:150,fontSize:12,lineHeight:1.6,fontFamily:"inherit"})} placeholder="Paste your resume text here so the AI can reference your real experience. (PDFs/DOCX are parsed automatically on upload in production.)" value={text} onChange={e=>setText(e.target.value)} aria-label="Resume text" />
          </div>
          <button style={G("dark",{width:"100%",padding:"11px 0",fontSize:14})} onClick={save} disabled={!name&&!text.trim()}>Save resume</button>
        </div>
      </div>
    </div>
  );
}

// ─── DRAFT MODAL ──────────────────────────────────────────────────────────────
function DraftModal({ company, profile, isSent, credits, resume, canSendNow, sendBlockReason, onClose, onSend }) {
  const [draft,   setDraft]   = useState("");
  const [level,   setLevel]   = useState(3);
  const [genLevel,setGenLevel]= useState(null);  // level the current draft was generated at
  const [loading, setLoad]    = useState(false);
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [err,     setErr]     = useState("");
  const cost      = isSent ? 0 : contactCost(company);   // follow-ups free; discovered cost more
  const canAfford = credits >= cost;
  const subject   = `Internship inquiry — ${profile?.name || "student"}`;  // TODO: pass to Gmail send payload in production
  const staleDraft = draft && genLevel !== null && genLevel !== level;
  const dWarn     = draft ? deliverabilityCheck(subject, draft) : [];

  useEffect(() => { setErr(""); }, [level]);

  async function generate() {
    // Writing is always free and unlimited — no credit gate here.
    if(!profile?.name){setErr("Complete your profile first.");return;}
    setLoad(true); setErr("");
    await new Promise(r=>setTimeout(r,700+Math.random()*500));
    setDraft(buildDraft(company, profile, level, { resume: !!(resume && resume.text) }));
    setGenLevel(level);
    setLoad(false);
  }

  async function send() {
    if(!draft||sending||sent)return;
    if(!canSendNow){setErr(sendBlockReason);return;}
    if(!canAfford){setErr(`Unlocking this contact costs ${cost} credit${cost!==1?"s":""}. You have ${credits}.`);return;}
    setSending(true);
    await new Promise(r=>setTimeout(r,700));
    setSending(false); setSent(true);
    setTimeout(()=>{onSend(company.id,cost);onClose();},600);
  }

  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="draft-title">
      <div className="mo" style={{ maxWidth:640 }}>
        <div className="mhd">
          <div><h2 id="draft-title" style={{ fontWeight:700, fontSize:14 }}>{company.name}</h2><p style={{ fontSize:12, color:K.ink3, marginTop:2 }}>{company.cname?`${company.cname} · `:""}<span style={{ color:K.bl }}>{company.email}</span></p></div>
          <button className="mcl" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
          {isSent&&<InfoBox color="amber" icon="⚠">Already contacted. Sending again will appear as a follow-up.</InfoBox>}
          <div style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:8, padding:"10px 14px", display:"flex", gap:16, flexWrap:"wrap" }}>
            {[["Industry",company.industry||"—"],["Category",company.type||"—"],["Location",[company.city,company.state].filter(Boolean).join(", ")||"—"]].map(([k,v])=>(
              <div key={k}><div style={{ fontSize:10, fontWeight:600, color:K.ink4, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div><div style={{ fontSize:12, color:K.ink2, fontWeight:500, marginTop:1 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:8, padding:"14px 14px 12px" }}>
            <PersonalizationSlider value={level} onChange={setLevel} />
          </div>
          <div style={{ border:`1px solid ${K.b}`, borderRadius:8, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", padding:"7px 12px", borderBottom:`1px solid ${K.bs}`, gap:10 }}><span style={{ fontSize:11, fontWeight:600, color:K.ink4, minWidth:50 }}>To</span><span style={{ fontSize:13, color:K.bl }}>{company.email}</span></div>
            {company.email2&&<div style={{ display:"flex", alignItems:"center", padding:"7px 12px", borderBottom:`1px solid ${K.bs}`, gap:10 }}><span style={{ fontSize:11, fontWeight:600, color:K.ink4, minWidth:50 }}>CC</span><span style={{ fontSize:13, color:K.ink3 }}>{company.email2}</span></div>}
            <div style={{ display:"flex", alignItems:"center", padding:"7px 12px", gap:10 }}><span style={{ fontSize:11, fontWeight:600, color:K.ink4, minWidth:50 }}>Subject</span><span style={{ fontSize:13, color:K.ink2 }}>{subject}</span></div>
            {resume && resume.text
              ? <div style={{ display:"flex", alignItems:"center", padding:"7px 12px", gap:10, borderTop:`1px solid ${K.bs}` }}><span style={{ fontSize:11, fontWeight:600, color:K.ink4, minWidth:50 }}>Attach</span><span style={{ fontSize:12, color:K.grn, fontWeight:600 }}>📎 {resume.name||"resume.pdf"}</span></div>
              : <div style={{ display:"flex", alignItems:"center", padding:"7px 12px", gap:10, borderTop:`1px solid ${K.bs}` }}><span style={{ fontSize:11, fontWeight:600, color:K.ink4, minWidth:50 }}>Attach</span><span style={{ fontSize:12, color:K.ink4 }}>No resume — adding one in Settings boosts replies</span></div>}
          </div>
          <div style={{ position:"relative" }}>
            <textarea style={F({resize:"vertical",minHeight:210,lineHeight:1.8,fontFamily:"inherit",fontSize:13,padding:"13px 14px"})} placeholder="Click Generate to create a personalized draft, or write your own." value={draft} onChange={e=>setDraft(e.target.value)} disabled={loading} aria-label="Email draft" />
            {loading&&<div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,.9)", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:7, gap:8, color:K.bl, fontSize:13, fontWeight:500 }} aria-live="polite"><SpB/>Drafting with AI…</div>}
            {draft&&<div style={{ position:"absolute", bottom:8, right:10, fontSize:10, color:K.ink4 }}>{draft.length}ch</div>}
          </div>
          {err&&<InfoBox color="red" icon="⚠">{err}</InfoBox>}
          {staleDraft&&<InfoBox color="amber" icon="↻">This draft was written for level {genLevel}. You're now on level {level} — regenerate to match, or send as-is.</InfoBox>}
          {draft&&(dWarn.length>0
            ? <InfoBox color="amber" icon="🛡"><strong>Deliverability ({dWarn.length}):</strong> these can trip spam filters or lower replies:<span style={{display:"block",marginTop:4}}>{dWarn.map((x,i)=><span key={i} style={{display:"block",fontSize:12,marginTop:2}}>• {x}</span>)}</span></InfoBox>
            : <InfoBox color="green" icon="✓">Deliverability looks good — personal, concise, with a clear ask.</InfoBox>)}
          {!canSendNow&&<InfoBox color={sendBlockReason.includes("paused")?"red":"amber"} icon="🛡">{sendBlockReason}</InfoBox>}
          {isSent
            ? <InfoBox color="green" icon="✓">You've already unlocked this contact — this follow-up and any future emails to them are free.</InfoBox>
            : <InfoBox color="neutral" icon="🔓">{company.discovered
                ? <>This is an AI-discovered contact — sending unlocks it for <strong>{DISCOVER_COST} credits</strong> (covers the discovery). </>
                : <>Sending unlocks this contact for <strong>{UNLOCK_COST} credit</strong>. </>}
                After that, every email and follow-up to them is free. Writing and regenerating are always free.</InfoBox>}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
            <button style={G("ghost",{fontSize:12})} onClick={generate} disabled={loading}>{loading?<><SpB/>Generating…</>:draft?"✦ Regenerate":"✦ Generate draft"}</button>
            <div style={{ display:"flex", gap:8 }}>
              <button style={G("ghost",{fontSize:12})} onClick={onClose}>Cancel</button>
              <button className="btn-lift" style={G(sent?"green":"dark",{fontSize:13,minWidth:140})} onClick={send} disabled={!draft||sending||sent||!canAfford||!canSendNow}>
                {sent?"✓ Sent":sending?<><Sp/>Sending…</>:isSent?"Send follow-up →":"Send via Gmail →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BULK MODAL ───────────────────────────────────────────────────────────────
function BulkModal({ companies, profile, sentList, credits, remainingSends, sendLimit, bouncePaused, sendBlockReason, onClose, onDone }) {
  const [stage, setStage] = useState("confirm");
  const [log,   setLog]   = useState([]);
  const [pct,   setPct]   = useState(0);
  const [level, setLevel] = useState(2);
  const eligibleAll = useMemo(()=>companies.filter(c=>!sentList.includes(c.id)),[companies,sentList]);
  const skipped   = companies.length-eligibleAll.length;
  const cap       = bouncePaused ? 0 : remainingSends;
  const eligible  = eligibleAll.slice(0, cap);   // safe to send today (warm-up cap)
  const queued    = eligibleAll.slice(cap);      // held — send over following days
  const totalCost = eligible.reduce((s,c)=>s+contactCost(c),0);   // discovered contacts cost more
  const discCount = eligible.filter(c=>c.discovered).length;
  const canAfford = credits>=totalCost;
  const canRun    = eligible.length>0 && canAfford && !bouncePaused;

  async function run(){
    setStage("running");
    const results=[];
    for(let i=0;i<eligible.length;i++){
      const c=eligible[i];
      setLog(l=>[...l,{id:c.id,name:c.dba,st:"drafting"}]);
      // PRODUCTION: instead of a tight loop, enqueue these in Supabase and let a
      // Vercel cron release them at a human pace (randomized gaps, business hours)
      // so the burst never looks like a spam blast to Gmail.
      await new Promise(r=>setTimeout(r,300+Math.random()*200));
      setLog(l=>l.map(x=>x.id===c.id?{...x,st:"sending"}:x));
      await new Promise(r=>setTimeout(r,200));
      results.push({id:c.id,cost:contactCost(c)});
      setLog(l=>l.map(x=>x.id===c.id?{...x,st:"sent"}:x));
      setPct(Math.round(((i+1)/eligible.length)*100));
    }
    setStage("done");
    onDone(results);
  }
  const sc=s=>s==="sent"?K.grn:s==="sending"?K.bl:K.ink4;
  const si=s=>s==="sent"?"✓":s==="sending"?"⟳":"…";

  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="bulk-title">
      <div className="mo" style={{ maxWidth:460 }}>
        <div className="mhd">
          <h2 id="bulk-title" style={{ fontWeight:700, fontSize:14 }}>
            {stage==="done"?`Complete — ${log.filter(x=>x.st==="sent").length} sent`:stage==="running"?"Sending…":`Bulk send — ${eligible.length} companies`}
          </h2>
          {stage!=="running"&&<button className="mcl" onClick={onClose} aria-label="Close">×</button>}
        </div>
        <div style={{ padding:20 }}>
          {stage==="confirm"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <p style={{ fontSize:13, color:K.ink3, lineHeight:1.65 }}>AI will draft a personalized email for each selected company and send from your Gmail. Each is a new contact, so this unlocks them — every future email to them is free.</p>
              {skipped>0&&<InfoBox color="amber" icon="⚠">{skipped} company{skipped!==1?"s":""} skipped — already unlocked (you can email them free anytime).</InfoBox>}
              {bouncePaused
                ? <InfoBox color="red" icon="🛡">{sendBlockReason}</InfoBox>
                : queued.length>0&&<InfoBox color="amber" icon="🛡">To protect your Gmail from spam flags, <strong>{eligible.length} will send today</strong> (your warm-up limit is {sendLimit}/day). The other <strong>{queued.length}</strong> are held — send them over the next few days.</InfoBox>}
              <div style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:8, padding:"14px 14px 12px" }}>
                <PersonalizationSlider value={level} onChange={setLevel} />
              </div>
              <div style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:8, padding:"11px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:K.ink3 }}>{eligible.length} sending now{discCount>0?` (${discCount} AI-discovered)`:""}</span>
                <span style={{ fontSize:15, fontWeight:800, color:canAfford?K.ink:K.red }}>{totalCost} credit{totalCost!==1?"s":""}{!canAfford&&" (insufficient)"}</span>
              </div>
              {!canAfford&&<InfoBox color="red" icon="⚠">You have {credits} credits. This batch needs {totalCost}. Reduce selection or buy top-up credits.</InfoBox>}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button style={G("ghost")} onClick={onClose}>Cancel</button>
                <button style={G("dark")} onClick={run} disabled={!canRun}>{cap===0?"Daily limit reached":`Send ${eligible.length} emails →`}</button>
              </div>
            </div>
          )}
          {(stage==="running"||stage==="done")&&(
            <>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:K.ink3, marginBottom:5 }}>
                  <span aria-live="polite">{stage==="done"?"Complete":"Sending…"}</span>
                  <span>{log.filter(x=>x.st==="sent").length}/{eligible.length}</span>
                </div>
                <div className="pb"><div className="pf" style={{ width:pct+"%", background:stage==="done"?K.grn:K.ink }} /></div>
              </div>
              <div style={{ maxHeight:260, overflowY:"auto", display:"flex", flexDirection:"column", gap:3 }} role="log" aria-live="polite">
                {log.map(e=>(
                  <div key={e.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", background:e.st==="sent"?K.grnT:K.surf, borderRadius:6, transition:"background .2s" }}>
                    <span style={{ fontSize:12, color:K.ink2 }}>{e.name}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:sc(e.st) }}>{si(e.st)}</span>
                  </div>
                ))}
              </div>
              {stage==="done"&&<button style={G("dark",{width:"100%",padding:"10px 0",marginTop:16})} onClick={onClose}>Done →</button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPANY DETAIL ───────────────────────────────────────────────────────────
function CompanyDetail({ company, score, isSent, lists, currentList, onSaveList, onClose, onDraft }) {
  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="mo" style={{ maxWidth:500 }}>
        <div className="mhd">
          <div><h2 id="detail-title" style={{ fontWeight:700, fontSize:15 }}>{company.name}</h2><p style={{ fontSize:12, color:K.ink3, marginTop:2 }}>{[company.industry,[company.city,company.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}</p></div>
          <button className="mcl" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {score!=null && <span className="chip" style={{ background:fitBg(score), borderColor:fitBd(score), color:fitC(score) }}>{score}% interest match</span>}
            {isSent&&<Chip color="green">✓ Contacted</Chip>}
            {company.verified&&<Chip color="neutral">Curated</Chip>}
            {company.discovered&&<Chip color="blue">AI-discovered</Chip>}
          </div>
          <dl style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:K.b, borderRadius:9, overflow:"hidden" }}>
            {[["Industry",company.industry||"—"],["Category",company.type||"—"],["Location",[company.city,company.state].filter(Boolean).join(", ")||"—"],["Contact email","Recruiting inbox"]].map(([k,v])=>(
              <div key={k} style={{ background:"#fff", padding:"10px 14px" }}>
                <dt style={{ fontSize:10, fontWeight:600, color:K.ink4, textTransform:"uppercase", letterSpacing:".05em", marginBottom:2 }}>{k}</dt>
                <dd style={{ fontSize:13, color:K.ink2 }}>{v}</dd>
              </div>
            ))}
          </dl>
          {company.knownFor&&<div><p className="lbl">Known for</p><p style={{ fontSize:13, color:K.ink2, lineHeight:1.72 }}>{company.knownFor}</p></div>}
          {company.quote&&<blockquote style={{ borderLeft:`3px solid ${K.b}`, paddingLeft:14, margin:0 }}><p style={{ fontSize:13, color:K.ink3, fontStyle:"italic", lineHeight:1.72 }}>"{company.quote}"</p></blockquote>}
          <div style={{ background:K.surf, border:`1px solid ${K.b}`, borderRadius:8, padding:"12px 14px" }}>
            <p className="lbl">Contact</p>
            {company.cname
              ? <p style={{ fontSize:13, fontWeight:500 }}>{company.cname}{company.ctitle&&<span style={{ color:K.ink4, fontWeight:400 }}> · {company.ctitle}</span>}</p>
              : <p style={{ fontSize:13, fontWeight:500, color:K.ink3 }}>Careers / recruiting inbox</p>}
            <p style={{ fontSize:13, color:K.bl, marginTop:3 }}>{company.email}</p>
            {company.email2&&<p style={{ fontSize:12, color:K.ink3, marginTop:2 }}>{company.email2}</p>}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap", borderTop:`1px solid ${K.bs}`, paddingTop:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:K.ink4 }}>List</span>
              <select value={currentList||""} onChange={e=>onSaveList(e.target.value)} style={F({padding:"5px 8px",fontSize:12,width:"auto",minWidth:120})} aria-label="Save to list">
                <option value="">Not saved</option>
                {(lists||[]).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button style={G("ghost")} onClick={onClose}>Close</button>
              <button className="btn-lift" style={G("dark")} onClick={()=>{onClose();onDraft();}}>{isSent?"Send follow-up →":"Draft & send →"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE EDIT MODAL ───────────────────────────────────────────────────────
function ProfileEditModal({ profile, onSave, onClose }) {
  const [p, setP] = useState({ ...profile });
  const set = (k,v) => setP(prev=>({...prev,[k]:v}));
  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="pe-title">
      <div className="mo" style={{ maxWidth:440 }}>
        <div className="mhd"><h2 id="pe-title" style={{ fontWeight:700, fontSize:15 }}>Edit profile</h2><button className="mcl" onClick={onClose} aria-label="Close">×</button></div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label className="lbl" htmlFor="ep-name">Name</label><input id="ep-name" style={F()} value={p.name||""} onChange={e=>set("name",e.target.value)}/></div>
            <div><label className="lbl" htmlFor="ep-school">School / Institution</label><input id="ep-school" style={F()} value={p.school||""} onChange={e=>set("school",e.target.value)}/></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label className="lbl" htmlFor="ep-major">Field of study</label><input id="ep-major" style={F()} value={p.major||""} onChange={e=>set("major",e.target.value)}/></div>
            <div><label className="lbl" htmlFor="ep-edu">Level</label><select id="ep-edu" style={F()} value={p.eduLevel||""} onChange={e=>set("eduLevel",e.target.value)}>{EDU_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
          </div>
          <div><label className="lbl" htmlFor="ep-int">Industries of interest</label><input id="ep-int" style={F()} value={p.interest||""} onChange={e=>set("interest",e.target.value)} placeholder="Tech, design, media…"/></div>
          <div><label className="lbl" htmlFor="ep-exp">Background (1–2 sentences)</label><textarea id="ep-exp" style={F({resize:"vertical",minHeight:80,fontFamily:"inherit",lineHeight:1.7})} value={p.experience||""} onChange={e=>set("experience",e.target.value)}/></div>
          <hr style={{ border:"none", borderTop:`1px solid ${K.b}` }} />
          <div>
            <span className="lbl">Gmail connection</span>
            {ss.get(GT_KEY) ? (
              <div style={{ border:`1px solid ${K.grnB}`, borderRadius:7, padding:"11px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", background:K.grnT }}>
                <span style={{ fontSize:13, color:K.grn, fontWeight:500 }}>✓ Gmail connected</span>
                <GmailConnectButton onSuccess={token=>{ ss.set(GT_KEY,token); }} />
              </div>
            ) : (
              <GmailConnectButton onSuccess={token=>{ ss.set(GT_KEY,token); }} />
            )}
          </div>
          <button style={G("dark",{padding:"10px 0",width:"100%",fontSize:14})} onClick={()=>{
            if(p.gmailToken&&p.gmailToken!=="skip"){ss.set(GT_KEY,p.gmailToken);}
            db.set(SK.profile,stripToken(p));
            onSave(p);onClose();
          }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── DEV: firm discovery simulator ────────────────────────────────────────────
// Stand-in for the /api/discover-firms endpoint during development. Generates
// plausible firm records — including a role-based email AND a senior named
// contact with a confidence score — so the UI is fully testable offline.
// DELETE once the real Gemini-grounding + Supabase endpoint is wired up.
function simulateDiscovery(query) {
  const q = query.toLowerCase();
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
  const cities = [["New York","NY"],["San Francisco","CA"],["Austin","TX"],["Boston","MA"],["Chicago","IL"],["Seattle","WA"],["Los Angeles","CA"],["Denver","CO"]];
  let industry = "Tech / Software";
  if (/financ|fintech|bank|invest|capital|vc|venture|equity/.test(q)) industry = "Finance / Fintech";
  else if (/health|bio|med|pharma/.test(q))                          industry = "Healthcare / Biotech";
  else if (/market|advertis|brand|agency/.test(q))                   industry = "Marketing / Advertising";
  else if (/media|news|editor|content|publish/.test(q))              industry = "Media / Editorial";
  else if (/design|creativ|product/.test(q))                         industry = "Design / Creative";
  else if (/nonprofit|ngo|charity|social/.test(q))                   industry = "Nonprofit / Social Impact";
  else if (/law|legal|attorney/.test(q))                             industry = "Law / Legal";
  else if (/ai|ml|machine learning|research/.test(q))                industry = "AI / Research";

  const stems = ["Northwind","Lattice","Beacon","Vantage","Cobalt","Meridian","Halcyon","Aperture","Kestrel","Summit","Onyx","Verda","Polaris","Marlin","Cedar"];
  const tails = ["Labs","Partners","Group","Capital","Studio","Works","Collective","Technologies","Ventures","Co"];
  const firstNames = ["Sarah","Michael","Priya","David","Elena","James","Aisha","Daniel","Maya","Chris","Nina","Omar","Rachel","Tom","Lena"];
  const lastNames  = ["Chen","Patel","Rodriguez","Kim","Okafor","Nguyen","Walsh","Garcia","Cohen","Singh","Brooks","Hassan","Mueller","Park","Reyes"];
  const seniorRoles = ["Head of Talent","Director of University Recruiting","VP of People","Recruiting Lead","Head of People","Talent Partner","Chief of Staff","Founder"];
  const roleMailbox = ["careers","recruiting","talent","jobs","internships"];
  const n = 3 + Math.floor(Math.random()*3); // 3–5 firms
  const out = [];
  const baseId = 100000 + Math.floor(Math.random()*800000);
  for (let i=0;i<n;i++){
    const [city,state] = pick(cities);
    const dba = `${pick(stems)} ${pick(tails)}`;
    const domain = dba.toLowerCase().replace(/[^a-z]/g,"") + ".com";
    const size = pick([12,28,45,80,120,260,500,900]);
    const remote = Math.random() > 0.4;
    const paid = Math.random() > 0.25;
    // Senior named contact (what web-search extraction surfaces for individuals)
    const fn = pick(firstNames), ln = pick(lastNames);
    const cname = `${fn} ${ln}`;
    const ctitle = pick(seniorRoles);
    const personalEmail = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
    out.push({
      id: baseId + i,
      dba,
      name: `${dba} Inc.`,
      city, state, industry,
      size,
      type: size < 100 ? "Startup" : size < 600 ? "Established" : "Public",
      remote,
      email: `${pick(roleMailbox)}@${domain}`,   // role-based (not personal data — safe default)
      cname, ctitle,
      email2: personalEmail,                      // senior individual (personal data — see notes)
      emailConfidence: null,   // we don't fabricate a confidence number
      source: "discovered",
      intern: Math.random() > 0.3,
      ugrad: true,
      compPaid: paid,
      knownFor: `${dba} works in ${industry.split("/")[0].trim().toLowerCase()}. Found via search for "${query}".`,
      quote: "",
      discovered: true,   // flag so the UI can mark AI-found firms
    });
  }
  return out;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [appView,  setAppView]  = useState(() => {
    const u = db.get(SK.user, null);
    const p = db.get(SK.profile, null);
    if (u && p) return "app";
    if (u && !p) return "onboarding";
    return "landing";
  });
  const [user,     setUser]     = useState(() => db.get(SK.user,    null));
  const [profile,  setProfile]  = useState(() => db.get(SK.profile, null));
  const [planId,   setPlanId]   = useState(() => db.get(SK.plan,    "free"));
  const [credits,  setCredits]  = useState(() => initCredits(db.get(SK.plan,"free")));
  const [sentList, setSent]     = useState(() => db.get(SK.sent,    []));
  const [tab,      setTab]      = useState("dashboard");
  const [pipeFilter, setPipeFilter] = useState("all");   // pipeline status filter
  const [pipeList,   setPipeList]   = useState("all");   // pipeline list filter
  const [selected, setSel]      = useState([]);
  const [sortCol,  setSortCol]  = useState("score");
  const [sortDir,  setSortDir]  = useState("desc");
  const [fInd,     setFInd]     = useState("All");
  const [fType,    setFType]    = useState("All");
  const [fAccess,  setFAccess]  = useState("All");
  const [fPaid,    setFPaid]    = useState("All");
  const [fIntern,  setFIntern]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [shown,    setShown]    = useState(50);   // table pagination — render in pages
  const [modal,    setModal]    = useState(null);
  const [focus,    setFocus]    = useState(null);
  const [toast,    setToast]    = useState(null);
  // AI firm discovery — firms found via the discovery search, merged with the
  // built-in database. Persisted locally until the Supabase `firms` table is live.
  const [discovered, setDiscovered] = useState(() => db.get("fi_discovered", []));
  const [discovering, setDiscovering] = useState(false);
  const [discoverErr, setDiscoverErr] = useState("");
  // Monthly AI-discovery usage (Pro cap). Resets with the billing month.
  const [discoverUsed, setDiscoverUsed] = useState(() => {
    const cycle = new Date().toISOString().slice(0,7);
    const rec = db.get(SK.search, { cycle:"", n:0 });
    return rec.cycle === cycle ? rec.n : 0;
  });
  // Outreach tracking / pipeline: { [companyId]: { status, sentAt, repliedAt, followUpAt } }
  const [tracking, setTracking] = useState(() => db.get(SK.track, {}));
  // Target lists + which list each company is saved to.
  const [lists,  setLists]  = useState(() => db.get(SK.lists, DEFAULT_LISTS));
  const [listOf, setListOf] = useState(() => db.get(SK.listOf, {}));
  // Resume used to attach + personalize AI emails: { name, text, updatedAt }
  const [resume, setResume] = useState(() => db.get(SK.resume, null));
  // Email account type drives deliverability send caps (Workspace tolerates more).
  const [accountType, setAccountType] = useState(() => db.get("fi_acct", "gmail"));
  // Tracks Gmail connection (token lives in sessionStorage, which isn't reactive).
  // Re-synced whenever the profile-edit modal closes or onboarding completes.
  const [gmailConnected, setGmailConnected] = useState(() => !!ss.get(GT_KEY));

  useEffect(() => db.set(SK.sent,    sentList),  [sentList]);
  useEffect(() => db.set(SK.credits, credits),   [credits]);
  useEffect(() => db.set(SK.plan,    planId),    [planId]);
  useEffect(() => db.set("fi_discovered", discovered), [discovered]);
  useEffect(() => db.set(SK.track,  tracking), [tracking]);
  useEffect(() => db.set(SK.lists,  lists),    [lists]);
  useEffect(() => db.set(SK.listOf, listOf),   [listOf]);
  useEffect(() => { if(resume) db.set(SK.resume, resume); }, [resume]);
  useEffect(() => db.set("fi_acct", accountType), [accountType]);
  useEffect(() => { if(user) db.set(SK.user, stripToken(user)); }, [user]);

  // ── AI FIRM DISCOVERY ──────────────────────────────────────────────────────
  // Takes a natural-language query, finds matching firms + contact emails, and
  // adds new ones to the database.
  //
  // PRODUCTION (see api/discover-firms.js): the browser POSTs the query; all keys
  // and work stay server-side. The pipeline uses a Gemini model with Google Search
  // grounding (native web search — no separate search API), which:
  //   1. Reads the query, searches the live web via Google Search grounding, and
  //      returns real firms matching the criteria.
  //   2. Extracts a role-based email (careers@) plus, when present, one senior
  //      contact (name/title/email), with grounding citations.
  //   3. New firms are upserted into the Supabase `firms` table (deduped by
  //      domain) and returned to the client.
  async function discoverFirms(query) {
    const q = query.trim();
    if (!q || discovering) return;
    // AI discovery is a Pro feature (it carries a real grounded-search cost).
    if (planId !== "pro") {
      setDiscoverErr("AI firm discovery is a Pro feature. Upgrade to find firms beyond our database.");
      track("discover_blocked_free");
      setTimeout(()=>setModal("paywall"), 400);
      return;
    }
    // Monthly discovery cap — each grounded search is billed per query, so cap
    // usage to protect margin. Resets with the billing month.
    if (discoverUsed >= DISCOVERY_CAP) {
      setDiscoverErr(`You've used all ${DISCOVERY_CAP} AI discoveries this month. They reset at the start of next month.`);
      track("discover_capped");
      return;
    }
    track("discover", { query: q.slice(0,60) });
    // Count the search now (grounding bills whether or not it returns new firms).
    setDiscoverUsed(u => {
      const n = u + 1;
      db.set(SK.search, { cycle: new Date().toISOString().slice(0,7), n });
      return n;
    });
    setDiscovering(true); setDiscoverErr("");
    try {
      // PRODUCTION:
      //   const res = await fetch("/api/discover-firms", {
      //     method: "POST", headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ query: q }),
      //   });
      //   if (!res.ok) throw new Error("Discovery failed");
      //   const { firms } = await res.json();    // already inserted to Supabase server-side
      // ── DEV SIMULATION (remove once the endpoint is live) ──
      await new Promise(r => setTimeout(r, 1400));
      const firms = simulateDiscovery(q);
      // Dedupe against what we already have (built-in + previously discovered)
      const have = new Set(allFirms.map(c => c.dba.toLowerCase()));
      const fresh = firms.filter(f => !have.has(f.dba.toLowerCase()));
      if (fresh.length) {
        setDiscovered(prev => [...prev, ...fresh]);
        msg(`✓ Added ${fresh.length} new firm${fresh.length>1?"s":""} to your database`);
      } else if (firms.length) {
        setDiscoverErr("Those firms are already in your database — try more specific terms.");
      } else {
        setDiscoverErr(`No firms found for "${q}". Try different terms.`);
      }
    } catch (e) {
      setDiscoverErr("Couldn't reach the discovery service. Try again.");
    } finally {
      setDiscovering(false);
    }
  }

  const plan     = PLANS[planId] || PLANS.free;
  const canSend  = credits > 0;
  const msg      = useCallback(m => setToast(m), []);

  const allFirms = useMemo(() => [...COMPANIES, ...discovered], [discovered]);

  const scores = useMemo(() => {
    const m = {};
    allFirms.forEach(c => { m[c.id] = calcFit(c, profile); });
    return m;
  }, [profile, allFirms]);

  // Filter options derived from the ACTUAL loaded data (so they always match).
  // Remote/paid/intern pills only appear if the data actually varies on them.
  const facets = useMemo(() => {
    const ind = {}, typ = {};
    let remoteT=false, remoteF=false, paidT=false, paidF=false, internT=false, internF=false;
    allFirms.forEach(c => {
      const i = c.industry || "Other"; ind[i] = (ind[i]||0)+1;
      if (c.type) typ[c.type] = (typ[c.type]||0)+1;
      if (c.remote) remoteT=true; else remoteF=true;
      if (c.compPaid) paidT=true; else paidF=true;
      if (c.intern) internT=true; else internF=true;
    });
    const top = (o, n) => Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k])=>k);
    return {
      industries: top(ind, 7),
      types:      top(typ, 6),
      showRemote: remoteT && remoteF,
      showPaid:   paidT && paidF,
      showIntern: internT && internF,
    };
  }, [allFirms]);

  function onSort(col) {
    if(sortCol===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  const visible = useMemo(() => {
    let list = allFirms.map(c=>({...c,score:scores[c.id]}));
    if(fInd!=="All")          list=list.filter(c=>(c.industry||"").includes(fInd));
    if(fType!=="All")         list=list.filter(c=>c.type===fType);
    if(fAccess==="Remote")    list=list.filter(c=>c.remote);
    if(fAccess==="On-site")   list=list.filter(c=>!c.remote);
    if(fPaid==="Paid")        list=list.filter(c=>c.compPaid);
    if(fPaid==="Unpaid")      list=list.filter(c=>!c.compPaid);
    if(fIntern)               list=list.filter(c=>c.intern);
    if(search.trim()){
      const q=search.toLowerCase();
      list=list.filter(c=>(c.dba||"").toLowerCase().includes(q)||(c.name||"").toLowerCase().includes(q)||(c.city||"").toLowerCase().includes(q)||(c.industry||"").toLowerCase().includes(q)||(c.cname||"").toLowerCase().includes(q));
    }
    list.sort((a,b)=>{
      const av=sortCol==="score"?a.score:(a[sortCol]??0);
      const bv=sortCol==="score"?b.score:(b[sortCol]??0);
      if(typeof av==="string") return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av);
      return sortDir==="asc"?av-bv:bv-av;
    });
    return list;
  }, [fInd,fType,fAccess,fPaid,fIntern,search,sortCol,sortDir,scores,allFirms]);

  // Reset pagination whenever the filtered set changes
  useEffect(() => { setShown(50); }, [fInd,fType,fAccess,fPaid,fIntern,search,sortCol,sortDir]);
  const shownRows = visible.slice(0, shown);

  const allSel  = shownRows.length>0&&shownRows.every(c=>selected.includes(c.id));
  const someSel = shownRows.some(c=>selected.includes(c.id))&&!allSel;
  const toggleAll = ()=>setSel(allSel?selected.filter(id=>!shownRows.some(c=>c.id===id)):[...new Set([...selected,...shownRows.map(c=>c.id)])]);
  const toggleOne = id=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  function aiAutoSelect(){
    const top=[...visible].filter(c=>!sentList.includes(c.id)).sort((a,b)=>b.score-a.score).slice(0,10).map(c=>c.id);
    setSel(top);
    msg(`✓ AI selected ${top.length} best-fit companies`);
  }

  function openDraft(company){
    if(!canSend){setModal("paywall");return;}
    setFocus(company);setModal("draft");
  }

  function trackContact(companyId){
    const now = Date.now();
    setTracking(t => t[companyId] ? t : {
      ...t,
      [companyId]: { status:"contacted", sentAt:now, repliedAt:null, followUpAt: now + FOLLOWUP_DAYS*864e5 }
    });
  }
  function setStatus(companyId, status){
    setTracking(t => ({ ...t, [companyId]: {
      ...(t[companyId]||{status:"contacted",sentAt:Date.now(),followUpAt:null}),
      status,
      repliedAt: (status!=="contacted" && !(t[companyId]?.repliedAt)) ? Date.now() : (t[companyId]?.repliedAt||null),
      followUpAt: status==="contacted" ? (t[companyId]?.followUpAt || Date.now()+FOLLOWUP_DAYS*864e5) : null,
    }}));
    track("status_change", { status });
  }
  function saveToList(companyId, listId){
    setListOf(m => { const n={...m}; if(listId) n[companyId]=listId; else delete n[companyId]; return n; });
    if(listId) track("list_add", { listId });
  }
  function addList(name){
    const id = "l"+Date.now().toString(36);
    const color = ["#7c3aed","#1a56db","#15803d","#b45309","#be185d","#0891b2"][lists.length%6];
    setLists(ls => [...ls, { id, name: name.trim()||"New list", color }]);
    track("list_create");
    return id;
  }

  function recordSend(companyId, cost){
    setSent(s=>[...new Set([...s,companyId])]);
    trackContact(companyId);
    setCredits(c=>Math.max(0,c-cost));
    track("email_sent", { cost, plan: planId });
    msg(`✓ Sent to ${allFirms.find(c=>c.id===companyId)?.dba}`);
    if(credits-cost<=0) setTimeout(()=>setModal("paywall"),800);
  }

  function recordBulkSend(results){
    const ids=results.map(r=>r.id);
    const total=results.reduce((a,r)=>a+r.cost,0);
    setSent(s=>[...new Set([...s,...ids])]);
    ids.forEach(trackContact);
    setCredits(c=>Math.max(0,c-total));
    setSel([]);
    track("bulk_sent", { count: ids.length, total });
    msg(`✓ ${ids.length} emails sent · ${total} credits used`);
    setTab("pipeline");
  }

  function handleSignIn(u){
    if(u.gmailToken&&u.gmailToken!=="skip"){ ss.set(GT_KEY,u.gmailToken); }
    const safeUser = stripToken(u);
    setUser(safeUser); db.set(SK.user, safeUser);
    // If profile already exists (returning user) go straight to app, else onboarding
    const existingProfile = db.get(SK.profile, null);
    if(existingProfile){ setProfile(existingProfile); setAppView("app"); }
    else { setAppView("onboarding"); }
  }
  function handleOnboardingDone(p){
    if(p.gmailToken&&p.gmailToken!=="skip"){ ss.set(GT_KEY,p.gmailToken); setGmailConnected(true); }
    const safeProfile = stripToken(p);
    setProfile(safeProfile); db.set(SK.profile, safeProfile); setAppView("app");
  }
  function handleCheckoutSuccess(){ setPlanId("pro");setCredits(1000);db.set(SK.plan,"pro");db.set(SK.credits,1000);db.set(SK.cycle,new Date().toISOString().slice(0,7));track("upgrade");msg("✓ Pro activated — 1,000 monthly contacts unlocked");setAppView("app"); }
  function signOut(){
    [SK.user,SK.profile,SK.sent,SK.credits,SK.plan,SK.cycle,SK.daily,SK.track,SK.lists,SK.listOf,SK.resume,SK.search,"fi_acct"].forEach(k=>db.del(k));
    ss.del(GT_KEY); setGmailConnected(false);
    setUser(null);setProfile(null);setSent([]);setPlanId("free");setCredits(5);
    setTracking({});setLists(DEFAULT_LISTS);setListOf({});setResume(null);setDiscoverUsed(0);setAccountType("gmail");setTab("dashboard");
    setAppView("landing");
  }

  // ── ROUTING ────────────────────────────────────────────────────────────────
  if(appView==="landing") return <><style>{CSS}</style><div className="page-in"><Landing
    onGetStarted={()=>{ if(user&&profile) setAppView("app"); else setAppView("onboarding"); }}
    onAuthSuccess={(u, tab)=>{
      // tab is "signin" or "signup" — both go through handleSignIn
      // PRODUCTION: for "signup", Supabase creates the account; for "signin" it logs in.
      // Both cases return a user object and we redirect appropriately.
      handleSignIn(u);
    }}
  /></div></>;
  if(appView==="onboarding") return <><style>{CSS}</style><div className="page-in"><Onboarding user={user} onDone={handleOnboardingDone}/></div></>;
  if(appView==="checkout") return <><style>{CSS}</style><div className="page-in"><CheckoutPage onBack={()=>setAppView("app")} onSuccess={handleCheckoutSuccess}/></div></>;

  // ── APP TABS ───────────────────────────────────────────────────────────────
  const contactedList = allFirms.filter(c=>sentList.includes(c.id));
  const lowCredits    = credits<=2;

  // Pipeline / outcome stats derived from tracking. (Plain computation — this runs
  // after early returns, so it must not be a hook.)
  const stats = (() => {
    const ids = Object.keys(tracking);
    const repliedSet = new Set(["replied","interview","offer"]);
    const replied = ids.filter(id=>repliedSet.has(tracking[id]?.status)).length;
    const interviews = ids.filter(id=>["interview","offer"].includes(tracking[id]?.status)).length;
    const offers = ids.filter(id=>tracking[id]?.status==="offer").length;
    const contacted = ids.length;
    const now = Date.now();
    const dueIds = ids.filter(id => tracking[id]?.status==="contacted" && tracking[id]?.followUpAt && tracking[id].followUpAt<=now);
    return { contacted, replied, interviews, offers, dueIds,
             replyRate: contacted? Math.round(replied/contacted*100):0 };
  })();
  const followUpsDue = stats.dueIds.map(id=>allFirms.find(c=>c.id===id)).filter(Boolean);

  // ── DELIVERABILITY GATING ──────────────────────────────────────────────────
  // Protects the user's own inbox reputation: a warm-up daily cap, plus an
  // auto-pause if their bounce rate climbs. (Plain consts — after early returns.)
  const todayStart = (() => { const d=new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
  const firstSendAt = (() => { const ts=Object.values(tracking).map(t=>t.sentAt).filter(Boolean); return ts.length?Math.min(...ts):null; })();
  const sentToday    = Object.values(tracking).filter(t=>t.sentAt && t.sentAt>=todayStart).length;
  const bouncedCount = Object.values(tracking).filter(t=>t.bounced).length;
  const bounceRate   = stats.contacted ? bouncedCount/stats.contacted : 0;
  const sendLimit    = dailySendLimit(accountType, firstSendAt);
  const bouncePaused = bounceRate > BOUNCE_PAUSE && stats.contacted >= BOUNCE_MIN_SAMPLE;
  const remainingSends = Math.max(0, sendLimit - sentToday);
  const canSendNow   = remainingSends > 0 && !bouncePaused;
  const sendBlockReason = bouncePaused
    ? `Sending paused — your bounce rate (${Math.round(bounceRate*100)}%) is too high. Stop and clean your list, or you'll get your Gmail flagged.`
    : remainingSends<=0
      ? `You've hit today's safe limit of ${sendLimit} new emails. This keeps your Gmail from being flagged as spam. Resets tomorrow.`
      : "";

  // ── DASHBOARD (home) ───────────────────────────────────────────────────────
  const DashTab = (() => {
    const Stat = ({label,value,sub,accent}) => (
      <div style={{ flex:"1 1 140px", border:`1px solid ${K.b}`, borderRadius:10, padding:"14px 16px", background:"#fff" }}>
        <div style={{ fontSize:26, fontWeight:800, letterSpacing:-.5, color:accent||K.ink }}>{value}</div>
        <div style={{ fontSize:12, color:K.ink3, marginTop:2 }}>{label}</div>
        {sub&&<div style={{ fontSize:11, color:K.ink4, marginTop:2 }}>{sub}</div>}
      </div>
    );
    return (
    <div style={{ padding:24, maxWidth:880 }}>
      <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:-.6, marginBottom:2 }}>{profile?.name?`Hi, ${profile.name.split(" ")[0]}`:"Your outreach"}</h2>
      <p style={{ color:K.ink3, fontSize:13, marginBottom:20 }}>Your internship search at a glance.</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
        <Stat label="Contacted" value={stats.contacted} />
        <Stat label="Replies" value={stats.replied} sub={stats.contacted?`${stats.replyRate}% reply rate`:"—"} accent={stats.replied?K.bl:undefined} />
        <Stat label="Interviews" value={stats.interviews} accent={stats.interviews?K.amb:undefined} />
        <Stat label={planId==="pro"?"Credits left":"Unlocks left today"} value={credits} sub={planId==="pro"?"this month":"resets daily"} accent={lowCredits?K.red:undefined} />
      </div>

      {/* Follow-ups due */}
      <div style={{ border:`1px solid ${K.b}`, borderRadius:12, overflow:"hidden", marginBottom:18 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${K.b}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:K.surf }}>
          <h3 style={{ fontWeight:700, fontSize:14 }}>Follow-ups due {followUpsDue.length>0&&<span style={{ color:K.red }}>· {followUpsDue.length}</span>}</h3>
          <span style={{ fontSize:11, color:K.ink4 }}>Most replies come from a follow-up</span>
        </div>
        {followUpsDue.length===0
          ? <div style={{ padding:"22px 16px", fontSize:13, color:K.ink4, textAlign:"center" }}>Nothing due. Contacts you email show up here after {FOLLOWUP_DAYS} days so you remember to follow up.</div>
          : followUpsDue.slice(0,6).map(c=>(
            <div key={c.id} style={{ padding:"10px 16px", borderBottom:`1px solid ${K.bs}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
              <div style={{ minWidth:0 }}><div style={{ fontWeight:600, fontSize:13 }}>{c.dba}</div><div style={{ fontSize:11, color:K.ink4 }}>Contacted {fmtAgo(tracking[c.id]?.sentAt)}</div></div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button style={G("ghost",{fontSize:11,padding:"4px 9px",color:K.grn,borderColor:K.grnB})} onClick={()=>setStatus(c.id,"replied")}>Got a reply</button>
                <button className="btn-lift" style={G("dark",{fontSize:11,padding:"4px 10px"})} onClick={()=>openDraft(c)}>Follow up</button>
              </div>
            </div>
          ))}
      </div>

      {/* Inbox health — deliverability guardrails surfaced for the user */}
      {(() => {
        const pct = sendLimit>0 ? Math.min((sentToday/sendLimit)*100,100) : 0;
        const warmDays = firstSendAt ? Math.floor((Date.now()-firstSendAt)/864e5) : 0;
        const warming = warmDays < 21 && firstSendAt;
        const barColor = bouncePaused ? K.red : sentToday>=sendLimit ? K.amb : K.grn;
        return (
        <div style={{ border:`1px solid ${bouncePaused?K.redB:K.b}`, borderRadius:12, padding:"14px 16px", marginBottom:18, background: bouncePaused?K.redT:"#fff" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <h3 style={{ fontWeight:700, fontSize:14 }}>🛡 Inbox health</h3>
            <span style={{ fontSize:11, fontWeight:600, color: bouncePaused?K.red:K.grn }}>{bouncePaused?"Sending paused":sentToday>=sendLimit?"Daily limit reached":"Healthy"}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:K.ink3, marginBottom:6 }}>
            <span>Sent today (protects your Gmail reputation)</span>
            <span style={{ fontWeight:700, color:K.ink }}>{sentToday} / {sendLimit}</span>
          </div>
          <div className="pb"><div className="pf" style={{ width:pct+"%", background:barColor }} /></div>
          <p style={{ fontSize:11, color:K.ink4, marginTop:10, lineHeight:1.6 }}>
            {bouncePaused
              ? <>Your bounce rate is {Math.round(bounceRate*100)}% — too high. Stop sending and remove bad addresses, or Gmail may flag your account.</>
              : warming
                ? <>Account warming up (day {warmDays} of 21): your safe limit rises as your inbox builds reputation. Sending too fast as a new sender gets you marked as spam.</>
                : <>Your daily send cap protects your inbox from being flagged. {stats.contacted>0&&<>Bounce rate: {Math.round(bounceRate*100)}%.</>} Spread big outreach across days.</>}
          </p>
        </div>
      );})()}

      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <button className="btn-lift" style={G("dark",{fontSize:13})} onClick={()=>setTab("companies")}>Reach out to more companies →</button>
        {!resume&&<button style={G("ghost",{fontSize:13})} onClick={()=>setModal("resume")}>📎 Add your resume</button>}
      </div>
      {/* PRODUCTION: a daily/weekly email digest ("2 follow-ups due") is sent by a
          scheduled job (Supabase cron / Resend) using this same follow-ups-due query. */}
    </div>);
  })();

  const CompaniesTab = (
    <div>
      {/* AI FIRM DISCOVERY */}
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${K.b}`, background:K.blT }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:13 }} aria-hidden="true">✨</span>
          <span style={{ fontSize:13, fontWeight:700, color:K.ink }}>Find firms &amp; emails with AI</span>
          <span style={{ fontSize:11, color:K.ink4 }}>— can't find a firm? Describe it and we'll search for it, pull a careers email, and add it to your database</span>
          {planId!=="pro"
            ? <span style={{ fontSize:10, color:K.bl, marginLeft:"auto", background:"#eef2ff", border:`1px solid #c7d2fe`, borderRadius:4, padding:"1px 7px", fontWeight:600 }}>🔒 Pro feature</span>
            : <span style={{ fontSize:10, color: (DISCOVERY_CAP-discoverUsed)<=20?K.amb:K.ink4, marginLeft:"auto", background:K.surf, border:`1px solid ${K.b}`, borderRadius:4, padding:"1px 7px", fontWeight:600 }}>{Math.max(0,DISCOVERY_CAP-discoverUsed)} discoveries left this month</span>}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:240 }}>
            <input
              id="discover-input"
              style={F({ width:"100%", paddingRight:10 })}
              placeholder='e.g. "fintech startups in NYC under 200 people" or "design studios that take interns"'
              defaultValue=""
              onKeyDown={e=>{ if(e.key==="Enter" && !discovering){ discoverFirms(e.target.value); } }}
              disabled={discovering}
              aria-label="Describe the firms you want to find"
            />
          </div>
          <button
            style={G("dark",{padding:"0 18px",fontSize:13,minWidth:110,opacity:discovering?0.6:1})}
            disabled={discovering}
            onClick={()=>{ const el=document.getElementById("discover-input"); if(el) discoverFirms(el.value); }}
          >
            {discovering ? <><Sp/>Searching…</> : "Find firms →"}
          </button>
        </div>
        {discoverErr && <p style={{ fontSize:12, color:K.red, marginTop:7 }}>{discoverErr}</p>}
        {discovered.length>0 && !discoverErr && (
          <p style={{ fontSize:11, color:K.ink4, marginTop:7 }}>
            {discovered.length} firm{discovered.length>1?"s":""} added via AI search · they're marked <span style={{ background:K.blT, border:`1px solid ${K.blB}`, color:K.bl, borderRadius:3, padding:"0 5px", fontSize:10, fontWeight:600 }}>NEW</span> in the table below
          </p>
        )}
      </div>
      {/* Filters */}
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${K.b}`, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:K.ink4, fontSize:14, pointerEvents:"none" }} aria-hidden="true">⌕</span>
            <label htmlFor="co-search" style={{ position:"absolute", left:-9999 }}>Search companies</label>
            <input id="co-search" style={F({width:220,paddingLeft:28})} placeholder="Search companies, industries…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }} role="group" aria-label="Industry filter">
            {["All",...facets.industries].map(t=>(
              <button key={t} className={`pill${fInd===t?" on":""}`} onClick={()=>setFInd(t)} aria-pressed={fInd===t}>{t==="All"?"All industries":t}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {[["All","Any type"],...facets.types.map(t=>[t,t])].map(([v,l])=>(
            <button key={v} className={`pill${fType===v?" on":""}`} onClick={()=>setFType(v)} aria-pressed={fType===v}>{l}</button>
          ))}
          {facets.showRemote && <>
            <span style={{ color:K.b, padding:"0 2px" }} aria-hidden="true">|</span>
            {[["All","Any location"],["Remote","Remote"],["On-site","On-site"]].map(([v,l])=>(
              <button key={v} className={`pill${fAccess===v?" on":""}`} onClick={()=>setFAccess(v)} aria-pressed={fAccess===v}>{l}</button>
            ))}
          </>}
          {facets.showPaid && <>
            <span style={{ color:K.b, padding:"0 2px" }} aria-hidden="true">|</span>
            {[["All","Any comp"],["Paid","Paid"],["Unpaid","Unpaid"]].map(([v,l])=>(
              <button key={v} className={`pill${fPaid===v?" on":""}`} onClick={()=>setFPaid(v)} aria-pressed={fPaid===v}>{l}</button>
            ))}
          </>}
          {facets.showIntern && <button className={`pill${fIntern?" on":""}`} onClick={()=>setFIntern(v=>!v)} aria-pressed={fIntern}>★ Intern programs</button>}
        </div>
      </div>

      {selected.length>0&&(
        <div className="sel-bar" role="toolbar">
          <span style={{ fontSize:13, fontWeight:600, color:K.bl }}>{selected.length} selected</span>
          <button style={G("dark",{fontSize:12,padding:"5px 13px"})} onClick={()=>{if(!canSend){setModal("paywall");return;}setModal("bulk");}}>✦ Send {selected.length} with AI</button>
          <button style={G("ghost",{fontSize:12,padding:"5px 11px"})} onClick={()=>setSel([])}>Clear</button>
        </div>
      )}

      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }} role="grid" aria-label="Companies">
          <thead>
            <tr style={{ background:K.surf, borderBottom:`1px solid ${K.b}` }}>
              <th scope="col" style={{ padding:"9px 14px", width:40, textAlign:"center" }}>
                <input type="checkbox" className="cb" checked={allSel} ref={el=>{if(el)el.indeterminate=someSel;}} onChange={toggleAll} aria-label="Select all" />
              </th>
              <th scope="col" style={{ padding:"9px 12px", textAlign:"left" }}><SortBtn label="Company" col="dba" sortCol={sortCol} sortDir={sortDir} onSort={onSort}/></th>
              <th scope="col" style={{ padding:"9px 12px", textAlign:"left" }} className="hm"><SortBtn label="Industry" col="industry" sortCol={sortCol} sortDir={sortDir} onSort={onSort}/></th>
              <th scope="col" style={{ padding:"9px 12px", textAlign:"left" }} className="hm"><SortBtn label="Location" col="city" sortCol={sortCol} sortDir={sortDir} onSort={onSort}/></th>
              <th scope="col" style={{ padding:"9px 12px", textAlign:"left" }} className="hm"><SortBtn label="Type" col="type" sortCol={sortCol} sortDir={sortDir} onSort={onSort}/></th>
              <th scope="col" style={{ padding:"9px 12px", textAlign:"left" }}><SortBtn label="Match" col="score" sortCol={sortCol} sortDir={sortDir} onSort={onSort}/></th>
              <th scope="col" style={{ padding:"9px 12px" }}></th>
            </tr>
          </thead>
          <tbody>
            {shownRows.map(company=>{
              const isSent=sentList.includes(company.id);
              const isSel=selected.includes(company.id);
              const sc=company.score;
              return (
                <tr key={company.id} className={`trow${isSel?" sel":""}`} aria-selected={isSel}>
                  <td style={{ padding:"9px 14px", textAlign:"center" }}><input type="checkbox" className="cb" checked={isSel} onChange={()=>toggleOne(company.id)} aria-label={`Select ${company.dba}`}/></td>
                  <td style={{ padding:"9px 12px" }}>
                    <button className="co-name" onClick={()=>{setFocus(company);setModal("detail");}}>
                      <div className="co-title" style={{ fontWeight:600, color:K.ink, fontSize:13, lineHeight:1.4, display:"flex", alignItems:"center", gap:6 }}>
                        {company.dba}
                        {company.discovered && <span className="badge-new" style={{ background:K.blT, border:`1px solid ${K.blB}`, color:K.bl, borderRadius:3, padding:"0 5px", fontSize:9, fontWeight:700, letterSpacing:.03 }}>NEW</span>}
                      </div>
                      <div style={{ fontSize:11, color:K.ink4, marginTop:1 }}>
                        {company.cname
                          ? <span>{company.cname}{company.ctitle ? ` · ${company.ctitle}` : ""}</span>
                          : <span>{company.email}</span>}
                      </div>
                    </button>
                  </td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:K.ink3, maxWidth:160 }} className="hm"><span style={{ display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{company.industry}</span></td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:K.ink3 }} className="hm">{[company.city,company.state].filter(Boolean).join(", ")||"—"}{company.remote&&<span style={{marginLeft:6}}><Chip>Remote</Chip></span>}</td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:K.ink3 }} className="hm">{company.type}</td>
                  <td style={{ padding:"9px 12px" }}>
                    {sc==null
                      ? <span style={{ fontSize:12, color:K.ink4 }}>—</span>
                      : <span className="chip" style={{ background:fitBg(sc), borderColor:fitBd(sc), color:fitC(sc) }}>{sc}%</span>}
                  </td>
                  <td style={{ padding:"9px 12px", textAlign:"right" }}>
                    {isSent
                      ?<button style={G("green",{fontSize:11,padding:"4px 10px"})} onClick={()=>openDraft(company)}>Follow up</button>
                      :<button className="btn-lift" style={G("dark",{fontSize:12,padding:"5px 12px"})} onClick={()=>openDraft(company)}>Draft & send</button>
                    }
                  </td>
                </tr>
              );
            })}
            {visible.length===0&&(
              <tr><td colSpan={7} style={{ padding:48, textAlign:"center", color:K.ink4, fontSize:13 }}>
                No companies match your filters.
                <button style={G("ghost",{fontSize:12,marginLeft:12})} onClick={()=>{setFInd("All");setFType("All");setFAccess("All");setFPaid("All");setFIntern(false);setSearch("");}}>Clear filters</button>
              </td></tr>
            )}
          </tbody>
        </table>
        {shown < visible.length && (
          <div style={{ padding:"12px 16px", textAlign:"center", borderTop:`1px solid ${K.b}` }}>
            <button style={G("ghost",{ fontSize:13, padding:"7px 18px" })} onClick={()=>setShown(s=>s+50)}>
              Show more ({(visible.length - shown).toLocaleString()} remaining)
            </button>
          </div>
        )}
      </div>
      <div style={{ padding:"10px 16px", borderTop:`1px solid ${K.b}`, display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, color:K.ink4, flexWrap:"wrap", gap:8 }}>
        <span>{visible.length} companies · {sentList.length} contacted · Match = how well a company's industry fits your interests</span>
        <button style={G("ghost",{fontSize:12,padding:"5px 11px"})} onClick={aiAutoSelect}>✦ AI auto-select</button>
      </div>
    </div>
  );

  const statusColor = id => (STATUS[id]?.color)||K.ink4;
  const pipeRows = contactedList.filter(c =>
    (pipeFilter==="all" || (tracking[c.id]?.status||"contacted")===pipeFilter) &&
    (pipeList==="all"   || listOf[c.id]===pipeList)
  );
  const PipelineTab = (
    <div>
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${K.b}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <h2 style={{ fontWeight:700, fontSize:15 }}>Pipeline <span style={{ color:K.ink4, fontWeight:500 }}>· {stats.contacted} contacted · {stats.replied} replied</span></h2>
          {contactedList.length>0&&<button style={G("ghost",{fontSize:12,color:K.red,borderColor:K.redB})} onClick={()=>{if(window.confirm("Clear all outreach history? This can't be undone.")){ setSent([]);setTracking({});msg("History cleared"); }}}>Clear</button>}
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          <button className={`pill${pipeFilter==="all"?" on":""}`} onClick={()=>setPipeFilter("all")}>All</button>
          {STATUSES.map(s=>(
            <button key={s.id} className={`pill${pipeFilter===s.id?" on":""}`} onClick={()=>setPipeFilter(s.id)}>
              {s.label} {contactedList.filter(c=>(tracking[c.id]?.status||"contacted")===s.id).length>0&&<span style={{opacity:.6}}>{contactedList.filter(c=>(tracking[c.id]?.status||"contacted")===s.id).length}</span>}
            </button>
          ))}
          <span style={{ width:1, height:18, background:K.b, margin:"0 4px" }} />
          <select value={pipeList} onChange={e=>setPipeList(e.target.value)} style={F({padding:"5px 8px",fontSize:12,width:"auto",minWidth:120})} aria-label="Filter by list">
            <option value="all">All lists</option>
            {lists.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button style={G("ghost",{fontSize:12,padding:"5px 10px"})} onClick={()=>{const n=window.prompt("New list name (e.g. Dream, Reach, Fintech):"); if(n&&n.trim()) addList(n.trim());}}>+ List</button>
        </div>
      </div>
      {contactedList.length===0?(
        <div style={{ padding:60, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }} aria-hidden="true">📭</div>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>No outreach yet</h3>
          <p style={{ fontSize:13, color:K.ink3, marginBottom:20 }}>Email a company and it shows up here. Track replies, interviews, and offers as they come in.</p>
          <button style={G("dark")} onClick={()=>setTab("companies")}>Browse companies →</button>
        </div>
      ):(
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }} aria-label="Pipeline">
          <thead><tr style={{ background:K.surf, borderBottom:`1px solid ${K.b}` }}>
            {[["Company",""],["Contact","hm"],["List","hm"],["Status",""],["",""]].map(([h,c])=>(
              <th key={h} scope="col" className={c} style={{ padding:"9px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:K.ink4, textTransform:"uppercase", letterSpacing:".05em" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {pipeRows.map(company=>{
              const st = tracking[company.id]?.status || "contacted";
              return (
              <tr key={company.id} className="trow">
                <td style={{ padding:"10px 16px" }}><div style={{ fontWeight:600 }}>{company.dba}</div><div style={{ fontSize:11, color:K.ink4 }}>Contacted {fmtAgo(tracking[company.id]?.sentAt)}</div></td>
                <td style={{ padding:"10px 16px", fontSize:12 }} className="hm"><div style={{ color:K.ink2 }}>{company.cname||"Careers inbox"}</div><div style={{ color:K.bl }}>{company.email}</div></td>
                <td style={{ padding:"10px 16px" }} className="hm">
                  <select value={listOf[company.id]||""} onChange={e=>saveToList(company.id,e.target.value)} style={F({padding:"4px 6px",fontSize:11,width:"auto",minWidth:96})} aria-label="List">
                    <option value="">— list —</option>
                    {lists.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </td>
                <td style={{ padding:"10px 16px" }}>
                  <select value={st} onChange={e=>setStatus(company.id,e.target.value)} style={F({padding:"4px 8px",fontSize:12,width:"auto",fontWeight:600,color:statusColor(st),borderColor:statusColor(st)+"66"})} aria-label="Status">
                    {STATUSES.map(s=><option key={s.id} value={s.id} style={{color:K.ink}}>{s.label}</option>)}
                  </select>
                </td>
                <td style={{ padding:"10px 16px", textAlign:"right" }}><button style={G("ghost",{fontSize:12,padding:"5px 11px"})} onClick={()=>openDraft(company)}>Follow up</button></td>
              </tr>
            );})}
          </tbody>
        </table>
      )}
    </div>
  );

  const SettingsTab = (
    <div style={{ padding:24, maxWidth:480 }}>
      <h2 style={{ fontSize:17, fontWeight:800, letterSpacing:-.5, marginBottom:4 }}>Settings</h2>
      <p style={{ color:K.ink3, fontSize:13, marginBottom:22 }}>Profile, Gmail, credits, and subscription.</p>
      <div style={{ border:`1px solid ${K.b}`, borderRadius:10, overflow:"hidden", marginBottom:14 }}>
        <div style={{ padding:"13px 16px", borderBottom:`1px solid ${K.b}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div><div style={{ fontWeight:600, fontSize:14 }}>Profile</div><div style={{ fontSize:12, color:K.ink3, marginTop:2 }}>{profile?.name||"—"} · {profile?.school||profile?.eduLevel||"Not set"}</div></div>
          <button style={G("ghost",{fontSize:12,padding:"5px 12px"})} onClick={()=>setModal("profileEdit")}>Edit</button>
        </div>
        <div style={{ padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div><div style={{ fontWeight:600, fontSize:14 }}>Gmail</div><div style={{ fontSize:12, marginTop:2, color:gmailConnected?K.grn:K.ink3 }}>{gmailConnected?"✓ Connected":"Not connected"}</div></div>
          <button style={G(gmailConnected?"ghost":"dark",{fontSize:12,padding:"5px 12px"})} onClick={()=>setModal("profileEdit")}>{gmailConnected?"Manage":"Connect Gmail"}</button>
        </div>
      </div>
      <div style={{ border:`1px solid ${K.b}`, borderRadius:10, overflow:"hidden", marginBottom:14 }}>
        <div style={{ padding:"13px 16px", borderBottom:`1px solid ${K.b}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div><div style={{ fontWeight:600, fontSize:14 }}>Plan</div><div style={{ fontSize:12, marginTop:2, color:planId==="pro"?K.grn:K.ink3 }}>{planId==="pro"?"Pro — 1,000 contacts / month + AI discovery":"Free — 5 contacts / day"}</div></div>
          {planId!=="pro"?<button style={G("dark",{fontSize:12,padding:"5px 14px"})} onClick={()=>setAppView("checkout")}>Upgrade · $20/mo</button>:<button style={G("ghost",{fontSize:12,color:K.red,borderColor:K.redB})} onClick={()=>{if(window.confirm("Cancel Pro?"))setPlanId("free");}}>Cancel</button>}
        </div>
        <div style={{ padding:"13px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:K.ink3, marginBottom:7 }}>
            <span>{planId==="pro"?"Credits this month":"Unlocks left today"}</span>
            <span style={{ fontWeight:700, color:lowCredits?K.red:K.ink }}>{credits} / {planId==="pro"?1000:5}</span>
          </div>
          <div className="pb"><div className="pf" style={{ width:`${Math.min((credits/(planId==="pro"?1000:5))*100,100)}%`, background:lowCredits?K.red:K.ink }}/></div>
          <p style={{ fontSize:11, color:K.ink4, marginTop:10, lineHeight:1.6 }}>1 credit unlocks a database contact · 2 credits unlock an AI-discovered contact. Writing emails and follow-ups is always free. Resets {planId==="pro"?"monthly":"daily"}.</p>
        </div>
        {planId==="pro"&&(
          <div style={{ padding:"13px 16px", borderTop:`1px solid ${K.b}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div><div style={{ fontWeight:600, fontSize:14 }}>Top up credits</div><div style={{ fontSize:12, color:K.ink3, marginTop:2 }}>$5 per 100 credits · instant</div></div>
            <button style={G("ghost",{fontSize:12,padding:"5px 12px"})} onClick={()=>setModal("topup")}>Buy credits</button>
          </div>
        )}
      </div>
      <div style={{ border:`1px solid ${K.b}`, borderRadius:10, padding:"13px 16px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ minWidth:0 }}><div style={{ fontWeight:600, fontSize:14 }}>Resume</div><div style={{ fontSize:12, color: resume?K.grn:K.ink3, marginTop:2 }}>{resume? `📎 ${resume.name} — attached to your emails`:"None — attach one to boost replies"}</div></div>
        <button style={G("ghost",{fontSize:12,padding:"5px 12px"})} onClick={()=>setModal("resume")}>{resume?"Replace":"Add resume"}</button>
      </div>
      <div style={{ border:`1px solid ${K.b}`, borderRadius:10, padding:"13px 16px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div style={{ minWidth:0 }}><div style={{ fontWeight:600, fontSize:14 }}>Email account</div><div style={{ fontSize:12, color:K.ink3, marginTop:2 }}>Sets your safe daily send cap. Workspace inboxes tolerate higher volume than personal Gmail.</div></div>
        <select value={accountType} onChange={e=>setAccountType(e.target.value)} style={F({padding:"6px 10px",fontSize:12,width:"auto",minWidth:150})} aria-label="Email account type">
          <option value="gmail">Personal Gmail</option>
          <option value="workspace">Google Workspace</option>
        </select>
      </div>
      <button style={G("ghost",{fontSize:13,width:"100%",padding:"9px 0",color:K.red,borderColor:K.redB})} onClick={signOut}>Sign out</button>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <nav style={{ position:"sticky", top:0, zIndex:200, background:"rgba(255,255,255,.97)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", borderBottom:`1px solid ${K.b}` }} role="navigation" aria-label="App navigation">
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontWeight:800, fontSize:15, letterSpacing:-.5 }}>firstinternships</span>
            <div style={{ display:"flex", gap:1 }} role="tablist">
              {[["dashboard","Home"],["companies","Companies"],["pipeline",`Pipeline${stats.dueIds.length>0?` (${stats.dueIds.length})`:""}`],["settings","Settings"]].map(([id,lbl])=>(
                <button key={id} className={`ntab${tab===id?" on":""}`} onClick={()=>setTab(id)} role="tab" aria-selected={tab===id}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <CreditMeter credits={credits} planId={planId} />
            {planId==="pro"&&<Chip color="dark">Pro</Chip>}
            <button style={G("ghost",{fontSize:12,padding:"5px 12px"})} onClick={()=>setModal("profileEdit")}>{profile?.name?.split(" ")[0]||"Profile"}</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 16px" }} aria-live="polite">
        {credits<=2&&credits>0&&(
          <div style={{ marginTop:10, padding:"9px 14px", background:K.ambT, border:`1px solid ${K.ambB}`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13, flexWrap:"wrap", gap:8 }} role="alert">
            <span style={{ color:K.amb, fontWeight:500 }}>⚠ Only {credits} credit{credits!==1?"s":""} remaining</span>
            <div style={{ display:"flex", gap:8 }}>
              {planId==="pro"&&<button style={G("ghost",{fontSize:12,padding:"5px 11px",color:K.amb,borderColor:K.ambB})} onClick={()=>setModal("topup")}>Buy credits</button>}
              {planId!=="pro"&&<button style={G("dark",{fontSize:12,padding:"5px 13px"})} onClick={()=>setAppView("checkout")}>Upgrade $20/mo</button>}
            </div>
          </div>
        )}
        {credits<=0&&(
          <div style={{ marginTop:10, padding:"9px 14px", background:K.redT, border:`1px solid ${K.redB}`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13, flexWrap:"wrap", gap:8 }} role="alert">
            <span style={{ color:K.red, fontWeight:600 }}>No credits remaining</span>
            <div style={{ display:"flex", gap:8 }}>
              {planId==="pro"&&<button style={G("red",{fontSize:12,padding:"5px 11px"})} onClick={()=>setModal("topup")}>Buy credits</button>}
              {planId!=="pro"&&<button style={G("red",{fontSize:12,padding:"5px 13px"})} onClick={()=>setAppView("checkout")}>Upgrade $20/mo</button>}
            </div>
          </div>
        )}
      </div>

      <main style={{ maxWidth:1200, margin:"0 auto", padding:"14px 16px 80px" }}>
        <div style={{ background:"#fff", border:`1px solid ${K.b}`, borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          {tab==="dashboard" && DashTab}
          {tab==="companies" && CompaniesTab}
          {tab==="pipeline"  && PipelineTab}
          {tab==="settings"  && SettingsTab}
        </div>
      </main>

      {modal==="profileEdit" && <ProfileEditModal profile={profile} onSave={p=>{setProfile(p);msg("✓ Profile saved");}} onClose={()=>{setModal(null);setGmailConnected(!!ss.get(GT_KEY));}}/>}
      {modal==="paywall"     && <Paywall credits={credits} onClose={()=>setModal(null)} onUpgrade={()=>setAppView("checkout")}/>}
      {modal==="topup"       && <TopupModal onClose={()=>setModal(null)} onTopup={n=>{setCredits(c=>c+n);msg(`✓ ${n} credits added`);}}/>}
      {modal==="draft"       && focus && <DraftModal company={focus} profile={profile} isSent={sentList.includes(focus.id)} credits={credits} resume={resume} canSendNow={canSendNow} sendBlockReason={sendBlockReason} onClose={()=>{setModal(null);setFocus(null);}} onSend={recordSend}/>}
      {modal==="resume"      && <ResumeModal resume={resume} onSave={(r)=>{setResume(r); track("resume_upload"); msg("✓ Resume saved");}} onClose={()=>setModal(null)}/>}
      {modal==="bulk"        && <BulkModal companies={allFirms.filter(c=>selected.includes(c.id))} profile={profile} sentList={sentList} credits={credits} remainingSends={remainingSends} sendLimit={sendLimit} bouncePaused={bouncePaused} sendBlockReason={sendBlockReason} onClose={()=>setModal(null)} onDone={recordBulkSend}/>}
      {modal==="detail"      && focus && <CompanyDetail company={focus} score={scores[focus.id]} isSent={sentList.includes(focus.id)} lists={lists} currentList={listOf[focus.id]} onSaveList={(lid)=>saveToList(focus.id,lid)} onClose={()=>{setModal(null);setFocus(null);}} onDraft={()=>{const f=focus;setTimeout(()=>{setFocus(f);setModal("draft");},50);}}/>}

      {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
    </>
  );
}
