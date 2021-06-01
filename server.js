const express = require('express');
const cors = require('cors');
const Discord = require('discord.js')
const client = new Discord.Client();
const app = express();

let botToken = '';
let discordChannelId = '';

client.login(botToken);


app.use(cors());

const PORT = 3000;

client.once('ready', async () => {
    app.listen(PORT, async () => {
        console.log(`Application listening at ${PORT}`)
    });

    app.get('/monitor', monitor);
});




async function monitor(req, res) {
    let toBeSent = [];
    const channel = client.channels.cache.get(discordChannelId);
    channel.messages.fetch({ limit: 100 }).then(async(messages) => {
            messages.forEach(async(message) => {
                let restock = {};               
                restock.site = message.embeds[0]['fields'][0]['value'].toLowerCase().replace(' ','').replace('footlockerus','footlocker');
                restock.sku = message.embeds[0]['fields'][1]['value'];
                

                var now = new Date((message.id/4194304)+1420070400000);
                // convert local ts into utc
                
                restock.timestamp = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
                
                toBeSent.push(restock);
            });
            res.send(toBeSent);

        },
    );
    
    
    req.on('close', () => {
        var now = new Date();
        var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        console.log(`Connection closed - ${String(utc)}`);
    });
}
  
//300000 is 5 mins in ms