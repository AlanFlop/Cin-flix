// src/store/modules/movies.js
import moviesService from '@/services/movies.service';

export default {
  namespaced: true,
  
  state: {
    searchResults: [],
    searchLoading: false,
    searchError: null,
    currentMovie: null,
    detailsLoading: false,
    detailsError: null,
    popularMovies: [],
    popularLoading: false,
    popularError: null,
    favorites: [],
    favoritesLoading: false,
    favoritesError: null,
    totalResults: 0,
    totalPages: 0,
    currentPage: 1
  },
  
  getters: {
    // Nouveau getter pour obtenir le nombre total de films
    getTotalMoviesCount: state => state.totalResults,
    // Getter pour le nombre total de pages
    getTotalPages: state => state.totalPages,
    // Getter pour la page courante
    getCurrentPage: state => state.currentPage
  },
  
  mutations: {
    SET_SEARCH_RESULTS(state, results) {
      state.searchResults = results;
    },
    SET_SEARCH_LOADING(state, status) {
      state.searchLoading = status;
    },
    SET_SEARCH_ERROR(state, error) {
      state.searchError = error;
    },
    
    SET_CURRENT_MOVIE(state, movie) {
      state.currentMovie = movie;
    },
    SET_CURRENT_MOVIE_LOADING(state, status) {
      state.detailsLoading = status;
    },
    SET_CURRENT_MOVIE_ERROR(state, error) {
      state.detailsError = error;
    },
    
    SET_POPULAR_MOVIES(state, movies) {
      state.popularMovies = movies;
    },
    SET_POPULAR_LOADING(state, status) {
      state.popularLoading = status;
    },
    SET_POPULAR_ERROR(state, error) {
      state.popularError = error;
    },
    
    // Mutations pour les favoris
    SET_FAVORITES(state, favorites) {
      state.favorites = favorites;
    },
    ADD_FAVORITE(state, movie) {
      if (!state.favorites.some(f => f.movieId === movie.movieId)) {
        state.favorites.push(movie);
      }
    },
    REMOVE_FAVORITE(state, movieId) {
      state.favorites = state.favorites.filter(f => f.movieId !== movieId);
    },
    SET_FAVORITES_LOADING(state, status) {
      state.favoritesLoading = status;
    },
    SET_FAVORITES_ERROR(state, error) {
      state.favoritesError = error;
    },
    
    // Nouvelles mutations pour la pagination
    SET_TOTAL_RESULTS(state, totalResults) {
      state.totalResults = totalResults;
    },
    SET_TOTAL_PAGES(state, totalPages) {
      state.totalPages = totalPages;
    },
    SET_CURRENT_PAGE(state, page) {
      state.currentPage = page;
    }
  },
  
  actions: {
    // Action pour rechercher des films
    async searchMovies({ commit }, { query, page = 1 }) {
      commit('SET_SEARCH_LOADING', true);
      commit('SET_SEARCH_ERROR', null);
      
      try {
        // Appel au service pour rechercher des films avec pagination
        const response = await moviesService.searchMovies({ query, page });
        
        commit('SET_SEARCH_RESULTS', response.movies);
        commit('SET_TOTAL_RESULTS', response.totalResults);
        commit('SET_TOTAL_PAGES', response.totalPages);
        commit('SET_CURRENT_PAGE', page);
        
        return response.movies;
      } catch (error) {
        console.error('Erreur lors de la recherche de films:', error);
        commit('SET_SEARCH_ERROR', 'Une erreur est survenue lors de la recherche.');
        return [];
      } finally {
        commit('SET_SEARCH_LOADING', false);
      }
    },
    
    // Action pour récupérer un film par ID
    async fetchMovieDetails({ commit }, id) {
      console.log('Récupération des détails du film avec ID:', id);
      commit('SET_CURRENT_MOVIE_LOADING', true);
      commit('SET_CURRENT_MOVIE_ERROR', null);
      
      try {
        const movie = await moviesService.getMovieById(id);
        console.log('Film récupéré avec succès:', movie);
        commit('SET_CURRENT_MOVIE', movie);
        return movie;
      } catch (error) {
        console.error('Erreur lors de la récupération du film:', error);
        commit('SET_CURRENT_MOVIE_ERROR', 'Film non trouvé ou erreur de chargement.');
        return null;
      } finally {
        commit('SET_CURRENT_MOVIE_LOADING', false);
      }
    },
    
    // Action pour récupérer les films populaires avec pagination
    async fetchPopularMovies({ commit }, { page = 1 } = {}) {
      commit('SET_POPULAR_LOADING', true);
      commit('SET_POPULAR_ERROR', null);
      
      try {
        // Appel au service avec la page demandée
        const response = await moviesService.getPopularMovies({ page });
        
        // Mise à jour des films et des informations de pagination
        commit('SET_POPULAR_MOVIES', response.movies);
        commit('SET_TOTAL_RESULTS', response.totalResults);
        commit('SET_TOTAL_PAGES', response.totalPages);
        commit('SET_CURRENT_PAGE', page);
        
        return response;
      } catch (error) {
        console.error('Erreur lors de la récupération des films populaires:', error);
        commit('SET_POPULAR_ERROR', 'Une erreur est survenue lors du chargement des films populaires.');
        return { movies: [], totalResults: 0, totalPages: 0 };
      } finally {
        commit('SET_POPULAR_LOADING', false);
      }
    },
    
    // Actions pour la gestion des favoris
    async getFavorites({ commit, state }) {
      commit('SET_FAVORITES_LOADING', true);
      
      try {
        // Pour l'instant, on retourne les favoris du state
        const favorites = state.favorites;
        commit('SET_FAVORITES_LOADING', false);
        return favorites;
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        commit('SET_FAVORITES_ERROR', 'Impossible de récupérer vos favoris');
        commit('SET_FAVORITES_LOADING', false);
        return [];
      }
    },
    
    async addFavorite({ commit }, movie) {
      try {
        commit('ADD_FAVORITE', movie);
        return movie;
      } catch (error) {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
        throw error;
      }
    },
    
    async removeFavorite({ commit }, movieId) {
      try {
        commit('REMOVE_FAVORITE', movieId);
        return true;
      } catch (error) {
        console.error('Erreur lors de la suppression des favoris:', error);
        throw error;
      }
    },
    
    // Action pour récupérer les détails d'un acteur
    async fetchActorDetails() {
      // Pour le moment, on retourne un objet vide
      return {};
    }
  }
};