// backend/server.js
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { 
  Client, GatewayIntentBits, PermissionsBitField 
} = require('discord.js');
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

// Configuration CORS pour une sécurité renforcée
// Utiliser une fonction pour permettre plusieurs origines (localhost pour dev, site prod)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:8080', 'https://project-delta.fr'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Activer SSL/TLS si votre base de données le supporte et l'exige
  // ssl: {
  //   rejectUnauthorized: true, // Définir à false si vous utilisez un certificat auto-signé en dev, mais true en prod
  //   ca: fs.readFileSync('/path/to/your/ca-cert.pem') // Chemin vers votre certificat CA
  // }
};

let pool;
async function initializeDbPool() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool initialized!');
    const connection = await pool.getConnection();
    connection.release();
    console.log('Successfully connected to MySQL database!');
  } catch (error) {
    console.error('Failed to initialize MySQL connection pool:', error);
    // En production, il est crucial de ne pas démarrer si la DB n'est pas accessible
    process.exit(1); 
  }
}

async function getDbConnection() {
  if (!pool) {
    await initializeDbPool();
  }
  return pool.getConnection();
}

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.once('ready', () => {
  console.log(`Bot connecté en tant que ${bot.user.tag}`);
});

bot.on('error', error => {
  console.error('Discord bot encountered an error:', error);
});

bot.login(BOT_TOKEN).catch(err => {
  console.error('Failed to login to Discord bot:', err);
  // En production, si le bot ne peut pas se connecter, cela peut être critique
  // process.exit(1); 
});

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.warn('Authentication: No token provided.');
    return res.sendStatus(401); // Unauthorized
  }

  req.accessToken = token;
  next();
}

async function checkGuildAdminPermissions(req, res, next) {
  const guildId = req.params.guildId;
  const accessToken = req.accessToken;

  if (!guildId || !accessToken) {
    console.warn('Permission Check: Missing guildId or accessToken.');
    return res.status(400).json({ message: "ID de guilde ou jeton d'accès manquant." });
  }

  try {
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    const userGuilds = guildsResponse.data;

    const ADMINISTRATOR_PERMISSION = PermissionsBitField.Flags.Administrator;
    const targetGuild = userGuilds.find(g => g.id === guildId);

    if (!targetGuild) {
      console.warn(`Permission Check: Guild ${guildId} not found for user with provided token.`);
      return res.status(403).json({ message: "Accès refusé : Guilde non trouvée pour cet utilisateur." });
    }

    const hasAdminPerms = (BigInt(targetGuild.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
    const isOwner = targetGuild.owner;

    if (!hasAdminPerms && !isOwner) {
      console.warn(`Permission Check: User does not have admin permissions or is not owner for guild ${guildId}.`);
      return res.status(403).json({ message: "Accès refusé : Vous n'avez pas les permissions d'administrateur sur cette guilde." });
    }

    if (!bot.isReady()) {
      console.error('Permission Check: Discord bot is not ready.');
      return res.status(503).json({ message: "Le bot Discord n'est pas prêt. Veuillez réessayer plus tard." });
    }

    const botGuild = bot.guilds.cache.get(guildId);
    if (!botGuild) {
      console.warn(`Permission Check: Bot is not present on guild ${guildId}.`);
      return res.status(404).json({ message: "Le bot n'est pas présent sur ce serveur." });
    }

    req.botGuild = botGuild; 
    next();

  } catch (error) {
    console.error(`Erreur lors de la vérification des permissions pour la guilde ${guildId}:`, error.response?.data || error.message);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return res.status(401).json({ message: "Jeton d'accès Discord invalide ou expiré." });
      }
      if (error.response?.status === 429) {
        return res.status(429).json({ message: "Trop de requêtes vers l'API Discord. Veuillez réessayer." });
      }
    }
    res.status(500).json({ message: "Erreur interne du serveur lors de la vérification des permissions." });
  }
}

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

    if (!bot.isReady()) {
      console.error('OAuth: Discord bot is not ready when processing OAuth callback.');
      return res.status(503).json({ success: false, error: 'Bot Discord non prêt.' });
    }

    const mutualGuilds = userGuilds.map(guild => {
      const botGuild = bot.guilds.cache.get(guild.id);
      const hasAdminPerms = (BigInt(guild.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        isOwner: guild.owner,
        hasAdminPerms: hasAdminPerms,
        isInServer: !!botGuild,
        memberCount: botGuild ? botGuild.memberCount : 0
      };
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
      },
      guilds: mutualGuilds,
      accessToken: access_token
    });

  } catch (error) {
    console.error('Erreur lors de l\'échange du code OAuth:', error.response?.data || error.message);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        return res.status(error.response.status).json({ success: false, error: 'Code OAuth invalide ou expiré.' });
      }
    }
    return res.status(500).json({ success: false, error: 'Erreur interne lors de l\'authentification Discord.' });
  }
});

app.get('/api/guilds/:guildId/settings', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  let connection;
  try {
    connection = await getDbConnection();
    const settings = await getGuildSettings(guildId);
    return res.json(settings);
  } catch (error) {
    console.error(`Erreur lors de la récupération des paramètres pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération des paramètres." });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/guilds/:guildId/settings/economy', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const newSettings = req.body;
  let connection;
  try {
    connection = await getDbConnection();
    const updatedSettings = await updateEconomySettings(guildId, newSettings);
    return res.json(updatedSettings);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des paramètres d'économie pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres d'économie." });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/guilds/:guildId/roles', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const botGuild = req.botGuild;
  try {
    const roles = botGuild.roles.cache.map(role => ({
      id: role.id,
      name: role.name,
      color: role.hexColor
    }));
    return res.json(roles);
  } catch (error) {
    console.error(`Erreur lors de la récupération des rôles pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération des rôles." });
  }
});

