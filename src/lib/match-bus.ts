import { EventEmitter } from "events";

class MatchEventBus extends EventEmitter {
  private static instance: MatchEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): MatchEventBus {
    if (!MatchEventBus.instance) {
      MatchEventBus.instance = new MatchEventBus();
    }
    return MatchEventBus.instance;
  }

  emitMatchUpdate(matchId: string, data: unknown): void {
    this.emit(matchId, data);
  }

  subscribe(matchId: string, listener: (data: unknown) => void): () => void {
    this.on(matchId, listener);
    return () => {
      this.off(matchId, listener);
    };
  }
}

export const matchBus = MatchEventBus.getInstance();
