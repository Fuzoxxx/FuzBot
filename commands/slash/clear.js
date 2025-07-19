const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ownersFilePath = path.join(__dirname, '..', '..', 'owners.json');
let owners = [];
try {
  const rawData = fs.readFileSync(ownersFilePath, 'utf8');
  owners = JSON.parse(rawData);
  if (!Array.isArray(owners)) owners = [];
  owners = owners.map(id => id.toString());
} catch {
  owners = [];
}

const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of messages in a channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
    ),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang] || {};

    const authorIsOwner = isOwner(interaction.user.id);

    // Si pas owner, vérifier la permission
    if (!authorIsOwner && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: messages.clear_no_permission ?? "🚫 Vous n'avez pas la permission de gérer les messages.", ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: messages.clear_invalid_amount ?? "❌ Veuillez spécifier un nombre entre 1 et 100.", ephemeral: true });
    }

    try {
      await interaction.channel.bulkDelete(amount, true);
      return interaction.reply({ content: messages.clear_success?.replace('{amount}', amount) ?? `✅ ${amount} messages ont été supprimés.` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: messages.clear_failed?.replace('{error}', error.message) ?? `❌ Échec de la suppression des messages : ${error.message}`, ephemeral: true });
    }
  }
};
