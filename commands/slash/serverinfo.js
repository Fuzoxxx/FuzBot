const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show info about this server'),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    const guild = interaction.guild;

    const totalMembers = guild.memberCount;

    let humanMembers = 'N/A';
    let botMembers = 'N/A';

    try {
      // ⚠️ Nécessite que l'intent "GUILD_MEMBERS" soit activé !
      const allMembers = await guild.members.fetch(); // fetch tous les membres

      humanMembers = allMembers.filter(m => !m.user.bot).size;
      botMembers = allMembers.filter(m => m.user.bot).size;
    } catch (err) {
      console.warn(`[serverinfo] Erreur lors du fetch des membres :`, err);

      // Fallback : utilise le cache s'il existe
      const cached = guild.members.cache;
      if (cached.size > 0) {
        humanMembers = cached.filter(m => !m.user.bot).size + '+';
        botMembers = cached.filter(m => m.user.bot).size + '+';
      }
    }

    const totalChannels = guild.channels.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.isTextBased() && !c.isVoiceBased()).size;
    const voiceChannels = guild.channels.cache.filter(c => c.isVoiceBased()).size;

    const totalRoles = guild.roles.cache.size;

    const embed = {
      color: 0x0099ff,
      title: messages.serverinfo_title.replace('{server}', guild.name),
      thumbnail: { url: guild.iconURL({ dynamic: true }) },
      fields: [
        {
          name: messages.serverinfo_owner,
          value: `<@${guild.ownerId}>`,
          inline: true
        },
        {
          name: messages.serverinfo_created,
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
          inline: true
        },
        {
          name: messages.serverinfo_id,
          value: guild.id,
          inline: true
        },
        {
          name: messages.serverinfo_members,
          value: `${messages.total}: ${totalMembers}\n👤 ${messages.humans}: ${humanMembers}\n🤖 ${messages.bots}: ${botMembers}`,
          inline: false
        },
        {
          name: messages.serverinfo_channels,
          value: `${messages.total}: ${totalChannels}\n💬 ${messages.texts}: ${textChannels}\n🔊 ${messages.voices}: ${voiceChannels}`,
          inline: false
        },
        {
          name: messages.serverinfo_roles,
          value: `${messages.total}: ${totalRoles}`,
          inline: false
        }
      ],
      timestamp: new Date(),
      footer: { text: messages.serverinfo_footer }
    };

    await interaction.reply({ embeds: [embed] });
  }
};
