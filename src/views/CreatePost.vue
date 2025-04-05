<template>
    <main class="create-post-page">
        <Header />
        <div class="header-spacer"></div>

        <div class="create-container">
            <div class="create-card">
                <div class="return-btn">
                    <a href="/forum" class="back-link">
                        <i class='bx bx-arrow-back'></i>
                        <span>Back to Forum</span>
                    </a>
                </div>
                
                <h1 class="create-title">Create New Post</h1>
                
                <form @submit.prevent="handleSubmit" class="create-form">
                    <div class="form-group">
                        <label for="title">Post Title</label>
                        <input type="text" id="title" v-model="title" placeholder="Enter a catchy title">
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" v-model="description" 
                                  placeholder="Tell us more about your post..."></textarea>
                    </div>
                    
                    <div class="image-upload-section">
                        <div class="image-upload-group" v-for="n in 3" :key="n">
                            <div class="file-upload">
                                <label :for="'poster'+n">Upload Image {{n}}</label>
                                <div class="upload-area" 
                                     @dragover.prevent="handleDragOver"
                                     @dragleave="handleDragLeave"
                                     @drop.prevent="handleDrop($event, n)"
                                     :class="{ 'drag-over': isDragging }">
                                    <input type="file" 
                                           :id="'poster'+n" 
                                           accept=".png, .jpg, .jpeg" 
                                           @change="event => handleFileChange(event, n)" />
                                    
                                    <div v-if="previews[n]" class="preview-container">
                                        <img :src="previews[n]" class="preview-image" />
                                        <button @click.stop="removeImage(n)" class="remove-preview">
                                            <i class='bx bx-x'></i>
                                        </button>
                                    </div>
                                    
                                    <div v-else class="upload-hint">
                                        <i class='bx bx-cloud-upload'></i>
                                        <span>Click to browse or drag & drop</span>
                                        <small>Supports: JPG, PNG (Max 5MB)</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-btn">
                        <i class='bx bx-plus'></i> Create Post
                    </button>
                </form>
            </div>
        </div>
    </main>
</template>

<script setup>
import Header from '@/components/Header.vue';
import { ref ,onMounted} from "vue";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'; 

const route = useRoute();
const router = useRouter();

let isAdmin = ref(false);
let isStudent = ref(false);
let title = ref('');
let description = ref('');
let studentid = ref(route.params.id);
let posterFiles = ref([null, null, null]);
let previews = ref({1: null, 2: null, 3: null});
let isDragging = ref(false);

const checkRole = async () => {
    if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        if (decoded.user.role === 'admin') {
            isAdmin.value = true;
        }
        if (decoded.user.role === 'student') {
            isStudent.value = true;
        }
    }
};

const handleDragOver = () => {
    isDragging.value = true;
};

const handleDragLeave = () => {
    isDragging.value = false;
};

const handleDrop = (event, posterNumber) => {
    isDragging.value = false;
    const file = event.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
        processFile(file, posterNumber);
        // Update the file input
        const input = document.getElementById(`poster${posterNumber}`);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
    }
};

const handleFileChange = (event, posterNumber) => {
    const file = event.target.files[0];
    if (file) {
        processFile(file, posterNumber);
    }
};

const processFile = (file, posterNumber) => {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        toastr.error('File size exceeds 5MB limit');
        return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
        toastr.error('Only image files are allowed');
        return;
    }

    posterFiles.value[posterNumber] = file;
    createPreview(file, posterNumber);
};

const createPreview = (file, posterNumber) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        previews.value[posterNumber] = e.target.result;
    };
    reader.readAsDataURL(file);
};

const removeImage = (posterNumber) => {
    previews.value[posterNumber] = null;
    posterFiles.value[posterNumber] = null;
    // Clear the file input
    const input = document.getElementById(`poster${posterNumber}`);
    input.value = '';
};

const handleSubmit = () => {
    if (!title.value.trim()) {
        toastr.error('Please enter a title');
        return;
    }

    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('student_id', studentid.value);

    for (let i = 1; i <= 3; i++) {
        if (posterFiles.value[i]) {
            formData.append(`poster${i}`, posterFiles.value[i]);
        }
    }

    axios.post('/api/createpost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((response) => {
        if (response.status === 201) {
            toastr.success('Post created successfully!');
            router.push('/forum');
        }
    })
    .catch((error) => {
        console.error(error);
        toastr.error('Failed to create post. Please try again.');
    });
};

onMounted(() => {
    checkRole();
});
</script>

<style scoped>
.create-post-page {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.header-spacer {
    height: 80px;
}

.create-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.create-card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2.5rem;
    border: 1px solid #e9ecef;
    animation: fadeIn 0.3s ease forwards;
}

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
    transition: all 0.2s;
    padding: 0.5rem;
    border-radius: 6px;
}

.back-link:hover {
    color: #3a0ca3;
    background-color: rgba(67, 97, 238, 0.1);
}

.back-link i {
    font-size: 1.5rem;
}

.create-title {
    color: #3a0ca3;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
}

.create-form {
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
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-area.drag-over {
    border-color: #4361ee;
    background-color: rgba(67, 97, 238, 0.05);
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

.preview-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.preview-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    object-fit: contain;
    border: 1px solid #e9ecef;
}

.remove-preview {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.remove-preview:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
}

.upload-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    padding: 1rem;
    text-align: center;
}

.upload-hint i {
    font-size: 2rem;
    color: #4361ee;
}

.upload-hint small {
    font-size: 0.8rem;
    color: #adb5bd;
}

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

@media (max-width: 768px) {
    .create-container {
        padding: 1rem;
    }
    
    .create-card {
        padding: 1.5rem;
    }
    
    .create-title {
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