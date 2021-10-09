/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const punishmentsSchema = require('../../schemas/punishments-schema');
const settingsSchema = require('../../schemas/settings-schema');
const reasons = [['Sending an advertisement without a description in the server advertising channels', '0'], ['Sending an advertisement which server revolves around invite rewards', '1'], ['Sending an advertisement containing a ping', '2'], ['Sending an advertisement back to back', '3'], ['Sending an advertisement in an incorrect channel', '4'], ['Sending an advertisement which description is vague and/or contains less than 20 characters', '5'], ['Advertising an NSFW server and/or advertising a server that isn\'t suitable for children', '6'], ['Sending an advertisement containing an invalid invite', '7'], ['Sending an advertisement that is not in English language', '8'], ['Sending an advertisement without a link', '9']];
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reason')
		.setDescription('Change the reason of a punishment.')
		.addStringOption((op) => op.setName('punishment_id').setDescription('The ID of the punishment.').setRequired(true))
		.addStringOption((op) => op.setName('new_reason').setDescription('The new reason that you want to change to').setRequired(true).addChoices(reasons)),
	global: false,
	guilds: '825958701487620107',
	roles: ['Mod'],
	async execute(interaction) {
		const punishmentId = interaction.options.getString('punishment_id')
		const newReason = interaction.options.getString('new_reason')

		const oldPunishment = await punishmentsSchema.findOne({ punishmentId });
		if (!oldPunishment) return interaction.reply({ content: 'No punishment found with ID: ' + punishmentId, ephemeral: true });
		if (oldPunishment.author !== interaction.user.id && !interaction.member.roles.cache.find(e => e.name.toLowerCase().includes('Head Moderator') || e.name.toLowerCase().includes('Admin') || e.name.toLowerCase().includes('Manager') || e.name.toLowerCase().includes('Bot Dev'))) return interaction.reply({ content: 'Only a head moderator or above can edit punishments made by other moderators.', ephemeral: true });

		const mainGuildData = await settingsSchema.findOne({ guildId: config.mainServer.id });
		const reason = mainGuildData.reasons[parseInt(newReason)];

		await punishmentsSchema.findOneAndUpdate({ punishmentId }, {
			reason
		})

		return interaction.reply(`Updated reason to ${reason}`);
	},
};