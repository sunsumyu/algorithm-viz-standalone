/**
 * 搜索历史管理器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
  SEARCH_HISTORY_KEY,
  MAX_SEARCH_HISTORY,
} from './search-history';

// 简单内存 localStorage 模拟
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

(globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;

describe('search-history', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('初始状态下搜索历史为空数组', () => {
    expect(getSearchHistory()).toEqual([]);
  });

  it('添加搜索词后正常保存且最新项置顶', () => {
    addSearchHistory('二分查找');
    addSearchHistory('动态规划');
    expect(getSearchHistory()).toEqual(['动态规划', '二分查找']);
  });

  it('重复添加相同搜索词（忽略大小写）会自动置顶且去重', () => {
    addSearchHistory('DP');
    addSearchHistory('Tree');
    addSearchHistory('dp');
    expect(getSearchHistory()).toEqual(['dp', 'Tree']);
  });

  it('空字符串或仅空白字符不计入搜索历史', () => {
    addSearchHistory('   ');
    addSearchHistory('');
    expect(getSearchHistory()).toEqual([]);
  });

  it(`最多只保留 ${MAX_SEARCH_HISTORY} 条搜索历史`, () => {
    for (let i = 1; i <= 12; i++) {
      addSearchHistory(`算法${i}`);
    }
    const history = getSearchHistory();
    expect(history.length).toBe(MAX_SEARCH_HISTORY);
    expect(history[0]).toBe('算法12');
    expect(history[history.length - 1]).toBe('算法5');
  });

  it('删除单条搜索历史', () => {
    addSearchHistory('贪心');
    addSearchHistory('图论');
    removeSearchHistory('贪心');
    expect(getSearchHistory()).toEqual(['图论']);
  });

  it('清空所有搜索历史', () => {
    addSearchHistory('A');
    addSearchHistory('B');
    clearSearchHistory();
    expect(getSearchHistory()).toEqual([]);
  });
});
