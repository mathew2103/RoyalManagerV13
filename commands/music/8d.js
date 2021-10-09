const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8d')
		.setDescription('Toggles 8D mode')
		.addBooleanOption((op) => op.setName('toggle').setDescription('The toggle to set || True - On | False - Off').setRequired(true)),
	permissions: [],
	global: false,
	async execute(interaction) {
        const queue = interaction.client.player.getQueue(interaction.guild);
        const toggle = interaction.options.getBoolean('toggle')

        queue.setFilters({ "8D": toggle })
        interaction.reply(`Turned ${toggle ? 'on' : 'off'} 8D mode`)
	},
};