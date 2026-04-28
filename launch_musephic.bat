@echo off
title MUSEPHIC SYSTEM LAUNCHER
echo [MUSEPHIC] Initiating Strategic Neural Bridge...
start /b node bridge.js
echo [MUSEPHIC] Synchronizing 3D HUD v7.0...
start /b npm run dev
timeout /t 5
echo [MUSEPHIC] Opening Neural Interface...
start http://localhost:5173
echo [MUSEPHIC] System Integrated. Muse is watching.
exit
