<script setup>
import { onMounted, ref } from 'vue'
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

const toggleModal = () => {
  showModal.value = true; // Open modal
};

const closeModal = () => {
  showModal.value = false; // Close modal
};



onMounted(() => {
  loadAsyncData();
  checkrole();
});



</script>

<style scoped>
@import 'bootstrap/dist/css/bootstrap.min.css';
</style>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
  integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</link>
<template>
  <div v-if="isAdmin">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
              <a class="navbar-brand" href="/"><img src="/src/assets/desktop-regular.png"
                  style="height: 30px; width: 30px;"></a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/">Home</a>
                  </li>  
                  <li class="nav-item">
                    <a class="nav-link" href="/event">Events</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/forum">Forum</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/about">About</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/gallery">Gallery</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/dashboard">Management</a>
                  </li>  
                </ul>
                <div class="dropdown">
                  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                  </link>
                  <a class="btn btn-outline-success dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    {{ username }} <i class='bx bxs-user'></i>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-start" aria-labelledby="dropdownMenuLink">
                    <li><a class="dropdown-item" href="/profile">Profile</a></li>
                    <li><a class="dropdown-item" @click="logout">Logout</a></li>
                  </ul>
                </div>
                <a class="btn btn-outline-success" href="#" role="button" style="margin-left: 10px;"><i
                    class='bx bx-bell'></i></a>
              </div>
              <div v-if="showModal" class="notification-modal">
                <div class="notification-content">
                  <span class="close-button" @click="closeModal">&times;</span>
                  <h2 style="margin-bottom: 20px;">Notifications</h2>
                  <div class="notification-item">Richard Jones has purchased a blue t-shirt for $79.00</div>
                  <div class="notification-item">Your request for withdrawal of $2500.00 has been initiated.</div>
                  <div class="notification-item">Keyser Wick has purchased a black jacket for $59.00</div>
                  <div class="notification-item">Jane Davis has posted a new questions about your product.</div>
                  <div class="notification-item">Your revenue has increased by 25%.</div>
                  <div class="notification-item">12 users have added your products to their wishlist.</div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="isStudent">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
              <a class="navbar-brand" href="/"><img src="/src/assets/desktop-regular.png"
                  style="height: 30px; width: 30px;"></a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/">Home</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/dashboard">Dashboard</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/event">Events</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/forum">Forum</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/about">About</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/gallery">Gallery</a>
                  </li>
                </ul>
                <div class="dropdown">
                  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
                  </link>
                  <a class="btn btn-outline-success dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    {{ username }} <i class='bx bxs-user'></i>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-start" aria-labelledby="dropdownMenuLink">
                    <li><a class="dropdown-item" href="/profile">Profile</a></li>
                    <li><a class="dropdown-item" @click="logout">Logout</a></li>
                  </ul>
                </div>
                <a class="btn btn-outline-success" role="button" style="margin-left: 10px;" @click="toggleModal">
                  <i class='bx bx-bell'></i></a>

              </div>
              <div v-if="showModal" class="notification-modal">
                <div class="notification-content">
                  <span class="close-button" @click="closeModal">&times;</span>
                  <h2 style="margin-bottom: 20px;">Notifications</h2>
                  <div class="notification-item">Richard Jones has purchased a blue t-shirt for $79.00</div>
                  <div class="notification-item">Your request for withdrawal of $2500.00 has been initiated.</div>
                  <div class="notification-item">Keyser Wick has purchased a black jacket for $59.00</div>
                  <div class="notification-item">Jane Davis has posted a new questions about your product.</div>
                  <div class="notification-item">Your revenue has increased by 25%.</div>
                  <div class="notification-item">12 users have added your products to their wishlist.</div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
              <a class="navbar-brand" href="/"><img src="/src/assets/desktop-regular.png"
                  style="height: 30px; width: 30px;"></a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/">Home</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/event">Events</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/about">About</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/gallery">Gallery</a>
                  </li>
                </ul>
                <a class="btn btn-outline-success" type="button" href="/signin">Sign in / Sign up</a>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
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
</style>
