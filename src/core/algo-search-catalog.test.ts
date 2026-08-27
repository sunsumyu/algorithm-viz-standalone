import { describe, it, expect } from 'vitest';
import { AlgoSearchCatalog, algoSearchCatalog } from './algo-search-catalog';
import { AlgorithmConfig } from './algorithm-manager';
import { CATEGORY_CONFIG } from './category-config';

describe('AlgoSearchCatalog Deep Domain Model Guard', () => {
  const mockAlgorithms: AlgorithmConfig[] = [
    {
      id: 'binary-search',
      name: '二分查找',
      category: 'array',
      difficulty: 1,
      levelOrder: 1,
      description: '经典二分查找算法，在有序数组中快速定位目标元素。',
      learningGoal: '掌握双指针与开闭区间不变量。',
      viewId: 'binary-search-view',
      icon: '🔍'
    },
    {
      id: 'remove-element',
      name: '移除元素',
      category: 'array',
      difficulty: 1,
      levelOrder: 2,
      description: '原地移除数组中所有等于 val 的元素。',
      learningGoal: '掌握快慢指针技巧。',
      viewId: 'remove-element-view',
      icon: '✂️'
    },
    {
      id: 'fibonacci',
      name: '斐波那契数',
      category: 'dynamic-programming',
      difficulty: 1,
      levelOrder: 1,
      description: '斐波那契数列递推演化过程。',
      learningGoal: '理解状态转移方程与四阶段演化。',
      viewId: 'fibonacci-view',
      icon: '🔢'
    },
    {
      id: 'knapsack-01',
      name: '0-1背包问题',
      category: 'dynamic-programming',
      difficulty: 2,
      levelOrder: 10,
      description: '动态规划经典二维与一维空间滚动推导。',
      learningGoal: '掌握背包递推模型。',
      viewId: 'knapsack-01-view',
      icon: '🎒'
    }
  ];

  it('should maintain singleton instance', () => {
    const instance1 = AlgoSearchCatalog.getInstance();
    const instance2 = algoSearchCatalog;
    expect(instance1).toBe(instance2);
  });

  describe('getOrderedAlgorithms', () => {
    it('should sort algorithms by category order first, then levelOrder', () => {
      const ordered = algoSearchCatalog.getOrderedAlgorithms(mockAlgorithms);
      expect(ordered.map((a) => a.id)).toEqual([
        'binary-search',
        'remove-element',
        'fibonacci',
        'knapsack-01'
      ]);
    });
  });

  describe('getPrevAndNext', () => {
    it('should correctly determine boundary navigation states', () => {
      // 1. 第一个元素
      const firstState = algoSearchCatalog.getPrevAndNext('binary-search', mockAlgorithms);
      expect(firstState.currentIndex).toBe(0);
      expect(firstState.prev).toBeNull();
      expect(firstState.next?.id).toBe('remove-element');
      expect(firstState.total).toBe(4);

      // 2. 中间元素
      const midState = algoSearchCatalog.getPrevAndNext('remove-element', mockAlgorithms);
      expect(midState.currentIndex).toBe(1);
      expect(midState.prev?.id).toBe('binary-search');
      expect(midState.next?.id).toBe('fibonacci');

      // 3. 最后一个元素
      const lastState = algoSearchCatalog.getPrevAndNext('knapsack-01', mockAlgorithms);
      expect(lastState.currentIndex).toBe(3);
      expect(lastState.prev?.id).toBe('fibonacci');
      expect(lastState.next).toBeNull();

      // 4. 空值或未找到
      const nullState = algoSearchCatalog.getPrevAndNext(null, mockAlgorithms);
      expect(nullState.currentIndex).toBe(-1);
      expect(nullState.prev).toBeNull();
      expect(nullState.next).toBeNull();

      const notFoundState = algoSearchCatalog.getPrevAndNext('non-existent', mockAlgorithms);
      expect(notFoundState.currentIndex).toBe(-1);
      expect(notFoundState.prev).toBeNull();
      expect(notFoundState.next).toBeNull();
    });
  });

  describe('groupCategories', () => {
    it('should cluster algorithms into sorted category groups with metadata', () => {
      const groups = algoSearchCatalog.groupCategories(mockAlgorithms);
      expect(groups.length).toBe(2);

      expect(groups[0].category).toBe('array');
      expect(groups[0].algorithms.length).toBe(2);
      expect(groups[0].config.name).toBe(CATEGORY_CONFIG.array.name);

      expect(groups[1].category).toBe('dynamic-programming');
      expect(groups[1].algorithms.length).toBe(2);
    });
  });

  describe('search', () => {
    it('should return all algorithms when query is empty', () => {
      const result = algoSearchCatalog.search('', mockAlgorithms);
      expect(result.totalMatches).toBe(4);
      expect(result.groups.length).toBe(2);
    });

    it('should search across algorithm name', () => {
      const result = algoSearchCatalog.search('二分', mockAlgorithms);
      expect(result.totalMatches).toBe(1);
      expect(result.matchedAlgorithms[0].id).toBe('binary-search');
    });

    it('should search across description and learning goals', () => {
      const result = algoSearchCatalog.search('快慢指针', mockAlgorithms);
      expect(result.totalMatches).toBe(1);
      expect(result.matchedAlgorithms[0].id).toBe('remove-element');

      const dpResult = algoSearchCatalog.search('四阶段', mockAlgorithms);
      expect(dpResult.totalMatches).toBe(1);
      expect(dpResult.matchedAlgorithms[0].id).toBe('fibonacci');
    });

    it('should search across category display name', () => {
      const result = algoSearchCatalog.search('动态规划', mockAlgorithms);
      expect(result.totalMatches).toBe(2);
      expect(result.matchedAlgorithms.map((a) => a.id)).toEqual(['fibonacci', 'knapsack-01']);
    });

    it('should handle zero match queries safely', () => {
      const result = algoSearchCatalog.search('xyz999_not_found', mockAlgorithms);
      expect(result.totalMatches).toBe(0);
      expect(result.groups.length).toBe(0);
      expect(result.matchedAlgorithms.length).toBe(0);
    });
  });

  describe('splitHighlightSegments & highlightHtml', () => {
    it('should segment text into match and non-match slices', () => {
      const segments = algoSearchCatalog.splitHighlightSegments('二分查找与经典二分', '二分');
      expect(segments).toEqual([
        { text: '二分', isMatch: true },
        { text: '查找与经典', isMatch: false },
        { text: '二分', isMatch: true }
      ]);
    });

    it('should escape HTML characters and insert highlight tags securely', () => {
      const html = algoSearchCatalog.highlightHtml('0-1背包 & <测试>', '背包');
      expect(html).toBe('0-1<span class="drawer-highlight">背包</span> &amp; &lt;测试&gt;');
    });

    it('should handle empty query gracefully in highlightHtml', () => {
      const html = algoSearchCatalog.highlightHtml('<div>Plain Text</div>', '');
      expect(html).toBe('&lt;div&gt;Plain Text&lt;/div&gt;');
    });
  });
});
