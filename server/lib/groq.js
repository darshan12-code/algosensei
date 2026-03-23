import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_KEY });

// For structured data routes (animate, quiz, tracker, etc.)
// Forces JSON output — messages MUST mention "json" somewhere
export async function groqJSON(messages, options = {}) {
  const { max_tokens = 1000, system, model = 'llama-3.3-70b-versatile' } = options;

  const msgs = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  const res = await client.chat.completions.create({
    model,
    max_tokens,
    messages: msgs,
    response_format: { type: 'json_object' },
  });

  const raw = res.choices[0].message.content;
  const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}

// For streaming chat routes (chat.js AI chat / mock interview)
// Plain text streaming — NO json_object mode
export async function groqStream(messages, options = {}) {
  const { max_tokens = 2000, model = 'llama-3.3-70b-versatile' } = options;

  return await client.chat.completions.create({
    model,
    max_tokens,
    messages,
    stream: true,
  });
}