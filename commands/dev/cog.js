const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const fs = require('fs')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cog')
        .setDescription('Enable/Disable commands')
        .addStringOption(op => op.setName('action').setDescription('The action to undertake on the cmd').addChoice('Enable', 'enable').addChoice('Disable', 'disable').addChoice('List', 'list').setRequired(true))
        .addStringOption(op => op.setName('command').setDescription('The command name which you want to enable/disable.').setRequired(false)),
    guilds: 'all',
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const config = JSON.parse(fs.readFileSync('config.json'));

        if (!config.owners.includes(interaction.user.id)) return interaction.editReply('You can not use this command.');

        const action = interaction.options.getString('action');
        const commandName = interaction.options.getString('command')?.toLowerCase();

        if (!interaction.client.commands.get(commandName)) return interaction.editReply('No such command found.');
        if (commandName == 'cog') return interaction.editReply('You cannot disable this command.');

        if (action == 'list') return interaction.editReply(`The following command are disabled: ${config.disabled.join(', ')}`)

        if (action == 'enable') {
            if (!config.disabled.includes(commandName)) return interaction.editReply('This command is NOT disabled.')
            config.disabled = config.disabled.filter(e => e !== commandName);

            fs.writeFileSync('config.json', JSON.stringify(config, null, 2))
            interaction.editReply(`Enabled ${commandName}`);
        } else {
            if (config.disabled.includes(commandName)) return interaction.editReply('This command is already disabled.')
            config.disabled.push(commandName);
            fs.writeFileSync('config.json', JSON.stringify(config, null, 2))
            interaction.editReply(`Disabled ${commandName}`);
        }

    },
};