const { Client, MessageEmbed } = require('discord.js');
const API = require('./BaokimAPI')

const token = 'Njk4NDc1ODc2MjcwMjExMDcy.XpGYyA.IxP1a_z21Hgz_8ZFJhBWnWh8mRI';

const bot = new Client();
const PREFIX = '!';

let commandList = [];


bot.on('ready',() => {
    console.log("This bot is online!");
})

bot.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'general');

    if(!channel) return;
    channel.send(`Chào mừng ${member} đến với server của bọn mình.\nVuốt sang trái, vào kênh voice Chung để vô voice chat bạn nhé!`);
})

bot.on('message', message=> {
    console.log(message);
    
    

    let args = message.content.substring(PREFIX.length).split(" ");
    switch(args[0])
    {
        case 'card':{
            
           if(message.member.roles.cache.find(r => r.name === 'mod')){
                if(args.length > 3){
                    return message.reply('Sai cú pháp rồi!!!    command: !card @member nhà_mạng');
                }
                if(!args[1]){
                    return message.reply("Nhập tên người trúng card đi mod ê=)))");
                }

                let luckymember = message.mentions.users.first();
                if(!luckymember){
                    return message.reply("Thành viên không tồn tại!!!")
                }

                if(!args[2]){
                    return message.reply("Quên nhập nhà mạng rồi =))")
                }
                let isp = args[2].toLocaleLowerCase();
                if((isp != 'viettel' && isp != 'vinaphone' && isp != 'mobiphone')){
                    return message.reply('Sai tên nhà mạng rồi mod ơi =))')
                    
                }
                else {
                    
                    API.buyCard(isp,10000).then((result) => {
                        var card = result.data.data.param + '\nPIN: ' 
                                    + result.data.data.pin + '\nSeri: ' + result.data.data.seri;
                        luckymember.send(card)
                        message.channel.send(`Chúc mừng ${args[1]}! Vui lòng check direct message bạn nhé =))`);
                    }).catch((err) => {
                        message.reply("Ngân quỹ hết tiền rồi! :=(")
                    });
                }
                
                break;
           
           }
           else{
               message.reply('Sorry! You do not have permission to do this!');
               break;
           }
        }
        

        case 'avatar': {
            if(!args[1]){
                message.channel.send("@ người muốn xem avatar đi bạn!");
            
            }
            else{
                let mem = message.mentions.users.first();
                //let mem = message.guild.member(user);
                if(!mem) return message.channel.send('Member không tồn tại')
                
                else{
                    let embed = new MessageEmbed()
                    .setTitle(`Avatar của ${mem.username}`)
                    .setThumbnail(mem.avatarURL)
                    .setImage(mem.avatarURL)

                    message.channel.send(embed);
                }
            }
        }
        case 'command':{

            message.channel.send("Command List: 1. !card \n2. !avatar\n3. Đang phát triển thêm=))");
            break;
        }
    }

    
})
bot.login(token);