module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		const activities = [{
			content: 'Menin and Nothingness struggle',
			type: 'Watching'
		}, {
			content: 'Slash Commands',
			type: 'Listening'
		}, {
			content: 'hip hop moosic',
			type: 'Listening'
		}, {
			content: 'Minecraft',
		}, {
			content: 'my code',
			type: 'Streaming',
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
		}]

		setInterval(() => {
			const activity = activities[Math.floor(Math.random() * activities.length)];

			client.user.setActivity(activity.content, { type: activity.type?.toUpperCase(), url: activity.url });
			
		}, 10 * 1000)

	},
};