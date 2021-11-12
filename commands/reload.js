"use strict"
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command/module')
        .addSubcommand((scmd) => scmd.setName('command').setDescription('Reloads a command').addStringOption((op) => op.setName('command').setDescription('Command to Reload').setRequired(true)))
        .addSubcommand((scmd) => scmd.setName('module').setDescription('Reloads a module').addStringOption(op => op.setName('module').setDescription('The module to reload').setRequired(true).addChoices([['Staff Breaks', 'auto-break'], ['Auto Ads', 'auto-post']])))
        .addSubcommand((scmd) => scmd.setName('event').setDescription('Reloads all event listeners')),
    guilds: 'all',
    async execute(interaction) {
        if (interaction.user.id !== "378025254125305867" || interaction.user.id === "605061180599304212") return interaction.reply({ content: 'Only my owner can use this cmd UwU', ephemeral: true });

        const { client } = interaction
        const subCmd = interaction.options.getSubcommand();
        if (subCmd == 'command') {

            const commandName = interaction.options.getString('command')
            const command = interaction.client.commands.get(commandName)

            if (!command) return interaction.reply(`There is no command with name \`${commandName}\`!`);
            delete require.cache[require.resolve(`./${command.category ? `${command.category}/` : ''}${command.data.name.toLowerCase()}.js`)];

            try {
                const props = require(`./${command.category ? `${command.category}/` : ''}${command.data.name.toLowerCase()}.js`);
                console.log(`Reloaded ${props.data.name.toLowerCase()}`)
                if (command.category) props.category = command.category;

                interaction.client.commands.set(props.data.name.toLowerCase(), props);
            } catch (error) {
                console.error(error);
                return interaction.reply(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }
            console.log(command)
            interaction.reply(`Reloaded \`${command.data.name}\``)
        } else if (subCmd == 'module') {
            const selectedModule = interaction.options.getString('module')
            await clearInterval(client.intervals.get(selectedModule));
            if (selectedModule == 'auto-post') await clearInterval(client.intervals.get('aa-expire'))
            delete require.cache[require.resolve(`../structures/${selectedModule}.js`)]

            try {
                const newModule = require(`../structures/${selectedModule}`)
                newModule.run(interaction.client)
            } catch (e) {
                console.error(e)
                return interaction.reply(`There was an error while reloading \`${selectedModule}\`:\n\`${error.message}\``);
            }

            interaction.reply(`Reloaded ${selectedModule}`)
        } else if (subCmd == 'event') {
            try {
                const eventFiles = fs.readdirSync('events').filter(file => file.endsWith('.js'));
                await client.removeAllListeners()

                for (const file of eventFiles) {
                    delete require.cache[require.resolve(`../events/${file}`)]
                    const event = require(`../events/${file}`);
                    if (event.once) {
                        // client.prependOnceListener(event.name, (...args) => event.execute(...args))
                        // client.once(event.name, (...args) => event.execute(...args));
                    }
                    else {
                        // client.on(event.name, (...args) => event.execute(...args, client))
                        client.addListener(event.name, (...args) => event.execute(...args, client));
                    }
                }
                interaction.reply('done')
            }catch (e) { console.error(e) }
        }
    },
};