import OpenAI from 'openai';
require('dotenv').config()
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.text());
app.use(cors());

const client = new OpenAI({ apiKey: process.env.OPENAI_API });

if (!client) {
    throw new Error('No OpenAI API key found');
}

//TODO: ZOD validation for the function arguments
//TODO: Add a function to handle the user message and return the doctor details
//TODO: Response should be in json format
//TODO: Response should be uni-directional, currently it is asking for user input after the first response

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
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that can refer patients to doctors. You have a function called ReferToDoc that takes a type of doctor, a consultation mode, and an expertise description, and returns a doctor that fits those criteria.`
                },
                {
                    role: "user",
                    content: "common illness"
                }
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        function: ReferToDoc,
                        parse: JSON.parse,
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
        });


    runner.on('message', async (message) => {
        // console.log(message);
    });

    try {
        const finalContent = await runner.finalContent();
        console.log('Response:', finalContent);
        return finalContent;
    } catch (error) {
        console.error("Error:", error);
        return error;
    }
}

async function ReferToDoc(args: ReferToDocArgs): Promise<Doctor> {
    const doctors: Doctor[] = [
        {
            name: 'Dr. Smith',
            type: 'General Physician',
            consultation_mode: 'Physical Examination',
            expertise_description: 'General health checkup and common illnesses',
        },
        {
            name: 'Dr. Johnson',
            type: 'General Physician',
            consultation_mode: 'Virtual Consultation',
            expertise_description: 'General health checkup and common illnesses',
        },
        {
            name: 'Dr. Lee',
            type: 'Specialist',
            consultation_mode: 'Physical Examination',
            expertise_description: 'Orthopedic and sports injuries',
        },
        {
            name: 'Dr. Patel',
            type: 'Specialist',
            consultation_mode: 'Virtual Consultation',
            expertise_description: 'Orthopedic and sports injuries',
        },

    ];

    const doctor = doctors.find(
        (doctor) =>
            doctor.type === args.type &&
            doctor.consultation_mode === args.consultation_mode &&
            doctor.expertise_description.includes(args.expertise_description)
    );

    if (!doctor) {
        throw new Error(`No doctor found that matches the criteria: Type - ${args.type}, Consultation Mode - ${args.consultation_mode}, Expertise Description - ${args.expertise_description}`);
    }


    return doctor;
}


main();

app.get('/', async (req, res) => {
    try {
        const result = await main();
        const message = result instanceof Error ? result.message : result;
        res.send(message);
    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
});



app.listen(port, () => {
    console.log('Started proxy express server');
});
