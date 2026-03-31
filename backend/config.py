# ─────────────────────────────────────────────────────────────────
# JobRadar — config.py
# Edit ONLY this file to personalise your job search
# ─────────────────────────────────────────────────────────────────

# ── WhatsApp (CallMeBot) ──────────────────────────────────────────
WHATSAPP_PHONE   = "+919643566485"
WHATSAPP_API_KEY = "YOUR_CALLMEBOT_KEY"

# ── Scoring weights (must sum to 100) ────────────────────────────
WEIGHTS = {
    "salary":  35,
    "role":    30,
    "skills":  20,
    "workex":  15,
}

# ── Salary thresholds (LPA) ──────────────────────────────────────
SALARY_TIER1 = 50   # Premium bucket
SALARY_TIER2 = 40   # Good bucket

# ── Minimum salary to scrape (jobs below this are skipped) ────────
# Set to 0 to scrape everything, 30 to skip junior/low-paying roles
MIN_SALARY_LPA = 30

# ── Alert threshold ───────────────────────────────────────────────
ALERT_SCORE_THRESHOLD = 75

# ── Target roles ──────────────────────────────────────────────────
TARGET_ROLES = [
    "Product Manager",
    "Senior Product Manager",
    "Senior Program Manager",
    "Technical Program Manager",
    "Technical Account Manager",
    "Product Operations Manager",
    "Tech Ops Manager",
]

# ── Watchlist companies (+5 score bonus, NOT a filter) ─────────────
TARGET_COMPANIES = [
    "Flipkart", "Google", "Microsoft", "Uber", "Swiggy", "Stripe",
    "Adobe", "Meesho", "Razorpay", "PhonePe", "Zomato",
    "Salesforce", "PayPal", "Atlassian",
]

# ── Candidate skills ──────────────────────────────────────────────
CANDIDATE_SKILLS = [
    "API Integration", "Product Management", "Program Management",
    "SQL", "Prompt Engineering", "Automation", "Process Optimization",
    "Stakeholder Management", "Technical Account Management", "Gen-AI",
    "Last-Mile Delivery", "Seller Partner Management", "Data Analysis",
    "Go-To-Market", "SaaS", "Python", "Fintech",
]

# ── Title blocklist (jobs with these words are skipped) ───────────
TITLE_BLOCKLIST = [
    "intern", "internship", "fresher", "trainee",
    "vice president", "vp ", "director", "chief",
]

# ── LinkedIn queries — broad India-wide, ALL companies ────────────
# Covers all major cities + remote. LinkedIn filters by location.
LINKEDIN_QUERIES = [
    # Bangalore
    "Senior Product Manager Bangalore",
    "Technical Program Manager Bangalore",
    "Technical Account Manager Bangalore",
    "Senior Program Manager Bangalore",
    "Product Operations Manager Bangalore",
    # Delhi / NCR
    "Senior Product Manager Delhi",
    "Technical Program Manager Gurgaon",
    "Senior Product Manager Noida",
    "Technical Account Manager Delhi NCR",
    # Mumbai
    "Senior Product Manager Mumbai",
    "Technical Program Manager Mumbai",
    "Technical Account Manager Mumbai",
    # Hyderabad
    "Senior Product Manager Hyderabad",
    "Technical Program Manager Hyderabad",
    # Chennai
    "Senior Product Manager Chennai",
    "Technical Account Manager Chennai",
    # Remote / Pan-India
    "Senior Product Manager remote India",
    "Technical Program Manager remote India",
    "Product Manager API remote India",
    "Technical Account Manager India",
    "Senior Program Manager API India",
    "Product Manager fintech India",
    "Product Manager SaaS India",
]

# ── Naukri queries — ALL companies, ALL India cities ──────────────
NAUKRI_QUERIES = [
    "Senior Product Manager",
    "Technical Program Manager",
    "Technical Account Manager",
    "Senior Program Manager API",
    "Product Manager API platform",
    "Product Operations Manager",
    "Senior PM fintech",
    "Senior PM SaaS",
    "Tech Ops Manager",
    "Product Manager e-commerce",
    "Senior Program Manager tech",
]

# ── IIMJobs queries — senior roles, ALL companies ─────────────────
IIMJOBS_QUERIES = [
    "Senior Product Manager",
    "Technical Account Manager",
    "Program Manager API",
    "Technical Program Manager",
    "Product Manager fintech",
    "Senior Program Manager",
    "Product Operations Manager",
    "Senior Product Manager SaaS",
]

# ── Company career pages (watchlist only — supplementary) ─────────
COMPANY_CAREER_PAGES = {
    "Flipkart":   "https://www.flipkartcareers.com/#!/joblist",
    "Google":     "https://careers.google.com/jobs/results/?location=India&q=product+manager",
    "Stripe":     "https://stripe.com/jobs/search?l=india",
    "Adobe":      "https://careers.adobe.com/us/en/search-results?keywords=product%20manager&location=India",
    "Salesforce": "https://careers.salesforce.com/en/jobs/?search=product+manager&location=India",
    "Atlassian":  "https://www.atlassian.com/company/careers/all-jobs?team=&location=India&search=product",
    "Meesho":     "https://meesho.io/jobs",
    "Razorpay":   "https://razorpay.com/jobs/",
    "PhonePe":    "https://www.phonepe.com/careers/",
    "Uber":       "https://www.uber.com/us/en/careers/list/?query=product%20manager&location=india",
    "Swiggy":     "https://careers.swiggy.com/#/",
    "Microsoft":  "https://jobs.careers.microsoft.com/global/en/search?q=product%20manager&l=India",
    "Zomato":     "https://www.zomato.com/careers",
    "PayPal":     "https://jobs.paypal.com/en/search#q=product%20manager&location=India",
}

# ── Output paths ──────────────────────────────────────────────────
JOBS_OUTPUT_PATH = "../public/jobs.json"
LOG_PATH         = "../logs/scraper.log"
