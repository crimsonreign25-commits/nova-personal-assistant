import { groq } from '../providers/groq.js';

const PROVIDERS = { groq };

export async function generate(model, messages, options = {}) {
  const response = await PROVIDERS.groq.generate(messages, model, options);
  return { stream: response, parser: PROVIDERS.groq.streamParser(response.getReader()) };
}
