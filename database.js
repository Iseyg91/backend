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

// Fonction pour récupérer TOUS les paramètres d'une guilde
async function getGuildSettings(guildId) {
  let connection;
  try {
    connection = await getDbConnection();

    // 1. Récupérer les paramètres d'embed de la table guild_settings
    const [embedRows] = await connection.execute(
      'SELECT balance_embed_color, balance_embed_theme, collect_embed_color, collect_embed_theme FROM guild_settings WHERE guild_id = ?',
      [guildId]
    );

    let settings = {};
    if (embedRows.length > 0) {
      settings = {
        balance_embed_color: embedRows[0].balance_embed_color,
        balance_embed_theme: embedRows[0].balance_embed_theme,
        collect_embed_color: embedRows[0].collect_embed_color,
        collect_embed_theme: embedRows[0].collect_embed_theme,
      };
    } else {
      // Si aucun paramètre d'embed n'existe, retourner des valeurs par défaut
      settings = {
        balance_embed_color: "#00ffcc",
        balance_embed_theme: "default",
        collect_embed_color: "#00ffcc",
        collect_embed_theme: "default",
      };
    }

    // 2. Récupérer les rôles de collect de la table collect_roles
    const [collectRolesRows] = await connection.execute(
      'SELECT role_id, amount, cooldown FROM collect_roles WHERE guild_id = ?',
      [guildId]
    );

    settings.collect_roles = collectRolesRows; // Ajouter les rôles de collect à l'objet settings

    return settings;

  } finally {
    if (connection) connection.end();
  }
}

// Fonction pour mettre à jour les paramètres d'embed (balance_embed_color, etc.)
async function updateEmbedSettings(guildId, embedSettings) {
  let connection;
  try {
    connection = await getDbConnection();
    const { balance_embed_color, balance_embed_theme, collect_embed_color, collect_embed_theme } = embedSettings;

    await connection.execute(
      `INSERT INTO guild_settings (guild_id, balance_embed_color, balance_embed_theme, collect_embed_color, collect_embed_theme)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       balance_embed_color = VALUES(balance_embed_color),
       balance_embed_theme = VALUES(balance_embed_theme),
       collect_embed_color = VALUES(collect_embed_color),
       collect_embed_theme = VALUES(collect_embed_theme)`,
      [guildId, balance_embed_color, balance_embed_theme, collect_embed_color, collect_embed_theme]
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

    // Vérifier si le rôle existe déjà pour cette guilde
    const [existingRoles] = await connection.execute(
      'SELECT role_id FROM collect_roles WHERE guild_id = ? AND role_id = ?',
      [guildId, role_id]
    );

    if (existingRoles.length > 0) {
      throw new Error("Ce rôle de collect existe déjà pour ce serveur.");
    }

    // Insérer le nouveau rôle
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
  updateEmbedSettings, // Renommé pour la clarté
  addCollectRole,
  deleteCollectRole
};
