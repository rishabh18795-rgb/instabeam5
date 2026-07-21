/**
 * InstaBeam — Enquiry form → Google Sheets webhook.
 *
 * Deploy this bound to the target spreadsheet (Extensions → Apps Script),
 * set the SHARED_SECRET script property, then deploy as a Web App
 * (Execute as: Me, Who has access: Anyone). The resulting /exec URL is
 * GOOGLE_SHEETS_WEBHOOK_URL; the property value is
 * GOOGLE_SHEETS_WEBHOOK_SECRET — both are server-only env vars in Vercel,
 * never sent to the browser.
 */

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

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var expectedSecret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");

    if (!expectedSecret || body.token !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
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
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
