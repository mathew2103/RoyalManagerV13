const Discord = require('discord.js')
const {hyperlink } = require('@discordjs/builders');

module.exports.playerEvents = (player) => {
	player.on('error', (queue, error) => {
		console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
	});
	player.on('connectionError', (queue, error) => {
		console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
	});

	player.on('trackStart', (queue, track) => {
        // console.log(queue)
        // console.log(track)
        const embed = new Discord.MessageEmbed()
        .setDescription(`\🎵 Playing **${hyperlink(track.title, track.url)}** by ${track.author}`)
        .setFooter(`Requested by ${track.requestedBy.username}#${track.requestedBy.discriminator}`)
        .setThumbnail(track.thumbnail)
		.setColor('AQUA')
		
		queue.metadata.channel.send({embeds: [embed]});
	});

	player.on('trackAdd', (queue, track) => {
		queue.metadata.channel.send(`🎶 | Track **${track.title}** queued!`);
	});

	player.on('botDisconnect', (queue) => {
		queue.metadata.channel.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
	});

	player.on('channelEmpty', (queue) => {
		queue.metadata.channel.send('❌ | Nobody is in the voice channel, leaving...');
	});

	player.on('queueEnd', (queue) => {
		queue.metadata.channel.send('✅ | Queue finished!');
	});
};