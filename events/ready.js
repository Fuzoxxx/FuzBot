const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

    // Statut personnalisé
    client.user.setPresence({
      activities: [
        {
          name: 'V4.1.2 | Bêta ',
          type: ActivityType.Watching,
        },
      ],
      status: 'online',
    });
  console.log('✅ Status and activity was updated')
  },
};
