# ─────────────────────────────────────────────────────────────────
# JobRadar — scorer.py
# Scores a job dict against Shubham's profile
# Includes market salary estimation for unlisted salaries
# ─────────────────────────────────────────────────────────────────

import re
from config import (
    WEIGHTS, SALARY_TIER1, SALARY_TIER2,
    TARGET_ROLES, CANDIDATE_SKILLS, TARGET_COMPANIES
)

# ─────────────────────────────────────────────────────────────────
# MARKET SALARY REFERENCE TABLE (India, 2025-26)
# Source: aggregated from Glassdoor, LinkedIn Salary, AmbitionBox
# Format: (role_keywords, company_tier, estimated_midpoint_lpa)
# ─────────────────────────────────────────────────────────────────

# Company tier classification
TIER1_COMPANIES = [
    "google", "microsoft", "amazon", "meta", "apple", "stripe",
    "uber", "linkedin", "salesforce", "adobe", "atlassian", "paypal",
    "oracle", "sap", "servicenow", "workday", "twilio", "shopify"
]
TIER2_COMPANIES = [
    "flipkart", "swiggy", "zomato", "meesho", "razorpay", "phonepe",
    "paytm", "cred", "groww", "zepto", "blinkit", "dunzo", "ola",
    "myntra", "nykaa", "lenskart", "bigbasket", "urban company",
    "byju", "unacademy", "vedantu", "cars24", "delhivery", "mpl",
    "dream11", "sharechat", "slice", "jar", "jupiter", "fi money"
]
TIER3_COMPANIES = []  # everything else

# Salary reference: (role_type, company_tier) -> (min_lpa, max_lpa)
SALARY_REFERENCE = {
    # Senior PM / SPM
    ("senior_pm",  "tier1"): (55, 85),
    ("senior_pm",  "tier2"): (40, 60),
    ("senior_pm",  "tier3"): (28, 45),

    # Product Manager (non-senior)
    ("pm",         "tier1"): (35, 55),
    ("pm",         "tier2"): (25, 40),
    ("pm",         "tier3"): (18, 32),

    # Technical Program Manager
    ("tpm",        "tier1"): (50, 75),
    ("tpm",        "tier2"): (38, 55),
    ("tpm",        "tier3"): (25, 42),

    # Technical Account Manager
    ("tam",        "tier1"): (45, 65),
    ("tam",        "tier2"): (32, 50),
    ("tam",        "tier3"): (22, 38),

    # Program Manager / Ops Manager
    ("pgm",        "tier1"): (40, 60),
    ("pgm",        "tier2"): (28, 45),
    ("pgm",        "tier3"): (20, 35),

    # Product Operations
    ("product_ops","tier1"): (38, 55),
    ("product_ops","tier2"): (25, 42),
    ("product_ops","tier3"): (18, 32),
}


def classify_role(title: str) -> str:
    """Classify job title into a role bucket."""
    tl = title.lower()
    if "technical account" in tl or " tam" in tl:
        return "tam"
    if "technical program" in tl or " tpm" in tl:
        return "tpm"
    if any(x in tl for x in ["product ops", "product operations", "tech ops"]):
        return "product_ops"
    if any(x in tl for x in ["senior product manager", "senior pm", "spm", "lead pm", "staff pm", "principal pm"]):
        return "senior_pm"
    if any(x in tl for x in ["product manager", " pm ", "pm -", "- pm"]):
        return "pm"
    if any(x in tl for x in ["program manager", "programme manager"]):
        return "pgm"
    return "pm"  # default


def classify_company(company: str) -> str:
    """Classify company into tier."""
    cl = company.lower()
    if any(t in cl for t in TIER1_COMPANIES):
        return "tier1"
    if any(t in cl for t in TIER2_COMPANIES):
        return "tier2"
    return "tier3"


def estimate_salary(title: str, company: str) -> tuple[float, bool]:
    """
    Estimate salary from market data when not listed.
    Returns (estimated_lpa, is_estimated).
    Uses midpoint of range for the role+company tier.
    """
    role_type    = classify_role(title)
    company_tier = classify_company(company)
    key = (role_type, company_tier)

    if key in SALARY_REFERENCE:
        lo, hi = SALARY_REFERENCE[key]
        midpoint = round((lo + hi) / 2, 1)
        return midpoint, True

    # Fallback — generic PM estimate
    return 30.0, True


def extract_salary_lpa(text: str) -> float | None:
    """
    Parse salary from free-text strings.
    Returns average LPA as float, or None if unparseable.
    """
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


def score_salary(lpa: float | None) -> int:
    if lpa is None:
        return 50
    if lpa >= SALARY_TIER1:
        return 100
    if lpa >= SALARY_TIER2:
        return 72
    if lpa >= 30:
        return 40
    return 20


def score_role(title: str) -> int:
    tl = title.lower()
    if any(r.lower() in tl for r in TARGET_ROLES):
        return 100
    role_words = set(w for r in TARGET_ROLES for w in r.lower().split() if len(w) > 4)
    if any(w in tl for w in role_words):
        return 65
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
    if any(k in ll for k in ["staff", "principal", "vp", "director", "head of"]):
        return 55
    if any(k in ll for k in ["senior", "sr.", "lead", "l5", "l6", "ii"]):
        return 95
    if any(k in ll for k in ["associate", "junior", "entry", "fresher"]):
        return 40
    return 80


def is_watchlist_company(company: str) -> bool:
    return any(t.lower() in company.lower() for t in TARGET_COMPANIES)


def compute_score(job: dict) -> dict:
    title   = job.get("title", "")
    company = job.get("company", "")

    # Step 1: Try to extract stated salary
    stated_lpa    = extract_salary_lpa(job.get("salary_text", ""))
    salary_estimated = False

    # Step 2: If no stated salary, estimate from market data
    if stated_lpa is None:
        estimated_lpa, salary_estimated = estimate_salary(title, company)
        salary_lpa = estimated_lpa
    else:
        salary_lpa = stated_lpa

    sal_score   = score_salary(salary_lpa)
    role_score  = score_role(title)
    skill_score, matched_skills = score_skills(
        job.get("jd", "") + " " + title
    )
    wx_score = score_workex(title + " " + job.get("jd", "")[:300])

    w = WEIGHTS
    total = round(
        sal_score   * (w["salary"]  / 100) +
        role_score  * (w["role"]    / 100) +
        skill_score * (w["skills"]  / 100) +
        wx_score    * (w["workex"]  / 100)
    )

    if is_watchlist_company(company):
        total = min(100, total + 5)

    # Format salary display
    if stated_lpa:
        salary_display = f"₹{stated_lpa} LPA"
        tier_salary    = stated_lpa
    else:
        lo, hi = SALARY_REFERENCE.get(
            (classify_role(title), classify_company(company)),
            (25, 35)
        )
        salary_display = f"~₹{lo}–{hi} LPA est."
        tier_salary    = salary_lpa

    return {
        **job,
        "salary_lpa":        stated_lpa,          # actual if known, else None
        "salary_estimated":  salary_estimated,
        "salary_est_value":  salary_lpa,           # always has a value
        "salary_display":    salary_display,
        "score":             total,
        "score_breakdown": {
            "salary":  sal_score,
            "role":    role_score,
            "skills":  skill_score,
            "workex":  wx_score,
        },
        "matched_skills":    matched_skills,
        "is_watchlist":      is_watchlist_company(company),
        "tier": (
            "tier1" if tier_salary >= SALARY_TIER1
            else "tier2" if tier_salary >= SALARY_TIER2
            else "na"
        ),
    }
