// src/store/modules/bookings.js
import bookingsService from '@/services/bookings.service';

export default {
  namespaced: true,
  
  state: {
    bookings: [],
    loading: false,
    error: null,
    currentBooking: null
  },
  
  getters: {
    userBookings: state => state.bookings,
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error
  },
  
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    SET_BOOKINGS(state, bookings) {
      state.bookings = bookings;
    },
    
    ADD_BOOKING(state, booking) {
      state.bookings.unshift(booking);
    },
    
    SET_CURRENT_BOOKING(state, booking) {
      state.currentBooking = booking;
    },
    
    UPDATE_BOOKING_STATUS(state, { bookingId, status }) {
      const index = state.bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        state.bookings[index].status = status;
      }
    }
  },
  
  actions: {
    /**
     * Crée une nouvelle réservation
     * @param {object} context - Contexte Vuex
     * @param {object} bookingData - Données de la réservation
     * @returns {Promise} - Succès ou échec de la création
     */
    async createBooking({ commit }, bookingData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        console.log('Création d\'une réservation avec les données:', bookingData);
        const response = await bookingsService.createBooking(bookingData);
        
        commit('ADD_BOOKING', response.booking);
        commit('SET_CURRENT_BOOKING', response.booking);
        commit('SET_LOADING', false);
        
        return response;
      } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        commit('SET_ERROR', 'Une erreur est survenue lors de la réservation. Veuillez réessayer.');
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    /**
     * Récupère les réservations de l'utilisateur
     * @param {object} context - Contexte Vuex
     * @returns {Promise} - Succès ou échec de la récupération
     */
    async fetchUserBookings({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await bookingsService.getUserBookings();
        commit('SET_BOOKINGS', response.bookings);
        commit('SET_LOADING', false);
        
        return response.bookings;
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        commit('SET_ERROR', 'Une erreur est survenue lors du chargement de vos réservations.');
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    /**
     * Annule une réservation
     * @param {object} context - Contexte Vuex
     * @param {number} bookingId - ID de la réservation à annuler
     * @returns {Promise} - Succès ou échec de l'annulation
     */
    async cancelBooking({ commit }, bookingId) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await bookingsService.cancelBooking(bookingId);
        commit('UPDATE_BOOKING_STATUS', { bookingId, status: 'cancelled' });
        commit('SET_LOADING', false);
        
        return response;
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        commit('SET_ERROR', 'Une erreur est survenue lors de l\'annulation de votre réservation.');
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    /**
     * Efface les erreurs
     * @param {object} context - Contexte Vuex
     */
    clearError({ commit }) {
      commit('SET_ERROR', null);
    }
  }
};