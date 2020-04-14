const { Client, MessageEmbed, RichEmbed } = require('discord.js');
const random = require('random')
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
                    return message.reply('Sai cú pháp rồi!!!    command: !card @member nhà_mạng or !card -random nhà_mạng');
                }
                if(!args[1]){
                    return message.reply("Sai cú pháp rồi!!!    command: !card @member nhà_mạng or !card -random nhà_mạng");
                }

                let luckymember;

                if(args[1] === '-random'){
                    var  memlist = message.guild.members.cache.filter(mem => mem.presence.status !== 'offline' && !mem.user.bot).map(mem =>mem.user);
                    //message.channel.send(memlist);
                    let num = random.int(0,memlist.length-1);
                    luckymember = memlist[num];
                    // console.log(num);
                    // console.log("Number: " + memlist.length)
                    // console.log("lucky member: " + memlist[num].username);
                    // //console.log(memlist.forEach(mem => console.log(mem)));
                }
                else{
                    luckymember = message.mentions.users.first();
                
                    if(!luckymember){
                        return message.reply("Thành viên không tồn tại!!!")
                    }
                }

                if(!args[2]){
                    return message.reply("Quên nhập nhà mạng rồi =))")
                }

                              
                let isp = args[2].toLocaleLowerCase();
                if((isp != 'viettel'  && (isp != 'vina') && (isp != 'mobi'))){
                    return message.reply('Sai tên nhà mạng rồi mod ơi =))')
                    
                }
                else {
                    
                    API.buyCard(isp,10000).then((result) => {
                        if(result.data.data.success == 1){
                            var card = result.data.data.param + '\nPIN: ' 
                                    + result.data.data.pin + '\nSeri: ' + result.data.data.seri;
                            luckymember.send(card)
                            message.channel.send(`Chúc mừng ${luckymember.username}! Vui lòng check direct message bạn nhé =))`);
                        }
                        else{
                            message.channel.send(result.data);
                        }
                    }).catch((err) => {
                        message.reply(err)
                    });

                }
                
                break;
           
           }
           else{
               message.reply('Sorry! You do not have permission to do this!');
               break;
           }
        }
        
        case 'balance':{
            API.getBalance().then((result) => {
                return message.channel.send( 'Ngân khố còn: ' + result.data.data.balance);
                
            }).catch((err) => {
                return message.channel.send(err) });              
                
            break;
        }
        case 'avatar': {
            if(!args[1]){
                var user = message.author;
                if(!user.avatarURL){
                    message.channel.send("Member chưa set avatar");
                }
                var embed = new MessageEmbed()
                            .setImage(user.avatarURL('jpg',256));
                            
                            
                message.channel.send(embed);
                break;
                
            }
            else{
                let mem = message.mentions.users.first();
                //let mem = message.guild.member(user);
                if(!mem) return message.channel.send('Member không tồn tại')
                if(!mem.avatarURL){
                    message.channel.send("Member chưa set avatar");
                }
                else{
                    let embed = new MessageEmbed()
                            .setImage(mem.avatarURL('jpg',256))
                    message.channel.send(embed);
                    break;
                }
                break;
            }
        }


        case 'command':{
            message.channel.send("Command List: \n1. !card @member nhà_mạng or !card -random nhà_mạng {viettel, vinaphone, mobifone}" +
                                                "\n2. !avatar hoặc !avatar @member" +
                                                "\n3. !balance" +
                                                 "\n4. Đang phát triển thêm=))");
                                                 
            break;
        }
    }

    
})
bot.login(token);