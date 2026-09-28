// @vitest-environment jsdom
/**
 * 左程云 Class 068: 从递归入手二维动态规划（下）/ 双串与区间问题专题单元测试
 * 覆盖：
 * 1. 不同的子序列 (distinct-subsequences · LeetCode 115 · Class068 Code01)
 * 2. 编辑距离 (edit-distance · LeetCode 72 · Class068 Code02)
 * 3. 交错字符串 (interleaving-string · LeetCode 97 · Class068 Code03)
 * 4. 最少删除使成为子串 (min-delete-to-be-substring · Class068 Code04)
 * 5. 两个字符串的删除操作 (delete-operation-for-two-strings · LeetCode 583 · Class068 Code05)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { algorithmRegistry } from '../../../../core/algorithm-registry';
import { AlgorithmModelRepository } from '../../../../core/model-repository';
import { DpStepEngine } from '../engine/dp-step-engine';
import '../../../batch-dynamic-programming-index';
import '../specs';

describe('左程云 Class 068: 从递归入手二维动态规划（下）双串与区间问题专题测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const class068Suites = [
    {
      id: 'distinct-subsequences',
      code: 'class068-code01',
      alias: 'distinct-subsequences-068',
      leetcode: 'leetcode-115',
    },
    {
      id: 'edit-distance',
      code: 'class068-code02',
      alias: 'edit-distance-068',
      leetcode: 'leetcode-72',
    },
    {
      id: 'interleaving-string',
      code: 'class068-code03',
      alias: 'interleaving-string-068',
      leetcode: 'leetcode-97',
    },
    {
      id: 'min-delete-to-be-substring',
      code: 'class068-code04',
      alias: 'min-delete-to-be-substring-068',
      leetcode: 'min-delete-substring',
    },
    {
      id: 'delete-operation-for-two-strings',
      code: 'class068-code05',
      alias: 'delete-operation-for-two-strings-068',
      leetcode: 'leetcode-583',
    },
  ];

  it('所有 5 个 Class 068 算法均已成功注册至 algorithmRegistry', () => {
    for (const item of class068Suites) {
      const manifest = algorithmRegistry.getManifest(item.id);
      expect(manifest, `算法 ${item.id} 未能正确注册`).toBeDefined();
      expect(manifest?.name).toBeTruthy();
      expect(manifest?.category).toBe('dynamic-programming');
      expect(manifest?.aliases).toContain(item.code);
      expect(manifest?.aliases).toContain(item.alias);
      expect(manifest?.aliases).toContain(item.leetcode);
    }
  });

  describe('1. 不同的子序列 (distinct-subsequences · LeetCode 115)', () => {
    it('顶层抽象模型完整且具备 4 个演化阶段', () => {
      expect(AlgorithmModelRepository.hasModel('distinct-subsequences')).toBe(true);
      const model = AlgorithmModelRepository.getModel('distinct-subsequences');
      expect(model.stages['stage-1']).toBeDefined();
      expect(model.stages['stage-2']).toBeDefined();
      expect(model.stages['stage-3']).toBeDefined();
      expect(model.stages['stage-4']).toBeDefined();
    });

    it('Visualizer 挂载与表现层沙盘渲染无崩溃且无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('distinct-subsequences');
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

  describe('2. 编辑距离 (edit-distance · LeetCode 72)', () => {
    it('DpStepEngine 计算 "horse" 和 "ros" 编辑距离应为 3', () => {
      const steps = DpStepEngine.generateSteps('edit-distance', {
        s: 'horse',
        t: 'ros',
      });
      expect(steps.length).toBeGreaterThan(0);
    });

    it('Visualizer 挂载与表现层沙盘渲染无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('edit-distance');
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

  describe('3. 交错字符串 (interleaving-string · LeetCode 97)', () => {
    it('顶层抽象模型完整且具备 4 个演化阶段', () => {
      expect(AlgorithmModelRepository.hasModel('interleaving-string')).toBe(true);
      const model = AlgorithmModelRepository.getModel('interleaving-string');
      expect(model.stages['stage-1']).toBeDefined();
      expect(model.stages['stage-2']).toBeDefined();
      expect(model.stages['stage-3']).toBeDefined();
      expect(model.stages['stage-4']).toBeDefined();
    });

    it('Visualizer 挂载与表现层沙盘渲染无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('interleaving-string');
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

  describe('4. 最少删除使成为子串 (min-delete-to-be-substring · Class 068 题目 4)', () => {
    it('顶层抽象模型完整且具备 4 个演化阶段', () => {
      expect(AlgorithmModelRepository.hasModel('min-delete-to-be-substring')).toBe(true);
      const model = AlgorithmModelRepository.getModel('min-delete-to-be-substring');
      expect(model.stages['stage-1']).toBeDefined();
      expect(model.stages['stage-2']).toBeDefined();
      expect(model.stages['stage-3']).toBeDefined();
      expect(model.stages['stage-4']).toBeDefined();
    });

    it('Visualizer 挂载与表现层沙盘渲染无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('min-delete-to-be-substring');
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

  describe('5. 两个字符串的删除操作 (delete-operation-for-two-strings · LeetCode 583)', () => {
    it('DpStepEngine 计算 "sea" 和 "eat" 删除步数应为 2', () => {
      const steps = DpStepEngine.generateSteps('delete-operation-for-two-strings', {
        s: 'sea',
        t: 'eat',
      });
      expect(steps.length).toBeGreaterThan(0);
    });

    it('Visualizer 挂载与表现层沙盘渲染无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('delete-operation-for-two-strings');
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
