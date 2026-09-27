import { randomUUID } from 'node:crypto';
export class Orchestrator {
  constructor({ registry = {}, maxRetries = 2 } = {}) { this.registry = registry; this.maxRetries = maxRetries; this.jobs = new Map(); }
  register(name, handler) { this.registry[name] = handler; return this; }
  async execute(request, context = {}) { const plan = context.plan || [{ name: 'assistant', input: request }]; const job = { id: randomUUID(), request, status: 'running', completed: 0, total: plan.length, results: [] }; this.jobs.set(job.id, job); for (const step of plan) { const handler = this.registry[step.name]; if (!handler) { job.results.push({ step: step.name, error: 'Tool is not registered' }); job.completed++; continue; } let error; for (let attempt = 0; attempt <= this.maxRetries; attempt++) { try { job.results.push({ step: step.name, output: await handler(step.input ?? request, context) }); error = null; break; } catch (e) { error = e; } } if (error) job.results.push({ step: step.name, error: error.message }); job.completed++; } job.status = job.results.some(r => r.error) ? 'completed-with-errors' : 'completed'; return job; }
  getProgress(id) { return this.jobs.get(id) || null; }
}
