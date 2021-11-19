const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('Shows a guide on how to use the bot')
        .addBooleanOption((op) => op.setName('ephemeral').setDescription('Should the reply be only shown to you?')),
    permissions: [],
    guilds: "all",
    roles: ['mod'],
    async execute(interaction) {
        const ephemeral = interaction.options.getBoolean('ephemeral')
        const { client } = interaction
        await interaction.deferReply({ ephemeral })
        let pages = [
            {
                label: 'Basic Info',
                description: `Hi. I am Royal Manager, a moderation, utility and music bot made only for Royal Advertising.\n**Prefix:** \`/\`\n**Developer:** <@378025254125305867> \`Menin#4642\`\n<@605061180599304212> \`605061180599304212\`\n**Commands:** ${client.commands.size}\n**Users Cached:** ${client.users.cache.size}`,
                value: 'basics'
            }, {
                label: 'How to warn',
                description: '**Command:** \n `r!ad`\n**Usage:** `r!ad <user> <ad-deleted-channel> <reason> (belongs-to)`\n\n**Examples:**\n• `r!ad 814845014009053214 #┇📋・anime-servers description`\n• `r!ad 814845014009053214 649270895830892554 rewards`\n• `r!ad 814845014009053214 anime ping`\n\n**Notes:**\n• The reason can only be one word.\n• You can use \`r!reasons <word>\` to check which word triggers which reason.\n• You can use the user\'s mention too instead of the user id in the command, but the user id is easier to use.\n• Check the `How to warn for incorrect channel?` guide for info about the `belongs-to` part.',
                value: 'warn'
            }, {
                label: 'How to request a ban',
                description: 'The bot has an inbuilt ban request feature which only Trial Moderators can use. To learn more about it, read the steps below:\n1. Get the user id of the member you want to ban.\n2.Use `r!br <member> <reason>` in which the `member` is the member whom you want to ban and the `reason` is the reason for which you want to ban the user.\n3. The bot will now ask you for evidence/proof. You can provide any attachment or link.\nNote: If you want to ban someone for 6 or more ad warnings, you can use `6aw` in both the `reason` and `evidence` part.',
                value: 'br'
            }
        ]
        let options = [{
            label: 'Basic Info',
            description: `Shows basic info about the bot.`,
            value: 'basics'
        }, {
            label: 'How to warn',
            description: 'Shows how to ad warn',
            value: 'warn'
        }, {
            label: 'How to request a ban',
            description: 'Shows how to request a ban',
            value: 'br'
        }]
        const menu = new Discord.MessageSelectMenu()
        .setMaxValues(1)
        .setMinValues(1)
        .setCustomId('select')
        .setPlaceholder('Choose a guide to view')
        .addOptions(options)
        const row = new Discord.MessageActionRow()
            .addComponents([menu])

        const embed = new Discord.MessageEmbed()
            .setDescription(`Hey ${interaction.user.username}! Welcome to Royal Manager Guide. Please use the buttons below to hop between the different guides.`)
            .setFooter(`If you have any suggestions or if you find something is wrong, please DM @Menin#4642`)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setColor("GREEN")

        const filter = i => {
            // i.deferUpdate();
            return i.user.id === interaction.user.id;
        };
        await interaction.editReply({ embeds: [embed], components: [row], ephemeral })
        const collector = await interaction.channel.createMessageComponentCollector({ filter, componentType: "SELECT_MENU", time: 2*60*1000 })
        collector.on('collect', async (i) => {
            const data = pages.find(e => e.value == i.values[0])
            embed.setTitle(data.label).setDescription(data.description)
            i.update({ embeds: [embed] })
            collector.resetTimer();
        })
        collector.on('end', collected => {
            menu.setDisabled(true);
            newRow = [menu]
            interaction.editReply({ embeds: [embed], components: [newRow] })
        })
    },
};