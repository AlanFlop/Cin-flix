<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Réserver pour "{{ movie.Title }}"</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <form @submit.prevent="bookTicket" class="booking-form">
        <div class="form-group">
          <label for="date">Date:</label>
          <select 
            id="date" 
            v-model="booking.date" 
            required
            @change="resetTime"
          >
            <option value="" disabled>Sélectionnez une date</option>
            <option v-for="date in availableDates" :key="date.value" :value="date.value">
              {{ date.label }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="time">Heure:</label>
          <select 
            id="time" 
            v-model="booking.time" 
            required
            :disabled="!booking.date"
          >
            <option value="" disabled>Sélectionnez une heure</option>
            <option v-for="time in availableTimes" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="quantity">Nombre de places:</label>
          <div class="quantity-control">
            <button 
              type="button" 
              class="quantity-btn" 
              @click="decrementQuantity" 
              :disabled="booking.quantity <= 1"
            >-</button>
            
            <input 
              id="quantity" 
              type="number" 
              v-model.number="booking.quantity" 
              min="1" 
              max="10"
              required
            />
            
            <button 
              type="button" 
              class="quantity-btn" 
              @click="incrementQuantity"
              :disabled="booking.quantity >= 10"
            >+</button>
          </div>
        </div>
        
        <div class="price-summary">
          <div class="price-item">
            <span>Prix unitaire:</span>
            <span>{{ formatPrice(ticketPrice) }}</span>
          </div>
          <div class="price-item">
            <span>Total:</span>
            <span class="total-price">{{ formatPrice(totalPrice) }}</span>
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn secondary" @click="$emit('close')">Annuler</button>
          <button type="submit" class="btn" :disabled="isLoading">
            <span v-if="isLoading">Traitement en cours...</span>
            <span v-else>Ajouter au panier</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'TicketBooking',
  props: {
    movie: {
      type: Object,
      required: true
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ticketPrice: 12.50,
      booking: {
        date: '',
        time: '',
        quantity: 1
      },
      error: null,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn', 'currentUser']),
    availableDates() {
      // Générer les dates pour les 14 prochains jours
      const dates = []
      const today = new Date()
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        const value = date.toISOString().split('T')[0]
        const options = { weekday: 'long', day: 'numeric', month: 'long' }
        const label = date.toLocaleDateString('fr-FR', options)
        
        dates.push({ value, label })
      }
      
      return dates
    },
    availableTimes() {
      // Horaires différents selon le jour de la semaine
      if (!this.booking.date) return [];
      
      const date = new Date(this.booking.date);
      const dayOfWeek = date.getDay(); // 0 = dimanche, 6 = samedi
      
      // Weekend (vendredi, samedi, dimanche)
      if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
        return ['10:30', '13:00', '15:30', '18:00', '20:30', '22:45'];
      }
      
      // Jours de semaine
      return ['14:00', '16:30', '19:00', '21:30'];
    },
    totalPrice() {
      return this.ticketPrice * this.booking.quantity
    }
  },
  methods: {
    ...mapActions('cart', ['addToCart']),
    resetTime() {
      this.booking.time = ''
    },
    decrementQuantity() {
      if (this.booking.quantity > 1) {
        this.booking.quantity--
      }
    },
    incrementQuantity() {
      if (this.booking.quantity < 10) {
        this.booking.quantity++
      }
    },
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    async bookTicket() {
      // Vérifier l'authentification
      if (!this.isAuthenticated) {
        this.$emit('close');
        this.$router.push(`/login?redirect=movie&id=${this.$route.params.id}`);
        return;
      }
      
      // Validation des champs
      if (!this.booking.date || !this.booking.time || this.booking.quantity < 1) {
        this.error = "Veuillez remplir tous les champs";
        return;
      }

      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Tentative de réservation pour le film:', this.movie.Title);
        
        // Créer l'objet de réservation
        const bookingData = {
          id: Date.now().toString(), // ID unique pour le panier
          movieId: this.movie.imdbID,
          movieTitle: this.movie.Title,
          moviePoster: this.movie.Poster,
          date: this.booking.date,
          time: this.booking.time,
          quantity: this.booking.quantity,
          pricePerTicket: this.ticketPrice,
          totalPrice: this.totalPrice
        };
        
        // Ajouter directement au panier via le store
        this.addToCart(bookingData);
        console.log('Réservation ajoutée au panier avec succès');
        
        // Émettre l'événement pour le composant parent
        this.$emit('book', bookingData);
        
        // Fermer le modal
        this.$emit('close');
      } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        this.error = "Une erreur est survenue lors de la réservation. Veuillez réessayer.";
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    // Initialiser avec la date d'aujourd'hui
    if (this.availableDates.length > 0) {
      this.booking.date = this.availableDates[0].value;
    }
  }
}
</script>

<style scoped>
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
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
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

.modal-header h2 {
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

.booking-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #444;
}

select, input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

select:focus, input:focus {
  outline: none;
  border-color: #e50914;
  box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quantity-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.quantity-btn:last-child {
  border-radius: 0 4px 4px 0;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input[type="number"] {
  width: 60px;
  text-align: center;
  border-left: none;
  border-right: none;
  border-radius: 0;
}

/* Supprime les flèches du input number */
input[type="number"]::-webkit-inner-spin-button, 
input[type="number"]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

.price-summary {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-item:last-child {
  margin-bottom: 0;
  padding-top: 0.5rem;
  border-top: 1px solid #ddd;
  font-weight: 600;
}

.total-price {
  color: #e50914;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
}

.btn:hover {
  background-color: #f40612;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn.secondary {
  background-color: #777;
}

.btn.secondary:hover {
  background-color: #555;
}

.error-message {
  color: #e50914;
  background-color: #ffebee;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Ajout d'une animation d'entrée pour le modal */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-overlay {
  animation: fadeIn 0.3s ease;
}

/* Responsive design */
@media (max-width: 576px) {
  .modal-content {
    width: 90%;
    max-height: 80vh;
  }
  
  .modal-header h2 {
    font-size: 1.2rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>