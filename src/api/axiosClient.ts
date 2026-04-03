import axios from 'axios';
import { getToken } from '../utils/auth';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Adjunta el token JWT en cada request automáticamente
axiosClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default axiosClient;