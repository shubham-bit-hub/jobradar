import { useState, useMemo, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────

const DARK = {
  bg:        "#07101e",
  surface:   "#0a1220",
  surface2:  "#0c1628",
  surface3:  "#0e1e34",
  border:    "#1a2d45",
  border2:   "#12213a",
  text:      "#e8f2ff",
  textSub:   "#8aabb0",
  textMuted: "#3a5a7a",
  textDim:   "#5a7a9a",
  accent:    "#4dabff",
  green:     "#0fd48a",
  amber:     "#f9a825",
  red:       "#f26c6c",
  purple:    "#b197fc",
  rowOdd:    "#0c1628",
  rowEven:   "#0a1220",
  rowHover:  "#0b1830",
  input:     "#060a12",
};

const LIGHT = {
  bg:        "#f0f4f9",
  surface:   "#ffffff",
  surface2:  "#f6f9fc",
  surface3:  "#edf2f8",
  border:    "#d0dde8",
  border2:   "#e2eaf3",
  text:      "#0f1e30",
  textSub:   "#3a5a78",
  textMuted: "#8aaabf",
  textDim:   "#6a90aa",
  accent:    "#1a72d8",
  green:     "#0aaa6a",
  amber:     "#d47f00",
  red:       "#d44040",
  purple:    "#6b4fc8",
  rowOdd:    "#f6f9fc",
  rowEven:   "#ffffff",
  rowHover:  "#ebf2fb",
  input:     "#ffffff",
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const SHUBHAM_SKILLS = [
  "API Integration","Product Management","Program Management","SQL",
  "Prompt Engineering","Automation","Process Optimization","Stakeholder Management",
  "Technical Account Management","Gen-AI","Last-Mile Delivery",
  "Seller Partner Management","Data Analysis","Go-To-Market","SaaS","Python","Fintech"
];

const BASE_CV = `Shubham Garg | garg.shubham21@gmail.com | +91-9643566485 | Bangalore, India

PROFESSIONAL SUMMARY
Program Manager II at Amazon with 5 years of experience in API integration, product operations, and enterprise partnerships. Led SmartConnect API adoption across 5+ enterprise integrators, delivered USD 5.2M annual savings, and built Gen-AI tooling that reduced support escalations by 40%. MBA from MDI Gurgaon.

EXPERIENCE

Program Manager II – API Integration | Amazon | Oct 2024 – Present
• Led end-to-end onboarding of 5+ enterprise integrators onto SmartConnect API, managing SLAs, escalations, and partner health
• Redesigned integrator scorecard from binary checklist to multi-pillar framework (API Quality, Business Impact, Integration Hygiene, Seller Health)
• Built Gen-AI troubleshooting tool reducing support resolution time by 40%
• Automated 46,000+ operational emails; built SQL deduplication pipeline (250k+ records, 95% accuracy)
• Earned Game Changer Award Q4'25

Program Manager – Last Mile Delivery | Amazon | Jun 2022 – Sep 2024
• Drove TCAP initiative delivering 1M+ shipments with +1 day speed improvement
• Delivered USD 5.2M annual savings through network and supply chain optimization
• Managed cross-functional programs across logistics, tech, and seller teams
• Earned Customer Advocate Award Q3'23

Associate | Punjab National Bank | 2018 – 2020
• Managed retail banking operations and client onboarding

EDUCATION
PGDM (MBA) | Management Development Institute (MDI), Gurgaon | 2020–2022
BA (H) Business Economics | Shivaji College, Delhi University | 2015–2018

KEY SKILLS
API Integration & Development | Technical Account Management | Program Management
SQL | Prompt Engineering | Gen-AI Tools | Process Automation
Stakeholder Engagement | Seller Partner Management | Last-Mile Delivery Tech`;

const DEFAULT_SETTINGS = {
  salaryBuckets: { tier1: 50, tier2: 40 },
  targetRoles: [
    "Product Manager","Senior Product Manager","Senior Program Manager",
    "Technical Program Manager","Technical Account Manager",
    "Product Operations Manager","Tech Ops Manager"
  ],
  targetCompanies: [
    "Flipkart","Google","Microsoft","Uber","Swiggy","Stripe",
    "Adobe","Meesho","Razorpay","PhonePe","Zomato","Salesforce","PayPal","Atlassian"
  ],
  baseCv: BASE_CV,
  weights: { salary: 35, role: 30, skills: 20, workex: 15 },
  locations: ["Bangalore","Remote","Pan-India"]
};

const STATUSES = ["Not Applied","Applied","Screening","Interview Scheduled","Offer Received","Rejected","Withdrawn"];

const STATUS_STYLES_DARK = {
  "Not Applied":         { bg:"#12192b", color:"#5a7a9a", border:"#1e3050" },
  "Applied":             { bg:"#0e2040", color:"#5aabff", border:"#1a4080" },
  "Screening":           { bg:"#2a1e00", color:"#f9c74f", border:"#503800" },
  "Interview Scheduled": { bg:"#1e1040", color:"#b197fc", border:"#3d2080" },
  "Offer Received":      { bg:"#052a1a", color:"#2ecc8a", border:"#0a5030" },
  "Rejected":            { bg:"#2a0a0a", color:"#f77066", border:"#501010" },
  "Withdrawn":           { bg:"#151515", color:"#555f6e", border:"#252525" },
};

const STATUS_STYLES_LIGHT = {
  "Not Applied":         { bg:"#edf2f8", color:"#6a90aa", border:"#c8d8e8" },
  "Applied":             { bg:"#ddeeff", color:"#1a72d8", border:"#a0c8f0" },
  "Screening":           { bg:"#fff3cc", color:"#b06000", border:"#f0c040" },
  "Interview Scheduled": { bg:"#ede8ff", color:"#5a3ab8", border:"#b8a8f0" },
  "Offer Received":      { bg:"#d4f5e8", color:"#0a7a50", border:"#80d8b0" },
  "Rejected":            { bg:"#fde8e8", color:"#c03030", border:"#f0a0a0" },
  "Withdrawn":           { bg:"#efefef", color:"#7a8a98", border:"#c8c8c8" },
};

const MOCK_JOBS = [
  { id:1,  title:"Senior Product Manager",          company:"Google",     location:"Bangalore", salary:65, salaryDisplay:"₹60–70 LPA",  level:"L5",             levelMatch:"Right",  skills:["Product Management","API","Stakeholder Management","Data Analysis","Go-To-Market"],              jd:"Drive product vision for Google's developer platform APIs. Work cross-functionally with engineering, design, and business. Define roadmap, own metrics, drive adoption. 5+ years PM required.",                          source:"LinkedIn",  posted:"1 day ago",  isNew:true,  link:"https://careers.google.com",    initStatus:"Not Applied" },
  { id:2,  title:"Senior Technical Program Mgr",    company:"Stripe",     location:"Bangalore", salary:70, salaryDisplay:"₹65–75 LPA",  level:"Senior TPM",     levelMatch:"Right",  skills:["API Integration","Program Management","Technical Account Management","Stakeholder Management","SaaS"],  jd:"Lead Stripe's India API partnership program. Manage enterprise integrations, own adoption metrics, handle technical escalations. 5+ years TPM with API background required.",                                          source:"LinkedIn",  posted:"Today",      isNew:true,  link:"https://stripe.com/jobs",       initStatus:"Not Applied" },
  { id:3,  title:"Senior Program Manager",          company:"Flipkart",   location:"Bangalore", salary:58, salaryDisplay:"₹55–62 LPA",  level:"Asst. Director", levelMatch:"Right",  skills:["Program Management","API Integration","Seller Partner Management","Automation","Process Optimization"],  jd:"Lead Flipkart's seller API program. Drive integration quality and seller NPS. Manage 10+ enterprise integrators. 4–6 years experience in tech/program management.",                                                   source:"Naukri",    posted:"2 days ago", isNew:false, link:"https://www.flipkartcareers.com",initStatus:"Not Applied" },
  { id:4,  title:"Technical Account Mgr – Ent.",    company:"Salesforce", location:"Bangalore", salary:55, salaryDisplay:"₹50–60 LPA",  level:"Senior",         levelMatch:"Right",  skills:["Technical Account Management","API Integration","Stakeholder Management","SaaS"],                     jd:"Own technical relationships with Salesforce enterprise customers. Drive adoption, resolve escalations, conduct QBRs. API and SaaS background strongly preferred.",                                                     source:"IIMJobs",   posted:"3 days ago", isNew:false, link:"https://salesforce.com/careers", initStatus:"Not Applied" },
  { id:5,  title:"Product Manager – Payments API",  company:"Razorpay",   location:"Bangalore", salary:52, salaryDisplay:"₹48–55 LPA",  level:"Senior PM",      levelMatch:"Right",  skills:["Product Management","API Integration","Fintech","Go-To-Market","Data Analysis"],                     jd:"Own Razorpay's payments API platform roadmap. Work with enterprise merchants and fintech integrators. Strong PM background with API/payments experience required.",                                                   source:"LinkedIn",  posted:"Today",      isNew:true,  link:"https://razorpay.com/jobs",      initStatus:"Not Applied" },
  { id:6,  title:"Senior PM – Developer Platform",  company:"Adobe",      location:"Bangalore", salary:62, salaryDisplay:"₹58–68 LPA",  level:"Staff PM",       levelMatch:"Right",  skills:["Product Management","API","Developer Tools","Stakeholder Management","Go-To-Market"],                jd:"Shape Adobe's developer APIs and integration ecosystem. Drive adoption with enterprise partners. 5+ years PM with API background required.",                                                                           source:"Company",   posted:"4 days ago", isNew:false, link:"https://adobe.com/careers",      initStatus:"Not Applied" },
  { id:7,  title:"Product Manager – Logistics",     company:"Swiggy",     location:"Bangalore", salary:45, salaryDisplay:"₹42–48 LPA",  level:"Senior Manager", levelMatch:"Right",  skills:["Product Management","Last-Mile Delivery","Automation","Data Analysis","Process Optimization"],      jd:"Lead product for Swiggy's last-mile delivery tech. Own rider app, dispatch algorithms, and SLA. 4–6 years PM with logistics tech preferred.",                                                                          source:"LinkedIn",  posted:"2 days ago", isNew:false, link:"https://careers.swiggy.com",    initStatus:"Not Applied" },
  { id:8,  title:"Senior Program Mgr – Seller",     company:"Meesho",     location:"Bangalore", salary:42, salaryDisplay:"₹40–45 LPA",  level:"Senior Manager", levelMatch:"Right",  skills:["Program Management","Seller Partner Management","Process Optimization","Stakeholder Management"],    jd:"Own Meesho's seller onboarding and tech program. Drive seller NPS. 4+ years in e-commerce/marketplace operations.",                                                                                                   source:"Naukri",    posted:"1 day ago",  isNew:true,  link:"https://meesho.io/jobs",        initStatus:"Not Applied" },
  { id:9,  title:"Technical Account Manager",       company:"Microsoft",  location:"Bangalore", salary:48, salaryDisplay:"₹45–52 LPA",  level:"Senior PM II",   levelMatch:"Right",  skills:["Technical Account Management","API Integration","SaaS","Stakeholder Management","SQL"],              jd:"Manage technical relationships with Azure enterprise customers. Drive adoption, conduct QBRs. API and cloud background preferred.",                                                                                     source:"LinkedIn",  posted:"5 days ago", isNew:false, link:"https://careers.microsoft.com", initStatus:"Not Applied" },
  { id:10, title:"PM – Fintech Products",           company:"PhonePe",    location:"Bangalore", salary:46, salaryDisplay:"₹43–50 LPA",  level:"Lead PM",        levelMatch:"Right",  skills:["Product Management","Fintech","API Integration","Go-To-Market","Stakeholder Management"],             jd:"Own PhonePe's B2B fintech API product roadmap. Drive merchant adoption. 4+ years PM in fintech/payments preferred.",                                                                                                  source:"IIMJobs",   posted:"3 days ago", isNew:false, link:"https://phonepe.com/careers",   initStatus:"Not Applied" },
  { id:11, title:"Senior Program Mgr – Ops",        company:"Uber",       location:"Bangalore", salary:50, salaryDisplay:"₹47–53 LPA",  level:"Senior PM II",   levelMatch:"Right",  skills:["Program Management","Automation","Process Optimization","Data Analysis","Last-Mile Delivery"],       jd:"Drive operational excellence for Uber's India platform. Lead cross-functional programs, build automation frameworks. 5+ years PM/SPM experience.",                                                                    source:"LinkedIn",  posted:"Today",      isNew:true,  link:"https://uber.com/careers",      initStatus:"Applied" },
  { id:12, title:"Product Manager – API Platform",  company:"Atlassian",  location:"Remote",    salary:44, salaryDisplay:"₹42–47 LPA",  level:"Staff TPM",      levelMatch:"Right",  skills:["Product Management","API Integration","Developer Tools","SaaS","Go-To-Market"],                      jd:"Own Atlassian's API marketplace product. Drive developer adoption, manage partner integrations. Remote-first role.",                                                                                                   source:"Company",   posted:"6 days ago", isNew:false, link:"https://atlassian.com/company/careers", initStatus:"Not Applied" },
  { id:13, title:"Senior PM – Growth",              company:"Zomato",     location:"Bangalore", salary:null, salaryDisplay:"Not Listed", level:"Senior Manager", levelMatch:"Right",  skills:["Product Management","Growth","Data Analysis","Go-To-Market","Stakeholder Management"],                jd:"Lead Zomato's restaurant partner product. Own retention, upsell, and onboarding flows. 4+ years PM experience.",                                                                                                      source:"Naukri",    posted:"4 days ago", isNew:false, link:"https://zomato.com/careers",    initStatus:"Not Applied" },
  { id:14, title:"Tech Ops Program Manager",        company:"PayPal",     location:"Bangalore", salary:null, salaryDisplay:"Not Listed", level:"Senior TPM",     levelMatch:"Right",  skills:["Technical Account Management","Program Management","API Integration","Process Optimization"],         jd:"Manage PayPal's merchant integration program. Own onboarding SLA, integration quality, escalations. API/fintech background strongly preferred.",                                                                      source:"LinkedIn",  posted:"2 days ago", isNew:true,  link:"https://paypal.com/jobs",       initStatus:"Screening" },
  { id:15, title:"Product Operations Manager",      company:"Flipkart",   location:"Bangalore", salary:null, salaryDisplay:"Not Listed", level:"Asst. Director", levelMatch:"Senior", skills:["Product Management","Process Optimization","Seller Partner Management","SQL","Data Analysis"],        jd:"Drive product operations for Flipkart's seller platform. Own operational metrics, seller health dashboards, API adoption programs.",                                                                                   source:"IIMJobs",   posted:"1 day ago",  isNew:true,  link:"https://www.flipkartcareers.com",initStatus:"Not Applied" },
  { id:16, title:"Senior TPM – Cloud APIs",         company:"Google",     location:"Remote",    salary:null, salaryDisplay:"Not Listed", level:"L5",             levelMatch:"Right",  skills:["Program Management","API Integration","Stakeholder Management","Data Analysis"],                     jd:"Own Google Cloud API partnerships in India. Drive adoption, manage enterprise integrators. 5+ years TPM experience.",                                                                                                  source:"Company",   posted:"3 days ago", isNew:false, link:"https://careers.google.com",    initStatus:"Not Applied" },
  { id:17, title:"PM – Marketplace API",            company:"Meesho",     location:"Bangalore", salary:null, salaryDisplay:"Not Listed", level:"Senior Manager", levelMatch:"Right",  skills:["Product Management","API Integration","Seller Partner Management","Automation"],                     jd:"Own Meesho's seller API product. Drive integration quality, manage developer partnerships. 3–5 years PM experience.",                                                                                                  source:"Naukri",    posted:"Today",      isNew:true,  link:"https://meesho.io/jobs",        initStatus:"Not Applied" },
  { id:18, title:"Technical PM – Fintech",          company:"Razorpay",   location:"Bangalore", salary:null, salaryDisplay:"Not Listed", level:"Senior PM",      levelMatch:"Right",  skills:["Technical Account Management","Program Management","API Integration","Fintech"],                    jd:"Lead Razorpay's fintech partner program. Manage enterprise merchant technical relationships, drive API adoption.",                                                                                                      source:"LinkedIn",  posted:"5 days ago", isNew:false, link:"https://razorpay.com/jobs",      initStatus:"Interview Scheduled" }
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function computeScore(job, settings) {
  const { weights, salaryBuckets } = settings;
  const mySkills = SHUBHAM_SKILLS.map(s => s.toLowerCase());
  
  // Guard: salary_lpa from scraper OR salary field from mock data
  const salaryVal = job.salary_lpa !== undefined ? job.salary_lpa : job.salary;
  
  let sal = 50;
  if (salaryVal !== null && salaryVal !== undefined) {
    if (salaryVal >= salaryBuckets.tier1) sal = 100;
    else if (salaryVal >= salaryBuckets.tier2) sal = 72;
    else sal = 35;
  }
  
  const tl = (job.title || "").toLowerCase();
  const exact = settings.targetRoles.some(r => tl.includes(r.toLowerCase()));
  const partial = !exact && settings.targetRoles.some(r =>
    r.toLowerCase().split(" ").some(w => w.length > 4 && tl.includes(w))
  );
  const role = exact ? 100 : partial ? 65 : 30;
  
  // Guard: skills may be missing in scraped jobs
  const jobSkills = Array.isArray(job.skills) ? job.skills : [];
  const jdText = (job.jd || job.title || "").toLowerCase();
  
  // If no skills array, match against JD text instead
  let matched = 0;
  if (jobSkills.length > 0) {
    matched = jobSkills.filter(s =>
      mySkills.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms))
    ).length;
  } else {
    matched = mySkills.filter(ms => jdText.includes(ms)).length;
  }
  const skillBase = jobSkills.length > 0 ? jobSkills.length : Math.max(mySkills.length * 0.3, 1);
  const skills = Math.min(100, Math.round((matched / skillBase) * 100));
  
  // levelMatch may not exist in scraped jobs — default to Right
  const wx = job.levelMatch === "Right" || !job.levelMatch ? 95 : job.levelMatch === "Senior" ? 75 : 50;
  
  const total = Math.round(
    sal    * (weights.salary  / 100) +
    role   * (weights.role    / 100) +
    skills * (weights.skills  / 100) +
    wx     * (weights.workex  / 100)
  );
  
  const isWatchlist = settings.targetCompanies.some(c =>
    (job.company || "").toLowerCase().includes(c.toLowerCase())
  );
  const finalTotal = Math.min(100, isWatchlist ? total + 5 : total);
  return { total: finalTotal, sal, role, skills, wx, matched, isWatchlist };
}

const scoreColor = (s, t) => s >= 75 ? t.green : s >= 50 ? t.accent : s >= 30 ? t.amber : t.red;
const scoreBg    = (s, t) => s >= 75 ? (t === DARK ? "#062a18" : "#d4f5e8") : s >= 50 ? (t === DARK ? "#061828" : "#ddeeff") : s >= 30 ? (t === DARK ? "#2a1800" : "#fff3cc") : (t === DARK ? "#280808" : "#fde8e8");
const scoreLabel = s => s >= 75 ? "Top Match" : s >= 50 ? "Good Match" : s >= 30 ? "Partial" : "Low Fit";

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE-BASED GENERATORS (no API key required)
// ─────────────────────────────────────────────────────────────────────────────

function generateCoverLetter(job, baseCv) {
  const name = "Shubham Garg";
  const title = job.title;
  const company = job.company;
  const skills = job.skills || [];

  // Extract key achievements from CV
  const achievements = [
    "led SmartConnect API adoption across 5+ enterprise integrators at Amazon",
    "delivered USD 5.2M annual savings through operational excellence",
    "built Gen-AI tooling that reduced support resolution time by 40%",
    "automated 46,000+ operational workflows with 95% accuracy",
    "drove 1M+ shipments with +1 day speed improvement via TCAP program",
  ];

  // Match skills to role
  const mySkills = SHUBHAM_SKILLS.map(s => s.toLowerCase());
  const matched = skills.filter(s => mySkills.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms)));
  const skillStr = matched.length > 0 ? matched.slice(0,3).join(", ") : skills.slice(0,3).join(", ");

  // Role type detection
  const tl = title.toLowerCase();
  const isTAM = tl.includes("account") || tl.includes("tam");
  const isTPM = tl.includes("technical program") || tl.includes("tpm");
  const isPM  = tl.includes("product manager") || tl.includes("pm");

  const para1 = `I am writing to express my interest in the ${title} role at ${company}. With five years of experience in API integration, program management, and enterprise partnerships — including my current role as Program Manager II at Amazon — I bring a proven track record of driving technical adoption and measurable business outcomes.`;

  const para2 = isTAM
    ? `At Amazon, I have managed end-to-end technical relationships with enterprise integrators on the SmartConnect API, owning SLAs, escalation management, and partner health. I ${achievements[0]} and ${achievements[2]}. My experience maps directly to the ${skillStr} requirements of this role.`
    : isTPM
    ? `In my current role, I ${achievements[0]}, ${achievements[3]}, and ${achievements[1]}. I have consistently bridged technical and business teams to deliver complex API and platform programs on time. My background in ${skillStr} aligns closely with what ${company} is looking for in this role.`
    : `I have a strong foundation in ${skillStr}, demonstrated through my work at Amazon where I ${achievements[0]} and ${achievements[1]}. My MBA from MDI Gurgaon combined with hands-on product and operations experience positions me well for this role at ${company}.`;

  const para3 = `I am excited by ${company}'s focus and believe my combination of technical depth, stakeholder management, and execution track record would make an immediate impact. I would welcome the opportunity to discuss how I can contribute to your team.`;

  return `${para1}

${para2}

${para3}

Best regards,
${name}`;
}