app.get('/api/guilds/:guildId/collect_roles', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT role_id, amount, cooldown FROM collect_roles WHERE guild_id = ?',
      [guildId]
    );
    return res.json(rows);
  } catch (error) {
    console.error(`Erreur lors de la récupération des rôles de collect pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération des rôles de collect." });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/guilds/:guildId/settings/economy/collect_role', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const roleData = req.body;
  let connection;

  // Validation des données d'entrée
  if (!roleData.role_id || typeof roleData.role_id !== 'string' || !/^\d{17,19}$/.test(roleData.role_id)) {
    return res.status(400).json({ message: "L'ID du rôle est requis et doit être valide." });
  }
  if (typeof roleData.amount !== 'number' || roleData.amount <= 0) {
    return res.status(400).json({ message: "Le montant doit être un nombre positif." });
  }
  if (typeof roleData.cooldown !== 'number' || roleData.cooldown <= 0) {
    return res.status(400).json({ message: "Le cooldown doit être un nombre positif (en secondes)." });
  }

  try {
    connection = await getDbConnection();
    await addCollectRole(guildId, roleData);
    return res.json({ message: "Rôle de collect ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du rôle de collect :", error);
    if (error.message.includes("existe déjà")) {
        return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur lors de l'ajout du rôle de collect." });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/guilds/:guildId/settings/economy/collect_role/:roleId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const roleIdToDelete = req.params.roleId;
  let connection;

  // Validation de l'ID du rôle
  if (typeof roleIdToDelete !== 'string' || !/^\d{17,19}$/.test(roleIdToDelete)) {
    return res.status(400).json({ message: "L'ID du rôle à supprimer est invalide." });
  }

  try {
    connection = await getDbConnection();
    await deleteCollectRole(guildId, roleIdToDelete);
    return res.json({ message: "Rôle de collect supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle de collect :", error);
    if (error.message.includes("pas été trouvé")) {
        return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur lors de la suppression du rôle de collect." });
  } finally {
    if (connection) connection.release();
  }
});

function standardizeDiscordEmojiUrl(url) {
  // Nettoie l'URL pour s'assurer qu'elle pointe vers .png ou .gif
  const discordEmojiUrlMatch = url.match(/^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif|webp)(\?.*)?$/);
  if (discordEmojiUrlMatch) {
    const emojiId = discordEmojiUrlMatch[1];
    const originalExtension = discordEmojiUrlMatch[2];
    const queryParams = discordEmojiUrlMatch[3] || '';
    const isAnimated = originalExtension === 'gif' || queryParams.includes('animated=true');
    return `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
  }
  return url;
}

app.get('/api/guilds/:guildId/shop/items', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  let connection;
  try {
    connection = await getDbConnection();
    console.log(`Fetching shop items for guild: ${guildId}`);
    const items = await getShopItems(guildId); // Use the updated getShopItems
    return res.json(items);
  } catch (error) {
    console.error(`Erreur lors de la récupération des items du shop pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération des items du shop." });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const { guildId, itemId } = req.params;
  let connection;
  try {
    connection = await getDbConnection();
    console.log(`Fetching shop item ${itemId} for guild: ${guildId}`);
    const item = await getShopItemById(guildId, itemId); // Use the updated getShopItemById
    if (!item) {
      return res.status(404).json({ message: "Article non trouvé." });
    }
    return res.json(item);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'item ${itemId} pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

async function validateShopItemPayload(itemData) {
  if (!itemData.name || typeof itemData.name !== 'string' || itemData.name.trim() === '') {
    return { isValid: false, message: "Le nom de l'article est requis." };
  }
  if (typeof itemData.price === 'undefined' || typeof itemData.price !== 'number' || itemData.price < 0) {
    return { isValid: false, message: "Le prix de l'article est requis et doit être un nombre positif." };
  }
  if (!itemData.unlimited_stock && (typeof itemData.stock === 'undefined' || typeof itemData.stock !== 'number' || itemData.stock < 0)) {
    return { isValid: false, message: "Le stock doit être défini et positif si le stock n'est pas illimité." };
  }
  if (itemData.max_purchase_per_transaction !== null && (typeof itemData.max_purchase_per_transaction !== 'number' || itemData.max_purchase_per_transaction < 1)) {
    return { isValid: false, message: "La quantité maximale par transaction doit être au moins 1 ou vide pour illimité." };
  }
  // Plus de validations peuvent être ajoutées ici selon besoin (ex: validation des structures requirements/actions)
  return { isValid: true };
}

app.post('/api/guilds/:guildId/shop/items', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const itemData = req.body;

  try {
    const validation = await validateShopItemPayload(itemData);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    // Standardiser l'URL emoji si besoin
    if (itemData.image_url) {
      itemData.image_url = standardizeDiscordEmojiUrl(itemData.image_url);
    }

    const newItem = await addShopItem(guildId, itemData);
    return res.status(201).json(newItem);
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'un item pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'article." });
  }
});

app.put('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const itemId = req.params.itemId;
  const itemData = req.body;

  try {
    const validation = await validateShopItemPayload(itemData);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    if (itemData.image_url) {
      itemData.image_url = standardizeDiscordEmojiUrl(itemData.image_url);
    }

    const updatedItem = await updateShopItem(guildId, itemId, itemData);
    return res.json(updatedItem);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'item ${itemId} pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'article." });
  }
});

app.delete('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const itemId = req.params.itemId;

  try {
    await deleteShopItem(guildId, itemId);
    return res.json({ message: "Article supprimé avec succès." });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'item ${itemId} pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'article." });
  }
});

// Gestion centralisée des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
  initializeDbPool();
});
