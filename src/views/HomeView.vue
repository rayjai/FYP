<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/home.css';

const events = ref([]);
const upcomingevents = ref([]);
const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');

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

async function fetchHomeEvents() {
  try {
    const response = await fetch('/api/homeevent');
    const data = await response.json();
    events.value = data.events;
    console.log('Home Events:', events.value);
  } catch (error) {
    console.error('Error fetching home events:', error);
  }
};

async function fetchUpcomingEvents() {
  try {
    const response = await fetch('/api/upcomingevents');
    const data = await response.json();
    upcomingevents.value = data.upcomingEvents
    console.log('Upcoming Events:', upcomingevents.value);
    // Do something with the data, e.g., update a reactive variable
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
  }
}
async function fetchHomeContent() {
  try {
    const response = await fetch('/api/club/detail/' + clubId.value);
    const data = await response.json();
    content.value = data;
    console.log('Home Events:', content.value);
  } catch (error) {
    console.error('Error fetching home events:', error);
  }
};


onMounted(() => {
  checkrole();
  fetchHomeEvents();
  fetchUpcomingEvents();
  fetchHomeContent();
});



</script>

<template>
  <main>
    <Header />
    <div style="height: 80px;"></div>
    <div id="carouselExampleDark" class="carousel carousel-dark slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" class="active"
          aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="2" aria-label="Slide 3"></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active" data-bs-interval="10000">
          <img :src="'http://localhost:3000/uploads/' + content.eventPoster1" class="d-block w-100" alt="Event Image 1">
        </div>
        <div class="carousel-item" data-bs-interval="10000">
          <img :src="'http://localhost:3000/uploads/' + content.eventPoster2" class="d-block w-100" alt="Event Image 2">

        </div>
        <div class="carousel-item" data-bs-interval="10000">
          <img :src="'http://localhost:3000/uploads/' + content.eventPoster3" class="d-block w-100" alt="Event Image 3">

        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    <div id="description" class="description">
      <p>{{ content.description }}</p>
      <p>Welcome to join us!</p>
    </div>
    <div>
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h2>Upcoming Events</h2>
          </div>
        </div>
        <div v-if="upcomingevents.length<=0" class="row">
          <div class="col-12">
            <p>There is no upcoming events..</p>
          </div>
        </div>
        <div v-if="isStudent">
          <div class="row">
            <div class="col-4" v-for="(event, index) in upcomingevents" :key="index">
              <div class="card" style="width: 18rem;">
                <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="card-img-top" alt="Event Image">
                <div class="card-body">
                  <h5 class="card-title">{{ event.eventName }}</h5>
                  <p class="card-text">{{ event.eventDescription }}</p>
                  <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="isAdmin">
          <div class="row">
            <div class="col-4" v-for="(event, index) in upcomingevents" :key="index">
              <div class="card" style="width: 18rem;">
                <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="card-img-top" alt="Event Image">
                <div class="card-body">
                  <h5 class="card-title">{{ event.eventName }}</h5>
                  <p class="card-text">{{ event.eventDescription }}</p>
                  <a :href="'/event/edit/' + event._id" class="btn btn-primary" @click.stop style="margin-right: 10px;">
                    Edit
                  </a>
                  <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>Register</a>

                </div>
              </div>
            </div>

          </div>
        </div>
        <div v-else>
          <div class="row">
            <div class="col-4" v-for="(event, index) in upcomingevents" :key="index">
              <div class="card" style="width: 18rem;">
                <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="card-img-top" alt="Event Image">
                <div class="card-body">
                  <h5 class="card-title">{{ event.eventName }}</h5>
                  <p class="card-text">{{ event.eventDescription }}</p>
                  <a href="/signin" class="btn btn-primary">Register</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </main>
</template>
