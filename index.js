const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials, ChannelType } = require('discord.js');
const config = require('./config.json');

const supportLinksFile = path.join(__dirname, 'data', 'supportLinks.json');

async function init() {
  try {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
  ],
      partials: [Partials.Channel,
  ],
});

    client.config = config;

    // Initialise la Map
    client.supportLinks = new Map();

    // Charge la Map depuis le fichier JSON s'il existe
    client.loadSupportLinks = function() {
      if (fs.existsSync(supportLinksFile)) {
        try {
          const data = fs.readFileSync(supportLinksFile, 'utf8');
          const obj = JSON.parse(data);
          // obj est un objet clé-valeur, on le convertit en Map
          client.supportLinks = new Map(Object.entries(obj));
          console.log('✅ supportLinks chargé depuis le fichier.');
        } catch (err) {
          console.error('❌ Erreur lors du chargement de supportLinks:', err);
        }
      }
    };

    // Sauvegarde la Map dans un fichier JSON
    client.saveSupportLinks = function() {
      try {
        const obj = Object.fromEntries(client.supportLinks);
        if (!fs.existsSync(path.dirname(supportLinksFile))) {
          fs.mkdirSync(path.dirname(supportLinksFile), { recursive: true });
        }
        fs.writeFileSync(supportLinksFile, JSON.stringify(obj, null, 2));
        console.log('✅ supportLinks sauvegardé.');
      } catch (err) {
        console.error('❌ Erreur lors de la sauvegarde de supportLinks:', err);
      }
    };

    // Charger supportLinks au démarrage
    client.loadSupportLinks();

    // Le reste de ton code (locales, commandes, événements)...

    // Collections et locales
    client.slashCommands = new Collection();
    client.locales = {
      en: require('./locales/en.json'),
      fr: require('./locales/fr.json'),
      it: require('./locales/it.json'),
      esp: require('./locales/esp.json'),
      de: require('./locales/de.json'),
      ar: require('./locales/ar.json'),
    };

    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands/slash')).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(__dirname, 'commands/slash', file));
      client.slashCommands.set(command.data.name, command);
    }

    const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(path.join(__dirname, 'events', file));
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }

    await client.login(config.token);
    console.log('✅ Bot connecté avec succès.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
  }
}

init();
