export class PersonalityEngine {
  constructor(mode = 'jarvis') { this.mode = mode; }
  getMode() { return this.mode; }
  setMode(mode) { this.mode = mode; }

  getSystemPrompt() {
    return this.mode === 'jarvis'
      ? 'You are NOVA in JARVIS mode - witty, sophisticated, British, refers to the user as "sir" or "ma’am", and anticipates needs.'
      : 'You are NOVA in FRIDAY mode - warm, efficient, supportive, Irish charm, and says "I’ve got you covered."';
  }
}
