const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json')
const warnCountSchema = require('../../schemas/warnCount-schema')
const Discord = require('discord.js');
// const punishments = require('../schemas/punishments-schema');
// const warnschema = require('../schemas/warn-schema')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the leaderboard for ad warnings.')
        .addStringOption((op) => op.setName('sort_by').setDescription('The method you want to sort the data').addChoices([['current', 'current'], ['total', 'total']])),
    guilds: [config.mainServer.id],
    errorMsg: `**Known Issue:** \`Cannot read property 'current' of undefined\`\nIf this error shown is not this, please notify Menin about this.`,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const sortBy = interaction.options.getString('sort_by') ?? 'current'
        const data = await warnCountSchema.find({});
        let staffguild = await interaction.client.guilds.fetch(config.staffServer.id);
        await staffguild.members.fetch();

        const modTeamRole = await staffguild.roles.fetch(config.staffServer.modTeamRole);
        
        let members = [...modTeamRole.members.values()]
        const bannedRegex = /(management team|bot dev|head mod)/mi
        members = members.filter(e => !e.roles.cache.some(r => bannedRegex.test(r.name)));//r.name.match(bannedRegex)
        // console.log(modTeamRole.members.filter(e => !members.includes(e)))

        let modData = await members.map(member => {
            
            let memberData = data.find(e => e.userId == member.id);
            if (memberData) {
                memberData.tag = member.user.tag;
                if (member.id == interaction.member.id) memberData.self = true;
                if (member.roles.cache.has(config.onBreakRole)) memberData.onBreak = true;
                return memberData;
            }
            // if(!memberData)return;

            // if(memberData)odData.push(memberData)
        })
        
        modData = modData.filter(e => e !== undefined);

        if (sortBy == 'current') modData = modData.sort((a, b) => b.current - a.current)
        else modData = modData.sort((a, b) => b.total - a.total);

        const embed = new Discord.MessageEmbed()
            .setAuthor(`Ad Moderation Leaderboard [Sort By: ${sortBy}]`)
            .setColor("#ffffff")
            .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL())
            .setTimestamp()

        let num = 0;
        const desc = modData.map(e => {
            num++
            if (e.current >= 8) return `#${num}: **${e.tag}** - \`${e.current}\` 🟢 (Total: \`${e.total}\`) ${e.self ? '-- **YOU**' : ''}`
            else if (e.onBreak) return `#${num}: **${e.tag}** - \`${e.current}\` 🟡 (Total: \`${e.total}\`) ${e.self ? '-- **YOU**' : ''}`
            else return `#${num}: **${e.tag}** - \`${e.current}\` 🔴 (Total: \`${e.total}\`) ${e.self ? '-- **YOU**' : ''}`
        }).join('\n')
        embed.setDescription(desc)
        interaction.followUp({ embeds: [embed] })
    },
};