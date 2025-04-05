<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { onMounted, ref, computed, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import Spinner from '@/components/Spinner.vue'; // Assuming you have a Spinner component for loading state
import ConfirmDialog from './ConfirmDialog.vue'; // Import the custom confirm dialog component
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 
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
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown')) {
    dropdownVisible.value = {};
  }
};

// Fetch posts on component mount
onMounted(() => {
  checkrole();
  fetchPosts(currentPage.value);
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
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

const message = localStorage.getItem('toastrMessage');
if (message) {
    toastr.success(message);
    localStorage.removeItem('toastrMessage'); // Clear the message after displaying
}
</script>


<template>
    <Header />
    <div class="header-spacer"></div>

    <div v-if="isAdmin||isStudent" class="forum-container">
        <div class="forum-header">
            <h1 class="forum-title">Community Forum</h1>
            <div class="create-post-btn">
                <a :href="'/createpost/' + student_id" class="btn-primary">
                    <i class="fas fa-plus"></i> Create New Post
                </a>
            </div>
        </div>
        
        <div class="posts-container">
            <div v-if="isLoading" class="loading-container">
                <Spinner />
            </div>
            <div v-else>
                <div v-if="posts.length === 0" class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <p>No posts available yet. Be the first to share!</p>
                </div>
                
                <div v-for="post in posts" :key="post._id" class="post-card">
                    <div class="post-header">
                        <div class="user-info">
                            <div class="avatar-container">
                                <img v-if="post.user.icon" :src="`http://localhost:3000/uploads/${post.user.icon}`" class="user-avatar" alt="Profile" />
                                <img v-else src="/src/assets/user-circle.png" class="user-avatar" alt="Profile" />
                            </div>
                            <div class="user-details">
                                <span class="user-name">{{ post.user.english_name }}</span>
                                <span class="post-time">{{ formatCreatedAt(post.createdAt) }}</span>
                            </div>
                        </div>
                        
                        <div class="post-actions" v-if="isAdmin || (student_id === post.student_id)">
                            <div class="dropdown">
  <button class="dropdown-toggle" @click.stop="toggleDropdown(post._id)">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <div v-if="dropdownVisible[post._id]" class="dropdown-menu" @click.stop>
    <button @click="editPost(post._id)" class="dropdown-item">
      <i class="fas fa-edit"></i> Edit
    </button>
    <button @click="openConfirmDialog(post._id)" class="dropdown-item">
      <i class="fas fa-trash"></i> Delete
    </button>
  </div>                    
</div>
                        </div>
                    </div>
                    
                    <div class="post-content" @click="redirectToPostDetail(post._id)">
                        <h3 class="post-title">{{ post.title }}</h3>
                        
                        <div class="media-gallery" v-if="post.eventPoster1 || post.eventPoster2 || post.eventPoster3">
                            <div class="gallery-container">
                                <img v-if="post.eventPoster1 && post.currentImageIndex === 0" 
                                     :src="`http://localhost:3000/uploads/${post.eventPoster1}`" 
                                     class="gallery-image" 
                                     alt="Post Image" />
                                <img v-if="post.eventPoster2 && post.currentImageIndex === 1" 
                                     :src="`http://localhost:3000/uploads/${post.eventPoster2}`" 
                                     class="gallery-image" 
                                     alt="Post Image" />
                                <img v-if="post.eventPoster3 && post.currentImageIndex === 2" 
                                     :src="`http://localhost:3000/uploads/${post.eventPoster3}`" 
                                     class="gallery-image" 
                                     alt="Post Image" />
                                
                                <div class="gallery-controls">
                                    <button @click.stop="prevImage(post)" 
                                            :disabled="post.currentImageIndex === 0" 
                                            class="gallery-nav prev">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button @click.stop="nextImage(post)" 
                                            :disabled="post.currentImageIndex === 2" 
                                            class="gallery-nav next">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-media">
                            <i class="fas fa-image"></i>
                            <span>No photos uploaded</span>
                        </div>
                    </div>
                    
                    <div class="post-footer">
                        <div class="engagement-stats">
                            <span class="comments" @click.stop="redirectToPostDetail(post._id)">
                                <i class="fas fa-comment"></i> {{ post.commentsCount }}
                            </span>
                            <span class="likes">
                                <i class="fas fa-heart"></i> {{ post.likesCount }}
                            </span>
                        </div>
                        
                        <button v-if="isAdmin||isStudent" 
                                @click.stop="likePost(post._id, student_id)"
                                class="like-btn"
                                :class="{'liked': post.isLiked}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    
                    <div class="comment-box">
    <input 
      type="text" 
      v-model="post.comment" 
      placeholder="Write a comment..." 
      @keyup.enter="submitComment(post._id)"
    />
    <button @click.stop="submitComment(post._id)" class="comment-submit">
      <i class="fas fa-paper-plane"></i>
    </button>
  </div>
                </div>
            </div>
        </div>

        <div class="pagination-container" v-if="totalPages > 1">
            <nav class="pagination-nav">
                <button @click="fetchPosts(currentPage - 1)" 
                        :disabled="currentPage === 1" 
                        class="page-nav">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <button v-for="index in pages" 
                        :key="index" 
                        @click="fetchPosts(index)"
                        :class="{'active': index === currentPage}"
                        class="page-number">
                    {{ index }}
                </button>
                
                <button @click="fetchPosts(currentPage + 1)" 
                        :disabled="currentPage === totalPages" 
                        class="page-nav">
                    <i class="fas fa-chevron-right"></i>
                </button>
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
/* Base Styles */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    background-color: #f9f9f9;
}

.header-spacer {
    height: 80px;
}

/* Forum Container */
.forum-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.forum-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
}

