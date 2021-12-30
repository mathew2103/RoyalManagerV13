"use strict"
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const cron = require('node-cron');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command/module')
        .addSubcommand((scmd) => scmd.setName('command').setDescription('Reloads a command').addStringOption((op) => op.setName('command').setDescription('Command to Reload').setRequired(true)))
        .addSubcommand((scmd) => scmd.setName('structures').setDescription('Reloads all structures'))
        .addSubcommand((scmd) => scmd.setName('events').setDescription('Reloads all event listeners')),
    guilds: 'all',
    async execute(interaction) {
        if (interaction.user.id !== "378025254125305867" || interaction.user.id === "605061180599304212") return interaction.reply({ content: 'Only my owner can use this cmd UwU', ephemeral: true });

        const { client } = interaction
        const subCmd = interaction.options.getSubcommand();
        if (subCmd == 'command') {

            const commandName = interaction.options.getString('command')
            const command = interaction.client.commands.get(commandName)

            if (!command) return interaction.reply(`There is no command with name \`${commandName}\`!`);
            delete require.cache[require.resolve(`../${command.category ? `${command.category}/` : ''}${command.data.name.toLowerCase()}.js`)];

            try {
                const props = require(`../${command.category ? `${command.category}/` : ''}${command.data.name.toLowerCase()}.js`);
                console.log(`Reloaded ${props.data.name.toLowerCase()}`)
                if (command.category) props.category = command.category;

                interaction.client.commands.set(props.data.name.toLowerCase(), props);
            } catch (error) {
                console.error(error);
                return interaction.reply(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }
            console.log(command)
            interaction.reply(`Reloaded \`${command.data.name}\``)

        } else if (subCmd == 'events') {
            try {
                const eventFiles = fs.readdirSync('events').filter(file => file.endsWith('.js'));
                await client.removeAllListeners()

                for (const file of eventFiles) {
                    delete require.cache[require.resolve(`../events/${file}`)]
                    const event = require(`../../events/${file}`);
                    if (event.once) {
                        client.prependOnceListener(event.name, (...args) => event.execute(...args))
                        // client.once(event.name, (...args) => event.execute(...args));
                    }
                    else {
                        // client.on(event.name, (...args) => event.execute(...args, client))
                        client.addListener(event.name, (...args) => event.execute(...args, client));
                    }
                }
                interaction.reply(`Loaded \`${eventFiles.length}\` events.`);
            } catch (e) { console.error(e) }
        } else if (subCmd == 'structures') {

            const tasks = cron.getTasks();
            tasks.forEach(task => task.stop());

            delete require.cache[require.resolve('../../structures/auto-post.js')];
            delete require.cache[require.resolve('../../structures/auto-checks.js')];

            const aps = require('../../structures/auto-post.js');
            const achs = require('../../structures/auto-post.js');

            aps.run(client);
            achs.run(client);
            console.log(cron.getTasks());

            interaction.reply({ content: "Reloaded all modules." })
        }
    },
};

/*
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
*/