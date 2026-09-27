import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PersonalAssistant } from './core/personal-assistant.js';
import { FreeMemoryStore } from './memory/free-store.js';
import { PersonalityEngine } from './core/personality-engine.js';
import { EvolutionEngine } from './brain/evolution-engine.js';
import { InternetLearner } from './brain/internet-learner.js';

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

const memory = new FreeMemoryStore();
const personality = new PersonalityEngine(process.env.NOVA_PERSONALITY || 'jarvis');
const nova = new PersonalAssistant(memory, personality);
const brain = new EvolutionEngine();
const internet = new InternetLearner();

await brain.initialize();

app.get('/', (req, res) => {
  res.json({
    name: 'NOVA Personal Assistant',
    version: '2.0',
    status: 'operational',
    brain: { generation: brain.generation, experiences: brain.experiences.length }
  });
});

app.post('/assist', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    if (!message || !user_id) return res.status(400).json({ error: 'Message and user_id required' });

    if (message.toLowerCase().startsWith('learn about')) {
      const topic = message.replace(/learn about/i, '').trim();
      await internet.expandKnowledge(topic);
      return res.json({ response: `I've learned about "${topic}"` });
    }

    const result = await nova.assist(message, { userId: user_id });
    await brain.learn({ input: message, output: result.content, rating: 4, metadata: result });

    res.json({
      response: result.content,
      metadata: {
        responseTime: `${result.responseTime}ms`,
        model: result.model,
        generation: brain.generation
      }
    });
  } catch (error) {
    console.error('Assist request failed:', error);
    res.status(500).json({ error: 'Please try again', retry: true });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NOVA running on port ${PORT}`));
