module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isCommand()) return console.log(interaction);
		if (!interaction.client.commands.has(interaction.commandName)) return;

		const cmd = interaction.client.commands.get(interaction.commandName)
		if (cmd.permissions) {			
			if (!Array.isArray(cmd.permissions)) cmd.permissions = [cmd.permissions]
			if (!interaction.member.permissions.has(cmd.permissions))return interaction.reply({ content: `You need ${interaction.member.permissions.missing(cmd.permissions).map(e => `\`${e.replace('_', ' ')}\``).join(', ')} to use this command.`, ephemeral: false})
		}
		if (cmd.roles?.length) {
			if(!interaction.member.roles.cache.some(role => cmd.roles.includes(role.name.toLowerCase()) || cmd.roles.find(e => role.name.toLowerCase().includes(e.toLowerCase()))))return interaction.reply({ content: `You need to have at least one role with the name ${cmd.roles.map(e => e).join(' OR ')}`, ephemeral: true})
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