import axios from 'axios';

// Créer une instance axios pour l'API TMDB
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.VUE_APP_TMDB_API_KEY, // Utilisez votre clé API TMDB
    language: 'fr-FR'
  }
});

/**
 * Obtient l'URL d'une image à partir de son chemin
 * @param {string} path - Chemin de l'image
 * @param {string} size - Taille de l'image ('small', 'medium', 'large')
 * @param {string} type - Type d'image ('poster', 'backdrop')
 * @returns {string|null} - URL de l'image ou null si pas d'image
 */
export function getImageUrl(path, size = 'medium', type = 'poster') {
  // Si le chemin est null ou undefined, on renvoie une URL alternative basée sur l'ID du film
  if (!path) {
    // On utilise une URL d'image par défaut appropriée au type d'image
    if (type === 'poster') {
      return null; // Sera géré par le composant MovieCard
    } else if (type === 'backdrop') {
      return null; // Sera géré par le composant pour les arrière-plans
    }
    return null;
  }

  // Mappez la taille en fonction du type et de la valeur passée
  let sizeValue = 'w500'; // Valeur par défaut

  if (type === 'poster') {
    // Tailles d'affiches
    if (size === 'small') sizeValue = 'w154';
    else if (size === 'medium') sizeValue = 'w342';
    else if (size === 'large') sizeValue = 'w500';
    else sizeValue = size; // Si une valeur spécifique est passée (w780, original, etc.)
  } else if (type === 'backdrop') {
    // Tailles d'arrière-plans
    if (size === 'small') sizeValue = 'w300';
    else if (size === 'medium') sizeValue = 'w780';
    else if (size === 'large') sizeValue = 'w1280';
    else sizeValue = size;
  }

  return `https://image.tmdb.org/t/p/${sizeValue}${path}`;
}

export default api;