const { MessageEmbed, Client, Interaction, MessageButton } = require("discord.js");

const logChannels = {
    STAFF: "757957484802605060",
    EARN: "879976554413846538",
    AUTO: "879976688245674044",
    VOTES: "879976455608602624",
    ERRORS: "871290638631600128",
}

/**
 * Logs a message in a discord channel
 * @param {Client} client 
 * @param {String|MessageEmbed} message 
 * @param {logChannels} channelType
 */

async function log(client, message, channelType) {

    try {
        channelType = channelType.toUpperCase();
        if (!logChannels[channelType]) return console.log(`Type ``${channelType}`` is not an option.`);
        const channel = client.channels.cache.get(logChannels[channelType]);
        const webhooks = await channel?.fetchWebhooks();
        let webhook = webhooks?.find(e => e.token) || channel



        if (typeof message == 'string') webhook.send(message);
        else webhook.send({ embeds: [message] });

    } catch (e) { console.log(e) }
}

/**
 * Awaits a message and returns the resposnse
 * @param {Interaction} interaction 
 * @param {String} message 
 * @returns {Message|null} The message response
 */
async function getMessage(interaction, message) {
    const sent = interaction.replied ? await interaction.editReply(message) : interaction.reply(message)

    const filter = m => m.author.id == interaction.user.id
    const reply = await interaction.channel.awaitMessages({ filter, time: 3 * 60 * 1000, max: 1 })
        .catch(() => { return interaction.channel.send('You didnt reply in time..') })


    return reply.first();
}

/**
 * Creates a button
 * @param {String} label - Button Label
 * @param {String} style - Button Style
 * @param {String} customId - Button's Custom ID
 * @param {String} emoji - Emoji for the button
 * @returns {MessageButton}
 */
function createButton(label = '', style = '', customId = '', emoji = '') {
    if (!label || !style || !customId) throw new Error('You didnt provide label or style or custom id')
    const button = new MessageButton()
        .setStyle(style)
        .setLabel(label)
        .setCustomId(customId)
        .setEmoji(emoji)

    return button;
}

/**
 * Gives a number between 2 numbers
 * @param {Number} min The minimum number
 * @param {Number} max The maximum number
 * @returns {Number} Random Number
 */
function randomBetween(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

module.exports = {
    log, getMessage, createButton, randomBetween
}