<template>
  <div class="home">
    <div v-if="searchLoading" class="loading">
      <div class="spinner"></div>
      <p>Recherche des films...</p>
    </div>
    
    <div v-else-if="searchError" class="error-message">
      <p>{{ searchError }}</p>
      <button @click="retrySearch" class="btn">Réessayer</button>
    </div>
    
    <div v-else-if="isSearchMode && searchResults.length === 0" class="no-results">
      <p>Aucun résultat trouvé pour "{{ currentSearchQuery }}"</p>
    </div>
    
    <div v-else>
      <!-- Résultats de recherche -->
      <div v-if="isSearchMode" class="search-results">
        <h2>Résultats pour "{{ currentSearchQuery }}"</h2>
        <div class="movie-grid">
          <div v-for="movie in searchResults" :key="movie.imdbID" class="movie-item">
            <MovieCard :movie="movie" @click="goToMovie(movie.imdbID)" />
          </div>
        </div>
        
        <Pagination 
          v-if="totalPages > 1" 
          :currentPage="currentPage" 
          :totalPages="totalPages" 
          @page-change="changePage"
        />
      </div>
      
      <!-- Films populaires (affichés par défaut) -->
      <div v-else class="popular-movies">
        <h2>Films populaires</h2>
        <div v-if="popularLoading" class="loading">
          <div class="spinner"></div>
          <p>Chargement des films populaires...</p>
        </div>
        
        <div v-else-if="popularError" class="error-message">
          <p>{{ popularError }}</p>
          <button @click="loadPopularMovies" class="btn">Réessayer</button>
        </div>
        
        <div v-else class="movie-grid">
          <div v-for="movie in popularMovies" :key="movie.imdbID" class="movie-item">
            <MovieCard :movie="movie" @click="goToMovie(movie.imdbID)" />
          </div>
        </div>
        
        <Pagination 
          v-if="totalPages > 1" 
          :currentPage="currentPage" 
          :totalPages="totalPages" 
          @page-change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import MovieCard from '@/components/MovieCard.vue'
import Pagination from '@/components/Pagination.vue'

export default {
  name: 'HomeView',
  components: {
    MovieCard,
    Pagination
  },
  data() {
    return {
      currentSearchQuery: '',
      isSearchMode: false
    }
  },
  computed: {
    ...mapState('movies', [
      'searchResults',
      'searchLoading',
      'searchError',
      'popularMovies',
      'popularLoading',
      'popularError',
      'totalResults',
      'totalPages',
      'currentPage'
    ])
  },
  methods: {
    ...mapActions('movies', [
      'searchMovies',
      'fetchPopularMovies'
    ]),
    
    retrySearch() {
      if (this.currentSearchQuery) {
        this.searchMovies({ query: this.currentSearchQuery, page: 1 });
      }
    },
    
    async changePage(page) {
      if (this.isSearchMode) {
        await this.searchMovies({ query: this.currentSearchQuery, page });
      } else {
        await this.loadPopularMovies(page);
      }
      
      // Remonter en haut de la page
      window.scrollTo(0, 0);
    },
    
    async loadPopularMovies(page = 1) {
      try {
        await this.fetchPopularMovies({ page });
      } catch (error) {
        console.error('Erreur lors du chargement des films populaires:', error);
      }
    },
    
    goToMovie(id) {
      this.$router.push({ name: 'movie', params: { id } });
    }
  },
  created() {
    // Vérifier s'il y a une requête de recherche dans l'URL
    const queryParam = this.$route.query.q;
    
    if (queryParam) {
      // Si une requête est présente, mettre à jour l'état de recherche
      this.currentSearchQuery = queryParam;
      this.isSearchMode = true;
      
      // Forcer une recherche si nécessaire
      if (this.searchResults.length === 0 && !this.searchLoading) {
        this.searchMovies({ query: queryParam, page: 1 });
      }
    } else {
      // Sinon, charger les films populaires
      this.isSearchMode = false;
      this.loadPopularMovies();
    }
  },
  watch: {
    // Surveiller les résultats de recherche pour mettre à jour l'interface
    searchResults(newResults) {
      if (newResults && newResults.length > 0) {
        this.isSearchMode = true;
      }
    },
    
    // Surveiller les changements dans les paramètres de l'URL
    '$route.query.q'(newQuery) {
      if (newQuery) {
        this.currentSearchQuery = newQuery;
        this.isSearchMode = true;
      } else {
        // Si le paramètre de recherche est retiré, revenir aux films populaires
        this.isSearchMode = false;
        this.currentSearchQuery = '';
        this.loadPopularMovies();
      }
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.movie-item {
  height: 100%;
}

.search-results h2, .popular-movies h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e50914;
  padding-bottom: 0.5rem;
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

.error-message, .no-results {
  text-align: center;
  padding: 3rem 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 2rem;
}

.error-message p, .no-results p {
  margin-bottom: 1rem;
  color: #666;
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
  }
}
</style>