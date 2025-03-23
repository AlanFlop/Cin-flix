import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/main.css'

// Vérifier l'état initial du store et localStorage
console.log('Store initial auth state:', store.state.auth)
console.log('Initial isLoggedIn:', store.getters['auth/isLoggedIn'])
console.log('localStorage token:', localStorage.getItem('user_token'))

// Création de l'application Vue
const app = createApp(App)

// Utilisation du router et du store
app.use(router)
app.use(store)

// Montage de l'application
app.mount('#app')