const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Crée un sondage avec des options personnalisées.')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Question du sondage')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('option1')
        .setDescription('Option 1')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('option2')
        .setDescription('Option 2')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('option3')
        .setDescription('Option 3')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option4')
        .setDescription('Option 4')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option5')
        .setDescription('Option 5')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option6')
        .setDescription('Option 6')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option7')
        .setDescription('Option 7')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option8')
        .setDescription('Option 8')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option9')
        .setDescription('Option 9')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option10')
        .setDescription('Option 10')
        .setRequired(false)),

  async execute(interaction, lang) {
    const messages = interaction.client.locales?.[lang] || {};

    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const question = interaction.options.getString('question');
    
    // Récupérer les options fournies
    const options = [];
    for (let i = 1; i <= 10; i++) {
      const opt = interaction.options.getString(`option${i}`);
      if (opt) options.push(opt);
    }

    // Construction de l'embed
    let description = '';
    options.forEach((opt, index) => {
      description += `${emojis[index]} ${opt}\n`;
    });

    const embed = {
      title: messages.poll_title || '📊 Sondage',
      description: `**${question}**\n\n${description}\n${messages.poll_react_instruction || 'Répondez avec une réaction ci-dessous.'}`,
      color: 0x00b0f4,
      footer: {
        text: messages.poll_created_by?.replace('{user}', interaction.user.tag) || `Créé par ${interaction.user.tag}`,
      }
    };

    try {
      const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

      for (let i = 0; i < options.length; i++) {
        await pollMessage.react(emojis[i]);
      }
    } catch (error) {
      console.error('Erreur lors de la création du sondage :', error);
      await interaction.reply({
        content: messages.poll_error || '❌ Une erreur est survenue lors de la création du sondage.',
        ephemeral: true
      });
    }
  }
};
