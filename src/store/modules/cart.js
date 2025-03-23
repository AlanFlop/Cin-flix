// src/store/modules/cart.js

const loadCartFromLocalStorage = () => {
  try {
    const savedCart = localStorage.getItem('cinema_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Erreur lors du chargement du panier depuis localStorage:', error);
    return [];
  }
};

const saveCartToLocalStorage = (items) => {
  try {
    localStorage.setItem('cinema_cart', JSON.stringify(items));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du panier dans localStorage:', error);
  }
};

const loadBookingsFromLocalStorage = (userId) => {
  try {
    // Utiliser un identifiant par utilisateur pour les réservations
    const key = userId ? `cinema_bookings_${userId}` : 'cinema_bookings_guest';
    const savedBookings = localStorage.getItem(key);
    return savedBookings ? JSON.parse(savedBookings) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des réservations depuis localStorage:', error);
    return [];
  }
};

const saveBookingsToLocalStorage = (bookings, userId) => {
  try {
    // Utiliser un identifiant par utilisateur pour les réservations
    const key = userId ? `cinema_bookings_${userId}` : 'cinema_bookings_guest';
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des réservations dans localStorage:', error);
  }
};

export default {
  namespaced: true,
  state: {
    items: loadCartFromLocalStorage(),
    bookings: [], // Initialisé vide et chargé dans les actions
    loading: false,
    error: null,
    bookingsLoading: false,
    bookingsError: null
  },
  getters: {
    itemsCount: state => (state.items ? state.items.length : 0),
    cartTotal: state => {
      if (!state.items || state.items.length === 0) return 0;
      return state.items.reduce((total, item) => total + item.totalPrice, 0);
    },
    isEmpty: state => !state.items || state.items.length === 0,
    userBookings: state => state.bookings || []
  },
  mutations: {
    ADD_TO_CART(state, item) {
      if (!state.items) state.items = [];
      const exists = state.items.some(cartItem => {
        return cartItem.movieId === item.movieId && 
               cartItem.date === item.date && 
               cartItem.time === item.time &&
               cartItem.ticketId === item.ticketId;
      });

      if (!exists) {
        state.items.push(item);
        saveCartToLocalStorage(state.items);
      }
    },
    REMOVE_FROM_CART(state, index) {
      if (!state.items || !state.items[index]) return;
      state.items.splice(index, 1);
      saveCartToLocalStorage(state.items);
    },
    UPDATE_CART_ITEM(state, { index, quantity }) {
      if (!state.items || !state.items[index]) return;
      state.items[index].quantity = quantity;
      state.items[index].totalPrice = state.items[index].pricePerTicket * quantity;
      saveCartToLocalStorage(state.items);
    },
    CLEAR_CART(state) {
      state.items = [];
      saveCartToLocalStorage(state.items);
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_BOOKINGS_LOADING(state, status) {
      state.bookingsLoading = status;
    },
    SET_BOOKINGS_ERROR(state, error) {
      state.bookingsError = error;
    },
    SET_BOOKINGS(state, bookings) {
      state.bookings = bookings;
    },
    ADD_TO_BOOKINGS(state, { bookings, userId }) {
      if (!state.bookings) state.bookings = [];
      
      if (Array.isArray(bookings)) {
        state.bookings.push(...bookings);
      } else {
        state.bookings.push(bookings);
      }
      
      saveBookingsToLocalStorage(state.bookings, userId);
    },
    CANCEL_BOOKING(state, { bookingId, userId }) {
      if (!state.bookings) return;
      const index = state.bookings.findIndex(booking => booking.bookingId === bookingId);
      if (index !== -1) {
        state.bookings[index].status = 'annulé';
        saveBookingsToLocalStorage(state.bookings, userId);
      }
    }
  },
  actions: {
    addToCart({ commit }, item) {
      const itemWithId = {
        ...item,
        ticketId: item.ticketId || `ticket_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      };
      commit('ADD_TO_CART', itemWithId);
    },
    removeFromCart({ commit }, index) {
      commit('REMOVE_FROM_CART', index);
    },
    updateCartItem({ commit }, payload) {
      commit('UPDATE_CART_ITEM', payload);
    },
    clearCart({ commit }) {
      commit('CLEAR_CART');
    },
    async checkout({ commit, state, rootState }) {
      if (!rootState.auth.user) {
        return Promise.reject(new Error('Vous devez être connecté pour finaliser votre commande'));
      }
      if (!state.items || state.items.length === 0) {
        return Promise.reject(new Error('Votre panier est vide'));
      }
      
      const userId = rootState.auth.user ? rootState.auth.user.id : null;
      if (!userId) {
        return Promise.reject(new Error('Erreur d\'identification utilisateur'));
      }
      
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const bookingsToAdd = state.items.map(item => {
          return {
            ...item,
            userId: userId, // Ajouter l'ID utilisateur à chaque réservation
            bookingId: `booking_${userId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            bookingDate: new Date().toISOString(),
            status: 'confirmé'
          };
        });
        
        commit('ADD_TO_BOOKINGS', { bookings: bookingsToAdd, userId });
        commit('CLEAR_CART');
        
        return { 
          success: true,
          bookings: bookingsToAdd
        };
      } catch (error) {
        commit('SET_ERROR', error.message || 'Erreur lors de la finalisation de la commande');
        return Promise.reject(error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchUserBookings({ commit, rootState }) {
      commit('SET_BOOKINGS_LOADING', true);
      commit('SET_BOOKINGS_ERROR', null);
      
      // Récupérer l'ID utilisateur depuis le state auth
      const userId = rootState.auth.user ? rootState.auth.user.id : null;
      
      try {
        // Charger les réservations de l'utilisateur spécifique
        const bookings = loadBookingsFromLocalStorage(userId);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Filtrer pour ne retourner que les réservations appartenant à cet utilisateur
        const userBookings = userId 
          ? bookings.filter(booking => booking.userId === userId) 
          : [];
          
        commit('SET_BOOKINGS', userBookings);
        return userBookings;
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        commit('SET_BOOKINGS_ERROR', 'Impossible de charger vos réservations');
        return [];
      } finally {
        commit('SET_BOOKINGS_LOADING', false);
      }
    },
    async cancelBooking({ commit, rootState }, bookingId) {
      const userId = rootState.auth.user ? rootState.auth.user.id : null;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        commit('CANCEL_BOOKING', { bookingId, userId });
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        throw error;
      }
    },
    // Action à appeler lors de la connexion d'un utilisateur
    initUserBookings({ dispatch }) {
      return dispatch('fetchUserBookings');
    }
  }
};