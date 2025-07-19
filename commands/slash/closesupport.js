const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close-support")
    .setDescription("🗑️ Fermer un support en cours")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, lang) {
    const client = interaction.client;
    const channel = interaction.channel;
    const linkedId = client.supportLinks.get(channel.id);

    if (!linkedId) {
      return interaction.reply({ content: lang.support?.errors?.notLinked || "❌ Ce salon n'est pas lié à un support.", ephemeral: true });
    }

    const linkedChannel = client.channels.cache.get(linkedId);

    // Récupère les 100 derniers messages dans l'ordre chronologique
    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = messages
      .reverse()
      .map(m => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}`)
      .join("\n");

    // Chemin du fichier transcript dans le dossier transcripts/
    const logDir = path.join(__dirname, "../../transcripts");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    const logPath = path.join(logDir, `support-${Date.now()}.txt`);
    fs.writeFileSync(logPath, transcript);

    // Supprime les deux salons support
    if (linkedChannel) await linkedChannel.delete().catch(() => {});
    await channel.delete().catch(() => {});

    // Supprime les liens dans la Map
    client.supportLinks.delete(channel.id);
    client.supportLinks.delete(linkedId);

    // Sauvegarde la Map mise à jour dans le fichier JSON
    if (typeof client.saveSupportLinks === "function") {
      client.saveSupportLinks();
    }
  }
};
