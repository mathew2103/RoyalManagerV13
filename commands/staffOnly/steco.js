const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { CommandInteraction } = require('discord.js');
const coinsSchema = require('../../schemas/coins-schema');
// const settingsSchema = require('../../schemas/settings-schema');
const { shopItems } = require('../../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('steco')
        .setDescription('Staff economy')
        .addSubcommand((subCmd) => subCmd.setName('balance').setDescription('Shows your balance'))
        .addSubcommand((subCmd) => subCmd.setName('shop').setDescription('Shows the staff shop'))
        .addSubcommand((subCmd) => subCmd.setName('buy').setDescription('Buy an item').addStringOption((op) => op.setName('id').setDescription('ID of the item you want to buy').setRequired(true))),
    permissions: [],
    global: false,
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.deferReply();

        const subCmd = interaction.options.getSubcommand();

        const userData = await coinsSchema.findOne({
            userID: interaction.user.id
        })
        // const settings = await settingsSchema.findOne({ guildId: '559271990456745996' })
        const embed = new Discord.MessageEmbed()
        

        if (subCmd == 'balance') {
            return interaction.followUp({ content: `You currently have \`${userData.balance}\` coins.`, ephemeral: true });
        } else if (subCmd == 'shop') {
            const items = shopItems; //settings.staffEconomy.items;
            let des = '';
            des = items.map(i => `${i.price > userData.balance ? `~~**${i.name}**~~` : `**${i.name}**`}\nPrice: \`${i.price}\`\nItem ID: \`${i.id}\``).join('\n\n')
            // for (const item of items) {
            //     des += `**${item.name}**\nPrice: \`${item.price}\`\n\n`
            // }
            embed.setTitle(`Royal Manager Shop`)
            .setDescription(des)
            .setColor('PURPLE')
            
            return interaction.followUp({ embeds: [embed], ephemeral: true })
        } else if (subCmd == 'buy') {
            const itemId = interaction.options.getString('id')
            const item = shopItems[itemId];

            
        }

    },
};