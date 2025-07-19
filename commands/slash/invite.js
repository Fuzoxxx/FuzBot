const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Obtiens le lien d\'invitation du bot'),

  async execute(interaction) {
    const clientId = interaction.client.user.id;

    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

    try {
      await interaction.reply({
        content: `🔗 **Voici le lien pour inviter le bot dans ton serveur :**\n${inviteUrl}`,
        ephemeral: true // visible uniquement par la personne qui exécute la commande
      });
    } catch (error) {
      console.error('❌ Erreur en envoyant le lien d\'invitation :', error);
      await interaction.reply({
        content: '❌ Une erreur est survenue en générant le lien.',
        ephemeral: true
      });
    }
  }
};
