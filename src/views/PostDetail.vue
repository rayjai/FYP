<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import ConfirmDialog from './ConfirmDialog.vue'; // Import the custom confirm dialog component
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 



const route = useRoute();
const router = useRouter();

const post = ref({});
const currentImageIndex = ref(0);
const newComment = ref(''); // Reactive variable for the new comment
const student_id = ref(''); // Store the student ID

let isAdmin = ref(false);
let isStudent = ref(false);

// Function to check user role and get student ID
const checkrole = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        student_id.value = decoded.user.student_id;
        if (decoded.user.role === 'admin') {
            isAdmin.value = true;
        }
        if (decoded.user.role === 'student') {
            isStudent.value = true;
        }
    }
};
async function fetchPostDetails() {
    const eventId = route.params.id;
    try {
        const response = await fetch('/api/post/detail/' + eventId, { method: 'GET' });
        if (!response.ok) throw new Error('Network response was not ok');
        post.value = await response.json();
        for (const comment of post.value.comments) {
            const userResponse = await fetch(`/api/users/${comment.studentId}`); // Adjust the endpoint as necessary
            if (userResponse.ok) {
                console.log(userResponse);
                const userData = await userResponse.json();
                comment.userIcon = userData.icon; // Assuming the user data has an 'icon' field
            } else {
                comment.userIcon = '/user-circle.png'; // Default icon if user not found
            }
        }
        // Check if the current user has liked the post
        post.value.isLiked = post.value.likes.some(like => like.studentId === student_id.value);
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
}


// Navigation functions for images
const nextImage = () => {
    if (currentImageIndex.value < 2) {
        currentImageIndex.value++;
    }
};

const prevImage = () => {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
    }
};

// Function to submit a new comment
const submitComment = async (postId) => {
    if (!newComment.value) {
        alert('Please enter a comment before submitting.');
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: newComment.value, studentId: student_id.value }),
        });

        if (!response.ok) throw new Error('Failed to submit comment');
        
        // Optionally, you can fetch the updated post details here instead of refreshing the page
        // const updatedPost = await response.json();
        // post.value = updatedPost; // Update the post with the new comment

        // Clear the input field
        newComment.value = ''; 
        localStorage.setItem('toastrMessage', 'Success!');

        // Refresh the page to get the latest comments
        location.reload();
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
};

