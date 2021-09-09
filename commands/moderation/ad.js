/* eslint-disable no-unused-vars */
const uniqid = require('uniqid');
// const warnSchema = require('../../schemas/warn-schema');
// const warnSchema = require('../../schemas/warn-schema');
const punishmentSchema = require('../../schemas/punishments-schema');
const settingsSchema = require('../../schemas/settings-schema');
const warnCountSchema = require('../../schemas/warnCount-schema');
const coinsSchema = require('../../schemas/coins-schema');
const Discord = require('discord.js');
// const config = require('config')
const config = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

const reasons = [['Sending an advertisement without a description in the server advertising channels', '0'], ['Sending an advertisement which server revolves around invite rewards', '1'], ['Sending an advertisement containing a ping', '2'], ['Sending an advertisement back to back', '3'], ['Sending an advertisement in an incorrect channel', '4'], ['Sending an advertisement which description is vague and/or contains less than 20 characters', '5'], ['Advertising an NSFW server and/or advertising a server that isn\'t suitable for children', '6'], ['Sending an advertisement containing an invalid invite', '7'], ['Sending an advertisement that is not in English language', '8'], ['Sending an advertisement without a link', '9']];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ad')
		.setDescription('Ad warns a user.')
		.addUserOption((op) => op.setName('member').setDescription('The user whom you want to warn.').setRequired(true))
		.addChannelOption((op) => op.setName('channel').setDescription('The channel you found the advertisement in.').setRequired(true))
		.addStringOption((op) => op.setName('reason').setDescription('The reason for which you want to warn the user.').setRequired(true)
			.addChoices(reasons))
		.addChannelOption((op) => op.setName('belongs_to').setDescription('The channel that the advertisement belongs to.').setRequired(false)),
	permissions: [
		{
			id: '834680586970071121',
			type: 'ROLE',
			permission: true,
		},
	],
	// name: 'ad',
	// description: 'Ad warns a user.',
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const targetMember = interaction.options.getMember('member');
		const adDeletedIn = interaction.options.getChannel('channel');
		const reasonString = interaction.options.getString('reason');
		let belongstoChannel = interaction.options.getChannel('belongs_to');

		// if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) return await interaction.editReply('You cannot warn a member having a role higher than or equal to you.');

		const mainGuildData = await settingsSchema.findOne({ guildId: config.mainServer.id });
		const reason = mainGuildData.reasons[parseInt(reasonString)];

		const adWarnTemplate = mainGuildData.modMsg;
		const adWarnChannel = interaction.guild.channels.cache.get('826045281824931882') ?? interaction.guild.channels.cache.get('758725733840846858');
		// const oldWarns = await warnSchema.findOne({ guildId: interaction.guild.id, userId: targetMember.id });
		const oldWarns = await punishmentSchema.find({ user: targetMember.id });
		if (oldWarns?.length) {
			const oldwarn = oldWarns[oldWarns.length - 1];
			if (oldwarn?.at
				&& ((Date.now() - oldwarn.at) < 7.2e+6)) return await interaction.editReply(`This user was warned <t:${(oldwarn.at / 1000).toString().split('.')[0]}:R>, so you can't warn the user again.`);
		}

		if (adDeletedIn.id == '699319697706975262' && reason.includes('incorrect')) return await interaction.editReply('You cannot have reason as `incorrect` if the channel is <#699319697706975262>');

		if (reason.includes('incorrect') && !belongstoChannel) return await interaction.editReply('You must provide a `belongs-to` channel for the `incorrect` reason.');

		if (!reason.includes('incorrect') && belongstoChannel) belongstoChannel = undefined;

		const punishmentId = uniqid();
		let warningData = new Object();
		if (belongstoChannel) {
			warningData = {
				guild: interaction.guild.id,
				user: targetMember.id,
				author: interaction.member.id,
				at: Date.now(),
				punishmentId,
				channel: adDeletedIn.id,
				appealed: false,
				belongsto: belongstoChannel.id,
				reason,
			};
		}
		else {
			warningData = {
				guild: interaction.guild.id,
				user: targetMember.id,
				author: interaction.member.id,
				at: Date.now(),
				punishmentId,
				channel: adDeletedIn.id,
				appealed: false,
				reason,
			};
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

		const newTargetData = await punishmentSchema.find({ user: targetMember.id });
		// const newTargetData = await warnSchema.findOne({ guildId: interaction.guild.id, userId: targetMember.id });

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
			.setDescription(adWarnTemplate.replace('{member}', targetMember).replace('{reason}', reason).replace('{wc}', newTargetData.length).replace('{channel}', adDeletedIn))
			.setFooter(`Warning ID: ${punishmentId}`)
			.setTimestamp();
		if (belongstoChannel?.id) adWarnEmbed.addField('Your advertisment belongs to', belongstoChannel);

		try {
			const webhooks = await adWarnChannel.fetchWebhooks();
			let webhook = webhooks.first();

			if (!webhook) {
				webhook = await adWarnChannel.createWebhook('Royal Ad Moderation', {
					avatar: interaction.client.user.displayAvatarURL(),
				});
			}

			await webhook.send({ content: `${targetMember}`, embeds: [adWarnEmbed] });


		}
		catch (e) {
			console.error(e);
			return interaction.editReply(`Couldn't send message in ${adWarnChannel}`);
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

		await interaction.editReply({ embeds: [adWarnEmbed.setFooter(`You received ${amountEarned} coins.	`)] });
		if (newTargetData.length > 1) {
			const cmd = await interaction.channel.send(`\`?${newTargetData.length < 7 ? newTargetData.length : '6'}aw ${targetMember.id}\``);
			setTimeout(() => {
				cmd.delete();
			}, 10 * 1000);
		}

		interaction.channel.send({ embeds: [logEmbed] });
	},
};
