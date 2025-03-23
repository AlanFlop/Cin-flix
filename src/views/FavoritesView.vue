<template>
    <div class="favorites-view">
      <h1 class="page-title">Mes films favoris</h1>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement de vos favoris...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchFavorites" class="btn">Réessayer</button>
      </div>
      
      <div v-else-if="favorites.length === 0" class="no-favorites">
        <div class="empty-state">
          <div class="icon">❤️</div>
          <h2>Vous n'avez pas encore de favoris</h2>
          <p>Ajoutez des films à vos favoris pour les retrouver facilement ici.</p>
          <router-link to="/" class="btn">Parcourir les films</router-link>
        </div>
      </div>
      
      <div v-else class="favorites-grid">
        <div 
          v-for="movie in favorites" 
          :key="movie.movieId" 
          class="movie-card"
          @click="goToMovie(movie.movieId)"
        >
          <div class="poster-container">
            <img 
              :src="movie.poster !== 'N/A' ? movie.poster : '/images/placeholder-movie.jpg'" 
              :alt="movie.title" 
              class="movie-poster"
              @error="handleImageError"
            />
            <div class="card-actions">
              <button 
                @click.stop="removeFavorite(movie.movieId)" 
                class="action-btn remove-btn"
                title="Retirer des favoris"
              >
                <span>❌</span>
              </button>
            </div>
          </div>
          <div class="movie-info">
            <h3 class="movie-title">{{ movie.title }}</h3>
            <p class="movie-year">{{ movie.year }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    name: 'FavoritesView',
    data() {
      return {
        notFoundImage: '/images/placeholder-movie.jpg'
      }
    },
    computed: {
      ...mapState('movies', {
        favorites: 'favorites',
        loading: 'favoritesLoading',
        error: 'favoritesError'
      })
    },
    methods: {
      ...mapActions('movies', ['fetchFavorites', 'removeFavorite']),
      
      goToMovie(movieId) {
        this.$router.push({ name: 'movie', params: { id: movieId } });
      },
      
      handleImageError(e) {
        e.target.src = this.notFoundImage;
      },
      
      async handleRemoveFavorite(movieId) {
        try {
          await this.removeFavorite(movieId);
          this.$toasted.show('Film retiré des favoris');
        } catch (error) {
          console.error('Erreur lors de la suppression du favori:', error);
          this.$toasted.error('Une erreur est survenue');
        }
      }
    },
    created() {
      this.fetchFavorites();
    }
  }
  </script>
  
  <style scoped>
  .favorites-view {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
  }
  
  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  .movie-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0,.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }
  
  .movie-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  .poster-container {
    position: relative;
    height: 300px;
  }
  
  .movie-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .card-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .action-btn:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .remove-btn:hover {
    background-color: rgba(229, 9, 20, 0.8);
  }
  
  .movie-info {
    padding: 1rem;
  }
  
  .movie-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: #333;
  }
  
  .movie-year {
    font-size: 0.9rem;
    color: #666;
  }
  
  .no-favorites {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }
  
  .empty-state {
    text-align: center;
    max-width: 400px;
    padding: 2rem;
  }
  
  .empty-state .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .empty-state h2 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  .empty-state p {
    margin-bottom: 1.5rem;
    color: #666;
  }
  
  .loading {
    text-align: center;
    padding: 3rem 0;
  }
  
  .spinner {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 5px solid rgba(229, 9, 20, 0.3);
    border-radius: 50%;
    border-top-color: #e50914;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error {
    text-align: center;
    padding: 3rem 0;
  }
  
  .error p {
    margin-bottom: 1rem;
    color: #666;
  }
  
  .btn {
    padding: 0.7rem 1.2rem;
    background-color: #e50914;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-decoration: none;
    display: inline-block;
  }
  
  .btn:hover {
    background-color: #f40612;
  }
  
  @media (max-width: 768px) {
    .favorites-view {
      padding: 1rem;
    }
    
    .favorites-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .poster-container {
      height: 225px;
    }
  }
  </style>