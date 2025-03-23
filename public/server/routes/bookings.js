const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');

// GET /api/bookings - Récupérer toutes les réservations de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// POST /api/bookings - Créer une nouvelle réservation
router.post('/', auth, async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      moviePoster,
      date,
      time,
      quantity,
      pricePerTicket
    } = req.body;

    // Calculer le prix total
    const totalPrice = quantity * pricePerTicket;

    // Créer la réservation
    const newBooking = new Booking({
      userId: req.user.id,
      movieId,
      movieTitle,
      moviePoster,
      date,
      time,
      quantity,
      pricePerTicket,
      totalPrice,
      status: 'confirmed'
    });

    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// GET /api/bookings/:id - Récupérer une réservation spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    // Vérifier si la réservation existe
    if (!booking) {
      return res.status(404).json({ msg: 'Réservation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est propriétaire de cette réservation
    if (booking.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// PUT /api/bookings/:id - Modifier le statut d'une réservation (annuler)
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    // Vérifier si la réservation existe
    if (!booking) {
      return res.status(404).json({ msg: 'Réservation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est propriétaire de cette réservation
    if (booking.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }
    
    // Mettre à jour le statut
    booking.status = 'cancelled';
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// DELETE /api/bookings/:id - Supprimer une réservation
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    // Vérifier si la réservation existe
    if (!booking) {
      return res.status(404).json({ msg: 'Réservation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est propriétaire de cette réservation
    if (booking.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }
    
    await booking.remove();
    res.json({ msg: 'Réservation supprimée' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;