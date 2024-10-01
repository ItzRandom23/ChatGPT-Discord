const { Client, GatewayIntentBits, Partials } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.on('ready', () => {
  console.log(`${client.user.username} is online!`);
});

const openai = new OpenAI({
  apiKey: "", // API KEY HERE
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== "") return; // CHANNEL ID HERE

  let conversationLog = [
    { role: 'system', content: 'You are a friendly chatbot.' },
  ];

  try {
    await message.channel.sendTyping();
    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (msg.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && msg.author.bot) return;
      
      if (msg.author.id === client.user.id) {
        conversationLog.push({
          role: 'assistant',
          content: msg.content,
          name: msg.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }

      if (msg.author.id === message.author.id) {
        conversationLog.push({
          role: 'user',
          content: msg.content,
          name: message.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationLog,
    });

    message.reply(response.choices[0].message.content);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(""); // BOT TOKEN HERE
