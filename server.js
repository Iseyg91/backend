// server.js
const express = require('express');
const axios = require('axios'); // Pour faire des requêtes HTTP
const cors = require('cors'); // Pour gérer les CORS
require('dotenv').config(); // Pour charger les variables d'environnement

const app = express(); // Déclaration de l'application Express
const PORT = process.env.PORT || 3000; // Le port sur lequel votre backend va écouter

// Middleware
app.use(cors()); // Active CORS pour toutes les requêtes
app.use(express.json()); // Pour parser le JSON dans les requêtes

// Route pour l'authentification Discord
app.get('/api/discord-oauth', async (req, res) => {
  const code = req.query.code;
  console.log('Code reçu:', code); // Log du code reçu

  if (!code) {
    return res.status(400).json({ success: false, error: 'Code Discord manquant.' });
  }

  try {
    // Étape 1: Échanger le code contre un access_token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.CLIENT_ID, // Utilisez la variable d'environnement
      client_secret: process.env.CLIENT_SECRET, // Utilisez la variable d'environnement
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.REDIRECT_URI, // Utilisez la variable d'environnement
      scope: 'identify guilds' // Assurez-vous que les scopes correspondent à ceux demandés par le frontend
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Réponse du token:', tokenResponse.data); // Log de la réponse du token

    const { access_token, token_type } = tokenResponse.data;

    // Étape 2: Utiliser l'access_token pour obtenir les infos de l'utilisateur
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${token_type} ${access_token}`
      }
    });

    console.log('Réponse de l\'utilisateur:', userResponse.data); // Log de la réponse de l'utilisateur

    const user = userResponse.data;

    // Étape 3: (Optionnel) Obtenir les guildes de l'utilisateur
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        authorization: `${token_type} ${access_token}`
      }
    });

    const guilds = guildsResponse.data;

    // Renvoyer les données au frontend
    res.json({
      success: true,
      user: user,
      guilds: guilds,
      accessToken: access_token // Renvoyez l'access_token si dashboard-servers.html en a besoin
    });

  } catch (error) {
    console.error('Erreur lors de l\'authentification Discord:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'authentification Discord.' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Backend Discord OAuth écoutant sur le port ${PORT}`);
});
