import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ✅ ПЕРЕХВАТЧИК — автоматически добавляет токен к каждому запросу
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Токен добавлен к запросу:', config.url);
    } else {
      console.log('❌ Токен отсутствует в localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API функции
export const register = (userData) => API.post('/auth/register', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const getCategories = () => API.get('/categories');
export const getThreadsByCategory = (categoryId, page = 1) => 
  API.get(`/threads/category/${categoryId}?page=${page}&limit=10`);
export const createThread = (threadData) => API.post('/threads', threadData);
export const getPostsByThread = (threadId) => API.get(`/posts/thread/${threadId}`);
export const createPost = (postData) => API.post('/posts', postData);
export const likePost = (postId) => API.post(`/posts/${postId}/like`);
export const dislikePost = (postId) => API.post(`/posts/${postId}/dislike`);
export const search = (query) => API.get(`/search?q=${query}`);

export default API;