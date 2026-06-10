import OpenAI from "openai";
import { SYSTEM_PROMPTS, COMPARE_SYSTEM_PROMPT, type SummaryLength } from "./prompts";

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

export async function comparePetitions(text1: string, text2: string): Promise<string> {
  const userMessage = `BİRİNCİ METİN:\n\n${text1}\n\n---\n\nİKİNCİ METİN:\n\n${text2}`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: COMPARE_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 3000,
  });

  return response.choices[0].message.content || "";
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
