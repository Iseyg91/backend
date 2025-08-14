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

async function getGuildSettings(guildId) {
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT settings_data FROM guild_settings WHERE guild_id = ?',
      [guildId]
    );
    if (rows.length > 0) {
      // Assurez-vous de parser le JSON si stocké en TEXT
      const settings = JSON.parse(rows[0].settings_data);
      // Assurez-vous que collect_roles est toujours un tableau
      if (!settings.collect_roles) {
          settings.collect_roles = [];
      }
      return settings;
    }
    return null; // Aucun paramètre trouvé
  } finally {
    if (connection) connection.end();
  }
}

async function updateGuildSettings(guildId, newSettings) {
  let connection;
  try {
    connection = await getDbConnection();
    const settingsJson = JSON.stringify(newSettings); // Convertir l'objet en chaîne JSON

    await connection.execute(
      'INSERT INTO guild_settings (guild_id, settings_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings_data = ?',
      [guildId, settingsJson, settingsJson]
    );
  } finally {
    if (connection) connection.end();
  }
}

// Nouvelle fonction pour ajouter un rôle de collect
async function addCollectRole(guildId, roleData) {
    let connection;
    try {
        connection = await getDbConnection();
        let currentSettings = await getGuildSettings(guildId);

        if (!currentSettings) {
            // Si aucun paramètre n'existe, créer un objet de paramètres par défaut
            currentSettings = {
                balance_embed_color: "#00ffcc",
                balance_embed_theme: "default",
                collect_embed_color: "#00ffcc",
                collect_embed_theme: "default",
                collect_roles: []
            };
        }

        // Assurez-vous que collect_roles est un tableau
        if (!Array.isArray(currentSettings.collect_roles)) {
            currentSettings.collect_roles = [];
        }

        // Vérifier si le rôle existe déjà pour éviter les doublons
        const roleExists = currentSettings.collect_roles.some(role => role.role_id === roleData.role_id);
        if (roleExists) {
            throw new Error("Ce rôle de collect existe déjà pour ce serveur.");
        }

        currentSettings.collect_roles.push(roleData); // Ajouter le nouveau rôle

        const settingsJson = JSON.stringify(currentSettings);

        await connection.execute(
            'INSERT INTO guild_settings (guild_id, settings_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings_data = ?',
            [guildId, settingsJson, settingsJson]
        );
    } finally {
        if (connection) connection.end();
    }
}

// Nouvelle fonction pour supprimer un rôle de collect
async function deleteCollectRole(guildId, roleIdToDelete) {
    let connection;
    try {
        connection = await getDbConnection();
        let currentSettings = await getGuildSettings(guildId);

        if (!currentSettings || !Array.isArray(currentSettings.collect_roles)) {
            throw new Error("Aucun rôle de collect à supprimer ou paramètres invalides.");
        }

        const initialLength = currentSettings.collect_roles.length;
        currentSettings.collect_roles = currentSettings.collect_roles.filter(role => role.role_id !== roleIdToDelete);

        if (currentSettings.collect_roles.length === initialLength) {
            throw new Error("Le rôle spécifié n'a pas été trouvé.");
        }

        const settingsJson = JSON.stringify(currentSettings);

        await connection.execute(
            'INSERT INTO guild_settings (guild_id, settings_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings_data = ?',
            [guildId, settingsJson, settingsJson]
        );
    } finally {
        if (connection) connection.end();
    }
}


module.exports = {
  getGuildSettings,
  updateGuildSettings,
  addCollectRole, // <-- Exporter la nouvelle fonction
  deleteCollectRole // <-- Exporter la nouvelle fonction
};
