const { SlashCommandBuilder } = require('discord.js');
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
    .setName('addrole')
    .setDescription('Ajoute un rôle à un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à qui donner le rôle')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Rôle à ajouter')
        .setRequired(true)),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};

    const user = interaction.options.getUser('utilisateur');
    const role = interaction.options.getRole('role');
    const member = interaction.guild.members.cache.get(user.id);

    await interaction.deferReply();

    const authorIsOwner = isOwner(interaction.user.id);

    if (!authorIsOwner) {
      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.editReply({
          content: messages.addrole_error_add ?? "❌ Je n’ai pas pu ajouter le rôle.",
        });
      }

      if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.editReply({
          content: messages.addrole_error_user_hierarchy ?? "❌ Tu ne peux pas attribuer un rôle égal ou supérieur à ton rôle le plus élevé.",
        });
      }

      if (
        role.position >= interaction.member.roles.highest.position &&
        interaction.user.id !== interaction.guild.ownerId
      ) {
        return interaction.editReply({
          content: messages.addrole_error_user_hierarchy ?? "❌ Tu ne peux pas attribuer un rôle égal ou supérieur à ton rôle le plus élevé.",
        });
      }
    }

    try {
      await member.roles.add(role);

      return interaction.editReply({
        content: messages.addrole_success
          ?.replace('{user}', user.tag)
          .replace('{role}', role.name) ||
          `✅ Le rôle ${role.name} a été ajouté à ${user.tag}.`
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        content: messages.addrole_error_add ?? "❌ Erreur lors de l'ajout du rôle.",
      });
    }
  }
};
