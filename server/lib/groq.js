// server/lib/groq.js
// Fix #8: GROQ_URL and GROQ_MODEL were copy-pasted across 4 route files.
// One place to change the model, base URL, or default token limits.

import axios from 'axios';

export const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL          = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * groq(messages, options?)
 *   messages  – array of { role, content }
 *   options   – { max_tokens?, stream?, response_format? }
 *
 * Returns the full axios response so callers can pipe `.data` for streams
 * or read `.data.choices[0].message.content` for JSON.
 */
export const groq = (messages, options = {}) => {
  const {
    max_tokens      = 1500,
    stream          = false,
    response_format = undefined,
    responseType    = 'json',
  } = options;

  return axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages,
      max_tokens,
      ...(stream          && { stream }),
      ...(response_format && { response_format }),
    },
    {
      headers:      { Authorization: `Bearer ${process.env.GROQ_KEY}` },
      responseType: stream ? 'stream' : responseType,
    },
  );
};

/**
 * groqJSON(messages, options?)
 * Convenience wrapper: calls groq() with json_object format,
 * parses the response, and returns the plain JS object.
 * Strips accidental markdown fences the model sometimes adds.
 */
export const groqJSON = async (messages, options = {}) => {
  const res  = await groq(messages, { ...options, response_format: { type: 'json_object' } });
  const raw  = res.data.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};