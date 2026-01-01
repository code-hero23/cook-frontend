import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api"),
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (assuming it's stored as 'token')
        // Adjust key if your Login.jsx stores it differently (e.g. inside a user object)
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Unauthorized) - maybe redirect to login or clear storage
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Unauthorized access - redirecting to login");
            // Optional: window.location.href = '/login'; 
            // But be careful with circular loops or specific client logic
        }
        return Promise.reject(error);
    }
);

export default api;
