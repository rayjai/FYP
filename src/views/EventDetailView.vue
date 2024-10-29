<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import '@/assets/css/event.css'
import { useRoute } from 'vue-router';

const event = ref({});
const route = useRoute();

async function fetchEventDetails() {
    const eventId = route.params.id;
    try {
        const response = await fetch('/api/event/detail/'+ eventId
            , { method: 'GET' });
        if (!response.ok) throw new Error('Network response was not ok');
        event.value = await response.json();
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
};
onMounted(() => {

    fetchEventDetails()
})

</script>

<template>
    <Header />
    <div class="event-detail">
        <div class="return-btn">
                        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                        </link>
                        <a href="/event"><i class='bx bx-arrow-back'></i></a>
                    </div>
        <h1>{{ event.eventName }}</h1>
        <img :src="'http://localhost:3000/uploads/' + event.eventPoster" alt="Event Image" class="event-image" />
        <p><strong>Description:</strong> {{ event.eventDescription }}</p>
        <p><strong>Date:</strong> {{ event.eventDateFrom }}</p>
        <p><strong>Time:</strong> {{ event.eventTimeStart }} - {{ event.eventTimeEnd }}</p>
        <router-link to="/event" class="back-link">Back to Events</router-link>
    </div>
</template>



<style scoped>
.event-detail {
    padding: 20px;
}

.event-image {
    max-width: 100%;
    height: auto;
}

.back-link {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
}

.back-link:hover {
    background-color: #0056b3;
}
</style>
