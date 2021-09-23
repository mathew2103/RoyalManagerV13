/* eslint-disable */
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hire')
        .setDescription('Hire a trial moderator/partnership manager.')
        .addStringOption((op) => op.setName('option').setDescription('TM/PM').addChoice('TM', 'tm').addChoice('PM', 'pm').setRequired(true))
        .addUserOption((op) => op.setName('user').setDescription('User to hire').setRequired(true)),
    async execute(client, interaction) {
        const smember = interaction.options.getMember('user');
        const option = interaction.options.getString('option');


        const maing = await client.guilds.cache.get(config.mainServer.id)
        if (!maing) return interaction.reply(`No main server found.`)

        const member = await maing.members.cache.get(smember.user.id)

        const updates = await interaction.guild.channels.cache.get("748190196239040606")
        if (!updates) return interaction.reply(`Couldn't find staff updates channel.`)

        switch (option) {
            case 'tm':
                if (!interaction.member.roles.cache.find(e => e.name.includes('Head Moderator') || e.name.includes('Management Team') || e.name.includes('Bot Developer'))) return interaction.reply({content: 'Nope', ephemeral: true})
                // if(!smember)return intereaction.reply(`You have to provide a member instead of \`${args[1]}\``)


                try {
                    await smember.roles.add(config.staffServer.TModRole) //trial mod
                    await smember.roles.add(config.staffServer.modTeamRole) //mod team
                    await smember.roles.add('746648695302520853') //royal staff
                } catch (e) {
                    return interaction.reply(`Couldnt add roles to this user.`)
                }



                try {
                    await member.roles.add(config.mainServer.TModRole) //trial mod - main server 
                    await member.roles.add(config.mainServer.modTeamRole) //moderator - main server
                    await member.roles.add('736302589028597871') //royal staff - main server
                } catch (e) {
                    return interaction.reply(`Couldnt add roles to this user on main server.`)
                }

                const oldmodCount = await warnCountSchema.findOne({ userId: smember.id })
                if (!oldmodCount) {

                    await warnCountSchema.findOneAndUpdate({ userId: smember.id }, {
                        current: 0,
                        total: 0
                    }, { upsert: true })
                }

                updates.send(`<:RAS_hired:749281012575371375> ${smember} has been hired as a **Trial Moderator**.`)
                interaction.reply(`Hired ${smember.user.tag} as a trial mod.`)
                break;

            case 'pm':
                if (!interaction.member.roles.cache.find(e => e.name.includes('Head Moderator') || e.name.includes('Management Team') || e.name.includes('Bot Developer'))) return interaction.reply({content: 'Nope', ephemeral: true})
                if (!smember) return interaction.reply(`You have to provide a member instead of \`${args[0]}\``)

                try {
                    await smember.roles.add('748192810204659773') //pm
                    await smember.roles.add('747339796174733422') //pm team
                    await smember.roles.add('746648695302520853') //royal staff
                } catch (e) {
                    return interaction.reply(`Couldnt add roles to this user.`)
                }

                try {
                    await member.roles.add('702503765009235978') //pm - main server 
                    await member.roles.add('736506336946421803') //pm team - main server
                    await member.roles.add('736302589028597871') //royal staff - main server
                } catch (e) {
                    return interaction.reply(`Couldnt add roles to this user on main server.`)
                }


                updates.send(`<:RAS_hired:749281012575371375> ${smember} has been hired as a **Partnership Manager**.`)
                interaction.reply(`Hired ${smember.user.tag} as a partnership manager.`)
                break;
        }
    },
};