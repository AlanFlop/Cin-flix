<template>
    <div class="cart-item">
      <div class="item-image">
        <img 
          :src="item.moviePoster !== 'N/A' ? item.moviePoster : '/placeholder.png'" 
          :alt="item.movieTitle" 
        />
      </div>
      
      <div class="item-details">
        <h3 class="item-title">{{ item.movieTitle }}</h3>
        <div class="item-info">
          <p>Date: {{ formatDate(item.date) }}</p>
          <p>Heure: {{ item.time }}</p>
          <p>Quantité: {{ item.quantity }} {{ item.quantity > 1 ? 'places' : 'place' }}</p>
        </div>
      </div>
      
      <div class="item-price">
        <p class="price">{{ formatPrice(item.totalPrice) }}</p>
        <button @click="$emit('remove')" class="remove-btn">
          Supprimer
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CartItem',
    props: {
      item: {
        type: Object,
        required: true
      }
    },
    methods: {
      formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(price)
      },
      formatDate(dateString) {
        const date = new Date(dateString)
        const options = { weekday: 'long', day: 'numeric', month: 'long' }
        return date.toLocaleDateString('fr-FR', options)
      }
    }
  }
  </script>
  
  <style scoped>
  .cart-item {
    display: flex;
    padding: 1.5rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }
  
  .item-image {
    flex: 0 0 100px;
    margin-right: 1.5rem;
  }
  
  .item-image img {
    width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  .item-details {
    flex: 1;
  }
  
  .item-title {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .item-info {
    color: #666;
    line-height: 1.6;
  }
  
  .item-price {
    flex: 0 0 120px;
    text-align: right;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .price {
    font-weight: 600;
    font-size: 1.1rem;
    color: #e50914;
  }
  
  .remove-btn {
    background: none;
    border: none;
    color: #777;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    font-size: 0.9rem;
  }
  
  .remove-btn:hover {
    color: #e50914;
  }
  
  @media (max-width: 576px) {
    .cart-item {
      flex-direction: column;
    }
    
    .item-image {
      max-width: 100px;
      margin-bottom: 1rem;
    }
    
    .item-price {
      flex-direction: row;
      align-items: center;
      margin-top: 1rem;
      width: 100%;
    }
  }
  </style>