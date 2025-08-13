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
const BOT_TOKEN = process.env.BOT_TOKEN; // Token de votre bot Discord (toujours nécessaire pour d'autres usages si besoin)

// URL de l'API de votre bot Discord (à configurer dans les variables d'environnement de Render)
const BOT_API_URL = process.env.BOT_API_URL; // Ex: http://votre_ip_bot:3001 ou http://localhost:3001 si sur le même serveur

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
    throw error;
  }
}

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

    // NOUVEAU: Étape 3.5: Obtenir la liste des guildes où le bot est présent via son API
    let botGuilds = [];
    if (BOT_API_URL) {
        try {
            const botGuildsResponse = await axios.get(`${BOT_API_URL}/bot-guilds`);
            botGuilds = botGuildsResponse.data;
            console.log(`Successfully fetched ${botGuilds.length} guilds from bot API.`);
        } catch (botApiError) {
            console.error('Error fetching bot guilds from bot API:', botApiError.message);
            // Si l'API du bot est inaccessible, on ne pourra pas déterminer isInServer correctement
            // On peut choisir de renvoyer une erreur ou de continuer sans cette information
        }
    } else {
        console.warn("BOT_API_URL is not defined. Cannot determine bot presence in guilds.");
    }

    // Créer une Map pour un accès rapide aux détails des guildes du bot
    const botGuildsMap = new Map(botGuilds.map(g => [g.id, g]));

    // Étape 4: Traiter chaque guilde de l'utilisateur
    const ADMINISTRATOR_PERMISSION = 0x8; // La valeur de la permission ADMINISTRATOR

    const processedGuilds = userGuilds.map(g => {
      const hasAdminPerms = (parseInt(g.permissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
      const isOwner = g.owner;

      // Vérifier si le bot est dans cette guilde en utilisant la liste obtenue de l'API du bot
      const isInServer = botGuildsMap.has(g.id);
      let memberCount = 0;

      if (isInServer) {
          const botGuildDetails = botGuildsMap.get(g.id);
          memberCount = botGuildDetails.memberCount || 0;
      }

      // Log pour le débogage
      console.log(`Processed guild ${g.name} (${g.id}): isInServer=${isInServer}, isOwner=${isOwner}, hasAdminPerms=${hasAdminPerms}, memberCount=${memberCount}`);

      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        memberCount: memberCount,
        isOwner: isOwner,
        hasAdminPerms: hasAdminPerms,
        isInServer: isInServer
      };
    });

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
