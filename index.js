const fs = require("fs");
const chalk = require("chalk");
const { Client, Collection, Intents } = require("discord.js");
const intents = new Intents();
require("dotenv").config();

// MAKE SURE YOUR INTENTS ARE ENABLED FOR WHAT YOU NEED ON THE DEV PORTAL
intents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
);

const client = new Client({
    intents,
    partials: ["MESSAGE", "REACTION"],
    allowedMentions: { parse: ["users"] },
});

client.SlashCommands = new Collection();

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { readdirSync } = require("node:fs");
const { join, resolve } = require("node:path");

function loadCommands(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) loadCommands(path);
        else if (
            entry.isFile() &&
            (entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))
        ) {
            console.log(
                `${chalk.yellowBright("[SLASH COMMAND LOADED]")} ${entry.name}`
            );
            const command = require(resolve(path));
            client.SlashCommands.set(command.data.name, command);
        }
    }
}

loadCommands("./commands");
console.log(chalk.greenBright("Ready!"));
const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
(async () => {
    try {
        console.log(
            chalk.yellowBright("Started refreshing application [/] commands.")
        );
        await rest.put(Routes.applicationCommands("BOT ID HERE"), {
            body: client.SlashCommands.map((s) => s.data.toJSON()),
        });
        console.log(
            chalk.greenBright("Successfully reloaded application [/] commands.")
        );
    } catch (error) {
        console.error(error);
    }
})();

client.on("interactionCreate", async (interaction) => {
    const command = client.SlashCommands.get(interaction.commandName);
    if (!command) return;
    console.log(
        `${chalk.yellowBright(
            "[EVENT FIRED]"
        )} interactionCreate with command ${interaction.commandName}`
    );

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        interaction.reply({
            embeds: [
                {
                    description: `An error has occurred!\n${error}`,
                },
            ],
            ephemeral: true,
        });
    }
});

client.login(process.env.TOKEN);
