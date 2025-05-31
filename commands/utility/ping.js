const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Every good bot has a ping command.'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
