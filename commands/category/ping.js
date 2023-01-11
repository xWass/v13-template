const { SlashCommandBuilder } = require("@discordjs/builders");
const chalk = require("chalk");

module.exports = {
    data: new SlashCommandBuilder().setName("ping").setDescription("ping"),

    async execute(interaction, client) {
        interaction.reply({
            embeds: [
                {
                    title: `${client.ws.ping}ms`,
                },
            ],
        });
    },
};
