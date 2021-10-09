/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const breakSchema = require('../../schemas/break-schema');
const ms = require('ms')
const config = require('../../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('break')
		.setDescription('Request a break.')
		.addStringOption((op) => op.setName('duration').setDescription('The duration for which you need this break. (Min: 2 days)').setRequired(true))
		.addStringOption((op) => op.setName('reason').setDescription('The reason for your break.').setRequired(true)),
	global: false,
	guilds: ['825958701487620107'],
	async execute(interaction) {
		const duration = interaction.options.getString('duration');
		const reason = interaction.options.getString('reason');

		if (interaction.member.roles.cache.get(config.onBreakRole)) return interaction.reply({ content: 'You are already on break.', ephemeral: true })


		if (await breakSchema.findOne({ user: interaction.user.id })) return interaction.reply({ content: 'You have already requested a break.', ephemeral: true })

		const time = ms(duration); //matter of fact, im gonna remove the unknown option
    
		if (!time) return interaction.reply({ content: 'You can only specify a duration such as `3d` for 3 days or use `unknown`.', ephemeral:true})

        if(time <= ms('2d')) return interaction.reply({content: 'You dont need to request a break for less than 2 days.', ephemeral: true}) //COPY PASTA LOL

		const embed = new Discord.MessageEmbed()
			 .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
			 .addField(`Duration`, duration, true)
			 .addField(`User ID`, `\`${interaction.user.id}\``, true)
			 .addField(`Reason`, reason, true)
			 .setTimestamp()
			 .setColor("YELLOW")

        try {
			const breakData = await new breakSchema({
				user: interaction.user.id,
				reason,
				expires: time,
				at: Date.now(),
				accepted: false
			})
			breakData.save()
            // await breakSchema.findOneAndUpdate({ user: interaction.user.id }, {
            //     reason,
            //     expires: time,
            //     at: Date.now(),
            //     user: msg.author.id,
            //     accepted: false
            // }, { upsert: true, new: true })
        } catch (e) { return interaction.reply(`Failed to update database.`) }

        const yesButton = new Discord.MessageButton()
        .setCustomId(`break_yes_${interaction.user.id}`)
        .setLabel('Accept')
        .setStyle('SUCCESS')
        
        const noButton = new Discord.MessageButton()
        .setCustomId(`break_no_${interaction.user.id}`)
        .setLabel('Deny')
        .setStyle('DANGER')

        const row = new Discord.MessageActionRow()
        .addComponents([yesButton, noButton])

		const breakChannel = await interaction.guild.channels.cache.get(config.breakRequestChannel) || interaction.channel
		const webhooks = await breakChannel.fetchWebhooks()
		let webhook = webhooks.first()
		if (!webhook) {
			webhook = await breakChannel.createWebhook(msg.guild.name, {
				avatar: msg.guild.iconURL()
			})
		}
		
		await webhook.send({ content: '@here', embeds: [embed], components: [row] })
        // await breakChannel.send({ content: '@here', embeds: [embed], components: [row] })

        interaction.reply({ content: 'Your break has been requested. You will receive a DM soon about the status of your break request.', ephemeral: true})
	},
};