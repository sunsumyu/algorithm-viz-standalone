import { describe, it, expect } from 'vitest';
import { resolveAlgorithmIcon, ALGORITHM_EXPLICIT_ICONS } from './catalog-icons';

describe('resolveAlgorithmIcon (Catalog Icons Deep Utility)', () => {
  it('优先返回算法自身声明的非 fa- emoji 图标', () => {
    const icon = resolveAlgorithmIcon({ id: 'custom-algo', icon: '🚀', category: 'dynamic-programming' });
    expect(icon).toBe('🚀');
  });

  it('自身声明 fa- 开头的类名时应穿透降级至显式字典', () => {
    const icon = resolveAlgorithmIcon({ id: 'dinic-max-flow', icon: 'fa-water', category: 'graph' });
    expect(icon).toBe('🌊');
  });

  it('对存在于显式字典中的题目应返回对应的专属 emoji', () => {
    expect(resolveAlgorithmIcon({ id: 'lca', category: 'tree' })).toBe('🌳');
    expect(resolveAlgorithmIcon({ id: 'binary-search', category: 'search' })).toBe('🔍');
    expect(resolveAlgorithmIcon({ id: 'candy', category: 'greedy' })).toBe('🍬');
  });

  it('字典未收录时应回退至分类预设图标', () => {
    const icon = resolveAlgorithmIcon({ id: 'unknown-dp-problem', category: 'dynamic-programming' });
    expect(icon).toBe('🎯');
  });

  it('入参为空或未知分类时应返回通用兜底图标 📄', () => {
    expect(resolveAlgorithmIcon(null)).toBe('📄');
    expect(resolveAlgorithmIcon({ id: 'alien-algo', category: 'unknown-cat' })).toBe('📄');
  });
});
