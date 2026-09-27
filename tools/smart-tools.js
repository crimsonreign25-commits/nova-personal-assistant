import { TaskManager } from '../tasks/task-manager.js';

export class SmartTools {
  constructor(memory) { this.taskManager = new TaskManager(memory); }

  getTools() {
    return [
      {
        name: 'create_task', description: 'Create a new task',
        parameters: { type: 'object', properties: { description: { type: 'string' }, priority: { type: 'string', enum: ['low', 'medium', 'high'] } }, required: ['description'] },
        execute: async (args, userId) => { await this.taskManager.createTask(userId, args.description, { priority: args.priority || 'medium' }); return { success: true }; }
      },
      {
        name: 'get_tasks', description: 'Get user tasks',
        parameters: { type: 'object', properties: { filter: { type: 'string' } } },
        execute: async (args, userId) => ({ tasks: await this.taskManager.getTasks(userId) })
      }
    ];
  }
}
