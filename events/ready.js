const autoBreaks = require('../structures/auto-break');
const autoPost = require('../structures/auto-post')
const voteWebhooks = require('../structures/vote-webhooks');
const utils = require('../structures/utils')
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		autoBreaks.run(client);
		autoPost.run(client)
		voteWebhooks.run(client)

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
		}, {
			name: 'bedwars'
		}]

		console.log(`Loaded ${activities.length} activities`)
		// client.user.setPresence({ activities: activities, status: 'dnd'})
		setInterval(() => {
			const activity = activities[utils.randomBetween(0, activities.length-1)];
			client.user.setStatus('dnd')
			client.user.setActivity(activity.name, { type: activity.type, url: activity.url });
			
		}, 10 * 1000)
		client.channels.cache.get("749618873552207872").send(':green_circle: Im ready to be used.')
	},
};