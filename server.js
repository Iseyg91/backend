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
    const mergedSettings = { ...currentSettings };

    for (const key in newEconomySettingsPayload) {
      if (typeof newEconomySettingsPayload[key] === 'object' && !Array.isArray(newEconomySettingsPayload[key]) && mergedSettings[key]) {
        // Deep merge for nested objects
        mergedSettings[key] = { ...mergedSettings[key], ...newEconomySettingsPayload[key] };
      } else {
        mergedSettings[key] = newEconomySettingsPayload[key];
      }
    }

    // Explicitly remove theme properties from the merged settings before saving
    if (mergedSettings.general_embeds) {
      delete mergedSettings.general_embeds.balance_embed_theme;
      delete mergedSettings.general_embeds.collect_embed_theme;
    }

    // Ensure collect_roles are preserved from currentSettings if not provided in payload
    if (!newEconomySettingsPayload.collect_roles) {
      mergedSettings.collect_roles = currentSettings.collect_roles; 
    }


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
  if (!url) return '';
  const customEmojiMatch = url.match(/<?(a)?:?(\w+):(\d+)>?/);
  const discordEmojiUrlMatch = url.match(/^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif|webp)(\?.*)?$/);

  if (customEmojiMatch) {
    const animated = customEmojiMatch[1] === 'a';
    const emojiId = customEmojiMatch[3];
    return `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;
  } else if (discordEmojiUrlMatch) {
    const emojiId = discordEmojiUrlMatch[1];
    const isAnimated = discordEmojiUrlMatch[2] === 'gif' || (discordEmojiUrlMatch[3] && discordEmojiUrlMatch[3].includes('animated=true'));
    return `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
  }
  return url; // Return as is if not a recognized Discord emoji format
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
    return { isValid: false, message: "Le stock doit être un nombre positif si le stock n'est pas illimité." };
  }
  if (itemData.max_purchase_per_transaction !== null && (typeof itemData.max_purchase_per_transaction !== 'number' || itemData.max_purchase_per_transaction <= 0)) {
    return { isValid: false, message: "La quantité maximale par transaction doit être un nombre positif ou nulle pour illimité." };
  }

  const validateRule = (rule, type) => {
    if (!rule.type || typeof rule.value === 'undefined') {
      return `Type ou valeur manquant pour une règle de ${type}.`;
    }
    if (['has_role', 'not_has_role', 'give_role', 'remove_role'].includes(rule.type)) {
      if (typeof rule.value !== 'string' || rule.value.length === 0) {
        return `ID de rôle invalide pour la règle/action de ${type} de type ${rule.type}.`;
      }
    } else if (['has_item', 'not_has_item', 'give_item', 'remove_item'].includes(rule.type)) {
      if (typeof rule.value !== 'object' || !rule.value.itemId || typeof rule.value.quantity !== 'number' || rule.value.quantity <= 0 || isNaN(Number(rule.value.itemId))) {
        return `Données d'item invalides pour la règle/action de ${type} de type ${rule.type}. (itemId doit être un nombre et quantity > 0 requis)`;
      }
    } else if (rule.type === 'give_money') {
      if (typeof rule.value !== 'number' || rule.value < 0) {
        return `Montant d'argent invalide pour l'action de ${type} de type ${rule.type}.`;
      }
    } else {
      return `Type de règle/action de ${type} inconnu: ${rule.type}.`;
    }
    return null;
  };

  for (const req of itemData.requirements) {
    const error = validateRule(req, 'requirement');
    if (error) return { isValid: false, message: `Erreur dans les exigences d'achat: ${error}` };
  }
  if (itemData.on_use_requirements) { // Check if property exists
    for (const req of itemData.on_use_requirements) {
      const error = validateRule(req, 'on_use_requirement');
      if (error) return { isValid: false, message: `Erreur dans les exigences d'utilisation: ${error}` };
    }
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

app.post('/api/guilds/:guildId/shop/items', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const guildId = req.params.guildId;
  const itemData = req.body;
  let connection;
  try {
    connection = await getDbConnection();
    const validation = await validateShopItemPayload(itemData);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    // Standardize image_url before saving
    itemData.image_url = standardizeDiscordEmojiUrl(itemData.image_url);

    const newItem = await addShopItem(guildId, itemData); // Use the updated addShopItem
    return res.status(201).json(newItem);
  } catch (error) {
    console.error(`Error in addShopItem route for guild ${guildId}:`, error);
    res.status(500).json({ message: error.message || "Erreur lors de l'ajout de l'article du shop." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.put('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const { guildId, itemId } = req.params;
  const itemData = req.body;
  let connection;
  try {
    connection = await getDbConnection();
    const validation = await validateShopItemPayload(itemData);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    // Standardize image_url before saving
    itemData.image_url = standardizeDiscordEmojiUrl(itemData.image_url);

    const updatedItem = await updateShopItem(guildId, itemId, itemData); // Use the updated updateShopItem
    return res.json(updatedItem);
  } catch (error) {
    console.error(`Error in updateShopItem route for guild ${guildId}, item ${itemId}:`, error);
    res.status(500).json({ message: error.message || "Erreur lors de la mise à jour de l'article du shop." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.delete('/api/guilds/:guildId/shop/items/:itemId', authenticateToken, checkGuildAdminPermissions, async (req, res) => {
  const { guildId, itemId } = req.params;
  let connection;
  try {
    connection = await getDbConnection();
    await deleteShopItem(guildId, itemId);
    return res.json({ message: "Article supprimé avec succès." });
  } catch (error) {
    console.error(`Error in deleteShopItem route for guild ${guildId}, item ${itemId}:`, error);
    res.status(500).json({ message: error.message || "Erreur lors de la suppression de l'article du shop." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Start the server
initializeDbPool().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to DB initialization error:', err);
});

module.exports = app;
