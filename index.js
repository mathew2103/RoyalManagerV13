const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const { join } = require('path');
const mongo = require('./mongo');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES] });
dotenv.config();

client.commands = new Collection();

const connectToMongoDB = async () => {
	await mongo().then(() => {
		console.log('Connected to mongodb!');
	});
};
connectToMongoDB();


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// client.on('interactionCreate', async interaction => {
// 	if (!interaction.isCommand()) return;
// 	console.log(interaction);
// 	if (!client.commands.has(interaction.commandName)) return;

// 	try {
// 		await client.commands.get(interaction.commandName).execute(interaction);
// 	}
// 	catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}
// }); USE THE LIVESHARE CHAT YEA YEA

const readCommands = async (dir) => {
	const files = fs.readdirSync(join(__dirname, dir));
	for (const file of files) {
		const stat = fs.lstatSync(join(__dirname, dir, file));
		if (stat.isDirectory()) {
			readCommands(join(dir, file));
		}
		else {
			const option = require(join(__dirname, dir, file));
			// console.log(option);
			if(dir !== './commands')option.category = dir.split('\\\\')[1];
			
			client.commands.set(option.data.name.toLowerCase(), option)
		}
	}
	// console.log(client.commands);
};

readCommands('./commands');

client.on('messageCreate', async message => {

	if(!message.guild)return;

	if (message.content.toLowerCase() === '!deploy' && (message.author.id === '378025254125305867' || message.author.id === '605061180599304212')) {

		// const clientCmds = await client.commands.fetch();
		await message.guild.commands.create({
			name: 'AD WARN',
			type: "MESSAGE"
		})

		const registerCmd = async (dir) => {
			const files = fs.readdirSync(join(__dirname, dir));
			for (const file of files) {
				const stat = fs.lstatSync(join(__dirname, dir, file));
				if (stat.isDirectory()) {
					registerCmd(join(dir, file));
				}
				else {
					const option = require(join(__dirname, dir, file));
					// const perms = option.permissions;
					if(option.data.options[0]?.options)option.data.options[0].type = 1
					if(option.data.options[1]?.options)option.data.options[1].type = 1
					// console.log(option.data.options)
					if (option.global || !option.guilds?.length) {
						try {
							client.application.commands.create(option.data);
						}
						catch (err) {
							console.error(err);
						}
					}
					else {
						let guilds = option.guilds;
						if (!Array.isArray(guilds)) guilds = [guilds];

						for (const guildId of guilds) {
							const guild = client.guilds.cache.get(guildId);
							if (!guild) continue;
							const guildCmds = await guild.commands.fetch();
							try {
								const oldCmd = guildCmds.find(e => e.name == option.data.name)
								let cmd = ''
								if(oldCmd) cmd = await guild.commands.edit(oldCmd, option.data);
								else cmd = await guild.commands.create(option.data);

								if (option.permissions) await guild.commands.permissions.add({ command: cmd.id, permissions: [option.permissions] });
								
								
							}
							catch (e) {
								console.error(e);
								process.exit()
							}
						}
					}

				}
			}

		};

		registerCmd('./commands');

		// await client.guilds.cache.get('825958701487620107')?.commands.create(adCmdData);
	}

	if (message.content.toLowerCase().startsWith('!eval') && (message.author.id === '378025254125305867' || message.author.id === '605061180599304212')){
		const code = message.content.split('!eval ')[1]
		if(!code)return message.reply('Provide some code nerd.')

		try{
			eval(code)
		}catch(e){
			console.error(e)
		}
	}
});


client.login(process.env.TOKEN);