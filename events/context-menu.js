const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const Discord = require('discord.js')
const punishmentSchema = require('../schemas/punishments-schema');
const settingsSchema = require('../schemas/settings-schema');
const warnCountSchema = require('../schemas/warnCount-schema');
const coinsSchema = require('../schemas/coins-schema');
const config = require('../config.json');
const uniqid = require('uniqid');

let reasons = [{
    label: 'No description',
    description: 'Sending an advertisement without a description in the server advertising channels',
    value: '0'
}, {
    label: 'Invite Rewards',
    description: 'Sending an advertisement which server revolves around invite rewards',
    value: '1'
}, {
    label: 'Contains a ping',
    description: 'Sending an advertisement containing a ping',
    value: '2'
}, {
    label: 'Back to back',
    description: 'Sending an advertisement back to back',
    value: '3'
}, {
    label: 'Incorrect channel',
    description: "Sending an advertisement in an incorrect channel",
    value: '4'
}, {
    label: 'Vague description or one with less than 20 characters',
    description: 'Sending an advertisement which description is vague and/or contains less than 20 characters',
    value: '5'
}, {
    label: 'NSFW server',
    description: 'Advertising an NSFW server and/or advertising a server that isn\'t suitable for children',
    value: '6'
}, {
    label: 'Invalid Invite',
    description: 'Sending an advertisement containing an invalid invite',
    value: '7'
}, {
    label: 'Non-english ad',
    description: 'Sending an advertisement that is not in English language',
    value: '8'
}, {
    label: 'No link',
    description: 'Sending an advertisement without a link',
    value: '9'
}]

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isContextMenu()) return;

        const message = interaction.options.getMessage('message');
        
        console.log(message)
        const targetMember = message.member;
        if(!targetMember){
            interaction.reply({ content: 'Looks like the member either left or is a webhook message.', ephemeral: true})
            return
        }
        const adDeletedIn = message.channel;
        // if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) return await interaction.editReply('You cannot warn a member having a role higher than or equal to you.');

        const oldWarns = await punishmentSchema.find({ user: targetMember.id, guild:interaction.guild.id });
        if (oldWarns?.length) {
            const oldwarn = oldWarns[oldWarns.length - 1];
            if (oldwarn?.at
                && ((Date.now() - oldwarn.at) < 7.2e+6)) {
                await message.delete();
                await interaction.reply({ content: `This user was warned <t:${(oldwarn.at / 1000).toString().split('.')[0]}:R>, so you can't warn the user again. But I have deleted the message.`, ephemeral: true });
                return;
            }
        }

        if (interaction.channel.id == '699319697706975262') reasons = reasons.filter(e => !e.label.includes('incorrect'));
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setCustomId('select')
                    .setPlaceholder('No reason chosen')
                    .addOptions(reasons)
            )

        const filter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

        const reply = await interaction.reply({ content: 'Choose a reason for this warn:', components: [row], fetchReply: true })
        // const reply = await interaction.fetchReply();

        let reasonID = await reply.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 5 * 1000 })
            .catch(async e => { return await interaction.editReply({ content: 'Looks like you didnt choose in time.', components: [] }) })
        // if(!reasonID?.values)return;
        reasonID = reasonID.values[0]

        const mainGuildData = await settingsSchema.findOne({ guildId: config.mainServer.id });
        const adWarnTemplate = mainGuildData.modMsg;
        const adWarnChannel = interaction.guild.channels.cache.get('826045281824931882') || interaction.guild.channels.cache.get('758725733840846858') || interaction.channel;

        const reason = mainGuildData.reasons[Number(reasonID)];
        const punishmentId = uniqid();
        let belongsto = null;
        const staffCmds = interaction.guild.channels.cache.get('749618873552207872') || interaction.channel
        
        if (reason.includes('incorrect')) {
            
            await staffCmds.send(interaction.member.toString());
            const msgFilter = m => m.author.id == interaction.user.id && m.mentions.channels?.first()

            belongsto = await staffCmds.awaitMessages({ filter: msgFilter, time: 5 * 60 * 1000, max: 1 })
                .catch(e => { return staffCmds.send('You didn\'t respond in time.') })
            belongsto = belongsto.first().mentions.channels.first();
        }

        const warningData = {
            guild: interaction.guild.id,
            user: targetMember.id,
            author: interaction.member.id,
            at: Date.now(),
            punishmentId,
            channel: adDeletedIn.id,
            appealed: false,
            belongsto: belongsto ? belongsto.id : null,
            reason
        }

        const warning = await new punishmentSchema(warningData);
        await warning.save();

        await warnCountSchema.findOneAndUpdate({ userId: interaction.member.id }, {
            userID: interaction.member.id,
            $inc: {
                current: 1,
                total: 1,
            },
        });

        const newTargetData = await punishmentSchema.find({ user: targetMember.id, guild: interaction.guild.id });

        const randomBetween = (min, max) => {
            return Math.round(Math.random() * (max - min) + min);
        };
        const amountEarned = randomBetween(50, 75);
        await coinsSchema.findOneAndUpdate({ userID: interaction.member.id }, {
            userID: interaction.member.id,
            $inc: {
                balance: amountEarned,
            },
        });

        const adWarnEmbed = new Discord.MessageEmbed()
            .setAuthor('Ad Warning')
            .setDescription(adWarnTemplate.replace('{member}', targetMember.toString()).replace('{reason}', reason).replace('{wc}', newTargetData.length).replace('{channel}', adDeletedIn.toString()))
            .setFooter(`Warning ID: ${punishmentId}`)
            .setTimestamp();
        if (belongsto?.id) adWarnEmbed.addField('Your advertisment belongs to', belongsto.toString());

        try {
            const webhooks = await adWarnChannel.fetchWebhooks();
            let webhook = webhooks.first();

            if (!webhook) {
                webhook = await adWarnChannel.createWebhook('Royal Ad Moderation', {
                    avatar: interaction.client.user.displayAvatarURL(),
                });
            }

            await webhook.send({ content: targetMember.toString(), embeds: [adWarnEmbed] });


        }
        catch (e) {
            console.error(e);
            return interaction.editReply(`Couldn't send message in ${adWarnChannel.toString()}`);
        }

        const dmEmbed = new Discord.MessageEmbed()
            .setAuthor('Ad Warning')
            .setDescription(`Your ad has been deleted in ${adDeletedIn}.\n**Reason:** ${reason}\nNow you have ${newTargetData.length} ad warning${(newTargetData.length > 1) ? 's' : ''}\nIf you think that this is a mistake or if you want to appeal this punishment, use \`r!appeal ${punishmentId}\` in <#678181401157304321> or in this DM to appeal.`)
            .setFooter('Warning ID:' + punishmentId);

        await targetMember.send(dmEmbed).catch(e => e);

        const logEmbed = new Discord.MessageEmbed()
            .setAuthor('Warning Issued', targetMember.user.displayAvatarURL())
            .setColor('RED')
            .setTimestamp()
            .setFooter(`Moderator Tag: ${interaction.member.user.tag}`, interaction.member.user.displayAvatarURL())
            .addFields(
                { name: 'User', value: `${targetMember}\n\`${targetMember.id}\``, inline: true },
                { name: 'Moderator', value: `${interaction.member}\n\`${interaction.member.id}\``, inline: true },
                { name: 'Punishment ID', value: `\`${punishmentId}\``, inline: true },
                { name: 'Reason', value: reason, inline: true },
            );

        // await interaction.deleteReply();
        await interaction.editReply({ content: newTargetData.length > 1 ? `\`?${newTargetData.length < 7 ? newTargetData.length : '6'}aw ${targetMember.id}\`` : 'This is the user\'s first warning.', embeds: [adWarnEmbed.setFooter(`You received ${amountEarned} coins.`)], ephemeral: true, components: [] });
        await message.delete();
        setTimeout(() => {interaction.deleteReply()}, 10*1000)
        
        interaction.channel.send({ embeds: [logEmbed] });
    }
}