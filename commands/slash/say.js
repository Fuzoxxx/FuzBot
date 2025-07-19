const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Fait répéter un message par le bot')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message à répéter')
        .setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('message');

    // On répond de façon éphemère pour cacher la commande d'origine
    await interaction.deferReply({ ephemeral: true });

    // Envoyer le message dans le canal où la commande a été utilisée
    await interaction.channel.send(text);

    // Supprimer la réponse éphemère (qui n’a rien, c’est juste pour faire passer l’interaction)
    await interaction.deleteReply();
  }
};
