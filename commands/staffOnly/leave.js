/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const breakSchema = require('../../schemas/break-schema')
const config = require('../../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Removes you from break.'),
    async execute(interaction) {
        interaction.deferReply();
        // if (interaction.channel.id !== '748188786386665592' && interaction.channel.id !== '749537186885402685') return interaction.reply({content: 'Use this command at <#748188786386665592> or <#749537186885402685>', ephemeral: true});
        if (!interaction.member.roles.cache.get(config.onBreakRole)) return interaction.reply(`You are already off break.`);
        const data = await breakSchema.findOne({ user: interaction.user.id });
        if (!data) return interaction.reply(`No data found for your break.`)

        try {
            await breakSchema.findOneAndDelete({ user: interaction.user.id })
        } catch (e) { return interaction.reply(`Failed to update database.`) }

        await interaction.member.roles.remove('754303021659324476');
        const oldName = interaction.member.displayName;
        const newName = oldName.split(' | ')[1];
        await interaction.member.setNickname(newName)
            .catch(e => interaction.channel.send(`Couldnt change nickname.`))


        return interaction.followUp(`You are now off break.`)
    },
};