const likePost = async (postId, studentId) => {
    try {
        const response = await fetch(`/api/posts/${postId}/like/${studentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json(); // Get the updated likesCount from the response

            
                post.value.likesCount = result.likesCount; // Update the like count
                // Toggle the isLiked property
                post.value.isLiked = !post.value.isLiked; // Toggle the liked state
            
        } else {
            const errorData = await response.json();
            console.error('Error liking post:', errorData.message);
            alert('Failed to like the post. Please try again.');
        }
    } catch (error) {
        console.error('Error liking post:', error);
        alert('An error occurred while liking the post. Please try again.');
    }
};






const deleteComment = async (postId, commentId) => {
    try {
        const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
       
        if (response.ok) {
            // Remove the comment from the local state
            post.value.comments = post.value.comments.filter(comment => comment._id !== commentId);
            await fetchPostDetails(); // Fetch updated post details
        } else {
            const errorData = await response.json();
            console.error('Error deleting comment:', errorData.message);
            alert('Failed to delete the comment. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('An error occurred while deleting the comment. Please try again.');
    } 
};

const isEditDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const editCommentText = ref('');
const selectedCommentId = ref(''); // Store the ID of the comment being edited or deleted

const dropdownVisible = ref({}); // Track visibility of dropdowns for comments

const toggleCommentDropdown = (commentId) => {
    dropdownVisible.value[commentId] = !dropdownVisible.value[commentId]; // Toggle dropdown visibility for the specific comment

    // If the dropdown is opened, add a click event listener to the document
    if (dropdownVisible.value[commentId]) {
        document.addEventListener('click', (event) => handleClickOutside(event, commentId));
    } else {
        // If the dropdown is closed, remove the event listener
        document.removeEventListener('click', (event) => handleClickOutside(event, commentId));
    }
};

const handleClickOutside = (event, commentId) => {
    const dropdownMenu = document.querySelector(`.dropdown-menu[data-comment-id="${commentId}"]`);
    const dropdownButton = document.querySelector(`.dropdown-button[data-comment-id="${commentId}"]`);

    // Check if the click was outside the dropdown menu and the button
    if (dropdownMenu && !dropdownMenu.contains(event.target) && dropdownButton && !dropdownButton.contains(event.target)) {
        dropdownVisible.value[commentId] = false; // Close the dropdown
        document.removeEventListener('click', (event) => handleClickOutside(event, commentId)); // Clean up the event listener
    }
};

const openEditDialog = (comment) => {
    editCommentText.value = comment.comment; // Set the current comment text for editing
    selectedCommentId.value = comment._id; // Store the ID of the comment being edited
    isEditDialogVisible.value = true; // Show the edit dialog
};

const closeEditDialog = () => {
    isEditDialogVisible.value = false; // Hide the edit dialog
    editCommentText.value = ''; // Clear the edit text
};

const submitEdit = async () => {
    try {
        const response = await fetch(`/api/posts/${post.value._id}/comments/${selectedCommentId.value}`, {
            method: 'PUT', // Assuming you have a PUT endpoint for editing comments
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: editCommentText.value }),
        });

        if (!response.ok) throw new Error('Failed to edit comment');

        // Optionally, fetch the updated post details here instead of refreshing the page
        await fetchPostDetails(); // Call your existing function to fetch post details
        localStorage.setItem('toastrMessage', 'Comment Updated successfully!');

        closeEditDialog(); // Close the edit dialog
    } catch (error) {
        console.error('Error editing comment:', error);
    }
};

const openDeleteDialog = (commentId) => {
    selectedCommentId.value = commentId; // Store the ID of the comment being deleted
    isDeleteDialogVisible.value = true; // Show the delete confirmation dialog
};

const closeDeleteDialog = () => {
    isDeleteDialogVisible.value = false; // Hide the delete confirmation dialog
};

const confirmDelete = async () => {
    closeDeleteDialog();
    try {
        await deleteComment(post.value._id, selectedCommentId.value); // Call the delete function
        localStorage.setItem('toastrMessage', 'Comment deleted successfully!');
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
};

// Format the createdAt timestamp for display
const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleString(); // Format as needed
};
function displayToastrMessage() {
    const message = localStorage.getItem('toastrMessage');
    if (message) {
        toastr.success(message);
        localStorage.removeItem('toastrMessage'); // Clear the message after displaying
    }
}

// Call the function every second (1000 milliseconds)
setInterval(displayToastrMessage, 1000);
// Fetch post details when the component is mounted
onMounted(() => {
    checkrole();
    fetchPostDetails();
});
</script>
<template>
    <Header />
    <div style="height: 80px;"></div>
    <div class="post-detail-container">
      <h1>{{ post.title }}</h1>
      <p>{{ post.description }}</p>
      
      <!-- Photo Gallery (Conditional) -->
      <div class="photo-gallery">
        <div v-if="post.eventPoster1 || post.eventPoster2 || post.eventPoster3">
          <div class="image-container">
            <img v-if="post.eventPoster1 && currentImageIndex === 0" 
                 :src="`http://localhost:3000/uploads/${post.eventPoster1}`" 
                 class="gallery-image" 
                 alt="Post Image 1" />
            <img v-if="post.eventPoster2 && currentImageIndex === 1" 
                 :src="`http://localhost:3000/uploads/${post.eventPoster2}`" 
                 class="gallery-image" 
                 alt="Post Image 2" />
            <img v-if="post.eventPoster3 && currentImageIndex === 2" 
                 :src="`http://localhost:3000/uploads/${post.eventPoster3}`" 
                 class="gallery-image" 
                 alt="Post Image 3" />
          </div>
          <div class="image-navigation">
            <button @click="prevImage" :disabled="currentImageIndex === 0" class="btn-one">Previous</button>
            <button @click="nextImage" :disabled="currentImageIndex === 2" class="btn-one">Next</button>
          </div>
        </div>
        <div v-else>
          <p class="no-photos-message">No photos uploaded for this post.</p>
        </div>
      </div>
  
      <!-- Post Footer (Always Visible) -->
      <div class="post-footer">
        <span class="comment-count">{{ post.commentsCount }} Comments</span>
        <span class="like-count">{{ post.likesCount }} Likes</span>
        <div v-if="isAdmin || isStudent">
          <button class="like-button" @click="likePost(post._id, student_id)">
            <span :class="{'liked': post.isLiked}">&#9829;</span>
          </button>
        </div>
      </div>
  
      <!-- Comment Section (Always Visible) -->
      <div class="comment-section">
        <input type="text" v-model="newComment" placeholder="Type comments here" />
        <button @click="submitComment(post._id)">Submit</button>
      </div>
      
      <!-- Comments List (Always Visible) -->
      <div class="comments-list">
        <div v-for="comment in post.comments" :key="comment._id" class="comment-item">
          <img v-if="comment.userIcon" 
               :src="`http://localhost:3000/uploads/${comment.userIcon}`" 
               class="user-icon" 
               alt="User Icon" />
          <img v-else 
               :src="`http://localhost:3000/uploads/user-circle.png`" 
               class="user-icon" 
               alt="User Icon" />
          <div class="comment-dialog">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p class="comment-author"><strong>{{ comment.studentId }}:</strong></p>
              <div class="dropdown" style="margin-left: auto;">
                <div v-if="isAdmin || (student_id === comment.studentId)">
                  <button class="dropdown-button" @click="toggleCommentDropdown(comment._id)" data-comment-id="{{ comment._id }}">&#x2022;&#x2022;&#x2022;</button>
                  <div v-if="dropdownVisible[comment._id]" class="dropdown-menu" data-comment-id="{{ comment._id }}">
                    <button @click="openEditDialog(comment)">Edit</button>
                    <button @click="openDeleteDialog(comment._id)">Delete</button>
                  </div>                    
                </div>
              </div>
            </div>
            <p class="comment-text">{{ comment.comment }}</p>
            <p class="comment-timestamp">{{ formatCreatedAt(comment.createdAt) }}</p>
          </div>
        </div>
      </div>
  
      <!-- Edit Dialog -->
      <div v-if="isEditDialogVisible" class="dialog-backdrop" @click.self="closeEditDialog">
        <div class="edit-dialog">
          <div class="dialog-header">
            Edit Comment
          </div>
          <div class="dialog-body">
            <textarea 
              v-model="editCommentText" 
              class="dialog-textarea"
              placeholder="Edit your comment here...">
            </textarea>
          </div>
          <div class="dialog-footer">
            <button 
              class="dialog-button dialog-button-secondary"
              @click="closeEditDialog">
              Cancel
            </button>
            <button 
              class="dialog-button dialog-button-primary"
              @click="submitEdit">
              Save Changes
            </button>
          </div>
        </div>
      </div>
  
      <!-- Delete Dialog -->
      <div v-if="isDeleteDialogVisible" class="dialog-backdrop" @click.self="closeDeleteDialog">
        <div class="delete-dialog">
          <div class="dialog-header">
            Confirm Deletion
          </div>
          <div class="dialog-body">
            <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
          </div>
          <div class="dialog-footer">
            <button 
              class="dialog-button dialog-button-secondary"
              @click="closeDeleteDialog">
              Cancel
            </button>
            <button 
              class="dialog-button dialog-button-danger"
              @click="confirmDelete">
              Delete Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>



<style scoped>
.no-photos-message {
  padding: 1rem;
  text-align: center;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 1rem 0;
}
/* Base Styles */
.post-detail-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.post-detail-container h1 {
    color: #2b2d42;
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 700;
}

.post-detail-container p {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 2rem;
}

/* Photo Gallery */
.photo-gallery {
    margin: 2rem 0;
    border-radius: 12px;
    overflow: hidden;
}

.image-container {
    position: relative;
    background-color: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 16/9;
}

.gallery-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: white;
}

.image-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}

.image-navigation button {
    padding: 0.75rem 1.5rem;
    background-color: #4361ee;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.image-navigation button:hover {
    background-color: #3a0ca3;
    transform: translateY(-2px);
}

.image-navigation button:disabled {
    background-color: #e2e8f0;
    cursor: not-allowed;
    transform: none;
}

/* Post Footer */
.post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    margin: 1.5rem 0;
}

