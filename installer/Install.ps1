param([string]$InstallDir=(Join-Path ([Environment]::GetFolderPath('MyDocuments')) '남하루 설치파일'),[string]$RuntimePath='', [switch]$NoStart,[switch]$NoShortcuts)
$ErrorActionPreference='Stop'
$taskPackage=Split-Path -Parent $MyInvocation.MyCommand.Path
$taskInstall=[IO.Path]::GetFullPath($InstallDir)
if($taskInstall -eq [IO.Path]::GetPathRoot($taskInstall)){throw 'Invalid installation directory'}
New-Item -ItemType Directory -Force -Path $taskInstall | Out-Null
$taskRuntime=Join-Path $taskInstall 'node.exe'
try {
 Write-Host 'Preparing bundled runtime...'
 $RuntimePath=Join-Path $taskPackage 'runtime\node.exe'
 if(-not (Test-Path -LiteralPath $RuntimePath)){throw 'Bundled runtime missing. Extract the entire ZIP and run Install.cmd again.'}
 if((Get-FileHash -LiteralPath $RuntimePath -Algorithm SHA256).Hash.ToLower() -ne '247e9693d316da9857e44990e5e11709f596f18112251b8026ec6eed80bdf38a'){throw 'Bundled runtime checksum mismatch. Download the installation ZIP again.'}
 Copy-Item -LiteralPath (Join-Path $taskPackage 'runtime\LICENSE') -Destination (Join-Path $taskInstall 'NODE-LICENSE.txt') -Force
 if([IO.Path]::GetFullPath($RuntimePath) -ne $taskRuntime){
  $taskProcesses=@(Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -eq $taskRuntime})
  foreach($taskProcess in $taskProcesses){Stop-Process -Id $taskProcess.Id -Force; Wait-Process -Id $taskProcess.Id -Timeout 10 -ErrorAction SilentlyContinue}
  Start-Sleep -Milliseconds 300
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
} catch {Write-Host ('Installation failed: '+$_.Exception.Message) -ForegroundColor Red;Write-Host 'Extract the entire installation ZIP and run Install.cmd again. No separate Node.js download is required.';exit 1}

