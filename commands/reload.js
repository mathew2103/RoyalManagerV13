/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command/module')
        .addSubcommand((scmd) => scmd.setName('command').setDescription('Reloads a command').addStringOption((op) => op.setName('command').setDescription('Command to Reload').setRequired(true)))
        .addSubcommand((scmd) => scmd.setName('module').setDescription('Reloads a module').addStringOption(op => op.setName('module').setDescription('The module to reload').setRequired(true).addChoices([['Staff Breaks', 'auto-break'], ['Auto Ads', 'auto-post']]))),
    guilds: 'all',
    async execute(interaction) {
        if (interaction.user.id !== "378025254125305867" || interaction.user.id === "605061180599304212") return interaction.reply({ content: 'Only my owner can use this cmd UwU', ephemeral: true })
        const { client } = interaction

        if (interaction.options.getSubcommand() == 'command') {

            const commandName = interaction.options.getString('command')
            const command = interaction.client.commands.get(commandName)

            if (!command) return interaction.reply(`There is no command with name \`${commandName}\`!`);
            delete require.cache[require.resolve(`./${command.category ? `${command.category}/` : ''}${command.data.name.toLowerCase()}.js`)];

            try {
                const props = require(`./${command.category ? `${command.category}/` : ''}${command.data.name.toLowerCase()}.js`);
                console.log(`Reloaded ${props.name}`)
                if (command.category) props.category = command.category;

                interaction.client.commands.set(props.data.name.toLowerCase(), props);
            } catch (error) {
                console.error(error);
                return interaction.reply(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }
            console.log(command)
            interaction.reply(`Reloaded \`${command.data.name}\``)
        } else {
            const selectedModule = interaction.options.getString('module')
            await clearInterval(client.intervals.get(selectedModule));
            if(selectedModule == 'auto-post') await clearInterval(client.intervals.get('aa-expire'))
            delete require.cache[require.resolve(`../structures/${selectedModule}.js`)]

            try{
                const newModule = require(`../structures/${selectedModule}`)
                newModule.run(interaction.client)
            }catch(e){
                console.error(e)
                return interaction.reply(`There was an error while reloading \`${selectedModule}\`:\n\`${error.message}\``);
            }

            interaction.reply(`Reloaded ${selectedModule}`)
        }
    },
};