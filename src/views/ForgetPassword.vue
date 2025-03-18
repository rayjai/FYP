<script setup>
import { ref } from 'vue';
import axios from 'axios'; // Make sure to install axios if you haven't already
import '@/assets/css/signin.css';

const credentials = ref({
    email: '',
});
const loading = ref(false); // Track loading state

const reset = async () => {
    loading.value = true; // Set loading to true when the request starts
    try {
        const response = await axios.post('/api/reset-password', {
            email: credentials.value.email,
        });
        // Handle success response
        if (response.status === 200) {
            alert('A reset email has been sent to your email address.');
            credentials.value.email = ''; // Clear the email input
        }
    } catch (error) {
        // Handle error response
        if (error.response && error.response.status === 404) {
            alert('Email not found. Please check and try again.');
        } else {
            alert('An error occurred. Please try again later.');
        }
    } finally {
        loading.value = false; // Set loading to false when the request ends
    }
};
</script>

<template>
    <main>
        <form @submit.prevent="reset">
            <div class="wrapper">
                <div class="return-btn">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
                    <a href="/signin"><i class='bx bx-arrow-back'></i></a>
                </div>

                <h1>Forget Password</h1>

                <div class="typebox">
                    <input type="email" placeholder="abc@life.hkbu.edu.hk" v-model="credentials.email" required>
                    <i class='bx bx-envelope'></i>
                </div>

                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading">Please wait...</span>
                    <span v-else>Send reset email</span>
                </button>

                <!-- Loading Spinner -->
                <div v-if="loading" class="spinner">
                    <div class="loading">Loading...</div>
                </div>
            </div>
        </form>
    </main>
</template>

<style scoped>
.spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px; /* Adjust as necessary */
}

.loading {
    font-size: 1.5em; /* Adjust as necessary */
    color: #007bff; /* Adjust color as necessary */
    /* You can add more styling for the spinner */
}
</style>
