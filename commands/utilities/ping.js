const { SlashCommandBuilder } = require('@discordjs/builders');
// const punishments = require('../../schemas/punishments-schema');
// const warnschema = require('../../schemas/warn-schema')
const fetch = require('node-fetch');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong.')
		.addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	global: false,
	guilds: 'all',
	async execute(interaction) {
		const resp = await fetch('https://discord.com/api/v9/guilds/825958701487620107/members/693773855730302999', {
			method: 'PATCH',
			headers: {
				'Authorization': `Bot ${process.env.TOKEN}`
			},
			body: JSON.stringify({
				communication_disabled_until: '2021-11-26T23:42:11.390000+00:00'
			})
		})
		interaction.reply('a')
		console.log(await resp.json())

		// !eval const fetch = require('node-fetch');fetch('https://discord.com/api/v9/guilds/825958701487620107/members/378025254125305867', { method: 'PATCH', headers: {'Authorization': 'Bot ODE0ODQ1MDE0MDA5MDUzMjE0.YDjxjg.jyji4Ty5vjY44MN3Kd6S5Sn_U6U'}, body: JSON.stringify({communication_disabled_until: "2021-11-24T04:11:09.43"})}).then(a => console.log(a))
		/*
		const { client } = interaction;
		const ephemeral = interaction.options.getBoolean('ephemeral');
		console.log(client.ws.ping);
		await interaction.reply({ content: `Ping: \`${client.ws.ping}\`ms`, ephemeral: ephemeral });
*/
	},
};