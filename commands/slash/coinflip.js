const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin'),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    const flip = Math.random() < 0.5 ? messages.coinflip_heads : messages.coinflip_tails;
    await interaction.reply(`${messages.coinflip_result}: 🪙 ${flip}`);
  }
};
