<script setup>
import { ref } from 'vue';
import Header from '@/components/Header.vue'

const posts = ref([]);
const newPostTitle = ref('');
const newPostContent = ref('');
const selectedPost = ref(null);

const createPost = () => {
    if (newPostTitle.value && newPostContent.value) {
        const newPost = {
            id: posts.value.length + 1,
            title: newPostTitle.value,
            content: newPostContent.value,
        };
        posts.value.push(newPost);
        newPostTitle.value = '';
        newPostContent.value = '';
    }
};

const viewPost = (post) => {
    selectedPost.value = post;
};

const deletePost = (postId) => {
    posts.value = posts.value.filter(post => post.id !== postId);
};
</script>

<template>
    <Header />
    <div class="forum-container">
        <h1>Forum</h1>
        <!-- <div class="new-post">
            <h2>Create New Post</h2>
            <input v-model="newPostTitle" placeholder="Post Title" />
            <textarea v-model="newPostContent" placeholder="Post Content"></textarea>
            <button @click="createPost">Submit</button>
        </div> -->
        <a href="#" class="btn btn-primary">Create New Post</a>

        <div class="posts">
            <h2>Posts</h2>
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Photography Competition is fun!</h5>
                    <p class="card-text">Yesterday i have ...</p>
                    <p class="card-text"><small class="text-muted">Last updated 3 mins ago by IT cat</small></p>
                </div>
                <img src="/src/assets/student_club_about.png" class="card-img-bottom" alt="...">
                <p class="card-text">Comments</p>
            </div>
            <div v-for="post in posts" :key="post.id" class="post">
                <h3 @click="viewPost(post)">{{ post.title }}</h3>
                <p>{{ post.content.substring(0, 100) }}...</p>
                <button @click="deletePost(post.id)">Delete</button>
            </div>
        </div>

        <div v-if="selectedPost" class="post-detail">
            <h2>{{ selectedPost.title }}</h2>
            <p>{{ selectedPost.content }}</p>
            <button @click="selectedPost = null">Back to Posts</button>
        </div>
    </div>
</template>

<style scoped>
.forum-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.new-post,
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

button {
    margin-top: 10px;
}
</style>