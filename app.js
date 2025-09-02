// EdgeLens Agentic AR - Main Application
class EdgeLensAR {
    constructor() {
        this.camera = document.getElementById('camera');
        this.canvas = document.getElementById('overlay');
        this.ctx = this.canvas.getContext('2d');
        this.model = null;
        this.isDetecting = false;
        this.mockSensors = new MockSensorSystem();
        
        // Detection state
        this.lastDetection = null;
        this.detectionHistory = [];
    }

    async init() {
        try {
            // Setup camera
            await this.setupCamera();
            // Try to load AI model (fallback if not available)
            await this.loadAIModel();
            this.updateStatus('EdgeLens AR - Camera Ready');
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateStatus('Camera access required for AR');
        }
    }

    async setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment', // Back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            this.camera.srcObject = stream;
            this.camera.onloadedmetadata = () => {
                // Resize canvas to match video
                this.canvas.width = this.camera.videoWidth;
                this.canvas.height = this.camera.videoHeight;
            };
            
            return true;
        } catch (error) {
            // Fallback to front camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
                this.camera.srcObject = stream;
                return true;
            } catch (fallbackError) {
                throw new Error('Camera access denied');
            }
        }
    }

    async loadAIModel() {
        // For now, we'll simulate AI detection
        // In real implementation, load your Teachable Machine model:
        /*
        try {
            this.model = await tmImage.load('models/model.json', 'models/metadata.json');
            console.log('AI model loaded');
        } catch (error) {
            console.log('Using mock AI detection');
        }
        */
        console.log('Mock AI system ready');
        return true;
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    updateResults(detection, sensors, advice) {
        if (detection) {
            document.getElementById('detection-info').innerHTML = `
                <strong>🎯 Detection:</strong><br>
                Object: ${detection.object}<br>
                Confidence: ${detection.confidence}%<br>
                Status: ${detection.detected ? 'Found' : 'Searching...'}
            `;
        }

        if (sensors) {
            document.getElementById('sensor-data').innerHTML = `
                <strong>📊 Sensors:</strong><br>
                Temp: ${sensors.temperature}°C<br>
                Water: ${sensors.waterLevel}<br>
                Power: ${sensors.powerStatus}<br>
                Vibration: ${sensors.vibration}
            `;
        }

        if (advice) {
            document.getElementById('ai-advice').innerHTML = `
                <strong>🤖 AI Advice:</strong><br>
                ${advice.recommendations.join('<br>')}
            `;
        }
    }

    // Mock AI Detection (replace with real Teachable Machine later)
    detectObject() {
        // Simulate kettle detection with random success
        const scenarios = [
            { object: 'Kettle', detected: true, confidence: 85 },
            { object: 'Kettle', detected: true, confidence: 92 },
            { object: 'Background', detected: false, confidence: 15 },
            { object: 'Appliance', detected: true, confidence: 78 }
        ];
        
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    }

    drawDetectionBox(x, y, width, height, label, confidence) {
        // Clear previous drawings
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw detection box
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw label
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.fillRect(x, y - 35, 200, 30);
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`${label} (${confidence}%)`, x + 5, y - 10);
    }
}

// Mock Sensor System
class MockSensorSystem {
    constructor() {
        this.data = {
            temperature: 25,
            waterLevel: 'unknown',
            powerStatus: 'unknown',
            vibration: 0
        };
        this.scenarios = [
            {
                name: 'Normal Operation',
                temperature: 95,
                waterLevel: 'adequate',
                powerStatus: 'on',
                vibration: 2,
                issue: null,
                advice: ['Kettle operating normally', 'Ready to serve hot water']
            },
            {
                name: 'Power Issue',
                temperature: 25,
                waterLevel: 'adequate', 
                powerStatus: 'off',
                vibration: 0,
                issue: 'No power detected',
                advice: ['Check power cord connection', 'Verify outlet is working', 'Press power button']
            },
            {
                name: 'Low Water',
                temperature: 30,
                waterLevel: 'low',
                powerStatus: 'on',
                vibration: 0,
                issue: 'Insufficient water',
                advice: ['Add water to minimum level', 'Check for leaks', 'Clean water reservoir']
            },
            {
                name: 'Overheating',
                temperature: 105,
                waterLevel: 'adequate',
                powerStatus: 'on',
                vibration: 3,
                issue: 'Temperature too high',
                advice: ['Allow cooling period', 'Check for blockages', 'Reduce heating time']
            }
        ];
    }

    simulate() {
        const scenario = this.scenarios[Math.floor(Math.random() * this.scenarios.length)];
        this.data = { ...scenario };
        return {
            sensors: this.data,
            diagnosis: {
                status: scenario.issue ? 'issue_detected' : 'operational',
                recommendations: scenario.advice,
                priority: scenario.issue ? 'medium' : 'low'
            }
        };
    }
}

// Global app instance
let edgeLensApp;

// Initialize app when page loads
window.addEventListener('load', async () => {
    edgeLensApp = new EdgeLensAR();
    await edgeLensApp.init();
});

// Button handlers
function startDetection() {
    if (edgeLensApp.isDetecting) {
        edgeLensApp.isDetecting = false;
        document.getElementById('start-btn').textContent = 'Start Detection';
        edgeLensApp.updateStatus('Detection stopped');
        return;
    }

    edgeLensApp.isDetecting = true;
    document.getElementById('start-btn').textContent = 'Stop Detection';
    edgeLensApp.updateStatus('🔍 Scanning for objects...');

    // Detection loop
    const detectLoop = () => {
        if (!edgeLensApp.isDetecting) return;

        const detection = edgeLensApp.detectObject();
        edgeLensApp.updateResults(detection, null, null);

        if (detection.detected) {
            // Draw detection box (center of screen for demo)
            const centerX = edgeLensApp.canvas.width * 0.3;
            const centerY = edgeLensApp.canvas.height * 0.3;
            edgeLensApp.drawDetectionBox(centerX, centerY, 200, 150, detection.object, detection.confidence);
            
            edgeLensApp.updateStatus('✅ Object detected - AR active');
        }

        // Continue detection
        setTimeout(detectLoop, 1000);
    };

    detectLoop();
}

function runSensors() {
    edgeLensApp.updateStatus('📡 Reading sensors...');
    
    setTimeout(() => {
        const sensorResult = edgeLensApp.mockSensors.simulate();
        edgeLensApp.updateResults(null, sensorResult.sensors, sensorResult.diagnosis);
        edgeLensApp.updateStatus('✅ Sensor data updated');
    }, 1500);
}
