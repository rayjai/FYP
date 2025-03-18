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
    <main>
        <Header />
        <div style="height: 80px;"></div>

        <div v-if="isAdmin">
            <div class="contain">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Events</li>
                    </ol>
                </nav>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex">
                        <form class="d-flex me-2" @submit.prevent>
                            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"
                                v-model="searchQuery" />
                        </form>
                    </div>
                    <a href="/eventnew" class="btn btn-primary">New Event</a>
                </div>

            </div>
            <div v-if="isLoading">
                <Spinner />
            </div>
            <div v-else>

                <div class="grid-3x2">
                    <router-link v-for="event in filteredEvents" :key="event._id"
                        :to="{ path: `/event/detail/${event._id}` }" class="card-link">
                        <div class="card" style="width: 18rem;">
                            <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="card-img-top"
                                alt="...">
                            <div class="card-body">
                                <h5 class="card-title">{{ event.eventName }}</h5>
                                <p class="card-text">Date: <span v-if="event.eventDateFrom === event.eventDateTo">
                                        {{ event.eventDateFrom }}
                                    </span>
                                    <span v-else>
                                        {{ event.eventDateFrom }} - {{ event.eventDateTo }}
                                    </span>
                                </p>
                                <div class="button-container">
                                    <a :href="'/event/edit/' + event._id" class="btn btn-primary" @click.stop>
                                        Edit
                                    </a>
                                    <a :href="'/qrcodescan/' + event._id" class="btn btn-primary" @click.stop>
                                        Attendance
                                    </a>
                                    
                                    <!-- Delete Button -->
    <a @click.stop="confirmDelete(event._id)" class="btn btn-danger">
        Delete
    </a>
                                </div>
                                <div class="button-container">

                                <div v-if="new Date(event.eventDateFrom) > new Date()">
                                        <a :href="'/eventregister/' + event._id" class="btn btn-primary" @click.stop>
                                            Register
                                        </a>
                                    </div>
                                    </div>
                            </div>
                        </div>
                    </router-link>
                </div>

                <div class="container-fluid">
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" aria-current="page" :class="{ active: index == currentPage }"
                                v-for="index in pages" :key="index">
                                <a class="page-link" @click="fetchEvents(index)"> {{ index }}</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
        <div v-else-if="isStudent">
            <div class="contain">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Events</li>
                    </ol>
                </nav>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex">
                        <form class="d-flex me-2" @submit.prevent>
                            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"
                                v-model="searchQuery" />
                        </form>
                    </div>
                </div>
            </div>
            <div v-if="isLoading">
                <Spinner />
            </div>
            <div v-else>
                <div class="grid-3x2">
                    <router-link v-for="event in filteredEvents" :key="event._id"
                        :to="{ path: `/event/detail/${event._id}` }" class="card-link">
                        <div class="card" style="width: 18rem;">
                            <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="card-img-top"
                                alt="...">
                            <div class="card-body">
                                <h5 class="card-title">{{ event.eventName }}</h5>
                                <p class="card-text">Date: <span v-if="event.eventDateFrom === event.eventDateTo">
                                        {{ event.eventDateFrom }}
                                    </span>
                                    <span v-else>
                                        {{ event.eventDateFrom }} - {{ event.eventDateTo }}
                                    </span>
                                </p>
                                <div class="button-container">
                                    <div v-if="isEventRegistered(event._id)">
                                        <span class="registered">Already Registered</span>
                                    </div>
                                    <div v-else>
                                        <div v-if="new Date(event.eventDateFrom) > new Date()">
                                            <a :href="'/eventregister/' + event._id" class="btn btn-primary"
                                                @click.stop>
                                                Register
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="container-fluid">
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" aria-current="page" :class="{ active: index == currentPage }"
                                v-for="index in pages" :key="index">
                                <a class="page-link" @click="fetchEvents(index)"> {{ index }}</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="contain">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Events</li>
                    </ol>
                </nav>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex">
                        <form class="d-flex me-2" @submit.prevent>
                            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"
                                v-model="searchQuery" />
                        </form>
                    </div>
                </div>
            </div>
            <div v-if="isLoading">
                <Spinner />
            </div>
            <div v-else>
                <div class="grid-3x2">
                    <router-link v-for="event in filteredEvents" :key="event._id"
                        :to="{ path: `/event/detail/${event._id}` }" class="card-link">
                        <div class="card" style="width: 18rem;">
                            <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="card-img-top"
                                alt="...">
                            <div class="card-body">
                                <h5 class="card-title">{{ event.eventName }}</h5>
                                <p class="card-text">Date: <span v-if="event.eventDateFrom === event.eventDateTo">
                                        {{ event.eventDateFrom }}
                                    </span>
                                    <span v-else>
                                        {{ event.eventDateFrom }} - {{ event.eventDateTo }}
                                    </span>
                                </p>
                                <div class="button-container">
                                    <div v-if="new Date(event.eventDateFrom) > new Date()">
                                        <a :href="'/signin'" class="btn btn-primary" @click.stop>Register</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="container-fluid">
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" aria-current="page" :class="{ active: index == currentPage }"
                                v-for="index in pages" :key="index">
                                <a class="page-link" @click="fetchEvents(index)"> {{ index }}</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

        </div>


    </main>
</template>