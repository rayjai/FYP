<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import ConfirmDialog from './ConfirmDialog.vue'; // Import the custom confirm dialog component


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
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
};

// Format the createdAt timestamp for display
const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleString(); // Format as needed
};

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
                    <button @click="prevImage" :disabled="currentImageIndex === 0">Previous</button>
                    <button @click="nextImage" :disabled="currentImageIndex === 2">Next</button>
                </div>
                <div class="post-footer">
                    <span class="comment-count">{{ post.commentsCount }} Comments</span>
                    <span class="like-count">{{ post.likesCount }} Likes</span>
                    <div v-if="isAdmin || isStudent">
                        <button class="like-button" @click="likePost(post._id, student_id)">
                            <span :class="{'liked': post.isLiked}">&#9829;</span> <!-- Heart icon -->
                        </button>
                    </div>
                </div>
                <div class="comment-section">
                    <input type="text" v-model="newComment" placeholder="Type comments here" />
                    <button @click="submitComment(post._id)">Submit</button>
                </div>
                
                <div class="comments-list">
    <div v-for="comment in post.comments" :key="comment._id" class="comment-item">
        <img v-if="comment.userIcon" 
             :src="`http://localhost:3000/uploads/${comment.userIcon}`" 
             class="user-icon" 
             alt="User  Icon" />
             <img v-else 
             :src="`http://localhost:3000/uploads/user-circle.png`" 
             class="user-icon" 
             alt="User  Icon" />
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
<template v-if="isEditDialogVisible">
    <div class="edit-dialog">
        <h3>Edit Comment</h3>
        <textarea v-model="editCommentText" placeholder="Edit your comment here..."></textarea>
        <button @click="submitEdit">Submit</button>
        <button @click="closeEditDialog">Cancel</button>
    </div>
</template>

<!-- Delete Confirmation Dialog -->
<template v-if="isDeleteDialogVisible">
    <div class="delete-dialog">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this comment?</p>
        <button @click="confirmDelete">Yes, Delete</button>
        <button @click="closeDeleteDialog">Cancel</button>
    </div>
</template>
</div>
            <div v-else>
                <p>No photos uploaded for this post.</p>
            </div>
        </div>
    </div>
</template>



<style scoped>
.post-detail-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.photo-gallery {
    margin-top: 10px;
}

.image-container {
    position: relative;
}

.gallery-image {
    width: 100%; /* Make images responsive */
    border-radius: 5px; /* Optional: rounded corners */
}

.image-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}

.post-footer {
    display: flex;
    justify-content: space-between; /* Space between comment and like counts */
    margin-top: 10px; /* Space above the footer */
}

.comment-count, .like-count {
    color: grey; /* Set the color to grey */
    font-size: 0.9em; /* Optional: adjust font size */
}

.like-button {
    background: none; /* No background */
    border: none; /* No border */
    cursor: pointer; /* Pointer cursor */
    font-size: 40px; /* Size of the heart */
    color: grey; /* Default color */
}

.liked {
    color: red; /* Change color when liked */
}

.comment-section {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.comment-section input[type="text"] {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    outline: none;
}

.comment-section button {
    margin-left: 10px;
    padding: 10px 15px;
    border: none;
    border-radius: 20px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
}

.comments-list {
    margin-top: 10px;
}

.comment-item {
    display: flex; /* Use flexbox for alignment */
    align-items: flex-start; /* Align items to the start */
    margin-bottom: 10px; /* Space between comments */
}

.user-icon {
    width: 40px; /* Set a fixed width for the user icon */
    height: 40px; /* Set a fixed height for the user icon */
    border-radius: 50%; /* Make the icon circular */
    margin-right: 10px; /* Space between icon and comment */
}

.comment-dialog {
    background-color: #f1f1f1; /* Light grey background for the comment */
    border-radius: 10px; /* Rounded corners */
    padding: 10px; /* Padding inside the dialog */
    max-width: 80%; /* Limit the width of the comment dialog */
    position: relative; /* Position relative for pseudo-elements */
}

.comment-author {
    margin: 0; /* Remove default margin */
    font-weight: bold; /* Make the author's name bold */
}

.comment-text {
    margin: 5px 0; /* Space between the author and the comment text */
}

.comment-timestamp {
    margin: 0; /* Remove default margin */
    font-size: 0.8em; /* Smaller font size for the timestamp */
    color: gray; /* Gray color for the timestamp */
}

.comment-dialog:before {
    content: '';
    position: absolute;
    left: -10px; /* Position the triangle */
    top: 10px; /* Position the triangle */
    border-width: 10px; /* Size of the triangle */
    border-style: solid;
    border-color: transparent #f1f1f1 transparent transparent; /* Triangle color */
}

.dropdown {
    position: relative; /* Ensure the dropdown is positioned relative to its parent */
}

.dropdown-button {
    background: none; /* No background */
    border: none; /* No border */
    cursor: pointer; /* Pointer cursor */
    font-size: 20px; /* Size of the bullet points */
    margin-left: 10px;
}

.dropdown-menu {
    position: absolute; /* Position absolute to the dropdown */
    right: 0; /* Align to the right */
    background: white; /* Background color */
    border: 1px solid #ccc; /* Border */
    border-radius: 5px; /* Rounded corners */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Shadow */
    z-index: 1000; /* Ensure it appears above other elements */
    display: block; /* Ensure dropdown is displayed */
}

.dropdown-menu button {
    display: block; /* Block display for buttons */
    width: 100%; /* Full width */
    padding: 10px; /* Padding */
    border: none; /* No border */
    background: none; /* No background */
    text-align: left; /* Align text to the left */
}

.dropdown-menu button:hover {
    background: #f0f0f0; /* Highlight on hover */
}

.edit-dialog, .delete-dialog {
    position: fixed; /* Position it fixed to the viewport */
    top: 50%; /* Center vertically */
    left: 50%; /* Center horizontally */
    transform: translate(-50%, -50%); /* Adjust for centering */
    background: white; /* Background color */
    border: 1px solid #ccc; /* Border */
    border-radius: 5px; /* Rounded corners */
    padding: 20px; /* Padding */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* Shadow */
    z-index: 1000; /* Ensure it appears above other elements */
}

.edit-dialog h3, .delete-dialog h3 {
    margin: 0 0 10px; /* Margin for heading */
}

.edit-dialog textarea {
    width: 100%; /* Full width */
    height: 100px; /* Set height */
    margin-bottom: 10px; /* Space below textarea */
}

.edit-dialog button, .delete-dialog button {
    margin-right: 10px; /* Space between buttons */
}
</style>