<template>
    <div>
        <h2>About Page Content</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="philosophy">Philosophy</label>
                <textarea id="philosophy" v-model="club.philosophy" rows="4"></textarea>
            </div>
            <div class="form-group">
                <label for="logomeaning">Logo Meaning</label>
                <textarea id="logomeaning" v-model="club.logoMeaning" rows="4"></textarea>
            </div>
            <div class="form-group">
                <label>Current About Us Image</label>
                <div v-if="club.aboutImage">
                    <img :src="'http://localhost:3000/uploads/' + club.aboutImage" alt="Current About Us Image" class="current-image" />
                </div>
            </div>
            <div class="form-group">
                <label for="aboutImage">Update About Us Image:</label>
                <input type="file" id="aboutImage" accept=".png, .jpg" @change="event => handleFileChange(event, 'aboutImage')" />
            </div>
            <div class="form-group">
                <label>Current Logo Image</label>
                <div v-if="club.logoImage">
                    <img :src="'http://localhost:3000/uploads/' + club.logoImage" alt="Current Logo Image" class="current-image" />
                </div>
            </div>
            <div class="form-group">
                <label for="logoImage">Update Logo Image:</label>
                <input type="file" id="logoImage" accept=".png, .jpg" @change="event => handleFileChange(event, 'logoImage')" />
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
    logoMeaning: '',
    aboutImage: '',
    logoImage: ''
});

const route = useRoute();
let aboutImageFile = ref(null);
let logoImageFile = ref(null);

const fetchClubInfo = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    try {
        const response = await axios.get(`/api/club/detail/${clubId}`);
        club.value = response.data; // Assuming the API returns the club object
    } catch (error) {
        console.error('Error fetching club info:', error);
    }
};

const handleFileChange = (event, imageType) => {
    const file = event.target.files[0]; // Get the first file
    if (imageType === 'aboutImage') {
        aboutImageFile.value = file; // Store the file in the reactive reference
    } else if (imageType === 'logoImage') {
        logoImageFile.value = file;
    }
};

const handleSubmit = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    const formData = new FormData();

    formData.append('philosophy', club.value.philosophy);
    formData.append('logoMeaning', club.value.logoMeaning);

    // Append the files to the FormData if they exist
    if (aboutImageFile.value) formData.append('aboutImage', aboutImageFile.value);
    if (logoImageFile.value) formData.append('logoImage', logoImageFile.value);

    try {
        const response = await axios.put(`/api/editaboutus/${clubId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.status === 200) {
            localStorage.setItem('toastrMessage', 'Content update Successfully!');
            const message = localStorage.getItem('toastrMessage');
            window.location.href = '/dashboard'; // Redirect after successful upload
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
.form-group textarea {
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
.current-image {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
}
</style>
