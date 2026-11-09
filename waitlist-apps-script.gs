/**
 * Cini waitlist -> Google Sheet
 *
 * Live setup (2026-11-09): a standalone Apps Script project "Cini waitlist" (script.google.com),
 * deployed as a Web app (Execute as: Me, Who has access: Anyone). It writes to the existing
 * "Kini Waitlist" sheet, which also holds the sign-ups from the old Framer form:
 *   Date | Email | Source | Page
 * The Web app URL (ends in /exec) is site.waitlistEndpoint in src/site.ts.
 *
 * Duplicate emails are ignored, so double-clicks and repeat sign-ups don't add rows.
 * If you edit this script later, use Deploy > Manage deployments > Edit > Version: New version
 * so the same URL keeps working.
 */

var SHEET_ID = "1RswFLXkGZWzIftFU_EbhidQAKjhMwmvu5ulyYV7a3Mc";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      return json({ ok: false, error: "invalid_email" });
    }

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (!sheet.getRange(1, 3).getValue()) sheet.getRange(1, 3, 1, 2).setValues([["Source", "Page"]]);
    var last = sheet.getLastRow();
    if (last > 1) {
      var existing = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).toLowerCase() === email) return json({ ok: true, duplicate: true });
      }
    }

    sheet.appendRow([
      // Same format as the older rows from the Framer form, e.g. 2025-11-16T17:37:42Z
      new Date().toISOString().replace(/\.\d+Z$/, "Z"),
      safe(email),
      safe(String(body.source || "").slice(0, 40)),
      safe(String(body.page || "").slice(0, 80)),
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "server_error" });
  } finally {
    lock.releaseLock();
  }
}

// Stop anything that looks like a formula from running in the Sheet.
function safe(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
