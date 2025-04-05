<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import '@/assets/css/signin.css';

const router = useRouter();

let registrationData = ref({
    english_name: '',
    student_id: '',
    email: '',
    phoneNo: '',
    password: '',
    username: '',
    gender: '',
    role: 'student',
    icon: ''
});

let errorMessage = ref('');
let currentStep = ref('email');
let verificationCode = ref('');
let generatedCode = ref('');
let countdown = ref(0);
let emailVerified = ref(false);

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerification = async () => {
    if (!registrationData.value.email) {
        errorMessage.value = 'Please enter your email address';
        return;
    }

   

    try {
        const checkResponse = await fetch('/api/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: registrationData.value.email
            })
        });

        const checkData = await checkResponse.json();
        
        if (checkData.exists) {
            errorMessage.value = 'This email is already registered. Please sign in instead.';
            return;
        }

        generatedCode.value = generateVerificationCode();
        console.log('Verification code:', generatedCode.value);
        
        const response = await fetch('/api/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: registrationData.value.email,
                code: generatedCode.value
            })
        });

        if (!response.ok) throw new Error('Failed to send verification');

        currentStep.value = 'verify';
        errorMessage.value = '';
        
        countdown.value = 60;
        const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) clearInterval(timer);
        }, 1000);

    } catch (error) {
        console.error('Verification error:', error);
        errorMessage.value = 'Failed to send verification. Please try again.';
    }
};

const verifyCode = () => {
    if (verificationCode.value === generatedCode.value) {
        emailVerified.value = true;
        currentStep.value = 'complete';
        errorMessage.value = '';
    } else {
        errorMessage.value = 'Invalid verification code';
    }
};

const register = async () => {
    if (!emailVerified.value) {
        errorMessage.value = 'Please verify your email first';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData.value)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        router.push('/signin');
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.value = error.message || 'Registration failed. Please try again.';
    }
};

const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');

async function fetchHomeContent() {
    try {
        const response = await fetch('/api/club/detail/' + clubId.value);
        const data = await response.json();
        content.value = data;
    } catch (error) {
        console.error('Error fetching home events:', error);
    }
};

onMounted(() => {
    fetchHomeContent();
});
</script>

<template>
    <div :style="{ 
        backgroundImage: `url(http://localhost:3000/uploads/${content.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundRepeat: 'no-repeat', 
        display: 'flex', 
        height: '100vh', 
        width: '100vw',
        justifyContent: 'center', 
        alignItems: 'center' 
    }">
        <main>
            <div class="wrapper">
                <div class="return-btn">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                    <a href="/signin"><i class='bx bx-arrow-back'></i></a>
                </div>

                <h2 class="system-title">Student Club System</h2>
                
                <!-- Step 1: Email Input -->
                <div v-if="currentStep === 'email'">
                    <h3>Start Registration</h3>
                    <div class="labelGroup">
                        School Email
                        <div class="typeboxsignup">
                            <input 
                                type="email" 
                                placeholder="abc@life.hkbu.edu.hk" 
                                v-model="registrationData.email"
                                @keyup.enter="sendVerification"
                            >
                            <i class='bx bx-envelope'></i>
                        </div>
                        
                    </div>
                    
                    <div v-if="errorMessage" class="error-message">
                        {{ errorMessage }}
                    </div>
                    
                    <button 
                        type="button" 
                        @click="sendVerification" 
                        class="btn"
                    >
                        Send Verification Code
                    </button>
                    
                    <div class="register-link">
                        <p>Already have an account? <a href="/signin">Sign in here</a></p>
                    </div>
                </div>

                <!-- Step 2: Verification Code -->
                <div v-else-if="currentStep === 'verify'">
                    <h3>Verify Your Email</h3>
                    <div class="labelGroup">
                        Verification Code
                        <div class="typeboxsignup">
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit code" 
                                v-model="verificationCode"
                                @keyup.enter="verifyCode"
                            >
                            <i class='bx bx-check-shield'></i>
                        </div>
                        <p style="color: #fff; font-size: 14px; margin-top: 5px;">
                            We sent a code to {{ registrationData.email }}
                            <button 
                                type="button" 
                                @click="sendVerification" 
                                :disabled="countdown > 0"
                                style="
                                    background: none;
                                    border: none;
                                    color: #fff;
                                    text-decoration: underline;
                                    cursor: pointer;
                                    padding: 0;
                                    margin-left: 5px;
                                "
                            >
                                {{ countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code' }}
                            </button>
                        </p>
                    </div>
                    
                    <div v-if="errorMessage" class="error-message">
                        {{ errorMessage }}
                    </div>
                    
                    <button 
                        type="button" 
                        @click="verifyCode" 
                        class="btn"
                    >
                        Verify Email
                    </button>
                </div>

                <!-- Step 3: Complete Registration -->
                <form v-else @submit.prevent="register">
                    <h3>Complete Registration</h3>
                    
                    <div class="labelGroup">
                        School Email (Verified)
                        <div class="typeboxsignup">
                            <input 
                                type="email" 
                                :value="registrationData.email" 
                                disabled
                                style="color: #ccc;"
                            >
                            <i class='bx bx-check-circle' style="color: #4CAF50;"></i>
                        </div>
                    </div>

                    <div class="labelGroup">
                        Name(in English)
                        <div class="typeboxsignup">
                            <input 
                                type="name" 
                                placeholder="e.g Chan Tai Man" 
                                v-model="registrationData.english_name"
                                required
                            >
                            <i class='bx bxs-user'></i>
                        </div>
                    </div>
                    
                    <div class="labelGroup">
                        Student ID
                        <div class="typeboxsignup">
                            <input 
                                type="name" 
                                placeholder="e.g 20113900" 
                                v-model="registrationData.student_id"
                                required
                            >
                            <i class='bx bxs-id-card'></i>
                        </div>
                    </div>

                    <div class="labelGroup">
                        Phone Number
                        <div class="typeboxsignup">
                            <input 
                                type="tel" 
                                placeholder="12345678" 
                                v-model="registrationData.phoneNo"
                                required
                            >
                            <i class='bx bx-phone'></i>
                        </div>
                    </div>
                    
                    <div class="labelGroup">
                        Password
                        <div class="typeboxsignup">
                            <input 
                                type="password" 
                                placeholder="Password" 
                                v-model="registrationData.password"
                                required
                            >
                            <i class='bx bxs-lock-alt'></i>
                        </div>
                    </div>
                    
                    <div class="labelGroup">
                        User Name (Display Name)
                        <div class="typeboxsignup">
                            <input 
                                type="name" 
                                placeholder="e.g Bob" 
                                v-model="registrationData.username"
                                required
                            >
                            <i class='bx bxs-user'></i>
                        </div>
                    </div>
                    
                    <div class="labelGroup">
                        Gender
                        <div class="typeboxsignup">
                            <select 
                                v-model="registrationData.gender"
                                required
                            >
                                <option value="" disabled selected>Select your sex</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <i class='bx bx-male-sign'></i>
                        </div>
                    </div>

                    <div v-if="errorMessage" class="error-message">
                        {{ errorMessage }}
                    </div>
                    
                    <button type="submit" class="btn">Complete Registration</button>
                </form>
            </div>
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