param([string]$RuntimeDirectory='')
$ErrorActionPreference='Stop'
if(-not $RuntimeDirectory){throw 'Supply -RuntimeDirectory containing verified Node.js v22.23.5 win-x64 node.exe and LICENSE'}
$taskRepo=Split-Path -Parent $PSScriptRoot
$taskBuild=Join-Path $taskRepo ('.installer-work\package-'+[guid]::NewGuid().ToString('N'))
$taskPayload=Join-Path $taskBuild 'payload'
New-Item -ItemType Directory -Force -Path (Join-Path $taskPayload 'donation-tags'),(Join-Path $taskPayload 'shared') | Out-Null
$taskFiles=@('app.js','auto-file.js','Control-Autostart.ps1','Control-Start.ps1','Launch-Control.cmd','control-bridge.js','control-launch.html','control-server.cjs','core.js','custom-editor.js','index.html','layout.js','local-images.js','local-test.js','output.html','output.js','overlay.html','placement.js','studio-ui.js','style.css')
foreach($taskFile in $taskFiles){Copy-Item -LiteralPath (Join-Path $taskRepo ('donation-tags\'+$taskFile)) -Destination (Join-Path $taskPayload ('donation-tags\'+$taskFile))}
foreach($taskFile in @('centrifuge-2.8.5.min.js','panda-chat.js','nickname-images.js','skin-preferences.js')){Copy-Item -LiteralPath (Join-Path $taskRepo ('shared\'+$taskFile)) -Destination (Join-Path $taskPayload ('shared\'+$taskFile))}
if((Get-FileHash -LiteralPath (Join-Path $RuntimeDirectory 'node.exe') -Algorithm SHA256).Hash.ToLower() -ne '247e9693d316da9857e44990e5e11709f596f18112251b8026ec6eed80bdf38a'){throw 'Runtime checksum mismatch'}
New-Item -ItemType Directory -Path (Join-Path $taskBuild 'runtime') | Out-Null
Copy-Item -LiteralPath (Join-Path $RuntimeDirectory 'node.exe'),(Join-Path $RuntimeDirectory 'LICENSE') -Destination (Join-Path $taskBuild 'runtime')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Initialize.cjs') -Destination $taskPayload
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Install.ps1'),(Join-Path $PSScriptRoot 'Install.cmd') -Destination $taskBuild
'Extract all files, then double-click Install.cmd. Windows x64. Node.js v22.23.5 and its license are included; installation needs no additional download. Live broadcasting still requires internet. Add a Browser source in OBS, check Local file, and paste the absolute path copied from the settings page. Do not move or rename NAMHARU-OBS.html. Personal settings are not included in this package.' | Set-Content -Encoding utf8 (Join-Path $taskBuild 'README.txt')
$taskZip=Join-Path $taskRepo 'downloads\NAMHARU-Donation-Setup.zip'
Compress-Archive -Path (Join-Path $taskBuild '*') -DestinationPath $taskZip -Force
Write-Output $taskBuild
