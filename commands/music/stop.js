const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops playing music'),
	global: false,
	async execute(interaction) {
		await interaction.deferReply();

        const queue = interaction.client.player.getQueue(interaction.guild);
		if (!queue || !queue.playing) return interaction.followUp({ content: '❌ | No music is being played!', ephemeral: true});
        await queue.stop();
        await interaction.followUp('Stopped the player.')

	},
};