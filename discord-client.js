const { Client } =require('discord.js')
let bot;

module.exports = {
    init: () => {
        bot = new Client();
        return bot;
    },
    getClient: () => {
        if(!bot){
            throw new Error('Bot is not initialized!');
        }
        return bot;
    }
}