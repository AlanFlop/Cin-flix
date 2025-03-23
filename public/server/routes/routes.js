const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

// GET /api/reviews/movie/:movieId - Récupérer tous les avis d'un film
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username');
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// POST /api/reviews - Créer un nouvel avis
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce film
    const existingReview = await Review.findOne({
      userId: req.user.id,
      movieId
    });

    if (existingReview) {
      return res.status(400).json({ msg: 'Vous avez déjà laissé un avis pour ce film' });
    }

    // Créer un nouvel avis
    const newReview = new Review({
      userId: req.user.id,
      movieId,
      rating,
      comment
    });

    const review = await newReview.save();
    
    // Récupérer l'avis avec les infos utilisateur
    const reviewWithUser = await Review.findById(review._id)
      .populate('userId', 'username');
    
    res.json(reviewWithUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// PUT /api/reviews/:id - Modifier un avis
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Trouver l'avis
    let review = await Review.findById(req.params.id);

    // Vérifier si l'avis existe
    if (!review) {
      return res.status(404).json({ msg: 'Avis non trouvé' });
    }

    // Vérifier si l'utilisateur est propriétaire de cet avis
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    // Mettre à jour l'avis
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Récupérer l'avis mis à jour avec les infos utilisateur
    const updatedReview = await Review.findById(req.params.id)
      .populate('userId', 'username');
    
    res.json(updatedReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// DELETE /api/reviews/:id - Supprimer un avis
router.delete('/:id', auth, async (req, res) => {
  try {
    // Trouver l'avis
    const review = await Review.findById(req.params.id);

    // Vérifier si l'avis existe
    if (!review) {
      return res.status(404).json({ msg: 'Avis non trouvé' });
    }

    // Vérifier si l'utilisateur est propriétaire de cet avis
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    await review.remove();
    res.json({ msg: 'Avis supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;