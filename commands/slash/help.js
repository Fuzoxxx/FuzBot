const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const support = require('./support');

const categoryEmojis = {
  moderation: '🛠️',
  music: '🎵',
  fun: '🎲',
  utilities: '⚙️',
  support: '📞',
  home: '🏠',
};

function createHomeEmbed(messages, lang) {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`${categoryEmojis.home} ${messages.help_menu_title}`)
    .setDescription(
      `${messages.help_welcome}\n` +
      `${messages.help_select_category}\n\n` +
      `${messages.help_current_language}: \`${lang.toUpperCase()}\`\n` +
      `${messages.help_creator}\n\n` +
      `${messages.help_note}\n\n` +
      `${messages.help_links_label}`
    )
    .setFooter({ text: messages.help_footer })
    .setTimestamp();
}

function createCategoryEmbed(category, cmds, messages) {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`${categoryEmojis[category] || ''} ${messages.help_category_title.replace('{category}', category.charAt(0).toUpperCase() + category.slice(1))}`)
    .setDescription(cmds.map(c => `\`/${c}\``).join('\n'))
    .setFooter({ text: messages.help_footer })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu with all commands'),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];

    const categories = {
      moderation: ['ban', 'kick', 'warn', 'clear', 'mute', 'unmute', 'warnings', 'clearwarns'],
      music: ['play', 'skip', 'stop', 'queue', 'pause', 'resume', 'volume'],
      fun: ['8ball', 'coinflip', 'meme', 'dice', 'joke', 'rps', 'poll'],
      utilities: ['userinfo', 'serverinfo', 'ping', 'help', 'setlang', 'say', 'addrole', 'removerole'],
      support: ['support', 'close-support']
    };

    const select = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder(messages.help_select_placeholder)
      .addOptions([
        { label: messages.help_home_label, value: 'home', emoji: categoryEmojis.home },
        ...Object.keys(categories).map(cat => ({
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: cat,
          emoji: categoryEmojis[cat] || undefined,
        })),
      ]);

    const rowSelect = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      embeds: [createHomeEmbed(messages, lang)],
      components: [rowSelect],
      ephemeral: true,
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 120000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: messages.help_not_your_menu, ephemeral: true });
      }

      if (i.isStringSelectMenu()) {
        const value = i.values[0];

        if (value === 'home') {
          await i.update({
            embeds: [createHomeEmbed(messages, lang)],
            components: [rowSelect],
          });
          return;
        }

        if (categories[value]) {
          await i.update({
            embeds: [createCategoryEmbed(value, categories[value], messages)],
            components: [rowSelect],
          });
          return;
        }
      }
    });

    collector.on('end', async () => {
      select.setDisabled(true);

      await interaction.editReply({
        components: [new ActionRowBuilder().addComponents(select)],
      });
    });
  },
};
