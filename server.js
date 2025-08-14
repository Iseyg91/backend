// server.js
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { Client, GatewayIntentBits } = require('discord.js');
// Importez les nouvelles fonctions
const { getGuildSettings, updateGuildSettings, addCollectRole, deleteCollectRole } = require('./database');

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
// Route : Récupérer les informations d'une guilde par son ID
// ----------------------
app.get('/api/guilds/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  try {
    const guild = bot.guilds.cache.get(guildId);

    if (!guild) {
      return res.status(404).json({ success: false, message: "Guilde non trouvée ou bot non présent." });
    }

    res.json({
      success: true,
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      memberCount: guild.memberCount
    });

  } catch (error) {
    console.error(`Erreur lors de la récupération des informations de la guilde ${guildId} :`, error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
});


// ----------------------
// Routes pour paramètres d'économie (Embeds)
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
// NOUVELLES ROUTES : Gestion des rôles de collect
// ----------------------

// Route pour ajouter un rôle de collect
app.post('/api/guilds/:guildId/settings/economy/collect_role', async (req, res) => {
  const guildId = req.params.guildId;
  const { role_id, amount, cooldown } = req.body;

  if (!role_id || !amount || !cooldown) {
    return res.status(400).json({ message: "Données de rôle de collect manquantes (role_id, amount, cooldown)." });
  }

  // Valider que amount et cooldown sont des nombres positifs
  if (typeof amount !== 'number' || amount <= 0 || typeof cooldown !== 'number' || cooldown <= 0) {
      return res.status(400).json({ message: "Montant et cooldown doivent être des nombres positifs." });
  }

  try {
    await addCollectRole(guildId, { role_id, amount, cooldown });
    return res.status(201).json({ message: "Rôle de collect ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du rôle de collect :", error);
    // Gérer le cas où le rôle existe déjà
    if (error.message.includes("existe déjà")) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    return res.status(500).json({ message: "Erreur lors de l'ajout du rôle de collect." });
  }
});

// Route pour supprimer un rôle de collect
app.delete('/api/guilds/:guildId/settings/economy/collect_role/:roleId', async (req, res) => {
  const guildId = req.params.guildId;
  const roleIdToDelete = req.params.roleId;

  try {
    await deleteCollectRole(guildId, roleIdToDelete);
    return res.json({ message: "Rôle de collect supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle de collect :", error);
    // Gérer le cas où le rôle n'est pas trouvé
    if (error.message.includes("pas été trouvé")) {
        return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur lors de la suppression du rôle de collect." });
  }
});


// ----------------------
// Lancement du serveur et du bot
// ----------------------
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});

bot.login(BOT_TOKEN);
