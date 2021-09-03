const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const { join } = require('path');
const mongo = require('./mongo');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
dotenv.config();

client.commands = new Collection();

const connectToMongoDB = async () => {
	await mongo().then(() => {
		console.log('Connected to mongodb!');
	});
};
connectToMongoDB();


client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	console.log(interaction);
	if (!client.commands.has(interaction.commandName)) return;

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

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
	console.log(client.commands);
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
					console.log(option);
					const optionCmd = !option.data ? {
						name: option.name,
						description: option.description,
						options: option.options ?? [],
					} : undefined;

					await client.guilds.cache.get('825958701487620107')?.commands.create(option.data || optionCmd);

				}
			}
		};

		registerCmd('./commands');

		// await client.guilds.cache.get('825958701487620107')?.commands.create(adCmdData);

	}
});

client.login(process.env.TOKEN);