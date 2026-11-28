$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $MyInvocation.MyCommand.Path
try { $null=Invoke-WebRequest 'http://127.0.0.1:8880/__donation/session' -UseBasicParsing -TimeoutSec 2 } catch {
 Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(('"'+(Join-Path $taskRoot 'control-server.cjs')+'"')) -WorkingDirectory $taskRoot -WindowStyle Hidden
 for($taskAttempt=0;$taskAttempt -lt 20;$taskAttempt++) { try { $null=Invoke-WebRequest 'http://127.0.0.1:8880/__donation/session' -UseBasicParsing -TimeoutSec 1; break } catch { Start-Sleep -Milliseconds 200 } }
}
Start-Process 'http://127.0.0.1:8880/donation-tags/'
