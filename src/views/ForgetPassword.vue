<script setup>
import { ref, onMounted } from 'vue';
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
const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');

async function fetchHomeContent() {
  try {
    const response = await fetch('/api/club/detail/'+ clubId.value);
    const data = await response.json();
    content.value = data;
  } catch (error) {
    console.error('Error fetching home events:', error);
  }
};
onMounted(() => {
    fetchHomeContent(); // Fetch the content when the component is mounted
});
</script>

<template>
    <div :style="{ backgroundImage: `url(http://localhost:3000/uploads/${content.backgroundImage})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', display: 'flex', height: '100vh', width: '100vw',justifyContent: 'center', alignItems: 'center' }">

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
    </div>
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
