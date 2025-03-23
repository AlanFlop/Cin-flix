<template>
    <div class="cart-summary">
      <div class="summary-card">
        <h2 class="summary-title">Récapitulatif</h2>
        
        <div class="summary-items">
          <div v-for="(item, index) in items" :key="index" class="summary-item">
            <span>{{ item.movieTitle }} ({{ item.quantity }}x)</span>
            <span>{{ formatPrice(item.totalPrice) }}</span>
          </div>
        </div>
        
        <div class="summary-divider"></div>
        
        <div class="summary-total">
          <span>Total</span>
          <span class="total-price">{{ formatPrice(totalPrice) }}</span>
        </div>
        
        <button @click="$emit('checkout')" class="checkout-btn">
          Valider la commande
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CartSummary',
    props: {
      items: {
        type: Array,
        required: true
      }
    },
    computed: {
      totalPrice() {
        return this.items.reduce((sum, item) => sum + item.totalPrice, 0)
      }
    },
    methods: {
      formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(price)
      }
    }
  }
  </script>
  
  <style scoped>
  .cart-summary {
    position: sticky;
    top: 2rem;
  }
  
  .summary-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .summary-title {
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .summary-items {
    margin-bottom: 1.5rem;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    color: #555;
    font-size: 0.95rem;
  }
  
  .summary-divider {
    height: 1px;
    background-color: #eee;
    margin-bottom: 1.5rem;
  }
  
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  .total-price {
    color: #e50914;
  }
  
  .checkout-btn {
    width: 100%;
    padding: 0.8rem;
    background-color: #e50914;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .checkout-btn:hover {
    background-color: #b2070f;
  }
  </style>