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
		}, {
			content: 'appeals',
			type: 'watching'
		}, {
			content: 'people advertise',
			type: 'watching'
		}, {
			content: 'moderators',
			type: 'listening'
		}, {
			content: 'CustomName\'s videos',
			type: 'watching'
		}, {
			content: 'with my life',
		}, {
			content: 'typeracer',
			type: 'competing'
		}, {
			content: 'you read my status',
			type: 'watching'
		}]

		setInterval(() => {
			const activity = activities[Math.floor(Math.random() * activities.length)];

			client.user.setActivity(activity.content, { type: activity.type?.toUpperCase(), url: activity.url });
			
		}, 5 * 1000)

	},
};