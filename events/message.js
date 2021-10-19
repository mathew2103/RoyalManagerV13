// const Canvas = require('canvas');
// const fs = require('fs')
// const { join } = require('path');
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
        const config = JSON.parse(fs.readFileSync('../../config.json', 'utf-8'));

        const applyText = (canvas, text) => {
            const context = canvas.getContext('2d');

            // Declare a base size of the font
            let fontSize = 70;

            do {
                // Assign the font to the context and decrement it so it can be measured again
                context.font = `${fontSize -= 10}px sans-serif`;
                // Compare pixel width of the text to the canvas minus the approximate avatar size
            } while (context.measureText(text).width > canvas.width - 300);

            // Return the result to use in the actual canvas
            return context.font;
        };

        if (message.content.toLowerCase().startsWith('!eval') && (message.author.id === '378025254125305867' || message.author.id === '605061180599304212')) {
            let code = message.content.split('!eval ')[1]
            if (!code) return message.reply('Provide some code nerd.')

            // code = code.replace('token', 'id')
            // let evaled = '';
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

        if (config.automod.scams && new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+").test(message.content)) {
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
                message.member.ban({ days: 2, reason: `Sending ${data.matches[0]?.type?.toLowerCase() || 'scam'} links`});
                // const evidenceCh = message.channel || client.channels.cache.get(config.evidenceChannel);
                // const canvas = Canvas.createCanvas(700, 250);
                // const context = canvas.getContext('2d');

                // context.font = '28px calibri';
                // context.fillStyle = '#ffffff';
                // context.fillText(message.member.displayName, canvas.width / 2.5, canvas.height / 3.5);

                // context.font = applyText(canvas, message.content);
                // context.fillStyle = '#ffffff';
                // context.fillText(message.content, canvas.width / 2.5, canvas.height / 1.8);

                // context.beginPath();
                // context.arc(75, 125, 50, 0, Math.PI * 2, true);
                // context.closePath();
                // context.clip();

                // const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
                // context.drawImage(avatar, 25, 25, 200, 200);

                // const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');
                // evidenceCh.send({ files: [attachment]})
            }
            // console.log(await fetched.json())
            return;
        }
        return;
        if (message.channel.id == '834377508307730462') { //message.channel.id == '594522649476988938' || 
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
        }
    }
}