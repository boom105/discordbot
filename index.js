const { Client, MessageEmbed, RichEmbed } = require('discord.js');
const random = require('random')
const API = require('./BaokimAPI')
const Datastore = require('nedb')

const token = 'Njk4NDc1ODc2MjcwMjExMDcy.XpGYyA.IxP1a_z21Hgz_8ZFJhBWnWh8mRI';

const bot = new Client();
const PREFIX = '!';

let arr = [];

var db = new Datastore({filename: './gamedata'});
db.loadDatabase();


bot.on('ready',() => {
    console.log('This bot is online!');
    guild = bot.guilds.cache.get('696736563803193375');
    var memlist = guild.members.cache.filter(mem => !mem.user.bot)
                                    .map(mem => mem.user.id);
    
    memlist.forEach(mem => arr.push({"userID" : mem,"username": guild.members.cache.find(m => m.user.id == mem), "points" : 0}));
    arr.forEach(mem => {
        db.find({userID: mem.userID},function(err,doc){
        if(!doc.length){
            db.insert(mem,function(err,doc){
            if(err) throw err;
            console.log('Add new member' + " successfully!");
            })
        }
        else{     
            console.log('--------------');   
        }
        })
    })
    
})

bot.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'chung');

    if(!channel) return;
    channel.send(`Chào mừng ${member} đến với server của bọn mình.\nVuốt sang trái, vào kênh voice Chung để vô voice chat bạn nhé!`);

    var newmem = {"userID": member.user.id, "points" : 0};
    db.find({userID: newmem.userID},function(err,doc){
        if(!doc.length){
        db.insert(newmem,function(err,doc){
            if(err) throw err;
            console.log('Add new member' + " successfully!");
        })
        }
        else{   
        console.log('/-----------------')     
        }
    })
})

