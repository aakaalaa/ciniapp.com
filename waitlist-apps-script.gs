/**
 * Cini waitlist -> Google Sheet
 *
 * SETUP (about 5 minutes, one time):
 *   1. Create a Google Sheet named "Cini waitlist". In row 1 put:
 *        timestamp | email | source | page
 *   2. In the Sheet: Extensions > Apps Script. Delete what's there, paste this file, Save.
 *   3. Deploy > New deployment > type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Click Deploy, approve the permissions, and copy the Web app URL
 *      (it ends in /exec).
 *   4. Put that URL in src/site.ts as waitlistEndpoint.
 *
 * Duplicate emails are ignored, so double-clicks and repeat sign-ups don't add rows.
 * If you edit this script later, use Deploy > Manage deployments > Edit > New version
 * so the same URL keeps working.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      return json({ ok: false, error: "invalid_email" });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var last = sheet.getLastRow();
    if (last > 1) {
      var existing = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).toLowerCase() === email) return json({ ok: true, duplicate: true });
      }
    }

    sheet.appendRow([
      new Date(),
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
