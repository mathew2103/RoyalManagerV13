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
    roles: ['Mod'],
    async execute(interaction) {
        const punishmentId = interaction.options.getString('punishment_id');
        const reason = interaction.options.getString('reason');
        const warning = await punishmentSchema.findOne({ punishmentId, guild: interaction.guild.id })
        if(!warning)return interaction.reply({content: `No punishment found with ID: ${punishmentId}`, ephemeral: true});

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

        const moderator = await interaction.guild.members.fetch(warning.author).catch(() => {});
        const member = await interaction.guild.members.fetch(warning.user).catch(() => {});
        if (member) interaction.reply(`Removed ${member.user.tag}'s (\`${warning.user}\`) warning with ID: \`${punishmentId}\``);
        else interaction.reply(`Removed the warning with ID: \`${punishmentId}\``);

        if (moderator) {
            const moddata = await warnCountSchema.findOne({ userId: warning.author })
            moderator.user.send(`A warning issued by you has been removed. You currently have \`${moddata.current}\` ad moderations.`).catch(() => {});
        }

        const dm = new Discord.MessageEmbed()
            .setAuthor(`Punishment Removed`)
            .setDescription(`Your ad warning with ID: \`${punishmentId}\` has been removed.`)
            .setColor("GREEN")
        if (member) member.send({embeds: [dm]}).catch(e => interaction.followUp({ content: `Couldn't DM the user. \nError:\n\`\`\`${e.message}\`\`\``, ephemeral: true }))

        const logem = new Discord.MessageEmbed()
            .setAuthor(`Punishment Removed`)
            .addField(`User`, `${member.toString()}\n\`${member.user.id}\``, true)
            .addField(`Moderator`, `${interaction.user.toString()}\n\`${interaction.user.id}\``, true)
            .addField(`Reason`, reason, true)
            .setTimestamp()
            .setFooter(`Warning ID: ${warning.punishmentId} | Warning was issued by: ${warning.author}`)
            .setColor("YELLOW")
            .setThumbnail(member.user.displayAvatarURL())

        utils.log(interaction.client, logem, 'staff')
        // const logs = interaction.guild.channels.cache.get(data.logs)
        // if (logs) try { logs.send(logem) } catch (e) { }
        // else console.log(`brr`)
    }
}