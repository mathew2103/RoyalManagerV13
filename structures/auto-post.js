const Discord = require("discord.js");
const autoads = require("../schemas/autoAd-schema");
const config = require('../config.json');
const utils = require('./utils')
module.exports.run = async (client) => {
//   const ra_guild = await client.guilds.cache.get(config.mainServer.id);
//   if (!ra_guild) return console.log(`Default guild not found`);

  console.log(`Loaded Auto ADs`);

  // We check periodically if we have auto post ads
  // and both load message data and autopost time
  setInterval(async () => {
    // Check mongodb for data on autoads. If none, it defaults to false
    const rdata = await autoads.findOne({ interval: 4 });
    if (!rdata) return console.log(`No data present`);

    /**
     * We double check if there is data on collection rdata or if it's an empty entry
     * @param {Data} data // from rdata
     */
    const data = rdata.ads;
    if (!data) return console.log(`No data found..`);

    // For each entry of data, we post a webhook in the desired channel
    data.forEach(async (e) => {

      // We first get the channel we need to post in from the cache
      const channel = await client.channels.cache.get(e.channel);
      // If there is no channel to send the ad in, we send a console log
      // ! Is cool to use Errors, but they crash the bot :\
      if (!channel)
        return console.log(`Couldn't find a channel with id: ${e.channel}`);

      // We search for all the webhooks connected to that channel
      const webhooks = await channel.fetchWebhooks();
      // We assume that the first webhook we get is the one for auto ads
      const webhook = await webhooks.find(e => e.name == 'Royal Auto Ads' && e.owner.id == client.user.id)
      // ! To avoid interferring with existing webhooks, we check if we find any first
      if (!webhook) {
        try {
          const neowebhook = await channel.createWebhook('Royal Auto Ads', {
            avatar:
              "https://cdn.discordapp.com/avatars/814845014009053214/84466f859e2c441fb55c49bc7a8e7db6.webp",
          });
          await neowebhook.send(e.ad);
        } catch (e) {
          console.log("ERROR: Couldn't create a webhook for the channel");
        }
      } else {
        await webhook.send(e.ad);
      }
    });

    utils.log(client, '**[AUTO-POST]** Posted all autoads successfully.', 'auto')
    // client.log('**[AUTO-POST]** Posted all autoads.')
  }, 1000 * 60 * 60 * 4);

  setInterval(async() => {
    const rdata = await autoads.findOne({ interval: 4 });
    if (!rdata) return console.log(`No data present`);

    rdata.ads.filter(e => e.expires && e.expires <= Date.now()).forEach(async e => {

      const user = e.user ? await client.users.cache.get(e.user) : null
      if(user){
      
        try{
          await user.send('Your auto ad has expired.')
        }catch(e){}
        
      }

      utils.log(client, `**[AUTO-EXPIRE] Auto-ad from \`${user?.tag || "no one"}\` has expired.`, 'auto')

      await autoads.findOneAndUpdate({interval: 4}, {
        $pull: {
          ads: e
        }
      })

    })
  }, 1000 * 60 * 60)
};