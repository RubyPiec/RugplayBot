const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unnotify')
		.setDescription("Unsubscribe from a notification.")
		.addStringOption(option =>
			option.setName('id')
			.setDescription("The ID of the notification (check /listnotifs!)")
			.setRequired(true)),
	async execute(interaction) {
		const id = parseFloat(interaction.options.getString('id'))
		if (isNaN(id)) {
			await interaction.reply({ content: 'ID must be a number.', ephemeral: true });
			return;
		}
		
		let embedText = ''
		let result = await db.query(
			'DELETE FROM users WHERE username=$1 AND id=$2',
			[interaction.user.id, id]
		);
		
		if (result.rowCount > 0) {
			await interaction.reply({ content: `Notification with ID ${id} removed.`, ephemeral: true });
		} else {
			await interaction.reply({ content: `No notification found with ID ${id}.`, ephemeral: true });
		}
	},
};
