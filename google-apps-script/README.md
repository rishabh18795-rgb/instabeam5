# Google Sheets webhook — deployment

`Code.gs` appends one row per enquiry to the **Leads** sheet in
[this spreadsheet](https://docs.google.com/spreadsheets/d/1NLB8gPj0lAaJku28AZdDTUvMn8mzECoW1NN_HlZCAZk/edit).
The only step that has to happen inside your Google account (Claude can't
click through Google's own OAuth consent screen on your behalf):

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Delete the placeholder code and paste in `Code.gs`.
3. **Project Settings (gear icon) → Script Properties → Add script property**:
   - Property: `SHARED_SECRET`
   - Value: a long random string (generate one, e.g. `openssl rand -hex 24`
     — this repo is public, so the value must never be committed here).
4. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → Authorize access (your own Google account).
5. Copy the **Web app URL** it gives you (ends in `/exec`) and send it back,
   along with the same random string from step 3 — they become
   `GOOGLE_SHEETS_WEBHOOK_URL` and `GOOGLE_SHEETS_WEBHOOK_SECRET` in Vercel.

Both env vars are server-only — never exposed to the browser. The Next.js
route at `src/app/api/enquiry/route.ts` posts to the webhook with the
shared secret; the script rejects any request whose token doesn't match.
