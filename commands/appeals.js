/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

// import warnSchema from '@/schemas/warn-schema';
// const warnSchema = require('../schemas/warn-schema');
const punishmentsSchema = require('../schemas/punishments-schema');
const config = require('../config.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal an ad warning.')
        .addStringOption((op) => op.setName('punishment_id').setDescription('The ID of the punishment that you want to appeal.').setRequired(true))
        .addStringOption((op) => op.setName('reason').setDescription('The reason for which you want to appeal this warning.').setRequired(true)),
    global: true,
    async execute(interaction) {

        const punishmentId = interaction.options.getString('punishment_id');
        const appealReason = interaction.options.getString('reason');

        const warning = await punishmentsSchema.findOne({ punishmentId, user: interaction.user.id })
        console.log(warning)
        if (!warning) return interaction.reply({ content: 'No such warning found.', ephemeral: true })
        if (warning.appealed) return interaction.reply({ content: 'You have already appealed this punishment.', ephemeral: true })

        const dmChannel = interaction.channel.type !== 'dm' ? await interaction.user.createDM() : interaction.channel;
        if (interaction.channel.type !== 'dm') interaction.reply('Check dms.')
        dmChannel.send('Send your advertisement for the appeal.')


        const filter = m => m.author.id == interaction.user.id;

        const collector = dmChannel.createMessageCollector({ filter, time: 120000 })

        const yesButton = new Discord.MessageButton()
            .setLabel('Accept')
            .setStyle('SUCCESS')
            .setCustomId(`appeal_accept_${warning.punishmentId}`)
        const noButton = new Discord.MessageButton()
            .setLabel('Deny')
            .setStyle('DANGER')
            .setCustomId(`appeal_deny_${warning.punishmentId}`)
        const row = new Discord.MessageActionRow()
            .addComponents([yesButton, noButton])


        collector.on('collect', async msg => {
            collector.stop();

            const appealsChannel = interaction.client.channels.cache.get(config.appealsChannel) || interaction.channel

            const embed = new Discord.MessageEmbed()
                .setAuthor('Appeals')
                .addFields({
                    name: 'User',
                    value: `${msg.author.tag}\n\`${msg.author.id}\``,
                    inline: true
                }, {
                    name: 'Moderator',
                    value: `<@${warning.author}>\n\`${warning.author}\``,
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
                    value: msg.content
                })
                .setColor("RANDOM")
                .setFooter(`Punishment ID: ${warning.punishmentId}`)
                .setTimestamp()

            await punishmentsSchema.findOneAndUpdate({ user: interaction.user.id, punishmentId }, { appealed: true })
            const webhooks = await appealsChannel.fetchWebhooks()
            let webhook = webhooks.first()
            if (!webhook) {
                webhook = await appealsChannel.createWebhook(msg.guild.name, {
                    avatar: msg.guild.iconURL()
                })
            }


            webhook.send({ embeds: [embed], username: interaction.user.username, avatarURL: interaction.user.displayAvatarURL(), components: [row] })
            dmChannel.send('Your appeal has been submitted. Please wait for us to review your appeal.')

            // interaction.followUp('Appeal Submitted, Please wait for us to review your appeal')
        })
    }
}//test