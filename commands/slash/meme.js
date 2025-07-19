const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    try {
      const res = await fetch('https://meme-api.com/gimme');
      const json = await res.json();

      if (!json.url) throw new Error('No meme found');

      await interaction.reply({ content: `${messages.meme_title}: ${json.title}\n${json.url}` });
    } catch (error) {
      await interaction.reply({ content: messages.meme_error, ephemeral: true });
    }
  }
};
