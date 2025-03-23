// src/services/auth.service.js
// import api from './api'; // Commenté car non utilisé dans la simulation

// Durée de validité du token (en millisecondes)
const TOKEN_VALIDITY = 24 * 60 * 60 * 1000; // 24 heures

class AuthService {
  /**
   * Connecte un utilisateur et stocke ses informations et son token
   * @param {object} credentials - Identifiants de connexion (email, password)
   * @returns {Promise} - Réponse de l'API
   */
  async login(credentials) {
    // Simuler une connexion réussie pour tester
    console.log('Simulation de connexion avec', credentials);
    
    const mockUser = {
      id: credentials.email.toLowerCase().replace(/@.*$/, ''), // Générer un ID basé sur l'email
      email: credentials.email,
      name: 'Utilisateur ' + credentials.email.split('@')[0]
    };
    
    const mockResponse = {
      user: mockUser,
      token: 'fake-jwt-token-' + Date.now()
    };
    
    // Stocker les données correctement
    this.setToken(mockResponse.token);
    this.setUser(mockUser);
    
    return mockResponse;
  }

  /**
   * Inscrit un nouvel utilisateur
   * @param {object} userData - Données d'inscription (nom, email, password, etc.)
   * @returns {Promise} - Réponse de l'API
   */
  async register(userData) {
    try {
      // Simuler une inscription réussie pour tester
      console.log('Simulation d\'inscription avec', userData);
      
      const mockUser = {
        id: userData.email.toLowerCase().replace(/@.*$/, ''), // Générer un ID basé sur l'email
        email: userData.email,
        name: userData.username || userData.name || 'Nouvel Utilisateur'
      };
      
      const mockResponse = {
        user: mockUser,
        token: 'fake-jwt-token-' + Date.now()
      };
      
      // Stocker les données correctement
      this.setToken(mockResponse.token);
      this.setUser(mockUser);
      
      return mockResponse;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  /**
   * Déconnecte l'utilisateur courant
   */
  logout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    
    // Notifier l'API de la déconnexion si nécessaire
    try {
      // api.post('/api/auth/logout');
      console.log('Déconnexion simulée');
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean} - True si l'utilisateur est connecté
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Stocke le token d'authentification avec sa date d'expiration
   * @param {string} token - Token d'authentification
   */
  setToken(token) {
    if (!token) return;
    
    const tokenData = {
      value: token,
      expires: Date.now() + TOKEN_VALIDITY
    };
    
    localStorage.setItem('user_token', JSON.stringify(tokenData));
  }

  /**
   * Récupère le token d'authentification s'il est valide
   * @returns {string|null} - Token d'authentification ou null
   */
  getToken() {
    const tokenData = localStorage.getItem('user_token');
    if (!tokenData) return null;
    
    try {
      const { value, expires } = JSON.parse(tokenData);
      
      // Vérifier si le token a expiré
      if (Date.now() > expires) {
        this.logout();
        return null;
      }
      
      return value;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  /**
   * Stocke les données de l'utilisateur connecté
   * @param {object} user - Données de l'utilisateur
   */
  setUser(user) {
    if (!user) return;
    
    // S'assurer que l'utilisateur a un ID
    if (!user.id) {
      user.id = user.email ? user.email.toLowerCase().replace(/@.*$/, '') : 'user_' + Date.now();
    }
    
    // Ne pas stocker de données sensibles
    const safeUserData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };
    
    localStorage.setItem('user_data', JSON.stringify(safeUserData));
  }

  /**
   * Récupère les données de l'utilisateur connecté
   * @returns {object|null} - Données de l'utilisateur ou null
   */
  getUser() {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Vérifie si le token est toujours valide auprès du serveur
   * @returns {Promise<boolean>} - True si le token est valide
   */
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Simulation de validation
      console.log('Simulation de validation de token');
      return true;
    } catch (error) {
      console.warn('Token invalide, déconnexion de l\'utilisateur', error);
      this.logout();
      return false;
    }
  }

  /**
   * Met à jour le profil de l'utilisateur
   * @param {object} userData - Nouvelles données utilisateur
   * @returns {Promise} - Réponse de l'API
   */
  async updateProfile(userData) {
    try {
      // Simuler une mise à jour réussie
      console.log('Simulation de mise à jour du profil avec', userData);
      
      const currentUser = this.getUser();
      const updatedUser = {
        ...currentUser,
        ...userData,
        id: currentUser.id // Conserver l'ID original
      };
      
      this.setUser(updatedUser);
      
      return { user: updatedUser };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Change le mot de passe de l'utilisateur
   * @param {object} _ - Ancien et nouveau mot de passe (non utilisé dans la simulation)
   * @returns {Promise} - Réponse de l'API
   */
  async changePassword(_) {
    try {
      // Simulation de changement de mot de passe réussi
      console.log('Simulation de changement de mot de passe');
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }
}

export default new AuthService();