const { REST, Routes } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const commands = [];
const slashCommandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
  const command = require(`./commands/slash/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('🔁 Refreshing application (/) commands...');
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands },
    );
    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
