// client/src/hooks/useStream.js
import { useRef, useState, useCallback } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useStream = () => {
  const readerRef                 = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [typing,    setTyping]    = useState(false);

  const startStream = useCallback(async (path, body, onChunk, options = {}) => {
    const { onDone, onError } = options;
    const token = localStorage.getItem('token');

    setStreaming(true);
    setTyping(true);

    let fullContent = '';

    try {
      const res = await fetch(`${BASE}${path}`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const reader  = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let   leftover = '';

      setTyping(false); // first byte arrived — switch from dots to live text

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text  = leftover + decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        leftover    = lines.pop(); // save incomplete trailing line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          if (dataStr.startsWith('[ERROR]')) {
            throw new Error(dataStr.slice(7).trim());
          }
          try {
            const parsed = JSON.parse(dataStr);
            const piece  = parsed.token; // ✅ matches backend: res.write(`data: ${JSON.stringify({ token })}\n\n`)
            if (piece) {
              fullContent += piece;
              onChunk?.(fullContent);
            }
          } catch { /* malformed line — skip */ }
        }
      }

      onDone?.();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setStreaming(false);
      setTyping(false);
      readerRef.current = null;
    }
  }, []);

  const cancelStream = useCallback(() => {
    readerRef.current?.cancel();
    setStreaming(false);
    setTyping(false);
  }, []);

  return { streaming, typing, startStream, cancelStream };
};