const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ownersFilePath = path.join('owners.json');

let owners = [];
try {
  const rawData = fs.readFileSync(ownersFilePath, 'utf8');
  owners = JSON.parse(rawData);
  if (!Array.isArray(owners)) owners = [];
  owners = owners.map(id => id.toString());
  console.log('Owners chargés :', owners);
} catch (error) {
  console.error('Erreur lors du chargement des owners:', error);
  owners = [];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user (owners can bypass permissions)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Utilisateur à bannir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison du ban')
        .setRequired(false)),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};

    const userId = interaction.user.id;
    const target = interaction.options.getMember('target');

    if (!target) {
      return interaction.reply({ content: messages.ban_user_not_found || "❌ Utilisateur introuvable.", ephemeral: true });
    }

    if (target.id === userId) {
      return interaction.reply({ content: messages.ban_self || "❌ Tu ne peux pas te bannir toi-même.", ephemeral: true });
    }

    const isOwner = owners.includes(userId);
    console.log(`User ID: ${userId} | isOwner: ${isOwner}`);

    if (!isOwner && !interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: messages.ban_no_permission || "❌ Vous n'avez pas la permission de bannir des membres.", ephemeral: true });
    }

    if (!target.bannable) {
      return interaction.reply({ content: messages.ban_cannot_ban || "❌ Je ne peux pas bannir cet utilisateur.", ephemeral: true });
    }

    const reason = interaction.options.getString('reason') || (messages.ban_no_reason || "Aucune raison fournie");

    try {
      await target.ban({ reason });
      return interaction.reply(
        (messages.ban_success || "✅ {user} a été banni. Raison : {reason}")
          .replace('{user}', target.user.tag)
          .replace('{reason}', reason)
      );
    } catch (error) {
      console.error('Erreur ban:', error);
      return interaction.reply({ content: (messages.ban_error || "❌ Erreur lors du ban : {error}").replace('{error}', error.message), ephemeral: true });
    }
  }
};
