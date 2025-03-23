<template>
    <div class="review-form-container">
      <h3>Laisser un avis</h3>
      <form @submit.prevent="submitReview" class="review-form">
        <div class="rating-input">
          <label>Votre note:</label>
          <div class="stars-input">
            <span 
              v-for="star in 5" 
              :key="star" 
              class="star" 
              :class="{ filled: star <= rating }"
              @click="rating = star"
              @mouseover="hoverRating = star"
              @mouseleave="hoverRating = 0"
            >
              ★
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="comment">Votre commentaire:</label>
          <textarea 
            id="comment" 
            v-model="comment" 
            rows="4" 
            placeholder="Partagez votre avis sur ce film..."
            required
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn" 
            :disabled="submitting || !isValid"
          >
            <span v-if="submitting">Envoi en cours...</span>
            <span v-else>Publier mon avis</span>
          </button>
        </div>
        
        <div v-if="error" class="form-error">
          {{ error }}
        </div>
        
        <div v-if="success" class="form-success">
          Votre avis a été publié avec succès !
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { mapActions, mapState } from 'vuex'
  
  export default {
    name: 'ReviewForm',
    props: {
      movieId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        rating: 0,
        hoverRating: 0,
        comment: '',
        submitting: false,
        success: false,
        error: null
      }
    },
    computed: {
      ...mapState('auth', ['user']),
      isValid() {
        return this.rating > 0 && this.comment.trim().length > 0
      }
    },
    methods: {
      ...mapActions('reviews', ['addReview']),
      async submitReview() {
        if (!this.isValid) return
        
        this.submitting = true
        this.error = null
        this.success = false
        
        try {
          await this.addReview({
            movieId: this.movieId,
            rating: this.rating,
            comment: this.comment
          })
          
          // Réinitialiser le formulaire
          this.rating = 0
          this.comment = ''
          this.success = true
          
          // Masquer le message de succès après 3 secondes
          setTimeout(() => {
            this.success = false
          }, 3000)
        } catch (err) {
          this.error = err.message || 'Une erreur est survenue. Veuillez réessayer.'
        } finally {
          this.submitting = false
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .review-form-container {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  h3 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .review-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .rating-input {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .stars-input {
    display: flex;
  }
  
  .star {
    font-size: 1.5rem;
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .star.filled {
    color: #ffc107;
  }
  
  .star:hover {
    transform: scale(1.1);
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 600;
    color: #444;
  }
  
  textarea {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    font-size: 1rem;
  }
  
  textarea:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
  }
  
  .btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .form-error {
    color: #e50914;
    font-size: 0.9rem;
  }
  
  .form-success {
    color: #28a745;
    font-size: 0.9rem;
  }
  </style>