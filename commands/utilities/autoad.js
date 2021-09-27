/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction } = require('discord.js')
const Discord = require('discord.js')
const uniqid = require('uniqid')
const ms = require('ms')
const autoads = require('../../schemas/autoAd-schema');
const utils = require('../../structures/utils');
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
            .addStringOption(op => op.setName('duration').setDescription('The duration for which the autoad be posted.').setRequired(true))
            .addChannelOption(op => op.setName('channel').setDescription('The channel in which this autoad should be').setRequired(true))),
    global: false,
    guilds: ['825958701487620107'],
    async execute(interaction) {

        const rdata = await autoads.find({ interval: 4 });
        if (!rdata) return interaction.reply(`No data found...`)
        const channel = interaction.options.getChannel('channel')

        if (interaction.options.getSubcommand() == 'show') {

            let data = rdata[0].ads;
            if (!data) return interaction.reply(`No data found..`)

            if (channel) data = data.filter(e => e.channel === channel.id)

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
            let duration = interaction.options.getString('duration')
            duration = ms(duration)
            const ad = await utils.getMessage(interaction, 'Please send the advertisemnet');
            if(!ad?.content)return;

            await autoads.findOneAndUpdate({ interval: 4 }, {
                interval: 4,
                $push: {
                    ads: {
                        ad: ad.content,
                        channel: channel.id,
                        expires: Date.now() + duration
                    }
                }
            }, { upsert: true })

            
            await interaction.editReply('Added the autoad')

        }

    },
};
