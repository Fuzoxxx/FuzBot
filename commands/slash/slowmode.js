const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf-8'));
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Configure le slowmode du canal')
    .addIntegerOption(option =>
      option
        .setName('seconds')
        .setDescription('Temps en secondes (0 pour désactiver, max 21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};
    const seconds = interaction.options.getInteger('seconds');

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({
        content: messages.slowmode_no_permission ?? "❌ Tu n’as pas la permission de configurer le slowmode.",
        ephemeral: true,
      });
    }

    try {
      await interaction.channel.setRateLimitPerUser(seconds);

      const replyMessage = seconds === 0
        ? (messages.slowmode_disabled ?? "✅ Slowmode désactivé.")
        : (messages.slowmode_enabled?.replace('{seconds}', seconds) ?? `✅ Slowmode réglé à ${seconds} secondes.`);

      return interaction.reply({ content: replyMessage });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: messages.error_occurred ?? "❌ Une erreur est survenue.",
        ephemeral: true,
      });
    }
  },
};
