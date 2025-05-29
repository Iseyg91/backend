const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

// Initialisation du bot Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.login(process.env.ETHERYA);

const app = express();
app.use(cors());

const CLIENT_ID = "1356693934012891176";
const CLIENT_SECRET = "_IE6vn65TN0qbIcmfyFE1T62EhzXWToU";
const REDIRECT_URI = "http://127.0.0.1:5500/pages/serveur.html";

// Route principale OAuth2
app.get("/api/discord-oauth", async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
  });

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.json({ success: false, error: "Token non reçu", details: tokenData });
    }

    // Récupère les infos utilisateur
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // Récupère les serveurs de l'utilisateur
    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userGuilds = await guildsResponse.json();

    // Attends que le bot soit prêt
    if (!client.isReady()) {
      await new Promise(resolve => client.once("ready", resolve));
    }

    // Filtrer les serveurs mutualisés (où le bot et l'utilisateur sont tous les deux)
    const botGuilds = client.guilds.cache;
    const mutualGuilds = userGuilds
      .filter(g => botGuilds.has(g.id))
      .map(g => {
        const botGuild = botGuilds.get(g.id);
        return {
          id: g.id,
          name: g.name,
          icon: g.icon
            ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=128`
            : null,
          isOwner: g.owner,
          memberCount: botGuild.memberCount,
        };
      });

    res.json({ success: true, user: userData, mutualGuilds });
  } catch (err) {
    res.json({ success: false, error: "Erreur serveur", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur en ligne sur le port " + PORT));
