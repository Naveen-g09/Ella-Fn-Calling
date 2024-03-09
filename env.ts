import dotenv from 'dotenv';
dotenv.config;


const apiKey = process.env.OPENAI_API;
if (!apiKey) {
    throw new Error('No OpenAI API key found');
}
console.log(apiKey);