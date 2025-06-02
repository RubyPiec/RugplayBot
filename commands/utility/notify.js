const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('notify')
		.setDescription('Make the bot message you anytime a coin goes over or under a specific value.')
		.addStringOption(option =>
			option.setName('coin')
			.setDescription("The coin's symbol")
			.setRequired(true))
		.addStringOption(option =>
			option.setName('value')
			.setDescription("The value at which you would like to be reminded")
			.setRequired(true))
		.addStringOption(option =>
			option.setName('operation')
			.setDescription("Whether the price must be higher or lower than the value")
			.setRequired(true)
			.addChoices(
				{ name: 'Higher', value: '>' },
				{ name: 'Lower', value: '<' },
			)),
	async execute(interaction) {
		const coin = interaction.options.getString('coin');
		const value = parseFloat(interaction.options.getString('value'));
		const comparison = interaction.options.getString('operation');
		const username = interaction.user.id;

		if (isNaN(value)) {
			await interaction.reply({ content: 'Value must be a number.', ephemeral: true });
			return;
		}
		
		if(comparison!="<"&&comparison!=">"){
			await interaction.reply({ content: 'Operation is invalid.', ephemeral: true });
			return;
		}

		await db.query(
			'INSERT INTO users (username, coin, comparison, value) VALUES ($1, $2, $3, $4)',
			[username, coin, comparison, value]
		);
		
		
		await interaction.reply({content: "You will now be notified when "+coin+" is "+comparison+"$"+value+".", ephemeral: true});
	},
};
