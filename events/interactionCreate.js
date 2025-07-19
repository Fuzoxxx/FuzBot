const fs = require('fs');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    // Lecture du fichier languages.json
    let languages = {};
    try {
      languages = JSON.parse(fs.readFileSync('./languages.json', 'utf8'));
    } catch (e) {
      console.error('Erreur lecture languages.json :', e);
    }

    // Langue par défaut = 'en'
    const lang = languages[interaction.guildId] || 'en';

    try {
      await command.execute(interaction, lang);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande "${interaction.commandName}":`, error);

      // Si la réponse a déjà été envoyée, on utilise editReply()
      if (interaction.deferred || interaction.replied) {
        try {
          await interaction.editReply({
            content: client.locales[lang]?.error || 'Une erreur est survenue.',
          });
        } catch (editError) {
          console.error('Impossible de modifier la réponse :', editError);
        }
      } else {
        try {
          await interaction.reply({
            content: client.locales[lang]?.error || 'Une erreur est survenue.',
            ephemeral: true,
          });
        } catch (replyError) {
          console.error('Impossible d\'envoyer une réponse :', replyError);
        }
      }
    }
  },
};
