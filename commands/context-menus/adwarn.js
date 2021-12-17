const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const config = require('../../config.json');
module.exports = {
    data: new ContextMenuCommandBuilder().setName('Ad Warn').setType('MESSAGE'),
    permissions: [],
    guilds: [config.mainServer.id]
};