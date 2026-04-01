import axios from 'axios';

// URL base del backend — cambia el puerto si Spring Boot corre en otro
const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de respuesta: si el token expira en el futuro, aquí se maneja
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Por ahora solo relanzamos el error para que cada página lo maneje
        return Promise.reject(error);
    }
);

export default axiosClient;