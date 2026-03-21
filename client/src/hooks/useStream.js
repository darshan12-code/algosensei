// client/src/hooks/useStream.js
import { useRef, useState, useCallback } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * useStream()
 *
 * startStream(path, body, onChunk, options?)
 *   path    – string  e.g. '/api/chat/stream'
 *   body    – object  sent as JSON
 *   onChunk – (fullAccumulatedContent: string) => void  — called on every token
 *   options – { onDone?, onError? }  (optional)
 *
 * Returns { streaming, typing, startStream, cancelStream }
 */
export const useStream = () => {
  const readerRef             = useRef(null);
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
          Authorization: `Bearer ${token}`,
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

      setTyping(false); // first byte arrived — switch from typing dots to live text

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          if (dataStr.startsWith('[ERROR]')) {
            throw new Error(dataStr.slice(7));
          }
          try {
            const parsed = JSON.parse(dataStr);
            const piece  = parsed.choices?.[0]?.delta?.content;
            if (piece) {
              fullContent += piece;
              onChunk?.(fullContent);
            }
          } catch { /* incomplete JSON chunk — skip */ }
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