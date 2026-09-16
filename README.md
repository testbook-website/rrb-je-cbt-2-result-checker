# 🚂 RRB JE CBT-2 Result Checker Widget

A modern, responsive, embeddable web widget for checking candidate shortlisting status for **Railway Recruitment Boards (RRB) Junior Engineer (JE, DMS, CMA) CBT-2 (CEN No. 05/2025)** Document Verification (DV) and Medical Examination (ME).

All candidate submissions (Name, Mobile Number, Roll Number, Zone, and Shortlist Status) are automatically recorded to your **Google Sheet** in real-time using Google Apps Script!

---

## 🌟 Key Features

- **Accurate Zone Verification**: Includes officially verified shortlist candidates:
  - **RRB Ahmedabad**: 148 shortlisted candidates (Prefix `11525...`)
  - **RRB Bilaspur**: 125 shortlisted candidates (Prefix `30525...`)
  - **RRB Chandigarh**: 108 shortlisted candidates (Prefix `17525...`)
  - **RRB Gorakhpur**: 97 shortlisted candidates (Prefix `19525...`)
  - **RRB Kolkata**: 626 shortlisted candidates (Prefix `22525...`)
  - **RRB Mumbai**: 430 shortlisted candidates (Prefix `24525...`)
  - **RRB Ranchi**: 108 shortlisted candidates (Prefix `27525...`)
  - **Total**: 1,642 shortlisted candidates across 7 RRB zones!
- **Instant Result Feedback**:
  - **Qualified / Shortlisted**: Celebratory particle confetti explosion, candidate verification slip, and official DV & Medical Exam guidelines.
  - **Not Shortlisted**: Empathetic guidance with verification tips and advisory to check individual scorecard on the RRB portal.
- **Lead Capture to Google Sheets**: Captures candidate Name, Mobile Number, Roll Number, Zone, Qualification Status, Timestamp, and Device info.
- **100% Self-Contained**: Works seamlessly out of the box when pushed to **GitHub Pages**, embedded in an **`<iframe>`**, or opened directly in a browser.
- **Iframe Auto-Resize Support**: Emits `rrb-widget-resize` `postMessage` events so the parent container can auto-adjust its height.
- **Built-in Test Pills**: Includes quick-test sample buttons in the UI for instant testing without typing 16 digits.

---

## 🚀 How to Publish to GitHub & GitHub Pages

1. **Push to Remote**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/testbook-website/rrb-je-cbt-2-result-checker.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: `https://github.com/testbook-website/rrb-je-cbt-2-result-checker`
   - Click **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Branch**, select `main` and `/ (root)`.
   - Click **Save**.
   - Your widget will be live at: `https://testbook-website.github.io/rrb-je-cbt-2-result-checker/`

---

## 📱 How to Embed as an Iframe on Any Website or Blog

Insert this HTML snippet wherever you want the widget to appear:

```html
<!-- RRB JE CBT-2 Result Checker Widget -->
<iframe 
  src="https://testbook-website.github.io/rrb-je-cbt-2-result-checker/" 
  width="100%" 
  height="560" 
  frameborder="0" 
  style="border: none; border-radius: 12px; overflow: hidden; max-width: 540px; margin: 0 auto; display: block;"
  title="RRB JE CBT-2 Result Checker"
  loading="lazy">
</iframe>
```

---

## 📊 Google Sheets Setup (Save Student Leads)

Follow these simple steps to connect the widget to your Google Sheet:

1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet (e.g., named `RRB JE CBT 2 Leads`).
2. In the top menu, go to **Extensions** > **Apps Script**.
3. Delete any default code in `Code.gs`.
4. Open [GoogleAppsScript.js](GoogleAppsScript.js) from this repository, copy the entire content, and paste it into the Apps Script editor.
5. Click the **Save** icon (disk icon or `Ctrl + S`).
6. Click **Deploy** (top right blue button) > **New deployment**.
7. Click the gear icon next to "Select type" and select **Web app**.
8. Set the following settings:
   - **Description**: `RRB JE Lead Webhook`
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone` *(CRITICAL: Must be "Anyone" so the widget can log submissions without login)*
9. Click **Deploy**, click **Authorize Access**, and accept the permissions.
10. Copy your **Web App URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`).
11. **Connect to Widget**:
    - **Status**: Already pre-configured in `index.html` with your deployment URL:
      ```javascript
      const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw5BYEqz3NHk2vmDNiMdrO2EjIwXSNRqWg4QRvk69uYMTyTbNhnV_AiNmsuJ3cpaIM6/exec";
      ```
    - **Option B (Directly in UI)**: Click the **Sheet Config** (gear icon) in the bottom-right footer of the widget, paste your Web App URL, and click **Save Configuration**.

---

## 📂 Project Structure

```
├── index.html            # Main widget application (Single-Page App ready for GitHub Pages & iframe)
├── GoogleAppsScript.js   # Production-ready Apps Script for Google Sheet logging
├── update_zones.ps1      # PowerShell tool to automatically extract new RRB zone PDFs
├── data/
│   ├── zones.json        # Structured JSON with all zones and roll numbers
│   └── zones.js          # JavaScript data bundle
├── RRB Kolkata.pdf       # Official RRB Kolkata CBT-2 shortlist PDF (626 candidates)
├── RRB Ranchi.pdf        # Official RRB Ranchi CBT-2 shortlist PDF (108 candidates)
└── README.md             # Documentation & deployment guide
```

---

## ➕ Adding More RRB Zone PDFs in the Future

To add additional zones (e.g. `RRB Mumbai.pdf`, `RRB Allahabad.pdf`, `RRB Chennai.pdf`):
1. Place the new PDF in this root directory named e.g. `RRB Mumbai.pdf`.
2. Run in PowerShell:
   ```powershell
   .\update_zones.ps1
   ```
3. The script will automatically parse all 16-digit roll numbers, update `data/zones.json`, `data/zones.js`, and inline the new data into `index.html`!
