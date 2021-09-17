/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banrequest')
        .setDescription('Request a ban to be executed by moderators+.')
        .addUserOption((op) => op.setName('member').setDescription('Member to request ban').setRequired(true))
        .addStringOption((op) => op.setName('reason').setDescription('Reason for ban request').addChoice('6 Ad warnings', '6aw').setRequired(true)),
    async execute(client, interaction) {
        const member = interaction.options.getMember('member')

        if (member.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply(`You cannot request a ban for a user above you.`)
        let reason = interaction.options.getString('reason')

        if (reason.includes('-')) return interaction.reply(`Dont use \`-\` in the reason.`)

        const banreqchannel = await interaction.guild.channels.cache.get(config.banRequestChannel);
        if (!banreqchannel) return interaction.reply({ content: 'No ban request channel found.', ephemeral: true })

        if (reason.toLowerCase() == '6aw') {
            reason = `Accumulating six total ad warnings`
        }
        const filter = m => m.author.id === interaction.user.id
        await interaction.reply(`Please send the evidence for this ban. You may include a link or an attachment. Say \`cancel\` to cancel this.`)

        const response = await interaction.channel.awaitMessages(filter, {
            max: 1,
            time: 60 * 1000,
            errors: ['time']
        })

        let evidence = response.first().attachments.first() ? response.first().attachments.first().url : response.first().content
        if (evidence.toLowerCase() === '6aw') {
            // const guildId = interaction.guild.id, userId = member.id
            const result = await warnSchema.findOne({
                // guildId,
                userId
            })
            if (!result) return interaction.reply(`User doesnt has enough warnings.`)
            const sorted = result.warnings.sort((a, b) => b.at - a.at)

            evidence = sorted.map(e => `\`${e.punishmentId}\` - ${moment.utc(e.at).format("MMM Do YYYY, h:mm:ss a")}`).join('\n')
        }

        if (evidence && evidence.toLowerCase() === 'cancel') return interaction.reply(`Cancelled.`)
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
            .setLabel('Accept!')
            .setID(`banrequest-${member.id}-yes-${reason}`)
            .setEmoji('750328771810426980'),
            button2 = new Discord.MessageButton()
                .setStyle('DANGER')
                .setLabel('Deny.')
                .setID(`banrequest-${member.id}-no-${reason}`)
                .setEmoji('750328723626000535')

        const row = new Discord.MessageActionRow()
            .addComponents(button1, button2)

        const stoppedRow = new MessageActionRow()
            .addComponent(button1.setDisabled())
            .addComponent(button1.setDisabled())

        await banreqchannel.send('@here', { embeds: [embed], components: [row] })
        await interaction.reply(`Ban successfully requested.`)
    },
};