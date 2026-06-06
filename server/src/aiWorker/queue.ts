import { EventEmitter } from "events";

type WorkItem = {
  conversationId: string;
  userId?: string;
  systemPrompt: string;
  userPrompt: string;
  socketRoom: string;
  meta?: any;
  isManual?: boolean; // flag to indicate if this was a manual escalation
};

class AIQueue extends EventEmitter {
  private queue: WorkItem[] = [];
  private running = false;

  enqueue(item: WorkItem) {
    this.queue.push(item);
    // emit for debugging
    this.emit("enqueue", item);
    this.processNext();
  }

  private async processNext() {
    if (this.running) return;
    const next = this.queue.shift();
    if (!next) return;
    this.running = true;
    try {
      // the 'process' listener should handle the item (streaming, persistence)
      this.emit("process", next);
      // don't wait here — the process handler will persist and emit done events itself
    } finally {
      this.running = false;
      setImmediate(() => this.processNext());
    }
  }
}

export const aiQueue = new AIQueue();
