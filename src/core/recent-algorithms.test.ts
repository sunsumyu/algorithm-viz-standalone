import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRecentAlgorithmIds,
  addRecentAlgorithm,
  removeRecentAlgorithm,
  clearRecentAlgorithms,
  MAX_RECENT_ALGORITHMS,
} from './recent-algorithms';

// 内存 localStorage 模拟 (用于 Node.js / Vitest 环境)
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

(globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;

describe('recent-algorithms persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('should start with empty history', () => {
    expect(getRecentAlgorithmIds()).toEqual([]);
  });

  it('should add items and keep most recent at the front', () => {
    addRecentAlgorithm('binary-search');
    addRecentAlgorithm('two-sum');
    addRecentAlgorithm('climb-stairs');

    expect(getRecentAlgorithmIds()).toEqual(['climb-stairs', 'two-sum', 'binary-search']);
  });

  it('should deduplicate and move re-visited item to front', () => {
    addRecentAlgorithm('binary-search');
    addRecentAlgorithm('two-sum');
    addRecentAlgorithm('binary-search');

    expect(getRecentAlgorithmIds()).toEqual(['binary-search', 'two-sum']);
  });

  it('should limit list to MAX_RECENT_ALGORITHMS', () => {
    for (let i = 1; i <= MAX_RECENT_ALGORITHMS + 5; i++) {
      addRecentAlgorithm(`algo-${i}`);
    }

    const list = getRecentAlgorithmIds();
    expect(list.length).toBe(MAX_RECENT_ALGORITHMS);
    expect(list[0]).toBe(`algo-${MAX_RECENT_ALGORITHMS + 5}`);
  });

  it('should remove specific item', () => {
    addRecentAlgorithm('algo-1');
    addRecentAlgorithm('algo-2');
    addRecentAlgorithm('algo-3');

    removeRecentAlgorithm('algo-2');
    expect(getRecentAlgorithmIds()).toEqual(['algo-3', 'algo-1']);
  });

  it('should clear all history', () => {
    addRecentAlgorithm('algo-1');
    addRecentAlgorithm('algo-2');
    clearRecentAlgorithms();

    expect(getRecentAlgorithmIds()).toEqual([]);
  });
});
