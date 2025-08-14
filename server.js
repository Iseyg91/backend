// server.js
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { Client, GatewayIntentBits } = require('discord.js');
const { getGuildSettings, updateGuildSettings } = require('./database'); // <-- ajout

const app = express();
const PORT = process.env.PORT || 3000;

// Discord OAuth2
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;

// MySQL
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
};

async function getDbConnection() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connecté à MySQL !');
  return connection;
}

// ----------------------
// Initialisation du bot Discord
// ----------------------
const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.once('ready', () => {
  console.log(`Bot connecté en tant que ${bot.user.tag}`);
});

// ----------------------
// Route OAuth2
// ----------------------
app.get('/api/discord-oauth', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Code non fourni.' });
  }

  try {
    // Échange code -> access_token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, token_type } = tokenResponse.data;

    // Infos utilisateur
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { authorization: `${token_type} ${access_token}` }
    });
    const user = userResponse.data;

    // Guildes utilisateur
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { authorization: `${token_type} ${access_token}` }
    });
    const userGuilds = guildsResponse.data;

    const ADMINISTRATOR_PERMISSION = 0x8;

    // ✅ Utilisation du cache local du bot → pas de rate limit
    // Assurez-vous que le bot est bien connecté avant d'accéder à bot.guilds.cache
    // Le bot.once('ready') garantit cela pour le démarrage, mais pour les requêtes
    // ultérieures, le cache est disponible.
    const botGuilds = bot.guilds.cache.map(g => ({
      id: g.id,
      name: g.name,
      memberCount: g.memberCount || 0
    }));

    const processedGuilds = userGuilds.map(g => {
      const hasAdminPerms = (parseInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
      const isOwner = g.owner;

      const botGuild = botGuilds.find(bg => bg.id === g.id);

      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        memberCount: botGuild ? botGuild.memberCount : 0,
        isOwner,
        hasAdminPerms,
        isInServer: !!botGuild
      };
    });

    res.json({
      success: true,
      user,
      guilds: processedGuilds,
      accessToken: access_token
    });

  } catch (error) {
    console.error('Erreur OAuth2 Discord :', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error_description || 'Erreur lors de l\'authentification Discord.'
    });
  }
});

// ----------------------
// Test connexion DB
// ----------------------
app.get('/api/test-db', async (req, res) => {
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
    res.json({ success: true, message: 'Connexion DB réussie', solution: rows[0].solution });
  } catch (error) {
    console.error('Erreur test DB :', error);
    res.status(500).json({ success: false, error: 'Erreur de connexion ou requête DB.' });
  } finally {
    if (connection) connection.end();
  }
});

// ----------------------
// NOUVELLE ROUTE : Récupérer les informations d'une guilde par son ID
// ----------------------
app.get('/api/guilds/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  try {
    // Vérifier si le bot est dans cette guilde et la récupérer depuis le cache
    const guild = bot.guilds.cache.get(guildId);

    if (!guild) {
      // Si la guilde n'est pas trouvée dans le cache du bot,
      // cela signifie que le bot n'est pas dans cette guilde ou que l'ID est invalide.
      return res.status(404).json({ success: false, message: "Guilde non trouvée ou bot non présent." });
    }

    // Retourner les informations de base de la guilde
    res.json({
      success: true,
      id: guild.id,
      name: guild.name,
      icon: guild.icon, // L'icône peut être null
      memberCount: guild.memberCount
      // Vous pouvez ajouter d'autres propriétés de la guilde si nécessaire
    });

  } catch (error) {
    console.error(`Erreur lors de la récupération des informations de la guilde ${guildId} :`, error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
});


// ----------------------
// Routes pour paramètres d'économie
// ----------------------
app.get('/api/guilds/:guildId/settings/economy', async (req, res) => {
  const guildId = req.params.guildId;
  try {
    const settings = await getGuildSettings(guildId);
    if (settings) {
      return res.json(settings);
    }
    return res.status(404).json({ message: "Aucun paramètre trouvé pour ce serveur." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des paramètres." });
  }
});

app.post('/api/guilds/:guildId/settings/economy', async (req, res) => {
  const guildId = req.params.guildId;
  const settings = req.body;
  try {
    await updateGuildSettings(guildId, settings);
    return res.json({ message: "Paramètres d'économie mis à jour avec succès." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres." });
  }
});

// ----------------------
// Lancement du serveur et du bot
// ----------------------
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});

bot.login(BOT_TOKEN);
