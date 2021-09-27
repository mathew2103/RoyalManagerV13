const { MessageEmbed, Client, Interaction, MessageButton } = require("discord.js");

const logChannels = {
    STAFF: "757957484802605060",
    EARN: "879976554413846538",
    AUTO: "879976688245674044",
    VOTES: "879976455608602624"
}

/**
 * Logs a message in a discord channel
 * @param {Client} client 
 * @param {String} message 
 * @param {logChannels} type 
 */

async function log(client, message, type) {
    type = type.toUpperCase();
    if (!logChannels[type]) throw new Error(`Type ``${type}`` is not an option.`);
    const channel = client.channels.cache.get(logChannels[type]);
    const webhooks = await channel.fetchWebhooks()
    let webhook = webhooks?.first() || channel

    if (typeof message == 'string') webhook.send(message);
    else webhook.send({ embeds: [message] });
}

/**
 * Awaits a message and returns the resposnse
 * @param {Interaction} interaction 
 * @param {String} message 
 * @returns {Message | Null}
 */
async function getMessage(interaction, message) {
    const sent = interaction.replied ? await interaction.editReply(message) : interaction.reply(message)

    const filter = m => m.author.id == interaction.author.id
    const reply = await interaction.channel.awaitMessages({ filter, time: 3 * 60 * 1000, max: 1 })
        .catch(e => { return interaction.channel.send('You didnt reply in time..') })

    
    return reply.first();
}

/**
 * 
 * @param {*} label 
 * @param {*} style 
 * @param {String} customId 
 * @param {*} emoji 
 */
function createButton(label, style, customId, emoji) {
    if (!label || !style || !customId) throw new Error('You didnt provide label or style or custom id')
    const button = new MessageButton()
        .setStyle(style)
        .setLabel(label)
        .setCustomId(customId)
        .setEmoji(emoji)

    return button;
}

module.exports = {
    log, getMessage
}