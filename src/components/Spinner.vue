<template>
    <div class="spinner"></div>
  </template>
  
  <style scoped>
  .spinner {
    border: 8px solid rgba(255, 255, 255, 0.3);
    border-top: 8px solid #3498db; /* Change this color to match your theme */
    border-radius: 50%;
    width: 60px; /* Size of the spinner */
    height: 60px; /* Size of the spinner */
    animation: spin 1s linear infinite;
    margin: auto; /* Center the spinner */
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>