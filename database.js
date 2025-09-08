// backend/database.js
const mysql = require('mysql2/promise');

// dbConfig should be passed or accessed from environment variables
// Assuming dbConfig is available from server.js or .env
// For this file, we'll assume it's passed or globally accessible if using a pool
// If you want this file to manage its own connection, it should also create a pool.
// For simplicity and best practice, the pool is managed in server.js and connections are passed.

// If getDbConnection is passed from server.js, this file doesn't need dbConfig directly.
// However, if it's meant to be standalone, it needs dbConfig.
// Let's assume getDbConnection is provided by the caller (server.js)
// and this file just uses it.

// To make this file truly independent and reusable, it should manage its own pool.
// Let's modify it to create its own pool, but ensure it's only created once.

let dbPool; // Declare a pool variable

function initializeDbPool(dbConfig) {
  if (!dbPool) {
    dbPool = mysql.createPool(dbConfig);
    console.log('Database pool initialized in database.js!');
  }
  return dbPool;
}

// Modified getDbConnection to use the local pool
async function getDbConnectionFromPool() {
  if (!dbPool) {
    // This should ideally not happen if initializeDbPool is called at startup
    // but as a fallback, try to get config from process.env
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
    balance_embed_theme: "default",
    collect_embed_color: "#00ffcc",
    collect_embed_theme: "default"
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
    unsuccess_message: "Vous avez échoué la quête et perdu {amount} {currency_symbol} !", // Ajout du message d'échec
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
  // Nouvelle section pour les jeux
  crash_game: {
    embed_color: "#FF0000",
    min_bet: 1,
    max_bet: 1000,
    min_multiplier: 1.01,
    max_multiplier: 100,
    crash_chance: 50 // Probabilité que le jeu crash tôt (en %)
  },
  plinko_game: {
    embed_color: "#00FF00",
    min_bet: 1,
    max_bet: 500,
    rows: 8, // Nombre de lignes de pins. Un nombre pair est courant pour Plinko, mais le nombre de multiplicateurs est crucial.
    // Les multiplicateurs doivent correspondre au nombre de "slots" en bas du plateau, qui est (rows + 1).
    // Pour 8 lignes, il y a 9 slots. Les multiplicateurs par défaut sont ajustés en conséquence.
    multipliers: [0.5, 1, 1.5, 2, 3, 5, 10, 5, 3] // 9 multiplicateurs pour 8 lignes
  },
  roulette_game: {
    embed_color: "#0000FF",
    min_bet: 1,
    max_bet: 2000,
    outcomes: [ // Définition des résultats (couleur, multiplicateur, numéros)
      // Les couleurs sont maintenant en format hexadécimal pour la cohérence
      {"color": "#FF0000", "multiplier": 2, "numbers": [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]}, // Rouge
      {"color": "#000000", "multiplier": 2, "numbers": [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]}, // Noir
      {"color": "#008000", "multiplier": 14, "numbers": [0]} // Vert
    ]
  },
  dice_game: {
    embed_color: "#FFFF00",
    min_bet: 1,
    max_bet: 100,
    min_roll: 1, // Minimum que l'utilisateur peut prédire
    max_roll: 99 // Maximum que l'utilisateur peut prédire
  }
};

// Valeurs par défaut pour un item de shop
const DEFAULT_SHOP_ITEM = {
  name: "Nouvel Article",
  description: "",
  image_url: "",
  sellable: true,
  usable: true,
  inventory: true,
  price: 0,
  stock: null, // null signifie illimité par défaut
  unlimited_stock: true, // Nouveau champ pour indiquer si le stock est illimité
  max_purchase_per_transaction: null, // Nouveau: null signifie illimité
  requirements: [], // [{ type: "has_role", value: "role_id" }]
  on_use_requirements: [], // Nouveau: conditions pour utiliser l'item
  on_purchase_actions: [], // [{ type: "give_role", value: "role_id" }, { type: "give_money", value: "amount" }]
  on_use_actions: [] // [{ type: "give_role", value: "role_id" }, { type: "give_money", value: "amount" }]
};


// Fonction pour récupérer TOUS les paramètres d'une guilde (y compris les rôles de collect)
async function getGuildSettings(guildId) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
    console.log(`Fetching settings for guild: ${guildId}`);

    // 1. Récupérer les paramètres d'économie JSON de la table guild_settings
    const [economyRows] = await connection.execute(
      'SELECT economy_settings FROM guild_settings WHERE guild_id = ?',
      [guildId]
    );

    let economySettings = JSON.parse(JSON.stringify(DEFAULT_ECONOMY_SETTINGS)); // Deep clone defaults

    if (economyRows.length > 0 && economyRows[0].economy_settings) {
      try {
        const existingSettings = JSON.parse(economyRows[0].economy_settings);
        // Perform a deep merge to ensure all default keys are present and existing values override
        for (const key in DEFAULT_ECONOMY_SETTINGS) {
          if (existingSettings.hasOwnProperty(key)) {
            if (typeof DEFAULT_ECONOMY_SETTINGS[key] === 'object' && DEFAULT_ECONOMY_SETTINGS[key] !== null && !Array.isArray(DEFAULT_ECONOMY_SETTINGS[key])) {
              // Deep merge for nested objects
              economySettings[key] = { ...DEFAULT_ECONOMY_SETTINGS[key], ...existingSettings[key] };
            } else {
              // Direct assignment for primitives, arrays, or if default is not an object
              economySettings[key] = existingSettings[key];
            }
          }
        }
      } catch (parseError) {
        console.error(`Erreur de parsing JSON pour economy_settings de la guilde ${guildId}:`, parseError);
        // If JSON is invalid, stick with DEFAULT_ECONOMY_SETTINGS (already cloned)
      }
    }

    // 2. Récupérer les rôles de collect de la table collect_roles
    const [collectRolesRows] = await connection.execute(
      'SELECT role_id, amount, cooldown FROM collect_roles WHERE guild_id = ?',
      [guildId]
    );

    economySettings.collect_roles = collectRolesRows; // Ajouter les rôles de collect à l'objet settings
    console.log(`Settings fetched for guild ${guildId}:`, economySettings);
    return economySettings;

  } catch (error) {
    console.error(`Error in getGuildSettings for guild ${guildId}:`, error);
    throw error; // Re-throw the error for the caller to handle
  } finally {
    if (connection) connection.release(); // Release connection back to pool
  }
}

// Fonction pour mettre à jour les paramètres d'économie JSON
async function updateEconomySettings(guildId, newEconomySettings) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
    const settingsJson = JSON.stringify(newEconomySettings);
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
    if (connection) connection.release(); // Release connection back to pool
  }
}

// Fonction pour ajouter un rôle de collect
async function addCollectRole(guildId, roleData) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
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

// Fonction pour supprimer un rôle de collect
async function deleteCollectRole(guildId, roleIdToDelete) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
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

// --- Fonctions pour la gestion du Shop ---

async function getShopItems(guildId) {
  let connection;
  try {
    connection = await getDbConnectionFromPool(); // Use the pool connection
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
    connection = await getDbConnectionFromPool(); // Use the pool connection
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
    connection = await getDbConnectionFromPool(); // Use the pool connection
    console.log(`Adding shop item for guild ${guildId}:`, itemData);
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
