const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const dotenv = require('dotenv');
const { Aternos } = require('aternos-api');

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

// Step 1: Ek command jisse Button wala message aayega
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Jab aap chat me '!panel' likhoge, bot ek button bhejega
    if (message.content === '!panel') {
        const startButton = new ButtonBuilder()
            .setCustomId('start_aternos') // Code ke liye button ka naam
            .setLabel('🚀 Start Minecraft Server') // Button pe jo likha dikhega
            .setStyle(ButtonStyle.Success); // Green color ka button

        const row = new ActionRowBuilder().addComponents(startButton);

        await message.channel.send({
            content: '🎮 **Server Control Panel**\nServer start karne ke liye niche green button par click karein:',
            components: [row]
        });
    }
});

// Step 2: Jab koi us Button par click karega toh kya hoga
client.on(Events.InteractionCreate, async interaction => {
    // Agar click button nahi hai toh ignore karo
    if (!interaction.isButton()) return;

    // Agar humara start wala button click hua hai
    if (interaction.customId === 'start_aternos') {
        // Button click hone par turant reply dena zaroori hai
        await interaction.reply({ content: '⏳ Aternos server start karne ki request bhej raha hu...', ephemeral: false });

        try {
            const aternosClient = new Aternos();
            await aternosClient.loginWithCookie(process.env.ATERNOS_SESSION);
            
            const servers = await aternosClient.getServers();
            const myServer = servers.find(s => s.ip === process.env.SERVER_IP); 
            
            if (myServer) {
                await myServer.start();
                await interaction.editReply('🟩 Success! Server start hona shuru ho gaya hai. Thodi der me Aternos pe online show hoga.');
            } else {
                await interaction.editReply('❌ Server nahi mila. Kripya Railway Variables me SERVER_IP check karein.');
            }
            
        } catch (error) {
            console.error("Aternos Error:", error);
            await interaction.editReply('❌ Server start nahi ho paya. Shayad Aternos session expire ho gaya hai.');
        }
    }
});

// Bot ko start karna
client.login(process.env.DISCORD_TOKEN);
