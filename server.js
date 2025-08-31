// backend/server.js
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { 
  getGuildSettings, 
  updateEconomySettings, 
  addCollectRole, 
  deleteCollectRole,
  getShopItems,
  getShopItemById,
  addShopItem,
  updateShopItem,
  deleteShopItem
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;

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

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.once('ready', () => {
  console.log(`Bot connecté en tant que ${bot.user.tag}`);
});

// ----------------------
// Middleware d'authentification
// ----------------------
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Pas de token

  // Dans un vrai projet, vous vérifieriez ce token avec Discord ou votre propre système de session.
  // Pour cet exemple, nous allons simplement le stocker.
  req.accessToken = token;
  next();
}

// ----------------------
// Middleware de vérification des permissions d'administrateur de guilde
// ----------------------
async function checkGuildAdminPermissions(req, res, next) {
  const guildId = req.params.guildId;
  const accessToken = req.accessToken; // Récupéré par authenticateToken

  if (!guildId || !accessToken) {
    return res.status(400).json({ message: "ID de guilde ou jeton d'accès manquant." });
  }

  try {
    // 1. Récupérer les guildes de l'utilisateur via l'API Discord
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    const userGuilds = guildsResponse.data;

    // 2. Trouver la guilde spécifique et vérifier les permissions
    const ADMINISTRATOR_PERMISSION = PermissionsBitField.Flags.Administrator;
    const targetGuild = userGuilds.find(g => g.id === guildId);

    if (!targetGuild) {
      return res.status(403).json({ message: "Accès refusé : Guilde non trouvée pour cet utilisateur." });
    }

    const hasAdminPerms = (BigInt(targetGuild.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
    const isOwner = targetGuild.owner;

    if (!hasAdminPerms && !isOwner) {
      return res.status(403).json({ message: "Accès refusé : Vous n'avez pas les permissions d'administrateur sur cette guilde." });
    }

    // 3. Vérifier si le bot est dans la guilde
    const botGuild = bot.guilds.cache.get(guildId);
    if (!botGuild) {
      return res.status(404).json({ message: "Le bot n'est pas présent sur ce serveur." });
    }

    // Si tout est bon, passer au middleware/route suivant
    next();

  } catch (error) {
    console.error(`Erreur lors de la vérification des permissions pour la guilde ${guildId}:`, error.response?.data || error.message);
    res.status(500).json({ message: "Erreur interne du serveur lors de la vérification des permissions." });
  }
}


// ----------------------
// Route OAuth2
// ----------------------
app.get('/api/discord-oauth', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Code non fourni.' });
  }

  try {
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

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { authorization: `${token_type} ${access_token}` }
    });
    const user = userResponse.data;

    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { authorization: `${token_type} ${access_token}` }
    });
    const userGuilds = guildsResponse.data;

    const ADMINISTRATOR_PERMISSION = PermissionsBitField.Flags.Administrator;

    const botGuilds = bot.guilds.cache.map(g => ({
      id: g.id,
      name: g.name,
      memberCount: g.memberCount || 0
    }));

    const processedGuilds = userGuilds.map(g => {
      const hasAdminPerms = (BigInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
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
// Appliquer le middleware de vérification des permissions
app.get('/api/guilds/:guildId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
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
// Route : Récupérer les rôles d'une guilde par son ID
// ----------------------
// Appliquer le middleware de vérification des permissions
app.get('/api/guilds/:guildId/roles', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  try {
    const guild = bot.guilds.cache.get(guildId);

    if (!guild) {
      return res.status(404).json({ success: false, message: "Guilde non trouvée ou bot non présent." });
    }

    // Récupérer les rôles et les trier par position (du plus haut au plus bas)
    const roles = guild.roles.cache
      .filter(role => !role.managed && role.id !== guild.id) // Exclure les rôles gérés par des intégrations et @everyone
      .sort((a, b) => b.position - a.position)
      .map(role => ({
        id: role.id,
        name: role.name,
        color: role.hexColor, // Inclure la couleur du rôle
        position: role.position
      }));

    res.json(roles);

  } catch (error) {
    console.error(`Erreur lors de la récupération des rôles de la guilde ${guildId} :`, error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
});


// ----------------------
// Routes pour paramètres d'économie (GET global, POST pour update l'objet JSON)
// ----------------------
// Appliquer le middleware de vérification des permissions
app.get('/api/guilds/:guildId/settings/economy', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  try {
    const settings = await getGuildSettings(guildId);
    return res.json(settings);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres d'économie :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des paramètres d'économie." });
  }
});

// Appliquer le middleware de vérification des permissions
app.post('/api/guilds/:guildId/settings/economy', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const newEconomySettingsPayload = req.body;

  try {
    let currentSettings = await getGuildSettings(guildId);
    const mergedSettings = { ...currentSettings };
    for (const key in newEconomySettingsPayload) {
        if (typeof newEconomySettingsPayload[key] === 'object' && !Array.isArray(newEconomySettingsPayload[key]) && mergedSettings[key]) {
                mergedSettings[key] = { ...mergedSettings[key], ...newEconomySettingsPayload[key] };
            } else {
                mergedSettings[key] = newEconomySettingsPayload[key];
            }
        }
    mergedSettings.collect_roles = currentSettings.collect_roles; // Ne pas écraser les rôles de collect ici

    await updateEconomySettings(guildId, mergedSettings);
    return res.json({ message: "Paramètres d'économie mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres d'économie :", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres d'économie." });
  }
});


// ----------------------
// Routes spécifiques pour les rôles de collect
// ----------------------
// Appliquer le middleware de vérification des permissions
app.post('/api/guilds/:guildId/settings/economy/collect_role', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const { role_id, amount, cooldown } = req.body;

  if (!role_id || !amount || !cooldown) {
    return res.status(400).json({ message: "Données de rôle de collect manquantes (role_id, amount, cooldown)." });
  }

  if (typeof amount !== 'number' || amount <= 0 || typeof cooldown !== 'number' || cooldown <= 0) {
      return res.status(400).json({ message: "Montant et cooldown doivent être des nombres positifs." });
  }

  try {
    await addCollectRole(guildId, { role_id, amount, cooldown });
    return res.status(201).json({ message: "Rôle de collect ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du rôle de collect :", error);
    if (error.message.includes("existe déjà")) {
        return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur lors de l'ajout du rôle de collect." });
  }
});

// Appliquer le middleware de vérification des permissions
app.delete('/api/guilds/:guildId/settings/economy/collect_role/:roleId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const roleIdToDelete = req.params.roleId;

  try {
    await deleteCollectRole(guildId, roleIdToDelete);
    return res.json({ message: "Rôle de collect supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle de collect :", error);
    if (error.message.includes("pas été trouvé")) {
        return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur lors de la suppression du rôle de collect." });
  }
});

// ----------------------
// Routes pour la gestion du Shop
// ----------------------

// GET tous les items du shop
// Appliquer le middleware de vérification des permissions
app.get('/api/guilds/:guildId/shop/items', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  try {
    const items = await getShopItems(guildId);
    res.json(items);
  } catch (error) {
    console.error(`Erreur lors de la récupération des items du shop pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération des items du shop." });
  }
});

// GET un item spécifique du shop
// Appliquer le middleware de vérification des permissions
app.get('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const { guildId, itemId } = req.params;
  try {
    const item = await getShopItemById(guildId, itemId);
    if (!item) {
      return res.status(404).json({ message: "Article non trouvé." });
    }
    res.json(item);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'item ${itemId} pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération de l'article." });
  }
});

// POST (ajouter) un item au shop
// Appliquer le middleware de vérification des permissions
app.post('/api/guilds/:guildId/shop/items', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const itemData = req.body;

  if (!itemData.name || typeof itemData.price === 'undefined' || itemData.price < 0) {
    return res.status(400).json({ message: "Nom et prix de l'article sont requis et le prix doit être positif." });
  }
  if (!itemData.unlimited_stock && (typeof itemData.stock === 'undefined' || itemData.stock < 0)) {
      return res.status(400).json({ message: "Le stock doit être un nombre positif si le stock n'est pas illimité." });
  }
  if (!Array.isArray(itemData.requirements)) itemData.requirements = [];
  if (!Array.isArray(itemData.on_use_requirements)) itemData.on_use_requirements = [];
  if (!Array.isArray(itemData.on_purchase_actions)) itemData.on_purchase_actions = [];
  if (!Array.isArray(itemData.on_use_actions)) itemData.on_use_actions = [];


  try {
    const newItem = await addShopItem(guildId, itemData);
    res.status(201).json({ message: "Article ajouté avec succès.", item: newItem });
  } catch (error) {
    console.error(`Erreur lors de l'ajout de l'item au shop pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'article au shop." });
  }
});

// PUT (modifier) un item du shop
// Appliquer le middleware de vérification des permissions
app.put('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const { guildId, itemId } = req.params;
  const itemData = req.body;

  if (!itemData.name || typeof itemData.price === 'undefined' || itemData.price < 0) {
    return res.status(400).json({ message: "Nom et prix de l'article sont requis et le prix doit être positif." });
  }
  if (!itemData.unlimited_stock && (typeof itemData.stock === 'undefined' || itemData.stock < 0)) {
      return res.status(400).json({ message: "Le stock doit être un nombre positif si le stock n'est pas illimité." });
  }
  if (!Array.isArray(itemData.requirements)) itemData.requirements = [];
  if (!Array.isArray(itemData.on_use_requirements)) itemData.on_use_requirements = [];
  if (!Array.isArray(itemData.on_purchase_actions)) itemData.on_purchase_actions = [];
  if (!Array.isArray(itemData.on_use_actions)) itemData.on_use_actions = [];

  try {
    const updatedItem = await updateShopItem(guildId, itemId, itemData);
    res.json({ message: "Article mis à jour avec succès.", item: updatedItem });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'item ${itemId} pour la guilde ${guildId}:`, error);
    if (error.message.includes("Article non trouvé")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'article." });
  }
});

// DELETE un item du shop
// Appliquer le middleware de vérification des permissions
app.delete('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const { guildId, itemId } = req.params;
  try {
    await deleteShopItem(guildId, itemId);
    res.json({ message: "Article supprimé avec succès." });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'item ${itemId} pour la guilde ${guildId}:`, error);
    if (error.message.includes("Article non trouvé")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors de la suppression de l'article." });
  }
});


// ----------------------
// Lancement du serveur et du bot
// ----------------------
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});

bot.login(BOT_TOKEN);

