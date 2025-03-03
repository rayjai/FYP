<template>
    <div>
        <h2>About Page content</h2>
        <form @submit.prevent="handleSubmit"> <!-- Bind the submit event -->
            <div class="form-group">
                <label for="philosophy">Philosophy</label>
                <input type="text" id="philosophy" v-model="club.philosophy" />
            </div>
            <div class="form-group">
                <label for="logomeaning">Logo Meaning</label>
                <input type="text" id="logomeaning" v-model="club.logomeaning" /> <!-- Fixed typo in v-model -->
            </div>
            <button type="submit">Save</button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const club = ref({
    philosophy: '',
    logomeaning: ''
});

const route = useRoute();

const fetchClubInfo = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    try {
        const response = await axios.get(`/api/club/detail/${clubId}`);
        club.value = response.data; // Assuming the API returns the club object
    } catch (error) {
        console.error('Error fetching club info:', error);
    }
};

const handleSubmit = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    try {
        const response = await axios.put(`/api/club/${clubId}`, {
            philosophy: club.value.philosophy,
            logoMeaning: club.value.logoMeaning
        });
        console.log(response.data);
        if (response.status === 200) {
            // Optionally redirect or show a success message
            window.location.href = '/dashboard'; // Redirect to dashboard or another page
        }
    } catch (error) {
        console.error('Error updating club info:', error);
    }
};

onMounted(() => {
    fetchClubInfo(); // Fetch the club information when the component mounts
});
</script>

<style>
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 10px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button[type="submit"] {
    background-color: #4CAF50;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>