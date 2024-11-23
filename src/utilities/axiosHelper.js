import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3007/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout and error handling
  timeout: 5000,
  withCredentials: true
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Add request interceptor to log requests in development
if (import.meta.env.DEV) {
  axiosInstance.interceptors.request.use(request => {
    console.log('API Request:', {
      url: request.url,
      method: request.method,
      data: request.data
    });
    return request;
  });
}

export default axiosInstance;