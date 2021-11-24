const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { CommandInteraction } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('steco')
		.setDescription('Staff economy'),
	permissions: [],
	global: false,
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
	async execute(interaction) {
        

	},
};