<template>
  <div class="movie-details">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des détails du film...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchMovieDetails" class="btn">Réessayer</button>
      <router-link to="/" class="btn secondary">Retour à l'accueil</router-link>
    </div>
    
    <div v-else-if="movie" class="movie-content">
      <!-- En-tête avec backdrop -->
      <div class="movie-backdrop" v-if="movie.backdrop">
        <img :src="movie.backdrop" :alt="movie.Title" />
        <div class="backdrop-gradient"></div>
      </div>
      
      <div class="movie-header">
        <div class="poster-container">
          <img 
            :src="movie.Poster !== 'N/A' ? movie.Poster : '/images/placeholder-movie.jpg'" 
            :alt="movie.Title" 
            class="movie-poster"
            @error="handleImageError"
          />
        </div>
        
        <div class="movie-info">
          <h1 class="movie-title">{{ movie.Title }}</h1>
          <p class="movie-meta">{{ movie.Year }} | {{ movie.Runtime }} | {{ movie.Rated }}</p>
          
          <div class="movie-genres">
            <span v-for="(genre, index) in movieGenres" :key="index" class="genre-tag">
              {{ genre }}
            </span>
          </div>
          
          <div class="movie-ratings">
            <div v-for="(rating, index) in movie.Ratings" :key="index" class="rating">
              <span class="rating-source">{{ rating.Source }}:</span>
              <span class="rating-value">{{ rating.Value }}</span>
            </div>
          </div>
          
          <div class="movie-crew">
            <p><strong>Réalisateur:</strong> {{ movie.Director }}</p>
            <p><strong>Scénariste:</strong> {{ movie.Writer }}</p>
            <p><strong>Acteurs:</strong> {{ movie.Actors }}</p>
          </div>
          
          <div class="movie-actions">
            <button 
              v-if="isLoggedIn" 
              @click="showBookingForm = true" 
              class="btn booking-btn"
            >
              <span class="icon">🎟️</span> Réserver une séance
            </button>
            <button
              v-if="isLoggedIn"
              @click="toggleFavorite"
              class="btn favorite-btn"
              :class="{ 'is-favorite': isFavorite }"
            >
              <span class="icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
              {{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
            </button>
            <router-link v-if="!isLoggedIn" :to="`/login?redirect=movie&id=${$route.params.id}`" class="btn secondary">
              Connectez-vous pour réserver
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="movie-synopsis">
        <h2>Synopsis</h2>
        <p>{{ movie.Plot }}</p>
      </div>
      
      <!-- Bande-annonce -->
      <div v-if="trailerKey" class="movie-trailer">
        <h2>Bande-annonce</h2>
        <div class="video-container">
          <iframe 
            :src="`https://www.youtube.com/embed/${trailerKey}`" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </div>
      
      <!-- Casting -->
      <div v-if="movie.cast && movie.cast.length" class="movie-cast">
        <h2>Casting</h2>
        <div class="cast-grid">
          <div 
            v-for="actor in movie.cast.slice(0, 6)" 
            :key="actor.id" 
            class="cast-card"
            @click="showActorInfo(actor)"
          >
            <img 
              :src="actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/images/placeholder-person.jpg'" 
              :alt="actor.name" 
              @error="handleImageError"
            />
            <div class="cast-info">
              <p class="actor-name">{{ actor.name }}</p>
              <p class="character-name">{{ actor.character }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Films similaires -->
      <div v-if="movie.similar && movie.similar.length" class="similar-movies">
        <h2>Films similaires</h2>
        <div class="similar-carousel">
          <div 
            v-for="similarMovie in movie.similar.slice(0, 6)" 
            :key="similarMovie.id" 
            class="similar-movie" 
            @click="goToMovie(similarMovie.id)"
          >
            <img 
              :src="similarMovie.poster_path ? `https://image.tmdb.org/t/p/w185${similarMovie.poster_path}` : '/images/placeholder-movie.jpg'" 
              :alt="similarMovie.title" 
              @error="handleImageError"
            />
            <div class="similar-info">
              <p class="similar-title">{{ similarMovie.title }}</p>
              <p class="similar-year">{{ new Date(similarMovie.release_date).getFullYear() }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Avis -->
      <div class="movie-reviews">
        <h2>Avis des spectateurs</h2>
        
        <!-- Section pour ajouter un avis -->
        <div v-if="isLoggedIn" class="add-review">
          <form @submit.prevent="submitReview" class="review-form">
            <div class="rating-input">
              <span>Votre note :</span>
              <div class="star-rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star"
                  :class="{ 'active': star <= newReview.rating }"
                  @click="newReview.rating = star"
                >★</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="review-content">Votre avis :</label>
              <textarea
                id="review-content"
                v-model="newReview.content"
                rows="4"
                placeholder="Partagez votre opinion sur ce film..."
                required
              ></textarea>
            </div>
            
            <button type="submit" class="btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Envoi en cours...' : 'Publier' }}
            </button>
          </form>
        </div>
        
        <!-- Liste des avis -->
        <div v-if="movie.reviews && movie.reviews.length" class="reviews-list">
          <div v-for="review in movie.reviews" :key="review.id" class="review-card">
            <div class="review-header">
              <div class="user-info">
                <div class="avatar" v-if="!review.author_details?.avatar_path">
                  {{ review.author ? review.author.charAt(0).toUpperCase() : 'U' }}
                </div>
                <img 
                  v-else 
                  :src="`https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`" 
                  class="avatar-img" 
                  @error="handleImageError"
                />
                <div class="user-details">
                  <p class="username">{{ review.author || 'Utilisateur' }}</p>
                  <p class="review-date">{{ formatDate(review.created_at) }}</p>
                </div>
              </div>
              <div class="review-rating" v-if="review.author_details?.rating">
                <span class="star">★</span>
                <span>{{ review.author_details.rating }}/10</span>
              </div>
            </div>
            
            <p class="review-text">
              {{ review.content && review.content.length > 300 
                ? review.content.substring(0, 300) + '...' 
                : (review.content || '') }}
            </p>
            
            <button 
              v-if="review.content && review.content.length > 300" 
              @click="expandReview(review)"
              class="read-more"
            >
              Lire la suite
            </button>
          </div>
        </div>
        
        <div v-else class="no-reviews">
          <p>Aucun avis pour le moment. Soyez le premier à donner votre opinion !</p>
        </div>
        
        <div class="login-prompt" v-if="!isLoggedIn">
          <router-link :to="`/login?redirect=movie&id=${$route.params.id}`" class="btn secondary">
            Connectez-vous pour laisser un avis
          </router-link>
        </div>
      </div>
      
      <!-- Modal de réservation -->
      <TicketBooking 
        v-if="showBookingForm" 
        :movie="movie"
        :is-authenticated="isLoggedIn"
        @close="showBookingForm = false"
        @book="bookTicket"
      />
      
      <!-- Modal d'affichage d'un avis complet -->
      <div v-if="selectedReview" class="modal-overlay" @click.self="selectedReview = null">
        <div class="modal-content review-modal">
          <div class="modal-header">
            <h3>Avis de {{ selectedReview.author }}</h3>
            <button @click="selectedReview = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="review-header">
              <div class="user-info">
                <div class="avatar" v-if="!selectedReview.author_details?.avatar_path">
                  {{ selectedReview.author ? selectedReview.author.charAt(0).toUpperCase() : 'U' }}
                </div>
                <img 
                  v-else 
                  :src="`https://image.tmdb.org/t/p/w45${selectedReview.author_details.avatar_path}`" 
                  class="avatar-img" 
                />
                <div class="user-details">
                  <p class="username">{{ selectedReview.author || 'Utilisateur' }}</p>
                  <p class="review-date">{{ formatDate(selectedReview.created_at) }}</p>
                </div>
              </div>
              <div class="review-rating" v-if="selectedReview.author_details?.rating">
                <span class="star">★</span>
                <span>{{ selectedReview.author_details.rating }}/10</span>
              </div>
            </div>
            <p class="review-text full-review">{{ selectedReview.content }}</p>
          </div>
        </div>
      </div>
      
      <!-- Modal d'affichage des informations d'un acteur -->
      <div v-if="selectedActor" class="modal-overlay" @click.self="selectedActor = null">
        <div class="modal-content actor-modal">
          <div class="modal-header">
            <h3>{{ selectedActor.name }}</h3>
            <button @click="selectedActor = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body actor-details">
            <div class="actor-profile">
              <img 
                :src="selectedActor.profile_path ? `https://image.tmdb.org/t/p/w300${selectedActor.profile_path}` : '/images/placeholder-person.jpg'" 
                :alt="selectedActor.name" 
              />
              <div class="actor-info">
                <p v-if="selectedActor.birthday"><strong>Date de naissance:</strong> {{ formatDate(selectedActor.birthday) }}</p>
                <p v-if="selectedActor.place_of_birth"><strong>Lieu de naissance:</strong> {{ selectedActor.place_of_birth }}</p>
                <p><strong>Rôle dans ce film:</strong> {{ selectedActor.character }}</p>
              </div>
            </div>
            <div v-if="selectedActor.biography" class="actor-bio">
              <h4>Biographie</h4>
              <p>{{ selectedActor.biography }}</p>
            </div>
            <div v-if="selectedActor.known_for && selectedActor.known_for.length" class="actor-filmography">
              <h4>Connu pour</h4>
              <div class="filmography-grid">
                <div 
                  v-for="film in selectedActor.known_for.slice(0, 4)" 
                  :key="film.id" 
                  class="filmography-item"
                  @click="goToMovie(film.id)"
                >
                  <img 
                    :src="film.poster_path ? `https://image.tmdb.org/t/p/w92${film.poster_path}` : '/images/placeholder-movie.jpg'" 
                    :alt="film.title || film.name" 
                  />
                  <p>{{ film.title || film.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TicketBooking from '@/components/TicketBooking.vue'
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'MovieDetails',
  components: {
    TicketBooking
  },
  data() {
    return {
      showBookingForm: false,
      selectedReview: null,
      selectedActor: null,
      newReview: {
        rating: 0,
        content: ''
      },
      isSubmitting: false,
      isFavorite: false,
      notFoundImage: '/images/placeholder-movie.jpg'
    }
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn', 'currentUser']),
    ...mapState('movies', {
      movie: 'currentMovie',
      loading: 'detailsLoading',
      error: 'detailsError'
    }),
    movieGenres() {
      return this.movie && this.movie.Genre 
        ? this.movie.Genre.split(', ') 
        : []
    },
    trailerKey() {
      if (this.movie && this.movie.videos && this.movie.videos.length) {
        const trailer = this.movie.videos.find(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        );
        return trailer ? trailer.key : null;
      }
      return null;
    }
  },
  methods: {
    ...mapActions('movies', ['fetchMovieDetails', 'addFavorite', 'removeFavorite']),
    ...mapActions('cart', ['addToCart']),
    ...mapActions('reviews', ['submitMovieReview']),
    
    bookTicket(ticket) {
      console.log('Ticket réservé avec succès:', ticket);
      
     /* this.addToCart({
        movieId: this.movie.imdbID,
        movieTitle: this.movie.Title,
        moviePoster: this.movie.Poster,
        ...ticket
      });*/
      
      // Fermer le modal
      this.showBookingForm = false;
      
      // Rediriger vers le panier
      this.$router.push('/cart');
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    
    expandReview(review) {
      this.selectedReview = review;
    },
    
    async showActorInfo(actor) {
      this.selectedActor = actor;
      
      // Charger plus d'informations sur l'acteur si nécessaire
      if (!actor.biography && this.isLoggedIn) {
        try {
          const actorDetails = await this.$store.dispatch('movies/fetchActorDetails', actor.id);
          this.selectedActor = { ...this.selectedActor, ...actorDetails };
        } catch (error) {
          console.error('Erreur lors du chargement des détails de l\'acteur:', error);
        }
      }
    },
    
    goToMovie(movieId) {
      // Rediriger vers la page du film en utilisant l'ID TMDB
      this.$router.push({ name: 'movie', params: { id: movieId } });
    },
    
    async submitReview() {
      if (!this.isLoggedIn) {
        this.$router.push(`/login?redirect=movie&id=${this.$route.params.id}`);
        return;
      }
      
      if (this.newReview.rating === 0) {
        this.$toasted.error('Veuillez attribuer une note au film');
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        await this.submitMovieReview({
          movieId: this.movie.imdbID,
          review: this.newReview
        });
        
        // Rafraîchir les détails du film pour obtenir le nouvel avis
        await this.fetchMovieDetails(this.movie.imdbID);
        
        // Réinitialiser le formulaire
        this.newReview = {
          rating: 0,
          content: ''
        };
        
        this.$toasted.success('Votre avis a été publié avec succès');
      } catch (error) {
        console.error('Erreur lors de la soumission de l\'avis:', error);
        this.$toasted.error('Une erreur est survenue lors de la publication de votre avis');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    async toggleFavorite() {
      if (!this.isLoggedIn) {
        this.$router.push(`/login?redirect=movie&id=${this.$route.params.id}`);
        return;
      }
      
      try {
        if (this.isFavorite) {
          await this.removeFavorite(this.movie.imdbID);
          this.isFavorite = false;
          this.$toasted.show('Film retiré des favoris');
        } else {
          await this.addFavorite({
            movieId: this.movie.imdbID,
            title: this.movie.Title,
            poster: this.movie.Poster,
            year: this.movie.Year
          });
          this.isFavorite = true;
          this.$toasted.show('Film ajouté aux favoris');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des favoris:', error);
        this.$toasted.error('Une erreur est survenue');
      }
    },
    
    handleImageError(e) {
      e.target.src = this.notFoundImage;
    },
    
    async checkFavoriteStatus() {
      if (!this.isLoggedIn || !this.movie) return;
      
      try {
        const favorites = await this.$store.dispatch('movies/getFavorites');
        this.isFavorite = favorites.some(fav => fav.movieId === this.movie.imdbID);
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
      }
    }
  },
  watch: {
    movie() {
      // Vérifier si le film est dans les favoris quand le film change
      this.checkFavoriteStatus();
      
      // Réinitialiser l'état des modals
      this.selectedReview = null;
      this.selectedActor = null;
      
      // Scroll en haut de la page
      window.scrollTo(0, 0);
    }
  },
  created() {
    const movieId = this.$route.params.id;
    console.log('MovieDetails created - ID:', movieId);
    console.log('État de connexion:', this.isLoggedIn);
    
    if (movieId) {
      console.log('Appel de fetchMovieDetails avec ID:', movieId);
      this.fetchMovieDetails(movieId)
        .then(movie => {
          console.log('Film chargé avec succès:', movie);
          this.checkFavoriteStatus();
        })
        .catch(error => {
          console.error('Erreur lors du chargement du film:', error);
        });
    } else {
      console.warn('Aucun ID de film trouvé dans les paramètres de route');
    }
  }
}
</script>

<style scoped>
.movie-details {
  padding: 1rem 0;
}

.movie-content {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.movie-backdrop {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
}

.movie-backdrop img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}

.backdrop-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
}

.movie-header {
  display: flex;
  padding: 2rem;
  background-color: #f9f9f9;
}

.poster-container {
  flex: 0 0 300px;
  margin-right: 2rem;
}

.movie-poster {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.movie-info {
  flex: 1;
}

.movie-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.movie-meta {
  color: #666;
  margin-bottom: 1rem;
}

.movie-genres {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.genre-tag {
  background-color: #e50914;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.movie-ratings {
  margin-bottom: 1.5rem;
}

.rating {
  display: inline-block;
  margin-right: 1.5rem;
  margin-bottom: 0.5rem;
}

.rating-source {
  font-weight: bold;
  margin-right: 0.3rem;
}

.movie-crew {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.movie-actions {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.movie-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.booking-btn {
  background-color: #e50914;
}

.booking-btn:hover {
  background-color: #f40612;
}

.favorite-btn {
  background-color: #333;
}

.favorite-btn:hover {
  background-color: #555;
}

.favorite-btn.is-favorite {
  background-color: #e50914;
}

.favorite-btn.is-favorite:hover {
  background-color: #f40612;
}

.movie-synopsis, .movie-reviews, .movie-trailer, .movie-cast, .similar-movies {
  padding: 2rem;
  border-top: 1px solid #eee;
}

.movie-synopsis h2, .movie-reviews h2, .movie-trailer h2, .movie-cast h2, .similar-movies h2 {
  margin-bottom: 1rem;
  color: #333;
}

.movie-synopsis p {
  line-height: 1.6;
  color: #444;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  margin-top: 1rem;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.cast-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cast-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.cast-card img {
  width: 100%;
  height: 225px;
  object-fit: cover;
}

.cast-info {
  padding: 0.8rem;
}

.actor-name {
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.character-name {
  font-size: 0.9rem;
  color: #666;
}

.similar-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.similar-movie {
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.similar-movie:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.similar-movie img {
  width: 100%;
  height: 225px;
  object-fit: cover;
}

.similar-info {
  padding: 0.8rem;
}

.similar-title {
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.similar-year {
  font-size: 0.9rem;
  color: #666;
}

.add-review {
  margin-bottom: 2rem;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.star-rating {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1.5rem;
  color: #ddd;
  cursor: pointer;
}

.star:hover, .star.active {
  color: #f5c518;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

textarea {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
}

textarea:focus {
  outline: none;
  border-color: #e50914;
  box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e50914;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.review-date {
  font-size: 0.8rem;
  color: #777;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
}

.review-rating .star {
  color: #f5c518;
  font-size: 1.2rem;
  cursor: default;
}

.review-text {
  line-height: 1.6;
  color: #444;
  margin-bottom: 0.5rem;
}

.read-more {
  background: none;
  border: none;
  color: #e50914;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9rem;
}

.read-more:hover {
  color: #f40612;
}

.no-reviews {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

.login-prompt {
  margin-top: 1.5rem;
  text-align: center;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #777;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.full-review {
  white-space: pre-line;
}

.actor-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actor-profile {
  display: flex;
  gap: 1.5rem;
}

.actor-profile img {
  width: 150px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.actor-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.actor-bio h4, .actor-filmography h4 {
  margin-bottom: 0.8rem;
  color: #333;
}

.actor-bio p {
  line-height: 1.6;
  color: #444;
}

.filmography-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.filmography-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.filmography-item img {
  width: 92px;
  height: 138px;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  object-fit: cover;
}

.filmography-item p {
  font-size: 0.8rem;
  max-width: 92px;
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
  text-align: center;
}

.btn:hover {
  background-color: #f40612;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn.secondary {
  background-color: #333;
}

.btn.secondary:hover {
  background-color: #555;
}

/* Responsive design */
@media (max-width: 768px) {
  .movie-header {
    flex-direction: column;
  }
  
  .poster-container {
    flex: 0 0 auto;
    margin-right: 0;
    margin-bottom: 2rem;
    max-width: 250px;
    margin: 0 auto 2rem;
  }
  
  .movie-synopsis, .movie-reviews, .movie-trailer, .movie-cast, .similar-movies {
    padding: 1.5rem;
  }
  
  .actor-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .rating-input {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .movie-actions {
    flex-direction: column;
  }
  
  .movie-actions .btn {
    width: 100%;
  }
  
  .cast-grid, .similar-carousel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .review-rating {
    margin-top: 0.5rem;
  }
}
</style>