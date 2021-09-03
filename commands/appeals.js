/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const warnSchema = require('@schemas/warn-schema');
const config = require('../config')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal an ad warning.')
        .addStringOption((op) => op.setName('punishment_id').setDescription('The ID of the punishment that you want to appeal.').setRequired(true))
        .addStringOption((op) => op.setName('reason').setDescription('The reason for which you want to appeal this warning.')),
    async execute(interaction) {

        const punishmentId = interaction.options.getString('punishment_id');
        const appealReason = interaction.options.getString('reason');

        const warningData = await warnSchema.findOne({userId: interaction.user.id})
        const warning = warningData.find(e => e.punishmentId == punishmentId)
        if(!warning)return interaction.reply({content: 'No such warning found.', ephemeral: true})

        const channel = interaction.channel.type !== 'dm' ? await interaction.user.createDM() : interaction.channel; //Not sure whats this, I'll leave it up to you ( idk how u plan to do dis )

        interaciton.reply('Next, Please send your ad ( the one that you got warned for )') //PLEASE IMPROVE THIS, This is literally rly bad :(

        const filter = m => m.author.id == interaction.user.id;

        const collector = interaction.channel.createMessageCollector({ filter, time: 120000, max: 1 })

        collector.on('collect', async interaction => {
            const appealsChannel = interaction.client.channels.cache.get(config.appealsChannel)

            const embed = new Discord.MessageEmbed()
                .setAuthor('Appeals')
                .addFields({
                    name: 'Reason',
                    value: appealReason,
                }, {
                    name: 'Advertisement',
                    value: interaction.content
                })
                .setColor("RANDOM")
                .setFooter(`Requested by ${interaction.user.username}`)

                appealsChannel.send({embeds: [embed]})
                interaction.followUp('Appeal Submitted, Please wait for us to review your appeal')
        })

        collector.on('end', async interaction => {
            interaction.reply('Times up, run the command again if you wanted to continue')
        })
    },
};