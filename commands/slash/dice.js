const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice'),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    const roll = Math.floor(Math.random() * 6) + 1;
    await interaction.reply(`${messages.dice_roll}: 🎲 ${roll}`);
  }
};
