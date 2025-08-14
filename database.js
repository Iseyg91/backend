// database.js
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
  }
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
        economySettings = { ...DEFAULT_ECONOMY_SETTINGS, ...JSON.parse(economyRows[0].economy_settings) };
        // S'assurer que les sous-objets sont également fusionnés si nécessaire
        for (const key in DEFAULT_ECONOMY_SETTINGS) {
            if (typeof DEFAULT_ECONOMY_SETTINGS[key] === 'object' && !Array.isArray(DEFAULT_ECONOMY_SETTINGS[key])) {
                economySettings[key] = { ...DEFAULT_ECONOMY_SETTINGS[key], ...economySettings[key] };
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
    if (connection) connection.end();
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
    if (connection) connection.end();
  }
}

module.exports = {
  getGuildSettings,
  updateEconomySettings, // Renommé et adapté
  addCollectRole,
  deleteCollectRole
};
