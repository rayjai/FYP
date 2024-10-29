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
    <img src="/src/assets/student_club_about.png" class="card-img-top">
    <h1 class="overlay-title">About Us</h1>
  </div>
  <div class="about">
    <h1 style="margin-bottom: 40px;">Our Philosophy</h1>
    <p>Collaboration: Encouraging teamwork among students to tackle complex problems and share knowledge.<br>
      Innovation: Promoting creativity in software development, research, and practical applications of computer
      science.<br>
      Ethics: Addressing the moral implications of technology, including issues related to privacy, security, and the
      impact of AI on society.<br>
      Education: Providing resources, workshops, and mentorship to enhance learning and professional development.<br>
      Diversity and Inclusion: Striving to create an inclusive environment that welcomes diverse perspectives and
      backgrounds in tech.</p>
  </div>
  <div class="aboutlogo">
    <img src="/src/assets/水星.png" class="card-img-top">
<p>Our logo represent our .....</p>

  </div>

</template>