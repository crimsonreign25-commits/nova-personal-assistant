import { createClient } from '@supabase/supabase-js';

export class FreeMemoryStore {
  constructor() {
    this.supabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY
      ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
      : null;
    this.localCache = new Map();
  }

  async store(key, value) {
    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('memories').insert({ key, content: value });
        if (!error) return;
      } catch {}
    }
    this.localCache.set(key, value);
  }

  async getAll(prefix) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('memories').select('content').like('key', `${prefix}%`);
        if (!error) return data?.map(item => item.content) || [];
      } catch {}
    }
    return Array.from(this.localCache.entries())
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value);
  }
}
