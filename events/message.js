const { codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const coinsSchema = require('../schemas/coins-schema');
const utils = require('../structures/utils')
const fetch = require('node-fetch');
const fs = require('fs')
module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;
        const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));


        if (config.automod.scams && !message.member.permissions.has('MANAGE_MESSAGES') && new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+").test(message.content)) {
            try {
                const fetched = await fetch("https://anti-fish.bitflow.dev/check", {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify({
                        message: message.content
                    })
                })
                const data = await fetched.json()

                if (data.match) {
                    await message.send({ embeds: [new MessageEmbed().setDescription(`You have been banned in ${message.guild.name} for sending ${data.matches[0]?.type?.toLowerCase() || 'scam'} links`)] }).catch(e => e);

                    message.member.ban({ days: 2, reason: `Sending ${data.matches[0]?.type?.toLowerCase() || 'scam'} links` }).catch(e => e);
                }
            } catch (e) { console.error(e) }
            // console.log(await fetched.json())
            return;
        }

        if (message.channel.id == '594522649476988938' || message.channel.id == '834377508307730462') {
            console.log('ok')
            try {
                const inviteRegex = /(?:discord.gg\/)(\w+\S)/mi
                const regexMatch = message.content.match(inviteRegex)
                if (!regexMatch) return message.delete();
                const invite = await client.fetchInvite(regexMatch[1])
                if (!invite) return message.delete();
                const coins = utils.randomBetween(30, 50);
                await coinsSchema.findOneAndUpdate({ userID: interaction.member.id }, {
                    userID: interaction.member.id,
                    $inc: {
                        balance: coins,
                    },
                });

                const embed = new MessageEmbed()
                    .setAuthor(`Thanks for partnering with ${invite.guild?.name || 'Unknown Server'}`)
                    .setDescription()

                return message.channel.send({ embeds: [embed] });
            }catch (e) { console.error(e) }
        }

        if (message.content.toLowerCase().startsWith('!eval') && (message.author.id === '378025254125305867' || message.author.id === '605061180599304212')) {
            console.log('fine')
            let code = message.content.split('!eval ')[1]
            if (!code) return message.reply('Provide some code nerd.')

            if (code.includes('token')) code = code.replace('token', 'id')
            const embed = new MessageEmbed()
                .addField('Input', codeBlock('js', code))
                .setAuthor(message.author.tag, message.author.displayAvatarURL())
            try {
                let evaled = await eval(code)
                embed.addField('Output', codeBlock(evaled))
                embed.setColor("GREEN")
                message.reply({ embeds: [embed] })
                // message.reply(`\`\`\`\n${evaled}\`\`\``)
            } catch (e) {
                console.error(e)
                embed.addField('Error', codeBlock('cmd', e)).setColor("RED")
                message.reply({ embeds: [embed] })
                // message.reply(`ERROR:\`\`\`cmd\n${e.message}\`\`\``)
            }
            return;
        }
    }
}