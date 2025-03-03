<template>
    <Header />
    <div style="height: 80px;"></div>
    <div class="membership-card">
        <h1>Membership Card</h1>
        <div>
            <qrcode-vue :value="qrData" :size="200" />
        </div>
        <div class="details">
            <p><strong>Name:</strong> {{ member.name }}</p>
            <p><strong>Student ID:</strong> {{ member.studentid }}</p>
            <p><strong>Email:</strong> {{ member.email }}</p>
            <p><strong>Gender:</strong> {{ member.gender }}</p>
        </div>
        <button @click="downloadApplePass">Add to Apple Wallet</button>
        <button @click="downloadGooglePass">Add to Google Pay</button>
    </div>
    <Footer />
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { jwtDecode } from "jwt-decode";
import QRCode from 'qrcode.vue';

export default {
    components: {
        QRCode,
        Header,
        Footer,
    },
    setup() {
        const student = ref({});
        const member = ref({}); // Use ref for member to ensure reactivity

        const getinfo = async () => {
            if (localStorage.getItem('token')) {
                const token = localStorage.getItem('token');
                const decoded = jwtDecode(token);
                student.value = decoded.user;

                // Update member based on student data
                member.value = {
                    name: student.value.english_name,
                    studentid: student.value.student_id, // Changed to student_id
                    email: student.value.email,
                    gender: student.value.gender,
                };
            }
        };

        const qrData = computed(() => JSON.stringify(member.value)); // Use computed to derive qrData

        const downloadApplePass = async () => {
            const passData = {
                formatVersion: 1,
                passTypeIdentifier: "pass.com.yourclub",
                serialNumber: "N/A", // Removed membershipId
                teamIdentifier: "YOUR_TEAM_ID", // Replace with your team ID
                backgroundColor: "rgb(255, 255, 255)",
                labelColor: "rgb(0, 0, 0)",
                logoText: "Your Club Name",
                description: "Membership Card",
                organizationName: "Your Organization",
                barcode: {
                    format: "PKBarcodeFormatQR",
                    message: qrData.value, // Use .value to access computed property
                    messageEncoding: "iso-8859-1"
                },
                generic: {
                    primaryFields: [
                        {
                            key: "memberName",
                            label: "Name",
                            value: member.value.name
                        }
                    ],
                    secondaryFields: [
                        {
                            key: "studentId",
                            label: "Student ID",
                            value: member.value.studentid // Use studentid
                        }
                    ]
                }
            };

            // Convert the pass data to a JSON string
            const passJSON = JSON.stringify(passData);

            // Create a Blob from the JSON string
            const blob = new Blob([passJSON], { type: 'application/json' });

            // Create a link element
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'membership-pass.pkpass'; // Change to .pkpass for Apple Wallet

            // Append to the body
            document.body.appendChild(link);
            link.click(); // Simulate click to trigger download

            // Clean up
            document.body.removeChild(link);
        };

        const downloadGooglePass = async () => {
            const googlePassData = {
                id: `membership-${member.value.studentid}`, // Use studentid instead of membershipId
                classId: "YOUR_CLASS_ID", // Replace with your Google Pay class ID
                state: "active",
                version: "1.0",
                barcode: {
                    type: "qrCode",
                    value: qrData.value // Use .value to access computed property
                },
                info: {
                    title: "Membership Card",
                    description: `Student ID: ${member.value.studentid}`, // Use studentid
                },
            };

            // Convert the pass data to a JSON string
            const passJSON = JSON.stringify(googlePassData);

            // Create a Blob from the JSON string
            const blob = new Blob([passJSON], { type: 'application/json' });

            // Create a link element
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'membership-pass.json'; // Change to .json for Google Pay

            // Append to the body
            document.body.appendChild(link);
            link.click(); // Simulate click to trigger download

            // Clean up
            document.body.removeChild(link);
        };

        // Call getinfo when the component mounts
        onMounted(getinfo);

        return {
            member,
            qrData,
            downloadApplePass,
            downloadGooglePass,
        };
    }
};
</script>

<style scoped>
.membership-card {
    text-align: center;
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 10px;
    width: 300px;
    margin: auto;
}

.details {
    margin-top: 20px;
}

button {
    margin-top: 10px;
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
