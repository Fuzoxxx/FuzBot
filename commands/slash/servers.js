const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('Affiche tous les serveurs où le bot est présent'),

  async execute(interaction) {
    if (interaction.user.id !== '704006966376267777') {
      return interaction.reply({ content: '❌ Tu n’es pas autorisé à utiliser cette commande.', ephemeral: true });
    }

    const guilds = interaction.client.guilds.cache.map(g => `${g.name} (${g.id})`);

    // Split en blocs de 2000 caractères max
    const chunks = [];
    let currentChunk = '';

    for (const line of guilds) {
      if ((currentChunk + line + '\n').length > 1900) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      currentChunk += line + '\n';
    }
    if (currentChunk) chunks.push(currentChunk);

    await interaction.reply({ content: `📋 Serveurs où je suis présent (${guilds.length}) :`, ephemeral: true });

    for (const chunk of chunks) {
      await interaction.followUp({ content: chunk, ephemeral: true });
    }
  }
};
