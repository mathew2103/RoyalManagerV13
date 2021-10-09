const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Shows/Changes the loop mode')
        .addStringOption(op => op.setName('mode').setDescription('The loop mode to turn on').addChoices([['off', '0'], ['track', '1'], ['queue', '2'], ['autoplay', '3']])),
		// .addStringOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	global: false,
	async execute(interaction) {
		await interaction.deferReply();

        const queue = interaction.client.player.getQueue(interaction.guild);
		if (!queue || !queue.playing) return interaction.followUp({ content: '❌ | No music is being played!', ephemeral: true});
        const mode = interaction.options.getString('mode')
        const modes = ['off', 'track', 'queue', 'autoplay']

        if(!mode)return interaction.followUp({ content: `The current loop mode is set to \`${modes[Number(queue.repeatMode)]}\``, ephemeral: true})
        
        queue.setRepeatMode(Number(mode))

        await interaction.followUp(`Loop mode set to \`${modes[Number(mode)]}\``)
	},
};