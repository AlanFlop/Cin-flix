<template>
  <div class="login-form">
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="credentials.email" 
          class="form-control" 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input 
          type="password" 
          id="password" 
          v-model="credentials.password" 
          class="form-control" 
          required
        />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn primary" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
        <router-link to="/reset-password" class="forgot-password">
          Mot de passe oublié ?
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'LoginForm',
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      }
    };
  },
  computed: {
    ...mapState('auth', ['error', 'isLoggingIn'])
  },
  methods: {
    ...mapActions('auth', ['login', 'clearAuthError']),
    
    async handleLogin() {
      console.log('Tentative de connexion avec:', this.credentials.email);
      
      // Effacer les erreurs précédentes
      this.clearAuthError();
      
      try {
        // Appeler l'action login du module auth
        const response = await this.login(this.credentials);
        
        console.log('Connexion réussie, émission de l\'événement login-success');
        
        // Important: émettre l'événement que LoginView attend
        this.$emit('login-success');
        
        return response;
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        // L'erreur est déjà gérée par l'action login qui met à jour le state
      }
    }
  },
  created() {
    // Effacer les erreurs au chargement du composant
    this.clearAuthError();
  }
};
</script>

<style scoped>
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #e50914;
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn.primary {
  background-color: #e50914;
  color: white;
}

.btn.primary:hover {
  background-color: #f40612;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.forgot-password {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  color: #e50914;
  text-decoration: underline;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.alert-error {
  background-color: #feeeed;
  color: #e50914;
  border: 1px solid #fcd0cd;
}
</style>