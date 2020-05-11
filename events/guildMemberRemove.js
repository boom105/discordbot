const User = require('../database/user');
require('dotenv').config();

exports.guildMemberRemove = member => {
    var channel = member.guild.channels.cache.find(ch => ch.id === process.env.MAIN_CHANNEL_ID);

    if(!channel) return;
    
    User.deleteOne({userId: member.user.id})
        .then(result => {
            channel.send(`${member.user.username} vừa bỏ đi rồi. Đứa nào làm ngta giận đấy? `);
        })
        .catch(err => console.log(err));
}