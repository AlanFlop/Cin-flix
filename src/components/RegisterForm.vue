<template>
    <form @submit.prevent="register" class="register-form">
      <div v-if="error" class="form-error">
        {{ error }}
      </div>
      
      <div class="form-group">
        <label for="username">Nom d'utilisateur:</label>
        <input 
          id="username" 
          type="text" 
          v-model="formData.username" 
          required 
          placeholder="Choisissez un nom d'utilisateur"
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          id="email" 
          type="email" 
          v-model="formData.email" 
          required 
          placeholder="Votre adresse email"
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Mot de passe:</label>
        <div class="password-input">
          <input 
            id="password" 
            :type="showPassword ? 'text' : 'password'" 
            v-model="formData.password" 
            required 
            placeholder="Créez un mot de passe sécurisé"
            :disabled="loading"
          />
          <button 
            type="button" 
            class="toggle-password" 
            @click="togglePasswordVisibility"
          >
            {{ showPassword ? 'Cacher' : 'Afficher' }}
          </button>
        </div>
        <div class="password-strength" v-if="formData.password">
          <div class="strength-bar">
            <div 
              class="strength-progress" 
              :style="{ width: passwordStrength.percent + '%' }"
              :class="passwordStrength.level"
            ></div>
          </div>
          <span class="strength-text">{{ passwordStrength.message }}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirmer le mot de passe:</label>
        <input 
          id="confirmPassword" 
          :type="showPassword ? 'text' : 'password'" 
          v-model="formData.confirmPassword" 
          required 
          placeholder="Confirmez votre mot de passe"
          :disabled="loading"
          :class="{ error: formData.confirmPassword && formData.password !== formData.confirmPassword }"
        />
        <span class="error-message" v-if="formData.confirmPassword && formData.password !== formData.confirmPassword">
          Les mots de passe ne correspondent pas
        </span>
      </div>
      
      <div class="form-options">
        <label class="terms-checkbox">
          <input type="checkbox" v-model="formData.termsAccepted" required :disabled="loading" />
          <span>J'accepte les <a href="#" @click.prevent>conditions d'utilisation</a> et la <a href="#" @click.prevent>politique de confidentialité</a></span>
        </label>
      </div>
      
      <button 
        type="submit" 
        class="register-btn" 
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading">Inscription en cours...</span>
        <span v-else>S'inscrire</span>
      </button>
    </form>
  </template>
  
  <script>
  import { mapActions } from 'vuex'
  
  export default {
    name: 'RegisterForm',
    data() {
      return {
        formData: {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          termsAccepted: false
        },
        showPassword: false,
        loading: false,
        error: null
      }
    },
    computed: {
      passwordStrength() {
        const password = this.formData.password
        
        if (!password) {
          return { level: '', percent: 0, message: '' }
        }
        
        // Critères pour un mot de passe fort
        const hasLowerCase = /[a-z]/.test(password)
        const hasUpperCase = /[A-Z]/.test(password)
        const hasNumber = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
        const isLongEnough = password.length >= 8
        
        // Calculer le score de force
        let score = 0
        if (hasLowerCase) score++
        if (hasUpperCase) score++
        if (hasNumber) score++
        if (hasSpecialChar) score++
        if (isLongEnough) score++
        
        // Déterminer le niveau en fonction du score
        let level, message
        const percent = (score / 5) * 100
        
        if (score <= 2) {
          level = 'weak'
          message = 'Faible'
        } else if (score <= 3) {
          level = 'medium'
          message = 'Moyen'
        } else {
          level = 'strong'
          message = 'Fort'
        }
        
        return { level, percent, message }
      },
      isFormValid() {
        return (
          this.formData.username &&
          this.formData.email &&
          this.formData.password &&
          this.formData.password === this.formData.confirmPassword &&
          this.formData.termsAccepted
        )
      }
    },
    methods: {
      ...mapActions('auth', ['registerUser']),
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword
      },
      async register() {
        if (!this.isFormValid) return
        
        this.loading = true
        this.error = null
        
        try {
          await this.registerUser({
            username: this.formData.username,
            email: this.formData.email,
            password: this.formData.password
          })
          
          this.$emit('register-success')
        } catch (err) {
          this.error = err.message || 'Erreur lors de l\'inscription. Veuillez réessayer.'
        } finally {
          this.loading = false
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .register-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 600;
    color: #444;
  }
  
  input[type="email"],
  input[type="password"],
  input[type="text"] {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
  }
  
  input.error {
    border-color: #e50914;
    background-color: #ffebee;
  }
  
  .error-message {
    color: #e50914;
    font-size: 0.8rem;
    margin-top: 0.3rem;
  }
  
  .password-input {
    position: relative;
  }
  
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #777;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .password-strength {
    margin-top: 0.5rem;
    font-size: 0.8rem;
  }
  
  .strength-bar {
    width: 100%;
    height: 5px;
    background-color: #eee;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.3rem;
  }
  
  .strength-progress {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .strength-progress.weak {
    background-color: #f44336;
  }
  
  .strength-progress.medium {
    background-color: #ff9800;
  }
  
  .strength-progress.strong {
    background-color: #4caf50;
  }
  
  .strength-text {
    color: #666;
  }
  
  .form-options {
    font-size: 0.9rem;
  }
  
  .terms-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .terms-checkbox input {
    margin-top: 0.3rem;
  }
  
  .terms-checkbox a {
    color: #e50914;
    text-decoration: none;
  }
  
  .terms-checkbox a:hover {
    text-decoration: underline;
  }
  
  .register-btn {
    padding: 0.8rem;
    background-color: #e50914;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .register-btn:hover {
    background-color: #b2070f;
  }
  
  .register-btn:disabled {
    background-color: #ffaaaa;
    cursor: not-allowed;
  }
  
  .form-error {
    background-color: #ffebee;
    color: #e50914;
    padding: 0.8rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  </style>