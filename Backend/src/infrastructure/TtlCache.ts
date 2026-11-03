// Tiny in-memory cache for one value that expires after ttlMs.
export class TtlCache<T> {
  private value: T | undefined;
  private expiresAt = 0;

  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  get(): T | undefined {
    return this.now() < this.expiresAt ? this.value : undefined;
  }

  set(value: T): void {
    this.value = value;
    this.expiresAt = this.now() + this.ttlMs;
  }
}
