const { SlashCommandBuilder } = require('discord.js');

const responses = {
  en: [
    "It is certain.",
    "Without a doubt.",
    "You may rely on it.",
    "Ask again later.",
    "Cannot predict now.",
    "Don't count on it.",
    "My reply is no.",
    "Very doubtful."
  ],
  fr: [
    "C'est certain.",
    "Sans aucun doute.",
    "Tu peux compter dessus.",
    "Demande plus tard.",
    "Impossible de prédire maintenant.",
    "N'y compte pas.",
    "Ma réponse est non.",
    "Très douteux."
  ],
  it: [
    "È certo.",
    "Senza dubbio.",
    "Puoi contarci.",
    "Riprova più tardi.",
    "Impossibile da prevedere ora.",
    "Non farci affidamento.",
    "La mia risposta è no.",
    "Molto improbabile."
  ],
  de: [
    "Es ist sicher.",
    "Zweifellos.",
    "Du kannst dich darauf verlassen.",
    "Frag später noch einmal.",
    "Kann jetzt nicht vorhergesagt werden.",
    "Verlass dich nicht darauf.",
    "Meine Antwort ist nein.",
    "Sehr unwahrscheinlich."
  ],
  esp: [
    "Es cierto.",
    "Sin duda.",
    "Puedes confiar en ello.",
    "Pregunta de nuevo más tarde.",
    "No se puede predecir ahora.",
    "No cuentes con ello.",
    "Mi respuesta es no.",
    "Muy dudoso."
  ],
  ar: [
    "هذا مؤكد.",
    "بلا أدنى شك.",
    "يمكنك الاعتماد عليه.",
    "اسأل لاحقًا.",
    "لا يمكن التنبؤ الآن.",
    "لا تعتمد عليه.",
    "إجابتي لا.",
    "مشكوك فيه جدًا."
  ]
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball a question')
    .addStringOption(option => 
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)),
  
  async execute(interaction, lang) {
    const messages = interaction.client.locales[lang];
    const question = interaction.options.getString('question');

    const answerList = responses[lang] || responses.en;
    const answer = answerList[Math.floor(Math.random() * answerList.length)];

    await interaction.reply(`${messages.magic8ball_question}: **${question}**\n🎱 ${answer}`);
  }
};
