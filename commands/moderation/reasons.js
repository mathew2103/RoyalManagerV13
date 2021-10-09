/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const settingsSchema = require('../../schemas/settings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reasons')
        .setDescription('Shows the reasons available for ad moderations.')
        .addStringOption((op) => op.setName('query').setDescription('Ad moderation reason')),
    roles: ['Mod'],
    async execute(client, interaction) {
        const reasonSearch = interaction.options.getString('query')
        let data = await settingsSchema.findOne({ guildId: interaction.guild.id })

        if (!reasonSearch) {
            const embed = new Discord.MessageEmbed()
                .setAuthor(`Ad reasons for ${interaction.guild.name}`)
                .setColor("RANDOM")
            try {
                const data = await settingsSchema.findOne({ guildId: interaction.guild.id })
                embed.setDescription(data.reasons.length ? data.reasons : "No reasons set.")
            } catch (e) { }

            return interaction.reply({embeds: [embed]})
        }


        const reason = data.reasons.find(e => e.toLowerCase().includes(args[0].toLowerCase()))
        if (!reason) return interaction.reply(`No reason found.`)
        const embed = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setDescription(`Reason found using the key -- \`${args[0]}\`\n\n\`${reason}\``)
            .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL())
        interaction.reply({content: [embed]})
    },
};