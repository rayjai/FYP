<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { onMounted, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 

// Initialize with default values
const content = ref({
  aboutImage: '',
  philosophy: '',
  logoImage: '',
  logoMeaning: ''
});
const clubId = ref('6755de91eb5ae88eaeaf53e3');
const isLoading = ref(true);
const isAdmin = ref(false);
const isStudent = ref(false);

const checkrole = async () => {
  if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    isAdmin.value = decoded.user.role === 'admin';
    isStudent.value = decoded.user.role === 'student';
  }
};

async function fetchHomeContent() {
  try {
    const response = await fetch(`/api/club/detail/${clubId.value}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    content.value = { ...content.value, ...data };
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    isLoading.value = false;
  }
};

// Helper function to construct proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // Remove any leading slashes or backslashes
  const cleanedPath = imagePath.replace(/^[\\/]/, '');
  return `${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/uploads/${cleanedPath}`;
};

onMounted(() => {
  checkrole();
  fetchHomeContent();
});
</script>

<template>
  <Header />
  <div class="header-spacer"></div>

  <!-- Loading State -->
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading content...</p>
  </div>

  <!-- Content -->
  <div v-else class="about-page">
    <!-- Minimal Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">About Us</h1>
        <p class="hero-subtitle">Discover Our Story</p>
      </div>
    </section>

    <!-- About Image Section -->
    <section v-if="content.aboutImage" class="about-image-section">
      <div class="container">
        <img 
          :src="getImageUrl(content.aboutImage)" 
          class="about-image" 
          alt="About Us"
          @error="handleImageError"
        >
      </div>
    </section>

    <!-- Philosophy Section -->
    <section class="philosophy-section">
      <div class="container">
        <div class="philosophy-card">
          <h2 class="section-title">Our Philosophy</h2>
          <div class="divider"></div>
          <p class="philosophy-text">
            {{ content.philosophy || 'Our club philosophy will be added soon.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Logo Meaning Section -->
    <section class="logo-section">
      <div class="container">
        <div class="logo-card">
          <div v-if="content.logoImage" class="logo-image-container">
            <img 
              :src="getImageUrl(content.logoImage)" 
              class="logo-img" 
              alt="Club Logo"
              @error="handleImageError"
            >
          </div>
          <div class="logo-content">
            <h3 class="logo-title">Our Logo</h3>
            <p class="logo-meaning">
              {{ content.logoMeaning || 'The meaning behind our logo will be explained here.' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
/* Base Styles */
.about-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  line-height: 1.6;
}

.header-spacer {
  height: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Minimal Hero Section */
.hero-section {
  background: linear-gradient(135deg, #4a6fa5 0%, #2c3e50 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.9;
}

/* About Image Section */
.about-image-section {
  padding: 60px 0;
  background-color: #f8f9fa;
}

.about-image {
  width: 100%;
  max-height: 600px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.about-image:hover {
  transform: scale(1.02);
}

/* Philosophy Section */
.philosophy-section {
  padding: 80px 0;
  background-color: #fff;
}

.philosophy-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  position: relative;
}

.divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #4a6fa5, #2c3e50);
  margin: 0 auto 30px;
}

.philosophy-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #555;
}

/* Logo Section */
.logo-section {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.logo-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.logo-image-container {
  flex: 0 0 300px;
  padding: 40px;
  background-color: #4a6fa5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transition: transform 0.5s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-content {
  flex: 1;
  padding: 40px;
}

.logo-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.logo-meaning {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4a6fa5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 992px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.3rem;
  }
  
  .logo-card {
    flex-direction: column;
  }
  
  .logo-image-container {
    flex: 0 0 auto;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0;
  }
  
  .philosophy-card {
    padding: 30px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .philosophy-text, .logo-meaning {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .philosophy-card {
    padding: 20px;
  }
  
  .logo-image-container, .logo-content {
    padding: 20px;
  }
  
  .about-image {
    max-height: 300px;
  }
}
</style>