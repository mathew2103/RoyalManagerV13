module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		if (!interaction.isCommand()) return console.log(interaction);
		if (!interaction.client.commands.has(interaction.commandName)) return;

		try {
			interaction.client.commands.get(interaction.commandName).execute(interaction);
		}
		catch (error) {
			console.error(error);
			interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};