/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const config = require('../../config.json')
const punishmentSchema = require('../../schemas/punishments-schema');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('Shows information about an ad warning.')
    .addStringOption((op) => op.setName('punishment_id').setDescription('ID of the punishment you want to check.').setRequired(true))
    .addBooleanOption((op => op.setName('ephemeral').setDescription('Should the reply be shown only to you?'))),
    global: false,
	guilds: ['825958701487620107', config.mainServer.id],
    roles: ['Mod'],
    async execute(interaction) {
        const punishmentId = interaction.options.getString('punishment_id');
        const ephemeral = interaction.options.getBoolean('ephemeral');
        await interaction.deferReply();
        const showMod = interaction.member.permissions.has("MANAGE_MESSAGES") ? true : false

        const warn = await punishmentSchema.findOne({ punishmentId })
        if(!warn)return interaction.followUp({content: 'No warn found with ID:' + punishmentId, ephemeral: true});
        // const guildId = process.env.MAIN_GUILD ?? interaction.guild.id
        // let arr = await warnSchema.find({
        //     guildId
        // })
        // if (!Array.isArray(arr)) arr = [arr]

        // const warningarr = arr.find(e => e.warnings.find(w => w.punishmentId == punishmentId))
        // if (!warningarr) return interaction.editReply(`No such warn found..`);
        // const warn = warningarr.warnings.find(e => e.punishmentId == punishmentId)
        // if (!warn) return interaction.editReply(`No such warn found...`);

        const embed = new Discord.MessageEmbed()
            .setAuthor(`Punishment Info`)
            .setColor("RANDOM")
            .addField('User', `<@${warn.user}>\n(\`${warn.user}\`)`, true)
            .addField('Moderator', `${showMod ? `<@${warn.author}>\n(\`${warn.author}\`)` : "Anonymous#0000"}`, true)
            .addField('Channel', `<#${warn.channel}>`, true)
            .addField('Issued at', `<t:${(warn.at / 1000).toString().split('.')[0]}>\n<t:${(warn.at / 1000).toString().split('.')[0]}:R>`, true)
        warn.belongsto ? embed.addField('Belongs to', `<#${warn.belongsto}>`, true) : null
        embed.addField('Appealed', (warn.appealed == true) ? 'Yes' : 'No', true)
        embed.addField('Reason', `${warn.reason}`)
        embed.setFooter(`Punishment ID: ${punishmentId}`)
        interaction.followUp({ embeds: [embed] })
    },
};