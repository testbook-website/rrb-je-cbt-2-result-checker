# RRB Zone PDF Extractor & Dataset Updater
# Usage: Place any new RRB zone PDFs in this directory and run: .\update_zones.ps1

Write-Host "Scanning for RRB PDFs..." -ForegroundColor Cyan
$pdfFiles = Get-ChildItem -Filter "RRB*.pdf" | Sort-Object Name

if ($pdfFiles.Count -eq 0) {
    Write-Host "No RRB PDF files found." -ForegroundColor Yellow
    exit
}

# Locate pdftotext
$pdftotext = (Get-ChildItem -Path "C:\Users\Admin.DESKTOP-MP8ASDB\AppData\Local\Microsoft\WinGet\Packages" -Filter "pdftotext.exe" -Recurse | Select-Object -First 1).FullName
if (!$pdftotext) {
    $cmd = Get-Command pdftotext.exe -ErrorAction SilentlyContinue
    if ($cmd) { $pdftotext = $cmd.Source }
}

if (!$pdftotext) {
    Write-Host "pdftotext not found. Please install poppler." -ForegroundColor Red
    exit
}

$zoneList = @()

foreach ($pdf in $pdfFiles) {
    $tempTxt = "$($pdf.BaseName)_temp.txt"
    & $pdftotext -layout $pdf.FullName $tempTxt
    $content = [System.IO.File]::ReadAllText($tempTxt, [System.Text.Encoding]::UTF8)
    
    # Extract 16-digit roll numbers
    $rolls = [regex]::Matches($content, '\b\d{16}\b') | ForEach-Object { $_.Value } | Sort-Object -Unique
    
    $prefix = if ($rolls.Count -gt 0) { $rolls[0].Substring(0, 5) } else { "2" }
    $cleanName = $pdf.BaseName -replace "\.pdf$", ""
    $id = $cleanName.ToLower().Replace("rrb", "").Replace(" ", "").Trim()
    
    Write-Host "  -> ${cleanName}: Found $($rolls.Count) shortlisted candidates (Prefix: $prefix)" -ForegroundColor Green
    
    $zoneList += @{
        id = $id
        name = "$cleanName (CEN 05/2025)"
        shortName = $cleanName
        exam = "RRB JE CBT-2 / DV & ME"
        cenNo = "CEN 05/2025"
        totalShortlisted = $rolls.Count
        rollLength = 16
        prefix = $prefix
        sampleRolls = if ($rolls.Count -ge 2) { @($rolls[0], $rolls[1], $rolls[-1]) } else { $rolls }
        rolls = $rolls
    }
    
    Remove-Item $tempTxt -ErrorAction SilentlyContinue
}

$data = @{
    updatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    zones = $zoneList
}

if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" }

$json = $data | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText("data/zones.json", $json, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("data/zones.js", ("window.RRB_ZONES_DATA = " + $json + ";"), [System.Text.Encoding]::UTF8)

# Update inline data in index.html safely with UTF-8
$indexHtml = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$regex = New-Object System.Text.RegularExpressions.Regex("const INLINE_RRB_DATA = \{[\s\S]*?\};")
$newInline = "const INLINE_RRB_DATA = $json;"
$updatedHtml = $regex.Replace($indexHtml, $newInline, 1)
[System.IO.File]::WriteAllText("index.html", $updatedHtml, [System.Text.Encoding]::UTF8)

Write-Host "`nSuccessfully updated data/zones.json, data/zones.js, and index.html!" -ForegroundColor Cyan
Write-Host "Total zones configured: $($zoneList.Count)" -ForegroundColor Green
