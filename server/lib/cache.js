class MemoryCache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.store = new Map();
    this.ttlMs = ttlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key) {
    if (key) this.store.delete(key);
    else this.store.clear();
  }
}

export default new MemoryCache();