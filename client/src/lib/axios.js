import axios from 'axios';

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || // Vite
  process.env.VITE_API_URL ||                                              // Jest/Node
  'http://localhost:4000'

// Create an Axios instance with base config
const api = axios.create({
  baseURL: API_URL, // 🔹 replace with your backend URL
});

export default api;
