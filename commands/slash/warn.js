const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf-8'));
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user for a rule violation')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(false)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // removed for owner override

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || messages.warn_default_reason || "Aucune raison fournie.";
    const guildId = interaction.guildId;
    const filePath = './warnings.json';

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({ content: messages.warn_no_permission ?? "❌ Tu n'as pas la permission de warn.", ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: messages.warn_self ?? "❌ Tu ne peux pas te warn toi-même.", ephemeral: true });
    }

    if (user.bot) {
      return interaction.reply({ content: messages.warn_bot ?? "❌ Tu ne peux pas warn un bot.", ephemeral: true });
    }

    let data = {};
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        data = fileContent ? JSON.parse(fileContent) : {};
      } catch {
        data = {};
      }
    }

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][user.id]) data[guildId][user.id] = [];

    data[guildId][user.id].push(reason);

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Erreur écriture warnings.json :", error);
      return interaction.reply({ content: "❌ Impossible d’enregistrer l’avertissement.", ephemeral: true });
    }

    // Envoi du MP
    try {
      await user.send(`You have been warned in **${interaction.guild.name}** for: ${reason}`);
    } catch {
      // Ignorer si MP bloqués
    }

    return interaction.reply(
      messages.warn_success
        ?.replace('{user}', user.tag)
        .replace('{reason}', reason) || `✅ ${user.tag} a été warn pour : ${reason}`
    );
  }
};
