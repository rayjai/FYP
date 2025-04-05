<script setup>
import Header from '@/components/Header.vue'
import Spinner from '@/components/Spinner.vue'
import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'
import axios from 'axios';
import { useRoute,useRouter } from 'vue-router';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 

const router = useRouter();


let isAdmin = ref(false);
let isStudent = ref(false);
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

const events = ref([]);
const currentPage = ref();
const totalPages = ref();
const perPage = ref(6);
let isLoading = ref(false);

async function fetchEvents(page) {
    isLoading.value = true; // Set loading to true
    try {
        currentPage.value = page;
        const response = await fetch(`/api/events?page=${page}&perPage=${perPage.value}`);
        const data = await response.json();
        events.value = data.events;
        totalPages.value = data.totalPages;
    } catch (error) {
        console.error('Error fetching events:', error);
    } finally {
        isLoading.value = false; // Set loading to false
    }
}

// Fetch registered events for the student
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

const pages = computed(() => {
    let pages = []

    for (let i = 1; i <= totalPages.value; i++) {
        pages.push(i)
    }
    return pages
})

onMounted(() => {
    checkrole();
    fetchEvents(1);
});

const searchQuery = ref(""); // Reactive variable for search input
const filteredEvents = computed(() => {
    if (!searchQuery.value) {
        return events.value; // Return all events if no search query
    }
    return events.value.filter(event =>
        event.eventName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});


const confirmDelete = (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
        deleteEvent(eventId);
    }
};

const deleteEvent = async (eventId) => {
    try {
        await axios.delete(`/api/event/${eventId}`); // Adjust the API endpoint as needed
        // Optionally, refresh the list or redirect after deletion
        router.push('/event'); // Redirect to the events page after deletion
    } catch (error) {
        console.error('Error deleting event:', error);
    }
};

const message = localStorage.getItem('toastrMessage');
if (message) {
    toastr.success(message);
    localStorage.removeItem('toastrMessage'); // Clear the message after displaying
}
</script>


<template>
    <main class="events-page">
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
      <Header />
      <div class="header-spacer"></div>
  
      <div class="page-container">
        <!-- Search and Action Bar -->
        <div class="action-bar">
          <div class="search-container">
            <div class="search-icon">
              <i class='bx bx-search'></i>
            </div>
            <input 
              type="search" 
              placeholder="Search events..." 
              v-model="searchQuery"
              class="search-input"
            >
          </div>
          
          <a v-if="isAdmin" href="/eventnew" class="new-event-btn" title="Create new event">
            <i class='bx bx-plus'></i> New Event
          </a>
        </div>
  
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <Spinner />
          <p>Loading events...</p>
        </div>
  
        <!-- Empty State -->
        <div v-else-if="filteredEvents.length === 0" class="empty-state">
          <i class='bx bx-calendar-event'></i>
          <h3>No events found</h3>
          <p v-if="searchQuery">Try adjusting your search query</p>
          <p v-else>There are currently no events scheduled</p>
          <a v-if="isAdmin" href="/eventnew" class="btn-primary">
            <i class='bx bx-plus'></i> Create Event
          </a>
        </div>
  
        <!-- Events Grid -->
        <div v-else class="events-grid">
          <div 
            v-for="event in filteredEvents" 
            :key="event._id" 
            class="event-card"
          >
            <router-link :to="`/event/detail/${event._id}`" class="event-link">
              <div class="event-image-container">
                <img 
                  :src="'http://localhost:3000/uploads/' + event.eventPoster" 
                  class="event-image"
                  :alt="event.eventName"
                >
                <div class="event-date-badge">
                  {{ formatEventDate(event.eventDateFrom, event.eventDateTo) }}
                </div>
              </div>
              
              <div class="event-content">
                <h3 class="event-title">{{ event.eventName }}</h3>
                
                <div class="event-actions">
                  <!-- Admin Actions -->
                  <div v-if="isAdmin" class="admin-actions">
                    <a 
                      :href="'/event/edit/' + event._id" 
                      class="btn-icon" 
                      @click.stop
                      title="Edit event"
                    >
                      <i class='bx bx-edit'></i>
                    </a>
                    <a 
                      :href="'/qrcodescan/' + event._id" 
                      class="btn-icon" 
                      @click.stop
                      title="Scan attendance"
                    >
                      <i class='bx bx-qr-scan'></i>
                    </a>
                    <button 
                      @click.stop="confirmDelete(event._id)" 
                      class="btn-icon danger"
                      title="Delete event"
                    >
                      <i class='bx bx-trash'></i>
                    </button>
                    <a 
                      v-if="new Date(event.deadline) > new Date()"
                      :href="'/eventregister/' + event._id" 
                      class="btn-icon"
                      @click.stop
                      title="Register for event"
                    >
                      <i class='bx bx-user-plus'></i>
                    </a>
                  </div>
                  
                  <!-- Student Actions -->
                  <div v-if="isStudent" class="student-actions">
                    <div v-if="isEventRegistered(event._id)" class="registered-badge">
                      <i class='bx bx-check-circle'></i> Registered
                    </div>
                    <a 
                      v-else-if="new Date(event.deadline) > new Date()"
                      :href="'/eventregister/' + event._id" 
                      class="btn-icon"
                      @click.stop
                      title="Register for event"
                    >
                      <i class='bx bx-user-plus'></i>
                    </a>
                  </div>
                  
                  <!-- Guest Actions -->
                  <div v-if="!isAdmin && !isStudent" class="guest-actions">
                    <router-link 
    v-if="new Date(event.deadline) > new Date()"
    to="/signin" 
    class="btn-icon"
    @click.stop
    title="Sign in to register"
  >
    <i class='bx bx-user-plus'></i>
  </router-link>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
  
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <nav class="pagination">
            <button 
              v-for="page in pages" 
              :key="page"
              @click="fetchEvents(page)"
              :class="{ active: page === currentPage }"
              class="page-btn"
              :title="`Go to page ${page}`"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </div>
    </main>
  </template>

