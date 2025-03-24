<template>
  <div class="container">
      <div class="content">
          <h1>Payment Successful!</h1>
          <p>Thank you for your payment. You are now registered for the event.</p>
          <button @click="returnToEventPage" class="return-button">Return to Event Page</button>
      </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(async () => {

  const uniqueKey = route.query.uniqueKey; // Get unique key from the route
  const existingKey = localStorage.getItem('registrationKey'); // Check local storage for existing key

  // If the unique key already exists in local storage, skip submission
  if (existingKey === uniqueKey) {
      console.log('Registration already processed. Skipping submission.');
      return;
  }

  const registrationData = {
      student_id: route.query.student_id,
      selectedSession: route.query.selectedSession,
      multipleSection: route.query.multipleSection,
      event_id: route.query.event_id,
      attendance: route.query.attendance,
      eventDateFrom: route.query.eventDateFrom,
      eventName: route.query.eventName,
      paymentMethod: 'online',
  };

  try {
      const response = await fetch('/api/eventregister', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
          throw new Error('Error submitting register');
      }

      const data = await response.json();
      localStorage.setItem('registrationKey', uniqueKey);
      } catch (error) {
      console.error('Error submitting register:', error);
      alert('Error registering for the event. Please try again.');
  }
});

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
    color: #28a745; /* Green color for success message */
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