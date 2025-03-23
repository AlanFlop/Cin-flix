<template>
  <div class="movie-card" @click="$emit('click')">
    <div class="poster-container">
      <img 
        :src="posterUrl"
        :alt="movieTitle"
        class="movie-poster"
        @error="handleImageError"
      />
    </div>
    <div class="movie-info">
      <h3 class="movie-title">{{ movieTitle }}</h3>
      <p class="movie-year">{{ movieYear }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MovieCard',
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // Utilisez une URL d'image locale pour l'image par défaut
      defaultImage: '/images/placeholder-movie.jpg',
      // Pour suivre si on a déjà essayé de charger une image alternative
      triedAlternative: false
    };
  },
  computed: {
    posterUrl() {
      // Vérification de sécurité pour s'assurer que le film est défini
      if (!this.movie) return this.defaultImage;

      // Vérifiez si on a une URL directe
      if (this.movie.directPosterUrl) {
        return this.movie.directPosterUrl;
      }

      // Gestion pour API TMDB avec Poster (format de notre application)
      if (this.movie.Poster) {
        return this.movie.Poster;
      }
      
      // Gestion pour API TMDB avec format original
      if (this.movie.poster_path) {
        return `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`;
      }

      // Cas spécial pour "Take the Money and Run" (ID: 1441966)
      if (this.movie.imdbID === '1441966' || this.movie.id === '1441966') {
        return `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg`;
      }

      // Essayez d'utiliser l'image de backdrop comme alternative
      if (this.movie.backdrop_path || this.movie.backdropPath) {
        const path = this.movie.backdrop_path || this.movie.backdropPath;
        // Vérifiez si backdropPath est déjà une URL complète
        if (typeof path === 'string' && path.startsWith('http')) {
          return path;
        } else if (path) {
          return `https://image.tmdb.org/t/p/w500${path}`;
        }
      }
      
      // Image par défaut en dernier recours
      return this.defaultImage;
    },
    
    movieTitle() {
      if (!this.movie) return 'Titre non disponible';
      return this.movie.Title || this.movie.title || 'Titre non disponible';
    },
    
    movieYear() {
      if (!this.movie) return '';
      if (this.movie.Year) return this.movie.Year;
      if (this.movie.release_date) return this.formatYear(this.movie.release_date);
      return '';
    }
  },
  methods: {
    formatYear(dateString) {
      if (!dateString) return '';
      return new Date(dateString).getFullYear();
    },
    
    handleImageError(e) {
      console.log(`Erreur de chargement d'image pour ${this.movieTitle}`, e.target.src);
      
      // Éviter les boucles infinies
      if (e.target.src === this.defaultImage) return;

      // Cas spécial pour "Take the Money and Run" si l'ID correspond
      if ((this.movie.imdbID === '1441966' || this.movie.id === '1441966') && !this.triedAlternative) {
        console.log('Tentative avec URL spécifique pour Take the Money and Run');
        this.triedAlternative = true;
        e.target.src = `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg`;
        return;
      }
      
      // Essayez d'abord avec une autre taille d'image
      if (e.target.src.includes('w500') && !this.triedAlternative) {
        console.log('Tentative avec une taille d\'image alternative');
        this.triedAlternative = true;
        
        // Essayez une taille plus petite
        if (this.movie.poster_path) {
          e.target.src = `https://image.tmdb.org/t/p/w342${this.movie.poster_path}`;
          return;
        } else if (this.movie.backdrop_path || this.movie.backdropPath) {
          // Essayez d'utiliser l'image de fond
          const path = this.movie.backdrop_path || this.movie.backdropPath;
          if (typeof path === 'string' && !path.startsWith('http')) {
            e.target.src = `https://image.tmdb.org/t/p/w780${path}`;
            return;
          }
        }
      }
      
      // Si toutes les tentatives échouent, utilisez l'image par défaut
      e.target.src = this.defaultImage;
    },

    mounted() {
      // Log pour déboguer
      console.log('Structure du film sur la page d\'accueil:', this.movie);
    }
  }
}
</script>

<style scoped>
.movie-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.poster-container {
  position: relative;
  overflow: hidden;
  padding-top: 150%; /* Ratio d'aspect 2:3 pour les affiches de films */
}

.movie-poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.movie-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-year {
  color: #666;
  font-size: 0.9rem;
  margin-top: auto;
}
</style>