// @vitest-environment jsdom
/**
 * 左程云 Class 078 & 079: 树型动态规划专题单元测试套件
 * 涵盖：
 * 1. 树的最大距离 (max-distance-in-tree · Class 078 Code01)
 * 2. 二叉树最大路径和 (max-path-sum · LeetCode 124 · Class 078 Code02)
 * 3. 最大 BST 子树 (largest-bst-subtree · LeetCode 333 · Class 078 Code03)
 * 4. 二叉树的直径 (tree-diameter · LeetCode 543 · Class 078 Code04)
 * 5. 监控二叉树 (binary-tree-cameras · LeetCode 968 · Class 078 Code05)
 * 6. 没有上司的舞会 (party-without-boss · 洛谷 P1352 / LC 337 · Class 079 Code01)
 * 7. 选课 (course-selection · 洛谷 P2014 · Class 079 Code02)
 * 8. 到达首都的最少油耗 (minimum-fuel-cost · LeetCode 2477 · Class 079 Code03)
 * 9. 相邻字符不同的最长路径 (longest-path-different-characters · LeetCode 2246 · Class 079 Code04)
 * 10. 移除子树后的二叉树高度 (height-removal-queries · LeetCode 2458 · Class 079 Code05)
 * 11. 从树中删除边的最小分数 (minimum-score-after-removals · LeetCode 2322 · Class 079 Code06)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { algorithmRegistry } from '../../../core/algorithm-registry';
import '../../batch-dynamic-programming-index';

describe('左程云 Class 078 & 079 树型动态规划专题测试套件', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const class078Ids = [
    'max-distance-in-tree',
    'max-path-sum',
    'largest-bst-subtree',
    'tree-diameter',
    'binary-tree-cameras',
  ];

  const class079Ids = [
    'party-without-boss',
    'course-selection',
    'minimum-fuel-cost',
    'longest-path-different-characters',
    'height-removal-queries',
    'minimum-score-after-removals',
  ];

  it('所有 11 个 Class 078/079 树型 DP 算法均已成功注册至 algorithmRegistry', () => {
    for (const id of [...class078Ids, ...class079Ids]) {
      const manifest = algorithmRegistry.getManifest(id);
      expect(manifest, `算法 ${id} 必须注册成功`).toBeDefined();
      expect(manifest?.name).toBeTruthy();
      expect(manifest?.aliases).toBeDefined();
      expect(manifest?.aliases?.length).toBeGreaterThan(0);
    }
  });

  describe('Class 078 树型 DP（上）别名与沙盘验证', () => {
    it('max-distance-in-tree 别名包含 class078-code01', () => {
      const manifest = algorithmRegistry.getManifest('max-distance-in-tree');
      expect(manifest?.aliases).toContain('class078-code01');
    });

    it('max-path-sum (LC 124) 别名包含 class078-code02 与 leetcode-124', () => {
      const manifest = algorithmRegistry.getManifest('max-path-sum');
      expect(manifest?.aliases).toContain('class078-code02');
      expect(manifest?.aliases).toContain('leetcode-124');
    });

    it('largest-bst-subtree (LC 333) 别名包含 class078-code03 与 leetcode-333', () => {
      const manifest = algorithmRegistry.getManifest('largest-bst-subtree');
      expect(manifest?.aliases).toContain('class078-code03');
      expect(manifest?.aliases).toContain('leetcode-333');
    });

    it('tree-diameter (LC 543) 别名包含 class078-code04 与 leetcode-543', () => {
      const manifest = algorithmRegistry.getManifest('tree-diameter');
      expect(manifest?.aliases).toContain('class078-code04');
      expect(manifest?.aliases).toContain('leetcode-543');
    });

    it('binary-tree-cameras (LC 968) 别名包含 class078-code05 与 leetcode-968', () => {
      const manifest = algorithmRegistry.getManifest('binary-tree-cameras');
      expect(manifest?.aliases).toContain('class078-code05');
      expect(manifest?.aliases).toContain('leetcode-968');
    });

    it('Visualizer 挂载沙盘无崩溃，无 [object Object]', () => {
      for (const id of class078Ids) {
        const manifest = algorithmRegistry.getManifest(id);
        const visualizer = new (manifest!.Visualizer as any)(container);
        expect(visualizer).toBeDefined();
        const html = container.innerHTML;
        expect(html).not.toContain('[object Object]');
        expect(html).not.toContain('NaN');
        if (typeof visualizer?.dispose === 'function') visualizer.dispose();
      }
    });
  });

  describe('Class 079 树型 DP（下）别名与沙盘验证', () => {
    it('party-without-boss 别名包含 class079-code01 与 luogu-p1352', () => {
      const manifest = algorithmRegistry.getManifest('party-without-boss');
      expect(manifest?.aliases).toContain('class079-code01');
      expect(manifest?.aliases).toContain('luogu-p1352');
    });

    it('course-selection 别名包含 class079-code02 与 luogu-p2014', () => {
      const manifest = algorithmRegistry.getManifest('course-selection');
      expect(manifest?.aliases).toContain('class079-code02');
      expect(manifest?.aliases).toContain('luogu-p2014');
    });

    it('minimum-fuel-cost (LC 2477) 别名包含 class079-code03 与 leetcode-2477', () => {
      const manifest = algorithmRegistry.getManifest('minimum-fuel-cost');
      expect(manifest?.aliases).toContain('class079-code03');
      expect(manifest?.aliases).toContain('leetcode-2477');
    });

    it('longest-path-different-characters (LC 2246) 别名包含 class079-code04 与 leetcode-2246', () => {
      const manifest = algorithmRegistry.getManifest('longest-path-different-characters');
      expect(manifest?.aliases).toContain('class079-code04');
      expect(manifest?.aliases).toContain('leetcode-2246');
    });

    it('height-removal-queries (LC 2458) 别名包含 class079-code05 与 leetcode-2458', () => {
      const manifest = algorithmRegistry.getManifest('height-removal-queries');
      expect(manifest?.aliases).toContain('class079-code05');
      expect(manifest?.aliases).toContain('leetcode-2458');
    });

    it('minimum-score-after-removals (LC 2322) 别名包含 class079-code06 与 leetcode-2322', () => {
      const manifest = algorithmRegistry.getManifest('minimum-score-after-removals');
      expect(manifest?.aliases).toContain('class079-code06');
      expect(manifest?.aliases).toContain('leetcode-2322');
    });

    it('Visualizer 挂载沙盘无崩溃，无 [object Object]', () => {
      for (const id of class079Ids) {
        const manifest = algorithmRegistry.getManifest(id);
        const visualizer = new (manifest!.Visualizer as any)(container);
        expect(visualizer).toBeDefined();
        const html = container.innerHTML;
        expect(html).not.toContain('[object Object]');
        expect(html).not.toContain('NaN');
        if (typeof visualizer?.dispose === 'function') visualizer.dispose();
      }
    });
  });
});
