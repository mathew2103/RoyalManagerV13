/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const warnSchema = require('@schemas/warn-schema');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal an ad warning.')
        .addStringOption((op) => op.setName('punishment_id').setDescription('The ID of the punishment that you want to appeal.').setRequired(true))
        .addStringOption((op) => op.setName('reason').setDescription('The reason for which you want to appeal this warning.')),
    async execute(interaction) {

        const punishmentId = interaction.options.getString('punishment_id');
        const appealReason = interaction.options.getString('reason');

        const warningData = await warnSchema.findOne({userId: interaction.user.id}) //var is uh poisonous
        const warning = warningData.find(e => e.punishmentId == punishmentId)
        if(!warning)return interaction.reply({content: 'No such warning found.', ephemeral: true})

        const channel = interaction.channel.type !== 'dm' ? await interaction.user.createDM() : interaction.channel;

        const filter = m => m.author.id == interaction.user.id;

        const collector = interaction.channel.createMessageCollector({ filter, time: 120000, max: 1 })

        collector.on('collect', async msg => {
            const appealsChannel = interaction.client.channels.cache.get(process.env.APPEALS_CHANNEL)

            const embed = new Discord.MessageEmbed()
                .setAuthor('Appeals')
                .addFields({
                    name: 'Reason',
                    value: appealReason,
                }, {
                    name: 'Advertisement',
                    value: msg.content
                })
                .setColor("RANDOM")
                .setFooter('what this mate u configure')
        })
    },
};