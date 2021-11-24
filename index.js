const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const { join } = require('path');
const { Player } = require('discord-player');
const { playerEvents } = require('./events/music');
const mongo = require('./mongo');
const config = require('./config.json');
const utils = require('./structures/utils');
const { codeBlock } = require('@discordjs/builders');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES], partials: ['MESSAGE', 'GUILD_MEMBER', 'CHANNEL'] });

dotenv.config();
client.commands = new Collection();
client.intervals = new Map();
client.player = new Player(client);
client.mails = new Map();

globalThis.utils = utils

playerEvents(client.player);

const connectToMongoDB = async () => {
	await mongo().then(() => {
		console.log('Connected to mongodb!');
	});
};
// connectToMongoDB();


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.prependOnceListener(event.name, (...args) => event.execute(...args))
		// client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		// client.on(event.name, (...args) => event.execute(...args, client))
		client.addListener(event.name, (...args) => event.execute(...args, client));
	}
}

const readCommands = async (dir) => {
	const files = fs.readdirSync(join(__dirname, dir));
	for (const file of files) {
		const stat = fs.lstatSync(join(__dirname, dir, file));
		if (stat.isDirectory()) {
			readCommands(join(dir, file));
		}
		else {
			const option = require(join(__dirname, dir, file));
			if (dir !== './commands') option.category = dir.split('/')[1];

			client.commands.set(option.data.name.toLowerCase(), option)
		}
	}

};

readCommands('./commands');

client.on('messageCreate', async (message) => {
	if (message.content.toLowerCase() === '!deploy' && (message.author.id === '378025254125305867' || message.author.id === '605061180599304212')) {

		// const clientCmds = await client.commands.fetch();
		// const { client } = message
		let guilds = await client.guilds.fetch();
		guilds = Array.from(guilds.values())
		let allCmds = []


		const registerCmd = async (dir) => {
			const files = fs.readdirSync(join(__dirname, dir));
			for (const file of files) {
				const stat = fs.lstatSync(join(__dirname, dir, file));
				if (stat.isDirectory()) {
					registerCmd(join(dir, file));
				}
				else {
					const option = require(join(__dirname, dir, file));


					// if(option.data.options?.length){
					// 	for(let i = 0; i < option.data.options.length; i++){
					// 		options.data.options[i].type = 1
					// 	}
					// }
					if (option.data.options[0]?.options) option.data.options[0].type = 1
					if (option.data.options[1]?.options) option.data.options[1].type = 1
					if (option.data.options[2]?.options) option.data.options[2].type = 1

					if (option.guilds && !Array.isArray(option.guilds)) option.guilds = [option.guilds]

					if (!option.guilds?.length) option.guilds = []
					if (dir.includes('moderation')) option.guilds.push(config.mainServer.id)
					else if (dir.includes('staffOnly')) option.guilds.push(config.staffServer.id)
					else if (dir.includes('music')) option.guilds.push('all')

					allCmds.push(option)
				}
			}

		};
		registerCmd('./commands');

		await client.application.fetch();
		const globalCmdsData = allCmds.filter(e => e.global);
		console.log(...globalCmdsData?.map(e => e.data))
		// await client.application.commands.set(...globalCmdsData?.map(e => e.data))
		for (let guild of guilds) {
			// if(!guild.commands)guild = await guild.fetch()
			const guildCmdsData = allCmds.filter(e => e.guilds?.includes(guild.id) || e.guilds?.includes('all') || e.global)
			const cmds = guildCmdsData.map(e => e.data)
			client.application.commands.set(cmds, guild.id)
			// await guild.commands.set(cmds).catch(e => message.channel.send(e.message));
		}

		await client.application.commands.create({
			name: 'AD WARN',
			type: "MESSAGE"
		}, config.mainServer.id)

		message.reply('Deployed all commands!')
		return;
		// await client.guilds.cache.get('825958701487620107')?.commands.create(adCmdData);
	}
})

process.on("uncaughtException", (err) => {
	console.error(err.stack);
	const embed = new MessageEmbed()
		.setDescription(`${err.message}\n\n${codeBlock('cmd', err.stack)}`)
	utils.log(client, embed, 'errors');
});

process.on('exit', () => {
	console.log('ok')
})

connectToMongoDB()
client.login(process.env.TOKEN)
module.exports = client 

