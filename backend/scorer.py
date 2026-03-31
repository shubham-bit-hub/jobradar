# ─────────────────────────────────────────────────────────────────
# JobRadar — scorer.py
# Scores a job dict against Shubham's profile
# ─────────────────────────────────────────────────────────────────

import re
from config import (
    WEIGHTS, SALARY_TIER1, SALARY_TIER2,
    TARGET_ROLES, CANDIDATE_SKILLS, TARGET_COMPANIES
)


def extract_salary_lpa(text: str) -> float | None:
    """
    Parse salary from free-text strings like:
      '₹45-55 LPA', '50 LPA', '8,00,000 - 10,00,000', 'Not disclosed'
    Returns average LPA as float, or None if unparseable.
    """
    if not text:
        return None
    text = text.lower().replace(",", "")

    # Already in LPA notation
    lpa = re.findall(r"(\d+(?:\.\d+)?)\s*(?:–|-|to)?\s*(\d+(?:\.\d+)?)?\s*lpa", text)
    if lpa:
        lo, hi = lpa[0]
        vals = [float(lo)]
        if hi:
            vals.append(float(hi))
        return sum(vals) / len(vals)

    # Annual rupees (e.g. 5000000)
    annual = re.findall(r"(\d{6,8})", text)
    if annual:
        avg = sum(int(v) for v in annual) / len(annual)
        return round(avg / 100000, 1)

    return None


def score_salary(lpa: float | None) -> int:
    if lpa is None:
        return 50   # neutral — we don't penalise missing salary
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
    # partial word match (e.g. "PM" in "Product PM")
    role_words = set(w for r in TARGET_ROLES for w in r.lower().split() if len(w) > 4)
    if any(w in tl for w in role_words):
        return 65
    return 25


def score_skills(jd_text: str) -> tuple[int, list[str]]:
    """Returns (score 0-100, list of matched skills)."""
    jd_lower = jd_text.lower()
    matched = [
        s for s in CANDIDATE_SKILLS
        if s.lower() in jd_lower or any(w in jd_lower for w in s.lower().split() if len(w) > 4)
    ]
    # Weight: matching 5+ skills → full marks
    score = min(100, int(len(matched) / max(len(CANDIDATE_SKILLS) * 0.3, 1) * 100))
    return score, matched


def score_workex(level_hint: str) -> int:
    """
    Estimate work-ex fit from seniority language in title/JD.
    Returns 0-100.
    """
    ll = level_hint.lower()
    if any(k in ll for k in ["staff", "principal", "vp", "director", "head of"]):
        return 55   # above target level
    if any(k in ll for k in ["senior", "sr.", "lead", "l5", "l6", "ii"]):
        return 95
    if any(k in ll for k in ["associate", "junior", "entry", "fresher"]):
        return 40
    return 80   # unspecified → assume mid-level fit


def is_watchlist_company(company: str) -> bool:
    return any(t.lower() in company.lower() for t in TARGET_COMPANIES)


def compute_score(job: dict) -> dict:
    """
    job dict must have: title, company, salary_text, jd
    Returns enriched job dict with score breakdown added.
    """
    salary_lpa  = extract_salary_lpa(job.get("salary_text", ""))
    sal_score   = score_salary(salary_lpa)
    role_score  = score_role(job.get("title", ""))
    skill_score, matched_skills = score_skills(
        job.get("jd", "") + " " + job.get("title", "")
    )
    wx_score    = score_workex(job.get("title", "") + " " + job.get("jd", "")[:300])

    w = WEIGHTS
    total = round(
        sal_score   * (w["salary"]  / 100) +
        role_score  * (w["role"]    / 100) +
        skill_score * (w["skills"]  / 100) +
        wx_score    * (w["workex"]  / 100)
    )

    # Watchlist bonus (+5, capped at 100)
    if is_watchlist_company(job.get("company", "")):
        total = min(100, total + 5)

    return {
        **job,
        "salary_lpa":      salary_lpa,
        "salary_display":  f"₹{salary_lpa} LPA" if salary_lpa else "Not Listed",
        "score":           total,
        "score_breakdown": {
            "salary":  sal_score,
            "role":    role_score,
            "skills":  skill_score,
            "workex":  wx_score,
        },
        "matched_skills":  matched_skills,
        "is_watchlist":    is_watchlist_company(job.get("company", "")),
        "tier": (
            "tier1" if (salary_lpa or 0) >= SALARY_TIER1
            else "tier2" if (salary_lpa or 0) >= SALARY_TIER2
            else "na"
        ),
    }
