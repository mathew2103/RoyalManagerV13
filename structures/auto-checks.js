const cron = require('node-cron');
const config = require('../config.json');
const warnCountSchema = require('../schemas/warnCount-schema');
const Discord = require('discord.js');
const fs = require('fs');

module.exports = (client) => {

    console.log('Loading Auto Checks...')
    cron.schedule('0 0 17 * Sunday', async () => {
        const modTeamChannel = client.channels.cache.get(config.modTeamUpdatesChannel);
        const staffguild = await client.guilds.fetch(config.staffServer.id);


        const toSend = await makeLbEmbed(staffguild);

        await modTeamChannel.send(toSend);
        await resetWarns();
    }, { timezone: 'Asia/Kolkata' })


    /**
     * Generates Leaderboard
     * @param {Discord.Guild} staffguild The staff guild
     * @returns {Object} The object to be sent
     */
    async function makeLbEmbed(staffguild) {

        const data = await warnCountSchema.find({});
        const mainguild = await client.guilds.fetch(config.mainServer.id);
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

                if (member.roles.cache.has(config.onBreakRole)) memberData.onBreak = true;
                return memberData;
            }
            // if(!memberData)return;

            // if(memberData)odData.push(memberData)
        })

        modData = modData.filter(e => e !== undefined);

        modData = modData.sort((a, b) => b.current - a.current)


        const embed = new Discord.MessageEmbed()
            .setAuthor(`Ad Moderation Leaderboard`)
            .setColor("#ffffff")
            .setTimestamp()

        let num = 0;
        const desc = modData.map(e => {
            num++
            if (e.current >= 8) return `#${num}: **${e.tag}** - \`${e.current}\` 🟢`
            else if (e.onBreak) return `#${num}: **${e.tag}** - \`${e.current}\` 🟡`
            else return `#${num}: **${e.tag}** - \`${e.current}\` 🔴`
        }).join('\n')
        embed.setDescription(desc)

        await client.channels.cache.get('871684534926729236')?.send({ content: 'Reseting mod count\n<@378025254125305867>', embeds: [embed] });
        const content = await chooseSotw(mainguild, modData[0].id);

        return { embeds: [embed], content: content };
    }

    /**
     * Resets warnings for all moderators
     */
    async function resetWarns() {
        const datas = await warnCountSchema.find({})
        for (const data of datas) {
            await warnCountSchema.findOneAndUpdate({ userId: data.userId }, {
                current: 0
            })
        }
        return;
    }

    /**
     * Chooses the staff of the week
     * @param {Discord.Guild} mainguild 
     * @param {String} newSotw
     */
    async function chooseSotw(mainguild, newSotw) {
        let oldData = JSON.parse(fs.readFileSync('config.json'));
        const oldSotw = oldData.sotw;

        if (oldSotw) {
            const oldSotwMember = await mainguild.members.fetch(oldSotw).catch(() => { })
            if (oldSotwMember) await oldSotwMember.roles.remove(config.sotwRole).catch(() => { });
        }

        const newSotwMember = await mainguild.members.fetch(newSotw).catch(() => { });
        if (newSotwMember) newSotwMember.roles.add(config.sotwRole);

        oldData.sotw = newSotw;

        fs.writeFileSync('config.json', JSON.stringify(oldData, null, 2))

        return `**Moderation Team Activity Checks**\nCongrats <@${newSotw}> for being the staff of the week.\n<@${config.staffServer.modTeamRole}>`
    }
}