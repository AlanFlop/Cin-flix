const mongoose = require('mongoose');

// URI de connexion à MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cinema-db';

// Options de connexion
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

// Fonction de connexion à la base de données
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, options);
    console.log('MongoDB connecté...');
  } catch (err) {
    console.error('Erreur de connexion à MongoDB:', err.message);
    // Quitter le processus en cas d'échec
    process.exit(1);
  }
};

module.exports = connectDB;