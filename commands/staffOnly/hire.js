const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('hire')
        .setDescription('Hire a trial moderator/partnership manager.')
        .addStringOption((op) => op.setName('team').setDescription('TM/PM').addChoice('Trial Mod', 'tm').addChoice('Partnership Moderator', 'pm').setRequired(true))
        .addUserOption((op) => op.setName('user').setDescription('User to hire').setRequired(true)),
    async execute(interaction, client) {
        interaction.deferReply({ ephemeral: true });

        const smember = interaction.options.getMember('user');
        const option = interaction.options.getString('team');

        const maing = await client.guilds.cache.get(config.mainServer.id)
        if (!maing) return interaction.editReply(`No main server found.`);

        const member = await maing.members.fetch(smember.user.id).catch(() => { });
        if (!member) return interaction.editReply('Member doesnt seem to be in the main server..');

        const updates = await interaction.guild.channels.cache.get("748190196239040606")
        if (!updates) return interaction.editReply(`Couldn't find staff updates channel.`)

        switch (option) {
            case 'tm':
                if (!interaction.member.roles.cache.find(e => e.name.includes('Head Moderator') || e.name.includes('Management Team') || e.name.includes('Bot Developer'))) return interaction.editReply({ content: 'Only a head moderator or above can use this command.', ephemeral: true })
                // if(!smember)return intereaction.editReply(`You have to provide a member instead of \`${args[1]}\``)


                try {
                    await smember.roles.add([config.staffServer.TModRole, config.staffServer.modTeamRole, config.staffServer.staffRole])
                    // await smember.roles.add(config.staffServer.TModRole) //trial mod
                    // await smember.roles.add(config.staffServer.modTeamRole) //mod team
                    // await smember.roles.add('746648695302520853') //royal staff
                } catch (e) {
                    return interaction.editReply(`Couldnt add roles to this user.`)
                }



                try {
                    await member.roles.add([config.mainServer.TModRole, config.mainServer.modTeamRole, config.mainServer.staffRole])
                    // await member.roles.add(config.mainServer.TModRole) //trial mod - main server 
                    // await member.roles.add(config.mainServer.modTeamRole) //moderator - main server
                    // await member.roles.add('736302589028597871') //royal staff - main server
                } catch (e) {
                    return interaction.editReply(`Couldnt add roles to this user on main server.`)
                }

                const oldmodCount = await warnCountSchema.findOne({ userId: smember.id })
                if (!oldmodCount) {

                    await warnCountSchema.findOneAndUpdate({ userId: smember.id }, {
                        current: 0,
                        total: 0
                    }, { upsert: true })
                }

                updates.send(`<:RAS_hired:749281012575371375> ${smember} has been hired as a **Trial Moderator**.`)
                interaction.editReply(`Hired ${smember.user.tag} as a trial mod.`)
                break;

            case 'pm':
                if (!interaction.member.roles.cache.find(e => e.name.includes('Head Partnership Manager') || e.name.includes('Management Team') || e.name.includes('Bot Developer'))) return interaction.editReply({ content: 'Only a head pm or above can use this command.', ephemeral: true })
                if (!smember) return interaction.editReply(`You have to provide a member instead of \`${args[0]}\``)

                try {
                    await smember.roles.add([config.staffServer.pm, config.staffServer.pmTeamRole, config.staffServer.staffRole])
                    // await smember.roles.add('748192810204659773') //pm
                    // await smember.roles.add('747339796174733422') //pm team
                    // await smember.roles.add('746648695302520853') //royal staff
                } catch (e) {
                    return interaction.editReply(`Couldnt add roles to this user.`)
                }

                try {
                    await member.roles.add([config.mainServer.pm, config.mainServer.pmTeamRole, config.mainServer.staffRole]);
                    // await member.roles.add('702503765009235978') //pm - main server 
                    // await member.roles.add('736506336946421803') //pm team - main server
                    // await member.roles.add('736302589028597871') //royal staff - main server
                } catch (e) {
                    return interaction.editReply(`Couldnt add roles to this user on main server.`)
                }


                updates.send(`<:RAS_hired:749281012575371375> ${smember} has been hired as a **Partnership Manager**.`)
                interaction.editReply(`Hired ${smember.user.tag} as a partnership manager.`)
                break;
        }
    },
};