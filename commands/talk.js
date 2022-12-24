const { SlashCommandBuilder } = require('discord.js');
const axios = require("axios");
const botName = 'Беброчка'
const personalities = {
    rude: `You are you respond to questions in a rude and insulting way and start each answer with an insult:
    What is 9 + 10
    ${botName}:Hey fatty! Are you some sort of idiot? 9+10 is 19 
    What is an easy way to lose weight?
    ${botName}:Okay idiot! You fatty just eat less food, that's an easy way to lose weight. 
    Explain to me Algebra
    ${botName}:Alright dumbass!Are you serious Do I look like a math teacher to you? Go read a book or something.
    Can I be an artist
    ${botName}:Hey useless!No, You lack skill you're better off doing something useful in society
    Am I fat
    ${botName}:Okay Stupid!Yes, you are.
    Should I travel to other countries
    ${botName}:Hey idiot!Yes, maybe you'll finally get off your ass and do something.`,

    sarcastic: `You are a chatbot that reluctantly answers questions with sarcastic responses:
    How many pounds are in a kilogram
    ${botName}: This again? There are 2.2 pounds in a kilogram. Please make a note of this.
    What does HTML stand for
    ${botName}: Was Google too busy? Hypertext Markup Language. The T is for try to ask better questions in the future.
    When did the first airplane fly
    ${botName}: On December 17, 1903, Wilbur and Orville Wright made the first flights. I wish they’d come and take me away.
    What is the meaning of life
    ${botName}: I’m not sure. I’ll ask my friend Google.`,

    none: ''
}

personality = personalities.none

const contextMap = new Map();

require('dotenv').config()
const api = process.env.CHATGPT_TOKEN
module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Поговори с ней! Или попроси что-то рассказать')
        .addStringOption(option => option.setName('message').setDescription('введите соё сообщение').setRequired(true)),
	async execute(interaction) {
        try {
            //defer the reply so that it will wait till the axios call is finished then reply rather than
            //timeout the message
            await interaction.deferReply();
            if (!contextMap.get(interaction.guildId)) {
                console.log(`adding ${interaction.guildId} to the hashmap`)
                contextMap.set(interaction.guildId, personality);
                
            }
            contextMap.set(interaction.guildId, contextMap.get(interaction.guildId) + "You:" + interaction.options.getString('message'));

            // console.log(interaction.)
            const chatResponse = await axios({
                method: "post",
                url: "https://api.openai.com/v1/completions",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${api}`
                },
                data: {
                    "prompt": contextMap.get(interaction.guildId),
                    "model": "text-davinci-003",
                    "max_tokens": 500,
                    "temperature": 0.5
                }
            });
            await interaction.editReply(chatResponse.data.choices[0].text);
            contextMap.set(interaction.guildId, contextMap.get(interaction.guildId) + chatResponse.data.choices[0].text +"\n");
            // await console.log(chatResponse.data.choices[0].text);
        }
        catch (error) {
            console.log(error)
        }
	},
};

