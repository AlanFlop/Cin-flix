<template>
  <div class="profile-view">
    <h1 class="page-title">Mon profil</h1>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des données du profil...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadUserData" class="btn">Réessayer</button>
    </div>
    
    <div v-else class="profile-content">
      <!-- Informations du profil -->
      <div class="user-profile">
        <div class="user-avatar">
          <div class="avatar">{{ userInitials }}</div>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user ? user.name : 'Utilisateur' }}</h2>
          <p class="user-email">{{ user ? user.email : '' }}</p>
          <p class="member-since">Membre depuis {{ memberSince }}</p>
        </div>
        <div class="profile-actions">
          <button @click="showEditForm = true" class="btn secondary">
            Modifier le profil
          </button>
          <button @click="showPasswordForm = true" class="btn secondary">
            Changer le mot de passe
          </button>
        </div>
      </div>
      
      <!-- Section Mes réservations -->
      <div class="user-bookings">
        <h2>Mes réservations</h2>
        
        <div v-if="bookingsLoading" class="section-loading">
          <div class="spinner small"></div>
          <p>Chargement de vos réservations...</p>
        </div>
        
        <div v-else-if="bookingsError" class="section-error">
          <p>{{ bookingsError }}</p>
          <button @click="loadBookings" class="btn text">Réessayer</button>
        </div>
        
        <div v-else-if="!userBookings || userBookings.length === 0" class="empty-section">
          <p>Vous n'avez pas encore effectué de réservation.</p>
          <router-link to="/" class="btn secondary">Parcourir les films</router-link>
        </div>
        
        <div v-else class="bookings-list">
          <div v-for="booking in userBookings" :key="booking.bookingId" class="booking-card">
            <div class="booking-poster">
              <img 
                :src="booking.moviePoster !== 'N/A' ? booking.moviePoster : '/images/placeholder-movie.jpg'" 
                :alt="booking.movieTitle" 
                @error="handleImageError"
              />
            </div>
            <div class="booking-info">
              <h3 class="booking-title">{{ booking.movieTitle }}</h3>
              <p class="booking-status" :class="{ 'cancelled': booking.status === 'annulé' }">
                {{ booking.status }}
              </p>
              <p class="booking-date">
                {{ formatDate(booking.date) }} à {{ booking.time }}
              </p>
              <p class="booking-seats">{{ booking.quantity }} place(s)</p>
              <p class="booking-price">{{ formatPrice(booking.totalPrice) }}</p>
            </div>
            <div class="booking-actions">
              <button 
                v-if="booking.status !== 'annulé'"
                @click="handleCancelBooking(booking.bookingId)" 
                class="btn danger"
                :disabled="bookingActionsLoading"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Section Mes films vus récemment -->
      <div class="user-history">
        <h2>Films vus récemment</h2>
        
        <div v-if="historyLoading" class="section-loading">
          <div class="spinner small"></div>
          <p>Chargement de votre historique...</p>
        </div>
        
        <div v-else-if="historyError" class="section-error">
          <p>{{ historyError }}</p>
          <button @click="loadHistory" class="btn text">Réessayer</button>
        </div>
        
        <div v-else-if="history && history.length === 0" class="empty-section">
          <p>Aucun film vu récemment.</p>
        </div>
        
        <div v-else-if="history" class="history-grid">
          <div 
            v-for="item in history" 
            :key="item._id" 
            class="history-item"
            @click="goToMovie(item.movieId)"
          >
            <img 
              :src="item.moviePoster !== 'N/A' ? item.moviePoster : '/images/placeholder-movie.jpg'" 
              :alt="item.movieTitle" 
              @error="handleImageError"
            />
            <div class="history-info">
              <h3>{{ item.movieTitle }}</h3>
              <p>Vu le {{ formatDate(item.viewedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation d'annulation -->
    <div v-if="showCancelModal" class="modal-overlay" @click.self="showCancelModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmer l'annulation</h2>
          <button @click="showCancelModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir annuler cette réservation ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button @click="showCancelModal = false" class="btn secondary">Non, garder ma réservation</button>
          <button @click="confirmCancelBooking" class="btn danger">Oui, annuler</button>
        </div>
      </div>
    </div>
    
    <!-- Modal d'édition du profil -->
    <div v-if="showEditForm" class="modal-overlay" @click.self="showEditForm = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Modifier mon profil</h2>
          <button @click="showEditForm = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="form-group">
            <label for="name">Nom</label>
            <input 
              type="text" 
              id="name" 
              v-model="editForm.name" 
              required
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="editForm.email" 
              required
            />
          </div>
          <div v-if="editError" class="error-message">
            {{ editError }}
          </div>
          <div class="form-actions">
            <button type="button" @click="showEditForm = false" class="btn secondary">
              Annuler
            </button>
            <button type="submit" class="btn" :disabled="editLoading">
              {{ editLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal de changement de mot de passe -->
    <div v-if="showPasswordForm" class="modal-overlay" @click.self="showPasswordForm = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Changer mon mot de passe</h2>
          <button @click="showPasswordForm = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label for="current-password">Mot de passe actuel</label>
            <input 
              type="password" 
              id="current-password" 
              v-model="passwordForm.currentPassword" 
              required
            />
          </div>
          <div class="form-group">
            <label for="new-password">Nouveau mot de passe</label>
            <input 
              type="password" 
              id="new-password" 
              v-model="passwordForm.newPassword" 
              required
              minlength="8"
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirmer le nouveau mot de passe</label>
            <input 
              type="password" 
              id="confirm-password" 
              v-model="passwordForm.confirmPassword" 
              required
            />
          </div>
          <div v-if="passwordForm.newPassword !== passwordForm.confirmPassword" class="error-message">
            Les mots de passe ne correspondent pas.
          </div>
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
          <div class="form-actions">
            <button type="button" @click="showPasswordForm = false" class="btn secondary">
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn" 
              :disabled="passwordLoading || passwordForm.newPassword !== passwordForm.confirmPassword"
            >
              {{ passwordLoading ? 'Changement...' : 'Changer le mot de passe' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'ProfileView',
  data() {
    return {
      loading: false,
      error: null,
      bookingsLoading: false,
      bookingsError: null,
      historyLoading: false,
      historyError: null,
      history: [],
      showEditForm: false,
      showPasswordForm: false,
      showCancelModal: false,
      bookingToCancel: null,
      editForm: {
        name: '',
        email: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      editLoading: false,
      editError: null,
      passwordLoading: false,
      passwordError: null,
      bookingActionsLoading: false,
      notFoundImage: '/images/placeholder-movie.jpg'
    };
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('cart', ['userBookings']),
    
    userInitials() {
      if (!this.user || !this.user.name) return 'U';
      
      const nameParts = this.user.name.split(' ');
      if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
      }
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    },
    
    memberSince() {
      if (!this.user || !this.user.createdAt) return 'récemment';
      
      return this.formatDate(this.user.createdAt);
    }
  },
  methods: {
    ...mapActions('auth', ['updateProfile', 'changePassword']),
    ...mapActions('cart', ['fetchUserBookings', 'cancelBooking']),
    
    async loadUserData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Les données utilisateur sont déjà dans le store,
        // mais on pourrait faire une requête spécifique pour le profil si nécessaire
        if (this.user) {
          this.editForm.name = this.user.name;
          this.editForm.email = this.user.email;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        this.error = 'Impossible de charger vos informations. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },
    
    async loadBookings() {
      this.bookingsLoading = true;
      this.bookingsError = null;
      
      try {
        await this.fetchUserBookings();
      } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        this.bookingsError = 'Impossible de charger vos réservations. Veuillez réessayer.';
      } finally {
        this.bookingsLoading = false;
      }
    },
    
    async loadHistory() {
      this.historyLoading = true;
      this.historyError = null;
      
      try {
        // Ici, vous pouvez appeler une action spécifique pour récupérer l'historique
        // Pour l'instant, nous utilisons un tableau vide
        this.history = [];
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.historyError = 'Impossible de charger votre historique. Veuillez réessayer.';
      } finally {
        this.historyLoading = false;
      }
    },
    
    async handleUpdateProfile() {
      this.editLoading = true;
      this.editError = null;
      
      try {
        await this.updateProfile(this.editForm);
        this.showEditForm = false;
        this.$toasted.success('Profil mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        this.editError = 'Erreur lors de la mise à jour du profil. Veuillez réessayer.';
      } finally {
        this.editLoading = false;
      }
    },
    
    async handleChangePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'Les mots de passe ne correspondent pas.';
        return;
      }
      
      this.passwordLoading = true;
      this.passwordError = null;
      
      try {
        await this.changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        });
        
        this.showPasswordForm = false;
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        this.$toasted.success('Mot de passe changé avec succès');
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        this.passwordError = 'Erreur lors du changement de mot de passe. Veuillez vérifier votre mot de passe actuel.';
      } finally {
        this.passwordLoading = false;
      }
    },
    
    handleCancelBooking(bookingId) {
      this.bookingToCancel = bookingId;
      this.showCancelModal = true;
    },
    
    async confirmCancelBooking() {
      if (!this.bookingToCancel) return;
      
      this.bookingActionsLoading = true;
      
      try {
        await this.cancelBooking(this.bookingToCancel);
        
        this.showCancelModal = false;
        this.bookingToCancel = null;
        
        if (this.$toasted) {
          this.$toasted.success('Réservation annulée avec succès');
        }
        
        // Recharger les réservations n'est pas nécessaire car le store est déjà mis à jour
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
        
        if (this.$toasted) {
          this.$toasted.error('Erreur lors de l\'annulation de la réservation');
        }
      } finally {
        this.bookingActionsLoading = false;
      }
    },
    
    goToMovie(movieId) {
      this.$router.push({ name: 'movie', params: { id: movieId } });
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    
    handleImageError(e) {
      e.target.src = this.notFoundImage;
    }
  },
  created() {
    this.loadUserData();
    this.loadBookings();
    this.loadHistory();
  }
}
</script>

<style scoped>
.profile-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-profile, .user-bookings, .user-history {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.user-profile {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.user-avatar {
  flex: 0 0 80px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e50914;
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
  color: #333;
}

.user-email {
  color: #666;
  margin-bottom: 0.5rem;
}

.member-since {
  font-size: 0.9rem;
  color: #888;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-bookings h2, .user-history h2 {
  margin-bottom: 1.5rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.section-loading, .section-error, .empty-section {
  text-align: center;
  padding: 2rem 0;
  color: #666;
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

.spinner.small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-card {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.booking-poster {
  width: 80px;
  height: 120px;
  flex-shrink: 0;
}

.booking-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-info {
  flex: 1;
  padding: 1rem;
  position: relative;
}

.booking-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.booking-date, .booking-seats {
  color: #666;
  margin-bottom: 0.3rem;
}

.booking-price {
  font-weight: 600;
  color: #e50914;
}

.booking-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  background-color: #4CAF50;
  color: white;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.booking-status.cancelled {
  background-color: #f44336;
}

.booking-actions {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.history-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.history-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.history-item img {
  width: 100%;
  height: 225px;
  object-fit: cover;
}

.history-info {
  padding: 1rem;
}

.history-info h3 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
  color: #333;
}

.history-info p {
  font-size: 0.8rem;
  color: #666;
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

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-body .warning-text {
  color: #f44336;
  font-weight: 500;
  margin-top: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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

.profile-form, .password-form {
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

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-card {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.booking-poster {
  width: 80px;
  height: 120px;
  flex-shrink: 0;
}

.booking-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-info {
  flex: 1;
  padding: 1rem;
  position: relative;
}

.booking-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.booking-date, .booking-seats {
  color: #666;
  margin-bottom: 0.3rem;
}

.booking-price {
  font-weight: 600;
  color: #e50914;
}

.booking-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  background-color: #4CAF50;
  color: white;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.booking-status.cancelled {
  background-color: #f44336;
}

.booking-actions {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.history-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.history-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.history-item img {
  width: 100%;
  height: 225px;
  object-fit: cover;
}

.history-info {
  padding: 1rem;
}

.history-info h3 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
  color: #333;
}

.history-info p {
  font-size: 0.8rem;
  color: #666;
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

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-body .warning-text {
  color: #f44336;
  font-weight: 500;
  margin-top: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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

.profile-form, .password-form {
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

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #e50914;
  box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
}

.error-message {
  color: #e50914;
  background-color: #ffebee;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
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
  text-decoration: none;
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

.btn.danger {
  background-color: #dc3545;
}

.btn.danger:hover {
  background-color: #c82333;
}

.btn.text {
  background: none;
  color: #e50914;
  padding: 0;
  text-decoration: underline;
}

.btn.text:hover {
  color: #f40612;
  background: none;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 1rem;
  }
  
  .user-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    margin: 0 auto;
  }
  
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
  
  .booking-card {
    flex-direction: column;
  }
  
  .booking-poster {
    width: 100%;
    height: 200px;
  }
  
  .booking-info {
    padding: 1rem;
  }
  
  .booking-status {
    position: static;
    display: inline-block;
    margin-bottom: 0.5rem;
  }
  
  .booking-actions {
    padding: 1rem;
    justify-content: flex-end;
  }
  
  .history-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .history-item img {
    height: 180px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>