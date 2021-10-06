const { SlashCommandBuilder, hyperlink } = require('@discordjs/builders');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
// const {
//     AudioPlayerStatus,
//     StreamType,
//     createAudioPlayer,
//     createAudioResource,
//     joinVoiceChannel,
// } = require('@discordjs/voice');
// const timeouts = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song')
        .addStringOption((op) => op.setName('song').setDescription('The song which you want to play').setRequired(true)),
    permissions: [],
    global: false,
    async execute(interaction) {
        
        const player = interaction.client.player
        const voiceChannel = interaction.member.voice?.channel;
        const error1 = new Discord.MessageEmbed()
			.setDescription('⛔ You are required to be in a voice channel!')
			.setColor('RED');

		const error2 = new Discord.MessageEmbed()
			.setDescription('⛔ You are required to not be deafen to play a song!')
			.setColor('RED');

		const error3 = new Discord.MessageEmbed()
			.setDescription('⛔ You are required to be in the same voice channel as me!')
			.setColor('RED');

		if (!interaction.member.voice.channelId) return interaction.reply({ embeds: [error1], ephemeral: true });
		if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({ embed: [error3], ephemeral: true });
        if (interaction.member.voice.deaf) return interaction.reply({ embeds: [error2], ephemeral: true });

        const query = interaction.options.getString('song')
        const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });

        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch {
            queue.destroy();
            return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true });
        }

        await interaction.deferReply();
        const track = await player.search(query, {
            requestedBy: interaction.user
        }).then(x => x.tracks[0]);
        if (!track) return await interaction.followUp({ content: `❌ | Track **${query}** not found!` });

        

        queue.play(track);

        return await interaction.followUp({ content: `⏱️ | Loading track **${track.title}**!` });
        // let video = await ytSearch(url)
        // video = video?.videos[0]
        // if (!video?.url) return interaction.reply({ content: 'No such video found', ephemeral: true })
                
        
    },
};