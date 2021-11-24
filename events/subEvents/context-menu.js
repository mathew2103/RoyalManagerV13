const { MessageActionRow, MessageSelectMenu, ContextMenuInteraction } = require('discord.js');
const Discord = require('discord.js')
const punishmentSchema = require('../../schemas/punishments-schema');
const settingsSchema = require('../../schemas/settings-schema');
const warnCountSchema = require('../../schemas/warnCount-schema');
const coinsSchema = require('../../schemas/coins-schema');
const config = require('../../config.json');
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
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     * @returns 
     */
    async execute(interaction) {
        if (!interaction.isContextMenu()) return;
        await interaction.deferReply({ephemeral: true});
        const bypassRegex = /(mod|admin|server manager|bot dev)/mi
        if(!interaction.member.roles.cache.some(role => role.name.match(bypassRegex)))return interaction.followUp({ content: 'You are not supposed to be using this.', ephemeral: true})
        // if (!interaction.member.roles.cache.some(role => role.name.includes('Mod') || role.name.includes('Admin') || role.name.includes('Manager') || role.name.includes('Bot Dev')))return interaction.followUp({ content: 'You are not supposed to be using this.', ephemeral: true})

        let message = interaction.options.getMessage('message');
        message = await message.fetch()
        const targetMember = await interaction.guild.members.fetch(message.author.id).catch(e => e)

        if(!targetMember)return interaction.followUp({ content: 'Looks like the member either left or is a webhook message.', ephemeral: true});
        
        const adDeletedIn = message.channel;
        
        const adCats = ['649269707135909888', '880482008931905598', '594392827627044865', '594509117524017162']
        
        if(!adCats.includes(adDeletedIn.parentId))return interaction.followUp({ content: `You can only moderate ads in the following categories: ${adCats.map(e => `<#${e}>`).join(', ')}`, ephemeral: true })
        
        if (targetMember.roles?.highest.position >= interaction.member.roles?.highest.position) return await interaction.editReply('You cannot warn a member having a role higher than or equal to you.');

        const oldWarns = await punishmentSchema.find({ user: targetMember.id, guild:interaction.guild.id });
        if (oldWarns?.length) {
            const oldwarn = oldWarns[oldWarns.length - 1];
            if (oldwarn?.at
                && ((Date.now() - oldwarn.at) < 7.2e+6)) {
                await message.delete();
                await interaction.followUp({ content: `This user was warned <t:${(oldwarn.at / 1000).toString().split('.')[0]}:R>, so you can't warn the user again. But I have deleted the message.`, ephemeral: true });
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

        await interaction.followUp({ content: 'Choose a reason for this warn:', components: [row], ephemeral: true })
        // const reply = await interaction.fetchReply();

        let reasonID = await interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 2*60*1000})
        .catch(async e => { return await interaction.editReply({ content: 'Looks like you didnt choose in time.', components: [] }) })
        // let reasonID = await reply.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 5 * 1000 })
            
        if(!reasonID?.values)return;
        reasonID = reasonID.values[0]

        const mainGuildData = await settingsSchema.findOne({ guildId: config.mainServer.id });
        const adWarnTemplate = mainGuildData.modMsg;
        const adWarnChannel = interaction.guild.channels.cache.get('826045281824931882') || interaction.guild.channels.cache.get('758725733840846858') || interaction.channel;

        const reason = mainGuildData.reasons[Number(reasonID)];
        const punishmentId = uniqid();
        let belongsto = null;
        const staffCmds = interaction.guild.channels.cache.get('749618873552207872') || interaction.channel
        
        if (reason.includes('incorrect')) {
            
            const qI = await staffCmds.send(`${interaction.member.toString()}, mention the channel where the ad belongs to. (Basically the channel where the ad can go)`);
            const msgFilter = m => m.author.id == interaction.user.id && m.mentions.channels?.first()

            belongsto = await staffCmds.awaitMessages({ filter: msgFilter, time: 5 * 60 * 1000, max: 1 })
                .catch(e => { return staffCmds.send('You didn\'t respond in time.') })
            await qI.delete()
            await belongsto.first().delete()
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
        }, {upsert: true});

        const newTargetData = await punishmentSchema.find({ user: targetMember.id, guild: interaction.guild.id });

        const randomBetween = (min, max) => {
            return Math.round(Math.random() * (max - min) + min);
        };
        // const amountEarned = randomBetween(50, 75);
        let amountOfCoins = randomBetween(50, 75)
        const oldData = await coinsSchema.findOne({ userID: interaction.user.id })
        if(oldData && oldData.cooldownTill && oldData.cooldownTill >= Date.now())amountOfCoins = 0;
        if(amountOfCoins > 0){
            await coinsSchema.findOneAndUpdate({ userID: interaction.user.id }, {
                userID: interaction.user.id,
                $inc: {
                    balance: amountOfCoins,
                    last24hrs: amountOfCoins
                }
            }, { upsert: true })

            if((oldData?.last24hrs + amountOfCoins) >= 500){
                await coinsSchema.findOneAndUpdate({ userID: interaction.user.id }, {
                    cooldownTill: Date.now() + 8.64e+7,
                    last24hrs: 0
                }, { upsert: true })
            }
        }
        // await coinsSchema.findOneAndUpdate({ userID: interaction.member.id }, {
        //     userID: interaction.member.id,
        //     $inc: {
        //         balance: amountEarned,
        //     },
        // });

        const adWarnEmbed = new Discord.MessageEmbed()
            .setAuthor('Ad Warning')
            .setDescription(adWarnTemplate.replace('{member}', targetMember.toString()).replace('{reason}', reason).replace('{wc}', newTargetData.length).replace('{channel}', adDeletedIn.toString()))
            .setFooter(`Warning ID: ${punishmentId}`)
            .setTimestamp()
            .setColor(colorFromNum(newTargetData.length));
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
            .setDescription(`Your ad has been deleted in ${adDeletedIn}.\n**Reason:** ${reason}\nNow you have ${newTargetData.length} ad warning${(newTargetData.length > 1) ? 's' : ''}\nIf you think that this is a mistake or if you want to appeal this punishment, use \`/appeal ${punishmentId}\` in <#678181401157304321> or in this DM to appeal.`)
            .setFooter('Warning ID:' + punishmentId)
            .setColor(colorFromNum(newTargetData.length))
            

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
        // setTimeout(() => {interaction.deleteReply()}, 10*1000)
        
        interaction.channel.send({ embeds: [logEmbed] });

        function colorFromNum(num) {
            if(num <= 2)return 'GREEN';
            else if(num <= 4)return 'YELLOW';
            else return "RED";
        }
    }
}