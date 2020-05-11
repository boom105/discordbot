const User = require('../database/user');
const bot = require('../discord-client').getClient();

exports.ready = () => {
    let guild = bot.guilds.cache.get(process.env.GUILD_ID);
    let memlist = guild.members.cache.filter(mem => !mem.user.bot)
                                    .map(mem => {
                                      return {
                                        userId: mem.user.id,
                                        name: mem.user.username,
                                        point: 0
                                      }
                                    });
  memlist.forEach(mem => {
    User.findOne({userId: mem.userId}).then(user=> {
      if(!user){
        User.collection.insertOne(mem)
        .then(result => {
          console.log(`Added user ${mem.name} successfully!`);
        })
        .catch(err => console.log(err));
      }
    })  
    .catch(err => console.log(err));
  })    
}