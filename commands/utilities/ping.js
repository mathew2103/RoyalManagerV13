const { SlashCommandBuilder } = require('@discordjs/builders');
// const punishments = require('../../schemas/punishments-schema');
// const warnschema = require('../../schemas/warn-schema')
const fetch = require('petitio');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong.')
		.addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	global: false,
	guilds: 'all',
	async execute(interaction) {

		// const resp = await fetch('https://discord.com/api/v9/guilds/746635811243556925/members/378025254125305867', "PATCH").header('Authorization', `Bot ${process.env.TOKEN}`).body({ communication_disabled_until: null }).send();
		// interaction.reply('a')
		// console.log(await resp.json())

	
		const { client } = interaction;
		const ephemeral = interaction.options.getBoolean('ephemeral');
		console.log(client.ws.ping);
		await interaction.reply({ content: `Ping: \`${client.ws.ping}\`ms`, ephemeral: ephemeral });
	},
};