function generateTailoredCV(job, baseCv) {
  const skills = job.skills || [];
  const mySkills = SHUBHAM_SKILLS.map(s => s.toLowerCase());
  const matched = skills.filter(s => mySkills.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms)));
  const missing = skills.filter(s => !mySkills.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms)));
  const skillHighlight = [...matched, ...missing].join(" | ");

  return `<h1 style="margin:0 0 4px;font-size:16pt">Shubham Garg</h1>
<p class="contact" style="color:#555;font-size:10pt;margin:0 0 16px">garg.shubham21@gmail.com &nbsp;|&nbsp; +91-9643566485 &nbsp;|&nbsp; Bangalore, India &nbsp;|&nbsp; linkedin.com/in/shubhamgarg</p>

<h2 style="font-size:12pt;border-bottom:1.5px solid #333;margin:0 0 8px;padding-bottom:4px">PROFESSIONAL SUMMARY</h2>
<p style="margin:0 0 16px;line-height:1.6">Results-driven Program Manager II at Amazon with 5 years of experience in <strong>${matched.slice(0,3).join(", ")}</strong> and enterprise partnerships. Led SmartConnect API adoption across 5+ integrators, delivered USD 5.2M annual savings, and built Gen-AI tooling reducing escalations by 40%. MBA from MDI Gurgaon. Targeting ${job.title} roles.</p>

<h2 style="font-size:12pt;border-bottom:1.5px solid #333;margin:16px 0 8px;padding-bottom:4px">EXPERIENCE</h2>
<p style="margin:0 0 4px"><strong>Program Manager II – API Integration | Amazon</strong> &nbsp;|&nbsp; Oct 2024 – Present</p>
<ul style="padding-left:22px;margin:4px 0 12px">
<li>Led end-to-end onboarding of 5+ enterprise integrators onto SmartConnect API, owning SLAs, escalations, and partner health scorecards</li>
<li>Built Gen-AI troubleshooting tool reducing support resolution time by 40%; automated 46,000+ operational emails</li>
<li>Redesigned integrator scorecard into multi-pillar framework (API Quality, Business Impact, Integration Hygiene, Seller Health)</li>
<li>Built SQL deduplication pipeline across 250k+ records with 95% accuracy; earned Game Changer Award Q4'25</li>
</ul>
<p style="margin:0 0 4px"><strong>Program Manager – Last Mile Delivery | Amazon</strong> &nbsp;|&nbsp; Jun 2022 – Sep 2024</p>
<ul style="padding-left:22px;margin:4px 0 12px">
<li>Drove TCAP initiative delivering 1M+ shipments with +1 day speed improvement across India network</li>
<li>Delivered USD 5.2M annual savings through supply chain optimisation and cross-functional program execution</li>
<li>Managed logistics, tech, and seller workstreams simultaneously; earned Customer Advocate Award Q3'23</li>
</ul>
<p style="margin:0 0 4px"><strong>Probationary Officer | Punjab National Bank</strong> &nbsp;|&nbsp; 2018 – 2020</p>
<ul style="padding-left:22px;margin:4px 0 12px">
<li>Managed retail banking operations, client onboarding, and branch-level reporting</li>
</ul>

<h2 style="font-size:12pt;border-bottom:1.5px solid #333;margin:16px 0 8px;padding-bottom:4px">EDUCATION</h2>
<p style="margin:0 0 4px"><strong>PGDM (MBA)</strong> | Management Development Institute (MDI), Gurgaon | 2020–2022</p>
<p style="margin:0 0 12px"><strong>BA (H) Business Economics</strong> | Shivaji College, Delhi University | 2015–2018</p>

<h2 style="font-size:12pt;border-bottom:1.5px solid #333;margin:16px 0 8px;padding-bottom:4px">KEY SKILLS</h2>
<p style="margin:0">${skillHighlight}</p>`;
}

