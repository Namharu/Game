$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $MyInvocation.MyCommand.Path
$taskNode=Join-Path (Split-Path -Parent $taskRoot) 'node.exe'
if(-not (Test-Path -LiteralPath $taskNode)){$taskNode=(Get-Command node.exe).Source}
try { $null=Invoke-WebRequest 'http://127.0.0.1:8880/__donation/session' -UseBasicParsing -TimeoutSec 2; exit 0 } catch {}
Start-Process -FilePath $taskNode -ArgumentList @(('"'+(Join-Path $taskRoot 'control-server.cjs')+'"')) -WorkingDirectory $taskRoot -WindowStyle Hidden
