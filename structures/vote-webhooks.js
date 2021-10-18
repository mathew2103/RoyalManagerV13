const express = require('express')
const { Webhook } = require('@top-gg/sdk')
const coinsSchema = require('../schemas/open-coins-schema');
const { MessageEmbed, MessageActionRow, MessageButton, Client } = require('discord.js');
const votesSchema = require('../schemas/votes-schema');
const ms = require('ms');

const config = require('../config.json');
const utils = require('./utils');

/**
 * 
 * @param {Client} client 
 */

module.exports.run = (client) => {
    const wh = new Webhook(process.env.TOPGG_PASS)
    const app = express()

    app.post('/webhook', wh.listener(async (vote) => {
        console.log(vote)
        const amountOfCoins = vote.isWeekend == true ? 4 : 2;
        await coinsSchema.findOneAndUpdate({ userID: vote.user }, {
            userID: vote.user,
            $inc: {
                balance: amountOfCoins
            },
        }, { upsert: true });

        await votesSchema.findOneAndUpdate({ userID: vote.user }, {
            userID: vote.user,
            nextVote: Date.now() + ms('12h'),
            $inc: {
                votes: 1
            }
        }, { upsert: true })

        const guild = await client.guilds.fetch(vote.guild);
        const member = await guild.members.fetch(vote.user);
        if (member) await member.roles.add(config.voterRole)

        const embed = new MessageEmbed()
            .setAuthor(`Vote Rewards`)
            .setDescription(`Thank you for voting for ${guild.name}.\nYou have received ${amountOfCoins} coins for voting for the server and also the Server Voter Role.`)
            .setColor('#ed80e0');

        await member.user.send(embed).catch(e => e)

        utils.log(client, `**${member.user.tag}** voted for ${guild.name}`, 'votes')
        // client.log(`**[VOTE]** **${member.user.tag}** voted for Royal Advertising.`)
    }))


    client.intervals.set('votes', setInterval(async () => {
        let voteReminders = await votesSchema.find({})
        voteReminders = voteReminders.filter(e => e.reminders != false && e.nextVote && e.nextVote <= Date.now())
        const mainGuild = await client.guilds.fetch(config.mainServer.id);

        for (const reminder of voteReminders) {
            const member = await mainGuild.members.fetch(reminder.userID).catch(e => e);
            if (!member) return;

            const embed = new MessageEmbed()
                .setAuthor('Vote Reminder')
                .setDescription(`Its been 12 hours since your last vote for Royal Advertising and are now able to vote again.`)
                .setColor('GREEN')

            const voteButton = new MessageButton()
                .setStyle('LINK')
                .setLabel('Vote')
                .setURL('https://top.gg/servers/559271990456745996/vote')

            const toggleButton = new MessageButton()
            .setLabel('Toggle Reminders')
            .setCustomId(`votes_${reminder.userID}`)
            .setStyle('PRIMARY')
            .setEmoji('⏹️')
                
            const actionRow = new MessageActionRow()
                .addComponents([voteButton, toggleButton])

            await votesSchema.findOneAndUpdate({ userID: reminder.userID }, {
                nextVote: Date.now() + ms('12h')
            }, {upsert: true})

            await member.roles.remove(voterRole);
            await member.send({ embed: embed, components: [actionRow] })
            
        }
    }, 5 * 60 * 1000))
    app.listen(4002)
}