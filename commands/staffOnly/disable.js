const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
// const config = require('../../config.json')
const fs = require('fs')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('disable')
		.setDescription('Disables the scam filter'),
		// .addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	roles: ['Mod'],
	guilds: "all",
	async execute(interaction) {
        let config = JSON.parse(fs.readFileSync('../../config.json', 'utf-8'));
		// config.automod.scams = false;
        config.automod.scams = false;
        fs.writeFileSync('../../config.json', JSON.stringify(config))
        interaction.reply('Disabled scams filter.')
	},
};