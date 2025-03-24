<template>
    <div>
      <section>
        <div class="product">
          <img src="https://i.imgur.com/EHyR2nP.png" alt="The cover of Stubborn Attachments" />
          <div class="description">
            <h3>Stubborn Attachments</h3>
            <h5>{{ price }}</h5>
          </div>
        </div>
        <form @submit.prevent="checkout">
          <button type="submit" id="checkout-button">Checkout</button>
        </form>
      </section>
    </div>
  </template>
  
  
  <script>
  export default {
    data() {
      return {
        price: "$20.00"
      };
    },
    methods: {
      checkout() {
        // Redirect to the checkout session
        fetch('/api/create-checkout-session', {
          method: 'POST'
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          // Handle successful checkout session creation
          window.location.href = data.url; // Redirect to the checkout URL
        })
        .catch(error => {
          console.error('There was a problem with the checkout:', error);
        });
      }
    }
  };
  </script>
  
  
  <style scoped>
  /* Add your styles here */
  </style>