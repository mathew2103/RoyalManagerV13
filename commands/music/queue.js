const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Shows the music queue'),
	async execute(interaction) {
		await interaction.deferReply();
		const queue = interaction.client.player.getQueue(interaction.guild);

		if (!queue || !queue.playing) return interaction.followUp({ content: '❌ | No music is currently being played!' });
		const currentTrack = queue.current;
		const tracks = queue.tracks.slice(0, 10).map((m, i) => {
			return `${i + 1}. **[${m.title}](${m.url})**`;
		});

		return interaction.followUp({
			embeds: [
				{
					title: 'Server Queue',
					description: `${tracks.join('\n')}${
						queue.tracks.length > tracks.length
							? `\n...${queue.tracks.length - tracks.length === 1 ? `${queue.tracks.length - tracks.length} more track` : `${queue.tracks.length - tracks.length} more tracks`}`
							: ''
					}`,
					color: 0xff0000,
					fields: [{ name: 'Now Playing', value: `🎶 | **[${currentTrack.title}](${currentTrack.url})**` }],
				},
			],
		});
	},
};