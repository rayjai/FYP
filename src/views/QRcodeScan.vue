<template>
    <Header />
    <div class="header-spacer"></div>
    
    <div class="attendance-container">
      <div class="scanner-card">
        <h1 class="scanner-title">Scan Student Membership QR Code</h1>
        
        <div class="scanner-wrapper">
          <div id="reader" class="qr-scanner"></div>
          
          <div class="scanner-controls">
            <button 
              @click="isScanning ? stopScanning() : startScanning()" 
              :class="['scan-button', isScanning ? 'stop-button' : 'start-button']"
            >
              {{ isScanning ? 'Stop Scanning' : 'Start Scanning' }}
            </button>
          </div>
        </div>
        
        <div v-if="scannedData" class="student-info-card">
          <h2>Student Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name:</span>
              <span class="info-value">{{ scannedData.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Student ID:</span>
              <span class="info-value">{{ scannedData.studentid }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ scannedData.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gender:</span>
              <span class="info-value">{{ scannedData.gender }}</span>
            </div>
          </div>
          
          <button 
            @click="confirmAttendance" 
            class="confirm-button"
            :disabled="isProcessing"
          >
            <span v-if="!isProcessing">Confirm Attendance</span>
            <span v-else class="processing-spinner">Processing...</span>
          </button>
          
          <div v-if="attendanceResult" class="result-message" :class="attendanceResult.success ? 'success' : 'error'">
            {{ attendanceResult.message }}
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </template>
  
  <script>
  import { Html5Qrcode } from "html5-qrcode";
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import Header from '@/components/Header.vue';
  import Footer from '@/components/Footer.vue';
  
  export default {
    components: { Header, Footer },
    setup() {
      const scannedData = ref(null);
      const html5QrCode = ref(null);
      const isScanning = ref(false);
      const isProcessing = ref(false);
      const attendanceResult = ref(null);
      const route = useRoute();
      const eventId = route.params.id;
  
      const startScanning = () => {
        html5QrCode.value = new Html5Qrcode("reader");
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        };
        
        isScanning.value = true;
        attendanceResult.value = null;
  
        html5QrCode.value.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanError
        ).catch(err => {
          console.error("Unable to start scanning:", err);
          isScanning.value = false;
        });
      };
  
      const stopScanning = () => {
        if (html5QrCode.value) {
          html5QrCode.value.stop().then(() => {
            isScanning.value = false;
          }).catch(err => {
            console.error("Failed to stop scanning:", err);
          });
        }
      };
  
      const onScanSuccess = (decodedText) => {
        try {
          scannedData.value = JSON.parse(decodedText);
          stopScanning();
        } catch (e) {
          console.error("Invalid QR code data", e);
          scannedData.value = null;
        }
      };
  
      const onScanError = (errorMessage) => {
        console.warn("QR Code scan error:", errorMessage);
      };
  
      const confirmAttendance = async () => {
  if (!scannedData.value?.studentid) {
    attendanceResult.value = {
      success: false,
      message: 'No valid student data scanned'
    };
    return;
  }

  isProcessing.value = true;
  attendanceResult.value = null;

  try {
    const response = await fetch(`/api/attendance/${eventId}/${scannedData.value.studentid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance: true }),
    });

    const result = await response.json();

    if (response.status === 208) { // Already confirmed
      attendanceResult.value = {
        success: true,
        message: `${scannedData.value.name}'s attendance was already confirmed`
      };
    } 
    else if (response.ok) {
      attendanceResult.value = {
        success: true,
        message: `Attendance confirmed for ${scannedData.value.name}`
      };
      // Reset after successful confirmation
      setTimeout(() => {
        scannedData.value = null;
        startScanning();
      }, 2000);
    } else {
      throw new Error(result.message || 'Failed to confirm attendance');
    }
  } catch (error) {
    attendanceResult.value = {
      success: false,
      message: error.message || 'An error occurred while confirming attendance'
    };
  } finally {
    isProcessing.value = false;
  }
};
  
      return {
        scannedData,
        isScanning,
        isProcessing,
        attendanceResult,
        startScanning,
        stopScanning,
        confirmAttendance
      };
    },
    mounted() {
      this.startScanning();
    },
    beforeUnmount() {
      this.stopScanning();
    }
  };
  </script>
  
  <style scoped>
  .header-spacer {
    height: 80px;
  }
  
  .attendance-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .scanner-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin-bottom: 30px;
  }
  
  .scanner-title {
    color: #2c3e50;
    margin-bottom: 25px;
    text-align: center;
    font-size: 1.8rem;
  }
  
  .scanner-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .qr-scanner {
    width: 100%;
    max-width: 400px;
    height: 300px;
    border: 2px dashed #ddd;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  
  .scanner-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .scan-button {
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    color: white;
    font-size: 1rem;
  }
  
  .start-button {
    background-color: #4CAF50;
  }
  
  .start-button:hover {
    background-color: #3e8e41;
    transform: translateY(-2px);
  }
  
  .stop-button {
    background-color: #f44336;
  }
  
  .stop-button:hover {
    background-color: #d32f2f;
    transform: translateY(-2px);
  }
  
  .student-info-card {
    margin-top: 30px;
    padding: 25px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
  }
  
  .student-info-card h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
    font-size: 1.5rem;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
  }
  
  .info-label {
    font-weight: 600;
    color: #555;
    margin-bottom: 5px;
    font-size: 0.9rem;
  }
  
  .info-value {
    font-size: 1.1rem;
    color: #333;
  }
  
  .confirm-button {
    display: block;
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
    padding: 12px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .confirm-button:hover:not(:disabled) {
    background-color: #0b7dda;
    transform: translateY(-2px);
  }
  
  .confirm-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .processing-spinner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .processing-spinner::after {
    content: "";
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .result-message {
    margin-top: 20px;
    padding: 12px;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
  }
  
  .result-message.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
  }
  
  .result-message.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }
  
  @media (max-width: 768px) {
    .scanner-card {
      padding: 20px;
    }
    
    .qr-scanner {
      height: 250px;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>