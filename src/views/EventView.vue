<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'



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

const events = ref([]);
const currentPage = ref();
const totalPages = ref();
const perPage = ref(6);

async function fetchEvents(page) {
    try {
        currentPage.value = page;
        const response = await fetch(`/api/events?page=${page}&perPage=${perPage.value}`);
        const data = await response.json();
        events.value = data.events;
        totalPages.value = data.totalPages; // Assuming you send this from the backend
        console.log('Events:', events.value);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
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

</script>

<template>
    <main>
        <Header />
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
                        <form class="d-flex me-2">
                            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                            <button class="btn btn-outline-success" type="submit">Search</button>
                        </form>
                        <button class="btn btn-outline-info" type="button" @click="filterEvents">Filter</button>
                    </div>
                    <a href="/eventnew" class="btn btn-primary">New Event</a>
                </div>
            </div>

            <div class="grid-3x2">
                <router-link v-for="event in events" :key="event._id" :to="{ path: `/event/detail/${event._id}` }"
                    class="card-link">
                    <div class="card" style="width: 18rem;">
                        <img :src="'http://localhost:3000/uploads/' + event.eventPoster" class="card-img-top" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">{{ event.eventName }}</h5>
                            <p class="card-text">{{ event.eventDescription }}</p>
                            <a :href="isAdmin ? '/event/edit/' + event._id : '/eventregister'" class="btn btn-primary" @click.stop>
                                {{ isAdmin ? 'Edit' : 'Register' }}
                            </a>
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
        <div v-if="isStudent">
            <div class="container">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Events</li>
                    </ol>
                </nav>
                <div class="grid-3x2">
                    <div class="card" v-for="event in events" :key="event.id" style="width: 18rem;">
                        <img :src="event.eventPoster" class="card-img-top" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">{{ event.eventName }}</h5>
                            <p class="card-text">{{ event.eventDescription }}</p>
                            <a :href="'/eventregister'" class="btn btn-primary">Register</a>
                        </div>
                    </div>
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