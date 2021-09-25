const { SlashCommandBuilder } = require("@discordjs/builders");
const warnCountSchema = require('../schemas/warnCount-schema');
const Discord = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('clearstats')
    .setDescription('Clear\'s counts of a staff team')
    .addStringOption(op => op.setName('team').setDescription('The team of which you want to reset the stats').setRequired(true).addChoice('moderators', 'mod')),
    global: false,
    guilds: '825958701487620107',
    async execute(interaction){
        const data = await warnCountSchema.find({ })

        const acceptButton = new Discord.MessageButton()
        .setLabel('Accept')
        .setStyle('SUCCESS')
        .setCustomId('yes')

        const denyButton = new Discord.MessageButton()
        .setLabel('Deny')
        .setStyle('DANGER')
        .setCustomId('no')

        const embed = new Discord.MessageEmbed()
        .setAuthor(`Royal Moderation Warn Count Reset`)
        .setDescription('You are about to clear the warning count for all moderators! __This can\'t be undone.__\n*Press a button below to continue.*')
        .setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
        .setColor("YELLOW")

        const sent = await interaction.reply({ embeds: [embed], components: [new Discord.MessageActionRow().addComponents([ acceptButton, denyButton ])], fetchReply: true})
        const filter = i => i.user.id == interaction.user.id;
        let trigger = await sent.awaitMessageComponent({ filter, time: 2*60*1000 })
        console.log(trigger)

    }
}