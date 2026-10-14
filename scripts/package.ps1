$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifestPath = Join-Path $projectRoot 'manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$buildRoot = Join-Path $projectRoot 'build\extension'
$releaseRoot = Join-Path $projectRoot 'release'
$downloadRoot = Join-Path $projectRoot 'docs\downloads'
$archiveName = "liubai-notes-edge-v$($manifest.version).zip"
$archivePath = Join-Path $releaseRoot $archiveName
$siteArchivePath = Join-Path $downloadRoot $archiveName

npm test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed.' }

npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }

New-Item -ItemType Directory -Force -Path $releaseRoot, $downloadRoot | Out-Null
Remove-Item -LiteralPath $archivePath -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $siteArchivePath -Force -ErrorAction SilentlyContinue

Compress-Archive -Path (Join-Path $buildRoot '*') -DestinationPath $archivePath -CompressionLevel Optimal
Copy-Item -LiteralPath $archivePath -Destination $siteArchivePath

Write-Output "Packaged: $archivePath"
Write-Output "Website download: $siteArchivePath"
