<template>
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-title">Inscription</h1>
        
        <RegisterForm @register-success="onRegisterSuccess" />
        
        <div class="auth-footer">
          <p>Déjà un compte ? <router-link to="/login">Se connecter</router-link></p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import RegisterForm from '@/components/RegisterForm.vue'
  
  export default {
    name: 'RegisterView',
    components: {
      RegisterForm
    },
    methods: {
      onRegisterSuccess() {
        // Rediriger vers la page de login avec un message de succès
        this.$router.push('/login')
      }
    }
  }
  </script>
  
  <style scoped>
  .auth-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 200px);
    padding: 2rem 1rem;
  }
  
  .auth-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 450px;
    padding: 2.5rem;
  }
  
  .auth-title {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }
  
  .auth-footer {
    margin-top: 2rem;
    text-align: center;
    color: #666;
  }
  
  .auth-footer a {
    color: #e50914;
    text-decoration: none;
  }
  
  .auth-footer a:hover {
    text-decoration: underline;
  }
  </style>