bot.on('message', message=> {

    var ID = message.author.id; 
    var author = message.author.username;
    
    let args = message.content.substring(PREFIX.length).split(" ");
    switch(args[0])
    {
        case 'card':{
            
           if(ID != '650581972560904202'){
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
                            .setImage(user.avatarURL('png'));
                                                       
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
                    .setImage(mem.avatarURL('png'));
                    message.channel.send(embed);
                    break;
                }
                break;
            }
        }


        case 'flip': {
            let ran = random.int(1,2);
            if(ran == 1){
                db.update({userID: ID},{$inc: {points:50}}, {upsert:false},function(err,number){              
                })
                message.channel.send(`Mừng ${author} nhé! Bạn vừa thắng được 50 points rồi!\n Bạn có thể kiểm tra số point hiện có bằng lệnh !points`);
    
            }
            else{
                message.reply('Xịt rồi! Thử lần sau bạn nhé! Love you=))')
            }
            break;
        }
    
        case 'roulette': {
          db.find({userID: ID},function(err,doc){
            if(doc[0].points < 1000){
              message.reply('Xin lỗi! Bạn phải có trên 1000 points để chơi trò này')
            }
            else{
              let pos = random.int(1,3);
              if(pos == 1){
                db.update({userID: ID},{$inc: {points:300}}, {upsert:false},function(err,number){              
                })
                message.reply(`Mừng bạn đã may mắn sống sót! Bạn  được cộng thêm 300 points vì sự dũng cảm!\n Bạn có thể kiểm tra số point hiện có bằng lệnh !points`);
              }
              else{
                db.update({userID: ID},{$inc: {points:-1000}}, {upsert:false},function(err,number){              
                })
                message.reply('Đoànnnnng! You have died!!! Bạn vừa bị trừ 1000 points vì sự dại dột =))).\nHãy cân nhắc kỹ lần chơi sau bạn nhé!')
              }
            }
          })
          
          break;
        }
    
        case 'moneyheist':{
          db.find({userID: ID}, function(err,doc){
            if(doc[0].points < 200){
                message.reply('Xin lỗi! Bạn phải có trên 200 points để chơi trò này')
            }
            else{
              let poss = random.int(1,1000);
              if (poss == 1) {
                db.update({userID: ID},{$inc: {points:20000}}, {upsert:false},function(err,number){              
                })
                message.reply('OHHHHHHHHHHHHHHHHHHHHHHHHHH. Bạn vừa cướp nhà băng thành công! Bạn cướp được 20000 points và nhận được 1 phần quà đặc biệt từ Big Boss!');
              } else {
                db.update({userID: ID},{$inc: {points: -200}}, {upsert:false},function(err,number){              
                })
                message.reply('Bạn vừa bị cảnh sát bắt và phải nộp phạt 200 points tiền bảo lãnh vì các hành vi sau:\nCướp ngân hàng, cưỡng dâm một con heo và đẩy bà già xuống biển!!!!!!!!!!!')
              }
            }
          })
          break;
        }
    
        case 'points': {
          if(!args[1]){
            db.find({userID: ID},function(err,doc){
              message.reply(`Số points hiện tại của bạn là: ${doc[0].points}`)
            })
          }
          else if(args[1] == '-top'){
            db.find({}).sort({points: -1}).exec(function(err,doc){
                message.channel.send('------------TOP 5------------')
              for(i = 0; i <5; i++){
                  message.channel.send(doc[i].username + ' has ' + doc[i].points + ' points');
              }
                message.channel.send('-----------------------------')
          })
          }
          break;
        }
    
        case 'give': {
          if(ID != '650581972560904202'){
            return message.reply('Sorry! You do not have permission to do this!');
          }
          else{
            if(args[1] == '-all'){
              if(!Number.isInteger(parseInt(args[2],10))){
                return message.reply('Số points phải là số tự nhiên!');
              }
              else{
                db.update({},{$inc: {points: parseInt(args[2],10)}}, {upsert:false, multi:true},function(err,number){              
                })
                return message.reply('bạn vừa cộng cho tất cả thành viên: ' + args[2] + ' points!');
              }
            }
            else{
              var luckymem = message.mentions.users.first();
              if(!luckymem){
                return message.reply('Command: !give @member số_points');
              }
              else if(!args[2]){
                return message.reply('Command: !give @member số_points');
              }
              else if(!Number.isInteger(parseInt(args[2],10))){
                return message.reply('Số points phải là số tự nhiên!');
              }
              else{
                db.update({userID: ID},{$inc: {points: parseInt(args[2],10)}}, {upsert:false},function(err,number){              
                })
                return message.reply('bạn vừa cộng cho member ' + luckymem.username + args[2] + ' points!');
              }
            }
    
          }
    
          break;
        }
    
        case 'resetpoint':{
          if (ID != '650581972560904202') {
            return message.reply('Sorry! You do not have permission to do this!');
          } else {
            db.update({},{$set: {points: 0}}, {multi: true}, function(err,number){
              if(!err){
                message.reply('Bạn vừa reset points của mọi người về 0');
              }
            });
          }
          break;
        }
    
    
    
        case 'game': {
          message.channel.send('GameCenter commands list:\n' + 
                                '/------------------- GAME LIST --------------------------/' +
                                '\n1. !flip : tung đồng xu, winrate: 1/2, thưởng - phạt: 50 - 0' + 
                                '\n2. !roulette: Cò quay nga, winrate: 4/6, thưởng - phạt: 300 - 1000' + 
                                '\n3. !moneyheist: Cướp ngân hàng, winrate: 1/1000, thưởng - phạt: 20000 - 200, bonus 01 phần quà từ Big Boss' + 
                                '\n4. !challenge @member số_points để thách đấu / !challenge -accecpt để nhận lời thách đấu (Cái này hơi khó, vẫn đang triển khai =)) )'+
                                '\n/------------------ PLAYER INFO -------------------------/' + 
                                '\n 1. !points : Kiểm tra số points hiện có' +
                                '\n2. !points -top: Để xem bảng top tài phú ' +
                                '\n3. Đang suy nghĩ thêm!' + 
                                '\n/-------------------- RULE -------------------------------/' +
                                '\n @@ Mỗi mùng 1 hàng tháng sẽ tổng kết số points 1 lần, ai nhiều points nhất sẽ được: ' + 
                                '\n1. 01 card 100k từ BOSS ' +
                                '\n2. Mỗi thành viên sẽ phải tặng người thắng 01 món quà (VD: card, hát tặng 01 bài, ảnh chân dung,... ) Tùy thỏa thuận giữa Winner và thành viên)' +
                                '\n @@ Bạn đồng ý tham gia là phải đồng ý các điều khoản trên. Bạn sẽ tham gia chứ?')
            break;
        }
        
      

        case 'command':{
            message.channel.send("Command List: \n1. !card @member nhà_mạng or !card -random nhà_mạng {viettel, vina, mobi}" +
                                                "\n2. !avatar hoặc !avatar @member" +
                                                "\n3. !balance" +
                                                 "\n4. Đang phát triển thêm=))");
                                                 
            break;
        }
    }

    
})
bot.login(token);