<style scoped>
/* Base Styles */
.events-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-spacer {
  height: 80px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #4a6fa5;
  box-shadow: 0 0 0 3px rgba(74, 111, 165, 0.2);
}

.new-event-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #4a6fa5;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.new-event-btn:hover {
  background-color: #3a5a8f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 20px;
}

.loading-state p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.empty-state i {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
  position: relative;
  z-index: 0;
}

.event-card {
  background-color: white;
  border-radius: 10px;
  overflow: visible !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.event-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-card:hover .event-image {
  transform: scale(1.05);
}

.event-date-badge {
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

.event-content {
  padding: 20px;
}

.event-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

/* Buttons */
.btn-primary {
  display: inline-block;
  background-color: #4a6fa5;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #3a5a8f;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #4a6fa5;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-icon:hover {
  background-color: #e0e5eb;
}

.btn-icon.danger {
  color: #dc3545;
}

.btn-icon.danger:hover {
  background-color: #f8d7da;
}
/* Tooltip container (the button) */
.btn-icon[title] {
  position: relative;
  display: inline-flex;
}

/* Tooltip text */
.btn-icon[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 8px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Tooltip arrow */
.btn-icon[title]:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% - 5px);
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #333;
  z-index: 1001;
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Show tooltip on hover */
.btn-icon[title]:hover::after,
.btn-icon[title]:hover::before {
  opacity: 1;
}

/* Badges */
.registered-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #28a745;
  font-weight: 500;
}

/* Pagination */
.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  gap: 8px;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: white;
  border: 1px solid #e0e0e0;
  color: #4a6fa5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover {
  background-color: #f0f2f5;
}

.page-btn.active {
  background-color: #4a6fa5;
  color: white;
  border-color: #4a6fa5;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: 100%;
  }
}

@media (max-width: 576px) {
  .event-image-container {
    height: 180px;
  }
  
  .event-title {
    font-size: 1.2rem;
  }
  
  .page-container {
    padding: 20px 15px;
  }
}
/* [Previous styles remain the same, just add these additions] */

/* Button Spacing */
.admin-actions,
.student-actions,
.guest-actions {
  display: flex;
  gap: 10px; /* Added gap between buttons */
  flex-wrap: wrap;
}

/* Tooltip Styles */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 1000 ;
  margin-bottom: 5px;
  min-width: max-content;
  pointer-events: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-family: inherit;
  font-weight: normal;
}

[title]:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% - 5px);
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #333;
  z-index: 1001 ;
}

/* Responsive Adjustments */
@media (max-width: 576px) {
  .admin-actions,
  .student-actions,
  .guest-actions {
    gap: 8px;
  }
  
  .btn-primary {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}

.btn-icon i {
  font-size: 1.2rem;
}

/* Registered Badge */
.registered-badge i {
  margin-right: 5px;
}



.event-link {
  text-decoration: none !important;
}

.event-link:hover {
  text-decoration: none !important;
}

.btn-icon {
  text-decoration: none !important;
}

a {
  text-decoration: none !important;
}

a:hover {
  text-decoration: none !important;
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

<script>
export default {
  methods: {
    formatEventDate(startDate, endDate) {
      if (startDate === endDate) {
        return new Date(startDate).toLocaleDateString();
      }
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
  }
};
</script>