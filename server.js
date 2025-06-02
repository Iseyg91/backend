const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

// Connexion à MongoDB via Render (variables définies dans Settings > Environment)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schéma de configuration du serveur
const GuildSchema = new mongoose.Schema({
  guildId: String,
  prefix: String,
  owner: String,
  admin_role: String,
  staff_role: String,
});

const Guild = mongoose.model("Guild", GuildSchema);

// Middleware de vérification des permissions admin
async function checkGuildAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Missing or invalid token" });
  }

  const accessToken = authHeader.split(" ")[1];
  const guildId = req.params.id;

  try {
    const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const guilds = await guildsRes.json();
    const guild = guilds.find((g) => g.id === guildId);

    if (!guild) {
      return res.status(403).json({ success: false, error: "Vous n'êtes pas dans ce serveur" });
    }

    const ADMIN_PERMISSION = 0x00000008;
    const hasAdmin = (guild.permissions & ADMIN_PERMISSION) === ADMIN_PERMISSION;

    if (!hasAdmin) {
      return res.status(403).json({ success: false, error: "Permission administrateur requise" });
    }

    next(); // autorisé
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ success: false, error: "Erreur lors de la vérification" });
  }
}

// ✨ Route publique pour obtenir les infos d’un serveur
app.get("/api/guild/setup/:id", async (req, res) => {
  const guildId = req.params.id;

  try {
    const guild = await Guild.findOne({ guildId });
    if (!guild) {
      return res.status(404).json({ success: false, error: "Serveur introuvable" });
    }

    res.json({ success: true, setup: guild });
  } catch (err) {
    console.error("Erreur lors de la récupération :", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// ✨ Route protégée pour modifier les infos d’un serveur
app.post("/api/guild/setup/:id", checkGuildAdmin, async (req, res) => {
  const guildId = req.params.id;
  const { prefix, owner, admin_role, staff_role } = req.body;

  try {
    await Guild.findOneAndUpdate(
      { guildId },
      { prefix, owner, admin_role, staff_role },
      { upsert: true }
    );

    res.json({ success: true, message: "Configuration mise à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur en ligne sur le port " + PORT));
