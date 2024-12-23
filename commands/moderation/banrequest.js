/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const config = require('../../config.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('banrequest')
        .setDescription('Request a ban to be executed by moderators+.')
        .addUserOption((op) => op.setName('member').setDescription('Member to request ban').setRequired(true))
        .addStringOption((op) => op.setName('reason').setDescription('Reason for ban request (NOT EVIDENCE)').setRequired(true)),
    guilds: [config.mainServer.id],
    roles: ['Trial Mod'],
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     * @returns 
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const member = interaction.options.getMember('member')

        if (member.roles.highest.position >= interaction.member.roles.highest.position) return interaction.editReply({ content: `You cannot request a ban for a user above you.`, ephemeral: true })
        let reason = interaction.options.getString('reason')

        const banreqchannel = await interaction.guild.channels.cache.get(config.banRequestChannel);
        if (!banreqchannel) return interaction.editReply({ content: 'No ban request channel found.', ephemeral: true })

        if (reason.toLowerCase() == '6aw') {
            reason = `Accumulating six total ad warnings`
        }
        const filter = m => m.author.id === interaction.user.id
        await interaction.editReply(`Please send the evidence for this ban. You may include a link or an attachment. Say \`cancel\` to cancel this.`)

        const response = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 2 * 60 * 1000,
            errors: ['time']
        })
        if (!response) return interaction.editReply('You didnt respond in time..');

        let evidence = response.first().attachments.first() ? response.first().attachments.first().url : response.first().content
        if (evidence && evidence.toLowerCase() === 'cancel') return interaction.editReply(`Cancelled.`)
        if (evidence.toLowerCase() === '6aw') {
            // const guildId = interaction.guild.id, userId = member.id
            const result = await warnSchema.findOne({
                // guildId,
                userId
            })
            if (!result) return interaction.editReply(`User doesnt has enough warnings.`)
            const sorted = result.warnings.sort((a, b) => b.at - a.at)

            evidence = sorted.map(e => `\`${e.punishmentId}\` - ${moment.utc(e.at).format("MMM Do YYYY, h:mm:ss a")}`).join('\n')
        }


        const embed = new Discord.MessageEmbed()
            .setTitle('New Ban Request')
            .setColor('YELLOW')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields({
                name: 'User',
                value: `${member}\n\`${member.id}\``,
                inline: true
            }, {
                name: 'Moderator',
                value: `${interaction.member}\n\`${interaction.member.id}\``,
                inline: true
            }, {
                name: 'Reason',
                value: reason,
                inline: true
            }, {
                name: 'Evidence',
                value: evidence
            })
            .setFooter(`Upon approving this ban request, the bot will ban the user so be careful | Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL())
        if (evidence.startsWith('http') && !evidence.includes(interaction.guild.id)) embed.setImage(evidence)

        const button1 = new Discord.MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Accept')
            .setCustomId(`banrequest_yes_${member.id}`)
            .setEmoji('<:RAS_passed:750328771810426980> '),
            button2 = new Discord.MessageButton()
                .setStyle('DANGER')
                .setLabel('Deny')
                .setCustomId(`banrequest_no_${member.id}`)
                .setEmoji('<:RAS_failed:750328723626000535> ')

        const row = new Discord.MessageActionRow()
            .addComponents(button1, button2)

        const webhooks = await banreqchannel.fetchWebhooks()
        let webhook = webhooks?.find(e => e.token)
        if (!webhook) {
            webhook = await banreqchannel.createWebhook('Ban Requests', {
                avatar: interaction.client.user.displayAvatarURL()
            })
        }

        await response.first().delete()
        // await banreqchannel.send('@here', { embeds: [embed], components: [row] })
        await webhook.send({ content: '@here', embeds: [embed], components: [row], avatar: interaction.user.displayAvatarURL(), username: interaction.member.displayName })
        await interaction.editReply(`Ban successfully requested.`)
    },
};