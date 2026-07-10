$ErrorActionPreference = 'Stop'

Write-Host "[media] Installing FFmpeg on Windows..."

function Try-WingetInstall {
    param(
        [string[]]$PackageIds
    )

    foreach ($packageId in $PackageIds) {
        try {
            Write-Host "[media] Trying winget package: $packageId"
            winget install --id $packageId --exact --source winget --accept-package-agreements --accept-source-agreements
            return $true
        }
        catch {
            Write-Host "[media] winget install failed for $packageId: $($_.Exception.Message)"
        }
    }

    return $false
}

function Find-BinaryPath {
    param(
        [string]$Name
    )

    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $wingetLink = Join-Path $env:LOCALAPPDATA "Microsoft\\WinGet\\Links\\$Name.exe"
    if (Test-Path $wingetLink) {
        return $wingetLink
    }

    $commonCandidates = @(
        "C:\\ffmpeg\\bin\\$Name.exe",
        "C:\\Program Files\\ffmpeg\\bin\\$Name.exe"
    )

    foreach ($candidate in $commonCandidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

$installed = $false

if (Get-Command winget -ErrorAction SilentlyContinue) {
    $installed = Try-WingetInstall -PackageIds @(
        "Gyan.FFmpeg.Essentials",
        "Gyan.FFmpeg",
        "BtbN.FFmpeg.LGPL.7.1"
    )
}
elseif (Get-Command choco -ErrorAction SilentlyContinue) {
    choco install ffmpeg -y
    $installed = $true
}
else {
    throw "Neither winget nor chocolatey is available. Install FFmpeg manually and set FFMPEG_BINARY/FFPROBE_BINARY."
}

$ffmpegPath = Find-BinaryPath -Name "ffmpeg"
$ffprobePath = Find-BinaryPath -Name "ffprobe"

if (-not $ffmpegPath -or -not $ffprobePath) {
    throw @"
FFmpeg install did not complete (likely network timeout to download host).

Manual fallback:
1) Download a Windows FFmpeg build zip from another network/machine.
2) Extract to C:\ffmpeg\bin
3) Set env vars in .env:
   FFMPEG_BINARY=C:\ffmpeg\bin\ffmpeg.exe
   FFPROBE_BINARY=C:\ffmpeg\bin\ffprobe.exe
4) Run: php artisan config:clear
5) Verify: php artisan media:ffmpeg-status
"@
}

Write-Host "[media] FFmpeg:  $ffmpegPath"
Write-Host "[media] FFprobe: $ffprobePath"
ffmpeg -version | Select-Object -First 1
ffprobe -version | Select-Object -First 1

Write-Host "[media] Done."
