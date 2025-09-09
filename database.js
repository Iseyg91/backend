// backend/database.js
const mysql = require('mysql2/promise');

let dbPool; // Declare a pool variable

function initializeDbPool(dbConfig) {
  if (!dbPool) {
    dbPool = mysql.createPool(dbConfig);
    console.log('Database pool initialized in database.js!');
  }
  return dbPool;
}

async function getDbConnectionFromPool() {
  if (!dbPool) {
    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };
    initializeDbPool(dbConfig);
  }
  return dbPool.getConnection();
}

// Valeurs par défaut pour les paramètres d'économie
const DEFAULT_ECONOMY_SETTINGS = {
  general_embeds: {
    balance_embed_color: "#00ffcc",
    // balance_embed_theme: "default", // Supprimé
    collect_embed_color: "#00ffcc",
    // collect_embed_theme: "default" // Supprimé
  },
  currency: {
    name: "Crédits", // Nom par défaut
    symbol: "💰" // Symbole par défaut
  },
  bonus_command: {
    embed_color: "#00ffcc",
    success_message: "Félicitations ! Vous avez gagné {amount} {currency_symbol} !",
    cooldown: 3600, // 1 heure
    min_gain: 100,
    max_gain: 500
  },
  quest_command: {
    embed_color: "#00ffcc",
    success_message: "Vous avez réussi la quête et gagné {amount} {currency_symbol} !",
    unsuccess_message: "Vous avez échoué la quête et perdu {amount} {currency_symbol} !",
    cooldown: 7200, // 2 heures
    min_negative: -50,
    max_negative: -10,
    min_positive: 20,
    max_positive: 100
  },
  risk_command: {
    embed_color: "#00ffcc",
    success_message: "Vous avez pris un risque et gagné {amount} {currency_symbol} !",
    unsuccess_message: "Oh non ! Vous avez perdu {amount} {currency_symbol} !",
    cooldown: 10800, // 3 heures
    min_positive: 500,
    max_positive: 2000,
    min_negative: -200,
    max_negative: -50
  },
  crash_game: {
    embed_color: "#FF0000",
    min_bet: 1,
    max_bet: 1000,
    min_multiplier: 1.01,
    max_multiplier: 100,
    crash_chance: 50
  },
  plinko_game: {
    embed_color: "#00FF00",
    min_bet: 1,
    max_bet: 500,
    rows: 8,
    multipliers: [0.5, 1, 1.5, 2, 3, 5, 10, 5, 3]
  },
  roulette_game: {
    embed_color: "#0000FF",
    min_bet: 1,
    max_bet: 2000,
    outcomes: [
      {"color": "#FF0000", "multiplier": 2, "numbers": [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]},
      {"color": "#000000", "multiplier": 2, "numbers": [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]},
      {"color": "#008000", "multiplier": 14, "numbers": [0]}
    ]
  },
  dice_game: {
    embed_color: "#FFFF00",
    min_bet: 1,
    max_bet: 100,
    min_roll: 1,
    max_roll: 99
  }
};

const DEFAULT_SHOP_ITEM = {
  name: "Nouvel Article",
  description: "",
  image_url: "",
  sellable: true,
  usable: true,
  inventory: true,
  price: 0,
  stock: null,
  unlimited_stock: true,
  max_purchase_per_transaction: null,
  requirements: [],
  on_use_requirements: [],
  on_purchase_actions: [],
  on_use_actions: []
};

