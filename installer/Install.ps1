param([string]$InstallDir=(Join-Path ([Environment]::GetFolderPath('MyDocuments')) '남하루 설치파일'),[string]$RuntimePath='', [switch]$NoStart,[switch]$NoShortcuts)
$ErrorActionPreference='Stop'
$taskPackage=Split-Path -Parent $MyInvocation.MyCommand.Path
$taskInstall=[IO.Path]::GetFullPath($InstallDir)
if($taskInstall -eq [IO.Path]::GetPathRoot($taskInstall)){throw 'Invalid installation directory'}
New-Item -ItemType Directory -Force -Path $taskInstall | Out-Null
$taskRuntime=Join-Path $taskInstall 'node.exe'
try {
 Write-Host 'Preparing runtime...'
 if(-not $RuntimePath){$taskExisting=Get-Command node.exe -ErrorAction SilentlyContinue;if($taskExisting){$RuntimePath=$taskExisting.Source}}
 if($RuntimePath){$taskVersion=(& $RuntimePath --version).TrimStart('v').Split('.')[0];if([int]$taskVersion -lt 22){$RuntimePath=''}}
 if(-not $RuntimePath){
  [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
  $taskBase='https://nodejs.org/dist/latest-v22.x/'
  $taskArch=if($env:PROCESSOR_ARCHITECTURE -eq 'ARM64'){'arm64'}else{'x64'}
  $taskSums=(Invoke-WebRequest ($taskBase+'SHASUMS256.txt') -UseBasicParsing -TimeoutSec 30).Content
  $taskLine=($taskSums -split "`n" | Where-Object {$_ -match ('  node-v[\d.]+-win-'+$taskArch+'\.zip$')} | Select-Object -First 1).Trim()
  if(-not $taskLine){throw 'Official runtime archive not found'}
  $taskParts=$taskLine -split '\s+'
  $taskTemp=Join-Path ([IO.Path]::GetTempPath()) ('namharu-runtime-'+[guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $taskTemp | Out-Null
  $taskArchive=Join-Path $taskTemp 'node.zip'
  Invoke-WebRequest ($taskBase+$taskParts[1]) -OutFile $taskArchive -UseBasicParsing -TimeoutSec 180
  if((Get-FileHash -LiteralPath $taskArchive -Algorithm SHA256).Hash.ToLower() -ne $taskParts[0]){throw 'Runtime checksum mismatch'}
  Expand-Archive -LiteralPath $taskArchive -DestinationPath $taskTemp
  $taskNodeFolder=Get-ChildItem -LiteralPath $taskTemp -Directory | Select-Object -First 1
  $RuntimePath=Join-Path $taskNodeFolder.FullName 'node.exe'
  Copy-Item -LiteralPath (Join-Path $taskNodeFolder.FullName 'LICENSE') -Destination (Join-Path $taskInstall 'NODE-LICENSE.txt')
 }
 if([IO.Path]::GetFullPath($RuntimePath) -ne $taskRuntime){
  Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -eq $taskRuntime} | Stop-Process
  Copy-Item -LiteralPath $RuntimePath -Destination $taskRuntime -Force
 }
 Write-Host 'Installing files...'
 Copy-Item -Path (Join-Path $taskPackage 'payload\*') -Destination $taskInstall -Recurse -Force
 $taskServer=Join-Path $taskInstall 'donation-tags\control-server.cjs'
 & $taskRuntime --check $taskServer
 if($LASTEXITCODE -ne 0){throw 'Installed runtime verification failed'}
 $taskOutputFile=Join-Path $taskInstall 'NAMHARU-OBS.html'
 & $taskRuntime (Join-Path $taskInstall 'Initialize.cjs') $taskOutputFile
 if($LASTEXITCODE -ne 0){throw 'Output HTML creation failed'}
 if(-not $NoShortcuts){
  $taskShell=New-Object -ComObject WScript.Shell
  $taskLink=$taskShell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Startup')) 'NAMHARU Donation Control.lnk'))
  $taskLink.TargetPath=(Get-Command powershell.exe).Source
  $taskLink.Arguments='-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "'+(Join-Path $taskInstall 'donation-tags\Control-Autostart.ps1')+'"'
  $taskLink.WindowStyle=7;$taskLink.Save()
 }
 if(-not $NoStart){& (Join-Path $taskInstall 'donation-tags\Control-Autostart.ps1');Start-Process 'https://namharu.github.io/Game/donation-tags/'}
 Write-Host ('Installation complete. Register this local file in OBS once: '+$taskOutputFile) -ForegroundColor Green
} catch {Write-Host ('Installation failed: '+$_.Exception.Message) -ForegroundColor Red;Write-Host 'If the runtime download failed, install Node.js LTS from https://nodejs.org/ and run Install.cmd again.';exit 1}

