import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Create an Axios instance with base config
const api = axios.create({
  baseURL: API_URL, // 🔹 replace with your backend URL
});

export default api;
