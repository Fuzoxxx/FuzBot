const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot et de l\'API'),

  async execute(interaction, lang) {
    const sent = await interaction.reply({ content: '🔄 Calcul en cours...', fetchReply: true });

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong !')
      .setColor(0x00AE86)
      .addFields(
        {
          name: '📡 Latence du bot',
          value: `${sent.createdTimestamp - interaction.createdTimestamp} ms`,
          inline: true
        },
        {
          name: '💻 Latence de l\'API',
          value: `${Math.round(interaction.client.ws.ping)} ms`,
          inline: true
        }
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};

