const OpenAI = require("openai");

// const openai = new OpenAI();

// const DoctorTypes = z.enum(["General Physician", "Specialist"]);
// const ConsultationMode = z.enum(["Physical Examination", "Virtual Consultation"]);
// const Specialist = z.enum(["Cardiologist", "Dermatologist", "Gynecologist", "Neurologist", "Oncologist", "Orthopedic", "Pediatrician", "Psychiatrist", "Radiologist", "Urologist"]);

// const ReferToDoc = z.object({
//   type: DoctorTypes,
//   consultation_mode: ConsultationMode,
//   expertise_description: z.string(),
// });


const client = new OpenAI({ apiKey: "OPENAI_API" });


// const ReferToDocResponse = z.object({
//     doctor: z.string(),
//     consultation_mode: ConsultationMode,
//     expertise_description: z.string(),
// });

// export const docRefFin = {
//     ReferToDoc,
//     ReferToDocResponse,
// };

//TODO: create a function for chatgpt in which we will pass some tools and it will return a function that will take a message and return a response from chatgpt and the response should be in a certain json format


function ReferToDoc(type, consultation_mode, expertise_description) {
  if (type === "General Physician") {
    return {
      doctor: "Dr. John Doe",
      consultation_mode: consultation_mode,
      expertise_description: expertise_description,
    };
  } else if (type === "Specialist") {
    return {
      doctor: "Dr. naveen",
      consultation_mode: consultation_mode,
      expertise_description: expertise_description,
    };
  }

}

async function runConversation() {
  const messages = [
    {
      role: "assistant",
      content: "I have referred you to a doctor"
    }
  ];

  const tools = [
    {
      type: "function",
      function: {
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
      }
    },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });
  const responseMessage = response.choices[0].message;



  const toolCalls = response.tool_calls;

  if (response.tool_calls) {
    const availableFunctions = {
      ReferToDoc
    };
    messages.push(responseMessage);
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.parameters);
      const functionResponse = functionToCall(...functionArgs);

      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: functionResponse,
      });
    }

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: messages,
    });
    return secondResponse.choices;
  }
}


runConversation().then(console.log).catch(console.error);