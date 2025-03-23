// src/store/modules/auth.js
import authService from '@/services/auth.service';
import router from '@/router';

export default {
  namespaced: true,
  
  state: {
    user: authService.getUser(),
    isLoggingIn: false,
    isRegistering: false,
    error: null,
    isAuthReady: false
  },
  
  getters: {
    isLoggedIn: state => !!state.user,
    currentUser: state => state.user,
    authError: state => state.error,
    isAuthReady: state => state.isAuthReady
  },
  
  mutations: {
    SET_AUTH_READY(state, status) {
      state.isAuthReady = status;
    },
    
    LOGIN_REQUEST(state) {
      state.isLoggingIn = true;
      state.error = null;
    },
    
    LOGIN_SUCCESS(state, user) {
      state.isLoggingIn = false;
      state.user = user;
      state.error = null;
      state.isAuthReady = true;
    },
    
    LOGIN_FAILURE(state, error) {
      state.isLoggingIn = false;
      state.user = null;
      state.error = error;
      state.isAuthReady = true;
    },
    
    REGISTER_REQUEST(state) {
      state.isRegistering = true;
      state.error = null;
    },
    
    REGISTER_SUCCESS(state, user) {
      state.isRegistering = false;
      state.user = user;
      state.error = null;
      state.isAuthReady = true;
    },
    
    REGISTER_FAILURE(state, error) {
      state.isRegistering = false;
      state.error = error;
      state.isAuthReady = true;
    },
    
    LOGOUT(state) {
      state.user = null;
      state.error = null;
    },
    
    UPDATE_USER(state, user) {
      state.user = user;
    },
    
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  
  actions: {
    /**
     * Connecte un utilisateur
     * @param {object} context - Contexte Vuex
     * @param {object} credentials - Identifiants de connexion
     * @returns {Promise} - Succès ou échec de la connexion
     */
    async login({ commit, dispatch }, credentials) {
      commit('LOGIN_REQUEST');
      
      try {
        console.log('Action login: tente de connecter avec', credentials.email);
        const response = await authService.login(credentials);
        
        // Vérifier si la réponse contient bien un utilisateur
        if (!response.user) {
          throw new Error('Réponse du serveur invalide: utilisateur manquant');
        }
        
        console.log('Action login: connexion réussie, utilisateur:', response.user);
        commit('LOGIN_SUCCESS', response.user);
        
        // Initialiser les réservations de l'utilisateur après connexion
        dispatch('cart/initUserBookings', null, { root: true });
        
        // Ne pas gérer la redirection ici, on la laisse au composant
        
        return response;
      } catch (error) {
        console.error('Action login: erreur de connexion', error);
        const errorMessage = error.response?.data?.message || 'Erreur de connexion';
        commit('LOGIN_FAILURE', errorMessage);
        throw error;
      }
    },
    
    /**
     * Inscrit un nouvel utilisateur
     * @param {object} context - Contexte Vuex
     * @param {object} userData - Données d'inscription
     * @returns {Promise} - Succès ou échec de l'inscription
     */
    async register({ commit, dispatch }, userData) {
      commit('REGISTER_REQUEST');
      
      try {
        console.log('Action register: tente d\'inscrire', userData.email);
        const response = await authService.register(userData);
        
        // Vérifier si la réponse contient bien un utilisateur
        if (!response.user) {
          throw new Error('Réponse du serveur invalide: utilisateur manquant');
        }
        
        console.log('Action register: inscription réussie');
        commit('REGISTER_SUCCESS', response.user);
        
        // Initialiser les réservations de l'utilisateur après inscription
        dispatch('cart/initUserBookings', null, { root: true });
        
        // Ne pas gérer la redirection ici, on la laisse au composant
        
        return response;
      } catch (error) {
        console.error('Action register: erreur d\'inscription', error);
        const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
        commit('REGISTER_FAILURE', errorMessage);
        throw error;
      }
    },
    
    /**
     * Déconnecte l'utilisateur courant
     * @param {object} context - Contexte Vuex
     */
    logout({ commit }) {
      try {
        console.log('Action logout: déconnexion de l\'utilisateur');
        authService.logout();
        commit('LOGOUT');
        
        // Réinitialiser les réservations à vide lors de la déconnexion
        commit('cart/SET_BOOKINGS', [], { root: true });
        
        router.push({ name: 'login' });
      } catch (error) {
        console.error('Action logout: erreur de déconnexion', error);
        // En cas d'erreur, on déconnecte quand même
        commit('LOGOUT');
        router.push({ name: 'login' });
      }
    },
    
    /**
     * Vérifie si le token est toujours valide
     * @param {object} context - Contexte Vuex
     * @returns {Promise<boolean>} - Token valide ou non
     */
    async validateAuth({ commit, state, dispatch }) {
      // Si l'authentification n'est pas encore prête, on attend
      if (!state.isAuthReady) {
        commit('SET_AUTH_READY', true);
      }
      
      // Si pas d'utilisateur, pas besoin de valider
      if (!state.user) {
        console.log('validateAuth: pas d\'utilisateur à valider');
        return false;
      }
      
      try {
        console.log('validateAuth: vérification du token');
        const isValid = await authService.validateToken();
        
        // Si le token n'est plus valide, déconnecter l'utilisateur
        if (!isValid) {
          console.log('validateAuth: token invalide, déconnexion');
          commit('LOGOUT');
          return false;
        }
        
        console.log('validateAuth: token valide');
        
        // Si le token est valide, s'assurer que les réservations de l'utilisateur sont chargées
        dispatch('cart/initUserBookings', null, { root: true });
        
        return true;
      } catch (error) {
        console.error('validateAuth: erreur de validation', error);
        commit('LOGOUT');
        return false;
      }
    },
    
    /**
     * Met à jour le profil de l'utilisateur
     * @param {object} context - Contexte Vuex
     * @param {object} userData - Nouvelles données utilisateur
     * @returns {Promise} - Succès ou échec de la mise à jour
     */
    async updateProfile({ commit }, userData) {
      try {
        const response = await authService.updateProfile(userData);
        commit('UPDATE_USER', response.user);
        return response;
      } catch (error) {
        console.error('updateProfile: erreur de mise à jour', error);
        throw error;
      }
    },
    
    /**
     * Change le mot de passe de l'utilisateur
     * @param {object} context - Contexte Vuex
     * @param {object} passwordData - Ancien et nouveau mot de passe
     * @returns {Promise} - Succès ou échec du changement
     */
    async changePassword({ dispatch }, passwordData) {
      try {
        const response = await authService.changePassword(passwordData);
        
        // Revalider l'authentification après changement de mot de passe
        await dispatch('validateAuth');
        
        return response;
      } catch (error) {
        console.error('changePassword: erreur de changement', error);
        throw error;
      }
    },
    
    /**
     * Initialise l'état d'authentification au démarrage de l'application
     * @param {object} context - Contexte Vuex
     */
    async initAuth({ commit, dispatch }) {
      commit('SET_AUTH_READY', false);
      
      try {
        console.log('initAuth: initialisation de l\'authentification');
        const user = authService.getUser();
        const token = authService.getToken();
        
        console.log('initAuth: user trouvé dans localStorage?', !!user);
        console.log('initAuth: token trouvé dans localStorage?', !!token);
        
        if (user && token) {
          console.log('initAuth: utilisateur et token trouvés, validation...');
          commit('LOGIN_SUCCESS', user);
          
          // Vérifier si le token est toujours valide côté serveur
          const isValid = await dispatch('validateAuth');
          
          if (!isValid) {
            console.log('initAuth: token invalide lors de l\'initialisation');
          } else {
            console.log('initAuth: token valide, utilisateur authentifié');
            // Charger les réservations de l'utilisateur au démarrage de l'application
            dispatch('cart/initUserBookings', null, { root: true });
          }
        } else {
          console.log('initAuth: pas d\'utilisateur ou token');
          commit('SET_AUTH_READY', true);
        }
      } catch (error) {
        console.error('initAuth: erreur d\'initialisation', error);
        commit('SET_AUTH_READY', true);
      }
    },
    
    /**
     * Efface les erreurs d'authentification
     * @param {object} context - Contexte Vuex
     */
    clearAuthError({ commit }) {
      commit('CLEAR_ERROR');
    },
    
    /**
     * Demande de réinitialisation du mot de passe
     * @param {object} context - Contexte Vuex
     * @param {string} email - Email de l'utilisateur
     * @returns {Promise} - Succès ou échec de la demande
     */
    async requestPasswordReset(_, email) {
      try {
        const response = await authService.requestPasswordReset(email);
        return response;
      } catch (error) {
        console.error('requestPasswordReset: erreur', error);
        throw error;
      }
    },
    
    /**
     * Réinitialise le mot de passe de l'utilisateur
     * @param {object} context - Contexte Vuex
     * @param {object} resetData - Données de réinitialisation
     * @returns {Promise} - Succès ou échec de la réinitialisation
     */
    async resetPassword(_, resetData) {
      try {
        const response = await authService.resetPassword(resetData);
        return response;
      } catch (error) {
        console.error('resetPassword: erreur', error);
        throw error;
      }
    }
  }
};