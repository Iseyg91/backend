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

    // Infos utilisateur
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // Serveurs de l'utilisateur
    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userGuilds = await guildsResponse.json();

    // Attend que le bot soit prêt
    if (!client.isReady()) {
      await new Promise(resolve => client.once("ready", resolve));
    }

    const botGuilds = client.guilds.cache;

    const mutualGuilds = userGuilds.map(g => {
      const botGuild = botGuilds.get(g.id);
      const permissions = BigInt(g.permissions);
      const hasAdmin = (permissions & BigInt(0x00000008)) !== BigInt(0); // ADMINISTRATOR = 0x00000008

      return {
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=128`
          : null,
        isOwner: g.owner,
        hasAdmin,
        botPresent: !!botGuild,
        memberCount: botGuild?.memberCount || null,
      };
    });

    res.json({ success: true, user: userData, mutualGuilds });
  } catch (err) {
    res.json({ success: false, error: "Erreur serveur", details: err.message });
  }
});
