// src/services/bookings.service.js
import api from './api';
import authService from './auth.service';

class BookingsService {
  /**
   * Crée une nouvelle réservation
   * @param {object} bookingData - Données de la réservation
   * @returns {Promise} - Réponse du serveur
   */
  async createBooking(bookingData) {
    try {
      // Vérifier l'état d'authentification
      const user = authService.getUser();
      console.log('État d\'authentification avant la création:', user);

      // Simuler une réservation réussie
      if (this.isSimulationMode()) {
        console.log('Simulation de réservation avec les données:', bookingData);
        
        // Créer une réponse simulée
        const mockBooking = {
          id: Math.floor(Math.random() * 1000000),
          userId: user ? user.id : 1,
          movieId: bookingData.movieId,
          movieTitle: bookingData.movieTitle,
          date: bookingData.date,
          time: bookingData.time,
          seats: bookingData.seats,
          totalPrice: bookingData.totalPrice,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };
        
        return {
          success: true,
          booking: mockBooking,
          message: 'Réservation créée avec succès'
        };
      }
      
      // Appel API réel (lorsque le backend sera disponible)
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw error;
    }
  }
  
  /**
   * Récupère les réservations de l'utilisateur courant
   * @returns {Promise} - Réponse du serveur
   */
  async getUserBookings() {
    try {
      // Simuler une liste de réservations
      if (this.isSimulationMode()) {
        console.log('Simulation de récupération des réservations utilisateur');
        
        // Créer des réservations simulées
        const mockBookings = [
          {
            id: 1001,
            movieId: 'tt1375666',
            movieTitle: 'Inception',
            date: '2025-04-15',
            time: '19:30',
            seats: ['A1', 'A2'],
            totalPrice: 24.0,
            status: 'confirmed',
            createdAt: '2025-03-15T10:30:00Z'
          },
          {
            id: 1002,
            movieId: 'tt0468569',
            movieTitle: 'The Dark Knight',
            date: '2025-04-20',
            time: '20:00',
            seats: ['B5', 'B6', 'B7'],
            totalPrice: 36.0,
            status: 'confirmed',
            createdAt: '2025-03-18T14:45:00Z'
          }
        ];
        
        return {
          success: true,
          bookings: mockBookings
        };
      }
      
      // Appel API réel (lorsque le backend sera disponible)
      const response = await api.get('/users/bookings');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      throw error;
    }
  }
  
  /**
   * Annule une réservation
   * @param {number} bookingId - ID de la réservation à annuler
   * @returns {Promise} - Réponse du serveur
   */
  async cancelBooking(bookingId) {
    try {
      // Simuler une annulation réussie
      if (this.isSimulationMode()) {
        console.log('Simulation d\'annulation de la réservation:', bookingId);
        
        return {
          success: true,
          message: 'Réservation annulée avec succès'
        };
      }
      
      // Appel API réel (lorsque le backend sera disponible)
      const response = await api.put(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      throw error;
    }
  }
  
  /**
   * Vérifier si le service est en mode simulation
   * @returns {boolean} - True si en mode simulation
   */
  isSimulationMode() {
    // En mode développement ou si le backend n'est pas disponible
    return true; // Toujours retourner true pour simuler
  }
}

export default new BookingsService();