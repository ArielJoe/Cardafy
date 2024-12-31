import { streamText, Message } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { initialMessage } from "@/lib/ai/data";

const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
});

export const runtime = "edge";

const generateId = () => Math.random().toString(36).slice(2, 15);

const buildGoogleGenAIPrompt = (messages: Message[]): Message[] => [
  {
    id: generateId(),
    role: "user",
    content: initialMessage.content,
  },
  ...messages.map((msg) => ({
    id: msg.id || generateId(),
    role: msg.role,
    content: msg.content,
  })),
];

export default async function POST(request: Request) {
  const { messages } = await request.json();
  const stream = streamText({
    model: google("gemini-1.5-pro-latest"),
    messages: buildGoogleGenAIPrompt(messages),
    temperature: 0.7,
  });
  return (await stream).toDataStreamResponse();
}
