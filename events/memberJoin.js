const Discord = require('discord.js');
const { Captcha } = require("simple-captcha-generator");
const utils = require('../structures/utils');
module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        if(member.id !== '378025254125305867')return;
        const captcha = new Captcha()
        const no1 = utils.randomBetween(0,100);
        const no2 = utils.randomBetween(0,100);
        // console.log(captcha);
        // console.log(await captcha.image(captcha.currentString))
        const embed = new Discord.MessageEmbed()
            .setDescription(`Welcome to ${member.guild.name}!\nTo continue, please send the below captcha within 5 minutes.`)
            .setColor('YELLOW')
            // .setImage(att.url)
            // .setImage(captcha.url)
        await member.send({ embeds: [embed] }).catch(e => console.error(e));
        await member.send({ files: [await captcha.image(captcha.currentString)]}).catch(e => console.error(e));
        const filter = m => m.author.id == member.id;
        let resp = await member.user.dmChannel.awaitMessages({ filter, time: 5*60*1000, max: 1});
        resp = resp.first();

        const embed2 = new Discord.MessageEmbed()
        if(resp?.content === captcha.currentString)return await member.send({embeds: [embed2.setDescription('You have been verified!').setAuthor('SUCCESS').setColor("GREEN")]})
        else { 
            await member.send({ emebds: [embed2.setDescription('You have been removed from the server, since you failed the test.').setAuthor('FAILED').setColor('RED')]}).catch(e => e)
            await client.channels.cache.get('749618873552207872')?.send(`Removed ${member.user.tag} | Reason: Failed Captcha Test`)
            await member.kick('Failed Captcha Test').catch(e => e);
        }

    }
}