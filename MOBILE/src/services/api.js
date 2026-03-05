import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config';

// Create axios instance with base URL
const api = axios.create({
    baseURL: Config.API_BASE_URL,
    timeout: Config.REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach JWT token to every request
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('Failed to get token from storage:', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear stored token
            await AsyncStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
