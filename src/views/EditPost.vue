<template>
    <main class="edit-post-page">
        <Header />
        <div class="header-spacer"></div>

        <div class="edit-container">
            <div class="edit-card">
                <div class="return-btn">
                    <a href="/forum" class="back-link">
                        <i class='bx bx-arrow-back'></i>
                        <span>Back to Forum</span>
                    </a>
                </div>
                
                <h1 class="edit-title">Edit Your Post</h1>
                
                <form @submit.prevent="handleSubmit" class="edit-form">
                    <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" id="title" v-model="post.title" placeholder="Enter a catchy title">
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" v-model="post.description" 
                                  placeholder="Tell us more about your post..."></textarea>
                    </div>
                    
                    <div class="image-upload-section">
                        <div class="image-upload-group" v-for="n in 3" :key="n">
                            <div class="current-image" v-if="post[`eventPoster${n}`]">
                                <label>Current Image {{n}}</label>
                                <img :src="'http://localhost:3000/uploads/' + post[`eventPoster${n}`]" 
                                     :alt="'Current Image ' + n" 
                                     class="current-poster" />
                            </div>
                            
                            <div class="preview-image" v-if="posterFiles[n]">
                                <label>New Image Preview {{n}}</label>
                                <img :src="getImagePreview(posterFiles[n])" 
                                     :alt="'New Image Preview ' + n" 
                                     class="preview-poster" />
                            </div>
                            
                            <div class="file-upload">
                                <label :for="'poster'+n">Upload New Image {{n}}</label>
                                <div class="upload-area" :class="{ 'has-file': posterFiles[n] }">
                                    <input type="file" 
                                           :id="'poster'+n" 
                                           accept=".png, .jpg, .jpeg" 
                                           @change="event => handleFileChange(event, n)" />
                                    <div class="upload-hint" :class="{ 'has-file': posterFiles[n] }">
                                        <i class='bx bx-cloud-upload'></i>
                                        <span v-if="!posterFiles[n]">Click to browse or drag & drop</span>
                                        <span v-else>Image {{n}} selected - click to change</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-btn">
                        <i class='bx bx-save'></i> Update Post
                    </button>
                </form>
            </div>
        </div>
    </main>
</template>

<script setup>
import Header from '@/components/Header.vue'
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const route = useRoute();
const postid = route.params.id;
const post = ref({
    title: '',
    description: '',
    eventPoster1: null,
    eventPoster2: null,
    eventPoster3: null,
});

const posterFiles = ref({ 1: null, 2: null, 3: null });

const fetchPost = async () => {
    try {
        const response = await axios.get(`/api/post/detail/${postid}`);
        post.value = response.data;
    } catch (error) {
        console.error(error);
        toastr.error('Failed to load post details', 'Error');
    }
}

const getImagePreview = (file) => {
    return URL.createObjectURL(file);
};

const handleFileChange = (event, posterNumber) => {
    if (event.target.files && event.target.files[0]) {
        posterFiles.value[posterNumber] = event.target.files[0];
        toastr.success(`Image ${posterNumber} selected successfully!`, 'Success', {
            timeOut: 3000,
            positionClass: 'toast-top-right'
        });
    }
};

const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', post.value.title);
    formData.append('description', post.value.description);

    // Show uploading message
    const uploadToast = toastr.info('Uploading images...', 'Please wait', {
        timeOut: 0,
        extendedTimeOut: 0
    });

    try {
        for (let i = 1; i <= 3; i++) {
            if (posterFiles.value[i]) {
                formData.append(`eventPoster${i}`, posterFiles.value[i]);
            }
        }

        const response = await axios.put(`/api/editpost/${postid}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Clear the loading toast
        toastr.clear(uploadToast);
        
        if (response.status === 200) {
            toastr.success('Post updated successfully!', 'Success', {
                timeOut: 3000,
                onHidden: () => {
                    window.location.href = '/forum';
                }
            });
        }
    } catch (error) {
        toastr.clear(uploadToast);
        toastr.error('Failed to update post. Please try again.', 'Error', {
            timeOut: 3000
        });
        console.error(error);
    }
};

onMounted(() => {
    fetchPost();
});
</script>

<style scoped>
.edit-post-page {
    background-color: #ffffff;
    min-height: 100vh;
}

.header-spacer {
    height: 80px;
}

/* Container Styles */
.edit-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.edit-card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2.5rem;
    border: 1px solid #dee2e6;
    animation: fadeIn 0.3s ease forwards;
}

/* Header Styles */
.return-btn {
    margin-bottom: 1.5rem;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #4361ee;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.back-link:hover {
    color: #3a0ca3;
}

.back-link i {
    font-size: 1.5rem;
}

.edit-title {
    color: #3a0ca3;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
}

/* Form Styles */
.edit-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: #2b2d42;
    font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
    padding: 0.8rem 1rem;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background-color: #f8f9fa;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
    background-color: white;
}

.form-group textarea {
    min-height: 120px;
    resize: vertical;
}

/* Image Upload Styles */
.image-upload-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.image-upload-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.current-image {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.current-image label {
    font-weight: 600;
    color: #2b2d42;
    font-size: 0.95rem;
}

.current-poster {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    border: 2px solid #dee2e6;
    object-fit: contain;
    background-color: #f8f9fa;
    padding: 8px;
}

.preview-image {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.preview-image label {
    font-weight: 600;
    color: #2b2d42;
    font-size: 0.95rem;
}

.preview-poster {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    border: 2px solid #4ade80;
    object-fit: contain;
    background-color: #f0fdf4;
    padding: 8px;
}

.file-upload {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-upload label {
    font-weight: 600;
    color: #2b2d42;
    font-size: 0.95rem;
}

.upload-area {
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background-color: #f8f9fa;
}

.upload-area:hover {
    border-color: #4361ee;
    background-color: rgba(67, 97, 238, 0.05);
}

.upload-area.has-file {
    border-color: #4ade80;
    background-color: rgba(74, 222, 128, 0.05);
}

.upload-area input[type="file"] {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
}

.upload-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    transition: all 0.2s;
}

.upload-hint.has-file {
    color: #4ade80;
}

.upload-hint i {
    font-size: 2rem;
    color: #4361ee;
    transition: all 0.2s;
}

.upload-hint.has-file i {
    color: #4ade80;
}

/* Button Styles */
.submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    background-color: #4361ee;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
    border: 2px solid #3a0ca3;
}

.submit-btn:hover {
    background-color: #3a0ca3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 12, 163, 0.2);
}

.submit-btn i {
    font-size: 1.2rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .edit-container {
        padding: 1rem;
    }
    
    .edit-card {
        padding: 1.5rem;
    }
    
    .edit-title {
        font-size: 1.5rem;
    }
    
    .form-group input,
    .form-group textarea {
        padding: 0.75rem;
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>