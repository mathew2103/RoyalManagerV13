const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');
const punishmentSchema = require('../../schemas/punishments-schema');
const warnCountSchema = require('../../schemas/warnCount-schema');
const settingsSchema = require('../../schemas/settings-schema')
const utils = require('../../structures/utils');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Removes the warning for a user')
        .addStringOption(op => op.setName('punishment_id').setDescription('The ID of punishment you want to remove').setRequired(true))
        .addStringOption(op => op.setName('reason').setDescription('Reason for removing this punishment').setRequired(true)),
    global: false,
    guilds: '825958701487620107',
    async execute(interaction) {
        const punishmentId = interaction.options.get('punishment_id');
        const reason = interaction.options.get('reason');
        const warning = await punishmentSchema.findOne({ punishmentId, guild: interaction.guild.id })

        if (warning.author !== interaction.user.id
            && !interaction.member.roles.cache.some(e => e.name.includes('Head Moderator') || e.name.includes('Administrator') || e.name.includes('Server Manager')))
            return interaction.reply({ content: 'You can not delete a warn issued by another moderator.', ephemeral: true })

        try {
            await punishmentSchema.findOneAndDelete({ punishmentId })

        } catch (e) {
            interaction.reply(`Couldnt remove the warning`)
            console.error(e)
            return
        }

        try {
            await punishmentSchema.findOneAndUpdate({ userId: warning.author }, {
                $inc: {
                    current: -1,
                    total: -1
                }
            })
        } catch (e) { console.error(e) }

        const moderator = await interaction.guild.members.fetch(warning.author).catch(e => e)
        const member = await interaction.guild.members.fetch(warning.user).catch(e => e)
        if (member) interaction.reply(`Removed ${member.user.tag}'s (\`${warning.user}\`) warning with ID: \`${punishmentId}\``);
        else interaction.reply(`Removed the warning with ID: \`${punishmentId}\``);

        if (moderator) {
            const moddata = await warnCountSchema.findOne({ userId: warning.author })
            moderator.user.send(`A warning issued by you has been removed. You currently have \`${moddata.current}\` ad moderations.`).catch(e => e)
        }


        const dm = new Discord.MessageEmbed()
            .setAuthor(`Punishment Removed`)
            .setDescription(`Your ad warning with ID: \`${args[0]}\` has been removed.`)
            .setColor("GREEN")
        if (member) member.send(dm).catch(e => interaction.followUp({ content: `Couldn't DM the user. \nError:\n\`\`\`${e.message}\`\`\``, ephemeral: true }))

        const logem = new Discord.MessageEmbed()
            .setAuthor(`Punishment Removed`)
            .addField(`User`, `${member.toString()}\n\`${member.user.id}\``, true)
            .addField(`Moderator`, `${interaction.user.toString()}\n\`${interaction.user.id}\``, true)
            .addField(`Reason`, reason, true)
            .setTimestamp()
            .setFooter(`Warning ID: ${warning.punishmentId} | Warning was issued by: ${warning.author}`)
            .setColor("YELLOW")

        utils.log(client, logem, 'staff')
        // const logs = interaction.guild.channels.cache.get(data.logs)
        // if (logs) try { logs.send(logem) } catch (e) { }
        // else console.log(`brr`)
    }
}