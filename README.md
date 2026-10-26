# EstateFlow AI — Real Estate Agency CRM & Intelligent Sales Assistant

EstateFlow AI is a specialized software platform for real estate agencies designed to eliminate salesperson response delays, qualify incoming buyers by budget, propose available viewing slots, and run automated follow-ups.

## Key Features

1. **Instant Property Sales Chatbot**: 24/7 sub-second responses with exact property specs, HOA fees, floor plans, and mortgage calculations.
2. **Cold / Warm / Hot Budget Segregation**:
   - **Hot** ($1M+ / urgent closing): VIP priority and Senior Broker booking.
   - **Warm** ($400k - $999k): Active comparison nurture and weekend viewing invites.
   - **Cold** (<$400k): Long-term drip and price-drop notifications.
3. **Automated Available Viewing Slots**: AI suggests 3–4 conflict-free tour timings; 1-click booking syncs with the agency calendar.
4. **Multi-Channel AI Follow-ups**: Automated WhatsApp, SMS, and Email follow-up sequences powered by Gemini 3.8 Flash.
5. **Interactive CRM Pipeline**: Kanban board and table views with Lead Dossiers, notes, and activity feeds.

---

## How to Push to GitHub

### Method A: Push Using Git CLI
If you created a new empty repository on GitHub (`https://github.com/new`):

```bash
# 1. Open your terminal in this project directory
git init
git add .
git commit -m "Initial commit of EstateFlow AI CRM"
git branch -M main

# 2. Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 3. Push to GitHub
git push -u origin main
```

### Method B: Upload Files Directly on GitHub.com
1. Go to [github.com/new](https://github.com/new) and create a repository.
2. Click **"uploading an existing file"** on the empty repository page.
3. Drag and drop the unzipped project folder files directly into GitHub.
4. Click **Commit changes**.

---

## Local Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`.
