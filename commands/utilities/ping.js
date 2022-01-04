const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
// const punishments = require('../../schemas/punishments-schema');
// const warnschema = require('../../schemas/warn-schema')
const fetch = require('petitio');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong.')
		.addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	global: false,
	guilds: 'all',
	/**
	 * 
	 * @param {Discord.CommandInteraction} interaction 
	 */
	async execute(interaction) {
		const { client } = interaction;
		const ephemeral = interaction.options.getBoolean('ephemeral');
		console.log(client.ws.ping);
		await interaction.reply({ content: `Ping: \`${client.ws.ping}\`ms`, ephemeral: ephemeral });
	},
};