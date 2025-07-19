const { SlashCommandBuilder } = require('discord.js');

const jokes = {
  en: [
    "Why don't scientists trust atoms? Because they make up everything!",
    "I told my computer I needed a break, and it said 'No problem — I'll go to sleep.'",
    "Why did the scarecrow win an award? Because he was outstanding in his field."
  ],
  fr: [
    "Pourquoi les scientifiques ne font-ils pas confiance aux atomes ? Parce qu'ils constituent tout !",
    "J'ai dit à mon ordinateur que j'avais besoin d'une pause, il m'a répondu 'Pas de problème, je vais dormir.'",
    "Pourquoi l'épouvantail a-t-il gagné un prix ? Parce qu'il était excellent dans son domaine."
  ],
  it: [
  "Perché gli scienziati non si fidano degli atomi? Perché compongono tutto!",
  "Ho detto al mio computer che avevo bisogno di una pausa, e lui: 'Nessun problema — vado in standby.'",
  "Perché lo spaventapasseri ha vinto un premio? Perché era eccezionale nel suo campo."
  ],
  de: [
  "Warum trauen Wissenschaftler Atomen nicht? Weil sie alles ausmachen!",
  "Ich sagte meinem Computer, ich brauche eine Pause, und er sagte: 'Kein Problem — ich gehe schlafen.'",
  "Warum hat die Vogelscheuche einen Preis gewonnen? Weil sie auf ihrem Feld herausragend war."
  ],
  esp: [
  "¿Por qué los científicos no confían en los átomos? ¡Porque lo componen todo!",
  "Le dije a mi computadora que necesitaba un descanso, y me dijo: 'No hay problema — me voy a dormir.'",
  "¿Por qué ganó un premio el espantapájaros? Porque se destacó en su campo."
],
ar: [
  "لماذا لا يثق العلماء في الذرات؟ لأنها تكون كل شيء!",
  "قلت لجهازي الكمبيوتر أنني بحاجة إلى استراحة، فأجابني 'لا مشكلة، سأذهب للنوم.'",
  "لماذا حصل الفزاعة على جائزة؟ لأنه كان ممتازًا في مجاله."
]
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tell a random joke'),

  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    const jokeList = jokes[lang] || jokes.en;
    const joke = jokeList[Math.floor(Math.random() * jokeList.length)];
    await interaction.reply(`😂 ${joke}`);
  }
};
