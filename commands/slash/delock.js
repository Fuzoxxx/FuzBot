const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Chargement des owners depuis la branche générale (deux dossiers au-dessus)
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
    .setName('delock')
    .setDescription('Déverrouille le salon actuel'),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Désactivé

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};
    const channel = interaction.channel;

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({
        content: messages.delock_no_permission ?? "❌ Tu n’as pas la permission de déverrouiller ce salon.",
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: true,
      });

      return interaction.reply({
        content: messages.delock_success?.replace('{channel}', channel.name) ?? `✅ Salon **${channel.name}** déverrouillé.`,
        ephemeral: false,
      });
    } catch (err) {
      console.error("Erreur delock :", err);
      return interaction.reply({
        content: messages.delock_error ?? "❌ Une erreur est survenue lors du déverrouillage du salon.",
        ephemeral: true,
      });
    }
  },
};
