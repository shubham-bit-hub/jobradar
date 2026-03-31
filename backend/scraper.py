# ─────────────────────────────────────────────────────────────────
# JobRadar — scraper.py
# Playwright-based scraper for LinkedIn, Naukri, IIMJobs,
# and company career pages.
#
# Run:  python scraper.py
# ─────────────────────────────────────────────────────────────────

import asyncio
import hashlib
import json
import logging
import os
import random
import re
import time
from datetime import datetime, date

from playwright.async_api import async_playwright, TimeoutError as PWTimeout

from config import (
    LINKEDIN_QUERIES, NAUKRI_QUERIES, IIMJOBS_QUERIES,
    COMPANY_CAREER_PAGES, TITLE_BLOCKLIST,
)

# Paths resolved after BASE_DIR is set below
import config as _cfg
from scorer import compute_score
from notifier import notify_new_top_jobs

# ── Resolve paths relative to script location ────────────────────
_BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
_ROOT_DIR   = os.path.dirname(_BASE_DIR)
_LOGS_DIR   = os.path.join(_ROOT_DIR, "logs")
_PUBLIC_DIR = os.path.join(_ROOT_DIR, "public")
os.makedirs(_LOGS_DIR,   exist_ok=True)
os.makedirs(_PUBLIC_DIR, exist_ok=True)

# Override config paths with absolute paths
LOG_PATH         = os.path.join(_LOGS_DIR,   "scraper.log")
JOBS_OUTPUT_PATH = os.path.join(_PUBLIC_DIR, "jobs.json")

# ── Logging ───────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
# Fix Windows console Unicode
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
logger = logging.getLogger("jobradar")

# ── Helpers ───────────────────────────────────────────────────────

def job_id(title: str, company: str, location: str) -> str:
    """Stable dedup key — hash of title+company+location."""
    raw = f"{title.lower().strip()}|{company.lower().strip()}|{location.lower().strip()}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def is_blocked(title: str) -> bool:
    tl = title.lower()
    return any(b in tl for b in TITLE_BLOCKLIST)


async def human_delay(min_s=1.5, max_s=3.5):
    """Random delay to mimic human browsing."""
    await asyncio.sleep(random.uniform(min_s, max_s))


def load_existing_jobs() -> dict:
    """Load previously scraped jobs keyed by job_id."""
    if os.path.exists(JOBS_OUTPUT_PATH):
        with open(JOBS_OUTPUT_PATH) as f:
            jobs = json.load(f)
            return {j["id"]: j for j in jobs}
    return {}


def save_jobs(jobs: list[dict]) -> None:
    with open(JOBS_OUTPUT_PATH, "w") as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(jobs)} jobs → {JOBS_OUTPUT_PATH}")


# ── LinkedIn Scraper ──────────────────────────────────────────────

async def scrape_linkedin(page, query: str) -> list[dict]:
    jobs = []
    url  = (
        "https://www.linkedin.com/jobs/search/"
        f"?keywords={urllib.parse.quote(query)}"
        "&location=India"
        "&f_TPR=r86400"   # posted in last 24h
        "&sortBy=DD"
    )
    logger.info(f"LinkedIn → {query}")
    try:
        await page.goto(url, timeout=30000)
        await human_delay(2, 4)

        # Scroll to load more cards
        for _ in range(3):
            await page.keyboard.press("End")
            await human_delay(1, 2)

        cards = await page.query_selector_all(".job-search-card")
        if not cards:
            cards = await page.query_selector_all("[data-entity-urn]")

        for card in cards[:25]:
            try:
                title_el   = await card.query_selector(".base-search-card__title, h3")
                company_el = await card.query_selector(".base-search-card__subtitle, h4")
                location_el= await card.query_selector(".job-search-card__location")
                link_el    = await card.query_selector("a.base-card__full-link, a")

                title    = (await title_el.inner_text()).strip()   if title_el    else ""
                company  = (await company_el.inner_text()).strip() if company_el  else ""
                location = (await location_el.inner_text()).strip()if location_el else "India"
                link     = await link_el.get_attribute("href")     if link_el     else ""

                if not title or is_blocked(title):
                    continue

                jid = job_id(title, company, location)
                jobs.append({
                    "id": jid, "title": title, "company": company,
                    "location": location, "link": link or "",
                    "source": "LinkedIn", "salary_text": "",
                    "jd": f"{title} at {company}. {query}.",
                    "posted": "Today", "isNew": True,
                    "scraped_at": date.today().isoformat(),
                })
            except Exception as e:
                logger.debug(f"LinkedIn card parse error: {e}")

    except PWTimeout:
        logger.warning(f"LinkedIn timeout for query: {query}")
    except Exception as e:
        logger.error(f"LinkedIn error: {e}")

    logger.info(f"LinkedIn [{query}] → {len(jobs)} jobs")
    return jobs