function generateSkillGap(job) {
  const mySkills = SHUBHAM_SKILLS.map(s => s.toLowerCase());
  const jobSkills = job.skills || [];

  const matchingSkills = jobSkills.filter(s =>
    mySkills.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms))
  );
  const missingSkills = jobSkills.filter(s =>
    !mySkills.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms))
  );

  // Static learning resources by skill type
  const learningMap = {
    "product sense":    { course:"Product Management Fundamentals",  platform:"Coursera",          weeks:4, link:"https://www.coursera.org/learn/product-management" },
    "prd":              { course:"Writing PRDs that Ship",            platform:"LinkedIn Learning",  weeks:2, link:"https://www.linkedin.com/learning/topics/product-management" },
    "rest api":         { course:"REST APIs with Postman",            platform:"Udemy",             weeks:2, link:"https://www.udemy.com/course/rest-api-flask-and-python/" },
    "cloud":            { course:"Google Cloud Fundamentals",         platform:"Google",            weeks:3, link:"https://cloud.google.com/training/courses/cloud-digital-leader" },
    "fintech":          { course:"Fintech: Disruption in Finance",    platform:"Coursera",          weeks:3, link:"https://www.coursera.org/learn/fintech" },
    "growth":           { course:"Growth Product Management",         platform:"LinkedIn Learning",  weeks:2, link:"https://www.linkedin.com/learning/topics/product-management" },
    "developer tools":  { course:"Developer Experience Fundamentals", platform:"Udemy",             weeks:2, link:"https://www.udemy.com/courses/development/" },
    "default":          { course:"Product Strategy and Roadmapping",  platform:"Coursera",          weeks:3, link:"https://www.coursera.org/learn/product-strategy" },
  };

  const getLearning = (skill) => {
    const sl = skill.toLowerCase();
    for (const [key, val] of Object.entries(learningMap)) {
      if (sl.includes(key)) return { skill, ...val };
    }
    return { skill, ...learningMap["default"] };
  };

  const missingWithImportance = missingSkills.map((s, i) => ({
    skill: s,
    importance: i === 0 ? "High" : i <= 1 ? "Medium" : "Low",
    description: `${s} is listed as a requirement for this ${job.title} role at ${job.company}.`
  }));

  const gapCount = missingSkills.length;
  const gapRating = gapCount === 0 ? "Low" : gapCount <= 2 ? "Low" : gapCount <= 4 ? "Medium" : "High";

  const assessment = matchingSkills.length >= jobSkills.length * 0.7
    ? `Strong match — you cover ${matchingSkills.length} of ${jobSkills.length} required skills. Your API integration background and program management experience at Amazon directly align with this ${job.title} role at ${job.company}. Minor gaps can be addressed quickly.`
    : matchingSkills.length >= jobSkills.length * 0.4
    ? `Good partial match — you have ${matchingSkills.length} of ${jobSkills.length} skills. Your Amazon experience in API integration and stakeholder management is a strong foundation. Bridging ${missingSkills.slice(0,2).join(" and ")} would significantly strengthen your application.`
    : `Stretch role — you match ${matchingSkills.length} of ${jobSkills.length} skills. Your program management and API background are relevant but you would need to demonstrate strength in ${missingSkills.slice(0,2).join(" and ")} during interviews.`;

  return {
    matchingSkills,
    missingSkills: missingWithImportance,
    assessment,
    gapRating,
    learningPlan: missingSkills.slice(0, 4).map(getLearning)
  };
}

