# ─────────────────────────────────────────────────────────────────
# JobRadar — notifier.py
# Sends WhatsApp alerts via CallMeBot for high-score new jobs
# ─────────────────────────────────────────────────────────────────

import urllib.parse
import urllib.request
import logging
from config import WHATSAPP_PHONE, WHATSAPP_API_KEY, ALERT_SCORE_THRESHOLD

logger = logging.getLogger("jobradar.notifier")


def send_whatsapp(message: str) -> bool:
    """Send a WhatsApp message via CallMeBot. Returns True on success."""
    if WHATSAPP_API_KEY == "YOUR_CALLMEBOT_KEY":
        logger.warning("WhatsApp API key not configured — skipping alert.")
        return False

    encoded = urllib.parse.quote(message)
    url = (
        f"https://api.callmebot.com/whatsapp.php"
        f"?phone={WHATSAPP_PHONE}"
        f"&text={encoded}"
        f"&apikey={WHATSAPP_API_KEY}"
    )
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            body = resp.read().decode()
            if "Message Sent" in body or resp.status == 200:
                logger.info(f"WhatsApp alert sent: {message[:60]}…")
                return True
            else:
                logger.error(f"CallMeBot unexpected response: {body[:200]}")
                return False
    except Exception as e:
        logger.error(f"WhatsApp send failed: {e}")
        return False


def notify_new_top_jobs(new_jobs: list[dict]) -> None:
    """
    Filter new_jobs to those above the alert threshold and send
    one WhatsApp message per qualifying job (max 5 per run to avoid spam).
    """
    top = [j for j in new_jobs if j.get("score", 0) >= ALERT_SCORE_THRESHOLD]
    top = sorted(top, key=lambda j: j["score"], reverse=True)[:5]

    if not top:
        logger.info("No new jobs above alert threshold — no WhatsApp sent.")
        return

    for job in top:
        score   = job["score"]
        title   = job["title"]
        company = job["company"]
        salary  = job.get("salary_display", "Salary N/A")
        link    = job.get("link", "")
        source  = job.get("source", "")

        msg = (
            f"🚨 JobRadar Alert — Score {score}/100\n"
            f"📌 {title} @ {company}\n"
            f"💰 {salary}\n"
            f"🔗 {link}\n"
            f"📡 via {source}"
        )
        send_whatsapp(msg)

    # Summary if multiple
    if len(top) > 1:
        summary = (
            f"📊 JobRadar: {len(top)} new top matches today "
            f"(scores: {', '.join(str(j['score']) for j in top)})"
        )
        send_whatsapp(summary)
