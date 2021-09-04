/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('')
		.setDescription(''),
		// .addStringOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	async execute(interaction) {
		

	},
};