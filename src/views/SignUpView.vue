<script setup>
import { ref } from 'vue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';  //useRoute
import '@/assets/css/signin.css';

const router = useRouter();

let registrationData = ref({
    english_name: '',
    student_id: '',
    email: '',
    password: '',
    gender: ''
});

let errorMessage = ref(''); 



const register = async () => {
    // Implement registration logic here
    console.log('Registration submitted:', registrationData.value);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData.value)
        });

        if (!response.ok) {
            throw new Error('Error submitting syllabus');
        }

        const data = await response.json();
        console.log(data);

        router.push('/signin');
    } catch (error) {
        console.error('Error submitting syllabus:', error);

        alert('Error submitting syllabus. Please try again.');
    }
}
</script>

<template>
    <main>

        <form @submit.prevent="register">

            <div class="wrapper">
                <div class="return-btn">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                    </link>
                    <a href="/signin"><i class='bx bx-arrow-back'></i></a>
                </div>

                <h1>Register</h1>

                <div class="labelGroup">
                    Name(in English)
                    <div class="typeboxsignup">
                        <input type="name" placeholder="e.g Chan Tai Man" v-model="registrationData.english_name">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bxs-user'></i>
                    </div>
                </div>
                <div class="labelGroup">
                    Student ID
                    <div class="typeboxsignup">
                        <input type="name" placeholder="e.g 20113900" v-model="registrationData.student_id">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bxs-id-card'></i>
                    </div>
                </div>

                <div class="labelGroup">
                    Email
                    <div class="typeboxsignup">
                        <input type="email" placeholder="abc@life.hkbu.edu.hk" v-model="registrationData.email">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bx-envelope'></i>
                    </div>
                   
                </div>
                <div class="labelGroup">
                    Password
                    <div class="typeboxsignup">
                        <input type="password" placeholder="Password" v-model="registrationData.password">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bxs-lock-alt'></i>
                    </div>
                </div>
                <div class="labelGroup">
                    Gender
                    <div class="typeboxsignup">
                        <select type="gender" v-model="registrationData.gender">
                            <option value="" disabled selected>Select your sex</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bx-male-sign'></i>
                    </div>
                </div>
                <!-- <div class="labelGroup">
                    Date of Birth
                    <div class="typeboxsignup">
                        <Datepicker v-model="registrationData.dob" :clearable="true" style="height:50px"/>
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bxs-calendar' ></i>
                    </div>
                </div> -->

                <div v-if="errorMessage" class="error-message" style="color: red;">
                    {{ errorMessage }}
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
                <div class="register-link">
                    <p>Already have an account? <a href="/signin">Sign in here</a></p>
                </div>
            </div>
        </form>
    </main>
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