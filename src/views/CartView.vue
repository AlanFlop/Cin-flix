<template>
  <div class="cart-view">
    <h1>Mon panier</h1>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement du panier...</p>
    </div>
    
    <div v-else-if="isEmpty" class="empty-cart">
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Parcourez nos films et ajoutez des billets à votre panier.</p>
        <router-link to="/" class="btn">Parcourir les films</router-link>
      </div>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
          <div class="item-poster">
            <img :src="getPosterUrl(item)" :alt="item.movieTitle">
          </div>
          
          <div class="item-details">
            <h3 class="item-title">{{ item.movieTitle }}</h3>
            <p class="item-session">{{ formatDate(item.date) }} à {{ item.time }}</p>
            
            <div class="item-quantity">
              <label>Quantité:</label>
              <div class="quantity-control">
                <button 
                  @click="updateQuantity(index, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                  class="qty-btn"
                >-</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(index, item.quantity + 1)"
                  :disabled="item.quantity >= 10"
                  class="qty-btn"
                >+</button>
              </div>
            </div>
          </div>
          
          <div class="item-price">
            <p class="price-value">{{ formatPrice(item.totalPrice) }}</p>
            <button @click="removeItem(index)" class="remove-btn">
              Supprimer
            </button>
          </div>
        </div>
      </div>
      
      <div class="cart-summary">
        <h2>Récapitulatif</h2>
        <div class="summary-line">
          <span>Sous-total:</span>
          <span>{{ formatPrice(cartTotal) }}</span>
        </div>
        <div class="summary-line">
          <span>Taxes:</span>
          <span>{{ formatPrice(taxes) }}</span>
        </div>
        <div class="summary-line total">
          <span>Total:</span>
          <span>{{ formatPrice(orderTotal) }}</span>
        </div>
        
        <div class="checkout-actions">
          <button @click="processCheckout" class="btn checkout-btn" :disabled="checkoutLoading">
            {{ checkoutLoading ? 'Traitement en cours...' : 'Finaliser la commande' }}
          </button>
          <router-link to="/" class="btn secondary">Continuer mes achats</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'CartView',
  data() {
    return {
      loading: false,
      checkoutLoading: false,
      error: null
    }
  },
  computed: {
    ...mapState('cart', {
      cartItems: state => state.items || [] // Ajout d'une valeur par défaut
    }),
    ...mapGetters('auth', ['isLoggedIn', 'currentUser']),
    ...mapGetters('cart', ['isEmpty', 'cartTotal']),
    taxes() {
      // TVA à 20%
      return this.cartTotal * 0.2
    },
    orderTotal() {
      return this.cartTotal + this.taxes
    }
  },
  methods: {
    ...mapActions('cart', ['updateCartItem', 'removeFromCart', 'checkout']),
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    formatDate(dateString) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', options)
    },
    getPosterUrl(item) {
      if (!item.moviePoster || item.moviePoster === 'N/A') {
        return 'https://via.placeholder.com/150x225?text=No+Image'
      }
      return item.moviePoster
    },
    updateQuantity(index, quantity) {
      if (quantity >= 1 && quantity <= 10) {
        this.updateCartItem({ index, quantity })
      }
    },
    removeItem(index) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet article du panier ?')) {
        this.removeFromCart(index)
      }
    },
    async processCheckout() {
      if (!this.isLoggedIn) {
        // Rediriger vers la page de connexion avec un paramètre pour revenir au panier
        this.$router.push('/login?redirect=cart')
        return
      }
      
      this.checkoutLoading = true
      
      try {
        // Vérifier que l'utilisateur est connecté et a un ID
        if (!this.currentUser || !this.currentUser.id) {
          throw new Error('Veuillez vous reconnecter pour continuer')
        }
        
        const result = await this.checkout()
        console.log('Commande effectuée:', result)
        
        // Afficher un message de succès
        if (this.$toasted) {
          this.$toasted.success('Commande effectuée avec succès !')
        } else {
          alert('Commande effectuée avec succès !')
        }
        
        // Rediriger vers la page de profil
        this.$router.push('/profile')
      } catch (error) {
        console.error('Erreur lors de la finalisation de la commande:', error)
        
        // Afficher un message d'erreur
        const errorMessage = error.message || 'Une erreur est survenue lors de la finalisation de la commande'
        if (this.$toasted) {
          this.$toasted.error(errorMessage)
        } else {
          alert('Erreur: ' + errorMessage)
        }
      } finally {
        this.checkoutLoading = false
      }
    }
  }
}
</script>

<style scoped>
.cart-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.loading, .empty-cart {
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

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: #666;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1rem;
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-poster img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.item-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.item-session {
  color: #666;
  margin-bottom: 1rem;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 30px;
  height: 30px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.qty-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.qty-btn:last-child {
  border-radius: 0 4px 4px 0;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.item-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.price-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #e50914;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.remove-btn:hover {
  text-decoration: underline;
}

.cart-summary {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.cart-summary h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.summary-line.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
  font-weight: 600;
  font-size: 1.1rem;
}

.checkout-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  display: block;
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #e50914;
  color: white;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
}

.btn:hover {
  background-color: #f40612;
}

.btn.secondary {
  background-color: #666;
}

.btn.secondary:hover {
  background-color: #555;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    grid-template-areas: 
      "poster details"
      "poster price";
  }
  
  .item-poster {
    grid-area: poster;
  }
  
  .item-details {
    grid-area: details;
  }
  
  .item-price {
    grid-area: price;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }
}
</style>