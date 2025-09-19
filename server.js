// backend/server.js
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { 
  Client, GatewayIntentBits, PermissionsBitField 
} = require('discord.js');
const helmet = require('helmet'); // Pour la sécurité des en-têtes HTTP
const hpp = require('hpp'); // Pour la protection contre la pollution des paramètres HTTP

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

// Middleware de sécurité
app.use(helmet());
app.use(hpp()); // Protection contre la pollution des paramètres HTTP

// Configuration CORS
const corsOptions = {
  origin: ['https://project-delta.fr', 'http://localhost:3000'], // Remplacez par l'URL de votre frontend en production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
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
});

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.warn('Authentication: No token provided.');
    return res.sendStatus(401);
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
      console.error('OAuth: Discord bot is not ready when processing guilds.');
      const processedGuilds = userGuilds.map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        memberCount: 0,
        isOwner: g.owner,
        hasAdminPerms: (BigInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION,
        isInServer: false
      }));
      return res.json({
        success: true,
        user,
        guilds: processedGuilds,
        accessToken: access_token,
        message: "Bot not fully ready, guild presence might be inaccurate."
      });
    }

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
    if (connection) connection.release();
  }
});

app.get('/api/guilds/:guildId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  try {
    const guild = req.botGuild; 

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

app.get('/api/guilds/:guildId/roles', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  try {
    const guild = req.botGuild;
    await guild.roles.fetch(); 

    const roles = guild.roles.cache
      .filter(role => !role.managed && role.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => ({
        id: role.id,
        name: role.name,
        color: role.hexColor,
        position: role.position
      }));

    res.json(roles);

  } catch (error) {
    console.error(`Erreur lors de la récupération des rôles de la guilde ${guildId} :`, error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
});

app.get('/api/guilds/:guildId/settings/economy', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  let connection;
  try {
    connection = await getDbConnection();
    const settings = await getGuildSettings(guildId);
    return res.json(settings);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres d'économie :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des paramètres d'économie." });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/guilds/:guildId/settings/economy', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const newEconomySettingsPayload = req.body;
  let connection;

  try {
    connection = await getDbConnection();
    let currentSettings = await getGuildSettings(guildId);
    
    // Utiliser une fusion profonde pour s'assurer que toutes les propriétés sont correctement mises à jour
    // et que les objets imbriqués sont fusionnés et non écrasés.
    const deepMerge = (target, source) => {
      const output = { ...target };
      if (target && typeof target === 'object' && source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
            output[key] = deepMerge(target[key], source[key]);
          } else {
            output[key] = source[key];
          }
        });
      }
      return output;
    };

    let mergedSettings = deepMerge(currentSettings, newEconomySettingsPayload);

    // Validation spécifique pour la roulette : numéros dupliqués par nom de pari
    if (mergedSettings.roulette_game && mergedSettings.roulette_game.outcomes) {
      const outcomeNames = {};
      for (const outcome of mergedSettings.roulette_game.outcomes) {
        if (!outcomeNames[outcome.name]) {
          outcomeNames[outcome.name] = new Set();
        }
        for (const num of outcome.numbers) {
          if (outcomeNames[outcome.name].has(num)) {
            return res.status(400).json({ message: `Erreur de validation de la Roulette: Le numéro ${num} est dupliqué pour le pari "${outcome.name}". Chaque numéro doit être unique par nom de pari.` });
          }
          outcomeNames[outcome.name].add(num);
        }
      }
    }

    // Assurer que max_multiplier est un nombre flottant
    if (mergedSettings.crash_game && typeof mergedSettings.crash_game.max_multiplier === 'string') {
      mergedSettings.crash_game.max_multiplier = parseFloat(mergedSettings.crash_game.max_multiplier);
    } else if (mergedSettings.crash_game && typeof mergedSettings.crash_game.max_multiplier !== 'number') {
        // Fallback si ce n'est ni une chaîne ni un nombre (ex: null, undefined)
        // Utiliser la valeur par défaut du backend pour éviter les problèmes
        mergedSettings.crash_game.max_multiplier = 100.0; // Valeur par défaut du DEFAULT_ECONOMY_SETTINGS
    }

    // Explicitly remove theme properties from the merged settings before saving
    if (mergedSettings.general_embeds) {
      delete mergedSettings.general_embeds.balance_embed_theme;
      delete mergedSettings.general_embeds.collect_embed_theme;
    }

    // Conserver les collect_roles car ils sont gérés séparément
    mergedSettings.collect_roles = currentSettings.collect_roles; 

    await updateEconomySettings(guildId, mergedSettings);
    return res.json({ message: "Paramètres d'économie mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres d'économie :", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres d'économie." });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/guilds/:guildId/settings/economy/collect_role', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const { role_id, amount, cooldown } = req.body;
  let connection;

  if (!role_id || !amount || !cooldown) {
    return res.status(400).json({ message: "Données de rôle de collect manquantes (role_id, amount, cooldown)." });
  }

  if (typeof amount !== 'number' || amount <= 0 || typeof cooldown !== 'number' || cooldown <= 0) {
      return res.status(400).json({ message: "Montant et cooldown doivent être des nombres positifs." });
  }

  try {
    connection = await getDbConnection();
    await addCollectRole(guildId, { role_id, amount, cooldown });
    return res.status(201).json({ message: "Rôle de collect ajouté avec succès." });
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
  if (!itemData.name || typeof itemData.price === 'undefined' || itemData.price < 0) {
    return { isValid: false, message: "Nom et prix de l'article sont requis et le prix doit être positif." };
  }
  if (!itemData.unlimited_stock && (typeof itemData.stock === 'undefined' || itemData.stock < 0)) {
    return { isValid: false, message: "Le stock doit être défini et positif si le stock n'est pas illimité." };
  }
  if (itemData.max_purchase_per_transaction !== null && itemData.max_purchase_per_transaction < 1) {
    return { isValid: false, message: "La quantité maximale par transaction doit être au moins 1 ou vide pour illimité." };
  }
  // Plus de validations peuvent être ajoutées ici selon besoin
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

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
  initializeDbPool();
});
