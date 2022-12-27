import Discord from 'discord.js';


export default {
    name: 'server',
    aliases: ['s'],
    showHelp: false,
    method : 'server',
    description: 'ПАКАЖИ АКТИВНОСТЬ СЕРВЕРА МОЕГО ЛЮБИМОГО',
    options: [],

    execute(client, message) {
        return message.reply(
            {
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(
                            client.guilds.cache
                                .map(g => `СЕРВЕР ИМЯ: ${g.name}\n  ВСЕГО ЛЮДЕЙ: ${g.memberCount}\n СЕРВЕР АЙДИ: ${g.id}`).join('\n\n')
                        )
                ],
                allowedMentions: { repliedUser: false }
            }
        )
    },

    async slashExecute(client, interaction) {
        return interaction.editReply(
            {
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(
                            client.guilds.cache
                                .map(g => `СЕРВЕР ИМЯ: ${g.name}\n  ВСЕГО ЛЮДЕЙ: ${g.memberCount}\n СЕРВЕР АЙДИ: ${g.id}`).join('\n\n')
                        )
                ],
                allowedMentions: { repliedUser: false }
            }
        )
    }
};