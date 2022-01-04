const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reboot')
        .setDescription('Reboots the bot'),
    permissions: [],
    guilds: 'all',
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(interaction) {

        if (!config.owners.includes(interaction.user.id)) return interaction.reply({ content: 'You cannot use this command.', ephemeral: true });

        await interaction.reply('Rebooting...');
        config.rebootChannel = interaction.channelId;
        fs.writeFileSync('config.json', JSON.stringify(config));
        interaction.client.destroy();
        process.exit();
    },
};