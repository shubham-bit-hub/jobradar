# ─────────────────────────────────────────────────────────────────
# JobRadar — scorer.py
# ─────────────────────────────────────────────────────────────────

import re
from config import (
    WEIGHTS, SALARY_TIER1, SALARY_TIER2,
    TARGET_ROLES, CANDIDATE_SKILLS, TARGET_COMPANIES
)

# ─────────────────────────────────────────────────────────────────
# COMPANY TIERS
# ─────────────────────────────────────────────────────────────────
TIER1_COMPANIES = [
    "google","microsoft","amazon","meta","apple","stripe","uber",
    "linkedin","salesforce","adobe","atlassian","paypal","oracle",
    "sap","servicenow","workday","twilio","shopify","airbnb","netflix"
]
TIER2_COMPANIES = [
    "flipkart","swiggy","zomato","meesho","razorpay","phonepe","paytm",
    "cred","groww","zepto","blinkit","ola","myntra","nykaa","lenskart",
    "bigbasket","urban company","byju","unacademy","cars24","delhivery",
    "mpl","dream11","sharechat","slice","jar","jupiter","fi money",
    "easemytrip","makemytrip","ixigo","cleartax","zerodha","upstox",
    "acko","digit","policy","wakefit","pepperfry","mamaearth"
]

# ─────────────────────────────────────────────────────────────────
# SALARY REFERENCE TABLE (India 2025-26, LPA)
# ─────────────────────────────────────────────────────────────────
SALARY_REFERENCE = {
    ("senior_pm",   "tier1"): (55, 85),
    ("senior_pm",   "tier2"): (40, 60),
    ("senior_pm",   "tier3"): (28, 45),
    ("pm",          "tier1"): (35, 55),
    ("pm",          "tier2"): (25, 40),
    ("pm",          "tier3"): (18, 32),
    ("tpm",         "tier1"): (50, 75),
    ("tpm",         "tier2"): (38, 55),
    ("tpm",         "tier3"): (25, 42),
    ("tam",         "tier1"): (45, 65),
    ("tam",         "tier2"): (32, 50),
    ("tam",         "tier3"): (22, 38),
    ("pgm",         "tier1"): (40, 60),
    ("pgm",         "tier2"): (28, 45),
    ("pgm",         "tier3"): (20, 35),
    ("product_ops", "tier1"): (38, 55),
    ("product_ops", "tier2"): (25, 42),
    ("product_ops", "tier3"): (18, 32),
}

# ─────────────────────────────────────────────────────────────────
# EXPERIENCE REFERENCE TABLE (years)
# ─────────────────────────────────────────────────────────────────
EXPERIENCE_REFERENCE = {
    ("senior_pm",   "tier1"): (5, 9),
    ("senior_pm",   "tier2"): (4, 8),
    ("senior_pm",   "tier3"): (4, 7),
    ("pm",          "tier1"): (2, 5),
    ("pm",          "tier2"): (2, 4),
    ("pm",          "tier3"): (1, 4),
    ("tpm",         "tier1"): (5, 9),
    ("tpm",         "tier2"): (4, 7),
    ("tpm",         "tier3"): (3, 6),
    ("tam",         "tier1"): (4, 8),
    ("tam",         "tier2"): (3, 6),
    ("tam",         "tier3"): (2, 5),
    ("pgm",         "tier1"): (4, 8),
    ("pgm",         "tier2"): (3, 6),
    ("pgm",         "tier3"): (2, 5),
    ("product_ops", "tier1"): (3, 6),
    ("product_ops", "tier2"): (2, 5),
    ("product_ops", "tier3"): (2, 4),
}

