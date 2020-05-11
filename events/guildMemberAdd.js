const User = require('../database/user');
require('dotenv').config();

exports.guildMemberAdd = mem => {
  var channel = mem.guild.channels.cache.find(ch => ch.id === process.env.MAIN_CHANNEL_ID);

    if(!channel) return;
    channel.send(`Chào mừng ${mem.user.username} đến với server của bọn mình.\nVuốt sang trái, vào kênh voice Chung để vô voice chat bạn nhé!`);

    let newuser = {userId: mem.user.id, name: mem.user.username, point: 0};
  
    User.findOne({userId: mem.user.id}).then(user=> {
      if(!user){
        return User.collection.insertOne(newuser);
      }
    })
    .then(result => {
      console.log(`Added user ${newuser.name} successfully!`);
    })
    .catch(err => console.log(err));
  }