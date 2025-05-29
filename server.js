const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors()); // autorise les appels depuis ton frontend

const CLIENT_ID = "1356693934012891176";
const CLIENT_SECRET = "_IE6vn65TN0qbIcmfyFE1T62EhzXWToU";
const REDIRECT_URI = "http://127.0.0.1:5500/pages/serveur.html";

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

    if (tokenData.access_token) {
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userResponse.json();

      res.json({ success: true, user: userData });
    } else {
      res.json({ success: false, error: "Token non reçu", details: tokenData });
    }
  } catch (err) {
    res.json({ success: false, error: "Erreur serveur", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur en ligne sur le port " + PORT));
