<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { onMounted, ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import Spinner from '@/components/Spinner.vue'; // Assuming you have a Spinner component for loading state
import ConfirmDialog from './ConfirmDialog.vue'; // Import the custom confirm dialog component
const router = useRouter();


const posts = ref([]);
const selectedPost = ref(null);
const student_id = ref(""); // Store the student ID
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(5); // Number of posts per page
let isAdmin = ref(false);
let isStudent = ref(false);
let isLoading = ref(false);

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

const fetchPosts = async (page) => {
    isLoading.value = true; // Set loading to true
    try {
        currentPage.value = page; // Update the current page
        const response = await fetch(`/api/posts?page=${page}&perPage=${perPage.value}`);
        const data = await response.json();
        
        // Check if the current user has liked each post
        posts.value = data.posts.map(post => ({
            ...post,
            currentImageIndex: 0, // Initialize the current image index
            isLiked: post.likes.some(like => like.studentId === student_id.value), // Check if the current user has liked the post
            commentsCount: post.commentsCount || 0
        })); // Update the posts list and initialize currentImageIndex
        
        totalPages.value = data.totalPages; // Update the total pages
    } catch (error) {
        console.error('Error fetching posts:', error);
    } finally {
        isLoading.value = false; // Set loading to false
    }
};



// Function to redirect to the post detail page
const redirectToPostDetail = (postId) => {
    console.log(`Redirecting to post detail with ID: ${postId}`); 
    window.location.href = `/postdetail/${postId}`; // Redirect to the API endpoint
};


const isConfirmDialogVisible = ref(false);
const selectedPostId = ref('');

const openConfirmDialog = (postId) => {
    selectedPostId.value = postId; // Set the selected post ID
    isConfirmDialogVisible.value = true; // Show the confirm dialog
};

const closeConfirmDialog = () => {
    isConfirmDialogVisible.value = false; // Hide the confirm dialog
};

const deletePost = async (postId) => {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            posts.value = posts.value.filter(post => post.id !== postId);
            location.reload();
        } else {
            const errorData = await response.json();
            console.error('Error deleting post:', errorData.message);
            alert('Failed to delete the post. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('An error occurred while deleting the post. Please try again.');
    } finally {
        closeConfirmDialog(); // Close the dialog after the operation
    }
};

// Computed property for pagination
const pages = computed(() => {
    let pagesArray = [];
    for (let i = 1; i <= totalPages.value; i++) {
        pagesArray.push(i);
    }
    return pagesArray;
});

// Fetch posts on component mount
onMounted(() => {
    checkrole();
    fetchPosts(currentPage.value);
});

// Function to handle image navigation
const nextImage = (post) => {
    if (post.currentImageIndex < 2) {
        post.currentImageIndex++;
    }
};

const prevImage = (post) => {
    if (post.currentImageIndex > 0) {
        post.currentImageIndex--;
    }
};

const formatCreatedAt = (createdAt) => {
    const now = new Date();
    const createdTime = new Date(createdAt);
    const diffInSeconds = Math.floor((now - createdTime) / 1000);
    
    let timeString = '';
    if (diffInSeconds < 60) {
        timeString = `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        timeString = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        timeString = `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    return `Created ${timeString}`;
};

const dropdownVisible = ref({}); // Track visibility of dropdowns

const toggleDropdown = (postId) => {
    console.log(`Toggling dropdown for post ID: ${postId}`);
    dropdownVisible.value[postId] = !dropdownVisible.value[postId]; // Toggle dropdown visibility
    console.log(dropdownVisible);
};

const editPost = (postId) => {
    // Implement your edit logic here, e.g., redirect to edit page
    console.log(`Editing post with ID: ${postId}`);
    window.location.href = `/editpost/${postId}`;
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

            // Update the local posts array with the updated post
            const index = posts.value.findIndex(post => post._id === postId);
            if (index !== -1) {
                // Update the post with the new like count
                posts.value[index].likesCount = result.likesCount; // Update the like count
                // Toggle the isLiked property
                posts.value[index].isLiked = !posts.value[index].isLiked; // Toggle the liked state
            }
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

const submitComment = async (postId) => {
    const postIndex = posts.value.findIndex(post => post._id === postId);
    if (postIndex !== -1 && posts.value[postIndex].comment) {
        try {
            const response = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: student_id.value,
                    comment: posts.value[postIndex].comment,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                // Update the post with the new comment
                posts.value[postIndex].comments.push({
                    studentId: student_id.value,
                    comment: posts.value[postIndex].comment,
                    createdAt: new Date() // You can also use the timestamp from the response if provided
                });
                posts.value[postIndex].commentsCount += 1; // Increment comment count
                posts.value[postIndex].comment = ''; // Clear the comment input
            } else {
                const errorData = await response.json();
                console.error('Error submitting comment:', errorData.message);
                alert('Failed to submit comment. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('An error occurred while submitting the comment. Please try again.');
        }
    } else {
        alert('Please enter a comment before submitting.');
    }
};
</script>

<template>
    <Header />
    <div style="height: 80px;"></div>

    <div class="forum-container">
        <div style="display: flex;">
            <h1>Forum</h1>
                <div style="margin-left: auto;">
                    <div v-if="isAdmin||isStudent">
                    <a :href="'/createpost/' + student_id" class="btn btn-primary">Create New Post</a>
                    </div>
                </div>
        </div>
        

        <div class="posts">
            <div v-if="isLoading">
                <Spinner />
            </div>
            <div v-else>
                <div v-if="posts.length === 0">
                    <p>No posts available.</p>
                </div>
                <div v-for="post in posts" :key="post._id" class="post">
                    <div class="user-info">
                        <img v-if="post.user.icon" :src="`http://localhost:3000/uploads/${post.user.icon}`" class="user-profile-picture" alt="User  Profile Picture" />
                        <img v-else src="/src/assets/user-circle.png" class="user-profile-picture" alt="Default Profile Picture" /> <!-- Default profile picture -->
                        <div class="user-name">
                            {{ post.user.english_name }}
                        </div>
                        <div class="dropdown">
                            <div v-if="isAdmin || (student_id === post.student_id)">

                            <button class="dropdown-button" @click="toggleDropdown(post._id)">&#x2022;&#x2022;&#x2022;</button>
                                <div v-if="dropdownVisible[post._id]" class="dropdown-menu">
                                <button @click="editPost(post._id)">Edit</button>
                                <button @click="openConfirmDialog(post._id)">Delete</button>
                                </div>                    
                            </div>
                        </div>
                    </div>
                    <p class="created-time">{{ formatCreatedAt(post.createdAt) }}</p>
                    <div class="post-content" @click="redirectToPostDetail(post._id)" @click.stop>
                        <h3>{{ post.title }}</h3>
                        <div class="photo-gallery">
                            <div v-if="post.eventPoster1 || post.eventPoster2 || post.eventPoster3">
                                <div class="image-container">
                                    <img v-if="post.eventPoster1 && post.currentImageIndex === 0" 
                                         :src="`http://localhost:3000/uploads/${post.eventPoster1}`" 
                                         class="gallery-image" 
                                         alt="Post Image 1" />
                                    <img v-if="post.eventPoster2 && post.currentImageIndex === 1" 
                                         :src="`http://localhost:3000/uploads/${post.eventPoster2}`" 
                                         class="gallery-image" 
                                         alt="Post Image 2" />
                                    <img v-if="post.eventPoster3 && post.currentImageIndex === 2" 
                                         :src="`http://localhost:3000/uploads/${post.eventPoster3}`" 
                                         class="gallery-image" 
                                         alt="Post Image 3" />
                                </div>
                                <div class="image-navigation">
                                    <button @click="prevImage(post)" :disabled="post.currentImageIndex === 0">Previous</button>
                                    <button @click="nextImage(post)" :disabled="post.currentImageIndex === 2">Next</button>
                                </div>
                            </div>
                            <div v-else>
                                <p>No photos uploaded for this post.</p>
                            </div>
                        </div>
                    </div>
                    <div class="post-footer">
                        <span class="comment-count" @click="redirectToPostDetail(post._id)" @click.stop>{{ post.commentsCount }} Comments</span>
                        <span class="like-count">{{ post.likesCount }} Likes</span>
                        <div v-if="isAdmin||isStudent">
                            <button class="like-button" @click="likePost(post._id, student_id)">
                                <span :class="{'liked': post.isLiked}">&#9829;</span> <!-- Heart icon -->
                            </button>
                        </div>
                    </div>
                    <div class="comment-section">
                    <input type="text" v-model="post.comment" placeholder="Type comments here" />
                    <button @click="submitComment(post._id)">Submit</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="pagination">
            <nav aria-label="Page navigation">
                <ul class="pagination justify-content-center">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <a class="page-link" @click="fetchPosts(currentPage - 1)">Previous</a>
                    </li>
                    <li class="page-item" v-for="index in pages" :key="index" :class="{ active: index === currentPage }">
                        <a class="page-link" @click="fetchPosts(index)">{{ index }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" @click="fetchPosts(currentPage + 1)">Next</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
    <ConfirmDialog 
        :isVisible="isConfirmDialogVisible" 
        title="Confirm Deletion" 
        message="Are you sure you want to delete this post?" 
        @confirm="deletePost(selectedPostId)" 
        @cancel="closeConfirmDialog" 
    />
    <Footer />
</template>

<style scoped>
.forum-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.posts,
.post-detail {
    margin-bottom: 20px;
}

.post {
    border: 1px solid #e0e0e0;
    padding: 10px;
    margin-bottom: 10px;
    cursor: pointer;
}

.post h3 {
    margin: 0;
}

.user-info {
    display: flex;
    align-items: center; /* Align items vertically centered */
    justify-content: space-between; /* Space between user info and dropdown */
    margin-bottom: 10px; /* Space between user info and post title */
}

.user-name {
    font-weight: bold; /* Optional: make the username bold */
    margin-right: auto; /* Push the dropdown to the right */
}

.user-profile-picture {
    width: 40px; /* Set a fixed width for the profile picture */
    height: 40px; /* Set a fixed height for the profile picture */
    border-radius: 50%; /* Make the image circular */
    margin-right: 10px; /* Space between the image and name */
}


.created-time {
    color: grey; /* Set the color to grey */
    font-size: 0.9em; /* Optional: adjust font size */
    margin-top: 5px; /* Optional: add some spacing */
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

button {
    margin-top: 10px;
}

.pagination {
    margin-top: 20px;
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
    display: flex; /* Use flexbox for alignment */
    align-items: center; /* Center items vertically */
    margin-top: 10px; /* Space above the comment section */
}

.comment-section input[type="text"] {
    flex: 1; /* Allow the input to take up available space */
    padding: 10px; /* Add some padding */
    border: 1px solid #ccc; /* Light grey border */
    border-radius: 20px; /* Rounded corners */
    outline: none; /* Remove outline on focus */
    transition: border-color 0.3s; /* Smooth transition for border color */
}

.comment-section input[type="text"]:focus {
    border-color: #007bff; /* Change border color on focus */
}

.comment-section button {
    padding: 10px 15px; /* Add padding for the button */
    margin-left: 10px; /* Space between input and button */
    border: none; /* Remove default border */
    border-radius: 20px; /* Rounded corners */
    background-color: #007bff; /* Button background color */
    color: white; /* Button text color */
    cursor: pointer; /* Pointer cursor on hover */
    transition: background-color 0.3s; /* Smooth transition for background color */
}

.comment-section button:hover {
    background-color: #0056b3; /* Darker shade on hover */
}
</style>