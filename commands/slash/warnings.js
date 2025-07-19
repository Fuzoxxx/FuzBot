const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf-8'));
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Show all warnings of a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check warnings for')
        .setRequired(true)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // removed for owner override

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};
    const user = interaction.options.getUser('user');
    const guildId = interaction.guildId;
    const filePath = './warnings.json';

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({ content: messages.warnings_no_permission ?? "❌ Tu n'as pas la permission de voir les warnings.", ephemeral: true });
    }

    let data = {};
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        data = fileContent ? JSON.parse(fileContent) : {};
      } catch {
        data = {};
      }
    }

    const userWarnings = data[guildId]?.[user.id];

    if (!userWarnings || userWarnings.length === 0) {
      return interaction.reply(
        messages.warnings_none?.replace('{user}', user.tag) || `ℹ️ ${user.tag} n'a aucun warn.`
      );
    }

    // Limiter à 10 warnings max pour éviter message trop long
    const warningsToShow = userWarnings.slice(0, 10);
    const formattedWarnings = warningsToShow
      .map((w, i) => `${i + 1}. ${w}`)
      .join('\n');

    let replyMessage = messages.warnings_list
      ?.replace('{user}', user.tag)
      .replace('{warnings}', formattedWarnings)
      || `⚠️ Warnings pour ${user.tag} :\n${formattedWarnings}`;

    if (userWarnings.length > 10) {
      replyMessage += `\n...et ${userWarnings.length - 10} autres avertissements.`;
    }

    return interaction.reply(replyMessage);
  }
};
