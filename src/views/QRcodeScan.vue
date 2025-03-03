<template>
     <Header />
     <div style="height: 80px;"></div>
    <div class="qr-scanner">
        <h1>Scan Student Membership QR Code</h1>
        <div id="reader"></div>
        <div id="result" v-if="scannedData">
            <h2>Scanned Data:</h2>
            <p><strong>Name:</strong> {{ scannedData.name }}</p>
            <p><strong>Student ID:</strong> {{ scannedData.studentid }}</p> <!-- Ensure this matches your QR code data -->
            <p><strong>Email:</strong> {{ scannedData.email }}</p>
            <p><strong>Gender:</strong> {{ scannedData.gender }}</p>
            <button @click="confirmAttendance">Confirm Attendance</button>
        </div>
        <button @click="stopScanning" v-if="isScanning">Stop Scanning</button>
        <button v-if="!isScanning" @click="startScanning">Start Scanning</button>
    </div>
    <Footer />
</template>

<script>
import { Html5Qrcode } from "html5-qrcode";
import { ref } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

export default {
    components: {
        Header, 
        Footer, 
    },
    setup() {
        const scannedData = ref(null);
        const html5QrCode = ref(null);
        const isScanning = ref(false); // Track scanning state
        const route = useRoute(); // Get route parameters
        const eventId = route.params.id; // Get event_id from route parameters

        const startScanning = () => {
            html5QrCode.value = new Html5Qrcode("reader");
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            };
            isScanning.value = true;

            html5QrCode.value.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanError
            ).catch(err => {
                console.error("Unable to start scanning:", err);
                isScanning.value = false; // Reset scanning state on error
            });
        };

        const stopScanning = () => {
            if (html5QrCode.value) {
                html5QrCode.value.stop().then(() => {
                    console.log("QR Code scanning stopped.");
                    isScanning.value = false; // Update scanning state
                }).catch(err => {
                    console.error("Failed to stop scanning:", err);
                });
            }
        };

        const onScanSuccess = (decodedText) => {
            try {
                scannedData.value = JSON.parse(decodedText);
            } catch (e) {
                console.error("Invalid JSON format", e);
                scannedData.value = null; // Reset scanned data on error
            }
        };

        const onScanError = (errorMessage) => {
            console.warn("QR Code scan error: ", errorMessage);
        };

        const confirmAttendance = async () => {
            if (scannedData.value && scannedData.value.studentid) { // Ensure correct property name
                try {
                    const response = await fetch(`/api/attendance/${eventId}/${scannedData.value.studentid}`, {
                        method: 'PUT', // Assuming you are using PUT to update attendance
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ attendance: true }), // Update attendance to true
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('Attendance confirmed:', result);
                        alert('Attendance confirmed for ' + scannedData.value.name);
                    } else {
                        console.error('Failed to confirm attendance:', response.statusText);
                        alert('Failed to confirm attendance. Please try again.');
                    }
                } catch (error) {
                    console.error('Error confirming attendance:', error);
                    alert('An error occurred while confirming attendance.');
                }
            } else {
                alert('No valid student data scanned.');
            }
        };

        return {
            scannedData,
            isScanning,
            startScanning,
            stopScanning,
            confirmAttendance
        };
    },
    mounted() {
        this.startScanning();
    },
    beforeDestroy() {
        this.stopScanning();
    }
};
</script>

<style scoped>
.qr-scanner {
    text-align: center;
    margin: 20px;
}

#reader {
    width: 300px;
    height: 300px;
    border: 1px solid #ccc;
    margin: auto;
}

button {
    margin-top: 20px;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>