.post-footer span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4a5568;
    font-size: 1rem;
}

.like-button {
    background: none;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.like-button:hover {
    background-color: rgba(231, 76, 60, 0.1);
}

.like-button span {
    font-size: 1.5rem;
    color: #e2e8f0;
    transition: color 0.2s;
}

.like-button span.liked {
    color: #e74c3c;
}

/* Comment Section */
.comment-section {
    display: flex;
    gap: 0.75rem;
    margin: 1.5rem 0;
}

.comment-section input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
}

.comment-section input:focus {
    outline: none;
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.comment-section button {
    padding: 0.75rem 1.5rem;
    background-color: #4361ee;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.comment-section button:hover {
    background-color: #3a0ca3;
}

/* Comments List */
.comments-list {
    margin-top: 2rem;
}

.comment-item {
    display: flex;
    gap: 1rem;
    padding: 1.25rem 0;
    border-bottom: 1px solid #e2e8f0;
}

.user-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e2e8f0;
    flex-shrink: 0;
}

.comment-dialog {
    flex: 1;
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    position: relative;
}

.comment-dialog::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 20px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-right: 10px solid #f8f9fa;
    border-bottom: 10px solid transparent;
}

.comment-author {
    font-weight: 600;
    color: #2b2d42;
    margin: 0;
}

