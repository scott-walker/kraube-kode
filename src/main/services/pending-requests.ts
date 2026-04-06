const TIMEOUT_MS = 5 * 60 * 1000;

interface PendingEntry<T> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class PendingRequests<T = unknown> {
  private pending = new Map<string, PendingEntry<T>>();

  register(id: string): Promise<T> {
    this.cancel(id);
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request ${id} timed out`));
      }, TIMEOUT_MS);
      this.pending.set(id, { resolve, reject, timer });
    });
  }

  resolve(id: string, value: T): boolean {
    const entry = this.pending.get(id);
    if (!entry) return false;
    clearTimeout(entry.timer);
    this.pending.delete(id);
    entry.resolve(value);
    return true;
  }

  cancel(id: string): void {
    const entry = this.pending.get(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    this.pending.delete(id);
    entry.reject(new Error(`Request ${id} cancelled`));
  }

  cancelAll(): void {
    for (const [id] of this.pending) this.cancel(id);
  }
}
