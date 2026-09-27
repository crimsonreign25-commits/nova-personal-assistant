import { generate } from './model-router.js';
import { SmartTools } from '../tools/smart-tools.js';

export class PersonalAssistant {
  constructor(memory, personality) {
    this.memory = memory;
    this.personality = personality;
    this.tools = new SmartTools(memory);
  }

  async assist(userInput, context) {
    const startTime = Date.now();
    const model = 'llama-3.1-70b-versatile';
    const messages = [
      { role: 'system', content: this.personality.getSystemPrompt() },
      { role: 'user', content: userInput }
    ];

    const availableTools = this.tools.getTools();
    const { parser } = await generate(model, messages, {
      tools: availableTools.map(t => ({
        type: 'function',
        function: { name: t.name, description: t.description, parameters: t.parameters }
      })),
      stream: true
    });

    const chunks = [];
    const toolCalls = new Map();
    for await (const chunk of parser) {
      if (chunk.type === 'tool_call') {
        for (const call of chunk.data) {
          const existing = toolCalls.get(call.index ?? call.id) || { ...call, function: { ...(call.function || {}) } };
          existing.function.arguments = (existing.function.arguments || '') + (call.function?.arguments || '');
          if (call.id) existing.id = call.id;
          if (call.function?.name) existing.function.name = call.function.name;
          toolCalls.set(call.index ?? call.id, existing);
        }
      } else chunks.push(chunk.data);
    }

    for (const call of toolCalls.values()) {
      const tool = availableTools.find(t => t.name === call.function?.name);
      if (!tool) continue;
      const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
      await tool.execute(args, context.userId);
    }

    return { content: chunks.join(''), responseTime: Date.now() - startTime, model };
  }
}
