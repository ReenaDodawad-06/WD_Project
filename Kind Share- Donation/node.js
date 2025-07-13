const { exec } = require('child_process');

exec(`powershell -Command "Get-Process | Where-Object { $_.ProcessName -eq 'node' } | Select-Object Id, ProcessName, StartTime"`, 
(err, stdout, stderr) => {
    if (err) {
        console.error('Error running PowerShell:', err);
        return;
    }
    if (stderr) {
        console.error('PowerShell stderr:', stderr);
        return;
    }
    console.log('PowerShell output:\n', stdout);
});
