// server.js
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Discord OAuth2
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // Ex : https://project-delta.fr/serveur.html
const BOT_TOKEN = process.env.BOT_TOKEN;

// MySQL
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

async function getDbConnection() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connecté à MySQL !');
  return connection;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

app.get('/api/discord-oauth', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Code non fourni.' });
  }

  try {
    // Échange code -> access_token
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

    // Infos utilisateur
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { authorization: `${token_type} ${access_token}` }
    });
    const user = userResponse.data;

    // Guildes utilisateur
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { authorization: `${token_type} ${access_token}` }
    });
    const userGuilds = guildsResponse.data;

    const ADMINISTRATOR_PERMISSION = 0x8;

    const processedGuilds = await Promise.all(
      userGuilds.map(async g => {
        const hasAdminPerms = (parseInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
        const isOwner = g.owner;
        let memberCount = 0;
        let isInServer = false;

        if (BOT_TOKEN) {
          await delay(200);
          try {
            const botGuildResponse = await axios.get(`https://discord.com/api/guilds/${g.id}`, {
              headers: { Authorization: `Bot ${BOT_TOKEN}` }
            });
            const botGuildData = botGuildResponse.data;
            memberCount = botGuildData.approximate_member_count || botGuildData.member_count || 0;
            isInServer = true;
          } catch (botError) {
            if (botError.response?.status === 404) {
              console.warn(`Bot non présent dans ${g.name} (${g.id})`);
            } else if (botError.response?.status === 429) {
              console.error(`Rate limit sur ${g.name} (${g.id})`);
            } else {
              console.error(`Erreur guild ${g.name} (${g.id}) :`, botError.message);
            }
          }
        }

        return {
          id: g.id,
          name: g.name,
          icon: g.icon,
          memberCount,
          isOwner,
          hasAdminPerms,
          isInServer
        };
      })
    );

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

// Test connexion DB
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
    if (connection) connection.end();
  }
});

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});
