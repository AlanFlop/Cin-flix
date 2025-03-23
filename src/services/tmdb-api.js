import axios from 'axios'

const API_KEY = '549f3c130164e3fbe7aec866b97b53e5' 
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Tailles d'images disponibles
export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original'
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original'
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original'
  }
}

// Créer une instance axios avec les configurations de base
const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'fr-FR'
  }
})

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { response } = error
    
    if (response && response.data) {
      return Promise.reject(new Error(response.data.status_message || 'Une erreur est survenue'))
    }
    
    return Promise.reject(new Error('Impossible de contacter le serveur. Veuillez vérifier votre connexion Internet.'))
  }
)

// Fonction utilitaire pour construire les URLs des images
export const getImageUrl = (path, size = 'medium', type = 'poster') => {
  if (!path) return null
  return `${IMAGE_BASE_URL}/${IMAGE_SIZES[type][size]}${path}`
}

export default apiClient