const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

// Owner list (ex: en JSON)
const ownersFile = './owners.json';
let owners = JSON.parse(fs.readFileSync(ownersFile, 'utf-8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Ajouter ou retirer un owner (accès total au bot)')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Ajoute un owner')
        .addUserOption(opt => opt.setName('user').setDescription('Utilisateur à ajouter').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Retire un owner')
        .addUserOption(opt => opt.setName('user').setDescription('Utilisateur à retirer').setRequired(true))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');

    // Vérifie si l'utilisateur est déjà owner du bot (dev principal)
    const authorId = interaction.user.id;
    const botOwners = ['704006966376267777']
    if (!botOwners.includes(authorId)) {
      return interaction.reply({ content: '❌ Tu n’as pas la permission d’utiliser cette commande.', ephemeral: true });
    }

    if (sub === 'add') {
      if (owners.includes(user.id)) {
        return interaction.reply({ content: `⚠️ <@${user.id}> est déjà owner.` });
      }
      owners.push(user.id);
      fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));
      return interaction.reply({ content: `✅ <@${user.id}> a été ajouté comme owner.` });
    }

    if (sub === 'remove') {
      if (!owners.includes(user.id)) {
        return interaction.reply({ content: `⚠️ <@${user.id}> n’est pas owner.` });
      }
      owners = owners.filter(id => id !== user.id);
      fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));
      return interaction.reply({ content: `🗑️ <@${user.id}> a été retiré des owners.` });
    }
  }
};
