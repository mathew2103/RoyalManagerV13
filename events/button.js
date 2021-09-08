/* eslint-disable no-case-declarations */
const { MessageEmbed } = require('discord.js');
const punishmentsSchema = require('../schemas/punishments-schema');
const warnCountSchema = require('../schemas/warnCount-schema');
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isButton()) return;

		const embed = new MessageEmbed();

		const buttonIdParts = interaction.customId.split('_');
		const [label, trigger, id] = buttonIdParts;
		switch (label) {
		case 'appeal':

			const punishment = await punishmentsSchema.findOne({ punishmentId: id });
			if (!punishment) return interaction.update({ content: 'This punishment no longer exists.', embeds: [interaction.message.embeds[0]], components: [] });

			const filter = m => m.author.id == interaction.user.id;
			await interaction.reply({ content: 'Provide the reason for this.', ephemeral: true });
			let reason = await interaction.channel.awaitMessages({ filter, time: 2 * 60 * 1000, max: 1 });
			reason = reason.first();

			const moderator = await interaction.guild.members.fetch(punishment.author);
			const punishedUser = await interaction.guild.members.fetch(punishment.user);

			if (trigger == 'accept') {
				if (moderator) {
					await warnCountSchema.findOneAndUpdate({ userId: punishment.author }, {
						$inc: {
							current: -1,
							total: -1,
						},
					});
					await moderator.send('An ad warning issued by you has been removed. Reason: ' + reason.content);
				}
				await punishmentsSchema.findOneAndDelete({ punishmentId: id });

				if (punishedUser) {
					embed.setDescription(`Your appeal for punishment with ID: \`${id}\` has been accepted\n**Reason:** ${reason.content}`);
					punishedUser.send(embed)
						.catch(e => e);
					await interaction.editReply('Done!');
				}
				else {
					await interaction.editReply('User is no longer in the server, but I removed the punished.');
				}

				await interaction.update({ content: `Accepted by ${interaction.user.tag}. Reason: ${reason.content}`, embeds: interaction.message.embeds, components: [] });
			}
			else {
				if (punishedUser) {
					embed.setDescription(`Your appeal for punishment with ID: \`${id}\` has been denied.\n**Reason:** ${reason}**`);
					punishedUser.send(embed)
						.catch(e => e);
				}
				else {
					await interaction.editReply('The user has left the server.');
				}

				await interaction.update({ content: `Denied by ${interaction.user.tag}. Reason: ${reason}`, embeds: interaction.message.embeds, components: [] });
			}


			break;
		}
	},
};