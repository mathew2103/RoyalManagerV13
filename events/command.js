module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isCommand()) return console.log(interaction);
		if (!interaction.client.commands.has(interaction.commandName)) return;

		const cmd = interaction.client.commands.get(interaction.commandName)
		if (cmd.permissions) {
			// await interaction.member.permissions.remove(['BAN_MEMBERS', 'ADMINISTRATOR'])
			
			if (!Array.isArray(cmd.permissions)) cmd.permissions = [cmd.permissions]
			if (!interaction.member.permissions.has(cmd.permissions, false))return interaction.reply({ content: `You need ${interaction.member.permissions.missing(cmd.permissions, false).map(e => e.replace('_', ' ')).join(', ')} to use this command.`, ephemeral: false})
		}
		try {
			cmd.execute(interaction);
		}
		catch (error) {
			console.error(error);
			interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};