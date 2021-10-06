const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips a song from the track'),
	async execute(interaction) {
		await interaction.deferReply();

		const queue = interaction.client.player.getQueue(interaction.guild);
		console.log(queue)
		if (!queue || !queue.playing) return interaction.followUp({ content: '❌ | No music is being played!' });

		if(!interaction.member.voice?.channelId || interaction.member.voice.channelId !== interaction.guild.me.voice.channelId)return interaction.followUp({ content: 'You need to be in the same voice channel as me.', ephemeral: true });

		const currentTrack = queue.current;
		const success = queue.skip();
        const embed = new MessageEmbed()
        .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL())

        if(success)embed.setDescription(`✅ | Skipped **${currentTrack}**!`).setColor('GREEN')
        else embed.setDescription('❌ | Something went wrong!').setColor("RED")

		return interaction.followUp({
			embeds: [embed],
		});
	},
};