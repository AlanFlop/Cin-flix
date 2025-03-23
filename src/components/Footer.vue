<template>
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-logo">
          Ciné<span>Flix</span>
        </div>
        <div class="footer-links">
          <div class="footer-section">
            <h3>À propos</h3>
            <a href="#" class="footer-link">Notre histoire</a>
            <a href="#" class="footer-link">Nos cinémas</a>
            <a href="#" class="footer-link">Nous contacter</a>
          </div>
          <div class="footer-section">
            <h3>Légal</h3>
            <a href="#" class="footer-link">Mentions légales</a>
            <a href="#" class="footer-link">Politique de confidentialité</a>
            <a href="#" class="footer-link">CGU</a>
          </div>
          <div class="footer-section">
            <h3>Suivez-nous</h3>
            <div class="social-links">
              <a href="#" class="social-link">Facebook</a>
              <a href="#" class="social-link">Twitter</a>
              <a href="#" class="social-link">Instagram</a>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} CinéFlix - Tous droits réservés</p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'Footer',
    computed: {
      currentYear() {
        return new Date().getFullYear()
      }
    }
  }
  </script>
  
  <style scoped>
  .footer {
    background-color: #1a1a1a;
    color: white;
    padding-top: 2rem;
  }
  
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .footer-logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 2rem;
  }
  
  .footer-logo span {
    color: #e50914;
  }
  
  .footer-links {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    justify-content: space-around;
  }
  
  .footer-section {
    margin-bottom: 1.5rem;
    min-width: 150px;
  }
  
  .footer-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #e50914;
  }
  
  .footer-link, .social-link {
    display: block;
    color: #bbbbbb;
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: color 0.3s;
  }
  
  .footer-link:hover, .social-link:hover {
    color: white;
  }
  
  .social-links {
    display: flex;
    gap: 1rem;
  }
  
  .footer-bottom {
    text-align: center;
    padding: 1.5rem 0;
    margin-top: 2rem;
    border-top: 1px solid #333;
  }
  
  @media (max-width: 768px) {
    .footer-container {
      flex-direction: column;
    }
    
    .footer-links {
      flex-direction: column;
    }
  }
  </style>