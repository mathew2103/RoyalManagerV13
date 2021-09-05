/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

const warnSchema = require('schemas/warn-schema.js');
const config = require('config')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal an ad warning.')
        .addStringOption((op) => op.setName('punishment_id').setDescription('The ID of the punishment that you want to appeal.').setRequired(true))
        .addStringOption((op) => op.setName('reason').setDescription('The reason for which you want to appeal this warning.')),
    async execute(interaction) {

        const punishmentId = interaction.options.getString('punishment_id');
        const appealReason = interaction.options.getString('reason');


        const warningData = await warnSchema.findOne({ userId: interaction.user.id })

        const warning = warningData.find(e => e.punishmentId == punishmentId)
        if (!warning) return interaction.reply({ content: 'No such warning found.', ephemeral: true })


        const channel = interaction.channel.type !== 'dm' ? await interaction.user.createDM() : interaction.channel;
        if (interaction.channel.type !== 'dm') interaction.message.react('📫')
        channel.send('Send your advertisement for the appeal.')

        interaction.reply('Next, Please send your ad ( the one that you got warned for )') //PLEASE IMPROVE THIS, This is literally rly bad :(


        const filter = m => m.author.id == interaction.user.id;

        const collector = channel.createMessageCollector({ filter, time: 120000, max: 1 })



        collector.on('collect', async interaction => {
            const appealsChannel = interaction.client.channels.cache.get(config.appealsChannel)


            const embed = new Discord.MessageEmbed()
                .setAuthor('Appeals')
                .addFields({
                    name: 'User',
                    value: `${interaction.user.tag}\n\`${interaction.user.id}\``,
                    inline: true
                }, {
                    name: 'Moderator',
                    value: `<@${warning.author.id}>\n\`${warning.author.id}\``,
                    inline: true
                }, {
                    name: 'Reason',
                    value: warning.reason,
                    inline: true
                }, {
                    name: 'Appeal-Reason',
                    value: appealReason,
                }, {
                    name: 'Advertisement',
                    value: interaction.content
                })
                .setColor("RANDOM")

                .setTimestamp()

            const webhooks = await appealsChannel.fetchWebhooks()
            const webhook = webhooks.first()
            webhook.send({ embeds: [embed], username: interaction.user.username, avatarURL: interaction.user.displayAvatarURL() })

            interaction.followUp('Appeal Submitted, Please wait for us to review your appeal')
        })
    }
}//test