# ─────────────────────────────────────────────────────────────────
# SKILLS TAXONOMY — maps keywords to canonical skill names
# Used to extract skills from JD text
# ─────────────────────────────────────────────────────────────────
SKILLS_TAXONOMY = {
    # Product & PM
    "product roadmap":          "Product Roadmap",
    "product strategy":         "Product Strategy",
    "product sense":            "Product Sense",
    "product management":       "Product Management",
    "product manager":          "Product Management",
    "prd":                      "PRD Writing",
    "product requirement":      "PRD Writing",
    "go-to-market":             "Go-To-Market",
    "gtm":                      "Go-To-Market",
    "a/b test":                 "A/B Testing",
    "ab test":                  "A/B Testing",
    "growth":                   "Growth",
    "monetisation":             "Monetisation",
    "monetization":             "Monetisation",

    # Program / Ops
    "program management":       "Program Management",
    "programme management":     "Program Management",
    "project management":       "Program Management",
    "stakeholder":              "Stakeholder Management",
    "cross-functional":         "Cross-functional Leadership",
    "cross functional":         "Cross-functional Leadership",
    "operations":               "Process Optimization",
    "process improvement":      "Process Optimization",
    "process optimisation":     "Process Optimization",
    "automation":               "Automation",

    # Technical
    "api integration":          "API Integration",
    "rest api":                 "REST API",
    "api":                      "API Integration",
    "sql":                      "SQL",
    "python":                   "Python",
    "data analysis":            "Data Analysis",
    "data driven":              "Data Analysis",
    "analytics":                "Data Analysis",
    "machine learning":         "Machine Learning",
    "ml":                       "Machine Learning",
    "gen-ai":                   "Gen-AI",
    "generative ai":            "Gen-AI",
    "ai/ml":                    "Gen-AI",
    "llm":                      "Gen-AI",
    "prompt engineering":       "Prompt Engineering",
    "cloud":                    "Cloud",
    "aws":                      "Cloud",
    "azure":                    "Cloud",
    "gcp":                      "Cloud",

    # Domain
    "fintech":                  "Fintech",
    "payments":                 "Fintech",
    "saas":                     "SaaS",
    "b2b":                      "B2B",
    "b2c":                      "B2C",
    "marketplace":              "Marketplace",
    "e-commerce":               "E-commerce",
    "ecommerce":                "E-commerce",
    "logistics":                "Logistics",
    "last mile":                "Last-Mile Delivery",
    "last-mile":                "Last-Mile Delivery",
    "supply chain":             "Supply Chain",
    "developer platform":       "Developer Platform",
    "developer tools":          "Developer Tools",
    "enterprise":               "Enterprise",
    "seller":                   "Seller Management",

    # Soft / Leadership
    "technical account":        "Technical Account Management",
    "account management":       "Technical Account Management",
    "customer success":         "Customer Success",
    "stakeholder management":   "Stakeholder Management",
    "communication":            "Communication",
    "leadership":               "Leadership",
    "mentoring":                "Leadership",
    "negotiation":              "Negotiation",
}

# Skills Shubham has (canonical names)
SHUBHAM_SKILLS_CANONICAL = {
    "API Integration", "Product Management", "Program Management",
    "SQL", "Prompt Engineering", "Automation", "Process Optimization",
    "Stakeholder Management", "Technical Account Management", "Gen-AI",
    "Last-Mile Delivery", "Seller Management", "Data Analysis",
    "Go-To-Market", "SaaS", "Python", "Fintech", "E-commerce",
    "Cross-functional Leadership", "Enterprise", "Logistics",
    "Supply Chain", "B2B",
}

