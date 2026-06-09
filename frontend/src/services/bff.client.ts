// In a real app, this might be a generated Axios client from OpenAPI
import axios from 'axios';

export const bffClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT if needed
bffClient.interceptors.request.use((config) => {
  // Logic to fetch token
  return config;
});
