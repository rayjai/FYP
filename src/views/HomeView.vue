<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { onMounted, ref,computed } from "vue";
import { jwtDecode } from "jwt-decode";
import { useRoute,useRouter } from 'vue-router';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 



const events = ref([]);
const upcomingevents = ref([]);
const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');

let isAdmin = ref(false);
let isStudent = ref(false);
const router = useRouter();
const student_id = ref(""); // Store the student ID
const registeredEvents = ref(new Set());

const checkrole = async () => {
  if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    if (decoded.user.role === 'admin') {
      isAdmin.value = true;
    }
    if (decoded.user.role === 'student') {
      isStudent.value = true;
      student_id.value = decoded.user.student_id; // Assuming the student ID is in the token
      await fetchRegisteredEvents();

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
async function fetchRegisteredEvents() {
    try {
        const response = await fetch(`/api/registrations/` + student_id.value);
        const registrationData = await response.json();



        // Check if the response data is an array
        if (Array.isArray(registrationData)) {
            if (registrationData.length === 0) {
                console.warn('No registrations found for this student.');
            } else {
                // Iterate over the array and add event IDs to registeredEvents
                registrationData.forEach(event => {
                    if (event.event_id) { // Check if event_id exists
                        registeredEvents.value.add(event.event_id);
                        console.log(registeredEvents);
                    } else {
                        console.error('Event does not have an event_id:', event);
                    }
                });
            }
        } else {
            console.error('Unexpected response format: Expected an array but got:', registrationData);
        }
    } catch (error) {
        console.error('Error fetching registered events:', error);
    }
}
const isEventRegistered = (id) => {
    return registeredEvents.value.has(id);
};
const heroStyle = computed(() => {
  return {
    backgroundImage: content.backgroundImage 
      ? `linear-gradient(rgba(0, 0, 0, 0.5), url(http://localhost:3000/uploads/${content.backgroundImage})`
      : 'linear-gradient(135deg, #2c3e50 0%, #4a6fa5 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
});

function displayToastrMessage() {
    const message = localStorage.getItem('toastrMessage');
    if (message) {
        toastr.success(message);
        localStorage.removeItem('toastrMessage'); // Clear the message after displaying
    }
}

// Call the function every second (1000 milliseconds)
setInterval(displayToastrMessage, 1000);

onMounted(() => {
  checkrole();
  fetchHomeEvents();
  fetchUpcomingEvents();
  fetchHomeContent();
});



</script>


<template>
  <main class="home-page">
    <Header />
    <div class="header-spacer"></div>
    
    <!-- Hero Section -->
    <section class="hero-section" :style="heroStyle">
    <div class="hero-content">
      <h1>{{ content.clubName }}</h1>
      <p class="tagline">{{ content.tagLine }}</p>
      <router-link to="/about" class="hero-btn">About Us</router-link>
    </div>
  </section>

    <!-- Event Carousel -->
    <section class="carousel-section">
      <div id="eventCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button v-for="(_, index) in 3" :key="index" 
                  type="button" 
                  data-bs-target="#eventCarousel" 
                  :data-bs-slide-to="index" 
                  :class="{ active: index === 0 }"
                  :aria-label="'Slide ' + (index + 1)"></button>
        </div>
        <div class="carousel-inner">
          <div v-for="(img, index) in [content.eventPoster1, content.eventPoster2, content.eventPoster3]" 
               :key="index"
               class="carousel-item" 
               :class="{ active: index === 0 }">
            <img :src="'http://localhost:3000/uploads/' + img" class="d-block w-100" :alt="'Event Image ' + (index + 1)">
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#eventCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#eventCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </section>

    <!-- Club Description -->
    <section class="description-section">
      <div class="container">
        <div class="description-card">
          <p class="description-text">{{ content.description }}</p>
          <p class="welcome-text">Welcome to join us!</p>
        </div>
      </div>
    </section>

    <!-- Membership CTA -->
    <section class="membership-cta">
      <div class="container">
        <h2>Become a Member!</h2>
        <p>Join our club to participate in exciting events and activities!</p>
        <router-link to="/signup" class="cta-btn">Join Now</router-link>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="events-section">
      <div class="container">
        <h2 class="section-title">Upcoming Events</h2>
        
        <div v-if="upcomingevents.length <= 0" class="no-events">
          <p>There are no upcoming events at the moment.</p>
        </div>

        <div v-else class="events-grid">
          <div v-for="event in upcomingevents" :key="event._id" class="event-card">
            <router-link :to="{ path: `/event/detail/${event._id}` }" class="event-link">
              <div class="card-image">
                <img :src="'http://localhost:3000/uploads/' + event.eventPoster" :alt="event.eventName">
                <div class="event-date">
                  {{ new Date(event.eventDateFrom).toLocaleDateString() }}
                </div>
              </div>
              <div class="card-content">
                <h3>{{ event.eventName }}</h3>
                <p class="event-description">{{ event.eventDescription }}</p>
                
                <div class="event-actions">
                  <div v-if="isStudent && isEventRegistered(event._id)" class="registered-badge">
                    <i class='bx bx-check-circle'></i> Registered
                  </div>
                  <div v-else-if="isStudent && new Date(event.deadline) > new Date()" class="register-btn">
                    <a :href="'/eventregister/' + event._id" class="btn-primary" @click.stop>Register</a>
                  </div>
                  <div v-else-if="isAdmin" class="admin-actions">
                    <a :href="'/event/edit/' + event._id" class="btn-edit" @click.stop>Edit</a>
                    <a :href="'/eventregister/' + event._id" class="btn-primary" @click.stop>Register</a>
                  </div>
                  <div v-else-if="new Date(event.deadline) > new Date()" class="register-btn">
                    <a href="/signin" class="btn-primary">Register</a>
                  </div>
                  <div v-else class="registration-closed">
                    Registration Closed
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
</template>

<style scoped>
/* Base Styles */
.home-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  line-height: 1.6;
}

.header-spacer {
  height: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  color: white;
  padding: 100px 0;
  text-align: center;
  position: relative;
  min-height: 500px; /* Adjust as needed */
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}



.hero-section h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.tagline {
  font-size: 1.5rem;
  margin-bottom: 30px;
  font-weight: 300;
  opacity: 0.9;
}

.hero-btn {
  display: inline-block;
  background-color: #fff;
  color: #2c3e50;
  padding: 12px 30px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.hero-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background-color: #f8f9fa;
}

/* Carousel Section */
.carousel-section {
  padding: 50px 0;
  background-color: #f8f9fa;
}

.carousel {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.carousel-item img {
  height: 500px;
  object-fit: cover;
  width: 100%;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 8px;
}

/* Description Section */
.description-section {
  padding: 80px 0;
  background-color: #fff;
}

.description-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.description-text {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 30px;
  color: #555;
}

.welcome-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a6fa5;
}

/* Membership CTA */
.membership-cta {
  padding: 80px 0;
  background: linear-gradient(135deg, #4a6fa5 0%, #2c3e50 100%);
  color: white;
  text-align: center;
}

.membership-cta h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.membership-cta p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-btn {
  display: inline-block;
  background-color: #fff;
  color: #2c3e50;
  padding: 12px 30px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background-color: #f8f9fa;
}

/* Events Section */
.events-section {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 50px;
  color: #2c3e50;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background-color: #4a6fa5;
  margin: 15px auto 0;
}

.no-events {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.event-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.event-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-card:hover .card-image img {
  transform: scale(1.05);
}

.event-date {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background-color: rgba(74, 111, 165, 0.9);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.event-description {
  color: #666;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-primary {
  display: inline-block;
  background-color: #4a6fa5;
  color: white;
  padding: 8px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #3a5a8f;
  transform: translateY(-2px);
}

.btn-edit {
  display: inline-block;
  background-color: #6c757d;
  color: white;
  padding: 8px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.btn-edit:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.registered-badge {
  color: #28a745;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.registered-badge i {
  margin-right: 5px;
  font-size: 1.2rem;
}

.registration-closed {
  color: #dc3545;
  font-weight: 500;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .hero-section h1 {
    font-size: 2.8rem;
  }
  
  .tagline {
    font-size: 1.3rem;
  }
  
  .events-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 0;
  }
  
  .hero-section h1 {
    font-size: 2.2rem;
  }
  
  .tagline {
    font-size: 1.1rem;
  }
  
  .description-card {
    padding: 30px 20px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 60px 0;
  }
  
  .hero-section h1 {
    font-size: 1.8rem;
  }
  
  .hero-btn, .cta-btn {
    padding: 10px 25px;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .carousel-item img {
    height: 300px;
  }
}
/* Force Toastr colors */
.toast-success {
  background-color: #51a351 !important;
}
.toast-error {
  background-color: #bd362f !important;
}
.toast-info {
  background-color: #2f96b4 !important;
}
.toast-warning {
  background-color: #f89406 !important;
}
</style>