# Learning resources for skill gaps
LEARNING_RESOURCES = {
    "Product Roadmap":          ("Product Strategy & Roadmapping",      "Coursera",         3, "https://www.coursera.org/learn/product-strategy"),
    "Product Strategy":         ("Product Strategy",                     "Coursera",         3, "https://www.coursera.org/learn/product-strategy"),
    "Product Sense":            ("Product Management Fundamentals",      "Coursera",         4, "https://www.coursera.org/learn/product-management"),
    "PRD Writing":              ("Writing PRDs & Specs",                 "LinkedIn Learning",2, "https://www.linkedin.com/learning/topics/product-management"),
    "A/B Testing":              ("A/B Testing & Experimentation",        "Udemy",            2, "https://www.udemy.com/course/the-complete-ab-testing-course/"),
    "Growth":                   ("Growth Product Management",            "Reforge",          4, "https://www.reforge.com/growth-series"),
    "REST API":                 ("REST APIs with Postman",               "Udemy",            2, "https://www.udemy.com/course/rest-api-flask-and-python/"),
    "Machine Learning":         ("ML for Product Managers",             "Coursera",         4, "https://www.coursera.org/learn/ai-for-everyone"),
    "Cloud":                    ("Google Cloud Digital Leader",          "Google",           3, "https://cloud.google.com/training/courses/cloud-digital-leader"),
    "Developer Platform":       ("Developer Experience Fundamentals",   "LinkedIn Learning",2, "https://www.linkedin.com/learning/topics/developer-tools"),
    "Developer Tools":          ("Developer Experience Fundamentals",   "LinkedIn Learning",2, "https://www.linkedin.com/learning/topics/developer-tools"),
    "Monetisation":             ("Monetisation Strategy",               "Reforge",          3, "https://www.reforge.com/monetization"),
    "Customer Success":         ("Customer Success Management",         "Coursera",         3, "https://www.coursera.org/learn/customer-success"),
    "Negotiation":              ("Successful Negotiation",              "Coursera",         3, "https://www.coursera.org/learn/negotiation"),
    "B2B":                      ("B2B Product Management",              "LinkedIn Learning",2, "https://www.linkedin.com/learning/topics/product-management"),
    "Marketplace":              ("Platform & Marketplace Strategy",     "Udemy",            3, "https://www.udemy.com/course/platform-revolution/"),
    "Leadership":               ("Developing Leadership Skills",        "LinkedIn Learning",3, "https://www.linkedin.com/learning/topics/leadership-and-management"),
}


# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────

def classify_role(title: str) -> str:
    tl = title.lower()
    if "technical account" in tl or " tam" in tl:
        return "tam"
    if "technical program" in tl or " tpm" in tl:
        return "tpm"
    if any(x in tl for x in ["product ops", "product operations", "tech ops"]):
        return "product_ops"
    if any(x in tl for x in ["senior product manager","senior pm","spm","lead pm","staff pm","principal pm"]):
        return "senior_pm"
    if any(x in tl for x in ["product manager"," pm ","pm -","- pm"]):
        return "pm"
    if any(x in tl for x in ["program manager","programme manager"]):
        return "pgm"
    return "pm"


def classify_company(company: str) -> str:
    cl = company.lower()
    if any(t in cl for t in TIER1_COMPANIES): return "tier1"
    if any(t in cl for t in TIER2_COMPANIES): return "tier2"
    return "tier3"


def extract_skills_from_jd(jd: str, title: str = "") -> list[str]:
    """Extract canonical skills from JD + title text."""
    text = (jd + " " + title).lower()
    found = set()
    for keyword, canonical in SKILLS_TAXONOMY.items():
        if keyword in text:
            found.add(canonical)
    return sorted(found)


def extract_experience_years(jd: str) -> tuple[int | None, int | None, bool]:
    """
    Extract experience requirement from JD text.
    Returns (min_years, max_years, is_estimated).
    """
    if not jd:
        return None, None, False

    jd_lower = jd.lower()

    # Patterns: "5+ years", "5-8 years", "minimum 4 years", "at least 3 years"
    patterns = [
        r"(\d+)\s*[\+\-–]\s*(\d+)\s*(?:years?|yrs?)",   # 5-8 years
        r"(\d+)\+\s*(?:years?|yrs?)",                      # 5+ years
        r"(?:minimum|at least|min\.?)\s*(\d+)\s*(?:years?|yrs?)",
        r"(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)",   # 3 to 6 years
        r"(\d+)\s*(?:years?|yrs?)\s*(?:of experience|experience)",
    ]

    for pat in patterns:
        m = re.search(pat, jd_lower)
        if m:
            groups = [int(g) for g in m.groups() if g is not None]
            if len(groups) == 2:
                return min(groups), max(groups), False
            elif len(groups) == 1:
                return groups[0], groups[0] + 3, False

    return None, None, False


