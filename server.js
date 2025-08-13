// server.js
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Utilise la version promise pour async/await

const app = express();
const PORT = process.env.PORT || 3000;

// Variables d'environnement pour Discord OAuth2
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // Doit être https://project-delta.fr/serveur.html
const BOT_TOKEN = process.env.BOT_TOKEN; // Token de votre bot Discord

// Variables d'environnement pour MySQL
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Middleware
app.use(cors()); // Permet les requêtes cross-origin depuis votre frontend
app.use(express.json()); // Pour parser les corps de requête JSON

// Configuration de la base de données MySQL
const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
};

// Fonction pour obtenir une connexion à la base de données
async function getDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connecté à la base de données MySQL !');
    return connection;
  } catch (error) {
    console.error('Erreur de connexion à la base de données MySQL :', error);
    // Propage l'erreur pour la gérer dans les routes appelantes
    throw error;
  }
}

// Fonction utilitaire pour introduire un délai
const delay = ms => new Promise(res => setTimeout(res, ms));

// Route d'authentification Discord
app.get('/api/discord-oauth', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Code non fourni.' });
  }

  try {
    // Étape 1: Échanger le code contre un token d'accès
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      scope: 'identify guilds' // Assurez-vous que ces scopes sont demandés
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, token_type } = tokenResponse.data;

    // Étape 2: Obtenir les informations de l'utilisateur
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${token_type} ${access_token}`
      }
    });
    const user = userResponse.data;

    // Étape 3: Obtenir les guildes de l'utilisateur
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        authorization: `${token_type} ${access_token}`
      }
    });
    const userGuilds = guildsResponse.data; // Guildes où l'utilisateur est présent

    // Étape 4: Traiter chaque guilde pour ajouter les propriétés nécessaires (isOwner, hasAdminPerms, memberCount, isInServer)
    const ADMINISTRATOR_PERMISSION = 0x8; // La valeur de la permission ADMINISTRATOR

    const processedGuilds = await Promise.all(userGuilds.map(async g => {
      const hasAdminPerms = (parseInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
      const isOwner = g.owner;

      let memberCount = 0;
      let isInServer = false;

      // Vérifier si le bot est dans le serveur et obtenir le nombre de membres
      if (BOT_TOKEN) {
        // Ajouter un délai avant chaque requête pour éviter les rate limits
        // Ce délai est crucial pour éviter les 429
        await delay(200); // Délai de 200ms entre chaque requête (ajustez si nécessaire)

        try {
          const botGuildResponse = await axios.get(`https://discord.com/api/guilds/${g.id}`, {
            headers: {
              Authorization: `Bot ${BOT_TOKEN}` // Utilise le token du bot
            }
          });
          const botGuildData = botGuildResponse.data;
          // approximate_member_count est plus fiable pour les grands serveurs sans intents spécifiques
          memberCount = botGuildData.approximate_member_count || botGuildData.member_count || 0;
          isInServer = true; // Si la requête réussit, le bot est dans le serveur
        } catch (botError) {
          // Gérer spécifiquement les erreurs pour le débogage
          if (botError.response) {
            if (botError.response.status === 404) {
              // Bot n'est pas dans la guilde
              console.warn(`Bot not in guild ${g.name} (${g.id}): 404 Not Found`);
            } else if (botError.response.status === 429) {
              // Rate limited
              console.error(`Rate limited for guild ${g.name} (${g.id}): 429 Too Many Requests. Consider increasing delay.`);
            } else {
              // Autre erreur HTTP
              console.error(`Error fetching guild ${g.name} (${g.id}) details: ${botError.response.status} - ${botError.response.statusText}`);
            }
          } else {
            // Erreur réseau ou autre
            console.error(`Network error or other issue for guild ${g.name} (${g.id}):`, botError.message);
          }
          isInServer = false; // Si une erreur se produit, le bot n'est pas considéré comme présent
        }
      } else {
        console.warn("BOT_TOKEN n'est pas défini. Impossible de vérifier la présence du bot ou le nombre de membres.");
      }

      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        memberCount: memberCount,
        isOwner: isOwner,
        hasAdminPerms: hasAdminPerms,
        isInServer: isInServer
      };
    }));

    // Renvoyer les données au frontend
    res.json({
      success: true,
      user: user,
      guilds: processedGuilds, // Envoyez la liste des guildes traitées
      accessToken: access_token
    });

  } catch (error) {
    console.error('Erreur lors de l\'authentification Discord :', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'authentification Discord.' });
  }
});

// Exemple de route pour interagir avec la base de données (à adapter selon vos besoins)
app.get('/api/test-db', async (req, res) => {
  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
    res.json({ success: true, message: 'Connexion DB réussie', solution: rows[0].solution });
  } catch (error) {
    console.error('Erreur lors du test de la DB :', error);
    res.status(500).json({ success: false, error: 'Erreur de connexion ou de requête DB.' });
  } finally {
    if (connection) connection.end(); // Ferme la connexion
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});