# ── Naukri Scraper ────────────────────────────────────────────────

async def scrape_naukri(page, query: str) -> list[dict]:
    jobs = []
    slug = query.lower().replace(" ", "-")
    url  = f"https://www.naukri.com/{slug}-jobs?jobAge=1"   # last 1 day
    logger.info(f"Naukri → {query}")
    try:
        await page.goto(url, timeout=35000)
        await human_delay(3, 5)

        cards = await page.query_selector_all(".jobTuple, article.jobTupleHeader, .job-tuple-wrapper")
        if not cards:
            cards = await page.query_selector_all("[class*='tuple']")

        for card in cards[:25]:
            try:
                title_el   = await card.query_selector("a.title, .jobTitle a, h2 a, a.job-title")
                company_el = await card.query_selector(".companyInfo .subTitle, .comp-name, .companyName")
                location_el= await card.query_selector(".loc, .location, .jobLocation")
                salary_el  = await card.query_selector(".salary, .salaryText")
                link_el    = await card.query_selector("a.title, a.job-title, h2 a")

                title   = (await title_el.inner_text()).strip()    if title_el    else ""
                company = (await company_el.inner_text()).strip()  if company_el  else ""
                loc     = (await location_el.inner_text()).strip() if location_el else "India"
                salary  = (await salary_el.inner_text()).strip()   if salary_el   else ""
                link    = await link_el.get_attribute("href")      if link_el     else ""

                if not title or is_blocked(title):
                    continue

                jid = job_id(title, company, loc)
                jobs.append({
                    "id": jid, "title": title, "company": company,
                    "location": loc, "link": link or "",
                    "source": "Naukri", "salary_text": salary,
                    "jd": f"{title} at {company}. Location: {loc}.",
                    "posted": "Today", "isNew": True,
                    "scraped_at": date.today().isoformat(),
                })
            except Exception as e:
                logger.debug(f"Naukri card parse error: {e}")

    except PWTimeout:
        logger.warning(f"Naukri timeout for query: {query}")
    except Exception as e:
        logger.error(f"Naukri error: {e}")

    logger.info(f"Naukri [{query}] → {len(jobs)} jobs")
    return jobs


# ── IIMJobs Scraper ───────────────────────────────────────────────

async def scrape_iimjobs(page, query: str) -> list[dict]:
    jobs = []
    slug = query.lower().replace(" ", "-")
    url  = f"https://www.iimjobs.com/j/{slug}-jobs"
    logger.info(f"IIMJobs → {query}")
    try:
        await page.goto(url, timeout=30000)
        await human_delay(2, 4)

        cards = await page.query_selector_all(".job-post, .jobpost, article")
        for card in cards[:20]:
            try:
                title_el   = await card.query_selector("h2 a, h3 a, .job-title a, a.title")
                company_el = await card.query_selector(".company-name, .comp, .employer")
                location_el= await card.query_selector(".location, .loc")
                salary_el  = await card.query_selector(".salary, .ctc")
                link_el    = await card.query_selector("h2 a, h3 a, a.title")

                title   = (await title_el.inner_text()).strip()    if title_el    else ""
                company = (await company_el.inner_text()).strip()  if company_el  else ""
                loc     = (await location_el.inner_text()).strip() if location_el else "India"
                salary  = (await salary_el.inner_text()).strip()   if salary_el   else ""
                link    = await link_el.get_attribute("href")      if link_el     else ""

                if not title or is_blocked(title):
                    continue

                if link and not link.startswith("http"):
                    link = "https://www.iimjobs.com" + link

                jid = job_id(title, company, loc)
                jobs.append({
                    "id": jid, "title": title, "company": company,
                    "location": loc, "link": link or "",
                    "source": "IIMJobs", "salary_text": salary,
                    "jd": f"{title} at {company}. Location: {loc}.",
                    "posted": "Today", "isNew": True,
                    "scraped_at": date.today().isoformat(),
                })
            except Exception as e:
                logger.debug(f"IIMJobs card parse error: {e}")

    except PWTimeout:
        logger.warning(f"IIMJobs timeout for query: {query}")
    except Exception as e:
        logger.error(f"IIMJobs error: {e}")

    logger.info(f"IIMJobs [{query}] → {len(jobs)} jobs")
    return jobs


# ── Company Career Pages Scraper ──────────────────────────────────

