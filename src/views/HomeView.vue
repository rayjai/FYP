<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/home.css';

const events = ref([]);
const upcomingevents = ref([]);
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



onMounted(() => {
  checkrole();
  fetchHomeEvents();
  fetchUpcomingEvents();
});



</script>

<template>
  <main>
    <Header />
    <div id="carouselExampleDark" class="carousel carousel-dark slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button v-for="(event, index) in events" :key="index" type="button" :data-bs-target="'#carouselExampleDark'"
          :data-bs-slide-to="index" :class="{ active: index === 0 }" aria-current="index === 0"
          :aria-label="'Slide ' + (index + 1)"></button>
      </div>
      <div class="carousel-inner">
        <div v-for="(event, index) in events" :key="event._id" class="carousel-item" :class="{ active: index === 0 }"
          :data-bs-interval="10000">
          <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="d-block w-100" alt="Event Image">
          <div class="carousel-caption d-none d-md-block">
            <h5>{{ event.eventName }}</h5>
            <p>{{ event.eventDescription }}</p>
          </div>
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
      <p>Computer Science Society aims to provide intertesting activities for computer science major studnets.</p>
      <p>Welcome to join us!</p>
    </div>
    <div>
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h1>Upcoming Events</h1>
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
        <div v-if="isAdmin">
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
        <div v-if="!isAdmin&!isStudent">
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
  </main>
</template>
