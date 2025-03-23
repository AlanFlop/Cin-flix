import api, { getImageUrl } from './tmdb-api'

// Fonction utilitaire pour récupérer une URL d'image plus robuste
function getSafeImageUrl(path, fallbackPath = null, size = 'medium', type = 'poster') {
  // Cas spécial pour "Take the Money and Run" (ID: 1441966)
  if (path === null && type === 'poster' && fallbackPath === '/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg') {
    return `https://image.tmdb.org/t/p/w500${fallbackPath}`;
  }

  // Essayez d'abord le chemin principal
  if (path) {
    return getImageUrl(path, size, type);
  }
  
  // Si le chemin principal échoue, essayez le chemin de secours
  if (fallbackPath) {
    return getImageUrl(fallbackPath, size, type);
  }
  
  // Si les deux échouent, retournez null
  return null;
}

const moviesService = {
  /**
   * Récupère une liste de films populaires
   * @param {Object} params - Les paramètres de recherche
   * @param {number} params.page - Numéro de page
   * @returns {Promise<{movies: Array, totalResults: number, totalPages: number}>}
   */
  async getPopularMovies({ page = 1 } = {}) {
    try {
      const response = await api.get('/movie/popular', {
        params: { page }
      })
      
      // Log pour déboguer les données brutes de l'API
      console.log('Données brutes des films populaires:', response.data.results);
      
      // Formater les résultats pour être compatibles avec notre application
      const movies = response.data.results.map(movie => {
        // Gestion spéciale pour "Take the Money and Run"
        let posterUrl = null;
        if (movie.id === 1441966 || movie.id === '1441966') {
          posterUrl = `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg`;
        } else {
          posterUrl = getSafeImageUrl(movie.poster_path, movie.backdrop_path);
        }
        
        return {
          imdbID: movie.id.toString(),
          Title: movie.title,
          Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
          Poster: posterUrl,
          directPosterUrl: movie.id === 1441966 ? `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg` : null,
          // Ajouter d'autres propriétés TMDB utiles
          voteAverage: movie.vote_average,
          overview: movie.overview,
          backdropPath: getSafeImageUrl(movie.backdrop_path, null, 'large', 'backdrop'),
          // Conserver les chemins originaux pour la gestion des erreurs d'image
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path
        }
      })
      
      return {
        movies,
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error)
      throw error
    }
  },
  
  /**
   * Rechercher des films par titre
   * @param {Object} params - Les paramètres de recherche
   * @param {string} params.query - Terme de recherche
   * @param {number} params.page - Numéro de page
   * @returns {Promise<{movies: Array, totalResults: number, totalPages: number}>}
   */
  async searchMovies({ query, page = 1 } = {}) {
    try {
      const response = await api.get('/search/movie', {
        params: { query, page }
      })
      
      // Formater les résultats
      const movies = response.data.results.map(movie => {
        // Gestion spéciale pour "Take the Money and Run"
        let posterUrl = null;
        if (movie.id === 1441966 || movie.id === '1441966') {
          posterUrl = `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg`;
        } else {
          posterUrl = getSafeImageUrl(movie.poster_path, movie.backdrop_path);
        }
        
        return {
          imdbID: movie.id.toString(),
          Title: movie.title,
          Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
          Poster: posterUrl,
          directPosterUrl: movie.id === 1441966 ? `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg` : null,
          // Ajouter d'autres propriétés TMDB
          voteAverage: movie.vote_average,
          overview: movie.overview,
          backdropPath: getSafeImageUrl(movie.backdrop_path, null, 'large', 'backdrop'),
          // Conserver les chemins originaux
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path
        }
      })
      
      return {
        movies,
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages
      }
    } catch (error) {
      console.error('Error searching movies:', error)
      throw error
    }
  },
  
  /**
   * Récupère les détails d'un film
   * @param {string} id - ID TMDB du film
   * @returns {Promise<Object>}
   */
  async getMovieById(id) {
    try {
      const response = await api.get(`/movie/${id}`, {
        params: {
          append_to_response: 'credits,videos,reviews'
        }
      })
      
      // Log pour déboguer les détails du film
      console.log(`Détails bruts du film ${id}:`, response.data);
      
      // Gestion spéciale pour "Take the Money and Run"
      let posterUrl = null;
      if (id === '1441966' || id === 1441966) {
        posterUrl = `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg`;
      } else {
        posterUrl = getSafeImageUrl(response.data.poster_path, response.data.backdrop_path);
      }
      
      // Formater la réponse pour être compatible avec notre application
      const movie = {
        imdbID: response.data.id.toString(),
        Title: response.data.title,
        Year: response.data.release_date ? response.data.release_date.substring(0, 4) : 'N/A',
        Rated: response.data.adult ? 'R' : 'PG-13',
        Released: response.data.release_date,
        Runtime: `${response.data.runtime} min`,
        Genre: response.data.genres.map(g => g.name).join(', '),
        Director: response.data.credits.crew
          .filter(person => person.job === 'Director')
          .map(person => person.name)
          .join(', '),
        Writer: response.data.credits.crew
          .filter(person => ['Screenplay', 'Writer'].includes(person.job))
          .map(person => person.name)
          .join(', '),
        Actors: response.data.credits.cast
          .slice(0, 5)
          .map(person => person.name)
          .join(', '),
        Plot: response.data.overview,
        Language: response.data.spoken_languages.map(lang => lang.english_name).join(', '),
        Country: response.data.production_countries.map(country => country.name).join(', '),
        Poster: posterUrl,
        directPosterUrl: id === '1441966' ? `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg` : null,
        Ratings: [
          {
            Source: 'TMDB',
            Value: `${response.data.vote_average}/10`
          }
        ],
        imdbRating: (response.data.vote_average / 2).toFixed(1),
        // Ajouter d'autres propriétés TMDB
        backdrop: getSafeImageUrl(response.data.backdrop_path, null, 'large', 'backdrop'),
        budget: response.data.budget,
        revenue: response.data.revenue,
        videos: response.data.videos.results,
        reviews: response.data.reviews.results,
        cast: response.data.credits.cast,
        crew: response.data.credits.crew,
        // Conserver les chemins originaux
        poster_path: response.data.poster_path,
        backdrop_path: response.data.backdrop_path
      }
      
      return movie
    } catch (error) {
      console.error(`Error fetching movie ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Récupère les films à l'affiche
   */
  async getNowPlayingMovies({ page = 1 } = {}) {
    try {
      const response = await api.get('/movie/now_playing', {
        params: { page }
      })
      
      // Formater les résultats
      const movies = response.data.results.map(movie => {
        // Gestion spéciale pour "Take the Money and Run"
        let posterUrl = null;
        if (movie.id === 1441966 || movie.id === '1441966') {
          posterUrl = `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg`;
        } else {
          posterUrl = getSafeImageUrl(movie.poster_path, movie.backdrop_path);
        }
        
        return {
          imdbID: movie.id.toString(),
          Title: movie.title,
          Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
          Poster: posterUrl,
          directPosterUrl: movie.id === 1441966 ? `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg` : null,
          voteAverage: movie.vote_average,
          overview: movie.overview,
          backdropPath: getSafeImageUrl(movie.backdrop_path, null, 'large', 'backdrop'),
          // Conserver les chemins originaux
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path
        }
      })
      
      return {
        movies,
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages
      }
    } catch (error) {
      console.error('Error fetching now playing movies:', error)
      throw error
    }
  },
  
  /**
   * Récupère les films par genre
   */
  async getMoviesByGenre({ genreId, page = 1 } = {}) {
    try {
      const response = await api.get('/discover/movie', {
        params: { with_genres: genreId, page }
      })
      
      // Formater les résultats
      const movies = response.data.results.map(movie => {
        // Gestion spéciale pour "Take the Money and Run"
        let posterUrl = null;
        if (movie.id === 1441966 || movie.id === '1441966') {
          posterUrl = `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg`;
        } else {
          posterUrl = getSafeImageUrl(movie.poster_path, movie.backdrop_path);
        }
        
        return {
          imdbID: movie.id.toString(),
          Title: movie.title,
          Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
          Poster: posterUrl,
          directPosterUrl: movie.id === 1441966 ? `https://image.tmdb.org/t/p/w500/fJkxQQd65iR6BMcYOxNgWwWibPu.jpg` : null,
          voteAverage: movie.vote_average,
          overview: movie.overview,
          backdropPath: getSafeImageUrl(movie.backdrop_path, null, 'large', 'backdrop'),
          // Conserver les chemins originaux
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path
        }
      })
      
      return {
        movies,
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages
      }
    } catch (error) {
      console.error('Error fetching movies by genre:', error)
      throw error
    }
  },
  
  /**
   * Récupère tous les genres
   */
  async getGenres() {
    try {
      const response = await api.get('/genre/movie/list')
      return response.data.genres
    } catch (error) {
      console.error('Error fetching genres:', error)
      throw error
    }
  }
}

export default moviesService