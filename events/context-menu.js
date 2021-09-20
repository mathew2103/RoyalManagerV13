const { MessageActionRow, MessageSelectMenu } = require('discord.js');

const reasons = [{
    label: 'No description',
    description: 'Sending an advertisement without a description in the server advertising channels',
    value: '0'
}, {
    label: 'Invite Rewards',
    description: 'Sending an advertisement which server revolves around invite rewards',
    value: '1'
}, {
    label: 'Contains a ping',
    description: 'Sending an advertisement containing a ping',
    value: '2'
}, {
    label: 'Back to back',
    description: 'Sending an advertisement back to back',
    value: '3'
}, {
    label: 'Incorrect channel',
    description: "Sending an advertisement in an incorrect channel",
    value: '4'
}, {
    label: 'Vague description or one with less than 20 characters',
    description: 'Sending an advertisement which description is vague and/or contains less than 20 characters',
    value: '5'
}, {
    label: 'NSFW server',
    description: 'Advertising an NSFW server and/or advertising a server that isn\'t suitable for children',
    value: '6'
}, {
    label: 'Invalid Invite',
    description: 'Sending an advertisement containing an invalid invite',
    value: '7'
}, {
    label: 'Non-english ad',
    description: 'Sending an advertisement that is not in English language',
    value: '8'
}, {
    label: 'No link',
    description: 'Sending an advertisement without a link',
    value: '9'
}]

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isContextMenu()) return;

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setCustomId('select')
                    .setPlaceholder('No reason chosen')
                    .addOptions(reasons)
            )

        const filter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

        const reply = await interaction.reply({ content: 'Choose a reason for this warn:', components: [row], ephemeral: true, fetchReply: true })
        // const reply = await interaction.fetchReply();

        let reasonID = await reply.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 2 * 60 * 1000 })
            .catch(e => { return interaction.editReply('Looks like you didnt choose in time.') })
        console.log(reasonID)
        reasonID = reasonID.values
        interaction.editReply(reasonId)
    }
}