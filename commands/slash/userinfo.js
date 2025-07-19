const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show info about a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to get info about')
        .setRequired(false)),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    const user = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: messages.userinfo_not_found, ephemeral: true });
    }

    const embed = {
      color: 0x0099ff,
      title: messages.userinfo_title.replace('{user}', user.tag),
      thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
      fields: [
        {
          name: messages.userinfo_joined_server,
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`,
          inline: true
        },
        {
          name: messages.userinfo_account_created,
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
          inline: true
        },
        {
          name: messages.userinfo_id,
          value: user.id,
          inline: true
        },
        {
          name: messages.userinfo_bot,
          value: user.bot ? messages.yes : messages.no,
          inline: true
        },
        {
          name: messages.userinfo_top_role,
          value: member.roles.highest.id !== interaction.guild.id ? `<@&${member.roles.highest.id}>` : messages.none,
          inline: true
        },
        {
          name: messages.userinfo_roles,
          value: `${member.roles.cache.size - 1}`,
          inline: true
        },
        {
          name: messages.userinfo_boosting,
          value: member.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>` : messages.no,
          inline: true
        }
      ],
      timestamp: new Date(),
      footer: { text: messages.userinfo_footer }
    };

    const avatarButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(messages.view_avatar)
        .setStyle(ButtonStyle.Link)
        .setURL(user.displayAvatarURL({ size: 1024, dynamic: true }))
    );

    await interaction.reply({ embeds: [embed], components: [avatarButton] });
  }
};
