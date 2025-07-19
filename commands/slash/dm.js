const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Envoie un message privé à un membre')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à qui envoyer le DM')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Le message à envoyer')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const message = interaction.options.getString('message');

    try {
      await user.send(message);
      await interaction.reply({ content: `✅ Message envoyé à ${user.tag} !`, ephemeral: true });
    } catch (error) {
      console.error(`Erreur en envoyant un DM à ${user.tag} :`, error);
      await interaction.reply({ content: `❌ Impossible d'envoyer le DM à ${user.tag}.`, ephemeral: true });
    }
  },
};
