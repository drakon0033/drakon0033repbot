import dotenv from 'dotenv';
import chatGPT from '../chatGPT/index.js';

dotenv.config();


/**
 * Default values
 * MAX_REPLY_COUNT = 5
 * MAX_TEXT_LENGTH = 1000
 */
const MAX_REPLY_COUNT = typeof (process.env.MAX_REPLY_COUNT) === 'undefined' ? 5 : Number(process.env.MAX_REPLY_COUNT);
const MAX_TEXT_LENGTH = typeof (process.env.MAX_TEXT_LENGTH) === 'undefined' ? 1000 : Number(process.env.MAX_TEXT_LENGTH);

const GET_PROBLEMS = 'The service is experiencing some problems, please try again.';


export default {
    name: 'chat',
    aliases: ['c'],
    method: 'chat <message>',
    description: 'Чат с ИИ',
    options: [
        {
            name: "message",
            description: "пиши сюда чёт бл*ть",
            type: 3,
            required: true
        }
    ],

    async execute(client, message, args) {

        if (!args[0] || args[0] === '')
            return message.reply({ content: `❌ | Please enter valid message.`, allowedMentions: { repliedUser: false } });

        if (args.join().length > MAX_TEXT_LENGTH)
            return message.reply({ content: `❌ | Message length exceed ${MAX_TEXT_LENGTH}.`, allowedMentions: { repliedUser: false } });


        const prefixString = client.config.prefix + this.aliases;
        let requestMessage = '';
        let hasReply = message.reference || null;

        // If you send reply message, it will search for all reply messages on that reply
        if (hasReply !== null) {
            try {
                let cacheReply = [];
                let currentMsg = message;

                // Find the previous MAX_REPLY_COUNT reply messages
                let count = 0;
                while (hasReply !== null && count < MAX_REPLY_COUNT) {
                    let relpyMsg = await currentMsg.fetchReference();
                    cacheReply.push(relpyMsg);

                    currentMsg = relpyMsg;
                    hasReply = currentMsg.reference || null;
                    count++;
                }

                // filter reply content prefix and doesn't start with the prefix content
                let filterReply = cacheReply.reverse()
                    .filter((msg) => msg.author.bot !== true && msg.content.startsWith(`${prefixString}`) && msg.content !== message.content)
                    .map((msg) => String(msg.content.split(' ').splice(1)).replaceAll(',', ' '));

                // count total numbers of char, if > MAX_TEXT_LENGTH discard first reply message
                let textLength = filterReply.reduce((acc, str) => acc + str.length, 0);
                while (textLength > MAX_TEXT_LENGTH) {
                    filterReply.shift();
                    textLength = filterReply.reduce((acc, str) => acc + str.length, 0);
                }

                // Add filtered reply messages to requestMessage
                requestMessage += filterReply.join('\n') + '\n';
            }
            catch (error) {
                console.log('ChatGPT: Search reply error');
                console.log(error);
            }
        }


        // Add current message content to requestMessage
        requestMessage += args.join(' ');

        try {
            let result = await chatGPT(requestMessage);

            if (result === '') result = GET_PROBLEMS; // Discord can't send empty message

            result = (result.length >= 1950) ? result.substring(0, 1950) + ' ...' : result; // Discord can't send over 2000 length string

            console.log(`ChatGPT: Responded.`);
            return message.reply({ content: result, allowedMentions: { repliedUser: false } });
        }
        catch (error) {
            console.log(`ChatGPT: Response error.`);
            console.log(error);
            let result = GET_PROBLEMS;
            return message.reply({ content: result, allowedMentions: { repliedUser: false } });
        }
    },

    async slashExecute(client, interaction) {
        let requestMessage = interaction.options.getString("message");

        if (requestMessage.length > MAX_TEXT_LENGTH)
            return interaction.editReply({ content: `❌ | Message length exceed ${MAX_TEXT_LENGTH}.`, allowedMentions: { repliedUser: false } });


        try {
            let result = await chatGPT(requestMessage);

            if (result === '') result = GET_PROBLEMS;

            result = (result.length >= 1950) ? result.substring(0, 1950) + ' ...' : result;

            console.log(`ChatGPT: Responded.`);
            return interaction.editReply({ content: result, allowedMentions: { repliedUser: false } });
        }
        catch (error) {
            console.log(`ChatGPT: Response error.`);
            console.log(error);
            let result = GET_PROBLEMS;
            return interaction.editReply({ content: result, allowedMentions: { repliedUser: false } });
        }
    }
};