// backend/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function getGuildSettings(guildId) {
    const [rows] = await pool.query("SELECT * FROM guild_settings WHERE guild_id = ?", [guildId]);
    return rows[0];
}

async function updateGuildSettings(guildId, settings) {
    const { balance_embed_color, balance_embed_theme, collect_embed_color, collect_embed_theme } = settings;
    await pool.query(`
        INSERT INTO guild_settings (guild_id, balance_embed_color, balance_embed_theme, collect_embed_color, collect_embed_theme)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        balance_embed_color = VALUES(balance_embed_color),
        balance_embed_theme = VALUES(balance_embed_theme),
        collect_embed_color = VALUES(collect_embed_color),
        collect_embed_theme = VALUES(collect_embed_theme)
    `, [guildId, balance_embed_color, balance_embed_theme, collect_embed_color, collect_embed_theme]);
}

module.exports = {
    getGuildSettings,
    updateGuildSettings,
};
