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

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
};

// Centralized database connection pool (recommended for production)
let pool;
async function initializeDbPool() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool initialized!');
    // Test connection
    const connection = await pool.getConnection();
    connection.release(); // Release the connection back to the pool
    console.log('Successfully connected to MySQL database!');
  } catch (error) {
    console.error('Failed to initialize MySQL connection pool:', error);
    // Exit the process if database connection fails at startup
    process.exit(1); 
  }
}

// Modified getDbConnection to use the pool
async function getDbConnection() {
  if (!pool) {
    await initializeDbPool(); // Initialize if not already
  }
  return pool.getConnection(); // Get a connection from the pool
}


const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.once('ready', () => {
  console.log(`Bot connecté en tant que ${bot.user.tag}`);
});

// Add error handling for bot login
bot.on('error', error => {
  console.error('Discord bot encountered an error:', error);
});

bot.login(BOT_TOKEN).catch(err => {
  console.error('Failed to login to Discord bot:', err);
  // Consider exiting or retrying if bot login is critical
});


// ----------------------
// Middleware d'authentification
// ----------------------
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

// ----------------------
// Middleware de vérification des permissions d'administrateur de guilde
// ----------------------
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

    // Ensure bot is ready before checking its presence
    if (!bot.isReady()) {
      console.error('Permission Check: Discord bot is not ready.');
      return res.status(503).json({ message: "Le bot Discord n'est pas prêt. Veuillez réessayer plus tard." });
    }

    const botGuild = bot.guilds.cache.get(guildId);
    if (!botGuild) {
      console.warn(`Permission Check: Bot is not present on guild ${guildId}.`);
      return res.status(404).json({ message: "Le bot n'est pas présent sur ce serveur." });
    }

    // Attach botGuild to request for later use if needed
    req.botGuild = botGuild; 
    next();

  } catch (error) {
    console.error(`Erreur lors de la vérification des permissions pour la guilde ${guildId}:`, error.response?.data || error.message);
    // More specific error handling for Axios errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return res.status(401).json({ message: "Jeton d'accès Discord invalide ou expiré." });
      }
      if (error.response?.status === 429) {
        // This 429 would be from Discord API, not Render.
        // If Render itself is rate-limiting, it would be before this middleware.
        return res.status(429).json({ message: "Trop de requêtes vers l'API Discord. Veuillez réessayer." });
      }
    }
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

    // Ensure bot is ready before accessing its cache
    if (!bot.isReady()) {
      console.error('OAuth: Discord bot is not ready when processing guilds.');
      // Fallback: return guilds without bot presence info, or handle gracefully
      const processedGuilds = userGuilds.map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        memberCount: 0, // Cannot get accurate member count without bot
        isOwner: g.owner,
        hasAdminPerms: (BigInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION,
        isInServer: false // Assume false if bot not ready
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
    if (connection) connection.release(); // Use release for pool connections
  }
});

