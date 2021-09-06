const warnSchema = require('../schemas/warn-schema');
module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		if (!interaction.isButton()) return;

		const buttonIdParts = interaction.customId.split('_');
		switch (buttonIdParts[0]) {
		case 'appeal':
			const appealTrigger = buttonIdParts[1];
			break;
		}
	},
};