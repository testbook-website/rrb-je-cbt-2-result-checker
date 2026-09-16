/**
 * ============================================================================
 * RRB JE CBT-2 Result Checker - Lead & Verification Tracker (Google Apps Script)
 * ============================================================================
 * 
 * INSTRUCTIONS FOR SETUP:
 * 1. Open Google Sheets (https://sheets.new) and create a new spreadsheet.
 *    Name it e.g. "RRB JE CBT 2 Results Lead Database".
 * 2. Click on "Extensions" in the top menu -> select "Apps Script".
 * 3. Delete any existing code in the editor and paste THIS ENTIRE FILE.
 * 4. Click "Save" (disk icon or Ctrl+S).
 * 5. Click the blue "Deploy" button at the top right -> select "New deployment".
 * 6. Click the gear icon next to "Select type" -> select "Web app".
 * 7. Configure:
 *    - Description: "RRB JE Result Checker Webhook"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone"  <-- CRITICAL! Must be "Anyone" so widget can submit.
 * 8. Click "Deploy". Authorize permissions if prompted.
 * 9. Copy the "Web App URL" (ends in /exec).
 * 10. Paste this Web App URL into your `index.html` file where it says:
 *     const GOOGLE_SCRIPT_URL = "YOUR_DEPLOYMENT_URL_HERE";
 *     (Or enter it directly in the Result Checker widget UI settings).
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent requests
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Ensure headers exist if this is a fresh sheet
    ensureHeaders(sheet);

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // Fallback for form-encoded payload
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = new Date();
    var name = data.name || "N/A";
    var mobile = data.mobile || "N/A";
    var rollNumber = data.rollNumber || "N/A";
    var zone = data.zone || "N/A";
    var status = data.status || "N/A"; // "QUALIFIED" or "NOT_SHORTLISTED"
    var userAgent = data.userAgent || (e.parameter && e.parameter.userAgent) || "Unknown Device";
    var ip = data.ip || "N/A";

    // Append the row
    var newRow = [
      Utilities.formatDate(timestamp, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
      name,
      "'" + mobile, // Prepended apostrophe prevents scientific notation for numbers
      "'" + rollNumber,
      zone,
      status,
      userAgent
    ];

    sheet.appendRow(newRow);

    // Apply color highlight based on status
    var lastRow = sheet.getLastRow();
    var statusCell = sheet.getRange(lastRow, 6);
    if (status.indexOf("QUALIFIED") !== -1 || status.indexOf("SHORTLISTED") !== -1) {
      statusCell.setBackground("#dcfce7"); // light green
      statusCell.setFontColor("#15803d");
      statusCell.setFontWeight("bold");
    } else {
      statusCell.setBackground("#fee2e2"); // light red
      statusCell.setFontColor("#b91c1c");
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Result record saved successfully",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "RRB JE CBT 2 Result Webhook is live and healthy!"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Creates and formats professional header row if sheet is brand new
 */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp (IST)",
      "Candidate Name",
      "Mobile Number",
      "Roll Number",
      "Zone / Region",
      "Result Status",
      "Device / User Agent"
    ];
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1e293b"); // Slate 800
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 160); // Timestamp
    sheet.setColumnWidth(2, 200); // Name
    sheet.setColumnWidth(3, 140); // Mobile
    sheet.setColumnWidth(4, 180); // Roll No
    sheet.setColumnWidth(5, 180); // Zone
    sheet.setColumnWidth(6, 170); // Status
    sheet.setColumnWidth(7, 280); // Device
  }
}

/**
 * Run this function in Apps Script to test directly before deploying
 */
function testDoPost() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        name: "Test Candidate",
        mobile: "9876543210",
        rollNumber: "2252511200532479",
        zone: "RRB Kolkata",
        status: "QUALIFIED (PROVISIONALLY SHORTLISTED)",
        userAgent: "Test Browser (Chrome on Windows)"
      })
    }
  };
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}
