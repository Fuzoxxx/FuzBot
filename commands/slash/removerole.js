const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf-8'));
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Retire un rôle à un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à qui retirer le rôle')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Rôle à retirer')
        .setRequired(true)),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};

    const user = interaction.options.getUser('utilisateur');
    const role = interaction.options.getRole('role');
    const member = interaction.guild.members.cache.get(user.id);

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageRoles);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({ content: messages.removerole_no_permission ?? "❌ Tu n’as pas la permission de retirer des rôles.", ephemeral: true });
    }

    if (!member) {
      return interaction.reply({
        content: messages.removerole_member_not_found ?? '❌ Impossible de trouver ce membre sur le serveur.',
        ephemeral: true,
      });
    }

    if (!interaction.guild.roles.cache.has(role.id)) {
      return interaction.reply({
        content: messages.removerole_not_found ?? '❌ Ce rôle n’existe pas.',
        ephemeral: true,
      });
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: messages.removerole_user_has_not_role ?? `⚠️ ${user.tag} n’a pas le rôle ${role.name}.`,
        ephemeral: true,
      });
    }

    if (!isUserOwner && role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: messages.removerole_error_hierarchy ?? "❌ Je ne peux pas retirer ce rôle car il est plus haut ou égal à mon rôle le plus élevé.",
        ephemeral: true,
      });
    }

    if (!isUserOwner && role.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: messages.removerole_error_user_hierarchy ?? "❌ Tu ne peux pas retirer un rôle supérieur ou égal à ton rôle le plus élevé.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      await member.roles.remove(role);

      const successTemplate = messages.removerole_success ?? '✅ Le rôle {role} a été retiré à {user}.';
      const successMessage = successTemplate
        .replace('{user}', user.tag)
        .replace('{role}', role.name);

      return interaction.editReply({ content: successMessage });
    } catch (err) {
      console.error('Erreur retrait rôle :', err);
      return interaction.editReply({
        content: messages.removerole_error_remove ?? '❌ Erreur lors du retrait du rôle.',
      });
    }
  }
};
