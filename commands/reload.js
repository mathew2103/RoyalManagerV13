/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption((op) => op.setName('command').setDescription('Command to Reload').setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id !== "378025254125305867" || interaction.user.id === "605061180599304212") return
        const commandName = interaction.options.getString('command')
        const command = client.commands.get(commandName)

        if (!command) return interaction.reply(`There is no command with name or alias \`${commandName}\`, ${interaction.user}!`);

        delete require.cache[require.resolve(`./${command.category ? `${command.category}/` : ''}${command.name.toLowerCase()}.js`)];    
        
        try {
            const props = require(`./${command.name.toLowerCase()}.js`);
            console.log(`Reloaded ${props.name}`)
            client.commands.set(props.name.toLowerCase(), props);
        } catch (error) {
            console.error(error);
            return interaction.reply(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
        }
        interaction.reply(`Reloaded \`${command.name}\``)
    },
};