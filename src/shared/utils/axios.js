import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api"),
    headers: {},
});

// Request Counter
let activeRequests = 0;

// Request Interceptor: Attach Token & Start Loading
api.interceptors.request.use(
    (config) => {
        if (activeRequests === 0) {
            const event = typeof CustomEvent === 'function' 
                ? new CustomEvent('loading-start') 
                : (function() {
                    const e = document.createEvent('CustomEvent');
                    e.initCustomEvent('loading-start', true, true, {});
                    return e;
                })();
            window.dispatchEvent(event);
        }
        activeRequests++;

        // Context-aware Token Selection
        const isClientRoute = window.location.pathname.startsWith('/client');

        let token;
        if (isClientRoute) {
            token = localStorage.getItem("clientToken");
        } else {
            token = localStorage.getItem("token");
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        activeRequests--;
        if (activeRequests === 0) {
            const event = typeof CustomEvent === 'function' 
                ? new CustomEvent('loading-end') 
                : (function() {
                    const e = document.createEvent('CustomEvent');
                    e.initCustomEvent('loading-end', true, true, {});
                    return e;
                })();
            window.dispatchEvent(event);
        }
        return Promise.reject(error);
    }
);

// Response Interceptor: Error Handling & Stop Loading
api.interceptors.response.use(
    (response) => {
        activeRequests--;
        if (activeRequests === 0) {
            const event = typeof CustomEvent === 'function' 
                ? new CustomEvent('loading-end') 
                : (function() {
                    const e = document.createEvent('CustomEvent');
                    e.initCustomEvent('loading-end', true, true, {});
                    return e;
                })();
            window.dispatchEvent(event);
        }
        return response;
    },
    (error) => {
        activeRequests--;
        if (activeRequests === 0) {
            const event = typeof CustomEvent === 'function' 
                ? new CustomEvent('loading-end') 
                : (function() {
                    const e = document.createEvent('CustomEvent');
                    e.initCustomEvent('loading-end', true, true, {});
                    return e;
                })();
            window.dispatchEvent(event);
        }

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
