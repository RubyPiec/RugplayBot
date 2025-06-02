const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listnotifs')
		.setDescription("List every notification you've subscribed to."),
	async execute(interaction) {
		let embedText = ''
		let result = await db.query(
			'SELECT * FROM users WHERE username=$1',
			[interaction.user.id]
		);
		for(i of result.rows){
			embedText+=`ID: ${i["id"]} - $${i["coin"]} ${i["comparison"]} ${i["value"]}\n`
		}
		const embed = new EmbedBuilder()
		  .setTitle("Your notifications")
		  .setDescription(embedText);

		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