def estimate_experience(title: str, company: str) -> tuple[int, int, bool]:
    """Estimate experience from role + company tier when not stated."""
    role_type    = classify_role(title)
    company_tier = classify_company(company)
    key = (role_type, company_tier)
    if key in EXPERIENCE_REFERENCE:
        lo, hi = EXPERIENCE_REFERENCE[key]
        return lo, hi, True
    return 3, 6, True  # fallback


def build_skill_gap(job_skills: list[str]) -> dict:
    """Build skill gap analysis between Shubham's skills and job requirements."""
    matching = [s for s in job_skills if s in SHUBHAM_SKILLS_CANONICAL]
    missing  = [s for s in job_skills if s not in SHUBHAM_SKILLS_CANONICAL]

    # Importance: first 2 missing = High, next 2 = Medium, rest = Low
    missing_with_importance = []
    for i, skill in enumerate(missing):
        importance = "High" if i < 2 else "Medium" if i < 4 else "Low"
        missing_with_importance.append({
            "skill":       skill,
            "importance":  importance,
            "description": f"{skill} is listed as a requirement for this role."
        })

    # Gap rating
    total = len(job_skills)
    gap_count = len(missing)
    gap_rating = "Low" if gap_count == 0 else \
                 "Low" if total > 0 and gap_count / total <= 0.25 else \
                 "Medium" if gap_count / total <= 0.5 else "High"

    # Learning plan for missing skills (prioritised)
    learning_plan = []
    for item in missing_with_importance[:4]:
        skill = item["skill"]
        if skill in LEARNING_RESOURCES:
            course, platform, weeks, link = LEARNING_RESOURCES[skill]
            learning_plan.append({
                "skill":    skill,
                "course":   course,
                "platform": platform,
                "weeks":    weeks,
                "link":     link
            })
        else:
            learning_plan.append({
                "skill":    skill,
                "course":   f"{skill} Fundamentals",
                "platform": "LinkedIn Learning",
                "weeks":    3,
                "link":     "https://www.linkedin.com/learning/"
            })

    match_pct = round((len(matching) / max(total, 1)) * 100)
    if match_pct >= 70:
        assessment = f"Strong match — you have {len(matching)} of {total} required skills. Your API integration and program management background at Amazon directly maps to this role."
    elif match_pct >= 40:
        assessment = f"Good partial match — {len(matching)} of {total} skills align. Bridging {', '.join(s['skill'] for s in missing_with_importance[:2]) if missing else 'minor gaps'} would strengthen your application significantly."
    else:
        assessment = f"Stretch role — {len(matching)} of {total} skills match. Strong foundation in API integration and stakeholder management but significant upskilling needed in {', '.join(s['skill'] for s in missing_with_importance[:2]) if missing else 'key areas'}."

    return {
        "matchingSkills":  matching,
        "missingSkills":   missing_with_importance,
        "gapRating":       gap_rating,
        "assessment":      assessment,
        "learningPlan":    learning_plan,
    }


def extract_salary_lpa(text: str) -> float | None:
    if not text:
        return None
    text = text.lower().replace(",", "")
    lpa = re.findall(r"(\d+(?:\.\d+)?)\s*(?:–|-|to)?\s*(\d+(?:\.\d+)?)?\s*lpa", text)
    if lpa:
        lo, hi = lpa[0]
        vals = [float(lo)]
        if hi:
            vals.append(float(hi))
        return sum(vals) / len(vals)
    annual = re.findall(r"(\d{6,8})", text)
    if annual:
        avg = sum(int(v) for v in annual) / len(annual)
        return round(avg / 100000, 1)
    return None


def score_salary(lpa):
    if lpa is None: return 50
    if lpa >= SALARY_TIER1: return 100
    if lpa >= SALARY_TIER2: return 72
    if lpa >= 30: return 40
    return 20


def score_role(title: str) -> int:
    tl = title.lower()
    if any(r.lower() in tl for r in TARGET_ROLES): return 100
    role_words = set(w for r in TARGET_ROLES for w in r.lower().split() if len(w) > 4)
    if any(w in tl for w in role_words): return 65
    return 25


