const Discord = require('discord.js');
// const warnSchema = require('../../schemas/warn-schema'); Instead of this, i can do the 4th line
const DjsBuilder = require('@discordjs/builders');
const warnSchema = require('../../schemas/warn-schema');
module.exports = {
	data: new DjsBuilder.SlashCommandBuilder()
		.setName('warnings')
		.setDescription('Check the warnings of a user.')
		.addUserOption((option) => option.setName('user').setDescription('The user whose warnings you would like to see.'))
		.addBooleanOption((option) => option.setName('ephemeral').setDescription('Should the reply be shown only to you?')),
	async execute(interaction) {
		const ephemeral = interaction.options.get('ephemeral');
		await interaction.deferReply({ ephemeral: ephemeral });
		let target = interaction.options.getUser('user') ?? interaction.member.user;
		const moderator = interaction.member?.permissions.has('MANAGE_MESSAGES');
		if (moderator == false) target = interaction.member.user;

		console.log(target.username);

		const embed = new Discord.MessageEmbed()
			.setAuthor(target.username, target.displayAvatarURL())
			.setTimestamp();

		const warningData = await warnSchema.findOne({ guildId: process.env.MAIN_GUILD, userId: target.id });
		const desc = warningData?.warnings?.map(e => {
			const mod = interaction.client.users.cache.get(e.author);
			const st = `**ID:** \`${e.punishmentId}\`\n**Moderator:** ${(moderator == false) ? 'Anonymous#0001' : `${mod?.tag ?? 'Unknown'} \`${e.author}\``}\n**Reason:** ${e.reason}\n**Issued At:** <t:${(e.at / 1000).toString().split('.')[0]}> | <t:${(e.at / 1000).toString().split('.')[0]}:R>`;
			return st;
		}).join('\n\n') ?? 'No Warnings found.';

		embed.setDescription(desc);
		interaction.editReply({ embeds: [embed] });
	},
};