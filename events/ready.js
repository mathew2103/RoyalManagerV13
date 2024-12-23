const autoBreaks = require('../structures/auto-break');
const autoPost = require('../structures/auto-post')
const voteWebhooks = require('../structures/vote-webhooks');
const autoChecks = require('../structures/auto-checks');
const utils = require('../structures/utils')
const { Client, ActivityOptions } = require('discord.js');
const config = require('../config.json');
module.exports = {
	name: 'ready',
	once: true,
	/**
	 * 
	 * @param {Client} client 
	 * @returns 
	 */
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		autoBreaks.run(client);
		autoPost.run(client);
		voteWebhooks.run(client);
		autoChecks(client)

		const activities = [{
			name: 'Menin and Nothingness struggle',
			type: 'WATCHING'
		}, {
			name: 'Slash Commands',
			type: 'LISTENING'
		}, {
			name: 'hip hop moosic',
			type: 'LISTENING'
		}, {
			name: 'Minecraft',
		}, {
			name: 'my code',
			type: 'STREAMING',
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
		}, {
			name: 'appeals',
			type: 'WATCHING'
		}, {
			name: 'people advertise',
			type: 'WATCHING'
		}, {
			name: 'moderators',
			type: 'LISTENING'
		}, {
			name: 'CustomName\'s videos',
			type: 'WATCHING'
		}, {
			name: 'with my life',
		}, {
			name: 'typeracer',
			type: 'competing'
		}, {
			name: 'you read my status',
			type: 'WATCHING'
		}, {
			name: 'Minecraft Speedruns with Dream',
			type: 'competing'
		}, {
			name: 'Menin search for Nothingness',
			type: 'WATCHING'
		}, {
			name: 'Nothingness search for Menin',
			type: 'WATCHING'
		}, {
			name: 'hide and seek with mods'
		}, {
			name: 'my token',
			type: 'STREAMING',
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
		}]

		console.log(`Loaded ${activities.length} activities`)
		// client.user.setPresence({ activities: activities, status: 'dnd'})
		let activity = activities[utils.randomBetween(0, activities.length - 1)];
		client.user.setPresence({ activities: [{ name: activity.name, type: activity.type?.toUpperCase() || 'PLAYING', url: activity.url }], status: 'idle' });

		setInterval(() => {
			activity = activities[utils.randomBetween(0, activities.length - 1)];
			client.user.setPresence({ activities: [{ name: activity.name, type: activity.type?.toUpperCase() || 'PLAYING', url: activity.url }], status: 'idle' });
			// client.user.setActivity(activity.name, { type: activity.type, url: activity.url });
		}, 5 * 60 * 1000)
		client.channels.cache.get("749618873552207872")?.send(':green_circle: Im ready to be used.')
		client.channels.cache.get(config.rebootChannel)?.send('Rebooted successfully.')

	},
};