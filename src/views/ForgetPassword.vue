<script setup>
import { ref } from 'vue';
import { reactive } from 'vue';
import '@/assets/css/signin.css';


const credentials = ref({
    email: '',
    password: ''
});

const login = async () => {

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials.value)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Error submitting login');
        }

        
        console.log(data);

        // Store token in local storage
        localStorage.setItem('token', data.token);

        // Redirect to home page
        window.location.href = '/event';
    } catch (error) {
        console.error('Error submitting login:', error);

        alert('Error submitting login. Please try again.');
    }
}
</script>

<template>
    <main>

        <form @submit.prevent="login">

            <div class="wrapper">
                <div class="return-btn">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                    </link>
                    <a href="/signin"><i class='bx bx-arrow-back'></i></a>
                </div>

                <h1>Forget Password</h1>

                <div class="typebox">
                    <input type="email" placeholder="abc@life.hkbu.edu.hk" v-model="credentials.email">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                    </link>
                    <i class='bx bx-envelope'></i>
                </div>
             
                
                <button type="submit" class="btn btn-primary">Send reset email</button>
                

            </div>
        </form>
    </main>
</template>
