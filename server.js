const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const GuildSchema = new mongoose.Schema({
  guildId: String,
  prefix: String,
  owner: String,
  admin_role: String,
  staff_role: String,
});

const Guild = mongoose.model("Guild", GuildSchema);

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
  const { prefix, owner, admin_role, staff_role } = req.body;

  try {
    await Guild.findOneAndUpdate(
      { guildId },
      { prefix, owner, admin_role, staff_role },
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
app.listen(PORT, () => console.log("Server is running on port " + PORT));
