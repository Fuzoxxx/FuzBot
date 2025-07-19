const { EmbedBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const supportLinksFile = path.join(__dirname, '../../data/supportLinks.json');

// Charger supportLinks
function loadSupportLinks(client) {
  if (fs.existsSync(supportLinksFile)) {
    try {
      const data = fs.readFileSync(supportLinksFile, 'utf8');
      const obj = JSON.parse(data);
      client.supportLinks = new Map(Object.entries(obj));
      console.log('✅ supportLinks chargé depuis le fichier.');
    } catch (err) {
      console.error('❌ Erreur lors du chargement de supportLinks:', err);
      client.supportLinks = new Map();
    }
  } else {
    client.supportLinks = new Map();
  }
}

// Sauvegarder supportLinks
function saveSupportLinks(client) {
  try {
    if (!fs.existsSync(path.dirname(supportLinksFile))) {
      fs.mkdirSync(path.dirname(supportLinksFile), { recursive: true });
    }
    const obj = Object.fromEntries(client.supportLinks);
    fs.writeFileSync(supportLinksFile, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error('❌ Erreur lors de la sauvegarde de supportLinks:', err);
  }
}

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    const client = message.client;

    if (!client.supportLinks) loadSupportLinks(client);

    if (message.author.bot) return;

    // ✅ GESTION DES DMs
    if (message.channel.type === ChannelType.DM) {
      const ownerId = '704006966376267777'; // Ton ID ici
      try {
        const owner = await client.users.fetch(ownerId);
        console.log(`📥 DM reçu de ${message.author.tag}: ${message.content}`);

        const embed = new EmbedBuilder()
          .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(message.content || '*[Sans texte]*')
          .setTimestamp(message.createdAt)
          .setColor(0x2B2D31);

        const imageAttachment = message.attachments.find(att =>
          att.contentType?.startsWith('image/')
        );
        if (imageAttachment) embed.setImage(imageAttachment.url);

        const files = [...message.attachments.values()];

        await owner.send({
          content: `📬 **Nouveau DM reçu**`,
          embeds: [embed],
          files,
        });

        console.log(`✅ DM de ${message.author.tag} transmis à ${owner.tag}`);
      } catch (err) {
        console.error('❌ Erreur lors du transfert du DM à l\'owner :', err);
      }

      return; // Ne pas continuer plus loin si c’est un DM
    }

    // ✅ REDIRECTION DE SUPPORT LINK
    const linkedChannelId = client.supportLinks?.get(message.channel.id);
    if (linkedChannelId) {
      const linkedChannel = client.channels.cache.get(linkedChannelId);
      if (linkedChannel) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(message.content || '*[Pièce jointe]*')
          .setTimestamp(message.createdAt)
          .setColor(0x5865F2);

        const imageAttachment = message.attachments.find(att =>
          att.contentType?.startsWith('image/')
        );
        if (imageAttachment) embed.setImage(imageAttachment.url);

        linkedChannel
          .send({
            embeds: [embed],
            files: [...message.attachments.values()],
          })
          .catch(console.error);
      }
    }

    // ✅ IGNORER les réponses au bot
    if (message.type === 19 && message.reference) {
      try {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        if (repliedMessage.author.id === client.user.id) return;
      } catch (err) {
        // Ignorer
      }
    }

    // ✅ SI LE BOT EST MENTIONNÉ
    if (message.mentions.users.has(client.user.id)) {
      let languages = {};
      try {
        languages = JSON.parse(fs.readFileSync('./languages.json', 'utf8'));
      } catch (e) {
        console.error('Erreur lors de la lecture de languages.json :', e);
      }

      const lang = (message.guildId && languages[message.guildId]) ? languages[message.guildId] : 'en';
      const messages = client.locales[lang] || client.locales['en'];

      const latency = Math.round(client.ws.ping);
      const uptimeMs = Date.now() - client.launchTime;
      const uptime = formatDuration(uptimeMs);
      const developer = 'Fuzoxx';
      const version = 'V4.1.2';
      const languageDisplay = getLanguageDisplay(lang);

      const embed = new EmbedBuilder()
        .setTitle(messages.bot_title || '🤖 Bot Information')
        .addFields(
          { name: messages.bot_latency || '📡 Latency', value: `${latency} ms`, inline: true },
          { name: messages.bot_uptime || '⏱️ Uptime', value: uptime, inline: true },
          { name: messages.bot_developer || '👨‍💻 Developer', value: developer, inline: false },
          { name: messages.bot_language || '🌍 Current Language', value: languageDisplay, inline: false },
          { name: messages.bot_version || '🧪 Version', value: version, inline: true }
        )
        .setFooter({ text: messages.bot_footer || 'Thanks for pinging me!' })
        .setColor(0x5865F2);

      try {
        await message.channel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'embed:', error);
      }
    }
  }
};

// 🔧 UTILS
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}j ${hours}h ${minutes}m ${seconds}s`;
}

function getLanguageDisplay(lang) {
  switch (lang) {
    case 'fr': return 'Français 🇫🇷';
    case 'en': return 'English 🇬🇧';
    case 'esp': return 'Español 🇪🇸';
    case 'de': return 'Deutsch 🇩🇪';
    case 'it': return 'Italiano 🇮🇹';
    default: return 'Unknown 🌐';
  }
}