def score_skills(jd_text: str) -> tuple[int, list[str]]:
    jd_lower = jd_text.lower()
    matched = [
        s for s in CANDIDATE_SKILLS
        if s.lower() in jd_lower or any(w in jd_lower for w in s.lower().split() if len(w) > 4)
    ]
    score = min(100, int(len(matched) / max(len(CANDIDATE_SKILLS) * 0.3, 1) * 100))
    return score, matched


def score_workex(level_hint: str) -> int:
    ll = level_hint.lower()
    if any(k in ll for k in ["staff","principal","vp","director","head of"]): return 55
    if any(k in ll for k in ["senior","sr.","lead","l5","l6","ii"]): return 95
    if any(k in ll for k in ["associate","junior","entry","fresher"]): return 40
    return 80


def is_watchlist_company(company: str) -> bool:
    return any(t.lower() in company.lower() for t in TARGET_COMPANIES)


def classify_role_outer(title):
    return classify_role(title)


def classify_company_outer(company):
    return classify_company(company)


# ─────────────────────────────────────────────────────────────────
# MAIN SCORER
# ─────────────────────────────────────────────────────────────────

def compute_score(job: dict) -> dict:
    title   = job.get("title", "")
    company = job.get("company", "")
    jd      = job.get("jd", "")

    # ── Salary ────────────────────────────────────────────────────
    stated_lpa       = extract_salary_lpa(job.get("salary_text", ""))
    salary_estimated = False
    if stated_lpa is None:
        role_type    = classify_role(title)
        company_tier = classify_company(company)
        key = (role_type, company_tier)
        lo, hi = SALARY_REFERENCE.get(key, (25, 35))
        salary_est_value = round((lo + hi) / 2, 1)
        salary_estimated = True
        salary_display   = f"~₹{lo}–{hi} LPA est."
    else:
        salary_est_value = stated_lpa
        salary_display   = f"₹{stated_lpa} LPA"

    # ── Experience ────────────────────────────────────────────────
    exp_min, exp_max, exp_estimated = extract_experience_years(jd)
    if exp_min is None:
        exp_min, exp_max, exp_estimated = estimate_experience(title, company)
    exp_display = f"{exp_min}–{exp_max} yrs" + (" est." if exp_estimated else "")

    # ── Skills extraction from JD ─────────────────────────────────
    extracted_skills = extract_skills_from_jd(jd, title)
    # If job already has skills array (from mock/manual), keep it; else use extracted
    final_skills = job.get("skills") if job.get("skills") else extracted_skills

    # ── Skill gap ─────────────────────────────────────────────────
    skill_gap = build_skill_gap(final_skills) if final_skills else None

    # ── Scoring ───────────────────────────────────────────────────
    sal_score              = score_salary(salary_est_value)
    role_score             = score_role(title)
    skill_score, matched_s = score_skills(jd + " " + title)
    wx_score               = score_workex(title + " " + jd[:300])

    w = WEIGHTS
    total = round(
        sal_score   * (w["salary"]  / 100) +
        role_score  * (w["role"]    / 100) +
        skill_score * (w["skills"]  / 100) +
        wx_score    * (w["workex"]  / 100)
    )
    if is_watchlist_company(company):
        total = min(100, total + 5)

    tier_salary = salary_est_value
    return {
        **job,
        "salary_lpa":        stated_lpa,
        "salary_estimated":  salary_estimated,
        "salary_est_value":  salary_est_value,
        "salary_display":    salary_display,
        "exp_min":           exp_min,
        "exp_max":           exp_max,
        "exp_estimated":     exp_estimated,
        "exp_display":       exp_display,
        "skills":            final_skills,
        "skill_gap":         skill_gap,
        "score":             total,
        "score_breakdown": {
            "salary":  sal_score,
            "role":    role_score,
            "skills":  skill_score,
            "workex":  wx_score,
        },
        "matched_skills":    matched_s,
        "is_watchlist":      is_watchlist_company(company),
        "tier": (
            "tier1" if tier_salary >= SALARY_TIER1
            else "tier2" if tier_salary >= SALARY_TIER2
            else "na"
        ),
    }
