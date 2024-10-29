<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/home.css';


let isAdmin = ref(false);
let isStudent = ref(false);


const checkrole = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        if (decoded.user.role === 'admin') {
            isAdmin.value = true;
        }
        if (decoded.user.role === 'student') {
            isStudent.value = true;
        }
    }
}

onMounted(() => {
    checkrole();
});

</script>
<template>
    <Header />
    <div class="aboutbg">
        <img src="/src/assets/student_club_group_photo.png" class="card-img-top">
        <h1 class="overlay-title">Gallery</h1>
    </div>
    <div class="grid-3x2">
        <div class="card" style="width: 18rem;">
            <img src="/src/assets/student_club1.png" class="card-img-top" alt="...">
            <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the
                    card's content.</p>
            </div>
        </div>
        <div class="card" style="width: 18rem;">
            <img src="/src/assets/student_club_group_photo.png" class="card-img-top" alt="...">
            <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the
                    card's content.</p>
            </div>
        </div>
        <div class="card" style="width: 18rem;">
            <img src="/src/assets/student_club1.png" class="card-img-top" alt="...">
            <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the
                    card's content.</p>
            </div>
        </div>
        <div class="card" style="width: 18rem;">
            <img src="/src/assets/student_club_group_photo.png" class="card-img-top" alt="...">
            <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the
                    card's content.</p>
            </div>
        </div>
        <div class="card" style="width: 18rem;">
            <img src="/src/assets/student_club2.png" class="card-img-top" alt="...">
            <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the
                    card's content.</p>
            </div>
        </div>
    </div>

</template>