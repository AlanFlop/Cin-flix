<template>
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-title">Connexion</h1>
        
        <LoginForm @login-success="onLoginSuccess" />
        
        <div class="auth-footer">
          <p>Pas encore de compte ? <router-link to="/register">S'inscrire</router-link></p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import LoginForm from '@/components/LoginForm.vue'
  
  export default {
    name: 'LoginView',
    components: {
      LoginForm
    },
    methods: {
      onLoginSuccess() {
        // Récupérer le paramètre 'redirect' de l'URL s'il existe
        const redirectParam = this.$route.query.redirect
        
        // Rediriger vers la page appropriée
        if (redirectParam === 'movie' && this.$route.query.id) {
          // Rediriger vers la page du film
          this.$router.push(`/movie/${this.$route.query.id}`)
        } else if (redirectParam === 'cart') {
          // Rediriger vers le panier
          this.$router.push('/cart')
        } else {
          // Rediriger vers la page d'accueil par défaut
          this.$router.push('/')
        }
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