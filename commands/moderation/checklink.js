const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
// const fetch = require('petitio');
const fetch = require('node-fetch');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('checklink')
		.setDescription('Check if a link is phishy or not')
		.addStringOption(op => op.setName('link').setDescription('The link you want info about.').setRequired(true)),
	permissions: [],
	guilds: ['all'],
	/**
	 * @param {Discord.CommandInteraction} interaction 
	 */
	async execute(interaction) {
		interaction.deferReply({ ephemeral: true });
		const link = interaction.options.getString('link')

		let res = await fetch("https://anti-fish.bitflow.dev/check", {
			method: "POST",
			body: JSON.stringify({
				message: link
			}),
			headers: {
				"Content-Type": "application/json"
			}
		})
		console.log(await JSON.stringify(res))
		// let info = await fetch("https://anti-fish.bitflow.dev/check", "POST").body({ "message": link }, 'json').header('application-name', 'royal_manager').header('User-Agent', `Royal-Manager/1.0`)

		// return console.log(await (await info.send()).body)
		// info = JSON.parse(info)
		// console.log(info) //JSON.parse(JSON.stringify(info))
		// if (info.match) return interaction.followUp('Link not found in the database')
		// else interaction.followUp('aaa')
		// const embed = new Discord.MessageEmbed()
		// 	.setAuthor('Scam Link Info')


	},
};