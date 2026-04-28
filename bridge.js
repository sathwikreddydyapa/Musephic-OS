const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Volume Control
app.post('/volume', (req, res) => {
    const { action, value } = req.body;
    let command = '';
    
    if (action === 'up') {
        command = `powershell -Command "$w = New-Object -ComObject WScript.Shell; for($i=0; $i<5; $i++) { $w.SendKeys([char]175) }"`;
    } else if (action === 'down') {
        command = `powershell -Command "$w = New-Object -ComObject WScript.Shell; for($i=0; $i<5; $i++) { $w.SendKeys([char]174) }"`;
    } else if (value !== undefined) {
        // Setting specific volume is complex in PS without extra libs, so we simulate with jumps
        res.status(200).send({ message: "Incremental control only via script" });
        return;
    }

    exec(command, (err) => {
        if (err) return res.status(500).send(err);
        res.send({ status: 'success' });
    });
});

// Brightness Control
app.post('/brightness', (req, res) => {
    const { value } = req.body;
    const command = `powershell -Command "(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(0, ${value})"`;
    
    exec(command, (err) => {
        if (err) return res.status(500).send(err);
        res.send({ status: 'success' });
    });
});

// App Launching
app.post('/launch', (req, res) => {
    const { appPath } = req.body;
    // Simple command to start process
    const command = `powershell -Command "Start-Process '${appPath}'"`;
    
    exec(command, (err) => {
        if (err) return res.status(500).send(err);
        res.send({ status: 'success' });
    });
});

// Keyboard Simulation (Typing)
app.post('/type', (req, res) => {
    const { text } = req.body;
    // Using SendKeys to simulate typing
    const command = `powershell -Command "$w = New-Object -ComObject WScript.Shell; $w.SendKeys('${text}')"`;
    
    exec(command, (err) => {
        if (err) return res.status(500).send(err);
        res.send({ status: 'success' });
    });
});

// Screenshot Capture
app.post('/screenshot', (req, res) => {
    const command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $Screen = [System.Windows.Forms.Screen]::PrimaryScreen; $Width = $Screen.Bounds.Width; $Height = $Screen.Bounds.Height; $Left = $Screen.Bounds.Left; $Top = $Screen.Bounds.Top; $Bitmap = New-Object System.Drawing.Bitmap($Width, $Height); $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap); $Graphics.CopyFromScreen($Left, $Top, 0, 0, $Bitmap.Size); $Bitmap.Save('C:\\Users\\sathw\\M.U.S.P.H.I.C\\intrusion_screenshot.png', [System.Drawing.Imaging.ImageFormat]::Png); $Graphics.Dispose(); $Bitmap.Dispose();"`;
    
    exec(command, (err) => {
        if (err) return res.status(500).send(err);
        res.send({ status: 'success', path: 'intrusion_screenshot.png' });
    });
});

// System Lock
app.post('/lock', (req, res) => {
    const command = `powershell -Command "rundll32.exe user32.dll,LockWorkStation"`;
    
    exec(command, (err) => {
        if (err) return res.status(500).send(err);
        res.send({ status: 'success' });
    });
});

app.listen(port, () => {
    console.log(`Musephic System Bridge running at http://localhost:${port}`);
});
