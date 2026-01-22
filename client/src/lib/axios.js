import axios from "axios";
import { toast } from "react-toastify";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL 
        ? `${import.meta.env.VITE_SERVER_URL}/api/v1` 
        : (import.meta.env.MODE === "development" ? "http://localhost:4000/api/v1" : "/api/v1"),
    withCredentials: true,
});

// Add response interceptor to handle database connection errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle database connection errors
        if (error.response?.status === 503 && error.response?.data?.dbStatus === "disconnected") {
            toast.error("Database connection error. Please try again later.", {
                autoClose: 5000,
                position: "top-center"
            });
        }
        return Promise.reject(error);
    }
);