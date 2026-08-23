import { describe, it, expect } from 'vitest';
import { algoNavigation } from './algo-navigation';
import { CATEGORY_CONFIG, getDifficultyConfig } from './category-config';
import { algorithmManager } from './algorithm-manager';

describe('algoNavigation and Category Config', () => {
  it('should have valid category configurations with orders', () => {
    expect(CATEGORY_CONFIG.array.order).toBeLessThan(CATEGORY_CONFIG['linked-list'].order);
    expect(CATEGORY_CONFIG['linked-list'].order).toBeLessThan(CATEGORY_CONFIG['tree'].order);
    expect(CATEGORY_CONFIG['tree'].order).toBeLessThan(CATEGORY_CONFIG['greedy'].order);
    expect(CATEGORY_CONFIG['greedy'].order).toBeLessThan(CATEGORY_CONFIG['dynamic-programming'].order);
  });

  it('should correctly format difficulty configurations', () => {
    expect(getDifficultyConfig(1).label).toBe('入门');
    expect(getDifficultyConfig(2).label).toBe('进阶');
    expect(getDifficultyConfig(3).label).toBe('挑战');
    expect(getDifficultyConfig(undefined).label).toBe('进阶');
  });

  it('should return curriculum ordered algorithms', () => {
    const ordered = algoNavigation.getOrderedAlgorithms();
    expect(ordered.length).toBeGreaterThan(0);

    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      const prevCatOrder = CATEGORY_CONFIG[prev.category]?.order ?? 999;
      const currCatOrder = CATEGORY_CONFIG[curr.category]?.order ?? 999;

      if (prevCatOrder === currCatOrder) {
        expect((prev.levelOrder ?? 999)).toBeLessThanOrEqual((curr.levelOrder ?? 999));
      } else {
        expect(prevCatOrder).toBeLessThan(currCatOrder);
      }
    }
  });

  it('should compute prev and next algorithms accurately', () => {
    const ordered = algoNavigation.getOrderedAlgorithms();
    expect(ordered.length).toBeGreaterThan(2);

    const first = ordered[0];
    const second = ordered[1];
    const last = ordered[ordered.length - 1];

    // 测试第一个算法
    algoNavigation.updateActiveAlgorithm(first.id);
    const firstState = algoNavigation.getPrevAndNext();
    expect(firstState.currentIndex).toBe(0);
    expect(firstState.prev).toBeNull();
    expect(firstState.next?.id).toBe(second.id);
    expect(firstState.total).toBe(ordered.length);

    // 测试中间算法
    algoNavigation.updateActiveAlgorithm(second.id);
    const secondState = algoNavigation.getPrevAndNext();
    expect(secondState.currentIndex).toBe(1);
    expect(secondState.prev?.id).toBe(first.id);
    expect(secondState.next?.id).toBe(ordered[2].id);

    // 测试最后一个算法
    algoNavigation.updateActiveAlgorithm(last.id);
    const lastState = algoNavigation.getPrevAndNext();
    expect(lastState.currentIndex).toBe(ordered.length - 1);
    expect(lastState.prev?.id).toBe(ordered[ordered.length - 2].id);
    expect(lastState.next).toBeNull();

    // 隐藏状态
    algoNavigation.hide();
    const hiddenState = algoNavigation.getPrevAndNext();
    expect(hiddenState.currentIndex).toBe(-1);
    expect(hiddenState.prev).toBeNull();
    expect(hiddenState.next).toBeNull();
  });
});
