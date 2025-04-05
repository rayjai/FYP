<script setup>
import { onMounted, ref ,nextTick} from 'vue'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { jwtDecode } from 'jwt-decode'

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
  const modal = document.querySelector('.notification-modal');
  showModal.value = !showModal.value;
  nextTick(() => {
    modal.classList.toggle('show', showModal.value);
  });
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
<link href="/path/to/toastr.min.css" rel="stylesheet"> 
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
          <a class="head-custom-btn dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
   data-bs-toggle="dropdown" aria-expanded="false">
   {{ username }} <i class='bx bxs-user'></i>
</a>

          <ul class="dropdown-menu custom-dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li><a class="dropdown-item" href="/profile">Profile</a></li>
            <li><a class="dropdown-item" @click="logout">Logout</a></li>
          </ul>
          <a class="head-custom-btn" href="#" role="button" style="margin-left: 10px;" @click="toggleModal">
            <i class='bx bx-bell'></i>
          </a>
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
        <a class="navbar-brand me-auto" href="/"><img :src="'http://localhost:3000/uploads/' + content.webIcon"
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
          <a class="head-custom-btn dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
   data-bs-toggle="dropdown" aria-expanded="false">
   {{ username }} <i class='bx bxs-user'></i>
</a>

          <ul class="dropdown-menu custom-dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li><a class="dropdown-item" href="/profile">Profile</a></li>
            <li><a class="dropdown-item" href="/membershipcard">Membership Card</a></li>
            <li><a class="dropdown-item" href="/studenteventrecord">Registration History</a></li>
            <li><a class="dropdown-item" @click="logout">Logout</a></li>
          </ul>
          <a class="head-custom-btn" href="#" role="button" style="margin-left: 10px;" @click="toggleModal">
            <i class='bx bx-bell'></i>
          </a>
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
        <a class="navbar-brand me-auto" href="/"><img :src="'http://localhost:3000/uploads/' + content.webIcon"
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
        <a class="head-custom-btn" type="button" href="/signin">Sign in / Sign up</a>
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

.custom-padding-left {
  padding-left: 6rem !important;/* Set padding-left to 6rem */
}

.custom-dropdown-menu {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 200px;
  margin-top: 8px;
  left: auto !important;
  right: 0 !important;
  max-width: 300px !important; /* Set a maximum width */
  width: auto !important; /* Allow it to shrink for shorter content */
  white-space: normal !important; /* Enable text wrapping */
}

.dropdown-item {
  color: #666777;
  padding: 8px 16px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  white-space: normal !important; /* Allow text to wrap */
  overflow-wrap: break-word !important; /* Alternative for word-wrap */
  min-width: 150px !important;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #000;
}

.dropdown-divider {
  border-color: #e0e0e0;
  margin: 4px 0;
}

/* Notification Panel */
.notification-modal {
  position: fixed;
  right: 0;
  top: 80px;
  width: 350px;
  height: calc(100vh - 80px);
  background-color: #ffffff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  display: flex;
  flex-direction: column;
}

.notification-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.notification-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

/* Notification Dialog */
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
  z-index: 1100;
}

.dialog-content {
  background: white;
  padding: 25px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.close-button {
  color: #888;
  font-size: 1.5rem;
  font-weight: 300;
  transition: color 0.2s ease;
  line-height: 1;
  cursor: pointer;
  float: right;
}

.close-button:hover {
  color: #333;
}
  
  .navbar{
    background-color: #cfdde5;
    height: 80px;
  }
  .nav-link{
    color:#666777;
    font-weight: 500;
  position: relative;
  }
  .nav-link:hover, .nav-link.active{
color:#000;
  }
  .navbar-toggler{
    margin-left: 10px !important;
  }
  @media (min-width:991px){
    .nav-link::before{
      content:"";
      position:absolute;
      bottom: 0;
      left:50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background-color: #697c88;
      visibility: hidden;
      transition: 0.3s ease-in-out;
    }

    .nav-link:hover::before, .nav-link.active::before{
      width:100%;
      visibility: visible;
    }
  }


 /* Custom button styles - fixes blue/underline issues */
.head-custom-btn {
    background-color: transparent !important;
    color: #666777 !important;
    border: none !important;
    padding: 8px 12px !important;
    border-radius: 5px !important;
    transition: all 0.3s ease !important;
    text-decoration: none !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    cursor: pointer !important;
}

/* Remove any lingering link styles */
a.head-custom-btn, 
a.head-custom-btn:hover, 
a.head-custom-btn:focus, 
a.head-custom-btn:active {
    text-decoration: none !important;
    color: #666777 !important;
}

/* Hover state */
.head-custom-btn:hover {
    color: #000 !important;
    background-color: rgba(0, 0, 0, 0.05) !important;
}

/* Icon styles */
.head-custom-btn .bx,
.head-custom-btn i {
    color: inherit !important;
    text-decoration: none !important;
    font-size: 1.2rem !important;
}

/* Dropdown toggle specific fixes */
.dropdown-toggle.custom-btn {
    box-shadow: none !important;
    outline: none !important;
}

/* Remove Bootstrap's default blue focus outline */
.head-custom-btn:focus {
    outline: none !important;
    box-shadow: none !important;
}

/* Force remove any visited state coloring */
a.head-custom-btn:visited {
    color: #666777 !important;
}

/* Remove default dropdown toggle styling */
.dropdown-toggle::after {
    display: none !important;
}

/* Style for the dropdown menu */
.dropdown-menu {
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
    color: #666777;
    padding: 8px 16px;
}

.dropdown-item:hover {
    color: #000;
    background-color: #f8f9fa;
}
.dropdown-item i {
    font-size: 1rem !important;
    width: 20px !important;
    text-align: center !important;
}

/* Add this to your main App.vue or a global CSS file */
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

/* Prevent quick disappearance */
#toast-container > .toast {
  min-width: 300px !important;
  opacity: 1 !important;
}

.btn-primary:hover {
  background-color: #a4a4a4;
}
</style>
