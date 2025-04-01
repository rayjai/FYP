<script setup>
import { onMounted, ref ,nextTick} from 'vue'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { jwtDecode } from 'jwt-decode'
import '@/assets/css/header.css'

const username = ref("");
let isAdmin = ref(false);
let isStudent = ref(false);
let showModal = ref(false);


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

const logout = function () {
  localStorage.removeItem('token');
  isAdmin.value = false
  isStudent.value = false
  location.assign("/")
}


const loadAsyncData = async () => {
  try {
    // Get the token from local storage    
    const token = localStorage.getItem('token');


    const decoded = jwtDecode(token);
    username.value = `${decoded.user.english_name} `;
  } catch (error) {
    console.log(error);
  }
};

const notifications = ref([]);

async function fetchNotifications() {
  try {
    const response = await fetch('/api/notifications'); // Adjust the endpoint as necessary
    const data = await response.json();
    notifications.value = data; // Assuming the response is an array of notifications
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}

const selectedNotification = ref(null);
const showNotificationDialog = ref(false);
const openNotificationDialog = (notification) => {
  selectedNotification.value = notification; // Set the selected notification
  showNotificationDialog.value = true; // Open the dialog
};

const closeNotificationDialog = () => {
  showNotificationDialog.value = false; // Close the dialog
  selectedNotification.value = null; // Clear selected notification
};


const toggleModal = () => {
  showModal.value = true; // Open modal
};

const closeModal = () => {
  showModal.value = false; // Close modal
};

const setActiveClass = () => {
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


const content = ref([]);
const clubId = ref('6755de91eb5ae88eaeaf53e3');

async function fetchHomeContent() {
  try {
    const response = await fetch('/api/club/detail/'+ clubId.value);
    const data = await response.json();
    content.value = data;
  } catch (error) {
    console.error('Error fetching home events:', error);
  }
};


onMounted(async () => {
  await loadAsyncData();
  await checkrole();
  await fetchHomeContent();
  await fetchNotifications(); // Fetch notifications
  await nextTick(); // Wait for the DOM to update
  setActiveClass();
});


</script>

<style scoped>
@import 'bootstrap/dist/css/bootstrap.min.css';
</style>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
  integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</link>
<template>
  <div v-if="isAdmin">
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand me-auto" href="/"><img :src="'http://localhost:3000/uploads/' + content.webIcon"
            style="height: 30px; width: 30px;"></a>
        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasNavbarLabel"><img src="/src/assets/desktop-regular.png"
                style="height: 30px; width: 30px;"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-center flex-grow-1 custom-padding-left">
              <li class="nav-item">
                <a class="nav-link mx-lg-2" aria-current="page" href="/home">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/event">Events</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/forum">Forum</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/about">About</a>
              </li>
              
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/dashboard">Management</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="dropdown">
          <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
          </link>
          <a class="btn btn-outline-success dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
            data-bs-toggle="dropdown" aria-expanded="false">
            {{ username }} <i class='bx bxs-user'></i>
          </a>
          <ul class="dropdown-menu custom-dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li><a class="dropdown-item" href="/profile">Profile</a></li>
            <li><a class="dropdown-item" @click="logout">Logout</a></li>
          </ul>
          <a class="btn btn-outline-success" href="#" role="button" style="margin-left: 10px;" @click="toggleModal"><i
            class='bx bx-bell'></i></a>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
      <div v-if="showModal" class="notification-modal">
  <div class="notification-content">
    <span class="close-button" @click="closeModal">&times;</span>
    <h2 style="margin-bottom: 20px;">Notifications</h2>
    <div v-for="(notification, index) in notifications" :key="index" class="notification-item" @click="openNotificationDialog(notification)">
      {{ notification.title }} <!-- Display the title -->
    </div>
  </div>
</div>
<div v-if="showNotificationDialog" class="notification-dialog">
  <div class="dialog-content">
    <span class="close-button" @click="closeNotificationDialog">&times;</span>
    <h2>{{ selectedNotification?.title }}</h2>
    <p>{{ selectedNotification?.message }}</p>
    <small style="color: grey;">{{ formatDate(selectedNotification?.createdAt) }}</small>
  </div>
</div>


    </nav>
  </div>
  <div v-else-if="isStudent">
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand me-auto" href="/"><img src="/src/assets/desktop-regular.png"
            style="height: 30px; width: 30px;"></a>
        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasNavbarLabel"><img src="/src/assets/desktop-regular.png"
                style="height: 30px; width: 30px;"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
            <ul id="navbar" class="navbar-nav justify-content-center flex-grow-1 custom-padding-left">
              <li class="nav-item">
                <a class="nav-link mx-lg-2" aria-current="page" href="/home">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/event">Events</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/forum">Forum</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/about">About</a>
              </li>
              
             
            </ul>
          </div>
        </div>
        <div class="dropdown">
          <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
          </link>
          <a class="btn btn-outline-success dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
            data-bs-toggle="dropdown" aria-expanded="false">
            {{ username }} <i class='bx bxs-user'></i>
          </a>
          <ul class="dropdown-menu custom-dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li><a class="dropdown-item" href="/profile">Profile</a></li>
            <li><a class="dropdown-item" href="/membershipcard">Membership Card</a></li>
            <li><a class="dropdown-item" href="/studenteventrecord">Registration History</a></li>
            <li><a class="dropdown-item" @click="logout">Logout</a></li>
          </ul>
          <a class="btn btn-outline-success" href="#" role="button" style="margin-left: 10px;" @click="toggleModal"><i
            class='bx bx-bell'></i></a>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
      <div v-if="showModal" class="notification-modal">
  <div class="notification-content">
    <span class="close-button" @click="closeModal">&times;</span>
    <h2 style="margin-bottom: 20px;">Notifications</h2>
    <div v-for="(notification, index) in notifications" :key="index" class="notification-item" @click="openNotificationDialog(notification)">
      {{ notification.title }} <!-- Display the title -->
    </div>
  </div>
</div>
<div v-if="showNotificationDialog" class="notification-dialog">
  <div class="dialog-content">
    <span class="close-button" @click="closeNotificationDialog">&times;</span>
    <h2>{{ selectedNotification?.title }}</h2>
    <p>{{ selectedNotification?.message }}</p>
    <small style="color: grey;">{{ formatDate(selectedNotification?.createdAt) }}</small>
  </div>
</div>

    </nav>
  </div>

  <div v-else>
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand me-auto" href="/"><img src="/src/assets/desktop-regular.png"
            style="height: 30px; width: 30px;"></a>
        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasNavbarLabel"><img src="/src/assets/desktop-regular.png"
                style="height: 30px; width: 30px;"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
            <ul id="navbar" class="navbar-nav justify-content-center flex-grow-1 custom-padding-left">
              <li class="nav-item">
                <a class="nav-link mx-lg-2" aria-current="page" href="/home">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/event">Events</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/about">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link mx-lg-2" href="/forum">Forum</a>
              </li>
            </ul>
          </div>
        </div>
        <a class="btn btn-outline-success" type="button" href="/signin">Sign in / Sign up</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  </div>


</template>

<script>
export default {
  setup() {
    head({
      title: 'My App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    })
  }
}


</script>
<style>
.dropdown-list {
  max-width: 100px;
  /* Adjust this value to your preference */
  width: 100px;
  white-space: nowrap;
  /* Prevent text wrapping */
}
.custom-padding-left {
  padding-left: 6rem !important;/* Set padding-left to 6rem */
}

.notification-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 500px;
  width: 90%;
}

.close-button {
  cursor: pointer;
  float: right;
  font-size: 20px;
}
.custom-dropdown-menu {
    left: 0 !important; /* Align to the left */
    right: auto !important; /* Disable right alignment */
    transform: translateY(0); /* Reset any positioning */
}



</style>
