const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const socket = new WebSocket("wss://ws.rugplay.com/ws/socket.io/?EIO=4&transport=websocket");

async function getPriceUpdate(coinSymbol) {
	let response = await fetch('https://rugplay.com/api/coin/'+coinSymbol.toUpperCase()+'?timeframe=1m')
	try{
		if (!response.ok) {
		  throw new Error(`Response status: ${response.status}`);
		}
		
		const json = await response.json();
		return json;
	} catch(err){
		console.error(err.message)
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coin')
		.setDescription('View information about a specific coin.')
		.addStringOption(option =>
		option.setName('coinsymbol')
			.setDescription('The symbol of the coin')
			.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply()
		const coin = interaction.options.getString('coinsymbol');
		let priceUpdate = ''
		try{
			priceUpdate = await getPriceUpdate(coin)
		} catch(err){
			console.log('uh oh... ', err)
		}
		if(priceUpdate==undefined){
			await interaction.editReply('Coin not found, or an error occurred.')
		} else{
			const coinEmbed = new EmbedBuilder()
			  .setTitle(priceUpdate.coin.name + " [" + priceUpdate.coin.symbol + "]")
			  .setURL("https://rugplay.com/coin/"+priceUpdate.coin.symbol)
			  .setDescription("Current value: "+priceUpdate.coin.currentPrice)
			  .addFields(
				{
				  name: "Market Cap",
				  value: String(priceUpdate.coin.marketCap),
				  inline: true
				},
				{
				  name: "Volume (24 hours)",
				  value: String(priceUpdate.coin.volume24h),
				  inline: true
				},
			  )
			  .setColor("#ffff00")
			  .setTimestamp();
			await interaction.editReply({embeds: [coinEmbed]})
		}
	},
};
