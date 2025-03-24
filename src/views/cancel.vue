<template>
  <div class="container">
      <div class="content">
          <h1>Payment Not Completed</h1>
          <p>Your payment has not been completed. Please try again or contact support if you need assistance.</p>
          <button @click="returnToEventPage" class="return-button">Return to Event Page</button>
      </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Function to navigate back to the event page
const returnToEventPage = () => {
  router.push('/event'); // Adjust the path as necessary
};
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; /* Full viewport height */
    background-color: #f9f9f9; /* Light background color */
}

.content {
    text-align: center;
    background: white; /* White background for the content */
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

h1 {
    color: #dc3545; /* Red color for error message */
    margin-bottom: 20px;
}

p {
    margin-bottom: 30px;
    color: #333; /* Darker text for readability */
}

.return-button {
    padding: 12px 24px;
    background-color: #007bff; /* Bootstrap primary color */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.return-button:hover {
    background-color: #0056b3; /* Darker shade on hover */
}
</style>