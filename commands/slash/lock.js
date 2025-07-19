const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

let owners = [];
try {
  owners = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'owners.json'), 'utf-8'));
  if (!Array.isArray(owners)) owners = [];
  owners = owners.map(id => id.toString());
} catch {
  owners = [];
}
const isOwner = (id) => owners.includes(id);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Verrouille le salon actuel'),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};
    const channel = interaction.channel;

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "❌ Cette commande ne peut être utilisée que dans un salon texte.",
        ephemeral: true,
      });
    }

    const isUserOwner = isOwner(interaction.user.id);
    const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

    if (!isUserOwner && !hasPerm) {
      return interaction.reply({
        content: messages.lock_no_permission ?? "❌ Tu n’as pas la permission de verrouiller ce salon.",
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        sendMessages: false,  // note la casse ici en camelCase
      });

      return interaction.reply({
        content: messages.lock_success?.replace('{channel}', channel.name) ?? `🔒 Salon **${channel.name}** verrouillé.`,
        ephemeral: false,
      });
    } catch (err) {
      console.error("Erreur lock :", err);
      return interaction.reply({
        content: messages.lock_error ?? "❌ Une erreur est survenue lors du verrouillage du salon.",
        ephemeral: true,
      });
    }
  },
};
