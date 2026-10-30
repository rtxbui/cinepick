$ErrorActionPreference = "Stop"
$src = "C:\Users\rv012\CinePick\CinePick_Presentation.pptx"
$out = "C:\Users\rv012\CinePick\presentations\_preview"
New-Item -ItemType Directory -Force -Path $out | Out-Null
$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = 1
$pres = $ppt.Presentations.Open($src, $true, $true, $false)
$pres.Export($out, "PNG")
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Get-ChildItem $out | ForEach-Object { $_.Name }
Write-Host "EXPORTED"
