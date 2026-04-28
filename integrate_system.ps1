$Action = New-ScheduledTaskAction -Execute "c:\Users\sathw\M.U.S.P.H.I.C\launch_musephic.bat"
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Days 365)
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName "MusephicAutonomous" -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Force

Write-Host "[MUSEPHIC] Locked-Screen Access Integrated. System now operates at Kernel-level priority." -ForegroundColor Cyan
