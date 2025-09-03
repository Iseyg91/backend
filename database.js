// backend/database.js
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function getDbConnection() {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
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
    rows: 8, // Nombre de lignes de pins
    multipliers: [0.5, 1, 1.5, 2, 3, 5, 10] // Multiplicateurs pour les slots du bas (maintenant un tableau simple)
  },
  roulette_game: {
    embed_color: "#0000FF",
    min_bet: 1,
    max_bet: 2000,
    outcomes: [ // Définition des résultats (couleur, multiplicateur, numéros)
      {"color": "red", "multiplier": 2, "numbers": [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]},
      {"color": "black", "multiplier": 2, "numbers": [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]},
      {"color": "green", "multiplier": 14, "numbers": [0]}
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
    connection = await getDbConnection();

    // 1. Récupérer les paramètres d'économie JSON de la table guild_settings
    const [economyRows] = await connection.execute(
      'SELECT economy_settings FROM guild_settings WHERE guild_id = ?',
      [guildId]
    );

    let economySettings = DEFAULT_ECONOMY_SETTINGS; // Commencer avec les valeurs par défaut

    if (economyRows.length > 0 && economyRows[0].economy_settings) {
      try {
        // Fusionner les paramètres existants avec les défauts pour s'assurer que toutes les clés sont présentes
        // Effectuer une fusion profonde pour les objets imbriqués
        const existingSettings = JSON.parse(economyRows[0].economy_settings);
        economySettings = { ...DEFAULT_ECONOMY_SETTINGS }; // Clone les valeurs par défaut
        for (const key in existingSettings) {
            if (typeof existingSettings[key] === 'object' && !Array.isArray(existingSettings[key]) && economySettings[key]) {
                // Si la clé est un objet et existe déjà dans les défauts, fusionner ses propriétés
                economySettings[key] = { ...economySettings[key], ...existingSettings[key] };
            } else {
                // Sinon, remplacer la propriété (pour les propriétés de premier niveau ou les tableaux)
                economySettings[key] = existingSettings[key];
            }
        }
      } catch (parseError) {
        console.error(`Erreur de parsing JSON pour economy_settings de la guilde ${guildId}:`, parseError);
        // Si le JSON est invalide, on reste sur les DEFAULT_ECONOMY_SETTINGS
      }
    }

    // 2. Récupérer les rôles de collect de la table collect_roles
    const [collectRolesRows] = await connection.execute(
      'SELECT role_id, amount, cooldown FROM collect_roles WHERE guild_id = ?',
      [guildId]
    );

    economySettings.collect_roles = collectRolesRows; // Ajouter les rôles de collect à l'objet settings

    return economySettings;

  } finally {
    if (connection) connection.end();
  }
}

// Fonction pour mettre à jour les paramètres d'économie JSON
async function updateEconomySettings(guildId, newEconomySettings) {
  let connection;
  try {
    connection = await getDbConnection();
    const settingsJson = JSON.stringify(newEconomySettings);

    await connection.execute(
      `INSERT INTO guild_settings (guild_id, economy_settings)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE economy_settings = ?`,
      [guildId, settingsJson, settingsJson]
    );
  } finally {
    if (connection) connection.end();
  }
}

// Fonction pour ajouter un rôle de collect
async function addCollectRole(guildId, roleData) {
  let connection;
  try {
    connection = await getDbConnection();
    const { role_id, amount, cooldown } = roleData;

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
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

// Fonction pour supprimer un rôle de collect
async function deleteCollectRole(guildId, roleIdToDelete) {
  let connection;
  try {
    connection = await getDbConnection();
    const [result] = await connection.execute(
      'DELETE FROM collect_roles WHERE guild_id = ? AND role_id = ?',
      [guildId, roleIdToDelete]
    );

    if (result.affectedRows === 0) {
      throw new Error("Le rôle spécifié n'a pas été trouvé ou n'a pas pu être supprimé.");
    }
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

// --- Fonctions pour la gestion du Shop ---

async function getShopItems(guildId) {
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT id, item_data FROM shop_items WHERE guild_id = ?',
      [guildId]
    );
    return rows.map(row => ({ id: row.id, ...JSON.parse(row.item_data) }));
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

async function getShopItemById(guildId, itemId) {
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT id, item_data FROM shop_items WHERE guild_id = ? AND id = ?',
      [guildId, itemId]
    );
    if (rows.length === 0) {
      return null;
    }
    return { id: rows[0].id, ...JSON.parse(rows[0].item_data) };
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

async function addShopItem(guildId, itemData) {
  let connection;
  try {
    connection = await getDbConnection();
    // Fusionner avec les valeurs par défaut pour s'assurer que tous les champs sont présents
    const mergedItemData = { ...DEFAULT_SHOP_ITEM, ...itemData };
    const itemJson = JSON.stringify(mergedItemData);
    const [result] = await connection.execute(
      'INSERT INTO shop_items (guild_id, item_data) VALUES (?, ?)',
      [guildId, itemJson]
    );
    return { id: result.insertId, ...mergedItemData };
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

async function updateShopItem(guildId, itemId, itemData) {
  let connection;
  try {
    connection = await getDbConnection();
    // Récupérer l'item existant pour une fusion profonde si nécessaire
    const existingItem = await getShopItemById(guildId, itemId);
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
    return { id: itemId, ...mergedItemData };
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

async function deleteShopItem(guildId, itemId) {
  let connection;
  try {
    connection = await getDbConnection();
    const [result] = await connection.execute(
      'DELETE FROM shop_items WHERE guild_id = ? AND id = ?',
      [guildId, itemId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Article non trouvé ou n'a pas pu être supprimé.");
    }
  } finally {
    if (connection) {
      connection.end();
    }
  }
}


module.exports = {
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
