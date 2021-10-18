const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('')
		.setDescription(''),
		// .addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	permissions: [],
	global: false,
	async execute(interaction) {
		

	},
};