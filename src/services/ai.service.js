const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export async function requestInsights(prompt, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const body = {
    model: options.model || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: options.system || 'You are a helpful assistant that provides concise financial insights.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: options.max_tokens || 500,
    temperature: options.temperature ?? 0.7,
  };

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${txt}`);
  }

  const json = await res.json();
  const message = json?.choices?.[0]?.message?.content;
  return message;
}

export default { requestInsights };
