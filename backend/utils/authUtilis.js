// src/utils/authUtils.js

// Save token to localStorage
export const saveToken = (token) => {
    localStorage.setItem('authToken', token);
};

// Retrieve token from localStorage
export const getToken = () => {
    return localStorage.getItem('authToken');
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('authToken');
};