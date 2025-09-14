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
    max_multiplier: 100.0, // Assurer que c'est un flottant par défaut
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

// Fonction utilitaire pour fusionner profondément des objets
function deepMerge(target, source) {
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
}

async function getGuildSettings(guildId) {
  let connection;
  try {
    connection = await getDbConnectionFromPool();
    console.log(`Fetching settings for guild: ${guildId}`);

    const [economyRows] = await connection.execute(
      'SELECT economy_settings FROM guild_settings WHERE guild_id = ?',
      [guildId]
    );

    let economySettings = deepMerge({}, DEFAULT_ECONOMY_SETTINGS); // Utiliser deepMerge pour la base

    if (economyRows.length > 0 && economyRows[0].economy_settings) {
      try {
        const existingSettings = JSON.parse(economyRows[0].economy_settings);
        economySettings = deepMerge(economySettings, existingSettings); // Fusionner les paramètres existants
        
        // Supprimer explicitement les propriétés de thème si elles existent dans les paramètres fusionnés
        if (economySettings.general_embeds) {
          delete economySettings.general_embeds.balance_embed_theme;
          delete economySettings.general_embeds.collect_embed_theme;
        }

        // Assurer que max_multiplier est un nombre flottant
        if (economySettings.crash_game && typeof economySettings.crash_game.max_multiplier === 'string') {
          economySettings.crash_game.max_multiplier = parseFloat(economySettings.crash_game.max_multiplier);
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
    // Avant de stringifier, s'assurer que les propriétés de thème ne sont pas incluses
    const settingsToSave = deepMerge({}, newEconomySettings); // Créer une copie profonde pour éviter les mutations inattendues
    if (settingsToSave.general_embeds) {
      delete settingsToSave.general_embeds.balance_embed_theme;
      delete settingsToSave.general_embeds.collect_embed_theme;
    }

    // Assurer que max_multiplier est un nombre flottant avant de sauvegarder
    if (settingsToSave.crash_game && typeof settingsToSave.crash_game.max_multiplier === 'string') {
      settingsToSave.crash_game.max_multiplier = parseFloat(settingsToSave.crash_game.max_multiplier);
    } else if (settingsToSave.crash_game && typeof settingsToSave.crash_game.max_multiplier !== 'number') {
        // Fallback si ce n'est ni une chaîne ni un nombre (ex: null, undefined)
        settingsToSave.crash_game.max_multiplier = DEFAULT_ECONOMY_SETTINGS.crash_game.max_multiplier;
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
  } finally { {
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
    // Ensure 'id' from the database row is included in the parsed item_data
    return rows.map(row => {
      const parsedData = JSON.parse(row.item_data);
      return { id: row.id, ...parsedData };
    });
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
    // Ensure 'id' from the database row is included in the parsed item_data
    const parsedData = JSON.parse(rows[0].item_data);
    return { id: rows[0].id, ...parsedData };
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
    // The 'id' will be set after insertion, so we don't include it in the initial JSON
    const itemJson = JSON.stringify(mergedItemData);
    const [result] = await connection.execute(
      'INSERT INTO shop_items (guild_id, item_data) VALUES (?, ?)',
      [guildId, itemJson]
    );
    // After insertion, retrieve the insertId and update the item_data with it
    const newItemId = result.insertId;
    mergedItemData.id = newItemId; // Add the actual DB ID to the item_data
    const updatedItemJson = JSON.stringify(mergedItemData);
    await connection.execute(
      'UPDATE shop_items SET item_data = ? WHERE id = ?',
      [updatedItemJson, newItemId]
    );

    console.log(`Shop item added successfully for guild ${guildId} with ID ${newItemId}.`);
    return { id: newItemId, ...mergedItemData };
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
    mergedItemData.id = itemId; // Ensure the ID in the JSON matches the DB ID
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
