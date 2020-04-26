const { Client, MessageEmbed, RichEmbed } = require('discord.js');
const Parser = require('rss-parser');
const random = require('random')
const API = require('./BaokimAPI')
const { DateTime } = require('luxon');
const Datastore = require('nedb')
const {generateText,generateValue} = require('./generateText');

const token = process.env.BOT_TOKEN;

const bot = new Client();
const PREFIX = '!';

let dt = new Date();
let parser = new Parser();
let arr = [];

var db = new Datastore({filename: './gamedata'});
db.loadDatabase();

var userMap = new Map();
let gambleMap = new Map();

var guild;

//Check time to place new bet
function checkTime(){
  return (dt.hour >= 8 && dt.hour <= 18) ? true : false;
}


bot.on('ready',() => {
    console.log('This bot is online!');
    guild = bot.guilds.cache.get('696736563803193375');
    var memlist = guild.members.cache.filter(mem => !mem.user.bot)
                                    .map(mem => mem.user.id);
    
    memlist.forEach(mem => arr.push({"userID" : mem,"username": guild.members.cache.find(m => m.user.id == mem).user.username, "points" : 0}));
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
    var channel = member.guild.channels.cache.find(ch => ch.id === '696736564235206848');

    if(!channel) return;
    channel.send(`Chào mừng ${member} đến với server của bọn mình.\nVuốt sang trái, vào kênh voice Chung để vô voice chat bạn nhé!`);

    var role = member.guild.roles.cache.find(role => role.name == 'member');
    if(!role) return;

    member.roles.add(role);

    var newmem = {"userID": member.user.id, "username": member.user.username,"points" : 0};
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
    if (message.content.startsWith(PREFIX)) {
      let args = message.content.substring(PREFIX.length).match(/\S+/g);
      if(args.length > 3) return message.reply('Sai cú pháp. Xem !game hoặc !gamble để xem các lệnh');
      var allow = 0;
      if(message.channel.id == '700715951532015704'){
        allow = 1;
      }
      else{
        allow = 0;
      }

      switch(args[0])
      {
          case 'card':{
              
            if(ID == '650581972560904202'){
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

          /*----------------------------------------------------------- */
          case 'avatar': {//Xem avatar
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

          /*----------------------------------------------------------- */
          case 'challenge': {
            if(args[1] == '-accept'){
              var op = message.mentions.users.first();
              if(!op){
                return message.channel.send('Command: !challegne -accept @member !');
              }
              else{
                if(!userMap.has(op.id)){
                  message.reply('Người ta có thách đấu bạn đâu mà ham hố =)))');
                }
                else{
                  var challenger = userMap.get(op.id);
                  if(challenger.opponent != ID){
                    message.reply('Người ta có thách đấu bạn đâu mà ham hố =)))');
                  }
                  else{
                    db.find({userID: ID},function(err,doc){
                      if(doc[0].points < challenger.amount){
                        message.reply('Bạn không đủ tiền để nhận thách đấu! Đã huỷ thách đấu!');                  
                      }
                      else{
                        var poss = random.int(1,2);
                        if(poss == 1){
                          db.update({userID: ID},{$inc: {points: challenger.amount}},{},(err)=>{})
                          db.update({userID: op.id},{$inc: {points: -challenger.amount}},{},(err)=>{})
      
                          message.reply('Bạn vừa thắng cược ' + challenger.amount + ' points sau cuộc đấu súng đẫm máu với ' + challenger.username + '!!!!');
                          message.channel.send('Này ' + `<@!${op.id}>` + '! Dưới Suối vàng, Gửi lời hỏi thăm sức khỏe tới Howard Roark hộ tôi nhé! Cảm ơn!\n Quên!Bạn vừa bị trừ ' + challenger.amount + ' points nữa nhé');
                        }
                        else{
                          db.update({userID: op.id},{$inc: {points: challenger.amount}},{},(err)=>{})
                          db.update({userID: ID},{$inc: {points: -challenger.amount}},{},(err)=>{})
      
                          message.channel.send('Chúc mừng ' + `<@!${op.id}>` +'! Bạn vừa thắng cược ' + challenger.amount + ' sau cuộc đấu súng đẫm máu với ' + challenger.username + '!!!!');               
                          message.reply('Này ' + author + '! Dưới Suối vàng, gửi lời hỏi thăm sức khỏe tới Howard Roark hộ tôi nhé! Cảm ơn!\nQuên! Bạn vừa bị trừ ' + challenger.amount + ' points nữa bạn nhé');   
                          
                        }
                      }
                    })
                    
                    userMap.delete(op.id);
                  }
                }
                
              }
            }

            else if(args[1] == '-cancel'){//Cancel Challenge
              if(userMap.has(ID)){
                message.reply('Bạn đã hủy lời thách đấu với ' + userMap.get(ID).opname);
                userMap.delete(ID);             
              }
              else{
                message.reply('Bạn chưa thách đấu với ai cả!');
              }
            }

            else{//
              var op = message.mentions.users.first();
              if(!op){
                message.channel.send('Command: !challenge @member số_points / !challenge -accept @member / !challenge -cancel!');
              }
              else if(op.id == ID){
                  return message.reply('Bạn không thể tự thách đấu bản thân!')
              }
              else{
                if(!Number.isInteger(parseInt(args[2].trim(),10))){
                  return message.channel.send('Số points phải là số tự nhiên. Not: ' + ' \'' + args[2].trim() + ' \'');
                }
                else if(parseInt(args[2].trim(),10) < 0){
                  return message.channel.send('Số points phải > 0');
                }
                else {
                  db.find({userID: ID},function(err,doc){
                    if(doc[0].points < args[2]){
                      message.channel.send('Hiện bạn có ' + doc[0].points + ' points không đủ để cược ' + args[2]);
                    }
                    else{
                      if(userMap.has(ID)){
                        message.reply('Bạn chỉ có thể thách đấu 1 người cùng lúc!!!');
                      }
                      else{
                        userMap.set(ID,{
                          username: author,
                          opponent: op.id,
                          opname : op.username,
                          amount: args[2]
                        })
              
                        message.reply('Bạn vừa thách đấu ' + op.username + ' '+ args[2] + ' points');
                      }
                    }
                  })
                }
              }
            }
            break;
          }

          /*-----------------------------------------------------------*/
          case 'flip': {
              if(allow){
                let ran = random.int(1,2);
                if(ran == 1){
                    db.update({userID: ID},{$inc: {points:50}}, {upsert:false},function(err,number){              
                    })
                    message.channel.send(`Mừng ${author} nhé! Bạn vừa thắng được 50 points rồi!\n Bạn có thể kiểm tra số point hiện có bằng lệnh !points`);
        
                }
                else{
                    message.reply('Xịt rồi! Thử lần sau bạn nhé! Love you=))')
                }
              }
              else{
                message.reply('This command is only can be used in #gamecenter')
              }
              break;
          }
      
          /*----------------------------------------------------------- */
          case 'roulette': {
            if (allow) {
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
            } else {
              message.reply('This command is only can be used in #gamecenter')
            }
            
            break;
          }
      

          /*----------------------------------------------------------- */
          case 'moneyheist':{
            if (allow) {
              db.find({userID: ID}, function(err,doc){
                if(doc[0].points < 200){
                    message.reply('Xin lỗi! Bạn phải có trên 200 points để chơi trò này')
                }
                else{
                  let poss = random.int(1,100);
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
            } else {
              message.reply('This command is only can be used in #gamecenter')
            }
            break;
          }
      
          /*----------------------------------------------------------- */
          case 'points': {
            if(!args[1]){
              db.find({userID: ID},function(err,doc){
                message.reply(`Số points hiện tại của bạn là: ${doc[0].points}`)
              })
            }
            else if(args[1] == '-top'){
              var text = '';
              db.find({}).sort({points: -1}).exec(function(err,doc){
                  text += '------------TOP 10------------\n' ;
                for(i = 0; i < 10; i++){
                  text += doc[i].username + ' has ' + doc[i].points + ' points\n'
                    
                }
                  text += '-----------------------------';
                  message.channel.send(text);
                  
            })
            }
            else if(args[1] == '-all'){
              var text = '';
              db.find({}).sort({points: -1}).exec((err,doc) => {
                text += '-----------List-------------------\n';
                for(i = 0; i < doc.length; i++)
                {
                  text += doc[i].username + ' has ' + doc[i].points + ' points\n';
                }

                text += '-----------------------------------';
                message.channel.send(text);
              })
            }
            break;
          }
      
          /*----------------------------------------------------------- */
          case 'lottery':{
            if (allow) {
              db.find({userID: ID}, function(err,doc){
                if(doc[0].points < 30000){
                  message.reply('Xin lỗi! Bạn phải có trên 30000 points để chơi trò này')
                }
                else{
                  if(!args[1]){
                    message.reply('Command: !lottery nhà_mạng {viettel , vina, mobi}');
                  }
                  else{
                    let isp = args[1].toLocaleLowerCase();
                    if((isp != 'viettel'  && (isp != 'vina') && (isp != 'mobi'))){
                        return message.reply('Command: !lottery nhà_mạng {viettel, vina, mobi} ');                    
                    }
                    else{
                      var poss = random.int(1,3);
                      if(poss == 1){
                        API.buyCard(isp,10000).then((result) => {
                          if(result.data.data.success == 1){
                              var card = result.data.data.param + '\nPIN: ' 
                                      + result.data.data.pin + '\nSeri: ' + result.data.data.seri;
                              message.author.send(card)
                              message.channel.send(`Chúc mừng ${author}! Bạn vừa trúng lottery. Vui long check direct message bạn nhé!`);
                          }
                          else{
                              message.channel.send(result.data);
                          }
                      }).catch((err) => {
                          message.reply('Lỗi rồi ' +err)
                      });
                      }
                      else{
                        message.reply('Bạn Xịt mất 30000 points là do bạn không chơi đồ đấy bạn ạ =))')
                        db.update({userID: ID}, {$inc: {point: -30000}},{},(err,num)=>{})
                      }
                    }
                  }
                }
              })
              
            } else {
              message.reply('This command is only can be used in #gamecenter')
            }
            break;
          }



          /*----------------------------------------------------------- */
          case 'lsd':{
            if((dt.getHours() <= 11) && (dt.getHours() >= 1)){
              var gambleInfo;
              let lsd = [];
              var text = ' ';
              var point = 0;
              var count = 0;
              if(args.length < 2){
                return message.reply('Command: Ví dụ: !lsd 12 1000 : để đánh 1000 points lô con 12\n!lsd 12,13,14 1000 : để đánh 1000 ptns lô mỗi con');
              }
              else{
                if(!Number.isInteger(parseInt(args[2],10)) || parseInt(args[2]) < 0){
                  return message.reply('Số points cược phải là số tự nhiên')
                }
                else{
                  if(!gambleMap.has(ID)){//Nếu chưa ghi nhận lần cược nào trong hôm nay thì tạo gambleInfo mới
                    if(args[1].includes(',')){
                      var temp = args[1].split(',');
                      
                      for(i = 0; i < temp.length; i++){
                        if(!Number.isInteger(parseInt(temp[i],10)) || parseInt(temp[i],10) < 0 || parseInt(temp[i],10) > 99){
                          text += '\n'+temp[i] + ' không phải số thuộc 00-99. Bỏ qua số này';
                          continue;
                        }
                        else{
                          var obj = [temp[i],parseInt(args[2],10)];
                          lsd.push(obj);                 
                          text += '\nBạn vừa ghi lô '+ temp[i] + ' : ' + args[2] + 'points';
                          count++;
                        }
                      }
        
                      point = count * parseInt(args[2],10);                          
                    }
        
                    else{
                      if(!Number.isInteger(parseInt(args[1],10)) || parseInt(args[1],10) < 0 || parseInt(args[1],10) > 99){
                        text += args[1] + ' không phải số từ 00 - 99. Đã hủy lệnh!\n';
                      }
                      else{
                        var obj = [args[1], args[2]];
                        lsd.push(obj);
                        text += '\nBạn vừa ghi lô ' + args[1] + ' : ' + args[2] + 'points';
                      }
                      
                      point = parseInt(args[2],10);
        
                    }
        
                    db.find({userID:ID},(err,doc)=>{
                      if(doc[0].points < point){
                        return message.reply('Bạn không đủ'+ point +' points để cược') 
                      }
                      else{
                        db.update({userID: ID}, {$inc: {points: -point}},{},err=>{return});
                        message.reply(text);
                        gambleMap.set(ID,{//Tạo mới gamble info
                          LSD: lsd,
                          DMT : [],
                          checkout: 0
                        })
                      }
                    })
                  
                  }
        
                  else{//Update thêm lệnh cược
                    gambleInfo = gambleMap.get(ID);
                    if(args[1].includes(',')){
                      var temp = args[1].split(',');
                      for(i = 0; i < temp.length; i++){
                        if(!Number.isInteger(parseInt(temp[i],10)) || parseInt(temp[i],10) < 0 || parseInt(temp[i],10) > 99){
                          text += '\n' + temp[i] + ' không phải số thuộc [00-99]. Bỏ qua số này';
                          continue;
                        }
                        else{
                          var obj = [temp[i],args[2]];
                          gambleInfo.LSD.push(obj);                 
                          text += '\nBạn vừa ghi lô '+ temp[i] + ' : ' + args[2] + 'points';
                          count++;
                        }
                      }
        
                      point = count * parseInt(args[2],10);
                      //message.reply(text);
                    }
                    else{
                      if(!Number.isInteger(parseInt(args[1],10)) || parseInt(args[1],10) < 0 || parseInt(args[1],10) > 99){
                        text += args[1] + ' không phải số từ 00 - 99. Đã hủy lệnh!';
                      }
                      else{
                        var obj = [args[1], args[2]];
                        gambleInfo.LSD.push(obj);
                        text += '\nBạn vừa ghi lô '+ args[1] + ' : ' + args[2] + 'points';
                      }
                      point = parseInt(args[2],10);
                      //message.reply(text);            
                    }
        
                    db.find({userID: ID}, (err,doc) => {
                      if(doc[0].points < point){
                        return message.reply('Bạn không đủ '+ point +' points để cược')
                      }
                      else{
                        db.update({userID: ID},{$inc: {points: -point}},{},err=>{return})
                        gambleMap.delete(ID);
                        gambleMap.set(ID,gambleInfo);
                        message.reply(text);
                      }
                    })
        
                  }
                }
              }      
            }
            else{
              message.reply('Bạn chỉ có thể thêm cược mới từ 08 giờ đến 18 giờ hàng ngày!');
            }
            break;
          }    
      

          /*----------------------------------------------------------- */
          case 'dmt':{
            if((dt.getHours() <= 11) && (dt.getHours() >= 1)){
              let gambleInfo;
            let dmt = [];
            let text = ' ';
            let point = 0;
            let count = 0;
            if(args.length < 2){
              return message.reply('Command: Ví dụ: !dmt 12 1000 : để đánh 1000 points đề con 12\n!dmt 12,13,14 1000 : để đánh 1000 ptns đề mỗi con 12,13,14');
            }
            else{
              if(!Number.isInteger(parseInt(args[2],10)) || parseInt(args[2]) < 0){
                return message.reply('Số points cược phải là số tự nhiên')
              }
              else{
                if(!gambleMap.has(ID)){//Nếu chưa ghi nhận lần cược nào trong hôm nay thì tạo gambleInfo mới
                  if(args[1].includes(',')){
                    var temp = args[1].split(',');
                    
                    for(i = 0; i < temp.length; i++){
                      if(!Number.isInteger(parseInt(temp[i],10)) || parseInt(temp[i],10) < 0 || parseInt(temp[i],10) > 99){
                        text += '\n'+ temp[i] + ' không phải số thuộc 00-99. Bỏ qua số này';
                        continue;
                      }
                      else{
                        var obj = [temp[i],args[2]];
                        dmt.push(obj);                 
                        text += '\nBạn vừa ghi đề '+ temp[i] + ' : ' + args[2] + 'points';
                        count++;
                      }
                    }
                    
                    point = count * parseInt(args[2],10);
      
                  }
                  else{
                    if(!Number.isInteger(parseInt(args[1],10)) || parseInt(args[1],10) < 0 || parseInt(args[1],10) > 99){
                      text += args[1] + ' không phải số từ 00 - 99. Đã hủy lệnh!';
                    }
                    else{
                      var obj = [args[1], args[2]];
                      dmt.push(obj);
                      text += 'Bạn vừa ghi đề ' + args[1] + ' : ' + args[2] + 'points';
                    }
                    
                    point = parseInt(args[2],10);
                  }
      
                  
                  db.find({userID:ID},(err,doc)=>{
                    if(doc[0].points < point){
                      return message.reply('Bạn không đủ '+ point +' points để cược') 
                    }
                    else{
                      db.update({userID: ID}, {$inc: {points: -point}},{},err=>{return});
                      message.reply(text);
                      gambleMap.set(ID,{//Tạo mới gamble info
                        LSD: [],
                        DMT : dmt,
                        checkout: 0
                      })
                    }
                  })
                }
      
                else{//Update thêm lệnh cược
                  gambleInfo = gambleMap.get(ID);
                  if(args[1].includes(',')){
                    var temp = args[1].split(',');
                    for(i = 0; i < temp.length; i++){
                      if(!Number.isInteger(parseInt(temp[i],10)) || parseInt(temp[i],10) < 0 || parseInt(temp[i],10) > 99){
                        text += '\n' + temp[i] + ' không phải số thuộc [00-99]. Bỏ qua số này';
                        continue;
                      }
                      else{
                        var obj = [temp[i],args[2]];
                        gambleInfo.DMT.push(obj);                 
                        text += '\nBạn vừa ghi đề '+ temp[i] + ' : ' + args[2] + 'points';
                        count++;
                      }
                    }
                    
                    point = count * parseInt(args[2],10);
                  }
                  else{
                    if(!Number.isInteger(parseInt(args[1],10)) || parseInt(args[1],10) < 0 || parseInt(args[1],10) > 99){
                      text += args[1] + ' không phải số từ 00 - 99. Đã hủy lệnh!';
                    }
                    else{
                      var obj = [args[1], args[2]];
                      gambleInfo.DMT.push(obj);
                      text += '\nBạn vừa ghi đề '+ args[1] + ' : ' + args[2] + 'points';
                    }
      
                    point = parseInt(args[2],10);            
                  }
      
                  db.find({userID:ID},(err,doc)=>{//kiểm tra liệu có đủ tiền cược
                    if(doc[0].points < point){// không đủ thì báo lỗi
                      return message.reply('Bạn không đủ '+ point +' points để cược') 
                    }
                    else{// đủ thì trừ tiền và báo thành công
                      db.update({userID: ID}, {$inc: {points: -point}},{},err=>{return});
                      message.reply(text);
                      gambleMap.delete(ID);
                      gambleMap.set(ID,gambleInfo);
                    }
                  })
                 
                }
              }
            }
            }
            else{
              message.reply('Bạn chỉ có thể thêm cược mới từ 08 giờ đến 18 giờ hàng ngày!');
            }
            
            break;
          }  
      

          /*----------------------------------------------------------- */
          case 'mylog': {
            if(!gambleMap.has(ID)){
              return message.reply('Bạn chưa đặt cược ngày hôm nay');
            }
            else{
              var text = '';
              var info = gambleMap.get(ID);
              if(info.LSD.length == 0 && info.DMT.length == 0){
                return message.reply('Bạn chưa đặt cược ngày hôm nay');
              }
              else{
                text += 'Ngày ' + dt.getDate() + '/' + dt.getMonth() + '/' + dt.getFullYear() + '\n';
                if(info.DMT.length != 0){
                  text += 'Đề: ';
                  info.DMT.forEach(d => {text += d[0] + ' - ' + d[1] +'; '})
                }
                if(info.LSD.length != 0){
                  text += '\nLô: ';
                    info.LSD.forEach(l => {text += l[0] + ' - ' + l[1] + '; '});
                }
                message.reply(text);
                }
              }
              break;
          }
           
          
          /*----------------------------------------------------------- */
          case 'checkout':{
            if(!gambleMap.has(ID)){
              message.reply('Bạn chưa đặt cược cho ngày hôm nay!');
            }
            else
            {
              let gambleInfo = gambleMap.get(ID);
              let lsd = gambleInfo.LSD;
              let dmt = gambleInfo.DMT;
              var content = [];
              var Lcontent = [];
              var Dcontent = [];
              var Lmsg = '';
              var bonusvalue = 0;
      
              parser.parseURL('https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss',(err,feed)=>{
                if(err) throw err;
                var title = feed.items[0].title;
                      if(dt.getHours() >= 12){
                        var result = feed.items[0].content.split('\n').forEach(m => {
                          var temp = m.split(' ')
                          temp.splice(0,1);
                          temp.forEach(m => {
                              if (Number.isInteger(parseInt(m,10))) {
                                  content.push(m);
                              }
                          })
                          
                        })
                      
                        for(i = 0; i < content.length; i ++)
                        {
                          Lcontent.push(content[i]%100);
                        }
      
                        //Soi Đề
                        for(i = 0; i < dmt.length; i++)
                        {
                          var win = 0;
                          if(parseInt(dmt[i][0]) == Lcontent[0])
                          {
                            win = 1;
                            Lmsg += 'Đề: ' + dmt[i][0] + '-' + dmt[i][1] + ' points - Trúng\n' + 
                                    'Bạn được cộng ' + 70*parseInt(dmt[i][1],10) + ' points vào quỹ điểm!!\n';
                            bonusvalue += 70*parseInt(dmt[i][1],10);
                            break;
                          }
                          else{
                            Lmsg += 'Đề: ' + dmt[i][0] + '-' + dmt[i][1] + ' points - Xịt\n';
                          }                  
                        }
                        
      
                        //Soi Lô
                        for(i = 0; i < lsd.length; i++)
                        {
                          var count = 0;
                          var num = parseInt(lsd[i][0],10);
                          var value = parseInt(lsd[i][1],10);
                          for(j = 0; j < Lcontent.length; j++)
                          {
                            if(num == Lcontent[j])
                            {
                              count++;
                            }
                          }
                          if(count == 0){
                            Lmsg += 'Lô '+num + '-' + value +' Xịt!!!\n'
                          }
                          else if(count > 0 && count < 7)
                          {
                            Lmsg += generateText(count,num,value);
                            bonusvalue += generateValue(count,value);
                          }
                          else{
                            Lmsg += 'Lô về nhiều hơn 6 nháy. Hãy nhờ Admin cộng thủ công bằng tay' 
                          }
                        }
      
                        db.update({userID: ID},{$inc: {points: bonusvalue}},{},err=>{});
                        gambleMap.delete(ID);
                        message.reply(Lmsg);
                      
                      }
                      else{
                        return message.reply('Chưa có kqxs ngày hôm nay');
                      }
              })
                    
                    
              
            }
            break;
          }


          /*----------------------------------------------------------- */
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
                  db.update({},{$inc: {points: parseInt(args[2].trim(),10)}}, {upsert:false, multi:true},function(err,number){              
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
                  db.update({userID: luckymem.id},{$inc: {points: parseInt(args[2].trim(),10)}}, {upsert:false},function(err,number){              
                  })
                  return message.reply('bạn vừa cộng cho member ' + luckymem.username + ' '+ args[2] + ' points!');
                }
              }
      
            }
      
            break;
          }
      

          /*----------------------------------------------------------- */
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
      

          /*----------------------------------------------------------- */
          case 'setpoint':{
            if (ID != '650581972560904202') {
              return message.reply('Sorry! You do not have permission to do this!');
            }
            else{
              var mem = message.mentions.users.first();
              if(!mem){
                message.reply('Command: !setpoint @member số_point')
              }
              if(!Number.isInteger(parseInt(args[2],10))){
                return message.reply('Số points phải là số tự nhiên!');
              }
              else{
                db.update({userID: mem.id},{$set: {points: parseInt(args[2],10)}}, {upsert:false},function(err,number){              
                })
                message.reply('bạn vừa set số point của ' + mem.username + ' thành: ' + args[2]);
              }
      
            }
            break;
          }
      

          /*------------------------------------------------------------*/
          case 'kqxs':{
            parser.parseURL('https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss')
                  .then(output => {
                    var msg = output.items[0].title + '\n' + output.items[0].content;
                    message.channel.send(msg);
                    
                  })
            break;
          }


          /*------------------------------------------------------------*/
          case 'game': {
            message.channel.send('----------------------GAMECENTER COMMANDS LIST-----------------\n' +
                                  '1. !flip          require: 0, wr: 1/2, w-l: 50-0\n'+
                                  '2. !roulette      require: 1000, wr: 4/6, w-l: 300-1000\n'+
                                  '3. !moneyheist    require: 200, wr: 1/100, w-l: 20000-200 (**)\n'+
                                  '4. !challenge @member số_point / challenge -accept @member / !challenge -cancel' +
                                  '5. !lottery nhà_mạng          require: 30000, wr:1/3, w-l: card(10) - 30000ptns\n' +
                                  '--------------------------------------------------------------\n');
              break;
          }
          
        
          case 'gamble':{
            message.channel.send('--------------------GAMBLE COMMANDS LIST------------------------\n'+
                                  '1. !dmt number(s) số_point: Ghi Đề. (x70)\n' +
                                  '2. !lsd number(s) số_points: Ghi Lô.(về 1x3, 2x10, 3x40, 4x100, 5x200)\n'+
                                  '3. !mylog : Xem mình đang ghi những con nào\n'+
                                  '4. !checkout: Sau  19h hàng ngày dùng lệnh này để nhận points nếu đánh trúng,\n '+
                                  'tới 02 giờ sáng ngày kế tiếp mà chưa !checkout thì bị xóa khỏi hàng đợi, coi như mất luôn\n'+
                                  '---------------------------------------------------------------\n' +
                                  'Note: 1. Chỉ ghi được lô và đề trong khoảng từ 08h sáng tới 18h chiều mỗi ngày\n'+
                                  '---------------------------------------------------------------')
            break;
          }

          /*------------------------------------------------------------*/
          case 'command':{
              message.channel.send("");
                                                  
              break;
          }

          case 'time':{
            var td = new Date();
            //td.getHours();
            message.reply(td.toDateString() + '  ' + td.getHours() + ':' + td.getMinutes());
            break;
          }
    }
    } else {
      
    }
    
    
})

function resetGambleMap(){
  if(dt.getHours() >= 17 && dt.getHours() <=18){
    if(gambleMap.size > 0){
      
      var iterator = gambleMap.keys();
      let memid = iterator.next();
      while(!memid.done){
        //var guild = bot.guilds.cache.get('650591236327079943');
        var user = guild.members.cache.find(mem=> mem.user.id == memid.value);
        user.send('Quá 0 giờ mà bạn chưa !checkout. Nên các giá trị bạn cược trong hôm qua đã bị xóa!');
        memid = iterator.next();
      }
      gambleMap.clear(); 
    }
  }
}


setInterval(resetGambleMap,60*60*1000);

bot.login(token);