/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const uniqid = require('uniqid')
const ms = require('ms')
const autoads = require('../schemas/auto-ad-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoad')
        .setDescription('Add or remove an auto ad.')
        .addChannelOption((op) => op.setName('channel').setDescription('Channel for Advertisement').setRequired(true))
        .addStringOption((op) => op.setName('option').setDescription('Add/Remove').addChoice('Add', 'add').addChoice('Remove', 'remove').setRequired(true)),
    async execute(client, interaction) {
        const trigger = interaction.options.getString('option')
        const [channelID, timeArg] = args
        const rdata = await autoads.find({ interval: 4 });
        if (!rdata) return interaction.reply(`No data found...`)

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
                .setID(ID)
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
            deleteButton = createButton('delete', '❌', 'Delete', 'PRIMARY')

        const allActionRow = new Discord.MessageActionRow()
            .addComponentss([firstPageButton, previousPageButton, destroyButton, nextPageButton, lastPageButton])

        const secondActionRow = new Discord.MessageActionRow()
            .addComponents(deleteButton)

        const first2Off = new Discord.MessageActionRow()
            .addComponents([firstPageButton.setDisabled(true), previousPageButton.setDisabled(true), destroyButton, nextPageButton.setDisabled(false), lastPageButton.setDisabled(false)])

        const last2Off = new Discord.MessageActionRow()
            .addComponents([firstPageButton.setDisabled(false), previousPageButton.setDisabled(false), destroyButton, nextPageButton.setDisabled(true), lastPageButton.setDisabled(true)])


        const sent = (data.length > 1) ? await interaction.reply({ embeds: [embed], components: [first2Off, secondActionRow] }) : await interaction.reply({ embeds: [embed] })
        if (data.length == 1) return;
        //join: https://discord.gg/8wsyrNR3
        //nice music ^ sus but ok / oh lofi ? YUS
        const filter = b => true;

        const collector = sent.createMessageCollector({ filter, time: 5 * 60 * 1000 })

        collector.on('collect', async i => {
            switch (i.customId) {
                case 'firstPage':
                    if (page == 1) return;
                    page = 1
                    embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
                    await sent.edit({ embeds: [embed], components: [first2Off, secondActionRow] })
                    break;
        
                case 'previousPage':


                    break;

                case 'nextPage':

                    break;

                case 'stop':

                    break;

                case 'lastPage':

                    break;

                case 'deleteButton':
                    
                    break;
            }
        })

        collector.on('end', async i => {

        })

        // const firstPagefilter = (button) => button.clicker.user.id === msg.author.id && button.id == 'firstPage'
        // const previousPagefilter = (button) => button.clicker.user.id === msg.author.id && button.id == 'previousPage';
        // const nextPagefilter = (button) => button.clicker.user.id === msg.author.id && button.id == 'nextPage';
        // const lastPagefilter = (button) => button.clicker.user.id === msg.author.id && button.id == 'lastPage';
        // const destroyfilter = (button) => button.clicker.user.id === msg.author.id && button.id == 'destroy';
        // const deleteFilter = (button) => button.clicker.user.id == msg.author.id && button.id == 'delete';

        // const firstPageCollector = sent.createButtonCollector(firstPagefilter, { time: 1000 * 60 * 5 }),
        //     previousPageCollector = sent.createButtonCollector(previousPagefilter, { time: 1000 * 60 * 5 }),
        //     nextPageCollector = sent.createButtonCollector(nextPagefilter, { time: 1000 * 60 * 5 }),
        //     lastPageCollector = sent.createButtonCollector(lastPagefilter, { time: 1000 * 60 * 5 }),
        //     destroyCollector = sent.createButtonCollector(destroyfilter, { time: 1000 * 60 * 5 }),
        //     deleteCollector = sent.createButtonCollector(deleteFilter, { time: 1000 * 60 * 5 })

        // firstPageCollector.on('collect', async b => {
        //     await b.reply.defer()
        //     if (page == 1) return;
        //     page = 1
        //     embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
        //     await sent.edit({ embed: embed, components: [first2Off, secondActionRow] })
        // })

        // previousPageCollector.on('collect', async b => {
        //     await b.reply.defer()
        //     if (page == 1) return;
        //     page--
        //     embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
        //     if (page == 1) await sent.edit({ embed: embed, components: [first2Off, secondActionRow] });
        //     else await sent.edit({ embed: embed, components: [allActionRow, secondActionRow] });
        // })

        // nextPageCollector.on('collect', async b => {
        //     await b.reply.defer()
        //     if (page == data.length) return;
        //     page++
        //     embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)

        //     if (page == data.length) await sent.edit({ embed: embed, components: [last2Off, secondActionRow] });
        //     else await sent.edit({ embed: embed, components: [allActionRow, secondActionRow] });

        // })

        // lastPageCollector.on('collect', async b => {
        //     await b.reply.defer()
        //     if (page == data.length) return;
        //     page = data.length
        //     embed.setDescription(`${data[page - 1].ad}\nID: \`${page}\`\nChannel: <#${data[page - 1].channel}>`).setFooter(`Page: ${page}/${data.length}`)
        //     await sent.edit({ embed: embed, components: [last2Off, secondActionRow] })
        // })

        // destroyCollector.on('collect', async b => {
        //     await b.reply.defer()
        //     await msg.delete()
        //     await sent.delete()
        //     firstPageCollector.stop()
        //     lastPageCollector.stop()
        //     nextPageCollector.stop()
        //     lastPageCollector.stop()
        //     destroyCollector.stop()
        //     deleteCollector.stop()
        // })

        // deleteCollector.on('collect', async b => {
        //     await b.reply.think(true)
        //     const adToDelete = data[page - 1]

        //     try {
        //         await autoads.findOneAndUpdate({ interval: 4 }, {
        //             interval: 4,
        //             $pull: {
        //                 ads: adToDelete
        //             }
        //         })
        //         await b.reply.edit(`Removed the auto ad.`)
        //         await msg.delete()
        //         await sent.delete()
        //     } catch (e) {
        //         return await b.reply.edit(`Couldnt remove the ad`)
        //     }
        // })

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
    },
};