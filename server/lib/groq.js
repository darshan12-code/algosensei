// server/lib/groq.js — ensure groqJSON supports system prompt
import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_KEY });

export async function groqJSON(messages, options = {}) {
  const { max_tokens = 1000, system, model = 'llama-3.3-70b-versatile' } = options;

  const msgs = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  const res = await client.chat.completions.create({
    model,
    max_tokens,
    messages: msgs,
    response_format: { type: 'json_object' },  // Forces valid JSON output
  });

  const raw = res.choices[0].message.content;
  // Strip any markdown fences Groq adds despite json_object mode
  const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}