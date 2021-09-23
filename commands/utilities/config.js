/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const settingsSchema = require('../../schemas/settings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configuration for the server.')
        .addStringOption((op) => op.setName('query').setDescription('Config Settings').addChoice('Reason', 'reason').addChoice('Add', 'add').addChoice('Remove', 'remove').addChoice('Message', 'message').addChoice('Logs', 'logs'))
        .addChannelOption((op) => op.setName('logschannel').setDescription('Pick this if you choose logs in query')),
    async execute(client, interaction) {
        const guildId = interaction.guild.id
        // const options = ['reason', 'message', 'logs']
        // if(!options.includes(args[0].toLowerCase()))return interaction.reply(`Your options are \`${options}\`.`)

        const query = interaction.options.getString('query')
        const logsChannel = interaction.options.getString('logschannel')


        switch (query) {
            case 'reason':
                const embed1 = new Discord.MessageEmbed()
                    .setAuthor(`Ad reasons for ${interaction.guild.name}`)
                    .setColor("RANDOM")
                try {
                    const data = await settingsSchema.findOne({ guildId })
                    embed1.setDescription(data.reasons.length > 0 ? data.reasons : "No reasons set.")
                } catch (e) { }

                if (!query) return interaction.reply({ embeds: [embed1] })

                switch (query.toLowerCase()) {
                    case 'add':
                        const reason1 = args.splice(2).join(' ')
                        if (!reason1) return interaction.reply('Provide a reason to add.')
                        try {
                            await settingsSchema.findOneAndUpdate({
                                guildId
                            }, {
                                guildId,
                                $push: {
                                    reasons: reason1
                                }
                            })
                        } catch (e) { return interaction.reply(`Couldnt add the reason.`) }

                        interaction.reply(`Added \`${reason1}\` to ad moderation reasons.`)
                        break;

                    case 'remove':
                        const reason2 = args.splice(2).join(' ')
                        if (!reason2) return interaction.reply('Provide a reason to remove.')

                        try {
                            const data = await settingsSchema.findOne({ guildId })
                            const r = await data.reasons.find(e => e.toLowerCase().includes(reason2))
                            if (!r) return interaction.reply(`No reason found.`)


                            await settingsSchema.findOneAndUpdate({
                                guildId
                            }, {
                                guildId,
                                $pull: {
                                    reasons: r
                                }
                            })
                            interaction.reply(`Removed \`${r}\` from ad moderation reasons.`)
                        } catch (e) { return interaction.reply(`Something went wrong..`) }
                        break;
                    default: interaction.reply(embed1)
                }
                break;
            case 'message':
                try {
                    result = await settingsSchema.findOne({ guildId })
                } catch (e) { }
                const newmsg = args.splice(1).join(" ")
                if (!newmsg) return interaction.reply(`Current moderation message is \`${result.modMsg}\``)
                const required = ['{member}', '{reason}', '{wc}']

                try {
                    await settingsSchema.findOneAndUpdate({
                        guildId,
                    }, {
                        guildId,
                        modMsg: newmsg
                    }, { upsert: true })
                } catch (e) { return interaction.reply(`Couldn't update the message.`) }

                interaction.reply(`Set the ad moderation message to \`${newmsg}\`.\nPlease make sure the following elements are included in the message: ${required}`)
                break;
            case 'logs':
                const newchannel = logsChannel
                if (!newchannel) return interaction.reply(`Current logs channel: <#${logID}> \`${logID}\``)

                try {
                    await settingsSchema.findOneAndUpdate({
                        guildId
                    }, {
                        guildId,
                        logs: newchannel.id
                    }, { upsert: true })
                } catch (e) {
                    return console.log(e)
                }
                interaction.reply(`Set the new logging channel to ${newchannel}`)
                break;
            default:
                const allsettings = await settingsSchema.findOne({ guildId });

                const setEmbed = new Discord.MessageEmbed()
                    .setAuthor(`All Settings for ${interaction.guild.name}`)
                    .addField(`Moderation Message`, allsettings.modMsg ? allsettings.modMsg : 'None', true)
                    .addField(`Logging Channel`, allsettings.logs ? `<#${allsettings.logs}>` : 'None', true)
                    .addField('AD Moderation Reasons', allsettings.reasons.map(e => `\`${e}\``).join('\n'))
                interaction.reply({embeds: [setEmbed]})
        }
    },
};