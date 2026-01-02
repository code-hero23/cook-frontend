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
        // Get token from localStorage (token for Admin/Employee, clientToken for Client)
        const token = localStorage.getItem("token") || localStorage.getItem("clientToken");
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
