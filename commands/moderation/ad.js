/* eslint-disable no-unused-vars */
const uniqid = require('uniqid');
const punishmentSchema = require('../../schemas/punishments-schema');
const settingsSchema = require('../../schemas/settings-schema');
const warnCountSchema = require('../../schemas/warnCount-schema');
const coinsSchema = require('../../schemas/coins-schema');
const Discord = require('discord.js');
const config = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../structures/utils');
const utilities = require('util');

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
	global: false,
	guilds: ['825958701487620107', config.mainServer.id],
	roles: ['Mod'],
	/**
	 * 
	 * @param {Discord.CommandInteraction} interaction 
	 */
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const { client } = interaction;
		const targetMember = await interaction.options.getMember('member');
		const adDeletedIn = interaction.options.getChannel('channel');
		const reasonString = interaction.options.getString('reason');
		let belongstoChannel = interaction.options.getChannel('belongs_to');

		if (!targetMember) return interaction.followUp({ content: 'Couldnt find a target member..', ephemeral: true })

		const adCats = ['649269707135909888', '880482008931905598', '594392827627044865', '594509117524017162']
		if (!adCats.includes(adDeletedIn.parentId) || adDeletedIn.type !== 'GUILD_TEXT') return interaction.followUp({ content: `You can only moderate ads in text channels of the following categories: ${adCats.map(e => `<#${e}>`).join(', ')}`, ephemeral: true })
		if (targetMember.roles.highest.position >= interaction.member.roles?.highest.position) return await interaction.followUp({ content: 'You cannot warn a member having a role higher than or equal to you.', ephemeral: true });

		const mainGuildData = await settingsSchema.findOne({ guildId: config.mainServer.id });
		const reason = mainGuildData.reasons[parseInt(reasonString)];

		const adWarnTemplate = mainGuildData.modMsg;
		const adWarnChannel = interaction.guild.channels.cache.get('826045281824931882') ?? interaction.guild.channels.cache.get('758725733840846858');

		const oldWarns = await punishmentSchema.find({ user: targetMember.id, guild: interaction.guild.id });
		if (oldWarns?.length) {
			const oldwarn = oldWarns[oldWarns.length - 1];
			if (oldwarn?.at
				&& ((Date.now() - oldwarn.at) < 7.2e+6)) return await interaction.followUp({ content: `This user was warned <t:${(oldwarn.at / 1000).toString().split('.')[0]}:R>, so you can't warn the user again.`, ephemeral: true });
		}

		if (adDeletedIn.id == '699319697706975262' && reason.includes('incorrect')) return await interaction.followUp({ content: 'You cannot have reason as `incorrect` if the channel is <#699319697706975262>', ephemeral: true });

		if (reason.includes('incorrect') && !belongstoChannel) return await interaction.followUp({ content: 'You must provide a `belongs-to` channel for the `incorrect` reason.', ephemeral: true });

		if (!reason.includes('incorrect') && belongstoChannel) belongstoChannel = undefined;

		const punishmentId = uniqid();
		let warningData = {
			guild: interaction.guild.id,
			user: targetMember.id,
			author: interaction.member.id,
			at: Date.now(),
			punishmentId,
			channel: adDeletedIn.id,
			appealed: false,
			reason,
		};
		if (belongstoChannel) warningData.belongsto = belongstoChannel.id;

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


		autoTimeout(targetMember, newTargetData.length);
		const bal = await giveCoins(interaction.member);
		await sendEmbeds(bal);


		/**
		 * 
		 * @param {Number} num 
		 * @returns {String} color
		 */
		function colorFromNum(num) {
			if (num <= 2) return 'GREEN';
			else if (num <= 4) return 'YELLOW';
			else return "RED";
		}

		/**
		 * 
		 * @param {Discord.GuildMember} member 
		 * @param {Number} warnCount 
		 */
		function autoTimeout(member, warnCount) {

			const timeoutEmbed = new Discord.MessageEmbed()
				.setAuthor('You have been timed out')
				.setTimestamp();
			switch (warnCount) {
				case 2:
					interaction.followUp({ content: `?2aw ${member.id}`, ephemeral: true })
					// member.timeout(1, `Accumalating ${warnCount} ad warnings`);
					break;
				case 3:
					member.send({ embeds: [timeoutEmbed.setDescription(`You have been timed out in Royal Advertising till <t:${Math.round((Date.now() + 21600000) / 1000)}>\nYour mute expires <t:${Math.round((Date.now() + 21600000) / 1000)}:R>\n\n**Reason:** Accumalating ${warnCount} ad warnings`)] }).catch(() => { });
					member.timeout(21600000, `Accumalating ${warnCount} ad warnings`);

					interaction.followUp({ content: `${member.toString()} has been muted until <t:${Math.round((Date.now() + 21600000) / 1000)}:T>`, ephemeral: true })
					break;
				case 4:
					member.send({ embeds: [timeoutEmbed.setDescription(`You have been timed out in Royal Advertising till <t:${Math.round((Date.now() + 28800000) / 1000)}>\nYour mute expires <t:${Math.round((Date.now() + 28800000) / 1000)}:R>\n\n**Reason:** Accumalating ${warnCount} ad warnings`)] })
						.catch(() => { });
					member.timeout(28800000, `Accumalating ${warnCount} ad warnings`);

					interaction.followUp({ content: `${member.toString()} has been muted until <t:${Math.round((Date.now() + 28800000) / 1000)}:T>`, ephemeral: true })
					break;
				case 5:
					member.send({ embeds: [timeoutEmbed.setDescription(`You have been timed out in Royal Advertising till <t:${Math.round((Date.now() + 259200000) / 1000)}>\nYour mute expires <t:${Math.round((Date.now() + 259200000) / 1000)}:R>\n\n**Reason:** Accumalating ${warnCount} ad warnings`)] })
						.catch(() => { });
					member.timeout(259200000, `Accumalating ${warnCount} ad warnings`);

					interaction.followUp({ content: `${member.toString()} has been muted until <t:${Math.round((Date.now() + 259200000) / 1000)}:T>`, ephemeral: true })
					break;
				case 6:
					if (member.roles.cache.has(config.mainServer.TModRole)) interaction.followUp({ content: `/banrequest member:${member.toString()} reason:6aw`, ephemeral: true });
					else interaction.followUp({ content: `?6aw ${member.id}`, ephemeral: true });

					break;
			}

			// member.timeout()
		}

		/**
		 * 
		 * @param {Discord.GuildMember} member The staff member you want to give coins to
		 */
		async function giveCoins(member) {
			const oldData = await coinsSchema.findOne({ userID: interaction.user.id });

			if (oldData?.cooldownTill >= Date.now()) return;
			let amountOfCoins = utils.randomBetween(50, 75);

			await coinsSchema.findOneAndUpdate({ userID: interaction.user.id }, {
				userID: interaction.user.id,
				$inc: {
					balance: amountOfCoins,
					last24hrs: (oldData.last24hrs + amountOfCoins) >= 500 ? -oldData.last24hrs : amountOfCoins
				},
				cooldownTill: (oldData.last24hrs + amountOfCoins) >= 500 ? Date.now() + 8.64e+7 : 0
			})

			amountOfCoins > 0 ? utils.log(client, `${member.user.tag} +${amountOfCoins}`, 'EARN') : utils.log(client, `${member.tag} On cooldown`, 'EARN');

			return oldData.balance + amountOfCoins;
			// if (oldData?.cooldownTill && oldData.cooldownTill >= Date.now()) amountOfCoins = 0;
			// if (amountOfCoins > 0) {
			// 	await coinsSchema.findOneAndUpdate({ userID: interaction.user.id }, {
			// 		userID: interaction.user.id,
			// 		$inc: {
			// 			balance: amountOfCoins,
			// 			last24hrs: amountOfCoins
			// 		}
			// 	}, { upsert: true })

			// 	if ((oldData?.last24hrs + amountOfCoins) >= 500) {
			// 		await coinsSchema.findOneAndUpdate({ userID: interaction.user.id }, {
			// 			cooldownTill: Date.now() + 8.64e+7,
			// 			last24hrs: 0
			// 		}, { upsert: true })
			// 	}
			// }
		}

		/**
		 * 
		 * @param {Number} balance 
		 */
		async function sendEmbeds(balance) {


			const adWarnEmbed = new Discord.MessageEmbed()
				.setAuthor({ name: 'Ad Warning' })
				.setDescription(adWarnTemplate.replace('{member}', targetMember).replace('{reason}', reason).replace('{wc}', newTargetData.length).replace('{channel}', adDeletedIn))
				.setFooter(`Warning ID: ${punishmentId}`, targetMember.user.displayAvatarURL())
				.setColor(colorFromNum(newTargetData.length))
				.setTimestamp();
			if (belongstoChannel) adWarnEmbed.addField('Your advertisment belongs to', belongstoChannel.toString());


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
				return interaction.followUp({ content: `Couldn't send message in ${adWarnChannel}`, ephemeral: true });
			}

			await interaction.followUp({ embeds: [adWarnEmbed.setFooter(`Balance: ${balance}`)], ephemeral: true });

			const dmEmbed = new Discord.MessageEmbed()
				.setAuthor({ name: 'Ad Warning' })
				.setDescription(`Your ad has been deleted in ${adDeletedIn}.\n**Reason:** ${reason}\nNow you have ${newTargetData.length} ad warning${(newTargetData.length > 1) ? 's' : ''}\nIf you think that this is a mistake or if you want to appeal this punishment, use \`r!appeal ${punishmentId}\` in <#678181401157304321> or in this DM to appeal.`)
				.setColor(colorFromNum(newTargetData.length))
				.setFooter('Warning ID:' + punishmentId);

			await targetMember.send(dmEmbed).catch(() => { });;


			const logEmbed = new Discord.MessageEmbed()
				.setAuthor({ name: 'Warning Issued', iconURL: targetMember.user.displayAvatarURL() })
				.setColor('RED')
				.setTimestamp()
				.setThumbnail(targetMember.user.displayAvatarURL())
				.setFooter(`Moderator Tag: ${interaction.member.user.tag}`, interaction.member.user.displayAvatarURL())
				.addFields(
					{ name: 'User', value: `${targetMember}\n\`${targetMember.id}\``, inline: true },
					{ name: 'Moderator', value: `${interaction.member}\n\`${interaction.member.id}\``, inline: true },
					{ name: 'Punishment ID', value: `\`${punishmentId}\``, inline: true },
					{ name: 'Reason', value: reason, inline: true },
				);

			await utils.log(interaction.client, logEmbed, 'STAFF')
		}
	},
};
