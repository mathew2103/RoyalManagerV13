const Discord = require('discord.js');
const breakSchema = require('../schemas/break-schema');
const config = require('../config.json');
const utils = require('./utils');
module.exports.run = async(client) => {
    const staffg = client.guilds.cache.get(config.staffServer.id)
    if(!staffg)throw new Error(`no staff guild found`)

    console.log('Loaded Auto Breaks')

    client.intervals.set('auto-break', setInterval(async() => {
        const data = await breakSchema.find({accepted: true})
        if(!data)return;

        for(const e of data){
            if(isNaN(e.expires))continue;
            
            const member = await staffg.members.fetch(e.user).catch(e => e)
            if(!member){ await breakSchema.findOneAndDelete({user: e.user})
                console.log(`No member found for auto break removal. Member ID: ${e.user}`)
            continue;}
            if(Date.now() < (e.at+Number(e.expires)))continue;

            await member.roles.remove(config.onBreakRole);
            const oldname = member.displayName;
            const newname = oldname.slice(11, oldname.length)
            await member.setNickname(newname).catch(e => console.error(e))
            await breakSchema.findOneAndDelete({user: e.user})
            const embed = new Discord.MessageEmbed()
                .setAuthor('Break Expired')
                .setDescription('Your break in Royal Advertising has ended. You will need to continue doing the weekly quota from now on.')
                .setColor('YELLOW')
                .setFooter('Auto Break Expiration', client.user.displayAvatarURL())
            await member.send(embed).catch(e => e);
            utils.log(client, `**[AUTO-BREAK]** ${member.user.tag}'s break expired.`, 'auto')
        }
        

    }, 60*1000))

}