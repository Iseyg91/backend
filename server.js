// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route pour l'authentification Discord
app.get('/api/discord-oauth', async (req, res) => {
  const code = req.query.code;
  console.log('Code reçu:', code);

  if (!code) {
    return res.status(400).json({ success: false, error: 'Code Discord manquant.' });
  }

  try {
    // Étape 1: Échanger le code contre un access_token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
      scope: 'identify guilds'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Réponse du token:', tokenResponse.data);

    const { access_token, token_type } = tokenResponse.data;

    // Étape 2: Utiliser l'access_token pour obtenir les infos de l'utilisateur
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${token_type} ${access_token}`
      }
    });

    console.log('Réponse de l\'utilisateur:', userResponse.data);
    const user = userResponse.data;

    // Étape 3: Obtenir les guildes de l'utilisateur
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        authorization: `${token_type} ${access_token}`
      }
    });

    let guilds = guildsResponse.data;
    const ADMINISTRATOR_PERMISSION = 0x8;

    const processedGuilds = guilds.map(g => {
      const hasAdminPerms = (parseInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
      const isOwner = g.owner;
      const isInServer = true; // À remplacer par ta logique réelle
      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        memberCount: g.approximate_member_count || 0,
        isOwner: isOwner,
        hasAdminPerms: hasAdminPerms,
        isInServer: isInServer
      };
    });

    // Renvoyer les données au frontend
    res.json({
      success: true,
      user: user,
      guilds: processedGuilds
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