async function getGuildSettings(guildId) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
    console.log(`Fetching settings for guild: ${guildId}`);

    const [economyRows] = await connection.execute(
      'SELECT economy_settings FROM guild_settings WHERE guild_id = ?',
      [guildId]
    );

    let economySettings = JSON.parse(JSON.stringify(DEFAULT_ECONOMY_SETTINGS));

    if (economyRows.length > 0 && economyRows[0].economy_settings) {
      try {
        const existingSettings = JSON.parse(economyRows[0].economy_settings);
        // Perform a deep merge to ensure all default keys are present and existing values override
        for (const key in DEFAULT_ECONOMY_SETTINGS) {
          if (existingSettings.hasOwnProperty(key)) {
            if (typeof DEFAULT_ECONOMY_SETTINGS[key] === 'object' && DEFAULT_ECONOMY_SETTINGS[key] !== null && !Array.isArray(DEFAULT_ECONOMY_SETTINGS[key])) {
              // Deep merge for nested objects, but exclude the theme properties
              economySettings[key] = { ...DEFAULT_ECONOMY_SETTINGS[key], ...existingSettings[key] };
              // Explicitly remove theme properties if they exist in existingSettings
              if (key === 'general_embeds') {
                delete economySettings[key].balance_embed_theme;
                delete economySettings[key].collect_embed_theme;
              }
            } else {
              economySettings[key] = existingSettings[key];
            }
          }
        }
      } catch (parseError) {
        console.error(`Erreur de parsing JSON pour economy_settings de la guilde ${guildId}:`, parseError);
      }
    }

    const [collectRolesRows] = await connection.execute(
      'SELECT role_id, amount, cooldown FROM collect_roles WHERE guild_id = ?',
      [guildId]
    );

    economySettings.collect_roles = collectRolesRows;
    console.log(`Settings fetched for guild ${guildId}:`, economySettings);
    return economySettings;

  } catch (error) {
    console.error(`Error in getGuildSettings for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function updateEconomySettings(guildId, newEconomySettings) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
    // Before stringifying, ensure theme properties are not included in the update
    const settingsToSave = { ...newEconomySettings };
    if (settingsToSave.general_embeds) {
      delete settingsToSave.general_embeds.balance_embed_theme;
      delete settingsToSave.general_embeds.collect_embed_theme;
    }
    const settingsJson = JSON.stringify(settingsToSave);
    console.log(`Updating settings for guild ${guildId} with:`, settingsJson);

    await connection.execute(
      `INSERT INTO guild_settings (guild_id, economy_settings)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE economy_settings = ?`,
      [guildId, settingsJson, settingsJson]
    );
    console.log(`Settings updated successfully for guild ${guildId}.`);
  } catch (error) {
    console.error(`Error in updateEconomySettings for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function addCollectRole(guildId, roleData) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
    const { role_id, amount, cooldown } = roleData;
    console.log(`Adding collect role for guild ${guildId}:`, roleData);

    const [existingRoles] = await connection.execute(
      'SELECT role_id FROM collect_roles WHERE guild_id = ? AND role_id = ?',
      [guildId, role_id]
    );

    if (existingRoles.length > 0) {
      throw new Error("Ce rôle de collect existe déjà pour ce serveur.");
    }

    await connection.execute(
      'INSERT INTO collect_roles (guild_id, role_id, amount, cooldown) VALUES (?, ?, ?, ?)',
      [guildId, role_id, amount, cooldown]
    );
    console.log(`Collect role added successfully for guild ${guildId}.`);
  } catch (error) {
    console.error(`Error in addCollectRole for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteCollectRole(guildId, roleIdToDelete) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
    console.log(`Deleting collect role ${roleIdToDelete} for guild ${guildId}.`);
    const [result] = await connection.execute(
      'DELETE FROM collect_roles WHERE guild_id = ? AND role_id = ?',
      [guildId, roleIdToDelete]
    );

    if (result.affectedRows === 0) {
      throw new Error("Le rôle spécifié n'a pas été trouvé ou n'a pas pu être supprimé.");
    }
    console.log(`Collect role ${roleIdToDelete} deleted successfully for guild ${guildId}.`);
  } catch (error) {
    console.error(`Error in deleteCollectRole for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getShopItems(guildId) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
    console.log(`Fetching shop items for guild: ${guildId}`);
    const [rows] = await connection.execute(
      'SELECT id, item_data FROM shop_items WHERE guild_id = ?',
      [guildId]
    );
    return rows.map(row => ({ id: row.id, ...JSON.parse(row.item_data) }));
  } catch (error) {
    console.error(`Error in getShopItems for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getShopItemById(guildId, itemId) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
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
    console.error(`Error in getShopItemById for guild ${guildId}:`, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function addShopItem(guildId, itemData) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
    console.log(`Adding shop item for guild ${guildId}:`, itemData);
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
    connection = await getDbConnectionFromPool();
    console.log(`Updating shop item ${itemId} for guild ${guildId}:`, itemData);
    const existingItem = await getShopItemById(guildId, itemId);
    if (!existingItem) {
      throw new Error("Article non trouvé.");
    }
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
    connection = await getDbConnectionFromPool();
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
  initializeDbPool,
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