function generateInterviewPrep(job) {
  const tl = job.title.toLowerCase();
  const isTAM = tl.includes("account");
  const isTPM = tl.includes("technical program") || tl.includes("tpm");
  const company = job.company;
  const skills = (job.skills || []).slice(0, 3).join(", ");

  const pmQuestions = [
    { question: `How would you define the product roadmap for ${company}'s API platform?`,
      answer: `I'd start by mapping the developer journey — from discovery to integration to scale. At Amazon, I built a similar framework for SmartConnect API where I identified three phases: onboarding friction, integration quality, and business impact. For ${company}, I'd conduct 5-7 developer interviews, analyse drop-off in the funnel, and prioritise the top 3 pain points. I'd then build a roadmap with 30/60/90 day milestones, aligning with engineering capacity and business OKRs. Success metrics would include time-to-first-call, integration completion rate, and API adoption growth.` },
    { question: `Tell me about a time you drove adoption of a technical product.`,
      answer: `At Amazon, I led SmartConnect API adoption across 5+ enterprise integrators. The challenge was low activation — partners would sign up but not complete integration. I diagnosed three root causes: unclear documentation, no sandbox environment, and slow support SLAs. I fixed documentation, worked with engineering to create a sandbox, and built a Gen-AI troubleshooting tool that reduced resolution time by 40%. Adoption increased significantly within two quarters and I earned the Game Changer Award for this initiative.` },
    { question: `How do you prioritise when you have competing stakeholder requests?`,
      answer: `I use a framework combining impact, effort, and strategic alignment. First I map each request to a business metric — revenue, retention, or efficiency. Then I score effort using engineering estimates. Finally I check alignment with the quarterly OKR. At Amazon, I regularly managed competing asks from sellers, tech teams, and business stakeholders. I maintained a shared prioritisation doc that made trade-offs visible and reduced escalations by keeping everyone aligned on the rationale, not just the decision.` },
    { question: `How would you measure the success of an API integration program?`,
      answer: `I'd define success across four dimensions: adoption (number of active integrators, API call volume), quality (error rates, latency, uptime), business impact (seller/merchant revenue influenced), and partner health (NPS, support ticket volume). At Amazon I built a multi-pillar scorecard tracking exactly these — API Quality, Business Impact, Integration Hygiene, and Seller Health. The key is having leading indicators like activation rate alongside lagging ones like revenue impact, so you can act before problems compound.` },
    { question: `What's your approach to working with engineering teams as a PM/PM?`,
      answer: `I treat engineers as partners not executors. I write clear PRD-style briefs with context, success metrics, and constraints — not solutions. I run weekly syncs focused on blockers, not status. At Amazon, I introduced a simple "red/amber/green" flag system where engineers could surface concerns early without escalating formally. This reduced last-minute surprises by around 60%. I also make a habit of joining sprint planning to understand technical debt and capacity, which makes my roadmap estimates much more realistic.` },
    { question: `Tell me about a data-driven decision you made.`,
      answer: `At Amazon, I noticed integrator churn was high despite good onboarding scores. I pulled SQL data across 250,000+ seller records and found that integrators with fewer than 3 API calls in week 1 had 4x higher churn rate within 30 days. I built an early warning trigger — any integrator below the threshold received a proactive outreach. This improved 30-day activation by 30%. The insight came entirely from data, not intuition, and it's now a standard part of the integrator health scorecard.` },
    { question: `Why ${company}? Why this role specifically?`,
      answer: `${company} operates at a scale and domain that directly matches my background in ${skills}. My work at Amazon on API integrations and enterprise partnerships has given me a strong foundation, but I'm looking to apply these skills in a more product-focused environment. This ${job.title} role sits at the intersection of technical depth and business impact — which is exactly where I do my best work. I'm particularly excited about the opportunity to shape how partners and developers experience ${company}'s platform.` },
    { question: `How do you handle a situation where a key stakeholder disagrees with your recommendation?`,
      answer: `I first make sure I fully understand their concern — often disagreement comes from different information sets, not different goals. I then present my data and reasoning transparently and ask them to point out any gaps. If we still disagree, I propose a time-bound experiment to test both approaches and let results decide. At Amazon, I used this approach when a business stakeholder wanted to deprioritise API quality metrics in favour of volume. I ran a 6-week test showing quality correlated with 3x higher long-term adoption. They became one of the strongest advocates for the quality framework after that.` },
  ];

  const tamQuestions = [
    { question: `How do you build trust with a technical enterprise customer?`,
      answer: `Trust comes from reliability and honesty. In my first 30 days with any enterprise partner at Amazon, I focused on three things: deep discovery to understand their technical environment, a written alignment document on success metrics, and a clear SLA commitment. I never promised what I couldn't deliver. When issues arose, I communicated proactively — even bad news early is better than good news late. This approach led to strong NPS scores and several partners specifically requesting me for their accounts.` },
    { question: `Walk me through how you would onboard a new enterprise integration partner.`,
      answer: `I follow a structured 4-stage process: Discovery (understand their tech stack, use case, and success definition), Technical Kickoff (API walkthrough, sandbox access, documentation review), Integration Support (weekly check-ins, dedicated Slack channel, escalation path), and Go-Live (acceptance testing, SLA sign-off, health scorecard setup). At Amazon I built this framework from scratch for SmartConnect API and reduced average time-to-integration from 45 to 18 days.` },
    ...pmQuestions.slice(2, 6),
  ];

  const questions = isTAM ? tamQuestions : pmQuestions;
  const context = `Focus on demonstrating your API integration depth, stakeholder management at enterprise scale, and your track record of measurable impact at Amazon. ${company} will likely probe on ${skills} — prepare specific examples from SmartConnect API and TCAP.`;

  return { context, questions: questions.slice(0, 8) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ScoreBar({ score, t }) {
  const c = scoreColor(score, t);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <div style={{ width:52, height:4, background:t.border, borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${score}%`, height:4, background:c, borderRadius:4, transition:"width 0.5s" }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono',monospace", minWidth:24 }}>{score}</span>
    </div>
  );
}

function StatusSelect({ status, onChange, t, SS }) {
  const s = SS[status] || SS["Not Applied"];
  return (
    <select value={status} onChange={e => onChange(e.target.value)} onClick={e => e.stopPropagation()}
      style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:6, padding:"4px 8px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif", outline:"none", maxWidth:145 }}>
      {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL GAP PANEL
// ─────────────────────────────────────────────────────────────────────────────

function SkillGapPanel({ gap, t }) {
  const gapColors = { Low: t.green, Medium: t.amber, High: t.red };
  const gc = gapColors[gap.gapRating] || t.accent;
  return (
    <div style={{ marginTop:16, background:t.input, border:`1px solid ${t.border}`, borderRadius:12, padding:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontSize:14, fontWeight:700, color:t.text }}>🎯 Skill Gap Analysis</span>
        <span style={{ background:scoreBg(gap.gapRating==="Low"?80:gap.gapRating==="Medium"?55:25,t), color:gc, border:`1px solid ${gc}40`, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>
          {gap.gapRating} Gap
        </span>
      </div>
      <p style={{ fontSize:13, color:t.textSub, lineHeight:1.7, marginBottom:16 }}>{gap.assessment}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, color:t.green, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>✅ You Have</div>
          {gap.matchingSkills?.map(s => (
            <div key={s} style={{ background:t === DARK?"#052a18":"#d4f5e8", color:t === DARK?"#2ecc8a":"#0a7a50", border:`1px solid ${t === DARK?"#0a5030":"#80d8b0"}`, borderRadius:6, padding:"4px 10px", fontSize:12, marginBottom:4 }}>✓ {s}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:11, color:t.red, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>⚠ Gaps to Bridge</div>
          {gap.missingSkills?.map((s,i) => {
            const ic = s.importance==="High"?t.red:s.importance==="Medium"?t.amber:t.textDim;
            return (
              <div key={i} style={{ background:t === DARK?"#1a0808":"#fde8e8", border:`1px solid ${t === DARK?"#350f0f":"#f0c0c0"}`, borderRadius:6, padding:"6px 10px", marginBottom:4 }}>
                <div style={{ color:ic, fontWeight:600, fontSize:12 }}>{s.importance==="High"?"🔴":s.importance==="Medium"?"🟡":"⚪"} {s.skill}</div>
                <div style={{ color:t.textDim, fontSize:11, marginTop:2 }}>{s.description}</div>
              </div>
            );
          })}
        </div>
      </div>
      {gap.learningPlan?.length > 0 && (
        <>
          <div style={{ fontSize:11, color:t.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>📚 Learning Plan — Priority Order</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr>{["#","Skill","Course","Platform","Time","Link"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"6px 10px", color:t.textMuted, fontSize:11, fontWeight:600, borderBottom:`1px solid ${t.border}` }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {gap.learningPlan.map((item,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${t.border2}` }}>
                    <td style={{ padding:"8px 10px", color:t.textMuted, fontFamily:"'IBM Plex Mono',monospace" }}>#{i+1}</td>
                    <td style={{ padding:"8px 10px", color:t.text, fontWeight:600 }}>{item.skill}</td>
                    <td style={{ padding:"8px 10px", color:t.textSub }}>{item.course}</td>
                    <td style={{ padding:"8px 10px", color:t.accent }}>{item.platform}</td>
                    <td style={{ padding:"8px 10px", color:t.textDim, fontFamily:"'IBM Plex Mono',monospace" }}>{item.weeks}w</td>
                    <td style={{ padding:"8px 10px" }}>
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        style={{ color:t.accent, fontSize:12, textDecoration:"none", border:`1px solid ${t.border}`, borderRadius:5, padding:"2px 8px" }}>↗</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW PREP PANEL
// ─────────────────────────────────────────────────────────────────────────────

function InterviewPrepPanel({ prep, t }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginTop:16, background:t.input, border:`1px solid ${t.border}`, borderRadius:12, padding:20 }}>
      <div style={{ fontSize:14, fontWeight:700, color:t.text, marginBottom:6 }}>🎤 Interview Prep</div>
      <p style={{ fontSize:12, color:t.textSub, lineHeight:1.6, marginBottom:16 }}>{prep.context}</p>
      {prep.questions?.map((q,i) => (
        <div key={i} style={{ marginBottom:8, border:`1px solid ${t.border}`, borderRadius:10, overflow:"hidden" }}>
          <button onClick={() => setOpen(open===i?null:i)}
            style={{ width:"100%", padding:"12px 16px", background:open===i?t.surface3:t.surface2, border:"none", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"'Sora',sans-serif", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ background:t.accent+"22", color:t.accent, borderRadius:6, padding:"2px 9px", fontSize:11, fontWeight:700, flexShrink:0 }}>Q{i+1}</span>
              <span style={{ fontSize:13, color:t.text, textAlign:"left", fontWeight:500 }}>{q.question}</span>
            </div>
            <span style={{ color:t.textMuted, fontSize:11, transform:open===i?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0 }}>▼</span>
          </button>
          {open === i && (
            <div style={{ padding:"14px 16px", background:t.input, borderTop:`1px solid ${t.border}` }}>
              <div style={{ fontSize:11, color:t.green, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>📝 Model Answer</div>
              <p style={{ margin:0, fontSize:13, color:t.textSub, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{q.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES FIELD
// ─────────────────────────────────────────────────────────────────────────────

function NotesField({ jobId, notes, updateNote, t }) {
  const [val, setVal] = useState(notes || "");
  return (
    <div style={{ marginTop:16 }}>
      <div style={{ fontSize:11, color:t.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>📝 Notes</div>
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => updateNote(jobId, val)}
        placeholder="Recruiter name, referral contact, interview date, last conversation…"
        rows={3}
        style={{ width:"100%", background:t.input, border:`1px solid ${t.border}`, borderRadius:10, padding:"10px 14px", color:t.text, fontSize:13, fontFamily:"'Sora',sans-serif", lineHeight:1.7, resize:"vertical", outline:"none", transition:"border-color 0.15s" }}
        onFocus={e => e.target.style.borderColor = t.accent}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────

function DetailPanel({ job, status, jobState, onApply, onGenerateCV, onSkillGap, onInterviewPrep, updateStatus, updateNote, t, SS }) {
  return (
    <div style={{ padding:"20px 24px 24px", background:t === DARK?"#08101c":t.surface2, borderTop:`1px solid ${t.border}` }}>
      <div style={{ display:"flex", gap:24, marginBottom:20 }}>
        {/* JD */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontWeight:700 }}>Job Description</div>
          <p style={{ margin:0, fontSize:13, color:t.textSub, lineHeight:1.8 }}>{job.jd}</p>
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:11, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontWeight:700 }}>Required Skills</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(Array.isArray(job.skills) ? job.skills : []).map(s => {
                const myS = SHUBHAM_SKILLS.map(x=>x.toLowerCase());
                const match = myS.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms));
                return (
                  <span key={s} style={{
                    background: match ? (t===DARK?"#052a18":"#d4f5e8") : (t===DARK?"#1a0d00":"#fff3cc"),
                    color:      match ? (t===DARK?"#2ecc8a":"#0a7a50") : (t===DARK?"#f9a825":"#a06000"),
                    border:`1px solid ${match ? (t===DARK?"#0a5030":"#80d8b0") : (t===DARK?"#503000":"#e0c060")}`,
                    borderRadius:20, padding:"3px 11px", fontSize:12
                  }}>{match ? "✓" : "△"} {s}</span>
                );
              })}
            </div>
          </div>
          <NotesField jobId={job.id} notes={jobState?.note} updateNote={updateNote} t={t} />
        </div>

        {/* Status */}
        <div style={{ width:170, flexShrink:0 }}>
          <div style={{ fontSize:11, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontWeight:700 }}>Status</div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {STATUSES.map(s => {
              const active = s === status;
              const sc = SS[s];
              return (
                <button key={s} onClick={() => updateStatus(job.id, s)} style={{
                  background: active ? sc.bg : "transparent",
                  color: active ? sc.color : t.textMuted,
                  border: `1px solid ${active ? sc.border : t.border}`,
                  borderRadius:7, padding:"6px 11px", cursor:"pointer",
                  fontSize:11, textAlign:"left", fontFamily:"'Sora',sans-serif",
                  fontWeight: active ? 700 : 400, transition:"all 0.15s"
                }}>{active ? "● " : "○ "}{s}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
        {[
          { label: status !== "Not Applied" ? `✅ ${status} — Reapply` : "🚀 One-Click Apply",
            primary:true, loading:false, onClick:()=>onApply(job) },
          { label: "📄 Download Tailored CV",
            loading:false, onClick:()=>onGenerateCV(job) },
          { label: "🎯 Skill Gap",
            loading:false, onClick:()=>onSkillGap(job) },
          { label: "🎤 Interview Prep",
            loading:false, onClick:()=>onInterviewPrep(job) },
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} disabled={btn.loading} style={{
            background: btn.primary ? "linear-gradient(135deg,#1060e0,#0090e0)" : t.surface3,
            color: btn.primary ? "#fff" : t.textSub,
            border: btn.primary ? "none" : `1px solid ${t.border}`,
            borderRadius:10, padding:"12px 0",
            fontSize:12, fontWeight:btn.primary?700:600, cursor:btn.loading?"not-allowed":"pointer",
            fontFamily:"'Sora',sans-serif", opacity:btn.loading?0.7:1,
            boxShadow: btn.primary && !btn.loading ? "0 0 20px #1060e030" : "none",
            transition:"opacity 0.15s"
          }}>{btn.label}</button>
        ))}
      </div>

      {jobState?.skillGap    && <SkillGapPanel gap={jobState.skillGap} t={t} />}
      {jobState?.interviewPrep && <InterviewPrepPanel prep={jobState.interviewPrep} t={t} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH + FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────

function FilterBar({ search, setSearch, sourceFilter, setSourceFilter, sortBy, setSortBy, t }) {
  const sources = ["LinkedIn","Naukri","IIMJobs","Indeed","Company"];
  const sorts   = [
    { val:"score",   label:"Score ↓" },
    { val:"newest",  label:"Newest" },
    { val:"salary",  label:"Salary ↓" },
    { val:"company", label:"Company A–Z" },
  ];

  return (
    <div style={{ display:"flex", gap:10, alignItems:"center", padding:"16px 0 0", flexWrap:"wrap" }}>
      {/* Search */}
      <div style={{ position:"relative", flex:1, minWidth:200 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:t.textMuted, fontSize:14, pointerEvents:"none" }}>🔍</span>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search company, role, skill…"
          style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:10, padding:"9px 12px 9px 36px", color:t.text, fontSize:13, fontFamily:"'Sora',sans-serif", outline:"none" }}
        />
      </div>

      {/* Source filter */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {sources.map(src => {
          const on = sourceFilter.includes(src);
          return (
            <button key={src} onClick={()=>setSourceFilter(prev=>on?prev.filter(s=>s!==src):[...prev,src])}
              style={{ background:on?t.accent+"22":t.surface2, color:on?t.accent:t.textMuted, border:`1px solid ${on?t.accent:t.border}`, borderRadius:20, padding:"6px 14px", fontSize:12, cursor:"pointer", fontFamily:"'Sora',sans-serif", fontWeight:on?600:400 }}>
              {src}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
        style={{ background:t.surface2, color:t.text, border:`1px solid ${t.border}`, borderRadius:10, padding:"9px 14px", fontSize:13, fontFamily:"'Sora',sans-serif", outline:"none", cursor:"pointer" }}>
        {sorts.map(s=><option key={s.val} value={s.val}>{s.label}</option>)}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB TABLE
// ─────────────────────────────────────────────────────────────────────────────

function JobTable({ jobs, jobStatuses, expandedId, setExpandedId, updateStatus, detailState, onApply, onGenerateCV, onSkillGap, onInterviewPrep, updateNote, isTier1, t, SS }) {
  if (jobs.length === 0) return (
    <div style={{ textAlign:"center", padding:"60px 0", color:t.textMuted }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
      <div style={{ fontSize:14 }}>No jobs match your current filters.</div>
    </div>
  );

  return (
    <div style={{ paddingTop:4 }}>
      <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 100px 110px 72px 110px 130px 150px 28px", padding:"9px 18px", background:t.surface, borderRadius:"10px 10px 0 0", border:`1px solid ${t.border}`, borderBottom:"none" }}>
        {["#","Job / Company","Location","Salary","Level","Skills %","Score","Status",""].map((h,i)=>(
          <div key={i} style={{ fontSize:10, color:t.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6 }}>{h}</div>
        ))}
      </div>

      <div style={{ border:`1px solid ${t.border}`, borderRadius:"0 0 10px 10px", overflow:"hidden" }}>
        {jobs.map((job, idx) => {
          const status = jobStatuses[job.id]?.status || "Not Applied";
          const jState = detailState[job.id] || {};
          const open   = expandedId === job.id;
          const sc     = job.score;
          const topHit = isTier1 && sc.total >= 75;

          return (
            <div key={job.id}>
              <div onClick={() => setExpandedId(open ? null : job.id)}
                style={{
                  display:"grid", gridTemplateColumns:"36px 1fr 100px 110px 72px 110px 130px 150px 28px",
                  padding:"13px 18px", cursor:"pointer", transition:"background 0.15s",
                  background: open ? (t===DARK?"#09182c":t.surface3) : idx%2===0 ? t.rowOdd : t.rowEven,
                  borderTop: idx > 0 ? `1px solid ${t.border2}` : "none",
                  borderLeft: `3px solid ${topHit ? t.green : open ? t.accent : "transparent"}`
                }}>

                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:12, color:t.textMuted, fontFamily:"'IBM Plex Mono',monospace" }}>{idx+1}</span>
                  {job.isNew && <span style={{ width:6, height:6, background:t.accent, borderRadius:"50%", flexShrink:0, boxShadow:`0 0 6px ${t.accent}` }} />}
                </div>

                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:t.text, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{job.title}</div>
                  <div style={{ fontSize:11, color:t.textDim }}>
                    <span style={{ color:t.accent, fontWeight:500 }}>{job.company}</span>
                    {job.score?.isWatchlist && job.company && <span style={{ marginLeft:4, fontSize:10, background:t.amber+"22", color:t.amber, border:`1px solid ${t.amber}44`, borderRadius:4, padding:"1px 5px", fontWeight:700 }}>★ Watchlist</span>}
                    <span style={{ margin:"0 5px" }}>·</span>{job.source}
                    <span style={{ margin:"0 5px" }}>·</span>{job.posted}
                    {jState?.note && <span style={{ marginLeft:6, color:t.amber }}>📝</span>}
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", fontSize:12, color:t.textDim }}>{job.location}</div>

                <div style={{ display:"flex", alignItems:"center", fontSize:12, fontFamily:"'IBM Plex Mono',monospace", color:(job.salary||job.salary_lpa) ? t.text : t.textMuted }}>
                  {job.salary_display || job.salaryDisplay || "Not Listed"}
                </div>

                <div style={{ display:"flex", alignItems:"center" }}>
                  <span style={{
                    fontSize:10, borderRadius:5, padding:"2px 6px", fontWeight:600,
                    background: job.levelMatch==="Right" ? (t===DARK?"#061828":"#ddeeff") : job.levelMatch==="Senior" ? (t===DARK?"#0a1e08":"#d4f5e8") : (t===DARK?"#1a1500":"#fff3cc"),
                    color: job.levelMatch==="Right" ? t.accent : job.levelMatch==="Senior" ? t.green : t.amber
                  }}>{job.levelMatch}</span>
                </div>

                <div style={{ display:"flex", alignItems:"center" }}><ScoreBar score={sc?.skills??0} t={t} /></div>

                <div style={{ display:"flex", alignItems:"center" }}>
                  <div style={{ background:scoreBg(sc?.total??0,t), border:`1px solid ${scoreColor(sc?.total??0,t)}30`, borderRadius:8, padding:"4px 10px", display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:40, height:4, background:t.border, borderRadius:4, overflow:"hidden" }}>
                      <div style={{ width:`${sc?.total??0}%`, height:4, background:scoreColor(sc?.total??0,t), borderRadius:4 }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:800, color:scoreColor(sc?.total??0,t), fontFamily:"'IBM Plex Mono',monospace" }}>{sc?.total??0}</span>
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center" }} onClick={e=>e.stopPropagation()}>
                  <StatusSelect status={status} onChange={v=>updateStatus(job.id,v)} t={t} SS={SS} />
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", color:t.textMuted, fontSize:11, transition:"transform 0.2s", transform:open?"rotate(180deg)":"none" }}>▼</div>
              </div>

              {open && (
                <DetailPanel job={job} status={status} jobState={jState}
                  onApply={onApply} onGenerateCV={onGenerateCV} onSkillGap={onSkillGap} onInterviewPrep={onInterviewPrep}
                  updateStatus={updateStatus} updateNote={updateNote} t={t} SS={SS} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACKER TAB
// ─────────────────────────────────────────────────────────────────────────────

function TrackerTab({ jobs, jobStatuses, updateStatus, t, SS }) {
  const applied = jobs.filter(j => jobStatuses[j.id]?.status !== "Not Applied");
  const pipeline = STATUSES.slice(1).map(s => ({ status:s, count:applied.filter(j=>jobStatuses[j.id]?.status===s).length }));

  return (
    <div style={{ paddingTop:24 }}>
      <div style={{ display:"flex", gap:10, marginBottom:28, overflowX:"auto", paddingBottom:4 }}>
        {pipeline.map(({ status, count }) => {
          const sc = SS[status];
          return (
            <div key={status} style={{ minWidth:130, background:t.surface2, border:`1px solid ${sc.border}`, borderRadius:12, padding:"16px 16px 14px", flexShrink:0 }}>
              <div style={{ fontSize:28, fontWeight:800, color:sc.color, fontFamily:"'IBM Plex Mono',monospace", lineHeight:1 }}>{count}</div>
              <div style={{ fontSize:11, color:t.textMuted, marginTop:6, fontWeight:500 }}>{status}</div>
            </div>
          );
        })}
      </div>

      {applied.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:t.textMuted }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
          <div>No applications yet — start applying from the job tabs!</div>
        </div>
      ) : (
        <div style={{ background:t.surface2, borderRadius:12, overflow:"hidden", border:`1px solid ${t.border}` }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:t.surface }}>
                {["Company","Role","Salary","Applied","Status","Link"].map(h=>(
                  <th key={h} style={{ padding:"11px 16px", textAlign:"left", color:t.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applied.map(job=>{
                const jst = jobStatuses[job.id];
                return (
                  <tr key={job.id} style={{ borderTop:`1px solid ${t.border2}` }}>
                    <td style={{ padding:"12px 16px", color:t.text, fontWeight:700 }}>{job.company}</td>
                    <td style={{ padding:"12px 16px", color:t.textSub }}>{job.title}</td>
                    <td style={{ padding:"12px 16px", color:t.textMuted, fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>{job.salaryDisplay}</td>
                    <td style={{ padding:"12px 16px", color:t.textMuted, fontSize:12 }}>{jst?.appliedDate || "—"}</td>
                    <td style={{ padding:"12px 16px" }}><StatusSelect status={jst?.status} onChange={v=>updateStatus(job.id,v)} t={t} SS={SS} /></td>
                    <td style={{ padding:"12px 16px" }}>
                      <a href={job.link} target="_blank" rel="noopener noreferrer"
                        style={{ color:t.accent, fontSize:12, textDecoration:"none", border:`1px solid ${t.border}`, borderRadius:5, padding:"3px 9px" }}>↗</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS MODAL
// ─────────────────────────────────────────────────────────────────────────────

function SettingsModal({ settings, setSettings, onClose, t }) {
  const [d, setD] = useState({
    ...settings,
    weights: {...settings.weights},
    salaryBuckets: {...settings.salaryBuckets},
    targetRoles: [...settings.targetRoles],
    targetCompanies: [...settings.targetCompanies],
    locations: [...settings.locations]
  });
  const [newRole, setNewRole] = useState("");
  const [newCo,   setNewCo]   = useState("");
  const [newLoc,  setNewLoc]  = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);
  const totalW = Object.values(d.weights).reduce((a,b)=>a+b,0);
  const wOk    = totalW === 100;

  const save = () => { setSettings(d); onClose(); };

  const resetToDefault = () => {
    setD({
      ...DEFAULT_SETTINGS,
      weights: {...DEFAULT_SETTINGS.weights},
      salaryBuckets: {...DEFAULT_SETTINGS.salaryBuckets},
      targetRoles: [...DEFAULT_SETTINGS.targetRoles],
      targetCompanies: [...DEFAULT_SETTINGS.targetCompanies],
      locations: [...DEFAULT_SETTINGS.locations]
    });
    setResetConfirm(false);
  };

  const Inp = ({ value, onChange, ...rest }) => (
    <input value={value} onChange={onChange} {...rest}
      style={{ background:t.input, border:`1px solid ${t.border}`, borderRadius:8, padding:"8px 12px", color:t.text, fontSize:13, fontFamily:"'Sora',sans-serif", outline:"none", width:"100%", ...rest.style }} />
  );

  const Chip = ({ label, onRemove }) => (
    <span style={{ background:t.surface2, color:t.textSub, border:`1px solid ${t.border}`, borderRadius:20, padding:"4px 10px", fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:14, padding:0, lineHeight:1, fontWeight:700 }}>×</button>
    </span>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:26 }}>
      <div style={{ fontSize:11, color:t.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, marginBottom:14, paddingBottom:8, borderBottom:`1px solid ${t.border}` }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", justifyContent:"flex-end" }}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{ width:500, height:"100vh", background:t.surface, borderLeft:`1px solid ${t.border}`, overflowY:"auto", padding:"28px 28px 40px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:t.text }}>⚙️ Settings</div>
            <div style={{ fontSize:12, color:t.textMuted, marginTop:2 }}>Changes re-score all jobs on Save</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:t.textMuted, fontSize:22, cursor:"pointer" }}>✕</button>
        </div>

        {/* Reset to Defaults */}
        <div style={{ background: resetConfirm ? (t===DARK?"#280808":"#fde8e8") : t.surface2, border:`1px solid ${resetConfirm?t.red:t.border}`, borderRadius:12, padding:"14px 16px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color: resetConfirm ? t.red : t.text }}>
              {resetConfirm ? "⚠ This will reset everything to defaults" : "↩ Reset to Default Settings"}
            </div>
            <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>
              {resetConfirm ? "All your customisations will be lost. Sure?" : "Salary buckets, weights, roles, companies — all reset"}
            </div>
          </div>
          {!resetConfirm ? (
            <button onClick={()=>setResetConfirm(true)}
              style={{ background:t.surface3, color:t.textSub, border:`1px solid ${t.border}`, borderRadius:8, padding:"7px 16px", cursor:"pointer", fontSize:12, fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap" }}>
              Reset
            </button>
          ) : (
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setResetConfirm(false)}
                style={{ background:t.surface3, color:t.textSub, border:`1px solid ${t.border}`, borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:12, fontFamily:"'Sora',sans-serif" }}>
                Cancel
              </button>
              <button onClick={resetToDefault}
                style={{ background:t.red, color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:12, fontFamily:"'Sora',sans-serif", fontWeight:700 }}>
                Yes, Reset
              </button>
            </div>
          )}
        </div>

        {/* Salary */}
        <Section title="Salary Buckets (LPA)">
          <div style={{ display:"flex", gap:14 }}>
            {[["tier1","🟢 Premium threshold"],["tier2","🔵 Good threshold"]].map(([k,label])=>(
              <div key={k} style={{ flex:1 }}>
                <div style={{ fontSize:11, color:t.textMuted, marginBottom:6 }}>{label}</div>
                <Inp type="number" value={d.salaryBuckets[k]}
                  onChange={e=>setD(p=>({...p,salaryBuckets:{...p.salaryBuckets,[k]:Number(e.target.value)}}))} />
              </div>
            ))}
          </div>
        </Section>

        {/* Weights */}
        <Section title={`Scoring Weights (${totalW}% ${wOk?"✓":"— must = 100%"})`}>
          {[["salary","Salary Alignment"],["role","Role Title Match"],["skills","Skills Match"],["workex","Work Experience"]].map(([k,label])=>(
            <div key={k} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:t.textSub }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"'IBM Plex Mono',monospace" }}>{d.weights[k]}%</span>
              </div>
              <input type="range" min={0} max={60} value={d.weights[k]}
                onChange={e=>setD(p=>({...p,weights:{...p.weights,[k]:Number(e.target.value)}}))}
                style={{ width:"100%", accentColor:t.accent, cursor:"pointer" }} />
            </div>
          ))}
          {!wOk && <div style={{ fontSize:12, color:t.red, marginTop:4 }}>⚠ Total must equal 100% (currently {totalW}%)</div>}
        </Section>

        {/* Target Roles */}
        <Section title="Target Roles">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {d.targetRoles.map(r=>(
              <Chip key={r} label={r} onRemove={()=>setD(p=>({...p,targetRoles:p.targetRoles.filter(x=>x!==r)}))} />
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Inp value={newRole} onChange={e=>setNewRole(e.target.value)} placeholder="Add role and press Enter…"
              onKeyDown={e=>{if(e.key==="Enter"&&newRole.trim()){setD(p=>({...p,targetRoles:[...p.targetRoles,newRole.trim()]}));setNewRole("");}}} />
            <button onClick={()=>{if(newRole.trim()){setD(p=>({...p,targetRoles:[...p.targetRoles,newRole.trim()]}));setNewRole("");}}}
              type="button" style={{ background:t.surface3, color:t.accent, border:`1px solid ${t.border}`, borderRadius:8, padding:"0 16px", cursor:"pointer", fontSize:13, fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap" }}>Add</button>
          </div>
        </Section>

        {/* Target Companies */}
        <Section title="Watchlist Companies (★ +5 score bonus — not a filter)">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {d.targetCompanies.map(c=>(
              <Chip key={c} label={c} onRemove={()=>setD(p=>({...p,targetCompanies:p.targetCompanies.filter(x=>x!==c)}))} />
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Inp value={newCo} onChange={e=>setNewCo(e.target.value)} placeholder="Add company…"
              onKeyDown={e=>{if(e.key==="Enter"&&newCo.trim()){setD(p=>({...p,targetCompanies:[...p.targetCompanies,newCo.trim()]}));setNewCo("");}}} />
            <button onClick={()=>{if(newCo.trim()){setD(p=>({...p,targetCompanies:[...p.targetCompanies,newCo.trim()]}));setNewCo("");}}}
              type="button" style={{ background:t.surface3, color:t.accent, border:`1px solid ${t.border}`, borderRadius:8, padding:"0 16px", cursor:"pointer", fontSize:13, fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap" }}>Add</button>
          </div>
        </Section>

        {/* Locations */}
        <Section title="Preferred Locations (for display only — scraper fetches all India)">
          <div style={{ fontSize:11, color:t.textMuted, marginBottom:8 }}>Quick add common cities:</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {["Bangalore","Delhi","Mumbai","Hyderabad","Chennai","Pune","Gurugram","Noida","Remote","Pan-India"].map(loc => {
              const on = d.locations.includes(loc);
              return (
                <button key={loc} type="button"
                  onClick={e=>{e.preventDefault();e.stopPropagation();setD(p=>({...p,locations:on?p.locations.filter(l=>l!==loc):[...p.locations,loc]}));}}
                  style={{ background:on?t.accent+"22":t.surface2, color:on?t.accent:t.textMuted, border:`1px solid ${on?t.accent:t.border}`, borderRadius:8, padding:"6px 13px", cursor:"pointer", fontSize:12, fontFamily:"'Sora',sans-serif", fontWeight:on?700:400 }}>
                  {on ? "✓ " : ""}{loc}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize:11, color:t.textMuted, marginBottom:6 }}>Your selected locations:</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10, minHeight:32 }}>
            {d.locations.length === 0 && <span style={{ fontSize:12, color:t.textMuted, fontStyle:"italic" }}>No locations added yet</span>}
            {d.locations.map(loc => (
              <span key={loc} style={{ background:t.surface2, color:t.textSub, border:`1px solid ${t.border}`, borderRadius:20, padding:"4px 10px", fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
                {loc}
                <button type="button" onClick={e=>{e.preventDefault();e.stopPropagation();setD(p=>({...p,locations:p.locations.filter(l=>l!==loc)}));}}
                  style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:14, padding:0, lineHeight:1, fontWeight:700 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={newLoc} onChange={e=>setNewLoc(e.target.value)}
              placeholder="Type any city e.g. Kochi, Ahmedabad, Chandigarh…"
              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();const v=newLoc.trim();if(v&&!d.locations.includes(v)){setD(p=>({...p,locations:[...p.locations,v]}));setNewLoc("");}}}}
              style={{ flex:1, background:t.input, border:`1px solid ${t.border}`, borderRadius:8, padding:"8px 12px", color:t.text, fontSize:13, fontFamily:"'Sora',sans-serif", outline:"none" }} />
            <button type="button"
              onClick={e=>{e.preventDefault();const v=newLoc.trim();if(v&&!d.locations.includes(v)){setD(p=>({...p,locations:[...p.locations,v]}));setNewLoc("");}}}
              style={{ background:t.surface3, color:t.accent, border:`1px solid ${t.border}`, borderRadius:8, padding:"0 16px", cursor:"pointer", fontSize:13, fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap" }}>Add</button>
          </div>
        </Section>

        {/* Base CV */}
        <Section title="Base CV">
          <textarea value={d.baseCv} onChange={e=>setD(p=>({...p,baseCv:e.target.value}))} rows={12}
            style={{ width:"100%", background:t.input, border:`1px solid ${t.border}`, borderRadius:8, padding:12, color:t.textSub, fontSize:11, fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.7, resize:"vertical", outline:"none" }} />
        </Section>

        <button type="button" onClick={e=>{e.preventDefault();e.stopPropagation();save();}} disabled={!wOk} style={{
          width:"100%", background: wOk ? "linear-gradient(135deg,#1060e0,#0090e0)" : t.border,
          color: wOk ? "#fff" : t.textMuted, border:"none", borderRadius:12,
          padding:"15px 0", fontSize:15, fontWeight:700, cursor:wOk?"pointer":"not-allowed",
          fontFamily:"'Sora',sans-serif", boxShadow:wOk?"0 0 30px #1060e030":"none"
        }}>
          {wOk ? "✅ Save & Re-score All Jobs" : `⚠ Weights must total 100% (currently ${totalW}%)`}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ApplyModal({ job, coverLetter, onClose, t }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(coverLetter).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{ width:580, background:t.surface, border:`1px solid ${t.border}`, borderRadius:18, padding:32, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 0 60px #00000050" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div>
            <div style={{ fontSize:11, color:t.green, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>✅ Applied — Status Updated</div>
            <div style={{ fontSize:18, fontWeight:700, color:t.text }}>{job.title} <span style={{ color:t.accent }}>@ {job.company}</span></div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:t.textMuted, fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        <p style={{ fontSize:12, color:t.textMuted, marginBottom:20 }}>Job page opened in a new tab. Copy your tailored cover letter below before submitting.</p>
        <div style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:10, padding:"20px 22px", marginBottom:18 }}>
          <p style={{ margin:0, fontSize:14, color:t.textSub, lineHeight:1.85, whiteSpace:"pre-wrap" }}>{coverLetter}</p>
        </div>
        <button onClick={copy} style={{
          width:"100%", background:copied?(t===DARK?"#052a18":"#d4f5e8"):t.surface3,
          color:copied?t.green:t.accent, border:`1px solid ${copied?t.green:t.border}`,
          borderRadius:10, padding:"13px 0", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif"
        }}>
          {copied ? "✅ Copied to Clipboard!" : "📋 Copy Cover Letter"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

export default function JobRadar() {
  const [isDark,       setIsDark]       = useState(true);
  const t = isDark ? DARK : LIGHT;
  const SS = isDark ? STATUS_STYLES_DARK : STATUS_STYLES_LIGHT;

  const [settings,     setSettings]     = useState(DEFAULT_SETTINGS);
  const [rawJobs,      setRawJobs]      = useState(MOCK_JOBS);
  const [jobsLoading,  setJobsLoading]  = useState(true);
  const [jobsError,    setJobsError]    = useState(null);
  const [jobStatuses,  setJobStatuses]  = useState(
    Object.fromEntries(MOCK_JOBS.map(j=>[j.id,{ status:j.initStatus || "Not Applied", appliedDate:null }]))
  );
  const [expandedId,   setExpandedId]   = useState(null);
  const [activeTab,    setActiveTab]    = useState("tier1");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [applyModal,   setApplyModal]   = useState(null);
  const [detailState,  setDetailState]  = useState({});
  const [search,       setSearch]       = useState("");
  const [sourceFilter, setSourceFilter] = useState([]);
  const [sortBy,       setSortBy]       = useState("score");
  const [salaryRange,  setSalaryRange]  = useState([0, 200]);
  const [jobNotes,     setJobNotes]     = useState({});

  // ── Fetch real jobs from scraper output ─────────────────────────
  useEffect(() => {
    setJobsLoading(true);
    fetch("./jobs.json?t=" + Date.now())
      .then(r => {
        if (!r.ok) throw new Error("jobs.json not found");
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRawJobs(data);
          // Init statuses for new jobs (preserve existing)
          setJobStatuses(prev => {
            const next = { ...prev };
            data.forEach(j => {
              if (!next[j.id]) {
                next[j.id] = { status: "Not Applied", appliedDate: null };
              }
            });
            return next;
          });
          setJobsError(null);
        }
      })
      .catch(err => {
        // Silently fall back to mock data — don't show error
        setJobsError("Using demo data — scraper not yet connected");
        console.warn("Could not load jobs.json, using mock data:", err.message);
      })
      .finally(() => setJobsLoading(false));
  }, []);

  const updateStatus = (jobId, status) => {
    setJobStatuses(prev=>({...prev,[jobId]:{
      status,
      appliedDate:
        ["Applied","Screening","Interview Scheduled","Offer Received"].includes(status) && !prev[jobId]?.appliedDate
          ? new Date().toISOString().split("T")[0]
          : prev[jobId]?.appliedDate
    }}));
  };

  const updateNote = (jobId, note) => {
    setJobNotes(prev=>({...prev,[jobId]:note}));
    setDetailState(prev=>({...prev,[jobId]:{...prev[jobId],note}}));
  };

  const patchDetail = (jobId, fields) =>
    setDetailState(prev=>({...prev,[jobId]:{...prev[jobId],...fields}}));

  const scoredJobs = useMemo(()=>
    rawJobs.map(j=>({...j,score:computeScore(j,settings)})),
    [rawJobs, settings]
  );

  const applyFiltersAndSort = useCallback((list) => {
    let out = [...list];
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(j =>
        (j.title||"").toLowerCase().includes(q) ||
        (j.company||"").toLowerCase().includes(q) ||
        (j.jd||"").toLowerCase().includes(q) ||
        (Array.isArray(j.skills) && j.skills.some(s=>s.toLowerCase().includes(q)))
      );
    }
    if (sourceFilter.length > 0) out = out.filter(j=>sourceFilter.includes(j.source));
    // Salary range filter — only apply if user has moved the sliders
    if (salaryRange[0] > 0 || salaryRange[1] < 200) {
      out = out.filter(j => {
        const s = j.salary_lpa !== undefined ? j.salary_lpa : j.salary;
        if (s === null || s === undefined) return salaryRange[1] >= 200;
        return s >= salaryRange[0] && s <= salaryRange[1];
      });
    }
    out.sort((a,b) => {
      const aScore = a.score?.total ?? (typeof a.score === "number" ? a.score : 0);
      const bScore = b.score?.total ?? (typeof b.score === "number" ? b.score : 0);
      if (sortBy === "score")   return bScore - aScore;
      const aSal = a.salary_lpa ?? a.salary ?? 0;
      const bSal = b.salary_lpa ?? b.salary ?? 0;
      if (sortBy === "salary")  return bSal - aSal;
      if (sortBy === "company") return (a.company||"").localeCompare(b.company||"");
      if (sortBy === "newest")  return (a.posted||"").localeCompare(b.posted||"");
      return 0;
    });
    return out;
  }, [search, sourceFilter, sortBy, salaryRange]);

  // Support both mock (salary) and scraped (salary_lpa) fields
  const getSalary = j => j.salary_lpa !== undefined ? j.salary_lpa : j.salary;
  const t1 = useMemo(()=>applyFiltersAndSort(scoredJobs.filter(j=>getSalary(j)!==null && getSalary(j)!==undefined && getSalary(j)>=settings.salaryBuckets.tier1)),   [scoredJobs,applyFiltersAndSort,settings]);
  const t2 = useMemo(()=>applyFiltersAndSort(scoredJobs.filter(j=>getSalary(j)!==null && getSalary(j)!==undefined && getSalary(j)>=settings.salaryBuckets.tier2 && getSalary(j)<settings.salaryBuckets.tier1)), [scoredJobs,applyFiltersAndSort,settings]);
  const na = useMemo(()=>applyFiltersAndSort(scoredJobs.filter(j=>getSalary(j)===null || getSalary(j)===undefined)), [scoredJobs,applyFiltersAndSort]);
  const applied = scoredJobs.filter(j=>jobStatuses[j.id]?.status!=="Not Applied");

  const handleApply = job => {
    const coverLetter = generateCoverLetter(job, settings.baseCv);
    window.open(job.link, "_blank");
    updateStatus(job.id, "Applied");
    setApplyModal({ job, coverLetter });
  };

  const handleGenerateCV = job => {
    const cvHtml = generateTailoredCV(job, settings.baseCv);
    const full = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="UTF-8"><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:1in;color:#111;max-width:720px}h1{font-size:16pt;margin:0 0 4px}h2{font-size:12pt;border-bottom:1.5px solid #333;margin:18px 0 8px;padding-bottom:4px}p,li{margin:4px 0;line-height:1.5}ul{padding-left:22px;margin:6px 0}</style></head><body>${cvHtml}</body></html>`;
    const blob = new Blob(["﻿", full], { type: "application/msword" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `Shubham_Garg_CV_${job.company}.doc`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSkillGap = job => {
    const gap = generateSkillGap(job);
    patchDetail(job.id, { skillGap: gap });
  };

  const handleInterviewPrep = job => {
    const prep = generateInterviewPrep(job);
    patchDetail(job.id, { interviewPrep: prep });
  };

  const tabs = [
    { id:"tier1",   label:`🟢 ${settings.salaryBuckets.tier1}+ LPA`,                                       count:t1.length,      color:t.green  },
    { id:"tier2",   label:`🔵 ${settings.salaryBuckets.tier2}–${settings.salaryBuckets.tier1} LPA`,         count:t2.length,      color:t.accent },
    { id:"na",      label:"⚪ Salary N/A",                                                                   count:na.length,      color:t.textDim},
    { id:"tracker", label:"📋 Tracker",                                                                      count:applied.length, color:t.purple },
  ];

  const currentJobs = activeTab==="tier1" ? t1 : activeTab==="tier2" ? t2 : activeTab==="na" ? na : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;cursor:pointer;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#4dabff;cursor:pointer;}
        select{-webkit-appearance:none;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        a{text-decoration:none;}
        textarea,input,select{font-family:'Sora',sans-serif;}
      `}</style>

      <div style={{ fontFamily:"'Sora',sans-serif", background:t.bg, minHeight:"100vh", color:t.text, transition:"background 0.25s, color 0.25s" }}>

        {/* ── HEADER ── */}
        <div style={{ background:t.surface, borderBottom:`1px solid ${t.border}`, padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, background:"linear-gradient(135deg,#1060e0,#0090e0)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:"0 0 24px #1060e040", flexShrink:0 }}>📡</div>
            <div>
              <div style={{ fontWeight:800, fontSize:22, letterSpacing:"-0.5px", color:t.text }}>JobRadar</div>
              <div style={{ fontSize:11, color:t.textMuted, fontFamily:"'IBM Plex Mono',monospace" }}>
              Shubham Garg · PM II Amazon ·{" "}
              {jobsLoading
                ? <span style={{ color:t.amber }}>⏳ Loading jobs…</span>
                : jobsError
                ? <span style={{ color:t.amber }} title={jobsError}>⚠ {scoredJobs.length} demo jobs (connect scraper)</span>
                : <span style={{ color:t.green }}>✓ {scoredJobs.length} live jobs indexed</span>
              }
            </div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ fontSize:13, display:"flex", gap:18 }}>
              <span><span style={{ color:t.green, fontWeight:800, fontFamily:"'IBM Plex Mono',monospace" }}>{t1.filter(j=>(j.score?.total??0)>=75).length}</span> <span style={{ color:t.textMuted }}>top matches</span></span>
              <span><span style={{ color:t.accent, fontWeight:800, fontFamily:"'IBM Plex Mono',monospace" }}>{applied.length}</span> <span style={{ color:t.textMuted }}>in pipeline</span></span>
              <span><span style={{ color:t.purple, fontWeight:800, fontFamily:"'IBM Plex Mono',monospace" }}>{applied.filter(j=>jobStatuses[j.id]?.status==="Interview Scheduled").length}</span> <span style={{ color:t.textMuted }}>interviews</span></span>
            </div>

            {/* Theme toggle */}
            <button onClick={()=>setIsDark(p=>!p)} title={isDark?"Switch to light mode":"Switch to dark mode"}
              style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:22, padding:"7px 14px", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
              {isDark ? "☀️" : "🌙"}
            </button>

            <button onClick={()=>setSettingsOpen(true)}
              style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:10, padding:"9px 18px", color:t.textSub, cursor:"pointer", fontSize:13, fontFamily:"'Sora',sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:7 }}>
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", borderBottom:`1px solid ${t.border}`, background:t.surface, padding:"0 28px" }}>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              padding:"13px 22px", background:"transparent", border:"none",
              borderBottom:`2px solid ${activeTab===tab.id?tab.color:"transparent"}`,
              color:activeTab===tab.id?tab.color:t.textMuted,
              cursor:"pointer", fontSize:13, fontWeight:activeTab===tab.id?700:400,
              fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8, transition:"all 0.15s"
            }}>
              {tab.label}
              <span style={{ background:activeTab===tab.id?tab.color+"22":t.surface2, color:activeTab===tab.id?tab.color:t.textMuted, borderRadius:10, padding:"1px 9px", fontSize:11, fontWeight:700 }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding:"0 28px 48px" }}>
          {activeTab !== "tracker" && (
            <>
              <FilterBar search={search} setSearch={setSearch} sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} sortBy={sortBy} setSortBy={setSortBy} salaryRange={salaryRange} setSalaryRange={setSalaryRange} t={t} />
              <JobTable
                jobs={currentJobs}
                jobStatuses={jobStatuses}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                updateStatus={updateStatus}
                detailState={detailState}
                onApply={handleApply}
                onGenerateCV={handleGenerateCV}
                onSkillGap={handleSkillGap}
                onInterviewPrep={handleInterviewPrep}
                updateNote={updateNote}
                isTier1={activeTab==="tier1"}
                t={t} SS={SS}
              />
            </>
          )}
          {activeTab === "tracker" && (
            <TrackerTab jobs={scoredJobs} jobStatuses={jobStatuses} updateStatus={updateStatus} t={t} SS={SS} />
          )}
        </div>
      </div>

      {settingsOpen && <SettingsModal settings={settings} setSettings={setSettings} onClose={()=>setSettingsOpen(false)} t={t} />}
      {applyModal   && <ApplyModal job={applyModal.job} coverLetter={applyModal.coverLetter} onClose={()=>setApplyModal(null)} t={t} />}
    </>
  );
}
