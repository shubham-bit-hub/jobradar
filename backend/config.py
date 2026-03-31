# ─────────────────────────────────────────────────────────────────
# JobRadar — config.py
# Edit ONLY this file to personalise your job search
# ─────────────────────────────────────────────────────────────────

# ── WhatsApp (CallMeBot) ──────────────────────────────────────────
# Setup (one-time, 2 minutes):
#   1. Add +34 644 59 74 18 to your WhatsApp contacts
#   2. Send them: "I allow callmebot to send me messages"
#   3. You'll receive an API key — paste it below
WHATSAPP_PHONE   = "+919643566485"
WHATSAPP_API_KEY = "YOUR_CALLMEBOT_KEY"   # replace after setup

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

# ── Target companies (watchlist) ──────────────────────────────────
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

# ── Search locations ──────────────────────────────────────────────
SEARCH_LOCATIONS = ["Bangalore", "Remote", "India"]

# ── Title blocklist (jobs with these words are skipped) ───────────
TITLE_BLOCKLIST = [
    "intern", "internship", "fresher", "trainee",
    "vice president", "vp ", "director", "chief",
]

# ── LinkedIn search queries ────────────────────────────────────────
LINKEDIN_QUERIES = [
    "Senior Product Manager India",
    "Technical Program Manager India",
    "Technical Account Manager India",
    "Senior Program Manager API India",
    "Product Operations Manager India",
    "Senior Product Manager Bangalore",
    "Technical Program Manager Bangalore",
    "Technical Account Manager Bangalore",
    "Senior Product Manager remote India",
    "Tech Ops Manager India",
]

# ── Naukri search queries ─────────────────────────────────────────
NAUKRI_QUERIES = [
    "Senior Product Manager",
    "Technical Program Manager",
    "Technical Account Manager",
    "Senior Program Manager",
    "Product Manager API",
    "Technical Account Manager API",
    "Product Operations Manager",
    "Program Manager product",
]

# ── IIMJobs search queries ────────────────────────────────────────
IIMJOBS_QUERIES = [
    "Senior Product Manager",
    "Technical Account Manager",
    "Program Manager API",
    "Technical Program Manager",
    "Product Manager fintech",
    "Senior Program Manager",
]

# ── Company career page URLs ──────────────────────────────────────
COMPANY_CAREER_PAGES = {
    "Flipkart":   "https://www.flipkartcareers.com/#!/joblist",
    "Google":     "https://careers.google.com/jobs/results/?location=Bangalore%2C+Karnataka%2C+India&q=product+manager",
    "Stripe":     "https://stripe.com/jobs/search?l=bangalore",
    "Adobe":      "https://careers.adobe.com/us/en/search-results?keywords=product%20manager&location=Bangalore",
    "Salesforce": "https://careers.salesforce.com/en/jobs/?search=product+manager&location=Bangalore",
    "Atlassian":  "https://www.atlassian.com/company/careers/all-jobs?team=&location=India&search=product",
    "Meesho":     "https://meesho.io/jobs",
    "Razorpay":   "https://razorpay.com/jobs/",
    "PhonePe":    "https://www.phonepe.com/careers/",
    "Uber":       "https://www.uber.com/us/en/careers/list/?query=product%20manager&location=bangalore",
    "Swiggy":     "https://careers.swiggy.com/#/",
    "Microsoft":  "https://jobs.careers.microsoft.com/global/en/search?q=product%20manager&l=Bangalore",
    "Zomato":     "https://www.zomato.com/careers",
    "PayPal":     "https://jobs.paypal.com/en/search#q=product%20manager&location=Bangalore",
}

# ── Output paths ──────────────────────────────────────────────────
JOBS_OUTPUT_PATH = "public/jobs.json"
LOG_PATH         = "logs/scraper.log"