.comment-text {
    color: #4a5568;
    margin: 0.5rem 0;
    line-height: 1.5;
}

.comment-timestamp {
    color: #718096;
    font-size: 0.875rem;
    margin: 0;
}


/* Dropdown Menu Fix */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #718096;
  font-size: 1.25rem;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 1000; /* Increased z-index */
  overflow: hidden;
  display: block !important; /* Force display */
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  color: #2b2d42;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-menu button:hover {
  background-color: #f8f9fa;
}

/* Dialog Fixes */
.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-dialog, .delete-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: dialogFadeIn 0.3s ease-out;
}

.dialog-header {
  padding: 1.5rem;
  background: #4361ee;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.dialog-body {
  padding: 1.5rem;
}

.dialog-body p {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.dialog-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  margin-bottom: 1.5rem;
}

.dialog-textarea:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e2e8f0;
}

.dialog-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.dialog-button-primary {
  background-color: #4361ee;
  color: white;
  border: none;
}

.dialog-button-primary:hover {
  background-color: #3a0ca3;
}

.dialog-button-secondary {
  background-color: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.dialog-button-secondary:hover {
  background-color: #f8f9fa;
}

.dialog-button-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.dialog-button-danger:hover {
  background-color: #c0392b;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure dialogs are visible when active */
.edit-dialog[style*="display: none"],
.delete-dialog[style*="display: none"] {
  display: none !important;
}

.edit-dialog[style*="display: block"],
.delete-dialog[style*="display: block"] {
  display: block !important;
}


/* Responsive Design */
@media (max-width: 768px) {
    .post-detail-container {
        padding: 1.5rem;
    }
    
    .comment-item {
        flex-direction: column;
    }
    
    .comment-dialog::before {
        display: none;
    }
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.comment-item {
    animation: fadeIn 0.3s ease forwards;
}
</style>