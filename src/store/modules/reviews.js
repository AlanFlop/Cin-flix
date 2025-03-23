export default {
  namespaced: true,
  state: {
    reviews: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_REVIEWS(state, reviews) {
      state.reviews = reviews
    },
    ADD_REVIEW(state, review) {
      state.reviews.unshift(review) // Ajouter au début du tableau
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchReviews({ commit }, movieId) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // En production, ce serait un appel API au backend
        // Ici on simule un délai et des avis fictifs pour la démo
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Génération de données fictives pour la démo
        const reviews = generateMockReviews(movieId)
        
        commit('SET_REVIEWS', reviews)
      } catch (error) {
        commit('SET_ERROR', error.message || 'Erreur lors du chargement des avis')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async addReview({ commit, rootState }, { movieId, rating, comment }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // Vérifier que l'utilisateur est connecté
        const user = rootState.auth.user
        if (!user) {
          throw new Error('Vous devez être connecté pour laisser un avis')
        }
        
        // En production, ce serait un appel API au backend
        // Ici on simule un délai pour la démo
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Créer un nouvel avis avec les données de l'utilisateur actuel
        const newReview = {
          _id: 'review_' + Date.now(),
          movieId,
          userId: user.id,
          username: user.username,
          rating,
          comment,
          createdAt: new Date().toISOString()
        }
        
        commit('ADD_REVIEW', newReview)
      } catch (error) {
        commit('SET_ERROR', error.message || 'Erreur lors de l\'ajout de l\'avis')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

// Fonction helper pour générer des avis fictifs pour la démo
function generateMockReviews(movieId) {
  const mockUsernames = ['Sophie', 'Thomas', 'Julie', 'Nicolas', 'Emma', 'Maxime']
  const mockComments = [
    'J\'ai adoré ce film, les acteurs sont excellents !',
    'L\'histoire est captivante, mais la fin est un peu décevante.',
    'Un chef-d\'œuvre du cinéma, à voir absolument.',
    'Bonne réalisation, mais le scénario manque d\'originalité.',
    'Les effets spéciaux sont impressionnants, mais l\'histoire est un peu confuse.',
    'Un film divertissant, parfait pour une soirée détente.',
    'Je recommande vivement, une des meilleures sorties de l\'année !',
    'J\'ai passé un bon moment, mais sans plus.',
    'Une belle surprise, je ne m\'attendais pas à autant apprécier.',
    'Déçu par rapport aux critiques que j\'avais lues.'
  ]
  
  // Générer un nombre aléatoire d'avis (entre 0 et 8)
  const numReviews = Math.floor(Math.random() * 8)
  const reviews = []
  
  for (let i = 0; i < numReviews; i++) {
    const username = mockUsernames[Math.floor(Math.random() * mockUsernames.length)]
    const comment = mockComments[Math.floor(Math.random() * mockComments.length)]
    const rating = Math.floor(Math.random() * 3) + 3 // Note entre 3 et 5
    
    // Créer un avis fictif
    reviews.push({
      _id: `review_${movieId}_${i}`,
      movieId,
      userId: `user_${i}`,
      username,
      rating,
      comment,
      createdAt: new Date(Date.now() - i * 86400000).toISOString() // Jours précédents
    })
  }
  
  return reviews
}