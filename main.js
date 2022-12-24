const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

require('dotenv').config()

const token = process.env.DISCORD_TOKEN
const prefix = '!'

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});


client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//load in our commands to the collection
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on('message', msg => {
    let msgContent = msg.content
    console.log("MESSAGE RECEIVED")
    if (msgContent.startsWith(prefix)) {
        let inp = msgContent.subString(prefix.length).split(" ")
        if (inp[0] === 'talk') {
            inp.shift()
            let text = inp.toString()
            console.log(text)
        }
    }
    else {
        console.log("ELSE STATEMENT HERE")
    }
})

client.on(Events.MessageCreate, interaction => {
	console.log(interaction);
});

client.on(Events.InteractionCreate, async interaction => {
	let context = ""
	if (!interaction.isChatInputCommand()) {
		return
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log in to Discord with your client's token
client.login(token);