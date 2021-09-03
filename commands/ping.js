const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong.')
		.addStringOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	async execute(interaction) {
		const ephemeral = interaction.options.getBoolean('ephemeral');
		await interaction.reply({ content: 'Pong', ephemeral: ephemeral });

	},
};