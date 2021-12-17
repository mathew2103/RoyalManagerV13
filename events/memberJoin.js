const Discord = require('discord.js');
const utils = require('../structures/utils');
const { codeBlock } = require('@discordjs/builders');
const math = require('mathjs');

module.exports = {
    name: 'guildMemberAdd',
    /**
     * @param {Discord.GuildMember} member
     * @param {Discord.Client} client
     */
    async execute(member, client) {
        // if (member.id !== '378025254125305867') return;
        if (member.guild.id !== '559271990456745996') return;

        const no1 = utils.randomBetween(50, 100);
        const no2 = utils.randomBetween(0, 50);
        const operator = ['+', '-'][utils.randomBetween(0, 1)]
        let arrB = [new Discord.MessageButton()
            .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('0').setStyle('SECONDARY'),
        new Discord.MessageButton()
            .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('1').setStyle('SECONDARY'),
        new Discord.MessageButton()
            .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('2').setStyle('SECONDARY'),
        new Discord.MessageButton()
            .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('3').setStyle('SECONDARY')]
        // const b1 = new Discord.MessageButton()
        //     .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('0').setStyle('SECONDARY'),
        //     b2 = new Discord.MessageButton()
        //         .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('1').setStyle('SECONDARY'),
        //     b3 = new Discord.MessageButton()
        //         .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('2').setStyle('SECONDARY'),
        //     b4 = new Discord.MessageButton()
        //         .setLabel(utils.randomBetween(0, 150).toString()).setCustomId('3').setStyle('SECONDARY')
        // let arrB = [b1, b2, b3, b4]
        const ran = utils.randomBetween(0, 3)
        arrB[ran] = arrB[ran].setLabel(math.evaluate(`${no1} ${operator} ${no2}`).toString())
        const row = new Discord.MessageActionRow().addComponents(arrB)


        const embed = new Discord.MessageEmbed()
            .setDescription(`Welcome to ${member.guild.name}!\n${codeBlock('js', `${no1} ${operator} ${no2}`)}\n\nTo continue, please select the correct answer. You have 5 minutes to answer, or you will be removed from the server.`)
            .setColor('YELLOW')

        const sent = await member.send({ embeds: [embed], components: [row] }).catch(e => console.error(e));
        const filter = i => {
            i.deferUpdate();
            return true;
        }

        const embed2 = new Discord.MessageEmbed()
        let resp = await member.user.dmChannel.awaitMessageComponent({ filter, time: 5 * 60 * 1000 }).catch(async () => {
            await fail('didnt respond', 'No Response')
        });

        if (!resp) return await fail('didnt respond', 'FAILED');

        if (resp.customId != ran) return await fail('failed the test', 'FAILED')

        else sent.edit({ embeds: [embed2.setDescription('You have been verified!').setAuthor('SUCCESS').setColor("GREEN")], components: [] })
        // await member.send({ files: [await captcha.image(captcha.currentString)] }).catch(e => console.error(e));
        // const filter = m => m.author.id == member.id;
        // let resp = await member.user.dmChannel.awaitMessages({ filter, time: 5 * 60 * 1000, max: 1 });
        // resp = resp.first();


        // if (resp?.content === captcha.currentString) return await member.send({ embeds: [embed2.setDescription('You have been verified!').setAuthor('SUCCESS').setColor("GREEN")] })
        // else {
        //     await member.send({ emebds: [embed2.setDescription('You have been removed from the server, since you failed the test.').setAuthor('FAILED').setColor('RED')] }).catch(() => {});
        //     await client.channels.cache.get('749618873552207872')?.send(`Removed ${member.user.tag} | Reason: Failed Captcha Test`)
        //     // await member.kick('Failed Captcha Test').catch(() => {});;
        // }

        /**
         * 
         * @param {String} reason 
         * @param {String} author 
         */
        async function fail(reason, author) {
            if (!reason || !author) throw new Error('Provide a reason and a title')

            const invButton = new Discord.MessageButton()
                .setStyle("LINK").setLabel("Join Back").setURL("https://discord.gg/vAaxA2Qu89")

            await sent.edit({ embeds: [embed2.setDescription(`You have been removed from the server, since you ${reason}.\n You can use the button below to join back.`).setAuthor(author).setColor('RED')], components: [new Discord.MessageActionRow().addComponents([invButton])] })
            await client.channels.cache.get('749618873552207872')?.send(`Removed ${member.user.tag} | Reason: Failed Captcha Test`)
            // await member.kick('Failed Captcha Test').catch(() => { });;
        }
    }
}