const { MessageEmbed } = require("discord.js");

const logChannels = {
    STAFF: "757957484802605060",
    EARN: "879976554413846538",
    AUTO: "879976688245674044",
    VOTES: "879976455608602624"
}

async function log(client, message, type){
    type = type.toUpperCase();
    if(!logChannels[type])throw new Error(`Type ``${type}`` is not an option.`);
    const channel = client.channels.cache.get(logChannels[type]);
    const webhooks = await channel.fetchWebhooks()
    let webhook = webhooks?.first() || channel
    
    if(typeof message == 'string')webhook.send(message);
    else webhook.send({ embeds: [message] });
}

module.exports = {
    log
}