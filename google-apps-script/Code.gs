/**
 * InstaBeam — Enquiry form → Google Sheets webhook.
 *
 * This is a STANDALONE script (not bound to the spreadsheet), so it opens
 * the target sheet explicitly by ID rather than relying on
 * SpreadsheetApp.getActiveSpreadsheet() (which only works for bound
 * scripts and silently produced no rows here).
 *
 * Set the SHARED_SECRET script property (Project Settings → Script
 * Properties), then Deploy → New deployment → Web app (Execute as: Me,
 * Who has access: Anyone). The resulting /exec URL is
 * GOOGLE_SHEETS_WEBHOOK_URL in Vercel; the property value is
 * GOOGLE_SHEETS_WEBHOOK_SECRET — both server-only, never sent to the
 * browser.
 */

var SPREADSHEET_ID = "1NLB8gPj0lAaJku28AZdDTUvMn8mzECoW1NN_HlZCAZk";
var SHEET_NAME = "Leads";
var HEADERS = [
  "Timestamp",
  "Full Name",
  "Company Name",
  "Email",
  "Phone Number",
  "Service Interested",
  "Budget",
  "Message",
  "Website URL",
  "Source Page",
  "IP Address",
  "User Agent",
];
// Apps Script's CacheService caps entries at 6 hours — long enough to
// absorb the Next.js route's retry attempts for a single submission
// without risking a duplicate row.
var DEDUPE_TTL_SECONDS = 21600;

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "Missing request body." });
    }

    var body = JSON.parse(e.postData.contents);
    var expectedSecret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");

    if (!expectedSecret || body.token !== expectedSecret) {
      console.error("doPost: unauthorized request (bad or missing token).");
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    if (body.requestId) {
      var cache = CacheService.getScriptCache();
      var cacheKey = "req_" + body.requestId;
      if (cache.get(cacheKey)) {
        console.log("doPost: duplicate requestId " + body.requestId + ", skipping append.");
        return jsonResponse({ ok: true, duplicate: true });
      }
      cache.put(cacheKey, "1", DEDUPE_TTL_SECONDS);
    }

    var sheet = getOrCreateSheet();

    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.name || "",
      body.company || "",
      body.email || "",
      body.phone || "",
      body.serviceInterested || "",
      body.budget || "",
      body.message || "",
      body.websiteUrl || "",
      body.sourcePage || "",
      body.ip || "",
      body.userAgent || "",
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("doPost failed: " + err + (err && err.stack ? "\n" + err.stack : ""));
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Run this manually from the Apps Script editor (select "testAppend"
 * in the function dropdown, then Run) to verify sheet access and row
 * creation work independent of the web app / HTTP layer. */
function testAppend() {
  var sheet = getOrCreateSheet();
  sheet.appendRow([
    new Date().toISOString(),
    "Manual Test",
    "Test Co",
    "manual-test@example.com",
    "",
    "Website & Shopify",
    "",
    "Run via the Apps Script editor's testAppend() function.",
    "example.com",
    "manual-test",
    "",
    "",
  ]);
  console.log("testAppend: row appended to " + SHEET_NAME);
}
