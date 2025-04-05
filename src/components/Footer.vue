<template>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <footer class="footer">
        <div class="container">
            <p>&copy; {{ currentYear }} Computer Science Society. All rights reserved.</p>
            <p>Join us for exciting events and activities!</p>
            <p>Contact us: <a href="mailto:info@cssociety.com">info@cssociety.com</a></p>
            <div class="social-icons">
                <a href="https://www.instagram.com/your_instagram_handle" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="https://wa.me/your_whatsapp_number" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-whatsapp"></i>
                </a>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { ref } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.footer {
    background-color: #cfdde5;
    padding: 20px;
    text-align: center;
    position: relative;
    bottom: 0;
    width: 100%;
}

.social-icons {
    margin-top: 10px;
}

.social-icons a {
    margin: 0 10px;
    color: #333;
    /* Change this to your desired icon color */
    font-size: 24px;
    /* Adjust size as needed */
    text-decoration: none;
}

.social-icons a:hover {
    color: #007bff;
    /* Change this to your desired hover color */
}
</style>
