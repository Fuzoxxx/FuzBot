const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const fs = require('fs');

const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf-8'));
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute un utilisateur pour une durée spécifique')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Utilisateur à mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Durée du mute (ex: 10m, 1h, 2d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison du mute')
        .setRequired(false)),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);
    if (!isUserOwner && !hasPerm) {
      return interaction.reply({ content: messages.mute_no_permission ?? "❌ Tu n’as pas la permission de mute.", ephemeral: true });
    }

    const target = interaction.options.getMember('target');
    if (!target) {
      return interaction.reply({ content: messages.mute_user_not_found ?? "❌ Utilisateur introuvable.", ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: messages.mute_self ?? "❌ Tu ne peux pas te mute toi-même.", ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: messages.mute_bot ?? "❌ Je ne peux pas me mute moi-même.", ephemeral: true });
    }

    if (!isUserOwner && target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: messages.mute_hierarchy ?? "❌ Tu ne peux pas mute cet utilisateur car son rôle est égal ou supérieur au tien.",
        ephemeral: true,
      });
    }

    if (!isUserOwner && !target.moderatable) {
      return interaction.reply({ content: messages.mute_cannot_mute ?? "❌ Je ne peux pas mute cet utilisateur.", ephemeral: true });
    }

    const reason = interaction.options.getString('reason') || messages.no_reason_provided || "Aucune raison fournie.";
    const duration = interaction.options.getString('duration');

    await interaction.deferReply({ ephemeral: false });

    const timeMs = ms(duration);
    if (!timeMs) {
      return interaction.editReply({ content: messages.mute_invalid_duration ?? "❌ Durée invalide." });
    }

    const maxDuration = 28 * 24 * 60 * 60 * 1000;
    if (timeMs > maxDuration) {
      return interaction.editReply({ content: messages.mute_duration_too_long ?? "❌ Durée trop longue (max 28 jours)." });
    }

    try {
      await target.timeout(timeMs, reason);
      return interaction.editReply(
        (messages.mute_success ?? "✅ {user} a été mute pour {duration} pour la raison : {reason}")
          .replace('{user}', target.user.tag)
          .replace('{reason}', reason)
          .replace('{duration}', duration)
      );
    } catch (error) {
      console.error(error);
      return interaction.editReply({ content: (messages.mute_failed ?? "❌ Échec du mute : {error}").replace('{error}', error.message) });
    }
  },
};
