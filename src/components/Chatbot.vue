<template>
    <div class="chatbot-container">
      <div class="chatbot-header">
        <h3>AI Chatbot</h3>
      </div>
      <div class="chatbot-messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" :class="{'user-message': message.user, 'bot-message': !message.user}">
          {{ message.text }}
        </div>
        <div v-if="loading" class="loading">Typing...</div> <!-- Loading indicator -->
      </div>
      <div class="chatbot-input">
        <input type="text" v-model="userInput" @keyup.enter="sendMessage" placeholder="Type your message..."/>
        <button @click="sendMessage">Send</button>
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div> <!-- Error message -->
    </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      messages: [],
      userInput: '',
      loading: false, // Loading state
      errorMessage: '', // Error message state
    };
  },
  methods: {
    async sendMessage() {
      if (this.userInput.trim() === '') return; // Prevent sending empty messages

      const userMessage = { id: Date.now(), text: this.userInput, user: true };
      this.messages.push(userMessage); // Add user message to the chat
      this.loading = true; // Set loading state to true
      this.errorMessage = ''; // Clear any previous error message

      try {
        const response = await axios.post('/api/chat', {
          message: this.userInput,
        });

        const botMessage = { id: Date.now() + 1, text: response.data.reply || 'Sorry, I did not understand that.', user: false };
        this.messages.push(botMessage); // Add bot reply to the chat
      } catch (error) {
        console.error('Error communicating with chatbot API:', error);
        this.errorMessage = 'Failed to get a response from the AI. Please try again.'; // Set error message
      } finally {
        this.loading = false; // Reset loading state
        this.scrollToBottom(); // Scroll to the bottom of the messages
      }

      this.userInput = ''; // Clear input field
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        container.scrollTop = container.scrollHeight; // Scroll to the bottom
      });
    },
  },
};
</script>

<style>


.chatbot-header {
  background-color: #f1f1f1;
  padding: 5px;
  text-align: center;
}

.chatbot-messages {
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ddd;
  background-color: #ddd;
  height: 600px;
}

.user-message {
  text-align: right;
  color: blue;
}

.bot-message {
  text-align: left;
  color: green;
}

.loading {
  text-align: center;
  color: gray;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.chatbot-input {
  display: flex;
  padding-top: 30px;
}

.chatbot-input input {
  flex: 1;
  padding: 10px;
}

.chatbot-input button {
  padding: 5px 10px;
}

.chatbot-container {
    position: fixed;
    right: -500px; /* Adjust based on your chatbot width */
    transform: translateY(-50%);
    width: 500px; /* Set your desired width */
    transition: right 0.3s ease;
    z-index: 1000; /* Ensure it's above other content */
    background-color: #ddd;

}

.chatbot-container.active {
    right: 500px;
    bottom: 35cap;
}
</style>
