// @vitest-environment jsdom
/**
 * 左程云 Class 069: 从递归入手三维动态规划专题单元测试
 * 覆盖：
 * 1. 骑士在棋盘上的概率 (knight-probability · LeetCode 688)
 * 2. 出界的路径数 (out-of-boundary-paths · LeetCode 576)
 * 3. 盈利计划 (profitable-schemes · LeetCode 879)
 * 4. 矩阵中和能被 K 整除的路径 (paths-divisible-by-k · LeetCode 2435)
 * 5. 扰乱字符串 (scramble-string · LeetCode 87)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { algorithmRegistry } from '../../../../core/algorithm-registry';
import '../../../batch-dynamic-programming-index';
import '../specs';

describe('左程云 Class 069: 从递归入手三维动态规划专题测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const ids = [
    'knight-probability',
    'out-of-boundary-paths',
    'profitable-schemes',
    'paths-divisible-by-k',
    'scramble-string',
  ];

  it('所有 5 个 Class 069 三维 DP 算法均已成功注册至 algorithmRegistry', () => {
    for (const id of ids) {
      const manifest = algorithmRegistry.getManifest(id);
      expect(manifest, `算法 ${id} 未能正确注册`).toBeDefined();
      expect(manifest?.name).toBeTruthy();
      expect(manifest?.aliases).toBeDefined();
      expect(manifest?.aliases?.length).toBeGreaterThan(0);
    }
  });

  describe('1. 骑士在棋盘上的概率 (knight-probability · LeetCode 688)', () => {
    it('别名必须包含 Class 069 与 LeetCode 688', () => {
      const manifest = algorithmRegistry.getManifest('knight-probability');
      expect(manifest?.aliases).toContain('class069-code01');
      expect(manifest?.aliases).toContain('knight-probability-069');
      expect(manifest?.aliases).toContain('leetcode-688');
    });

    it('Visualizer 挂载与表现层沙盘渲染无崩溃且无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('knight-probability');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('2. 出界的路径数 (out-of-boundary-paths · LeetCode 576)', () => {
    it('别名必须包含 Class 069 与 LeetCode 576', () => {
      const manifest = algorithmRegistry.getManifest('out-of-boundary-paths');
      expect(manifest?.aliases).toContain('class069-code02');
      expect(manifest?.aliases).toContain('out-of-boundary-paths-069');
      expect(manifest?.aliases).toContain('leetcode-576');
    });

    it('Visualizer 挂载沙盘无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('out-of-boundary-paths');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('3. 盈利计划 (profitable-schemes · LeetCode 879)', () => {
    it('双版本统合别名必须包含 Class 069 与 LeetCode 879', () => {
      const manifest = algorithmRegistry.getManifest('profitable-schemes');
      expect(manifest?.aliases).toContain('class069-code03');
      expect(manifest?.aliases).toContain('profitable-schemes-069');
      expect(manifest?.aliases).toContain('leetcode-879');
    });

    it('Visualizer 挂载沙盘无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('profitable-schemes');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('4. 矩阵中和能被 K 整除的路径 (paths-divisible-by-k · LeetCode 2435)', () => {
    it('别名必须包含 Class 069 与 LeetCode 2435', () => {
      const manifest = algorithmRegistry.getManifest('paths-divisible-by-k');
      expect(manifest?.aliases).toContain('class069-code04');
      expect(manifest?.aliases).toContain('paths-divisible-by-k-069');
      expect(manifest?.aliases).toContain('leetcode-2435');
    });

    it('Visualizer 挂载沙盘无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('paths-divisible-by-k');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('5. 扰乱字符串 (scramble-string · LeetCode 87)', () => {
    it('别名必须包含 Class 069 与 LeetCode 87', () => {
      const manifest = algorithmRegistry.getManifest('scramble-string');
      expect(manifest?.aliases).toContain('class069-code05');
      expect(manifest?.aliases).toContain('scramble-string-069');
      expect(manifest?.aliases).toContain('leetcode-87');
    });

    it('Visualizer 挂载沙盘无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('scramble-string');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });
});
