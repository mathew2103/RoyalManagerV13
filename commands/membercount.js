/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Shows a detailed member count of the server.')
        .addStringOption((op) => op.setName('option').setDescription('Membercount option').addChoice('Mods', 'mods').addChoice('PMs', 'pms').addChoice('Devs', 'devs').addChoice('Tls', 'tls').addChoice('TM', 'tm').addChoice('TM', 'tm').addChoice('Admins', 'admins').addChoice('Managers', 'managers')),
    async execute(client, interaction) {
        const option = interaction.options.getString('option')


        // if (interaction.channel.id !== '748188786386665592' && interaction.channel.id !== '749537186885402685') return msg.delete();
        const mods = getMemberfromRole(interaction.guild, '747340784608477254'),
            tms = getMemberfromRole(interaction.guild, '747340065897840651'),
            pms = getMemberfromRole(interaction.guild, '748192810204659773'),
            botdev = getMemberfromRole(interaction.guild, '815101669369053184'),
            tls = getMemberfromRole(interaction.guild, '747339987841843321'),
            admins = getMemberfromRole(interaction.guild, '747339882451697675'),
            managers = getMemberfromRole(interaction.guild, '746644977223991358')

        const embed = new Discord.MessageEmbed()
        embed.setColor('RANDOM')

        switch (option) {
            case 'mods':
                embed.setAuthor(`Moderators of Royal Advertising (${mods.size + tms.size})`)
                embed.setDescription(`${mods.map(e => `${emojiFromStatus(e.user.presence.status)} - ${e.user.username}`).join('\n')}\n${tms.map(e => `${emojiFromStatus(e.user.presence.status)} - ${e.user.username} (Trial Moderator)`).join('\n')}`)
                embed.setFooter(`🟢 - Online | 🟡 - Idle | 🔴 - DnD | 🔲 - Offline`)
                interaction.reply({ embeds: [embed] })
                break;

            case 'pms':
                embed.setAuthor(`Partnership Managers of Royal Advertising (${pms.size})`)
                embed.setDescription(pms.map(e => `${emojiFromStatus(e.user.presence.status)} - ${e.user.username}`).join('\n'))
                embed.setFooter(`🟢 - Online | 🟡 - Idle | 🔴 - DnD | 🔲 - Offline`)
                interaction.reply({ embeds: [embed] })
                break;

            case 'devs':
                embed.setAuthor(`Bot Developers of Royal Advertising (${botdev.size})`)
                embed.setDescription(botdev.map(e => `${emojiFromStatus(e.user.presence.status)} - ${e.user.username}`).join('\n'))
                embed.setFooter(`🟢 - Online | 🟡 - Idle | 🔴 - DnD | 🔲 - Offline`)
                interaction.reply({ embeds: [embed] })
                break;

            case 'tls':
                embed.setAuthor(`Team Leaders of Royal Advertising (${tls.size})`)
                embed.setDescription(tls.map(e => `${emojiFromStatus(e.user.presence.status)} - ${e.user.username}`).join('\n'))
                embed.setFooter(`🟢 - Online | 🟡 - Idle | 🔴 - DnD | 🔲 - Offline`)
                interaction.reply({ embeds: [embed] })
                break;

            case 'admins':
                embed.setAuthor(`Administrators of Royal Advertising (${admins.size})`)
                embed.setDescription(admins.map(e => `${emojiFromStatus(e.user.presence.status)} - ${e.user.username}`).join('\n'))
                embed.setFooter(`🟢 - Online | 🟡 - Idle | 🔴 - DnD | 🔲 - Offline`)
                interaction.reply({ embeds: [embed] })
                break;

            case 'managers':
                embed.setAuthor(`Managers of Royal Advertising (${managers.size})`)
                embed.setDescription(managers.map(e => `${emojiFromStatus(e.user.presence.status)} - ${e.user.username}`).join('\n'))
                embed.setFooter(`🟢 - Online | 🟡 - Idle | 🔴 - DnD | 🔲 - Offline`)
                interaction.reply({ embeds: [embed] })
                break;

            default:
                const total = interaction.guild.members.cache.filter(e => e.user.bot === false).size
                console.log(mods.size, tms.size)
                embed.setAuthor(`Member Count for ${interaction.guild.name}`, interaction.guild.iconURL())
                embed.setFooter(`Adding up the counts might not be equal to total members.`)
                embed.setTimestamp()
                embed.setDescription(`**Total Members:** \`${total}\`\n**Managers:** \`${managers.size}\`\n**Administrators:** \`${admins.size}\`\n**Team Leaders:** \`${tls.size}\`\n**Bot Developers:** \`${botdev.size}\`\n**Moderators:** \`${mods.size + tms.size}\`\n**Partnership Managers:** \`${pms.size}\``)

                interaction.reply({ embeds: [embed] })
        }
    },
};

function emojiFromStatus(status) {
    if(status == 'dnd')return '\\🔴'
    if(status == 'idle')return '\\🟡'
    if(status == 'online')return '\\🟢'
    if(status == 'offline')return '\\🔲'
}

function getMemberfromRole(guild, roleID){
    const role = guild.roles.cache.get(roleID)
    return role.members
}