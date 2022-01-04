/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { staffServer } = require('../../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows the help menu')
        .addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
    permissions: [],
    guilds: 'all',
    roles: ['Royal Staff'],
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    async execute(interaction) {
        // return interaction.reply('still under work.')
        await interaction.deferReply()
        const { client, guild, member } = interaction;
        const { roles } = member;
        const bypassRegex = /(admin|server manager|bot dev)/mi;

        let cmdCats = []
        cmdCats['moderation'] = []
        cmdCats['music'] = []
        cmdCats['staffOnly'] = []
        cmdCats['utilities'] = []
        const staffGuild = await client.guilds.fetch(staffServer.id);
        const staffMember = await staffGuild.members.fetch(interaction.user.id).catch(e => e);

        const cmds = client.commands.filter(cmd => {
            if (roles.cache.some(role => bypassRegex.test(role.name))) return true;
            if (!staffMember && cmd.category == 'staffOnly') return false;

            if (cmd.permissions) {
                if (!Array.isArray(cmd.permissions)) cmd.permissions = [cmd.permissions]
                if (!interaction.member.permissions.has(cmd.permissions)) return false;
            }
            if (cmd.roles?.length) {
                const rolesMapped = cmd.roles.join('|')
                const requiredRegex = new RegExp(`(admin|manager|bot dev|${rolesMapped})`, 'mi')

                if (!interaction.member.roles.cache.some(role => role.name.match(requiredRegex))) return false;
            }
            return true;
        })



        await cmds.forEach(e => e.category ? cmdCats[e.category.toString()]?.push(e) : undefined);

        let embed = new Discord.MessageEmbed()
            .setAuthor({ name: 'Help Menu', iconURL: client.user.displayAvatarURL() })
            .setColor('RANDOM');

        console.log(cmdCats['moderation'].map(cmd => `\`${cmd?.data?.name}\`` || cmd).join(', '))
        embed.addField('Moderation', cmdCats['moderation'].map(cmd => `\`${cmd?.data?.name}\`` || 'null').join(', '))
        embed.addField('Music', cmdCats['music'].map(cmd => `\`${cmd?.data?.name}\`` || 'null').join(', '))
        embed.addField('Staff Only', cmdCats['staffOnly'].map(cmd => `\`${cmd?.data?.name}\`` || 'null').join(', '))
        embed.addField('Utilities', cmdCats['utilities'].map(cmd => `\`${cmd?.data?.name}\`` || 'null').join(', '))

        await interaction.followUp({ embeds: [embed] })
    },
};