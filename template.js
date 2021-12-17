const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('steco')
		.setDescription('Staff economy'),
	permissions: [],
	global: false,
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
	async execute(interaction) {
        

	},
};