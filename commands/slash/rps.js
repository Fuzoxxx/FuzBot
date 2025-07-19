const { SlashCommandBuilder } = require('discord.js');

const choices = ['rock', 'paper', 'scissors'];

const choicesFR = {
  rock: 'pierre',
  paper: 'papier',
  scissors: 'ciseaux',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock-paper-scissors')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Your choice: rock, paper or scissors')
        .setRequired(true)
        .addChoices(
          { name: 'Rock', value: 'rock' },
          { name: 'Paper', value: 'paper' },
          { name: 'Scissors', value: 'scissors' },
        )),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    const userChoice = interaction.options.getString('choice');
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let userChoiceStr = userChoice;
    let botChoiceStr = botChoice;
    if (lang === 'fr') {
      userChoiceStr = choicesFR[userChoice];
      botChoiceStr = choicesFR[botChoice];
    }

    // Determine winner
    let result;
    if (userChoice === botChoice) {
      result = messages.rps_draw;
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = messages.rps_win;
    } else {
      result = messages.rps_lose;
    }

    await interaction.reply(`${messages.rps_your_choice}: **${userChoiceStr}**\n${messages.rps_bot_choice}: **${botChoiceStr}**\n\n${result}`);
  }
};