async def scrape_company_page(page, company: str, url: str) -> list[dict]:
    """
    Generic scraper for company career pages.
    Extracts any <a> that looks like a job listing.
    """
    jobs = []
    logger.info(f"Company page → {company}")
    try:
        await page.goto(url, timeout=35000)
        await human_delay(3, 5)

        # Try to find job listing links
        links = await page.query_selector_all("a")
        for link_el in links:
            try:
                text = (await link_el.inner_text()).strip()
                href = await link_el.get_attribute("href") or ""

                # Heuristic: must look like a job title
                if len(text) < 10 or len(text) > 120:
                    continue
                if is_blocked(text):
                    continue
                job_like = any(k in text.lower() for k in [
                    "manager", "product", "program", "engineer",
                    "analyst", "operations", "account", "technical"
                ])
                if not job_like:
                    continue

                if href and not href.startswith("http"):
                    base = "/".join(url.split("/")[:3])
                    href = base + href

                jid = job_id(text, company, "India")
                jobs.append({
                    "id": jid, "title": text, "company": company,
                    "location": "Bangalore / India", "link": href,
                    "source": "Company", "salary_text": "",
                    "jd": f"{text} at {company}.",
                    "posted": "Recently", "isNew": True,
                    "scraped_at": date.today().isoformat(),
                })
            except Exception:
                continue

        # Deduplicate by id within this company
        seen = set()
        unique = []
        for j in jobs:
            if j["id"] not in seen:
                seen.add(j["id"])
                unique.append(j)
        jobs = unique[:15]   # cap per company

    except PWTimeout:
        logger.warning(f"Timeout for company page: {company}")
    except Exception as e:
        logger.error(f"Company page error ({company}): {e}")

    logger.info(f"Company [{company}] → {len(jobs)} jobs")
    return jobs


# ── Main Orchestrator ─────────────────────────────────────────────

async def run_scraper():
    logger.info("=" * 60)
    logger.info(f"JobRadar scrape started — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    logger.info("=" * 60)

    existing   = load_existing_jobs()
    all_raw    = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
            ],
        )
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1440, "height": 900},
            locale="en-IN",
        )
        page = await context.new_page()

        # Hide automation signals
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.chrome = { runtime: {} };
        """)

        # ── LinkedIn ──────────────────────────────────────────────
        for query in LINKEDIN_QUERIES:
            jobs = await scrape_linkedin(page, query)
            all_raw.extend(jobs)
            await human_delay(4, 8)

        # ── Naukri ────────────────────────────────────────────────
        for query in NAUKRI_QUERIES:
            jobs = await scrape_naukri(page, query)
            all_raw.extend(jobs)
            await human_delay(4, 7)

        # ── IIMJobs ───────────────────────────────────────────────
        for query in IIMJOBS_QUERIES:
            jobs = await scrape_iimjobs(page, query)
            all_raw.extend(jobs)
            await human_delay(3, 6)

        # ── Company pages ─────────────────────────────────────────
        for company, url in COMPANY_CAREER_PAGES.items():
            jobs = await scrape_company_page(page, company, url)
            all_raw.extend(jobs)
            await human_delay(3, 6)

        await browser.close()

    # ── Deduplicate ───────────────────────────────────────────────
    seen_ids = set()
    unique_raw = []
    for j in all_raw:
        if j["id"] not in seen_ids:
            seen_ids.add(j["id"])
            unique_raw.append(j)

    logger.info(f"Raw scraped: {len(all_raw)}  →  Unique: {len(unique_raw)}")

    # ── Score all jobs ────────────────────────────────────────────
    scored = [compute_score(j) for j in unique_raw]
    scored.sort(key=lambda j: j["score"], reverse=True)

    # ── Identify truly new jobs (not in yesterday's run) ──────────
    new_jobs = [j for j in scored if j["id"] not in existing]
    logger.info(f"New jobs since last run: {len(new_jobs)}")

    # ── Merge with existing (keep history, update if re-scraped) ──
    merged = {j["id"]: j for j in scored}
    for jid, job in existing.items():
        if jid not in merged:
            # Keep old jobs but mark as not new
            job["isNew"] = False
            merged[jid] = job

    final = sorted(merged.values(), key=lambda j: j["score"], reverse=True)

    # ── Save ──────────────────────────────────────────────────────
    save_jobs(final)

    # ── WhatsApp alerts for new top jobs ──────────────────────────
    notify_new_top_jobs(new_jobs)

    # ── Summary ───────────────────────────────────────────────────
    tier1 = [j for j in final if j.get("tier") == "tier1"]
    tier2 = [j for j in final if j.get("tier") == "tier2"]
    na    = [j for j in final if j.get("tier") == "na"]

    logger.info("-" * 60)
    logger.info(f"DONE  |  Total: {len(final)}  |  50+LPA: {len(tier1)}  |  40-50LPA: {len(tier2)}  |  N/A: {len(na)}")
    if final:
        logger.info(f"      |  Top score: {final[0]['score']}  ({final[0]['title']} @ {final[0]['company']})")
    logger.info("-" * 60)


if __name__ == "__main__":
    import urllib.parse   # imported here so it's available in LinkedIn scraper
    asyncio.run(run_scraper())
