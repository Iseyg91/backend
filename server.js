const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

// Initialisation du bot Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.login(process.env.ETHERYA);

const app = express();
app.use(cors());

// Configuration OAuth via les variables d'environnement
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

// Route OAuth2
app.get("/api/discord-oauth", async (req, res) => {
  const code = req.query.code;
  const redirectUri = req.query.redirect_uri;

  if (!code || !redirectUri) {
    return res.json({ success: false, error: "Code ou redirect_uri manquant" });
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
  });

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.json({
        success: false,
        error: "Token non reçu",
        details: tokenData,
      });
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userGuilds = await guildsResponse.json();

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
          } catch (err) {
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
    res.json({ success: false, error: "Erreur serveur", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur en ligne sur le port " + PORT));
