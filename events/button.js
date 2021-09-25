/* eslint-disable no-case-declarations */
const { MessageEmbed } = require('discord.js');
const punishmentsSchema = require('../schemas/punishments-schema');
const warnCountSchema = require('../schemas/warnCount-schema');
const breakSchema = require('../schemas/break-schema');
const votesSchema = require('../schemas/votes-schema');
const config = require('../config.json');
const { time } = require('@discordjs/builders');
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (!interaction.customId.includes('_')) return;

		const embed = new MessageEmbed();
		const oldEmbeds = interaction.message.embeds;
		const webhook = await interaction.message.fetchWebhook();
		const filter = m => m.author.id == interaction.user.id;
		const buttonIdParts = interaction.customId.split('_');
		const [label, trigger, id] = buttonIdParts;
		switch (label) {
			case 'appeal':

				const punishment = await punishmentsSchema.findOne({ punishmentId: id });
				if (!punishment) return interaction.update({ content: 'This punishment no longer exists.', embeds: [oldEmbed], components: [] });


				await interaction.reply({ content: `Provide the reason for this ${trigger == 'yes' ? 'approval. You can also provide `none`' : 'denial'}`, ephemeral: true });
				let appealReason = await interaction.channel.awaitMessages({ filter, time: 2 * 60 * 1000, max: 1 }).catch(e => { return interaction.editReply('You didn\'t answer in time. Use the button again.') })
				appealReason = appealReason.first();

				const moderator = await interaction.guild.members.fetch(punishment.author).catch(e => e);
				const punishedUser = await interaction.guild.members.fetch(punishment.user).catch(e => e);

				await webhook.editMessage(interaction.message, { content: `${trigger == 'yes' ? 'Accepted' : 'Denied'} by ${interaction.user.tag}. Reason: ${appealReason}`, embeds: oldEmbeds, components: [] });

				if (trigger == 'accept') {
					if (moderator) {
						await warnCountSchema.findOneAndUpdate({ userId: punishment.author }, {
							$inc: {
								current: -1,
								total: -1,
							},
						});
						await moderator.send('An ad warning issued by you has been removed. Reason: ' + appealReason.content);
					}
					await punishmentsSchema.findOneAndDelete({ punishmentId: id });
					// await interaction.update({ content: `Accepted by ${interaction.user.tag}. Reason: ${reason.content}`, embeds: interaction.message.embeds, components: [] });
					if (punishedUser) {
						embed.setDescription(`Your appeal for punishment with ID: \`${id}\` has been accepted\n**Reason:** ${appealReason.content}`).setColor('GREEN');
						punishedUser.send({ embeds: [embed] })
							.catch(e => e);
						await interaction.editReply('Done!');
					}

					else {
						await interaction.editReply('User is no longer in the server, but the punished has been removed.');
					}
				}
				else {
					// await webhook.editMessage(interaction.message, { content: `Denied by ${interaction.user.tag}. Reason: ${appealReason}`, embeds: interaction.message.embeds, components: [] });

					if (punishedUser) {
						embed.setDescription(`Your appeal for punishment with ID: \`${id}\` has been denied.\n**Reason:** ${appealReason}`)
							.setColor('RED');
						punishedUser.send({ embeds: [embed] })
							.catch(e => e);
						await interaction.editReply('Done!');
					}
					else {
						await interaction.editReply('The user has left the server.');
					}
				}


				break;

			case 'break':
				const member = await interaction.guild.members.fetch(id).catch(e => e);
				const breakData = await breakSchema.findOne({ user: id })
				console.log(breakData);
				if (!member) return interaction.update({ content: 'User left the server.', embeds: [oldEmbed], components: [] })

				await interaction.reply({ content: `Provide a reason for this ${trigger == 'yes' ? 'approval. You can also provide `none`' : 'denial'}`, ephemeral: true })

				let breakReason = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000, errors: ['time'] }).catch(e => { return interaction.editReply('You didn\'t answer in time. Use the button again.') })
				breakReason = breakReason.first()

				if (trigger == 'yes') {
					try {
						await breakSchema.findOneAndUpdate({ user: member.id }, {
							accepted: true,
							at: Date.now()
						})
					} catch (e) { return await interaction.editReply('Failed to update database. Try again.') }

					await member.roles.add(config.onBreakRole).catch(console.error)
					await member.setNickname(`On Break | ${member.displayName.slice(0, 21)}`)
						.catch(e => interaction.editReply('Couldn\'t update nickname.'))

					embed.setAuthor('Break Accepted')
						.setDescription(`Your break has been accepted and your break ends ${time((Date.now() + parseInt(breakData.expires) / 1000), 'R')}\nIf you feel like you can meet the quota and want to be off break, use \`r!leave\` in <#748188786386665592>`)
						.addField(`Reason`, breakReason.content)
						.setTimestamp()
						.setColor("GREEN")
					member.send({ embeds: [embed] }).catch(e => interaction.editReply('Seems the user has closed their dms.'));
				} else {

					try {
						await breakSchema.findOneAndDelete({ user: id })
					} catch (e) { interaction.editReply('Couldn\'t decline the break in the database.') }

					embed.setAuthor(`Break Denied`)
						.setDescription(`Your break request has been declined.`)
						.addField(`Reason`, breakReason.content)
						.setTimestamp()
						.setColor("RED")

					await member.send({ embeds: [embed] })
				}


				await webhook.editMessage(interaction.message, { content: `${trigger == 'yes' ? 'Accepted' : 'Denied'} by ${interaction.user.tag}. Reason: ${breakReason}`, embeds: oldEmbeds, components: [] })
				await interaction.editReply('Done.')
				await breakReason.delete()
				// await interaction.editReply()
				break;
		
			case 'votes':

				const oldUserData = await votesSchema.findOne({ userID: id })
				if (!oldUserData) return await interaction.reply(`No data found for you.`);
		
				const newToggle = (oldUserData.reminders == true) ? false : true
				await votesSchema.findOneAndUpdate({ userID: userID }, {
					reminders: newToggle
				}, { upsert: true })

				await interaction.reply(`Turned ${newToggle == true ? 'on' : 'off'} vote reminders.`)
				
			break;
			
			case 'banrequest':
				const reason = oldEmbeds[0].fields.find(e => e.name == 'Reason');
				const targetBan = await interaction.guild.members.fetch(id).catch(e => e);
				const evidence = oldEmbeds[0].fields.find(e => e.name == 'Evidence');
				let moderatorId = oldEmbeds[0].filends.find(e => e.name == 'Moderator')
				moderatorId = moderatorId.value.split('\`')[1]
				const banModerator = await interaction.guilds.members.fetch(id).catch(e => e);

				if(!targetBan)return await interaction.update({ content: 'User left the server', components: []});

				if(trigger == 'yes'){
					await targetBan.ban({ reason: `${reason} | Banned by ${interaction.user.tag}`})
					const evidenceChannel = await client.channels.cache.get(config.evidenceChannel);
					
					await evidenceChannel.send(`**User:** \`${targetBan.id}\`\n**Moderator:** \`${interaction.user.id}\`\n**Reason:** ${reason.value}\n**Evidence:**${evidence.value}`)
					await interaction.update({ content: `Accepted by ${interaction.user.tag}`, components: []})
					await banModerator?.send(`A ban requested by you for ${targetBan.id} has been accepted.`)
				} else {
					await interaction.update({ content: `Denied by ${interaction.user.tag}`, components: []})
					await banModerator?.send(`A ban requested by you for ${targetBan.id} has been denied.`)
				}	
			break;
			}
	},
};
