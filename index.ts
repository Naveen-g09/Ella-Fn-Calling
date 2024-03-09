import  OpenAIAPI  from 'openai';

require('dotenv').config()

const client = new OpenAIAPI({ apiKey: process.env.OPENAI_API });

if (!client) {
    throw new Error('No OpenAI API key found');
  }

console.log(client);

interface Doctor {
    name: string;
    type: string;
    consultation_mode: string;
    expertise_description: string;
}

interface ReferToDocArgs {
    type: string;
    consultation_mode: string;
    expertise_description: string;
}

type userMessage = string | null;

async function main() {
    const runner = client.beta.chat.completions
    .runTools({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant that can refer patients to doctors. You have a function called ReferToDoc that takes a type of doctor, a consultation mode, and an expertise description, and returns a doctor that fits those criteria.`
            },
            {
                role: "user",
                content: "I have a chronic back pain and I need to see a doctor. Can you help me?"
            }
        ],
        tools: [
            {
                type: "function",
                function: {
                    name: "ReferToDoc",
                    description: "Refers a patient to a doctor based on the type of doctor, consultation mode, and expertise description",
                    parameters: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                enum: [
                                    "General Physician",
                                    "Specialist"
                                ],
                                description: "The type of doctor to refer to"
                            },
                            consultation_mode: {
                                type: "string",
                                enum: [
                                    "Physical Examination",
                                    "Virtual Consultation"
                                ],
                                description: "The mode of consultation preferred"
                            },
                            expertise_description: {
                                type: "string",
                                description: "A brief description of the required expertise for the doctor"
                            }
                        },
                        required: [
                            "type",
                            "consultation_mode",
                            "expertise_description"
                        ]
                    }
                }

            }
        ],
        max_tokens: 150,
        temperature: 0.7,
        stop: ["\n"]
    })
    .on('message',async (message) => {
        console.log(message);
    
        const finalContent = await runner.finalContent();
        console.log();
        console.log('Final content:', finalContent);
},);}


main();

/*{
    "name": "ReferToDoc",
    "description": "Refers a patient to a doctor based on the type of doctor, consultation mode, and expertise description",
    "parameters": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "General Physician",
            "Specialist"
          ],
          "description": "The type of doctor to refer to"
        },
        "consultation_mode": {
          "type": "string",
          "enum": [
            "Physical Examination",
            "Virtual Consultation"
          ],
          "description": "The mode of consultation preferred"
        },
        "expertise_description": {
          "type": "string",
          "description": "A brief description of the required expertise for the doctor"
        }
      },
      "required": [
        "type",
        "consultation_mode",
        "expertise_description"
      ]
    }
  }*/




/*async function prompt(): Promise<void> {
    try {
        const completions = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that can refer patients to doctors. You have a function called ReferToDoc that takes a type of doctor, a consultation mode, and an expertise description, and returns a doctor that fits those criteria.`
                },
                {
                    role: "user",
                    content: "I have a chronic back pain and I need to see a doctor. Can you help me?"
                }
            ],
            max_tokens: 150,
            temperature: 0.7,
            stop: ["\n"]
        });

        // Parse the user message to extract the function call and its arguments
        const userMessage = completions.choices[0].message.content;
        if (userMessage) {
            const match = userMessage.match(/ReferToDoc\((.*)\)/);
            if (match) {
                const args = JSON.parse(match[1]);
                const doctor = ReferToDoc(args);
                console.log("Referred doctor:", doctor);
            }
        }
        const choices = completions.choices; // Access choices directly from completions
        if (choices && choices[0] && choices[0].message && choices[0].message.content) {
            console.log("Generated message:", choices[0].message.content);
        } else {
            console.error("Invalid response structure or no content in the choices.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
*/