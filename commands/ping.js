const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong.')
		.addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	async execute(interaction) {
		const { client } = interaction;
		const ephemeral = interaction.options.getBoolean('ephemeral');
		console.log(client.ws.ping);
		await interaction.reply({ content: `Ping: \`${client.ws.ping}\`ms`, ephemeral: ephemeral });

	},
};