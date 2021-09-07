const { SlashCommandBuilder } = require('@discordjs/builders');
// const punishments = require('../schemas/punishments-schema');
// const warnschema = require('../schemas/warn-schema')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong.')
		.addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
	async execute(interaction) {
		// await interaction.deferReply({ ephemeral: true });
		// const allData = await warnschema.find({});
		// for (const data of allData) {
		// 	if (!data.warnings) continue;

		// 	for (const warning of data.warnings) {
		// 		const warn = await new punishments({
		// 			guild: data.guildId,
		// 			user: data.userId,
		// 			author: warning.author,
		// 			at: warning.at,
		// 			punishmentId: warning.punishmentId,
		// 			channel: warning.channel,
		// 			belongsto: warning.belongsto,
		// 			reason: warning.reason,
		// 			appealed: warning.appealed
		// 		})
		// 		await warn.save();
		// 		console.log(warn)
		// 	}
		// }

		// await interaction.editReply('ok done.')

		const { client } = interaction;
		const ephemeral = interaction.options.getBoolean('ephemeral');
		console.log(client.ws.ping);
		await interaction.reply({ content: `Ping: \`${client.ws.ping}\`ms`, ephemeral: ephemeral });

	},
};