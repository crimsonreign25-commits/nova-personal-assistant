export async function generate(messages, model = 'llama-3.1-70b-versatile', options = {}) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: options.stream ?? true, temperature: 0.7, max_tokens: 4096, tools: options.tools })
  });
  if (!res.ok) throw new Error(await res.text());
  return options.stream ? res.body : await res.json();
}

export async function* streamParser(reader) {
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) yield { type: 'content', data: delta.content };
        if (delta?.tool_calls) yield { type: 'tool_call', data: delta.tool_calls };
      } catch {}
    }
    if (done) break;
  }
}
