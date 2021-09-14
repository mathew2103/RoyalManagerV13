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
			option.name ? client.commands.set(option.name.toLowerCase(), option) : client.commands.set(option.data.name.toLowerCase(), option);
		}
	}
	// console.log(client.commands);
};

readCommands('./commands');

client.on('messageCreate', async message => {


	if (message.content.toLowerCase() === '!deploy' && message.author.id === '378025254125305867') {

		const registerCmd = async (dir) => {
			const files = fs.readdirSync(join(__dirname, dir));
			for (const file of files) {
				const stat = fs.lstatSync(join(__dirname, dir, file));
				if (stat.isDirectory()) {
					registerCmd(join(dir, file));
				}
				else {
					const option = require(join(__dirname, dir, file));
					const perms = option.permissions;

					if (option.global || !option.guilds?.length) { 
						try {
							client.application.commands.create(option.data)
						} catch (err) {
							console.error(err)
						}
					} else {
						let guilds = option.guilds
						if(!Array.isArray(guilds)) guilds = [guilds]

						for(const guildId of guilds){
							const guild = client.guilds.cache.get(guildId);
							if(!guild)continue;
							try{
								const cmd = await guild.commands.create(option.data);
								if (option.permissions) {
									await guild.commands.permissions.add({ command: cmd.id, permissions: [option.permissions] })
								}
								// if(option.permissions) await cmd.permissions.add({ permissions: option.permissions})
							}catch(e){
								console.error(e)
							}
						}
					}

				}
			}
		};

		registerCmd('./commands');

		// await client.guilds.cache.get('825958701487620107')?.commands.create(adCmdData);

	}
});

client.login(process.env.TOKEN);