// ----------------------
// Route : Récupérer les informations d'une guilde par son ID
// ----------------------
app.get('/api/guilds/:guildId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  try {
    // req.botGuild is already set by checkGuildAdminPermissions
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

// ----------------------
// Route : Récupérer les rôles d'une guilde par son ID
// ----------------------
app.get('/api/guilds/:guildId/roles', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  try {
    // req.botGuild is already set by checkGuildAdminPermissions
    const guild = req.botGuild;

    // Fetch roles to ensure cache is up-to-date, especially for large guilds
    await guild.roles.fetch(); 

    const roles = guild.roles.cache
      .filter(role => !role.managed && role.id !== guild.id) // Filter out managed roles and @everyone
      .sort((a, b) => b.position - a.position) // Sort by position (highest first)
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


// ----------------------
// Routes pour paramètres d'économie (GET global, POST pour update l'objet JSON)
// ----------------------
app.get('/api/guilds/:guildId/settings/economy', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  let connection; // Declare connection here
  try {
    connection = await getDbConnection(); // Get connection from pool
    const settings = await getGuildSettings(guildId);
    return res.json(settings);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres d'économie :", error);
    // If the error is due to Render's rate limiting on the backend itself,
    // this error might not be directly caught here as a 429 from the client's perspective.
    // However, if it's an internal server error (e.g., DB issue), it's 500.
    return res.status(500).json({ message: "Erreur lors de la récupération des paramètres d'économie." });
  } finally {
    if (connection) connection.release(); // Release connection back to pool
  }
});

app.post('/api/guilds/:guildId/settings/economy', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const newEconomySettingsPayload = req.body;
  let connection; // Declare connection here

  try {
    connection = await getDbConnection(); // Get connection from pool
    let currentSettings = await getGuildSettings(guildId);
    const mergedSettings = { ...currentSettings };
    for (const key in newEconomySettingsPayload) {
        if (typeof newEconomySettingsPayload[key] === 'object' && !Array.isArray(newEconomySettingsPayload[key]) && mergedSettings[key]) {
                mergedSettings[key] = { ...mergedSettings[key], ...newEconomySettingsPayload[key] };
            } else {
                mergedSettings[key] = newEconomySettingsPayload[key];
            }
        }
    // Ensure collect_roles are not overwritten by the payload, they are managed separately
    mergedSettings.collect_roles = currentSettings.collect_roles; 

    await updateEconomySettings(guildId, mergedSettings);
    return res.json({ message: "Paramètres d'économie mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres d'économie :", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres d'économie." });
  } finally {
    if (connection) connection.release(); // Release connection back to pool
  }
});


// ----------------------
// Routes spécifiques pour les rôles de collect
// ----------------------
app.post('/api/guilds/:guildId/settings/economy/collect_role', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const { role_id, amount, cooldown } = req.body;
  let connection; // Declare connection here

  if (!role_id || !amount || !cooldown) {
    return res.status(400).json({ message: "Données de rôle de collect manquantes (role_id, amount, cooldown)." });
  }

  if (typeof amount !== 'number' || amount <= 0 || typeof cooldown !== 'number' || cooldown <= 0) {
      return res.status(400).json({ message: "Montant et cooldown doivent être des nombres positifs." });
  }

  try {
    connection = await getDbConnection(); // Get connection from pool
    await addCollectRole(guildId, { role_id, amount, cooldown });
    return res.status(201).json({ message: "Rôle de collect ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du rôle de collect :", error);
    if (error.message.includes("existe déjà")) {
        return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur lors de l'ajout du rôle de collect." });
  } finally {
    if (connection) connection.release(); // Release connection back to pool
  }
});

app.delete('/api/guilds/:guildId/settings/economy/collect_role/:roleId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const roleIdToDelete = req.params.roleId;
  let connection; // Declare connection here

  try {
    connection = await getDbConnection(); // Get connection from pool
    await deleteCollectRole(guildId, roleIdToDelete);
    return res.json({ message: "Rôle de collect supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle de collect :", error);
    if (error.message.includes("pas été trouvé")) {
        return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur lors de la suppression du rôle de collect." });
  } finally {
    if (connection) connection.release(); // Release connection back to pool
  }
});

// Fonction utilitaire pour nettoyer et standardiser les URLs d'emojis Discord
function standardizeDiscordEmojiUrl(url) {
  // Regex pour capturer l'ID de l'emoji et le type (png, gif, webp)
  const discordEmojiUrlMatch = url.match(/^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif|webp)(\?.*)?$/);
  if (discordEmojiUrlMatch) {
    const emojiId = discordEmojiUrlMatch[1];
    const originalExtension = discordEmojiUrlMatch[2];
    const queryParams = discordEmojiUrlMatch[3] || '';

    // Déterminer si l'emoji est animé. Discord utilise .gif pour les emojis animés.
    // Si l'extension originale est gif, ou si les paramètres de requête indiquent une animation.
    const isAnimated = originalExtension === 'gif' || queryParams.includes('animated=true');
    
    // Retourne l'URL standardisée en .gif si animé, sinon en .png
    return `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
  }
  // Si ce n'est pas une URL d'emoji Discord standard, retourne l'URL telle quelle.
  return url;
}

// ----------------------
// Routes pour la gestion du Shop
// ----------------------

// GET tous les items du shop
app.get('/api/guilds/:guildId/shop/items', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  let connection; // Declare connection here
  try {
    connection = await getDbConnection(); // Get connection from pool
    console.log(`Fetching shop items for guild: ${guildId}`);
    const [rows] = await connection.execute(
      'SELECT id, item_data FROM shop_items WHERE guild_id = ?',
      [guildId]
    );
    return rows.map(row => ({ id: row.id, ...JSON.parse(row.item_data) }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des items du shop pour la guilde ${guildId}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération des items du shop." });
  } finally {
    if (connection) connection.release(); // Release connection back to pool
  }
});

// GET un item spécifique du shop
app.get('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const { guildId, itemId } = req.params;
  let connection; // Declare connection here
  try {
    connection = await getDbConnection(); // Get connection from pool
    console.log(`Fetching shop item ${itemId} for guild: ${guildId}`);
    const [rows] = await connection.execute(
      'SELECT id, item_data FROM shop_items WHERE guild_id = ? AND id = ?',
      [guildId, itemId]
    );
    if (rows.length === 0) {
      return null;
    }
    return { id: rows[0].id, ...JSON.parse(rows[0].item_data) };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'item ${itemId} pour la guilde ${guildId}:`, error);
    throw error;
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
    return { isValid: false, message: "Le stock doit être un nombre positif si le stock n'est pas illimité." };
  }
  if (itemData.max_purchase_per_transaction !== null && (typeof itemData.max_purchase_per_transaction !== 'number' || itemData.max_purchase_per_transaction <= 0)) {
    return { isValid: false, message: "La quantité maximale par transaction doit être un nombre positif ou nulle pour illimité." };
  }

  // Validate requirements and actions
  const validateRule = (rule, type) => {
    if (!rule.type || !rule.value) {
      return `Type ou valeur manquant pour une règle de ${type}.`;
    }
    if (['has_role', 'not_has_role'].includes(rule.type)) {
      // For roles, value should be a string (role ID)
      if (typeof rule.value !== 'string' || rule.value.length === 0) {
        return `ID de rôle invalide pour la règle de ${type} de type ${rule.type}.`;
      }
    } else if (['has_item', 'not_has_item'].includes(rule.type)) {
      // For items, value should be an object { itemId: string, quantity: number }
      if (typeof rule.value !== 'object' || !rule.value.itemId || typeof rule.value.quantity !== 'number' || rule.value.quantity <= 0) {
        return `Données d'item invalides pour la règle de ${type} de type ${rule.type}. (itemId et quantity > 0 requis)`;
      }
    } else if (['give_money'].includes(rule.type)) {
      if (typeof rule.value !== 'number' || rule.value < 0) {
        return `Montant d'argent invalide pour la règle de ${type} de type ${rule.type}.`;
      }
    } else if (['give_role', 'remove_role'].includes(rule.type)) {
      if (typeof rule.value !== 'string' || rule.value.length === 0) {
        return `ID de rôle invalide pour l'action de ${type} de type ${rule.type}.`;
      }
    } else if (['give_item', 'remove_item'].includes(rule.type)) {
      if (typeof rule.value !== 'object' || !rule.value.itemId || typeof rule.value.quantity !== 'number' || rule.value.quantity <= 0) {
        return `Données d'item invalides pour l'action de ${type} de type ${rule.type}. (itemId et quantity > 0 requis)`;
      }
    } else {
      return `Type de règle de ${type} inconnu: ${rule.type}.`;
    }
    return null; // No error
  };

  for (const req of itemData.requirements) {
    const error = validateRule(req, 'requirement');
    if (error) return { isValid: false, message: `Erreur dans les exigences d'achat: ${error}` };
  }
  for (const req of itemData.on_use_requirements) {
    const error = validateRule(req, 'on_use_requirement');
    if (error) return { isValid: false, message: `Erreur dans les exigences d'utilisation: ${error}` };
  }
  for (const action of itemData.on_purchase_actions) {
    const error = validateRule(action, 'on_purchase_action');
    if (error) return { isValid: false, message: `Erreur dans les actions d'achat: ${error}` };
  }
  for (const action of itemData.on_use_actions) {
    const error = validateRule(action, 'on_use_action');
    if (error) return { isValid: false, message: `Erreur dans les actions d'utilisation: ${error}` };
  }

  return { isValid: true };
}


async function addShopItem(guildId, itemData) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
    console.log(`Adding shop item for guild ${guildId}:`, itemData);

    const validation = await validateShopItemPayload(itemData);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Fusionner avec les valeurs par défaut pour s'assurer que tous les champs sont présents
    const mergedItemData = { ...DEFAULT_SHOP_ITEM, ...itemData };
    const itemJson = JSON.stringify(mergedItemData);
    const [result] = await connection.execute(
      'INSERT INTO shop_items (guild_id, item_data) VALUES (?, ?)',
      [guildId, itemJson]
    );
    console.log(`Shop item added successfully for guild ${guildId}.`);
    return { id: result.insertId, ...mergedItemData };
  } catch (error) {
    console.error(`Error in addShopItem for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function updateShopItem(guildId, itemId, itemData) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
    console.log(`Updating shop item ${itemId} for guild ${guildId}:`, itemData);

    const validation = await validateShopItemPayload(itemData);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Récupérer l'item existant pour une fusion profonde si nécessaire
    const existingItem = await getShopItemById(guildId, itemId); // This will use the pool too
    if (!existingItem) {
      throw new Error("Article non trouvé.");
    }
    // Fusionner les données existantes avec les nouvelles données
    const mergedItemData = { ...existingItem, ...itemData };
    const itemJson = JSON.stringify(mergedItemData);

    const [result] = await connection.execute(
      'UPDATE shop_items SET item_data = ? WHERE guild_id = ? AND id = ?',
      [itemJson, guildId, itemId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Article non trouvé ou aucune modification effectuée.");
    }
    console.log(`Shop item ${itemId} updated successfully for guild ${guildId}.`);
    return { id: itemId, ...mergedItemData };
  } catch (error) {
    console.error(`Error in updateShopItem for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteShopItem(guildId, itemId) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
    console.log(`Deleting shop item ${itemId} for guild ${guildId}.`);
    const [result] = await connection.execute(
      'DELETE FROM shop_items WHERE guild_id = ? AND id = ?',
      [guildId, itemId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Article non trouvé ou n'a pas pu être supprimé.");
    }
    console.log(`Shop item ${itemId} deleted successfully for guild ${guildId}.`);
  } catch (error) {
    console.error(`Error in deleteShopItem for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}


module.exports = {
  initializeDbPool, // Export this to be called once from server.js
  getGuildSettings,
  updateEconomySettings,
  addCollectRole,
  deleteCollectRole,
  getShopItems,
  getShopItemById,
  addShopItem,
  updateShopItem,
  deleteShopItem
};
