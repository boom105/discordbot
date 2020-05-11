const API = require('./util/BaokimAPI');
const random = require('random')
const Parser = require('rss-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./database/user');
const Challenge = require('./database/challenge');
const { checkValidNumber, checkValidPoint, generateText, generateValue } = require('./util/helper');

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0-flneq.gcp.mongodb.net/discordbot?retryWrites=true&w=majority`

var bot = require('./discord-client').init();

const { ready } = require('./events/ready');
const { guildMemberAdd } = require('./events/guildMemberAdd');
const { guildMemberRemove } = require('./events/guildMemberRemove');
const { MessageEmbed } = require('discord.js');


const PREFIX = '!';
const token = process.env.BOT_TOKEN;
const parser = new Parser();


bot.on('ready', ready);

bot.on('guildMemberAdd', guildMemberAdd);

bot.on('guildMemberRemove', guildMemberRemove);

bot.on('message', message => {
  let ID = message.author.id;
  let author = message.author.username;
  let args = [];
  let allow = false;
  if (message.channel.id === '700715951532015704') {
    allow = true;
  }
  if (message.content.startsWith(PREFIX)) {
    args = message.content.substring(PREFIX.length).match(/\S+/g);

    switch (args[0]) {
      case 'card': {

        if (ID == process.env.ADMIN_ID) {
          if (args.length > 3) {
            return message.reply('Sai cú pháp rồi!!!    command: !card @member nhà_mạng or !card -random nhà_mạng');
          }
          if (!args[1]) {
            return message.reply("Sai cú pháp rồi!!!    command: !card @member nhà_mạng or !card -random nhà_mạng");
          }

          let luckymember;

          if (args[1] === '-random') {
            var memlist = message.guild.members.cache.filter(mem => mem.presence.status !== 'offline' && !mem.user.bot).map(mem => mem.user);
            let num = random.int(0, memlist.length - 1);
            luckymember = memlist[num];

          }
          else {
            luckymember = message.mentions.users.first();

            if (!luckymember) {
              return message.reply("Thành viên không tồn tại!!!")
            }
          }

          if (!args[2]) {
            return message.reply("Quên nhập nhà mạng rồi =))")
          }


          let isp = args[2].toLocaleLowerCase();
          if ((isp != 'viettel' && (isp != 'vina') && (isp != 'mobi'))) {
            return message.reply('Sai tên nhà mạng rồi mod ơi =))')

          }
          else {

            API.buyCard(isp, 10000).then((result) => {
              if (result.data.data.success == 1) {
                var card = result.data.data.param + '\nPIN: '
                  + result.data.data.pin + '\nSeri: ' + result.data.data.seri;
                luckymember.send(card)
                message.channel.send(`Chúc mừng ${luckymember.username}! Vui lòng check direct message bạn nhé =))`);
              }
              else {
                message.channel.send(result.data);
              }
            }).catch((err) => {
              message.reply(err)
            });

          }

          break;

        }
        else {
          message.reply('Sorry! You do not have permission to do this!');
          break;
        }
      }

      /*-----------------------------------------*/
      case 'avatar': {//Xem avatar
        if (!args[1]) {
          var user = message.author;
          if (!user.avatarURL) {
            message.channel.send("Member chưa set avatar");
          }
          var embed = new MessageEmbed()
            .setImage(user.avatarURL('png'));

          message.channel.send(embed);
          break;

        }
        else {
          let mem = message.mentions.users.first();
          if (!mem) return message.channel.send('Member không tồn tại')
          if (!mem.avatarURL) {
            message.channel.send("Member chưa set avatar");
          }
          else {
            let embed = new MessageEmbed()
              .setImage(mem.avatarURL('png'));
            message.channel.send(embed);
            break;
          }
          break;
        }
      }

      /*-----------------------------------------*/
      case 'balance': {
        API.getBalance().then((result) => {
          return message.channel.send('Ngân khố còn: ' + result.data.data.balance);

        }).catch((err) => {
          return message.channel.send(err)
        });

        break;
      }

      /*-----------------------------------------*/
      case 'point': {
        if (!args[1]) {
          User.findOne({ userId: ID }, (err, user) => {
            message.reply('Số point hiện tại của bạn là: ' + user.point);
          })
        }
        else if (args[1] == '-top') {
          var text = '';
          User.find({}).sort({ point: 1 }).limit(10).exec(function (err, users) {
            text += '-------------TOP 10-------------\n';
            users.forEach(user => {
              text += user.name + ': ' + user.point + ' points\n';
            });
            text += '--------------------------------\n';
            message.channel.send(text);
          })
        }
        else if (args[1] == '-all') {
          var text = '';
          User.find({}).sort({ point: 1 }).exec(function (err, users) {
            text += '-------------LIST-------------\n';
            users.forEach(user => {
              text += user.name + ': ' + user.point + ' points\n';
            });
            text += '--------------------------------\n';
            message.channel.send(text);

          })
        }
        break;
      }

      /*-----------------------------------------*/
      case 'flip': {//coinflip
        if (allow) {
          let ran = random.int(1, 2);
          if (ran == 1) {

            User.findOne({ userId: ID })
              .then(user => {
                user.point += 50;
                return user.save();
              })
              .then(result => {
                message.channel.send(`Mừng ${author} nhé! Bạn vừa thắng được 50 points rồi!\n Bạn có thể kiểm tra số point hiện có bằng lệnh !point`)
              })
              .catch(err => console.log(err));
          }
          else {
            message.reply('Xịt rồi! Thử lần sau bạn nhé! Love you=))')
          }
        }
        else {
          message.reply('Bạn phải vào #game-channel để sử dụng lệnh này');
        }
        break;
      }

      /*-----------------------------------------*/
      case 'roulette': {//russian roulette
        if (allow) {
          let msg = '';
          User.findOne({ userId: ID, point: { $gte: 1000 } })
            .then(user => {
              if (!user) {
                return message.reply('Xin lỗi! Bạn phải có trên 1000 points để chơi trò này')
              }
              else {
                let pos = random.int(1, 3);
                if (pos == 1) {
                  user.point += 300;
                  msg += 'Mừng bạn đã may mắn sống sót! Bạn  được cộng thêm 300 points vì sự dũng cảm!\n Bạn có thể kiểm tra số point hiện có bằng lệnh !point';
                }
                else {
                  user.point -= 1000;
                  msg += 'Đoànnnnng! You have died!!! Bạn vừa bị trừ 1000 points vì sự dại dột =))).\nHãy cân nhắc kỹ lần chơi sau bạn nhé!';
                }
                user.save()
                  .then(result => {
                    message.reply(msg);
                  })
                  .catch(err => console.log(err));
              }
            })
            .catch(err => {
              message.reply(err);
            })
        }
        else {
          message.reply('Bạn phải vào #game-channel để sử dụng lệnh này');
        }
        break;
      }

      /*-----------------------------------------*/
      case 'moneyheist': {
        if (allow) {
          let text = " ";
          User.findOne({ userId: ID, point: { $gte: 200 } })
            .then(user => {
              if (!user) {
                return message.reply('Bạn cần tối thiểu 200 points để chơi trò này');
              }
              else {
                let pos = random.int(1, 100);

                if (pos === 1) {
                  user.point += 20000;
                  text += 'OHHHHHHHHHHHHHHHHHHHHHHHHHH. Bạn vừa cướp nhà băng thành công! Bạn cướp được 20000 points và nhận được 1 phần quà đặc biệt từ Big Boss!';
                }
                else {
                  user.point -= 200;
                  text += 'Bạn vừa bị cảnh sát bắt và phải nộp phạt 200 points tiền bảo lãnh vì các hành vi sau:\nCướp ngân hàng, cưỡng dâm một con heo và đẩy bà già xuống biển!!!!!!!!!!!'
                }

                return user.save()
              }
            })
            .then(result => {
              message.reply(text)
            })
            .catch(err => console.log(err));
        }
        else {
          message.reply('Bạn phải vào #game-channel để sử dụng lệnh này');
        }
        break;
      }

      /*-----------------------------------------*/
      case 'cl': {//Challenge an other member
        if (args[1] === '-accept') {
          Challenge.findOne({ 'opponent.discordId': ID })
            .then(cl => {
              if (!cl) {
                return message.reply('Chưa có ai thách đấu bạn cả');
              }
              else {
                let cl_id = cl._id;
                User.findOne({ userId: ID, point: { $gte: cl.point } })
                  .then(user => {
                    if (!user) {
                      Challenge.deleteOne({ _id: cl_id })
                        .then(result => {
                          message.reply('Bạn không đủ point để cược. Đã hủy thách đấu!');
                        })
                        .catch(err => console.log(err))
                    }
                    else {
                      let pos = random.int(1, 2);
                      if (pos == 1) {
                        User.findOneAndUpdate({ userId: ID }, { $inc: { point: cl.point } }, err => console.log(err));
                        User.findOneAndUpdate({ userId: cl.member.discordId }, { $inc: { point: -cl.point } }, err => console.log(err));
                        message.reply('Bạn vừa thắng cược: ' + cl.point + ' sau cuộc đấu súng với ' + cl.member.name);
                        message.channel.send(`${cl.member.name} yên nghỉ bạn nhớ!`);
                      }
                      else {
                        User.findOneAndUpdate({ userId: cl.member.discordId }, { $inc: { point: cl.point } }, err => console.log(err));
                        User.findOneAndUpdate({ userId: ID }, { $inc: { point: -cl.point } }, err => console.log(err));
                        message.reply('yên nghỉ bạn nhớ');
                        message.channel.send(`${cl.opponent.name} bạn vừa thắng ${cl.point} sau cuộc đấu sung với ${author}`);
                      }
                      Challenge.deleteOne({ _id: cl_id }, err => console.log(err));
                    }
                  })
              }
            })
        }
        else if (args[1] === '-cancel') {
          Challenge.deleteOne({ 'member.discordId': ID }, (err, res) => {
            if (err) {
              message.reply('Bạn chưa thách đấu ai cả');
            }
            else {
              if (res.deletedCount == 0) {
                return message.reply('Bạn chưa thách đấu ai cả');
              }
              message.reply('bạn vừa hủy thách đấu thành công!');
            }
          })
        }
        else {
          let op = message.mentions.members.first();
          if (!op) {
            return message.reply('Sai cú pháp: Command: !cl @member số_point || !cl -accept || !cl -cancel');
          }
          else if (op.id === ID) {
            return message.reply('Bạn không thể tự thách đấu bản thân');
          }
          else {
            Challenge.findOne({ 'member.discordId': ID })
              .then(ch => {
                if (ch) {
                  return message.reply(`Bạn đang thách đấu ${ch.opponent.name}! Bạn chỉ có thể thách đấu một người cung lúc!`);
                }
                else {
                  return Challenge.findOne({ 'opponent.discordId': op.id })
                }
              })
              .then(c => {
                if (c) {
                  return message.reply(`${c.opponent.name} đang được thách đấu bởi ${c.member.name}\n
                                      Đợi bọn nó xử nhau xong bạn nhé`);
                }
                else {
                  if (!Number.isInteger(parseInt(args[2].trim(), 10))) {
                    return message.channel.send('Số points phải là số tự nhiên. Not: ' + ' \'' + args[2].trim() + ' \'');
                  }
                  else if (parseInt(args[2].trim(), 10) < 0) {
                    return message.channel.send('Số points phải > 0');
                  }
                  else {
                    User.findOne({ userId: ID, point: { $gte: parseInt(args[2], 10) } })
                      .then(user => {
                        if (!user) {
                          return message.reply('Bạn không đủ ' + parseInt(args[2], 10) + ' để cược');
                        }
                        else {
                          Challenge.collection.insertOne({
                            member: {
                              discordId: ID,
                              name: author
                            },
                            opponent: {
                              discordId: op.id,
                              name: op.user.username
                            },
                            point: parseInt(args[2], 10)
                          })
                            .then(result => {
                              message.reply('Bạn vừa thách đấu ' + op.user.username + ' với số point: ' + args[2]);
                            })
                        }
                      })
                      .catch(err => console.log(err));
                  }
                }
              })
              .catch(err => console.log(err));
          }
        }
        break;
      }

      /*-----------------------------------------*/
      case 'lsd': {//Ghi Lô
        let date = new Date();
        if (date.getHours() >= 1 && date.getHours() <= 11) {
          if (args[1].includes(',')) {
            let temp = args[1].split(',');
            let count = 0;
            let point = 0;
            let msg = '';
            let lsd = [];

            if (!checkValidPoint(args[2])) {
              return message.reply('Số point phải là số tự nhiên');
            }
            else {
              for (let i = 0; i < temp.length; i++) {
                if (!checkValidNumber(temp[i])) {
                  msg += temp[i] + ' không thuộc khoảng 00 - 99. Bỏ qua số này\n';
                  continue;
                }
                else {
                  lsd.push({ num: parseInt(temp[i], 10), amount: parseInt(args[2], 10) });
                  count++;
                }
              }


              point = count * parseInt(args[2], 10);

              if (point <= 0) {
                return message.reply(msg);
              }
              else {
                User.findOne({ userId: ID, point: { $gte: point } })
                  .then(user => {
                    if (!user) {
                      console.log('a');
                      return message.reply('Bạn không đủ ' + point + ' points để cược. Đã hủy lệnh ghi!');
                    }
                    else {

                      if (user.gamble.lsd.length > 0) {
                        user.point -= point;
                        lsd.forEach(l => {
                          let index = user.gamble.lsd.findIndex(lo => lo.num === l.num);
                          if (index >= 0) {
                            msg += 'Bạn vừa ghi thêm ' + l.amount + ' điểm lô cho con ' + l.num + '\n';
                            user.gamble.lsd[index].amount += l.amount;
                          }
                          else {
                            msg += 'Bạn vừa ghi thành công lô: ' + l.num + ' ' + l.amount + ' points\n';
                            user.gamble.lsd.push(l);
                          }
                        });
                      }
                      else {
                        lsd.forEach(l => {
                          msg += 'Bạn vừa ghi thành công lô: ' + l.num + ' ' + l.amount + ' points\n';
                        })
                        user.point -= point;
                        user.gamble.lsd = lsd;
                      }

                      user.save().then(result => {
                        return message.reply(msg);
                      })
                        .catch(err => console.log(err));
                    }
                  })
                  .catch(err => console.log(err));

              }

            }
          }
          else {
            if (!checkValidPoint(args[2])) {
              return message.reply('số point cược phải là số tự nhiên');
            }
            else {
              if (!checkValidNumber(args[1])) {
                return message.reply(args[1] + ' không thuộc số từ 00 - 99. Đã hủy lệnh ghi');
              }
              else {
                let msg = '';
                User.findOne({ userId: ID, point: { $gte: parseInt(args[2], 10) } })
                  .then(user => {
                    if (!user) {
                      return message.reply('Bạn không đủ ' + args[2] + ' points để cược. Đã hủy lệnh ghi');
                    }
                    else {
                      user.point -= parseInt(args[2], 10);
                      let index = user.gamble.lsd.findIndex(l => l.num === parseInt(args[1], 10));

                      if (index < 0) {
                        msg += 'Bạn vừa ghi thành công lô: ' + args[1] + ' ' + args[2] + ' points';
                        user.gamble.lsd.push({ num: parseInt(args[1], 10), amount: parseInt(args[2], 10) });

                      }
                      else {
                        msg += 'Bạn vừa ghi thêm ' + args[2] + ' điểm lô cho con' + args[1];
                        user.gamble.lsd[index].amount += parseInt(args[2], 10);
                      }
                      user.save()
                        .then(result => {
                          message.reply(msg);
                        })
                        .catch(err => console.log(err));
                    }
                  })
                  .catch(err => console.log(err));
              }
            }
          }
        }
        else {
          message.reply('Bạn chỉ có thể ghi lô từ 8h đến 18h hàng ngày');
        }
        break;
      }

      /*-----------------------------------------*/
      case 'dmt': {//Ghi Đề
        let date = new Date();
        if (date.getHours() >= 1 && date.getHours() <= 11) {
          if (args[1].includes(',')) {
            let temp = args[1].split(',');
            let count = 0;
            let point = 0;
            let msg = '';
            let dmt = [];

            if (!checkValidPoint(args[2])) {
              return message.reply('Số point phải là số tự nhiên');
            }
            else {
              for (let i = 0; i < temp.length; i++) {
                if (!checkValidNumber(temp[i])) {
                  msg += temp[i] + ' không thuộc khoảng 00 - 99. Bỏ qua số này\n';
                  continue;
                }
                else {
                  dmt.push({ num: parseInt(temp[i], 10), amount: parseInt(args[2], 10) });
                  count++;
                }
              }

              point = count * parseInt(args[2], 10);
              if (point <= 0) {
                return message.reply(msg);
              }
              else {
                User.findOne({ userId: ID, point: { $gte: point } })
                  .then(user => {
                    if (!user) {
                      console.log('a');
                      return message.reply('Bạn không đủ ' + point + ' points để cược. Đã hủy lệnh ghi!');
                    }
                    else {
                      if (user.gamble.dmt.length > 0) {
                        user.point -= point;
                        dmt.forEach(d => {
                          let index = user.gamble.dmt.findIndex(de => de.num === d.num);
                          if (index >= 0) {
                            msg += 'Bạn vừa ghi thêm ' + d.amount + ' điểm đề cho con ' + d.num + '\n';
                            user.gamble.dmt[index].amount += d.amount;
                          }
                          else {
                            msg += 'Bạn vừa ghi thành công đề: ' + d.num + ' ' + d.amount + ' points\n';
                            user.gamble.dmt.push(d);
                          }
                        });
                      }
                      else {
                        dmt.forEach(d => {
                          msg += 'Bạn vừa ghi thành công đề: ' + d.num + ' ' + d.amount + ' points\n';
                        })
                        user.point -= point;
                        user.gamble.dmt = dmt;
                      }

                      user.save().then(result => {
                        return message.reply(msg);
                      })
                        .catch(err => console.log(err));
                    }
                  })
                  .catch(err => console.log(err));

              }

            }
          }
          else {
            if (!checkValidPoint(args[2])) {
              return message.reply('số point cược phải là số tự nhiên');
            }
            else {
              if (!checkValidNumber(args[1])) {
                return message.reply(args[1] + ' không thuộc số từ 00 - 99. Đã hủy lệnh ghi');
              }
              else {
                let msg = '';
                User.findOne({ userId: ID, point: { $gte: parseInt(args[2], 10) } })
                  .then(user => {
                    if (!user) {
                      return message.reply('Bạn không đủ ' + args[2] + ' points để cược. Đã hủy lệnh ghi');
                    }
                    else {
                      user.point -= parseInt(args[2], 10);
                      let index = user.gamble.dmt.findIndex(d => d.num === parseInt(args[1], 10));
                      if (index >= 0) {
                        msg += 'Bạn vừa ghi thêm ' + args[2] + ' điểm cho con đề: ' + args[1];
                        user.gamble.dmt[index].amount += parseInt(args[2], 10);
                      }
                      else {
                        msg += 'Bạn vừa ghi thành công đề: ' + args[1] + ' ' + args[2] + ' points';
                        user.gamble.dmt.push({ num: parseInt(args[1], 10), amount: parseInt(args[2], 10) });
                      }

                      user.save()
                        .then(result => {
                          message.reply(msg);
                        })
                        .catch(err => console.log(err));
                    }
                  })
                  .catch(err => console.log(err));
              }
            }
          }
        }
        else {
          message.reply('Bạn chỉ có thể ghi đề từ 6h đến 18h hàng ngày');
        }
        break;
      }

      /*-----------------------------------------*/
      case 'mylog': {
        User.findOne({ userId: ID })
          .then(user => {
            if (!user) {
              console.log(err);
            }
            else {
              let msg = '\n-------------Lô----------------\n';
              if (user.gamble.lsd.length > 0) {
                user.gamble.lsd.forEach(l => {
                  msg += l.num + ': ' + l.amount + ' points\n';
                })
              }
              else {
                msg += 'Chưa ghi con lô nào!\n';
              }
              msg += '-------------Đề----------------\n';
              if (user.gamble.dmt.length > 0) {
                user.gamble.dmt.forEach(d => {
                  msg += d.num + ': ' + d.amount + ' points\n';
                })
              }
              else {
                msg += 'Chưa ghi con đề nào!\n';
              }

              message.reply(msg);
            }
          })
          .catch(err => console.log(err));
        break;
      }

      /*-----------------------------------------*/
      case 'checkout': {
        let date = new Date();
        if (date.getHours() >= 12 && date.getHours() < 19) {
          User.findOne({ userId: ID })
            .then(user => {
              if (!user) {
                return console.log('user none exist');
              }
              if (user.gamble.lsd.length <= 0 && user.gamble.dmt.length <= 0) {
                return message.reply('Bạn chưa đặt cược cho ngày hôm nay!');
              }
              else {
                let lsd = user.gamble.lsd;
                let dmt = user.gamble.dmt;

                parser.parseURL('https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss', (err, feed) => {
                  let content = [];
                  let Lcontent = [];
                  if (err) {
                    return message.reply('Hệ thống đang gặp trục trặc! Bạn vui lòng thử lại sau 15p nữa nhé');
                  }
                  else {
                    feed.items[0].content.split('\n').forEach(m => {
                      var temp = m.split(' ');
                      temp.splice(0, 1);
                      temp.forEach(m => {
                        if (Number.isInteger(parseInt(m, 10))) {
                          content.push(m);
                        }
                      });
                    });

                    for (i = 0; i < content.length; i++) {
                      Lcontent.push(content[i] % 100);
                    }


                    let point = 0;
                    let msg = '';

                    //Soi Đề
                    for (let i = 0; i < dmt.length; i++) {
                      if (dmt[i].num == Lcontent[0]) {
                        win = 1;
                        point += dmt[i].amount * 70;
                        msg += 'Đề: ' + dmt[i].num + ' - ' + dmt[i].amount + ': Trúng. Được cộng ' + point + ' points vào quỹ điểm\n';
                        break;
                      }
                      else {
                        msg += 'Đề: ' + dmt[i].num + ' - ' + dmt[i].amount + ': Xịt!\n';
                      }
                    }

                    //Soi Lô
                    for (let i = 0; i < lsd.length; i++) {
                      let count = 0;
                      for (let j = 0; j < Lcontent.length; j++) {
                        if (parseInt(lsd[i].num, 10) === parseInt(Lcontent[j], 10)) {
                          count++;
                        }
                      }

                      if (count == 0) {
                        msg += 'Lô: ' + lsd[i].num + ' - ' + lsd[i].amount + ' :Xịt\n';
                      }
                      else if (count > 0 && count < 7) {
                        msg += generateText(count, lsd[i].num, lsd[i].amount);
                        point += generateValue(count, lsd[i].amount);
                      }
                      else {
                        msg += 'Lô: ' + lsd[i].num + 'về nhiều hơn 6 nháy. Nhờ admin cộng thủ công bằng tay đi!\n';
                      }

                    }
                    User.findOneAndUpdate({ userId: ID }, { $inc: { point: point }, 'gamble.lsd': [], 'gamble.dmt': [] }, (err, res) => {
                      if (err) {
                        return console.log(err);
                      }
                      message.reply(msg);
                    });

                  }
                })
              }
            })
            .catch(err => console.log(err));
        }
        else {
          message.reply('Chưa có kqxs ngày hôm nay!');
        }
        break;
      }

      /*-----------------------------------------*/
      case 'kqxs': {
        parser.parseURL('https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss')
          .then(output => {
            var msg = output.items[0].title + '\n' + output.items[0].content;
            message.channel.send(msg);

          })
        break;
      }

      /*-----------------------------------------*/
      case 'time': {
        let date = new Date();
        message.reply(`${date.getHours()}:${date.getMinutes()} Ngày: ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`);
        break;
      }


      /*-----------------------------------------*/
      case 'lottery': {//lottery: Have an opportunity to exchange points into mobile card
        if (allow) {
          User.findOne({ userId: ID, point: { $gte: 30000 } })
            .then(user => {
              if (!user) {
                return message.reply('Bạn cần tối thiểu 30k point để chơi trò này');
              }
              if (!args[1]) {
                return message.reply('Sai cú pháp: Command: !lottery nhà_mạng');
              }
              else {
                let isp = args[1].toLocaleLowerCase();
                if ((isp != 'viettel' && (isp != 'vina') && (isp != 'mobi'))) {
                  return message.reply('Command: !lottery nhà_mạng {viettel, vina, mobi} ');
                }
                else {
                  var poss = random.int(1, 3);
                  if (poss == 1) {
                    API.buyCard(isp, 10000).then((result) => {
                      if (result.data.data.success == 1) {
                        var card = result.data.data.param + '\nPIN: '
                          + result.data.data.pin + '\nSeri: ' + result.data.data.seri;
                        message.author.send(card)
                        message.channel.send(`Chúc mừng ${author}! Bạn vừa trúng lottery. Vui long check direct message bạn nhé!`);
                      }
                      else {
                        message.channel.send(result.data);
                      }
                    }).catch((err) => {
                      message.reply('Lỗi rồi ' + err)
                    });
                  }
                  else {

                    User.findOneAndUpdate({ userId: ID }, { $inc: { point: -30000 } }, (err, result) => {
                      if (err) {
                        return message.reply('Hệ thống gặp trục trặc. Liên hệ admin để khiếu nại!');
                      }
                      else {
                        message.reply('Bạn Xịt mất 30000 points là do bạn không chơi đồ đấy bạn ạ =))');
                      }
                    })
                  }
                }
              }
            })
        }
        else {
          message.reply('Bạn chỉ có thể dung lệnh này trong #gamecenter');
        }
        break;
      }

      case 'give': {//give someone point
        if (ID != process.env.ADMIN_ID) {
          return message.reply('Sorry! You do not have permission to do this!');
        }
        else {
          if (args[1] == '-all') {
            if (!Number.isInteger(parseInt(args[2], 10))) {
              return message.reply('Số points phải là số tự nhiên!');
            }
            else {
              User.updateMany({}, { $inc: { point: parseInt(args[2], 10) } }, (err) => { })
              return message.reply('bạn vừa cộng cho tất cả thành viên: ' + args[2] + ' points!');
            }
          }
          else {
            var luckymem = message.mentions.users.first();
            if (!luckymem) {
              return message.reply('Command: !give @member số_points');
            }
            else if (!args[2]) {
              return message.reply('Command: !give @member số_points');
            }
            else if (!Number.isInteger(parseInt(args[2], 10))) {
              return message.reply('Số points phải là số tự nhiên!');
            }
            else {
              User.updateOne({ userId: luckymem.id }, { $inc: { point: parseInt(args[2], 10) } }, err => { })
              return message.reply('bạn vừa cộng cho member ' + luckymem.username + ' ' + args[2] + ' points!');
            }
          }

        }
        break;
      }

      case 'reset': {//reset point of all member
        if (ID === process.env.ADMIN_ID) {
          User.updateMany({}, { point: 0 }, (err) => { });
          message.reply('Bạn vừa reset points của mọi người về 0!');
        }
        else {
          message.reply('Sorry! you do not have permission to do this!');
        }

      }

      case 'command':{
        message.send(`
          \n--------------------GAME LIST------------------\n
          1.flip: command: !flip wr:1/2 thưởng-phạt: 50-0;\n
          2.roulette: command: !roulette  /wr:4/6 thưởng-phạt:300-1000 requirement: 1000 points\n
          3.moneyheist: command: !moneyheist  /wr:1/100 thưởng-phạt: 20k-200, requirement: 200 points (**)\n
          4.lottery: command: !lottery nhà_mạng /wr:1/3 thưởng-phạt: card 20k - 30k points\n
          5.challenge:command:!cl @member số_point || !cl -accept || !cl -cancel\n
          -------------------- LÔ ĐỀ----------------------\n
          1.Lô: command: !lsd number(s) số_points (VD: !lsd 12 1000 hoặc !lsd 12,13,14,15 1000)\n 
          2.đề: command: !dmt number(s) số_points (VD: !dmt 12 1000 hoặc !dmt 12,13,14,15 1000)\n
          3.log: command: !mylog để xem những con đã ghi\n
          4.soi kết quả: !checkout :chỉ soi đc sau 19h và tới 02h sáng ngày hôm sau chưa nhận, mọi kết quả sẽ bị xóa\n
          --------------------Tiện ích--------------------------\n
          1.!avatar hoặc !avatar @member\n
          2.!time: thời gian mốc GMT +0\n
          3.!kqxs: Xem kqxs ngày gần nhất
        
        `)
        break;
      }

      default:
        break;
    }
  }
})

function resetGamble() {
  var d = new Date();
  if ((d.getHours() >= 19 && d.getHours() <= 20)) {
    User.find({ $or: [{ 'gamble.lsd': { $exists: true, $ne: [] } }, { 'gamble.dmt': { $exists: true, $ne: [] } }] })
      .then(users => {
        let guild = bot.guilds.cache.get(process.env.GUILD_ID);
        users.forEach(user => {
          let member = guild.members.cache.find(mem => mem.user.id === user.userId);
          if (!member) {
            return console.log('error');
          }

          user.gamble.lsd = [];
          user.gamble.dmt = [];
          user.save().then(result => {
            member.send('Quá 02 giờ mà bạn chưa !checkout. Nên các giá trị bạn cược trong hôm qua đã bị xóa!');
          })
            .catch(err => console.log(err));
        })
      })
      .catch(err => console.log(err));
  }
}


setInterval(resetGamble, 30 * 60 * 1000);

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(result => {
    console.log('Mongodb connected successfully');
    bot.login(token);
  })
  .catch(err => {
    console.log(err);
    console.log('Lỗi rồi!');
  });




