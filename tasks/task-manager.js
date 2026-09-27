import { v4 as uuidv4 } from 'uuid';

export class TaskManager {
  constructor(memory) { this.memory = memory; }

  async createTask(userId, description, options = {}) {
    const task = { id: uuidv4(), description, status: 'pending', priority: options.priority || 'medium', createdAt: new Date().toISOString() };
    await this.memory.store(`task:${userId}:${task.id}`, JSON.stringify(task));
    return task;
  }

  async getTasks(userId) {
    const values = await this.memory.getAll(`task:${userId}:`);
    return values.map(value => JSON.parse(value));
  }
}
