<template>
    <div class="reviews-list">
      <div v-if="loading" class="loading">
        <div class="spinner-small"></div>
        <p>Chargement des avis...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchReviews" class="btn-small">Réessayer</button>
      </div>
      
      <div v-else-if="reviews.length === 0" class="no-reviews">
        <p>Aucun avis pour ce film.</p>
      </div>
      
      <div v-else class="reviews-container">
        <div v-for="review in reviews" :key="review._id" class="review-card">
          <div class="review-header">
            <div class="user-info">
              <div class="avatar">{{ review.username.charAt(0).toUpperCase() }}</div>
              <div class="user-details">
                <p class="username">{{ review.username }}</p>
                <p class="review-date">{{ formatDate(review.createdAt) }}</p>
              </div>
            </div>
            <div class="rating">
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
              </div>
            </div>
          </div>
          <p class="review-text">{{ review.comment }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  
  export default {
    name: 'ReviewsList',
    props: {
      movieId: {
        type: String,
        required: true
      }
    },
    computed: {
      ...mapState('reviews', {
        reviews: state => state.reviews,
        loading: state => state.loading,
        error: state => state.error
      })
    },
    methods: {
      ...mapActions('reviews', ['fetchReviews']),
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        return new Date(dateString).toLocaleDateString('fr-FR', options)
      }
    },
    mounted() {
      this.fetchReviews(this.movieId)
    }
  }
  </script>
  
  <style scoped>
  .reviews-list {
    margin-top: 1rem;
  }
  
  .reviews-container {
    margin-top: 1.5rem;
  }
  
  .review-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
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
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    background-color: #e50914;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
  }
  
  .username {
    font-weight: 600;
    margin-bottom: 0.2rem;
  }
  
  .review-date {
    font-size: 0.8rem;
    color: #777;
  }
  
  .rating {
    flex-shrink: 0;
  }
  
  .stars {
    display: flex;
  }
  
  .star {
    color: #ddd;
    font-size: 1.2rem;
    margin-left: 0.2rem;
  }
  
  .star.filled {
    color: #ffc107;
  }
  
  .review-text {
    line-height: 1.6;
    color: #444;
  }
  
  .loading, .error, .no-reviews {
    text-align: center;
    padding: 1.5rem;
    color: #666;
  }
  
  .spinner-small {
    display: inline-block;
    width: 30px;
    height: 30px;
    border: 3px solid rgba(229, 9, 20, 0.3);
    border-radius: 50%;
    border-top-color: #e50914;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 0.5rem;
  }
  
  .btn-small {
    padding: 0.3rem 0.8rem;
    background-color: #e50914;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  </style>