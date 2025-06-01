const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const mongoose = require("mongoose");

// Initialisation du bot Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Connexion au bot (token stocké en variable Render)
client.login(process.env.ETHERYA);

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const GuildSchema = new mongoose.Schema({
  guildId: String,
  serverName: String,
  welcomeChannel: String,
  welcomeMessage: String,
  logChannel: String,
  modRole: String,
});

const Guild = mongoose.model("Guild", GuildSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Variables OAuth stockées dans Render
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

// Redirection utilisée dans Discord Developer Portal
const REDIRECT_URI = "https://pdd-xrdi.onrender.com/serveur.html";

// Route OAuth2
app.get("/api/discord-oauth", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Code manquant",
      received: { code }
    });
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
  });

  try {
    // Obtenir l'access token depuis Discord
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(401).json({
        success: false,
        error: "Token non reçu",
        details: tokenData,
      });
    }

    // Récupérer les infos utilisateur
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // Récupérer les serveurs de l'utilisateur
    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userGuilds = await guildsResponse.json();

    // Attendre que le bot soit prêt
    if (!client.isReady()) {
      await new Promise(resolve => client.once("ready", resolve));
    }

    const botGuilds = client.guilds.cache;

    const mutualGuilds = await Promise.all(
      userGuilds
        .filter(g => botGuilds.has(g.id))
        .map(async g => {
          const botGuild = botGuilds.get(g.id);
          let hasAdminPerms = false;
          let isInServer = false;

          try {
            const member = await botGuild.members.fetch(userData.id);
            isInServer = true;
            hasAdminPerms = member.permissions.has(PermissionsBitField.Flags.Administrator);
          } catch {
            isInServer = false;
          }

          return {
            id: g.id,
            name: g.name,
            icon: g.icon
              ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=128`
              : null,
            isOwner: g.owner,
            memberCount: botGuild.memberCount,
            hasAdminPerms,
            isInServer,
          };
        })
    );

    res.json({ success: true, user: userData, mutualGuilds });

  } catch (err) {
    console.error("Erreur serveur OAuth :", err);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
      details: err.message,
    });
  }
});

// Route pour obtenir les informations de configuration d'un serveur
app.get("/api/guild/setup/:id", async (req, res) => {
  const guildId = req.params.id;

  try {
    const guild = await Guild.findOne({ guildId });
    if (!guild) {
      return res.status(404).json({ success: false, error: "Guild not found" });
    }

    res.json({ success: true, setup: guild });
  } catch (err) {
    console.error("Error fetching guild setup:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Route pour mettre à jour les informations de configuration d'un serveur
app.post("/api/guild/setup/:id", async (req, res) => {
  const guildId = req.params.id;
  const { serverName, welcomeChannel, welcomeMessage, logChannel, modRole } = req.body;

  try {
    await Guild.findOneAndUpdate(
      { guildId },
      { serverName, welcomeChannel, welcomeMessage, logChannel, modRole },
      { upsert: true }
    );

    res.json({ success: true, message: "Guild setup updated successfully" });
  } catch (err) {
    console.error("Error updating guild setup:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur en ligne sur le port " + PORT));
