import { OpenAI } from "openai";
import { openai } from "@ai-sdk/openai";
import { OpenAIStream, generateObject, generateText } from "ai";
import { convertToCoreMessages, streamText } from "ai";
import z from "zod";

// create a new OpenAI client using our key from earlier
const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const responseSchema = z.object({
  response: z.object({
    coupon_code: z.string(),
    store: z.string(),
    discount_amount: z.string().describe("Do not include currency symbol."),
    expiration_date: z.string().describe("It should be in yyyy-mm-dd format"),
    error: z.string().optional(),
  }),
});

export const classifyImage = async (file: File) => {
  // encode our file as a base64 string so it can be sent in an HTTP request
  const encoded = await file
    .arrayBuffer()
    .then((buffer) => Buffer.from(buffer).toString("base64"));

  const result = await generateObject({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the information from the coupon. If you're not confident, set error to true.",
          },
          {
            type: "image",
            image: new URL(`data:image/jpeg;base64,${encoded}`),
          },
        ],
      },
    ],
    mode: "json",
    schema: responseSchema,
  });
  return result;
};

export async function POST(request: Request) {
  const formData = await request.blob();
  const file = formData as File;
  const response = await classifyImage(file);
  console.log(response.object.response);
  return new Response(JSON.stringify(response.object.response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
