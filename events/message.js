const config = require('../config.json');
const fs = require('fs')
const { join } = require('path');
const { codeBlock } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'messageCreate',
    async execute(message, client){
        if(message.author.bot || !message.guild)return;
    
    
        if (message.content.toLowerCase().startsWith('!eval') && (message.author.id === '378025254125305867' || message.author.id === '605061180599304212')){
            let code = message.content.split('!eval ')[1]
            if(!code)return message.reply('Provide some code nerd.')
    
            // code = code.replace('token', 'id')
            // let evaled = '';
            if(code.includes('token'))code = code.replace('token', 'id')
            const embed = new MessageEmbed()
            .addField('Input', codeBlock('js', code))
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            try{
                let evaled = await eval(code)
                embed.addField('Output', codeBlock(evaled))
                embed.setColor("GREEN")
                message.reply({ embeds: [embed]})
                // message.reply(`\`\`\`\n${evaled}\`\`\``)
            }catch(e){
                console.error(e)
                embed.addField('Error', codeBlock('cmd', e)).setColor("RED")
                message.reply({ embeds: [embed]})
                // message.reply(`ERROR:\`\`\`cmd\n${e.message}\`\`\``)
            }
            return;
        }

        if (message.channel.id == '834377508307730462'){ //message.channel.id == '594522649476988938' || 
            const inviteRegex = /(?:discord.gg\/)(\w+\S)/mi
            const regexMatch = message.content.match(inviteRegex)
            if(!regexMatch)return;
            const invite = await client.fetchInvite(regexMatch[1])
            if(!invite)return message.delete();

            const embed = new MessageEmbed()
            .setAuthor(`Thanks for partnering with ${invite.guild?.name || 'Unknown Server'}`)
            .setDescription()

            message.reply({ content: invite?.guild?.name || 'nope'})

        }
    }
}