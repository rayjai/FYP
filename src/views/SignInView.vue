<script setup>
import { ref, onMounted } from 'vue';
import { reactive } from 'vue';
import '@/assets/css/signin.css';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 

const credentials = ref({
    email: '',
    password: ''
});

const errorMessage = ref(''); // Reactive property for error message
const isPasswordVisible = ref(false); // Track password visibility

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value; // Toggle the visibility
};


const login = async () => {
    errorMessage.value = ''; // Reset error message before login attempt

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials.value)
        });

        if (!response.ok) {
            const errorText = await response.text(); // Read response as text
            // Check for specific error message
            if (errorText === 'Unauthorized') {
                throw new Error('Incorrect Email/ Password'); // Change message for Unauthorized
            }
            if (errorText === 'Access denied') {
                throw new Error('Access denied. Please find commitee to help'); // Change message for Unauthorized
            }
            throw new Error(errorText || 'Error submitting login'); // Use the error text or default message
        }

        const data = await response.json();

        console.log(data);

        // Store token in local storage
        localStorage.setItem('token', data.token);

        // Redirect to home page
        window.location.href = '/event';
    } catch (error) {
        console.error('Error submitting login:', error);
        errorMessage.value = error.message; // Set the error message
    }
}
function displayToastrMessage() {
    const message = localStorage.getItem('toastrMessage');
    if (message) {
        toastr.success(message);
        localStorage.removeItem('toastrMessage'); // Clear the message after displaying
    }
}

// Call the function every second (1000 milliseconds)
setInterval(displayToastrMessage, 1000);

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
<form @submit.prevent="login">
            <div class="wrapper">
                <div class="return-btn">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
                    <a href="/home"><i class='bx bx-arrow-back'></i></a>
                </div>

                <h2 class="system-title">Student Club System</h2>
                <h3>Sign In</h3>

                <div class="typebox">
                    <input type="email" placeholder="abc@life.hkbu.edu.hk" v-model="credentials.email">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
                    <i class='bx bx-envelope'></i>
                </div>
                <div class="typebox">
                    <input 
                        :type="isPasswordVisible ? 'text' : 'password'" 
                        placeholder="Password" 
                        v-model="credentials.password">
                    <i class='bx bxs-lock-alt'></i>
                    <i 
                        class="bx" 
                        :class="isPasswordVisible ? 'bx-show' : 'bx-hide'" 
                        @click="togglePasswordVisibility" 
                        style="cursor: pointer; margin-right: 30px;"></i>
                                            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
                    <i class='bx bxs-lock-alt'></i>
                </div>

                <!-- Error message display -->
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

                <div class="register-link">
                    <p>If you forgot your password, please click <a href="/forget">here</a>.</p>
                </div>
                
                <button type="submit" class="btn btn-primary">Sign in</button>
                <div class="register-link">
                    <p>Don't have an account? <a href="/signup">Register here</a></p>
                </div>
            </div>
        </form>
    </main>
    </div>
</template>
