const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf-8'));
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user in the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to unmute')
        .setRequired(true)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // retiré pour owner override

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({ content: messages.unmute_no_permission ?? "❌ Tu n’as pas la permission de unmute.", ephemeral: true });
    }

    const target = interaction.options.getMember('target');
    if (!target) {
      return interaction.reply({ content: messages.unmute_user_not_found ?? "❌ Utilisateur introuvable.", ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: messages.unmute_self ?? "❌ Tu ne peux pas te unmute toi-même.", ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: messages.unmute_bot ?? "❌ Je ne peux pas me unmute moi-même.", ephemeral: true });
    }

    if (!target.moderatable && !isUserOwner) {
      return interaction.reply({ content: messages.unmute_cannot_unmute ?? "❌ Je ne peux pas unmute cet utilisateur.", ephemeral: true });
    }

    try {
      await target.timeout(null);
      return interaction.reply(messages.unmute_success?.replace('{user}', target.user.tag) || `✅ ${target.user.tag} a été unmute.`);
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: messages.unmute_failed?.replace('{error}', error.message) || `❌ Échec du unmute : ${error.message}`, ephemeral: true });
    }
  }
};
