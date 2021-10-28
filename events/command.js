module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isCommand()) return;
		if (!interaction.client.commands.has(interaction.commandName)) return interaction.reply('No such cmd found.. *weird*');

		const cmd = interaction.client.commands.get(interaction.commandName)
		// const bypassRoles = ['bot dev', 'server manager', 'administrator'] //bypassRoles.includes(role.name.toLowerCase())
		const bypassRegex = /(admin|manager|bot dev)/mi
		if(interaction.guild && !interaction.member.roles.cache.some(role => role.name.match(bypassRegex))){
			if (cmd.permissions) {			
				if (!Array.isArray(cmd.permissions)) cmd.permissions = [cmd.permissions]
				if (!interaction.member.permissions.has(cmd.permissions))return interaction.reply({ content: `You need ${interaction.member.permissions.missing(cmd.permissions).map(e => `\`${e.replace('_', ' ')}\``).join(', ')} to use this command.`, ephemeral: false})
			}
			if (cmd.roles?.length) {
				console.time('roles')
				const rolesMapped = cmd.roles.join('|')
				const requiredRegex = new RegExp(`(admin|manager|bot dev|${rolesMapped})`, 'mi')
				
				if(!interaction.member.roles.cache.some(role => role.name.match(requiredRegex)))return interaction.reply({ content: `You need to have at least one role with the name ${cmd.roles.map(e => e).join(' OR ')}`, ephemeral: true})
				

				// if(!interaction.member.roles.cache.some(role => cmd.roles.includes(role.name.toLowerCase()) || cmd.roles.find(e => role.name.toLowerCase().includes(e.toLowerCase()))))return interaction.reply({ content: `You need to have at least one role with the name ${cmd.roles.map(e => e).join(' OR ')}`, ephemeral: true})
				console.timeEnd('roles')
			}
		}
		

		try {
			await cmd.execute(interaction);
		}
		catch (error) {
			console.error(error);
			interaction.channel.send({ content: `Error while executing the command.. \n\`${error.message}\`\n\n${cmd.errorMsg || "Please report this to Menin#4642 as soon as possible"}` });
		}
	},
};