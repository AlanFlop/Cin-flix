<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-logo">
        Ciné<span>Flix</span>
      </router-link>
      
      <div class="search-container">
        <SearchBar />
      </div>
      
      <div class="navbar-links">
        <router-link to="/" class="navbar-link">Accueil</router-link>
        <router-link v-if="isLoggedIn" to="/profile" class="navbar-link">Profil</router-link>
        <router-link to="/cart" class="navbar-link cart-link">
          Panier
          <span v-if="cartItemsCount > 0" class="cart-count">{{ cartItemsCount }}</span>
        </router-link>
        <router-link v-if="!isLoggedIn" to="/login" class="navbar-link">Se connecter</router-link>
        <a v-else @click="logout" class="navbar-link logout-link">Se déconnecter</a>
      </div>
    </div>
  </nav>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NavBar',
  components: {
    SearchBar
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      cartItemsCount: 'cart/itemsCount'
    })
  },
  methods: {
    ...mapActions({
      logoutAction: 'auth/logout'
    }),
    async logout() {
      await this.logoutAction()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #1a1a1a;
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.navbar-logo span {
  color: #e50914;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
}

.navbar-links {
  display: flex;
  align-items: center;
}

.navbar-link {
  color: white;
  text-decoration: none;
  margin-left: 1.5rem;
  font-weight: 500;
  transition: color 0.3s;
}

.navbar-link:hover {
  color: #e50914;
}

.logout-link {
  cursor: pointer;
}

.cart-link {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #e50914;
  color: white;
  font-size: 0.7rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>