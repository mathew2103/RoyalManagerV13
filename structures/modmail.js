const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports.run = async (message, client) => {
    console.log('modmail')
    const guild = client.guilds.cache.get(config.mainServer.id);
    const member = await guild?.members.fetch(message.author.id).catch(() => {});;

    if (client.mails.get(message.author.id) == 'appeal') return;
    if (!member) return;
    if (message.author.id !== "378025254125305867") return;

    const level = client.mails.get(message.author.id)
    const defEmbed = new MessageEmbed()

    if (!level) {
        client.mails.set(message.author.id, '1')

        defEmbed.setDescription('Welcome to Royal Modmail. To continue, select one of the options given below.\n 1: send msg, \n2: help\n 3: yes\n 4');

        message.channel.send({ embeds: [defEmbed] })
        return;
    }

    switch (level) {
        case '1':
            client.mails.set(message.author.id, 'opened 1')
            if (message.content == '1')
                return message.reply('what to send')
            else if (message.content == '2')
                return message.reply('what help')

            break;
    }
}