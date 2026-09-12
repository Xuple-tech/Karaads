$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $projectRoot 'android'
$appDir = Join-Path $androidDir 'app'
$buildsDir = Join-Path $projectRoot 'builds'
$keystore = Join-Path $appDir 'karaads-upload-key.jks'
$properties = Join-Path $androidDir 'keystore.properties'
$credentials = Join-Path $buildsDir 'KaraAds-signing-credentials.txt'
$backupKey = Join-Path $buildsDir 'KaraAds-upload-key.jks'

if ((Test-Path $keystore) -or (Test-Path $properties)) {
    throw 'A KaraAds release key or signing configuration already exists; refusing to replace it.'
}

New-Item -ItemType Directory -Force -Path $buildsDir | Out-Null
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
$password = [Convert]::ToBase64String($bytes).Replace('+', 'A').Replace('/', 'B').TrimEnd('=')
$alias = 'karaads-upload'

& keytool -genkeypair -v -storetype PKCS12 -keystore $keystore -alias $alias -keyalg RSA -keysize 2048 -validity 10000 -storepass $password -keypass $password -dname 'CN=KaraAds, OU=Mobile, O=KaraAds, L=Lagos, ST=Lagos, C=NG'
if ($LASTEXITCODE -ne 0) { throw "keytool failed with exit code $LASTEXITCODE" }

$propertyText = @(
    'storeFile=karaads-upload-key.jks'
    "storePassword=$password"
    "keyAlias=$alias"
    "keyPassword=$password"
) -join [Environment]::NewLine
[IO.File]::WriteAllText($properties, $propertyText + [Environment]::NewLine)

$credentialText = @(
    'KaraAds Android upload-key credentials'
    'IMPORTANT: Keep this file and KaraAds-upload-key.jks private and permanently backed up.'
    "Alias: $alias"
    "Store password: $password"
    "Key password: $password"
) -join [Environment]::NewLine
[IO.File]::WriteAllText($credentials, $credentialText + [Environment]::NewLine)
Copy-Item -LiteralPath $keystore -Destination $backupKey

Write-Output "Created upload key: $keystore"
Write-Output "Created backup key: $backupKey"
Write-Output "Created private credentials file: $credentials"
