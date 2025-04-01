<script setup>
import { ref,onMounted } from 'vue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';  //useRoute
import '@/assets/css/signin.css';

const router = useRouter();

let registrationData = ref({
    english_name: '',
    student_id: '',
    email: '',
    phoneNo:'',
    password: '',
    username:'',
    gender: '',
    role:'student',
    icon:''
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

        <form @submit.prevent="register">

            <div class="wrapper">
                <div class="return-btn">
                    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                    </link>
                    <a href="/signin"><i class='bx bx-arrow-back'></i></a>
                </div>

                <h2 class="system-title">Student Club System</h2>
                <h3>Register</h3>

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
                    Phone Number
                    <div class="typeboxsignup">
                        <input type="phonenumber" placeholder="12345678" v-model="registrationData.phoneNo">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bx-phone'></i>
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
                    User Name (Display Name)
                    <div class="typeboxsignup">
                        <input type="name" placeholder="e.g Bob" v-model="registrationData.username">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <i class='bx bxs-user'></i>
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