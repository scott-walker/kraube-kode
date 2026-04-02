import type { StreamEvent } from '../../core/types/stream-event';
import type { IClaudePort } from '../../core/ports/claude.port';

/**
 * Enforces one-active-stream rule.
 * If a new stream starts while one is active, the previous is aborted first.
 */
export class StreamGuard {
  private active = false;

  constructor(private claude: IClaudePort) {}

  get isStreaming(): boolean { return this.active; }

  async *stream(prompt: string): AsyncGenerator<StreamEvent> {
    if (this.active) {
      this.claude.abort();
    }

    this.active = true;
    try {
      for await (const event of this.claude.stream(prompt)) {
        yield event;
      }
    } finally {
      this.active = false;
    }
  }

  abort(): void {
    if (this.active) {
      this.claude.abort();
    }
  }
}
