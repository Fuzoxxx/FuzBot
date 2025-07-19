const fs = require('fs');
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlang')
    .setDescription('Change bot language for this server (en/fr/it/esp/de/ar)')
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Choose language: en, fr, it, de, esp or ar')
        .setRequired(true)
        .addChoices(
          { name: 'English', value: 'en' },
          { name: 'Français', value: 'fr' },
          { name: 'Italian', value: 'it' },
          { name: 'Spanish', value: 'esp' },
          { name: 'Deutsch', value: 'de' },
          { name: 'العربية', value: 'ar'}
        )),
  
  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: messages.setlang_no_permission, ephemeral: true });
    }

    const newLang = interaction.options.getString('language');

    let languages = {};
    try {
      languages = JSON.parse(fs.readFileSync('./languages.json', 'utf8'));
    } catch {
      languages = {};
    }

    languages[interaction.guild.id] = newLang;

    fs.writeFileSync('./languages.json', JSON.stringify(languages, null, 2));

    // Message de confirmation en fonction de la nouvelle langue choisie
    const confirmMsg = interaction.client.locales[newLang]?.setlang_success || `✅ Language set to \`${newLang}\``;

    await interaction.reply({ content: confirmMsg, ephemeral: false });
  },
};
