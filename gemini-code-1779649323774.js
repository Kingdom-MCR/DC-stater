const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const { Aternos } = require('aternos-api'); // Unofficial API module

dotenv.config();

// Discord bot ka setup
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.once('ready', () => {
    console.log(`✅ Bot is online! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Agar message bot ne bheja hai, toh ignore karo
    if (message.author.bot) return;

    // Command check
    if (message.content === '!startserver') {
        message.reply('⏳ Aternos server start karne ki request bhej raha hu...');
        
        try {
            // Aternos me login karne ka logic
            const aternosClient = new Aternos();
            await aternosClient.loginWithCookie(process.env.ATERNOS_SESSION);
            
            // Apna server dhundna aur start karna
            const servers = await aternosClient.getServers();
            const myServer = servers.find(s => s.ip === process.env.SERVER_IP); 
            
            if (myServer) {
                await myServer.start();
                message.channel.send('🟩 Success! Server start hona shuru ho gaya hai. Thodi der me Aternos pe online show hoga.');
            } else {
                message.channel.send('❌ Server nahi mila. Kripya `SERVER_IP` check karein.');
            }
            
        } catch (error) {
            console.error("Aternos Error:", error);
            message.channel.send('❌ Server start nahi ho paya. Shayad Aternos session cookie expire ho gaya hai ya Aternos ka anti-bot system block kar raha hai.');
        }
    }
});

// Bot ko start karna
client.login(process.env.DISCORD_TOKEN);