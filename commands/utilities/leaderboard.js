/*eslint-disable*/
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json')
const warnCountSchema = require('../../schemas/warnCount-schema')
// const punishments = require('../schemas/punishments-schema');
// const warnschema = require('../schemas/warn-schema')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the leaderboard for ad warnings.'),
    async execute(client, interaction) {
        const data = await warnCountSchema.find({})
        const staffguild = client.guilds.cache.get(config.staffServer.id)

        const filtered = await data.filter(e => {
            let staffmember = staffguild ? staffguild.members.cache.get(e.userId) : null
            if (!staffmember) return false
            if (!staffmember.roles.cache.find(r => r.name.includes('Moderation Team'))) return false
            return true
        })
        const sorted = await filtered.sort((a, b) => b.current - a.current)

        const maxPages = Math.ceil(sorted.length / 10)
        let pageno = 1
        if (args[0] && !isNaN(args[0])) pageno = args[0]
        if (pageno > maxPages) return interaction.reply(`Only ${maxPages} page(s) exist.`)
        const result = await pages(sorted, 10, pageno)

        if (!result) return interaction.reply(`Couldn't make the leaderboard. Try again.`)
        const embed = new Discord.MessageEmbed()
            .setAuthor(`Ad Moderation Leaderboard [${pageno}/${maxPages}]`)
            .setColor("RANDOM")
            .setFooter(`Requested by ${interaction.author.tag}`, interaction.author.displayAvatarURL())
            .setTimestamp()
        let desc = ''
        let num = 1
        for (const e of result) {
            const member = interaction.guild.members.cache.get(e.userId)

            let staffmember = staffguild ? await staffguild.members.cache.get(e.userId) : null
            // if(staffguild) staffmember = staffguild.members.cache.get(e.user)
            // if(!member)return console.log(`couldnt find user with id: ${e.userId}`)

            if (member) {
                if ((!member.roles.cache.find(r => r.name === '• Server Manager'
                    || r.name === '• Administrator'
                    || r.name === '♛ Head Moderator'))
                    && member.roles.cache.find(r => r.name.includes('Moderation Team'))) {
                    if (e.current >= 8) {
                        if (e.userId == interaction.user.id) desc += `#${num}: **${member.user.tag}** - \`${e.current}\` 🟢 (Total: \`${e.total}\`) -- **YOU** \n`;
                        else desc += `#${num}: **${member.user.tag}** - \`${e.current}\` 🟢 (Total: \`${e.total}\`)\n`;
                    } else if (staffmember && staffmember.roles.cache.get(config.onBreakRole)) {
                        if (e.userId == interaction.user.id) desc += `#${num}: **${member.user.tag}** - \`${e.current}\` 🟡 (Total: \`${e.total}\`) -- **YOU** \n`;
                        else desc += `#${num}: **${member.user.tag}** - \`${e.current}\` 🟡 (Total: \`${e.total}\`) \n`;
                    } else {
                        if (e.userId == interaction.user.id) desc += `#${num}: **${member.user.tag}** - \`${e.current}\` 🔴 (Total: \`${e.total}\`) -- **YOU** \n`;
                        else desc += `#${num}: **${member.user.tag}** - \`${e.current}\` 🔴 (Total: \`${e.total}\`) \n`;
                    }
                    num++;
                }

            }

        }

        await embed.setDescription(desc)

        await interaction.reply({ embeds: [embed] })

        function pages(arr, itemsPerPage, page = 1) {
            const maxPages = Math.ceil(arr.length / itemsPerPage);
            if (page < 1 || page > maxPages) return null;
            return arr.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        }
    },
};