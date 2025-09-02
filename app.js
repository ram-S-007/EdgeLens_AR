class EdgeLensApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.liveMessage = document.getElementById('liveMessage');
        this.cameraOverlay = document.getElementById('cameraOverlay');
        
        this.stream = null;
        this.currentStep = 'idle';
        this.currentIssue = null;
        this.scanTimeout = null;
        
        // Common device issues
        this.deviceIssues = [
            {
                issue: "Won't turn on",
                description: "Power supply failure or internal circuitry malfunction detected",
                sensorData: "Voltage: 0.2V (Normal: 220-240V)",
                overlay: "⚡ Power Supply Check",
                question: "Is the device completely unresponsive when you press the power button?"
            },
            {
                issue: "Takes too long to boil / Overheating",
                description: "Temperature regulation system showing abnormal readings",
                sensorData: "Temperature: 115°C (Normal: 95-100°C)",
                overlay: "🌡️ Temperature Analysis",
                question: "Does the device take much longer than usual to heat up or get extremely hot?"
            },
            {
                issue: "Leaking from the body",
                description: "Structural integrity compromised - seal failure detected",
                sensorData: "Pressure: 0.6 atm (Normal: 1.2-1.5 atm)",
                overlay: "💧 Pressure Test",
                question: "Do you notice any water or liquid leaking from the device?"
            },
            {
                issue: "Auto-shutoff not working",
                description: "Safety system malfunction - critical temperature override detected",
                sensorData: "Safety Circuit: BYPASS (Normal: ACTIVE)",
                overlay: "🚨 Safety System Check",
                question: "Does the device continue operating beyond normal limits without stopping?"
            }
        ];
        
        this.init();
    }
    
    init() {
        const scanBtn = document.getElementById('scanBtn');
        const historyBtn = document.getElementById('historyBtn');
        const closeCamera = document.getElementById('closeCamera');
        const yesBtn = document.getElementById('yesBtn');
        const noBtn = document.getElementById('noBtn');
        
        scanBtn.addEventListener('click', () => this.startScan());
        historyBtn.addEventListener('click', () => this.showHistory());
        closeCamera.addEventListener('click', () => this.closeScan());
        yesBtn.addEventListener('click', () => this.handleResponse(true));
        noBtn.addEventListener('click', () => this.handleResponse(false));
        
        this.showResult('👋 Ready for device diagnostics! Click "Start Diagnostic Scan" to begin.', 'info');
        console.log('EdgeLens AR Diagnostics initialized');
    }
    
    async startScan() {
        if (this.currentStep !== 'idle') return;
        
        this.currentStep = 'scanning';
        
        try {
            // Show camera overlay
            this.cameraOverlay.style.display = 'block';
            document.getElementById('scanBtn').disabled = true;
            
            // Request camera
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            this.video.srcObject = this.stream;
            await this.video.play();
            
            this.canvas.width = this.video.videoWidth || 640;
            this.canvas.height = this.video.videoHeight || 480;
            
            this.showLiveMessage('🔍 Scanning for device QR codes...');
            
            // Auto-proceed after 5 seconds (simulate QR detection)
            this.scanTimeout = setTimeout(() => {
                this.handleQRDetected();
            }, 5000);
            
        } catch (error) {
            console.error('Camera error:', error);
            this.showLiveMessage('❌ Camera access required. Please allow camera permission.');
            this.closeScan();
        }
    }
    
    handleQRDetected() {
        // Simulate QR code detection - you can add real jsQR scanning here
        const simulatedQR = "DEVICE_KTL_001"; // Change this to test different scenarios
        
        if (this.isKnownDevice(simulatedQR)) {
            document.getElementById('deviceId').value = simulatedQR;
            this.showLiveMessage('✅ Smart device detected! Confirming device type...');
            
            setTimeout(() => {
                this.confirmDevice();
            }, 2000);
        } else {
            this.showLiveMessage('⚠️ Unknown device QR code detected. Please scan a supported device.');
            
            setTimeout(() => {
                this.showLiveMessage('🔍 Scanning for device QR codes...');
                // Continue scanning or restart
                this.scanTimeout = setTimeout(() => {
                    this.handleQRDetected(); // For demo, keep trying
                }, 3000);
            }, 3000);
        }
    }
    
    isKnownDevice(qrData) {
        const knownDevices = ['DEVICE_KTL_001', 'KETTLE_001', 'PRINTER_001', 'ROUTER_001'];
        return knownDevices.some(device => qrData.includes(device) || qrData.includes('DEVICE'));
    }
    
    confirmDevice() {
        this.currentStep = 'confirming';
        this.showLiveMessage('🤖 Device confirmed! Running AI diagnostic analysis...');
        
        setTimeout(() => {
            this.startDiagnostics();
        }, 3000);
    }
    
    startDiagnostics() {
        this.currentStep = 'diagnosing';
        
        // Select random issue from the 4 specified
        this.currentIssue = this.deviceIssues[Math.floor(Math.random() * this.deviceIssues.length)];
        
        this.showLiveMessage(`🔬 ${this.currentIssue.overlay}<br><br>${this.currentIssue.sensorData}`);
        
        setTimeout(() => {
            this.showDiagnosisSummary();
        }, 4000);
    }
    
    showDiagnosisSummary() {
        this.currentStep = 'questioning';
        
        const message = `
            <strong>⚠️ Issue Detected:</strong> ${this.currentIssue.issue}<br><br>
            <strong>Analysis:</strong> ${this.currentIssue.description}<br><br>
            <strong>❓ User Confirmation:</strong><br>
            ${this.currentIssue.question}
        `;
        
        this.showLiveMessage(message, true);
    }
    
    handleResponse(confirmed) {
        document.getElementById('interactiveButtons').style.display = 'none';
        
        if (confirmed) {
            this.showLiveMessage(`
                ✅ <strong>Issue Confirmed!</strong><br><br>
                <strong>Recommendation:</strong> Contact service technician immediately.<br>
                <strong>Priority:</strong> ${this.getSeverity(this.currentIssue.issue)}<br><br>
                Diagnostic complete - returning to home screen...
            `);
            
            this.saveToHistory(true);
            
            setTimeout(() => {
                this.closeScan();
                this.showResult(`Diagnostic complete: ${this.currentIssue.issue}`, 'error');
            }, 4000);
            
        } else {
            this.showLiveMessage('🔄 Running additional diagnostic tests...');
            
            setTimeout(() => {
                // Select different issue or show no issues
                if (Math.random() > 0.3) {
                    const otherIssues = this.deviceIssues.filter(issue => issue !== this.currentIssue);
                    this.currentIssue = otherIssues[Math.floor(Math.random() * otherIssues.length)];
                    this.showDiagnosisSummary();
                } else {
                    this.showLiveMessage('✅ No critical issues detected.<br><br>Device appears to be functioning normally.');
                    this.saveToHistory(false);
                    
                    setTimeout(() => {
                        this.closeScan();
                        this.showResult('Diagnostic complete: No issues found', 'success');
                    }, 3000);
                }
            }, 2000);
        }
    }
    
    getSeverity(issue) {
        if (issue.includes('turn on') || issue.includes('shutoff')) return 'CRITICAL';
        if (issue.includes('leak') || issue.includes('Overheating')) return 'HIGH';
        return 'MODERATE';
    }
    
    showLiveMessage(message, showButtons = false) {
        this.liveMessage.innerHTML = message;
        this.liveMessage.style.display = 'block';
        
        const buttons = document.getElementById('interactiveButtons');
        buttons.style.display = showButtons ? 'flex' : 'none';
    }
    
    saveToHistory(issueFound) {
        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        const entry = {
            deviceId: document.getElementById('deviceId').value || 'Unknown Device',
            issue: issueFound ? this.currentIssue.issue : 'No issues detected',
            severity: issueFound ? this.getSeverity(this.currentIssue.issue) : 'Good',
            timestamp: new Date().toLocaleString()
        };
        
        history.unshift(entry);
        if (history.length > 10) history.splice(10);
        
        localStorage.setItem('diagnosticHistory', JSON.stringify(history));
    }
    
    showHistory() {
        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        
        if (history.length === 0) {
            this.showResult('📝 No diagnostic history available.', 'info');
            return;
        }
        
        const historyHtml = `
            <div class="status-card">
                <h3>📊 Diagnostic History</h3>
                ${history.map(record => `
                    <div style="background: rgba(0,0,0,0.05); padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid ${this.getSeverityColor(record.severity)};">
                        <strong>${record.issue}</strong><br>
                        <small>Device: ${record.deviceId}</small><br>
                        <small>Time: ${record.timestamp}</small><br>
                        <span style="background: ${this.getSeverityColor(record.severity)}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">${record.severity}</span>
                    </div>
                `).join('')}
                <button class="scan-btn" onclick="app.clearHistory()" style="background: linear-gradient(135deg, #dc3545, #c82333); margin-top: 15px;">
                    🗑️ Clear History
                </button>
            </div>
        `;
        
        document.getElementById('resultContainer').innerHTML = historyHtml;
    }
    
    getSeverityColor(severity) {
        const colors = {
            'CRITICAL': '#f44336',
            'HIGH': '#ff9800', 
            'MODERATE': '#ffc107',
            'Good': '#4caf50'
        };
        return colors[severity] || '#666';
    }
    
    clearHistory() {
        localStorage.removeItem('diagnosticHistory');
        this.showResult('✅ History cleared successfully!', 'success');
    }
    
    closeScan() {
        this.currentStep = 'idle';
        
        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
            this.scanTimeout = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.cameraOverlay.style.display = 'none';
        document.getElementById('scanBtn').disabled = false;
        document.getElementById('deviceId').value = '';
        
        this.liveMessage.style.display = 'none';
        document.getElementById('interactiveButtons').style.display = 'none';
        
        this.currentIssue = null;
    }
    
    showResult(message, type) {
        document.getElementById('resultContainer').innerHTML = 
            `<div class="result-card ${type}">${message}</div>`;
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EdgeLensApp();
});
