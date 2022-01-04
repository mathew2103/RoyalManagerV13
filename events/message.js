const { codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const coinsSchema = require('../schemas/coins-schema');
const utils = require('../structures/utils')
const fetch2 = require('node-fetch');
const fs = require('fs');
const config = require('../config.json');
const fetch = require('petitio');
const modmail = require('../structures/modmail');
module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // return;
        if (message.author.bot) return;
        // if (!message.guild) return modmail.run(message, client);

        // const fetched = await fetch2("https://anti-fish.bitflow.dev/check", {
        //     method:'POST', 
        //     headers: {
        //         'Content-Type': "application/json",
        //         'User-Agent': "menin"
        //     },
        //     body: JSON.stringify({
        //         message: message.content
        //     })
        // }) 
        // const resp = await fetch("https://anti-fish.bitflow.dev/check", "POST")
        // .header('Application-Name','Menin')
        // .header('Content-Type', 'application/json')
        // .body({message: message.content}, "stream");

        // return console.log(
        //     fetched
        // )


        // if (message.content.toLowerCase().startsWith('!check') && (message.guild.id == '746635811243556925' || message.channel.id == '749618873552207872' || message.member.roles.cache.some(e => e.name.toLowerCase() == 'bot developer'))) {
        //     try {
        //         const fetched = await fetch("https://anti-fish.bitflow.dev/check", "POST").header('Content-Type', "application/json").body('message', message.content);

        //         const data = await fetched.json()

        //         if (data.match) {

        //             const replyEmbed = new MessageEmbed()
        //                 .addFields([
        //                     {
        //                         name: 'Domain',
        //                         value: data.matches[0]?.domain,
        //                         inline: true
        //                     }, {
        //                         name: 'Type',
        //                         value: data.matches[0]?.type,
        //                         inline: true
        //                     }, {
        //                         name: 'Trust Rating (Between 0-1)',
        //                         value: data.matches[0]?.trust_rating?.toString(),
        //                         inline: true
        //                     }
        //                 ])
        //                 .setColor('RED')
        //                 .setAuthor(client.user.tag, client.user.displayAvatarURL())
        //             message.reply({ embeds: [replyEmbed] })

        //         } else message.reply('This link doesnt seem phishy to me..')
        //         return;
        //     } catch (e) { console.error(e) }
        //     return;
        // }

        // if (!message.member.permissions.has('MANAGE_MESSAGES') && !message.member.roles.cache.some(e => e.name.toLowerCase() == 'bot developer')) {
        //     try {
        //         const fetched = await fetch("https://anti-fish.bitflow.dev/check", {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': "application/json"
        //             },
        //             body: JSON.stringify({
        //                 message: message.content
        //             })
        //         })
        //         const data = await fetched.json();

        //         if (data.match) {
        //             if (message.guild.id == config.mainServer.id) {
        //                 await message.send({ embeds: [new MessageEmbed().setDescription(`You have been banned in ${message.guild.name} for sending ${data.matches[0]?.type?.toLowerCase() || 'scam'} links`)] }).catch(() => {});;

        //                 await message.member.ban({ days: 2, reason: `Sending ${data.matches[0]?.type?.toLowerCase() || 'scam'} links` }).catch(() => {});;

        //                 await client.channels.cache.get('749618873552207872')?.send({ embeds: [new MessageEmbed().setDescription(`Banned ${message.author.tag} for sending ${data.matches[0]?.type.toLowerCase || 'scam'} link in ${message.channel.toString()}`).addFields([{ name: 'Link', value: data.matches[0]?.domain, inline: true }, { name: 'Trust Rating (0-1)', value: data.matches[0]?.trust_rating.toString() }])] })
        //             } else if (message.guild.id == config.staffServer.id) {
        //                 await message.delete();

        //                 // await message.member.roles.set('882622655545614386');

        //                 await message.guild.channels.cache.get(config.modTeamUpdatesChannel)?.send(`${message.member.toString()} just posted a scam link in ${message.channel.toString()}. Please do not click on any links sent by them.`)
        //             }
        //             return;
        //         }
        //     } catch (e) { console.error(e) }
        //     // console.log(await fetched.json())
        //     // return;
        // }

        // if (message.channel.id == '594522649476988938' || message.channel.id == '834377508307730462') {
        //     return;
        //     try {
        //         const inviteRegex = /(?:discord.gg\/)(\w+\S)/mi
        //         const regexMatch = message.content.match(inviteRegex)
        //         if (!regexMatch) return //message.delete();
        //         const invite = await client.fetchInvite(regexMatch[1])
        //         if (!invite) return //message.delete();
        //         const coins = utils.randomBetween(30, 50);
        //         await coinsSchema.findOneAndUpdate({ userID: interaction.member.id }, {
        //             userID: interaction.member.id,
        //             $inc: {
        //                 balance: coins,
        //             },
        //         });

        //         // const embed = new MessageEmbed()
        //         //     .setAuthor(`Thanks for partnering with ${invite.guild?.name || 'Unknown Server'}`)
        //         //     .setDescription()

        //         // return message.channel.send({ embeds: [embed] });
        //     } catch (e) { console.error(e) }
        // }

        if ((message.author.id === '378025254125305867' || message.author.id === '605061180599304212')) {

            if (message.content.toLowerCase() === '!deploy') {

                // const clientCmds = await client.commands.fetch();
                // const { client } = message
                let guilds = await client.guilds.fetch();
                guilds = Array.from(guilds.values())
                let allCmds = []


                const registerCmd = async (dir) => {
                    const files = fs.readdirSync(`/home/container/${dir}`);

                    for (const file of files) {
                        const stat = fs.lstatSync(`/home/container/${dir}/${file}`);
                        if (stat.isDirectory()) {
                            registerCmd(`${dir}/${file}`);
                        }
                        else {
                            const option = require(`/home/container/${dir}/${file}`);


                            // if(option.data.options?.length){
                            // 	for(let i = 0; i < option.data.options.length; i++){
                            // 		options.data.options[i].type = 1
                            // 	}
                            // }
                            if (option.data.options[0]?.options) option.data.options[0].type = 1
                            if (option.data.options[1]?.options) option.data.options[1].type = 1
                            if (option.data.options[2]?.options) option.data.options[2].type = 1

                            if (option.guilds && !Array.isArray(option.guilds)) option.guilds = [option.guilds]

                            if (!option.guilds?.length) option.guilds = []
                            if (dir.includes('moderation')) option.guilds.push(config.mainServer.id)
                            else if (dir.includes('staffOnly')) option.guilds.push(config.staffServer.id)
                            else if (dir.includes('music')) option.guilds.push('all')

                            allCmds.push(option)
                        }
                    }

                };
                registerCmd('commands');

                await client.application.fetch();
                const globalCmdsData = allCmds.filter(e => e.global);
                console.log(...globalCmdsData?.map(e => e.data))
                // await client.application.commands.set(...globalCmdsData?.map(e => e.data))
                for (let guild of guilds) {
                    // if(!guild.commands)guild = await guild.fetch()
                    const guildCmdsData = allCmds.filter(e => e.guilds?.includes(guild.id) || e.guilds?.includes('all') || e.global)
                    const cmds = guildCmdsData.map(e => e.data)
                    client.application.commands.set(cmds, guild.id)
                    // await guild.commands.set(cmds).catch(e => message.channel.send(e.message));
                }

                await client.application.commands.create({
                    name: 'AD WARN',
                    type: "MESSAGE"
                }, config.mainServer.id)

                message.reply('Deployed all commands!')
                return;
                // await client.guilds.cache.get('825958701487620107')?.commands.create(adCmdData);
            } else if (message.content.toLowerCase().startsWith('!eval')) {

                let code = message.content.split('!eval ')[1]
                if (!code) return message.reply('Provide some code nerd.')

                if (code.includes('token')) code = code.replace('token', 'id')
                const embed = new MessageEmbed()
                    .addField('Input', codeBlock('js', code))
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
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
}