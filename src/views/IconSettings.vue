<template>
    <div>
        <h2>Others Settings</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label>Current Web Icon</label>
                <div v-if="settings.webIcon">
                    <img :src="'http://localhost:3000/uploads/' + settings.webIcon" alt="Current Web Icon" class="current-image" />
                </div>
            </div>
            <div class="form-group">
                <label for="webIcon">Upload Web Icon:</label>
                <input type="file" id="webIcon" accept=".png, .jpg,.jpeg" @change="event => handleFileChange(event, 'webIcon')" />
            </div>
            <div class="form-group">
                <label>Current Sign In/Sign Up Background Image</label>
                <div v-if="settings.backgroundImage">
                    <img :src="'http://localhost:3000/uploads/' + settings.backgroundImage" alt="Current Background Image" class="current-image" />
                </div>
            </div>
            <div class="form-group">
                <label for="backgroundImage">Upload Background Image:</label>
                <input type="file" id="backgroundImage" accept=".png, .jpg,.jpeg" @change="event => handleFileChange(event, 'backgroundImage')" />
            </div>
            <div class="form-group">
                <label for="fpsPaymentNumber">FPS Payment Number:</label>
                <input type="text" id="fpsPaymentNumber" v-model="settings.fpsPaymentNumber" placeholder="Enter FPS Payment Number" />
            </div>
            <button type="submit">Save</button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const settings = ref({
    webIcon: '',
    backgroundImage: '',
    fpsPaymentNumber: '' // Add the new field here
});

let webIconFile = ref(null);
let backgroundImageFile = ref(null);

const fetchClubInfo = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 
    try {
        const response = await axios.get(`/api/club/detail/${clubId}`);
        settings.value = response.data; // Assuming the API returns the club object
    } catch (error) {
        console.error('Error fetching club info:', error);
    }
};

const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (fileType === 'webIcon') {
        webIconFile.value = file;
    } else if (fileType === 'backgroundImage') {
        backgroundImageFile.value = file;
    }
};

const handleSubmit = async () => {
    const clubId = "6755de91eb5ae88eaeaf53e3"; 

    const formData = new FormData();
    
    // Append files if they exist
    if (webIconFile.value) formData.append('webIcon', webIconFile.value);
    if (backgroundImageFile.value) formData.append('backgroundImage', backgroundImageFile.value);
    
    // Append FPS payment number
    formData.append('fpsPaymentNumber', settings.value.fpsPaymentNumber);

    try {
        const response = await axios.put(`/api/editicon/${clubId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.status === 200) {
            localStorage.setItem('toastrMessage', 'Content updated successfully!');
            window.location.href = '/dashboard'; // Redirect after successful upload
        }
    } catch (error) {
        console.error('Error updating club info:', error);
    }
};

onMounted(() => {
    fetchClubInfo(); // Fetch settings when the component mounts
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

.form-group input {
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
