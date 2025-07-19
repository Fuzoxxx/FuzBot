const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("📨 Ouvre un support avec l'équipe du bot")
    .setDMPermission(false),

  async execute(interaction, lang) {
    const client = interaction.client;

    const supportGuild = client.guilds.cache.get(client.config.supportGuildId);
    const supportTeamRoleId = client.config.supportTeamRoleId;

    if (!supportGuild) {
      return interaction.reply({ content: lang.support?.errors?.config || "Erreur de configuration", ephemeral: true });
    }

    // Cherche ou crée la catégorie locale "Fuzbot | Support"
    let userCategory = interaction.guild.channels.cache.find(c => c.name === "Fuzbot | Support" && c.type === ChannelType.GuildCategory);
    if (!userCategory) {
      userCategory = await interaction.guild.channels.create({
        name: "Fuzbot | Support",
        type: ChannelType.GuildCategory,
      });
    }

    // Crée un salon texte support visible uniquement par l’utilisateur et le bot
    const userChannel = await interaction.guild.channels.create({
      name: `support-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      parent: userCategory.id,
      topic: `Support avec ${interaction.user.tag} (${interaction.user.id})`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ]
    });

    // Crée un salon support sur le serveur support pour l’équipe
    const supportCategory = client.config.supportCategoryId;
    const supportChannel = await supportGuild.channels.create({
      name: `support-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      parent: supportCategory,
      topic: `Support depuis ${interaction.guild.name} (${interaction.guild.id})`,
      permissionOverwrites: [
        { id: supportGuild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: supportTeamRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ]
    });

    // Lie les deux salons dans la Map client.supportLinks (pour gestion future)
    client.supportLinks.set(userChannel.id, supportChannel.id);
    client.supportLinks.set(supportChannel.id, userChannel.id);

    // Sauvegarde dans le fichier JSON
    client.saveSupportLinks();

    // Envoie un message dans les deux salons
    await userChannel.send({ content: lang.support?.createdUser || "Ton salon support est prêt !" });
    await supportChannel.send({ content: (lang.support?.createdStaff || "Nouveau support ouvert par {user}").replace("{user}", interaction.user.tag) });

    // Répond à l’utilisateur que c’est ok
    await interaction.reply({ content: (lang.support?.success || "Support ouvert : {channel}").replace("{channel}", userChannel.toString()), ephemeral: true });
  }
};
