<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/home.css';


let isAdmin = ref(false);
let isStudent = ref(false);

const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');


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
  checkrole();
  fetchHomeContent();
});

</script>

<template>
  <Header />
  <div style="height: 80px;"></div>

  <div class="aboutbg">
    <img :src="'http://localhost:3000/uploads/' + content.aboutImage" class="card-img-top" alt="About Us Image">
    <h1 class="overlay-title">About Us</h1>
  </div>
  <div class="about">
    <h1 style="margin-bottom: 40px;">Our Philosophy</h1>
    <p>{{ content.philosophy }}</p>
  </div>
  <div class="aboutlogo">
    <img :src="'http://localhost:3000/uploads/' + content.logoImage" class="card-img-top" alt="Logo Image">
    <p>{{ content.logomeaning }}</p>
  </div>
</template>