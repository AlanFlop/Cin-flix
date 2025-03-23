// src/services/api.js
import axios from 'axios';

// Création d'une instance axios avec la configuration de base
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  config => {
    // Récupération du token depuis le localStorage
    const tokenData = localStorage.getItem('user_token');
    
    if (tokenData) {
      try {
        // Extraction de la valeur du token
        const { value } = JSON.parse(tokenData);
        // Ajout du token dans le header Authorization
        config.headers.Authorization = `Bearer ${value}`;
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
      }
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Gestion des erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      // Si le token a expiré ou est invalide
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
      
      // Redirection vers la page de connexion
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;