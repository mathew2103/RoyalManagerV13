/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const uniqid = require('uniqid')
const ms = require('ms')
const autoads = require('../schemas/autoAd-schema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoad')
        .setDescription('Add or remove an auto ad.')
        .addSubcommand(subCommand => subCommand
            .setName('show')
            .setDescription('Shows the autoad menu')
            .addChannelOption(op => op.setName('channel').setDescription('Only autoads of this channel will be shown')))
        .addSubcommand(subCommand => subCommand
            .setName('add')
            .setDescription('Add an autoad')
            .addChannelOption(op => op.setName('duration').setDescription('The duration for which the autoad be posted.').setRequired(true))
            .addChannelOption(op => op.setName('channel').setDescription('The channel in which this autoad should be').setRequired(true))),
    global: false,
    guilds: ['825958701487620107'],
    async execute(interaction) {


        const rdata = await autoads.find({ interval: 4 });
        if (!rdata) return interaction.reply(`No data found...`)

        if (interaction.options.getSubcommand() == 'show') {

            const data2 = rdata[0].ads;
            if (!data2) return interaction.reply(`No data found..`)

            const channel = interaction.options.getChannel('channel')
            let data = data2
            if (channel) data = data2.filter(e => e.channel === channel.id)

            if (!data || data.length < 1) return interaction.reply(`No data found.`)
            let page = 1;
            const embed = new Discord.MessageEmbed()
                .setAuthor(`Auto Advertisement Menu`)
                .setColor(`RANDOM`)
                .setFooter(`Page: ${page}/${data.length}`)
            embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`)

            const createButton = (ID, Emoji, Label, Style) => {
                const createdButton = new Discord.MessageButton()
                    .setCustomId(ID)
                    .setEmoji(Emoji)
                    .setStyle(Style)

                Label ? createdButton.setLabel(Label) : null;
                return createdButton
            }
            const firstPageButton = createButton('firstPage', '⏪', null, 'PRIMARY'),
                previousPageButton = createButton('previousPage', '◀', null, 'PRIMARY'),
                nextPageButton = createButton('nextPage', '▶', null, 'PRIMARY'),
                lastPageButton = createButton('lastPage', '⏩', null, 'PRIMARY'),
                destroyButton = createButton('stop', '❌', null, 'SUCCESS'),
                deleteButton = createButton('deleteButton', '❌', 'Delete', 'PRIMARY')

            const allActionRow = new Discord.MessageActionRow()
                .addComponents([firstPageButton, previousPageButton, destroyButton, nextPageButton, lastPageButton])

            const secondActionRow = new Discord.MessageActionRow()
                .addComponents([deleteButton])

            const first2Off = new Discord.MessageActionRow()
                .addComponents([firstPageButton.setDisabled(true), previousPageButton.setDisabled(true), destroyButton, nextPageButton.setDisabled(false), lastPageButton.setDisabled(false)])

            const last2Off = new Discord.MessageActionRow()
                .addComponents([firstPageButton.setDisabled(false), previousPageButton.setDisabled(false), destroyButton, nextPageButton.setDisabled(true), lastPageButton.setDisabled(true)])


            await interaction.reply({ embeds: [embed], components: [first2Off, secondActionRow], fetchReply: true })

            // (data.length > 1) ?  : await interaction.reply({ embeds: [embed], fetchReply: true })
            if (data.length == 1) return;
            const sent = await interaction.fetchReply()

            const filter = i => i.user.id == interaction.user.id;

            const collector = sent.createMessageComponentCollector({ filter, time: 5 * 60 * 1000 })


            collector.on('collect', async i => {
                // await i.deferReply();
                switch (i.customId) {
                    case 'firstPage':

                        if (page === 1) return;
                        page = 1
                        embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
                        await i.update({ embeds: [embed], components: [first2Off, secondActionRow] })
                        break;

                    case 'previousPage':

                        if (page === 1) return;//copypasta.
                        page--;

                        embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
                        if (page === 1) await interaction.update({ embeds: [embed], components: [first2Off, secondActionRow] });
                        else await i.update({ embeds: [embed], components: [allActionRow, secondActionRow] });
                        break;

                    case 'nextPage':

                        if (page === data.length) return;//copypasta.

                        page++;
                        embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)

                        if (page === data.length) await interaction.update({ embeds: [embed], components: [last2Off, secondActionRow] });
                        else await i.update({ embeds: [embed], components: [allActionRow, secondActionRow] })
                        break;

                    case 'stop':

                        collector.stop();
                        await i.update({ embeds: [embed], components: [] })
                        break;

                    case 'lastPage':

                        if (page === data.length) return;
                        page = data.length
                        embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
                        await i.update({ embeds: [embed], components: [last2Off, secondActionRow] })
                        break;

                    case 'deleteButton':
                        const adToDelete = data[page - 1];
                        data = data.filter(e => e.ad !== adToDelete.ad);
                        page = 1;
                        embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
                        await i.update({ embeds: [embed], components: [first2Off, secondActionRow] })

                        try {
                            await autoads.findOneAndUpdate({ interval: 4 }, {
                                interval: 4,
                                $pull: {
                                    ads: adToDelete
                                }
                            }, { upsert: true })
                            await i.followUp({ content: 'Removed the autoad.', ephemeral: true })
                            // await msg.delete()
                            // await sent.delete()
                        } catch (e) {
                            console.error(e)
                            return await i.followUp({ content: 'Couldnt remove the ad', ephemeral: true })
                        }
                        break;
                }
            })

            collector.on('end', async i => {

            })
        } else {

        }
        /*
        
                if (trigger.toLowerCase() !== 'add' && trigger.toLowerCase() !== 'remove') return msg.reply(`You have to provide add or remove instead of \`${args[1]}\`.`)
                if (trigger.toLowerCase() === 'add') {
                    const timeToDeleteIn = timeArg ? ms(timeArg) : null
                    if (!timeToDeleteIn) return msg.reply(`You need to provide a duration in which the autoad will be deleted in.`)
                    // if (!args[2]) return msg.reply(`You have to provide an advertisement to add.`)
                    const ad = args.splice(3).join(' ')
                    if (!ad) return msg.reply(`You have to provide an advertisement.`)
                    try {
                        await autoads.findOneAndUpdate({ interval: 4 }, {
                            interval: 4,
                            $push: {
                                ads: {
                                    ad,
                                    channel: channel.id,
                                    expires: Date.now() + timeToDeleteIn
                                }
                            }
                        }, { upsert: true })
                    } catch (e) {
                        return interaction.reply(`Couldn't add the autoad.`)
                    }
                    const sent = await interaction.reply({ content: 'Added the auto ad. (I will delete the ad and this msg in 5 seconds.)', fetchReply: true })
                    setTimeout(async () => {
                        await sent.deleteReply()
                        await interaction.delete()
                    }, 5 * 1000);
                } else if (trigger.toLowerCase() === 'remove') {
                    if (!args[2]) return interaction.reply(`You have to proide an ad id to remove.`)
                    if (isNaN(args[2])) return interaction.reply(`You have to proide an ad id to remove.`)
        
                    if (args[2] < 1 || args[2] > data.length) return interaction.reply(`The max number of pages is \`${data.length}\``)
        
                    const ad = data[args[2] - 1]
                    try {
                        await autoads.findOneAndUpdate({ interval: 4 }, {
                            interval: 4,
                            $pull: {
                                ads: ad
                            }
                        })
                        interaction.reply(`Removed the auto ad.`)
                    } catch (e) {
                        return interaction.reply(`Couldnt remove the ad`)
                    }
                }
        
                */

    },
};
