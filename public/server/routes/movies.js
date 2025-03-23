const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

// Configuration de l'API OMDb
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

/**
 * @route   GET /api/movies/search
 * @desc    Rechercher des films via l'API OMDb
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { s, page = 1 } = req.query;
    
    if (!s) {
      return res.status(400).json({ msg: 'Un terme de recherche est requis' });
    }
    
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s,
        page,
        type: 'movie'
      }
    });
    
    if (response.data.Response === 'False') {
      return res.status(404).json({ msg: response.data.Error || 'Aucun film trouvé' });
    }
    
    res.json({
      movies: response.data.Search,
      totalResults: response.data.totalResults
    });
  } catch (err) {
    console.error('Erreur lors de la recherche de films:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/movies/popular
 * @desc    Obtenir des films populaires (simulation)
 * @access  Public
 */
router.get('/popular', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    
    // Liste de films populaires simulée
    const popularTitles = [
      'Inception', 'The Shawshank Redemption', 'The Dark Knight',
      'Pulp Fiction', 'Fight Club', 'Forrest Gump', 'The Matrix',
      'Interstellar', 'The Godfather', 'Avengers: Endgame'
    ];
    
    // Rechercher un film de la liste en fonction de la page
    const searchTitle = popularTitles[page - 1] || popularTitles[0];
    
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: searchTitle,
        page: 1,
        type: 'movie'
      }
    });
    
    if (response.data.Response === 'False') {
      return res.status(404).json({ msg: 'Aucun film populaire trouvé' });
    }
    
    res.json({
      movies: response.data.Search,
      totalResults: popularTitles.length
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des films populaires:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/movies/:id
 * @desc    Obtenir les détails d'un film par son ID IMDb
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        i: req.params.id,
        plot: 'full'
      }
    });
    
    if (response.data.Response === 'False') {
      return res.status(404).json({ msg: 'Film non trouvé' });
    }
    
    res.json(response.data);
  } catch (err) {
    console.error(`Erreur lors de la récupération du film ${req.params.id}:`, err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/movies/:id/reviews
 * @desc    Obtenir les avis pour un film spécifique
 * @access  Public
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username avatar');
    
    res.json(reviews);
  } catch (err) {
    console.error('Erreur lors de la récupération des avis:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/movies/:id/reviews
 * @desc    Ajouter un avis pour un film
 * @access  Private
 */
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validation de base
    if (!rating || !comment) {
      return res.status(400).json({ msg: 'La note et le commentaire sont requis' });
    }
    
    // Vérifier si l'utilisateur a déjà laissé un avis pour ce film
    const existingReview = await Review.findOne({
      userId: req.user.id,
      movieId: req.params.id
    });
    
    if (existingReview) {
      return res.status(400).json({ msg: 'Vous avez déjà laissé un avis pour ce film' });
    }
    
    // Créer un nouvel avis
    const newReview = new Review({
      userId: req.user.id,
      movieId: req.params.id,
      rating,
      comment
    });
    
    await newReview.save();
    
    // Récupérer l'avis avec les informations de l'utilisateur
    const reviewWithUser = await Review.findById(newReview._id)
      .populate('userId', 'username avatar');
    
    res.json(reviewWithUser);
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'un avis:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   PUT /api/movies/:id/reviews/:reviewId
 * @desc    Mettre à jour un avis
 * @access  Private
 */
router.put('/:id/reviews/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validation de base
    if (!rating || !comment) {
      return res.status(400).json({ msg: 'La note et le commentaire sont requis' });
    }
    
    // Trouver l'avis
    let review = await Review.findById(req.params.reviewId);
    
    // Vérifier si l'avis existe
    if (!review) {
      return res.status(404).json({ msg: 'Avis non trouvé' });
    }
    
    // Vérifier si l'utilisateur est le propriétaire de l'avis
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }
    
    // Mettre à jour l'avis
    review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { rating, comment },
      { new: true }
    ).populate('userId', 'username avatar');
    
    res.json(review);
  } catch (err) {
    console.error('Erreur lors de la mise à jour d\'un avis:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   DELETE /api/movies/:id/reviews/:reviewId
 * @desc    Supprimer un avis
 * @access  Private
 */
router.delete('/:id/reviews/:reviewId', auth, async (req, res) => {
  try {
    // Trouver l'avis
    const review = await Review.findById(req.params.reviewId);
    
    // Vérifier si l'avis existe
    if (!review) {
      return res.status(404).json({ msg: 'Avis non trouvé' });
    }
    
    // Vérifier si l'utilisateur est le propriétaire de l'avis ou un admin
    const user = await User.findById(req.user.id);
    if (review.userId.toString() !== req.user.id && !user.isAdmin) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }
    
    await review.remove();
    
    res.json({ msg: 'Avis supprimé' });
  } catch (err) {
    console.error('Erreur lors de la suppression d\'un avis:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/movies/:id/favorite
 * @desc    Ajouter un film aux favoris
 * @access  Private
 */
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Vérifier si le film est déjà dans les favoris
    if (user.favorites.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Ce film est déjà dans vos favoris' });
    }
    
    user.favorites.push(req.params.id);
    await user.save();
    
    res.json({ msg: 'Film ajouté aux favoris' });
  } catch (err) {
    console.error('Erreur lors de l\'ajout aux favoris:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

/**
 * @route   DELETE /api/movies/:id/favorite
 * @desc    Retirer un film des favoris
 * @access  Private
 */
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Trouver l'index du film dans les favoris
    const index = user.favorites.indexOf(req.params.id);
    
    // Vérifier si le film est dans les favoris
    if (index === -1) {
      return res.status(400).json({ msg: 'Ce film n\'est pas dans vos favoris' });
    }
    
    user.favorites.splice(index, 1);
    await user.save();
    
    res.json({ msg: 'Film retiré des favoris' });
  } catch (err) {
    console.error('Erreur lors du retrait des favoris:', err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

module.exports = router;