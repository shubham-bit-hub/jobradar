# JobRadar — Complete Setup Guide
## From zero to daily automated job alerts in ~45 minutes

---

## 📁 Folder Structure

```
jobradar/
├── backend/
│   ├── config.py          ← edit this to personalise
│   ├── scraper.py         ← Playwright scraper
│   ├── scorer.py          ← scoring engine
│   ├── notifier.py        ← WhatsApp alerts
│   └── requirements.txt
├── public/
│   └── jobs.json          ← auto-generated, frontend reads this
├── logs/
│   └── scraper.log
├── src/
│   └── JobRadar.jsx       ← React frontend
├── .github/
│   └── workflows/
│       └── scrape.yml     ← GitHub Actions cron
└── SETUP.md
```

---

## Step 1 — WhatsApp Setup (2 minutes)

1. Open WhatsApp on your phone
2. Add **+34 644 59 74 18** as a contact (CallMeBot)
3. Send them this exact message:
   ```
   I allow callmebot to send me messages
   ```
4. You'll receive a reply with your API key. Looks like: `1234567`
5. Open `backend/config.py` and paste it:
   ```python
   WHATSAPP_API_KEY = "1234567"
   ```

---

## Step 2 — Run Scraper Locally (first test)

```bash
# Install Python 3.11+ if not already installed
# https://www.python.org/downloads/

# From the jobradar/ root folder:
cd backend
pip install -r requirements.txt
playwright install chromium

# Run the scraper
python scraper.py
```

You should see logs like:
```
2026-03-31 07:30:01  INFO     LinkedIn [Senior Product Manager Bangalore] → 18 jobs
2026-03-31 07:30:12  INFO     Naukri [Senior Product Manager] → 12 jobs
...
2026-03-31 07:31:45  INFO     Saved 87 jobs → public/jobs.json
```

A WhatsApp message will arrive for each new job scoring 75+.

---

## Step 3 — Connect Frontend to Live Data

Open `src/JobRadar.jsx` and find the line near the top:

```js
const MOCK_JOBS = [ ... ]
```

Replace the mock data loading with a fetch from `jobs.json`:

```js
// Add this inside the JobRadar component:
const [scoredJobs, setScoredJobs] = useState([]);

useEffect(() => {
  fetch("/jobs.json")
    .then(r => r.json())
    .then(data => setScoredJobs(data))
    .catch(() => setScoredJobs(MOCK_JOBS)); // fallback to mock
}, []);
```

---

## Step 4 — Push to GitHub

```bash
# Create a new GitHub repo called "jobradar" (keep it private)
# Then from your local jobradar/ folder:

git init
git add .
git commit -m "JobRadar initial setup"
git remote add origin https://github.com/YOUR_USERNAME/jobradar.git
git push -u origin main
```

---

## Step 5 — Add Secrets to GitHub

Your WhatsApp credentials must not be stored in the code.
Store them as GitHub Secrets instead:

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add two secrets:

| Name | Value |
|---|---|
| `WHATSAPP_PHONE` | `+919643566485` |
| `WHATSAPP_API_KEY` | your CallMeBot key |

The scraper workflow reads these automatically via `${{ secrets.WHATSAPP_API_KEY }}`.

---

## Step 6 — Enable GitHub Actions

1. Go to your repo → **Actions** tab
2. If prompted, click **"I understand my workflows, go ahead and enable them"**
3. Click **JobRadar Daily Scrape** → **Run workflow** to test manually
4. Check the Actions log — should complete in ~10 minutes
5. Verify `public/jobs.json` was updated and committed

From now on it runs automatically every day at **7:30 AM IST**.

---

## Step 7 — Deploy Frontend on Netlify (go live)

1. Go to [https://netlify.com](https://netlify.com) and sign in with GitHub
2. Click **Add new site** → **Import an existing project** → select your `jobradar` repo
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**
5. Netlify gives you a URL like `jobradar-shubham.netlify.app`
6. Every time GitHub Actions pushes new `jobs.json`, Netlify auto-rebuilds

For the React frontend, add a `package.json` and `vite.config.js`:

```bash
npm create vite@latest . -- --template react
npm install
# Copy JobRadar.jsx into src/
npm run build
```

---

## Step 8 — Troubleshooting

### Scraper returns 0 jobs
LinkedIn and Naukri update their HTML selectors often. If you see 0 jobs:
1. Open `scraper.py` and set `headless=False` to watch the browser
2. Inspect the page in browser DevTools to find the new CSS selectors
3. Update the `query_selector_all(...)` lines accordingly

### WhatsApp not received
- Double-check your API key in `config.py` (or GitHub Secrets)
- Ensure your phone number includes country code: `+91...`
- Test manually: run `python -c "from notifier import send_whatsapp; send_whatsapp('test')"` 

### GitHub Actions fails
- Check the Actions log for the exact error
- Most common: `playwright install` step failing — re-run the workflow

---

## Daily Flow (once set up)

```
7:30 AM IST  →  GitHub Actions wakes up
               →  Python scraper runs (~10 min)
               →  jobs.json updated & committed
               →  WhatsApp alert for 75+ score jobs
               →  Netlify rebuilds frontend
               →  Open JobRadar on your phone/laptop
```

---

## Quick Reference

| Component | Technology | Cost |
|---|---|---|
| Scraper | Python + Playwright | Free |
| Scheduling | GitHub Actions | Free (2000 min/month) |
| WhatsApp alerts | CallMeBot | Free |
| Frontend hosting | Netlify | Free |
| **Total** | | **₹0/month** |
