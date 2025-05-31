require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const discordToken = process.env.DISCORD_TOKEN;

const socket = new WebSocket("wss://ws.rugplay.com/ws/socket.io/?EIO=4&transport=websocket");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// I LOVE THE DISCORD.JS GUIDE!!!! SO MUCH FREE CODE!!!!
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
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
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

socket.addEventListener("open", () => {
	console.log("Connected to Rugplay WebSocket");

	// these 3 are required
	// btw this is to like get live updates on every single stock if that makes sense
	socket.send(JSON.stringify({ type: "subscribe", channel: "trades:all" }));
	socket.send(JSON.stringify({ type: "subscribe", channel: "trades:large" }));
	socket.send(JSON.stringify({ type: "set_coin", coinSymbol: "@global" }));
});

socket.addEventListener("message", (event) => {
	const raw = event.data;

	try {
		const parsed = JSON.parse(raw);
		if (parsed.type === "ping") return; // STOP PINGING ME

		if(parsed.type==='live-trade'){
			console.log(parsed.data.coinSymbol + ': ' + parsed.data.price);
		};
		// console.log("Event received:", parsed);
	} catch {
		console.log("Raw message:", raw);
	}
});

socket.addEventListener("error", (err) => {
	console.error("Error:", err);
});

socket.addEventListener("close", () => {
	console.log("Disconnected.");
});

client.login(discordToken);