.forum-title {
    font-size: 2rem;
    color: #166088;
    margin: 0;
    font-weight: 600;
}

.create-post-btn {
    color: black;
    margin-left: auto;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #4a6fa5;
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn-primary:hover {
    background-color: #166088;
    transform: translateY(-2px);
}

/* Posts Container */
.posts-container {
    margin-bottom: 2rem;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #777;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #ddd;
}

.empty-state p {
    font-size: 1.1rem;
    margin: 0;
}

/* Post Card */
.post-card {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar-container {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid #e0e0e0;
}

.user-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    color: #333;
}

.post-time {
    font-size: 0.85rem;
    color: #777;
    margin-top: 0.2rem;
}

.post-actions {
    position: relative;
}

/* Dropdown Styles */
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: #777;
    font-size: 1.2rem;
    transition: color 0.2s;
}

.dropdown-toggle:hover {
    color: #4a6fa5;
}

.dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 120px;
    z-index: 1000;
    overflow: hidden;
    display: block !important;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    color: #333;
    cursor: pointer;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #f5f5f5;
}

.dropdown-item i {
    width: 20px;
    text-align: center;
}

/* Post Content */
.post-content {
    margin-bottom: 1.5rem;
    cursor: pointer;
}

.post-title {
    font-size: 1.4rem;
    margin: 0 0 1rem 0;
    color: #166088;
    line-height: 1.4;
}

.media-gallery {
    margin-top: 1rem;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}

.gallery-container {
    position: relative;
    padding-top: 56.25%; /* 16:9 aspect ratio */
    background: #f0f0f0;
}

.gallery-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: white;
}

.gallery-controls {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
}

.gallery-nav {
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.4);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.gallery-nav:hover {
    background: rgba(0, 0, 0, 0.6);
}

.gallery-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.no-media {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    color: #777;
}

.no-media i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #ddd;
}

/* Post Footer */
.post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
}

.engagement-stats {
    display: flex;
    gap: 1.5rem;
}

.engagement-stats span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #777;
    font-size: 0.95rem;
    cursor: pointer;
    transition: color 0.2s;
}

.engagement-stats span:hover {
    color: #4a6fa5;
}

.engagement-stats i {
    font-size: 1.1rem;
}

/* Like Button */
.like-btn {
    background: none;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #777;
    cursor: pointer;
    transition: all 0.2s;
}

.like-btn:hover {
    background: rgba(231, 76, 60, 0.1);
}

.like-btn i {
    font-size: 1.2rem;
    transition: color 0.2s;
}

.like-btn:hover i {
    color: #e74c3c;
}

.like-btn.liked i {
    color: #e74c3c !important;
}

/* Comment Box */
.comment-box {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
}

.comment-box input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 30px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

.comment-box input:focus {
    outline: none;
    border-color: #4a6fa5;
}

.comment-submit {
    padding: 0 1.5rem;
    border: none;
    border-radius: 30px;
    background: #4a6fa5;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
    font-weight: 500;
}

.comment-submit:hover {
    background: #166088;
}

/* Pagination */
.pagination-container {
    margin: 2rem 0;
}

.pagination-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
}

.page-nav, .page-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
}

.page-nav:hover, .page-number:hover {
    background: #f0f0f0;
}

.page-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-number.active {
    background: #4a6fa5;
    color: white;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .forum-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .create-post-btn {
        margin-left: 0;
        width: 100%;
    }
    
    .btn-primary {
        width: 100%;
        justify-content: center;
    }
    
    .post-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .post-actions {
        align-self: flex-end;
    }
    
    .comment-submit {
        padding: 0 1rem;
    }
}

/* Animation */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.post-card {
    animation: fadeIn 0.3s ease forwards;
}

.post-card:nth-child(odd) {
    animation-delay: 0.05s;
}

.post-card:nth-child(even) {
    animation-delay: 0.1s;
}
</style>