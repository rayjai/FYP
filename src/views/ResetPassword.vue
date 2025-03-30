<script setup>
import { ref,onMounted } from 'vue';
import { reactive } from 'vue';
import { useRoute,useRouter } from 'vue-router';  //useRoute
import '@/assets/css/signin.css';

const router = useRouter();
const route = useRoute();


let newPassword = ref('');
let confirmPassword = ref('');
let errorMessage = ref('');

const resetPassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match.';
        return;
    }
    
    try {
        const response = await fetch(`/api/reset-password/${route.params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword.value })
        });

        if (!response.ok) {
            throw new Error('Error resetting password');
        }

        const data = await response.json();
        localStorage.setItem('toastrMessage', 'Password reset successful!');
        router.push('/signin');
    } catch (error) {
        console.error('Error resetting password:', error);
        errorMessage.value = 'Error resetting password. Please try again.';
    }
}

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

        <form @submit.prevent="resetPassword">
                <div class="wrapper">
                    <div class="return-btn">
                        <a href="/signin"><i class='bx bx-arrow-back'></i></a>
                    </div>

                    <h2 class="system-title">Student Club System</h2>
                    <h3>Reset Password</h3>

                    <div class="labelGroup">
                        New Password
                        <div class="typeboxsignup">
                            <input type="password" placeholder="Enter new password" v-model="newPassword">
                            <i class='bx bxs-lock-alt'></i>
                        </div>
                    </div>

                    <div class="labelGroup">
                        Confirm New Password
                        <div class="typeboxsignup">
                            <input type="password" placeholder="Confirm new password" v-model="confirmPassword">
                            <i class='bx bxs-lock-alt'></i>
                        </div>
                    </div>

                    <div v-if="errorMessage" class="error-message" style="color: red;">
                        {{ errorMessage }}
                    </div>

                    <button type="submit" class="btn btn-primary">Reset Password</button>
                    <div class="register-link">
                        <p>Remembered your password? <a href="/signin">Sign in here</a></p>
                    </div>
                </div>
            </form>
    </main>
    </div>
</template>
<script>
import Datepicker from 'vue3-datepicker';

export default {
    components: {
        Datepicker
    },

    methods: {
        login() {
            // Send login request and handle authentication token
            // Store token in local storage
        }
    }

};


</script>