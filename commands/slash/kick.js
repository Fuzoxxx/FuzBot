const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Charger les owners depuis la branche générale (deux niveaux au-dessus)
const ownersFilePath = path.join(__dirname, '..', '..', 'owners.json');
let owners = [];
try {
  const rawData = fs.readFileSync(ownersFilePath, 'utf8');
  owners = JSON.parse(rawData);
  if (!Array.isArray(owners)) owners = [];
  owners = owners.map(id => id.toString());
} catch (error) {
  console.error('Erreur lors du chargement des owners:', error);
  owners = [];
}
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick un utilisateur du serveur')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Utilisateur à expulser')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison de l’expulsion')
        .setRequired(false)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Retiré pour permettre aux owners

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || messages.no_reason_provided || "Aucune raison fournie.";

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.KickMembers);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({ content: messages.kick_no_permission ?? "❌ Vous n'avez pas la permission d'expulser des membres.", ephemeral: true });
    }

    if (!target) {
      return interaction.reply({ content: messages.kick_not_found ?? "❌ Utilisateur introuvable.", ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: messages.kick_self ?? "❌ Vous ne pouvez pas vous expulser vous-même.", ephemeral: true });
    }

    if (!isUserOwner && target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: messages.kick_hierarchy ?? "❌ Vous ne pouvez pas expulser cet utilisateur car son rôle est égal ou supérieur au vôtre.",
        ephemeral: true
      });
    }

    if (!isUserOwner && !target.kickable) {
      return interaction.reply({ content: messages.kick_cannot_kick ?? "❌ Je ne peux pas expulser cet utilisateur.", ephemeral: true });
    }

    try {
      await target.send(`🚫 Vous avez été expulsé de **${interaction.guild.name}** pour la raison suivante : ${reason}`);
    } catch {
      // Ignorer erreur d'envoi de MP
    }

    try {
      await target.kick(reason);
      return interaction.reply({
        content: messages.kick_success
          ?.replace('{user}', target.user.tag)
          .replace('{reason}', reason) || `✅ ${target.user.tag} a été expulsé pour : ${reason}`
      });
    } catch (error) {
      return interaction.reply({
        content: messages.kick_failed?.replace('{error}', error.message) || `❌ Échec de l'expulsion : ${error.message}`,
        ephemeral: true
      });
    }
  }
};
