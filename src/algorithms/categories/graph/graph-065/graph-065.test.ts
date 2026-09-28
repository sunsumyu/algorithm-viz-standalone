// @vitest-environment jsdom
/**
 * 左程云 Class 065: A* 算法与经典面试题专题单元测试
 * 覆盖：
 * 1. 滑动谜题 (sliding-puzzle-065 · LeetCode 773)
 * 2. 八数码难题 (eight-puzzle-065 · 洛谷 P1379)
 * 3. 别名统合与表现层纯净度验证
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { buildSlidingPuzzle065Steps } from './sliding-puzzle-065-renderer';
import { buildEightPuzzle065Steps } from './eight-puzzle-065-renderer';
import { algorithmRegistry } from '../../../../core/algorithm-registry';
import '../../../batch-2-index';
import './index';

describe('左程云 Class 065: A* 算法与经典面试题专题测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('1. 滑动谜题 (sliding-puzzle-065 · LeetCode 773)', () => {
    it('标准 5 步用例 "412503" 应该成功求解并返回 5 步', () => {
      const steps = buildSlidingPuzzle065Steps('standard_5_steps');
      expect(steps.length).toBeGreaterThan(5);

      const s0 = steps[0];
      expect(s0.line).toBeGreaterThan(0);
      expect(s0.status).toBe('init');
      expect(s0.boardStr).toBe('412503');

      const last = steps[steps.length - 1];
      expect(last.status).toBe('reach');
      expect(last.ansStep).toBe(5);
      expect(last.message).toContain('5');
    });

    it('单步解开用例 "123405" 应该在 1 步内达成目标', () => {
      const steps = buildSlidingPuzzle065Steps('one_step');
      const reachStep = steps.find((s) => s.status === 'reach');
      expect(reachStep).toBeDefined();
      expect(reachStep?.ansStep).toBe(1);
    });

    it('无解反例 "123540" 应该正确返回 -1', () => {
      const steps = buildSlidingPuzzle065Steps('unsolvable');
      const last = steps[steps.length - 1];
      expect(last.status).toBe('unsolvable');
      expect(last.ansStep).toBe(-1);
    });

    it('所有步进的 line、metrics 合法无 NaN', () => {
      const steps = buildSlidingPuzzle065Steps('three_steps');
      for (const step of steps) {
        expect(step.line).toBeGreaterThan(0);
        expect(step.message).not.toContain('NaN');
        expect(step.message).not.toContain('undefined');
        if (step.metrics) {
          for (const val of Object.values(step.metrics)) {
            expect(String(val)).not.toContain('NaN');
          }
        }
      }
    });

    it('Visualizer 挂载与棋盘渲染无崩溃且无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('sliding-puzzle-065');
      expect(manifest).toBeDefined();

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

  describe('2. 八数码难题 (eight-puzzle-065 · 洛谷 P1379)', () => {
    it('两步解开用例应该校验逆序对同奇偶并成功求解', () => {
      const steps = buildEightPuzzle065Steps('two_steps');
      expect(steps.length).toBeGreaterThan(2);

      const s0 = steps[0];
      expect(s0.line).toBeGreaterThan(0);
      expect(s0.status).toBe('init');

      const checkStep = steps.find((s) => s.status === 'check');
      expect(checkStep?.isSolvable).toBe(true);

      const reachStep = steps.find((s) => s.status === 'reach');
      expect(reachStep).toBeDefined();
      expect(reachStep?.ansStep).toBeGreaterThanOrEqual(1);
    });

    it('逆序对奇偶异性用例 "123804756" 应该触发瞬间剪枝返回 -1', () => {
      const steps = buildEightPuzzle065Steps('unsolvable_parity');
      expect(steps.length).toBeLessThan(5);

      const checkStep = steps.find((s) => s.status === 'check');
      expect(checkStep?.isSolvable).toBe(false);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('unsolvable');
      expect(last.ansStep).toBe(-1);
      expect(last.message).toContain('无解剪枝');
    });

    it('Visualizer 挂载与 3x3 棋盘沙盘无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('eight-puzzle-065');
      expect(manifest).toBeDefined();

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

  describe('3. Class 065 别名统合核验', () => {
    it('A* 网格寻路 a-star-journey 别名应包含 class065-code01 与 a-star-journey-065', () => {
      const manifest = algorithmRegistry.getManifest('a-star-journey');
      expect(manifest?.aliases).toContain('class065-code01');
      expect(manifest?.aliases).toContain('a-star-journey-065');
    });

    it('滑动谜题 sliding-puzzle-065 别名应包含 class065-code02 与 leetcode-773', () => {
      const manifest = algorithmRegistry.getManifest('sliding-puzzle-065');
      expect(manifest?.aliases).toContain('class065-code02');
      expect(manifest?.aliases).toContain('leetcode-773');
    });

    it('八数码难题 eight-puzzle-065 别名应包含 class065-code03 与 luogu-p1379', () => {
      const manifest = algorithmRegistry.getManifest('eight-puzzle-065');
      expect(manifest?.aliases).toContain('class065-code03');
      expect(manifest?.aliases).toContain('luogu-p1379');
    });

    it('贴纸拼词 stickers-to-spell-word-062 别名应包含 stickers-class065', () => {
      const manifest = algorithmRegistry.getManifest('stickers-to-spell-word-062');
      expect(manifest?.aliases).toContain('stickers-class065');
    });
  });
});

