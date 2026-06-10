import OpenAI from "openai";
import { SYSTEM_PROMPTS, type SummaryLength } from "./prompts";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function summarizePetition(text: string, length: SummaryLength = "medium"): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[length];

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || "";
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
