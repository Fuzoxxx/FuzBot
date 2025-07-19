const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Charger owners depuis la branche générale (deux niveaux au-dessus)
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
    .setName('clearwarns')
    .setDescription('Clear all warnings of a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to clear warnings for')
        .setRequired(true)),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};
    const user = interaction.options.getUser('user');
    const guildId = interaction.guildId;
    const filePath = './warnings.json';

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({
        content: messages.no_permission_clearwarns ?? "❌ Tu n’as pas la permission d’effacer les avertissements.",
        ephemeral: true,
      });
    }

    let data = {};
    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.error('Erreur lecture warnings.json:', e);
        data = {};
      }
    }

    if (data[guildId]?.[user.id]) {
      delete data[guildId][user.id];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return interaction.reply({
        content: messages.warnings_cleared?.replace('{user}', user.tag) ?? `✅ Les avertissements de ${user.tag} ont été supprimés.`,
        ephemeral: false,
      });
    }

    return interaction.reply({
      content: messages.warnings_clear_none?.replace('{user}', user.tag) ?? `ℹ️ ${user.tag} n'a aucun avertissement.`,
      ephemeral: true,
    });
  }
};
