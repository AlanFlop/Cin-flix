<template>
  <div class="search-bar">
    <input 
      type="text" 
      v-model="searchQuery" 
      @keyup.enter="search"
      placeholder="Rechercher un film..." 
      class="search-input"
    />
    <button @click="search" class="search-button">
      <span class="search-icon">&#128269;</span>
    </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'SearchBar',
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    ...mapActions({
      searchMovies: 'movies/searchMovies'
    }),
    async search() {
      if (this.searchQuery.trim()) {
        // Exécuter l'action de recherche avec page 1
        await this.searchMovies({ query: this.searchQuery, page: 1 });
        
        // Si l'utilisateur n'est pas déjà sur la page d'accueil, rediriger
        if (this.$route.path !== '/') {
          this.$router.push({ path: '/', query: { q: this.searchQuery } });
        } else {
          // Mettre à jour l'URL avec le paramètre de recherche sans recharger la page
          this.$router.replace({ query: { q: this.searchQuery } });
        }
      }
    }
  },
  async created() {
    // Récupérer la recherche depuis l'URL si elle existe
    const queryParam = this.$route.query.q;
    if (queryParam) {
      this.searchQuery = queryParam;
      
      // Exécuter la recherche automatiquement si on est sur la page d'accueil
      if (this.$route.path === '/') {
        await this.searchMovies({ query: this.searchQuery, page: 1 });
      }
    }
  },
  watch: {
    // Surveiller les changements dans l'URL et mettre à jour la barre de recherche
    '$route.query.q'(newQuery) {
      if (newQuery) {
        this.searchQuery = newQuery;
      } else {
        // Réinitialiser la recherche si le paramètre est supprimé
        this.searchQuery = '';
      }
    }
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  outline: none;
}

.search-button {
  background-color: #e50914;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #b2070f;
}

.search-icon {
  font-size: 1.1rem;
}
</style>