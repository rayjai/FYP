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

       

       

        // Call getinfo when the component mounts
        onMounted(getinfo);

        return {
            member,
            qrData,
           
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
