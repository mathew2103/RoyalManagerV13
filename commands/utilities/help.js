/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows the help menu')
        .addStringOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
    permissions: [],
    guilds: 'all',
    async execute(interaction) {
return interaction.reply('still under work.')
        let cmds = interaction.client.commands
        if (!interaction.member.permissions.has('ADMINISTRATOR') && (interaction.user.id === '378025254125305867' || interaction.user.id === '605061180599304212')) cmds = cmds.filter(cmd => {

            if (!cmd.global && cmd.guilds.toLowerCase() != 'all' && (cmd.guilds.length ? cmd.guilds.includes(interaction.guild.id) : cmd.guilds == interaction.guild.id)) return false;
            if (cmd.permissions?.length && !interaction.member.permissions.has(cmd.permissions)) return false;
            if (cmd.roles?.length && !interaction.member.roles.cache.some(role => cmd.roles.includes(role.name.toLowerCase()) || cmd.roles.find(e => role.name.toLowerCase().includes(e.toLowerCase())))) return false;

            return true;
        })

        const embed = new Discord.MessageEmbed()
            .setAuthor('Help Menu', interaction.client.user.displayAvatarURL())
            .setDescription(cmds.map(e => e.data.name).join(', '))
        interaction.reply({ embeds: [embed] })
    },
};