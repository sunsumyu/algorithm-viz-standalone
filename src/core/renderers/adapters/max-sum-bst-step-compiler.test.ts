// @vitest-environment jsdom
/**
 * Max Sum BST Subtree Step Compiler 伴生单元测试 (LeetCode 1373 / Class 036)
 * 验证 Matt Pocock 深模块设计：三阶段推演、Info 结构体自底向上收集、CallTrace、显式栈与 CanvasAdapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildMaxSumBstStage1Steps,
  buildMaxSumBstStage2Steps,
  buildMaxSumBstStage3Steps,
  buildMaxSumBstSteps,
  getPresetTreeNodes,
} from './max-sum-bst-step-compiler';
import { MaxSumBstCanvasAdapter } from './max-sum-bst-canvas-adapter';

describe('max-sum-bst-step-compiler', () => {
  describe('getPresetTreeNodes', () => {
    it('正确生成 classic_lc1373 预设', () => {
      const { nodes, rootId } = getPresetTreeNodes('classic_lc1373');
      expect(nodes.length).toBe(9);
      expect(rootId).toBe(1);
    });

    it('正确生成 full_bst 预设', () => {
      const { nodes, rootId } = getPresetTreeNodes('full_bst');
      expect(nodes.length).toBe(7);
      expect(rootId).toBe(1);
    });

    it('正确生成 broken_bst 预设', () => {
      const { nodes, rootId } = getPresetTreeNodes('broken_bst');
      expect(nodes.length).toBe(5);
      expect(rootId).toBe(1);
    });
  });

  describe('Stage 1: 树形 DP Info 收集 (LC 1373)', () => {
    it('经典 LC 1373 用例正确推演并得出最大键值和 20', () => {
      const steps = buildMaxSumBstStage1Steps('classic_lc1373');

      expect(steps.length).toBeGreaterThan(10);

      // Step 0 守恒契约
      expect(steps[0].phase).toBe('enter');
      expect(steps[0].maxSumGlobal).toBe(0);

      // 终态收尾契约
      const doneStep = steps[steps.length - 1];
      expect(doneStep.phase).toBe('finish');
      expect(doneStep.maxSumGlobal).toBe(20);

      // 行号覆盖
      steps.forEach((s) => {
        expect(s.codeLine).toBeDefined();
        if (typeof s.codeLine === 'object' && 'java' in s.codeLine) {
          expect(Number((s.codeLine as any).java)).toBeGreaterThan(0);
        }
      });
    });

    it('严格 BST 用例计算出整树和', () => {
      const steps = buildMaxSumBstStage1Steps('full_bst');
      const doneStep = steps[steps.length - 1];
      expect(doneStep.maxSumGlobal).toBe(71);
    });

    it('buildMaxSumBstSteps 别名兼容', () => {
      const steps = buildMaxSumBstSteps('classic_lc1373');
      expect(steps[steps.length - 1].maxSumGlobal).toBe(20);
    });
  });

  describe('Stage 2: 快速失效剪枝优化', () => {
    it('正确执行剪枝并得出最大和 20', () => {
      const steps = buildMaxSumBstStage2Steps('classic_lc1373');

      expect(steps.length).toBeGreaterThan(10);
      expect(steps[0].phase).toBe('enter');
      expect(steps[0].maxSumGlobal).toBe(0);

      const doneStep = steps[steps.length - 1];
      expect(doneStep.phase).toBe('finish');
      expect(doneStep.maxSumGlobal).toBe(20);
    });
  });

  describe('Stage 3: 显式单调栈后序迭代', () => {
    it('维护 stackFrames 并得出最大和 20', () => {
      const steps = buildMaxSumBstStage3Steps('classic_lc1373');

      expect(steps.length).toBeGreaterThan(10);

      const stackStep = steps.find((s) => s.stackFrames && s.stackFrames.length > 0);
      expect(stackStep).toBeDefined();

      const doneStep = steps[steps.length - 1];
      expect(doneStep.phase).toBe('finish');
      expect(doneStep.maxSumGlobal).toBe(20);
    });
  });

  describe('MaxSumBstCanvasAdapter', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('renderCanvas 挂载正常', () => {
      const steps = buildMaxSumBstStage1Steps('classic_lc1373');
      expect(() => {
        MaxSumBstCanvasAdapter.renderCanvas(container, steps[1]);
      }).not.toThrow();
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it('renderCustomMetrics 挂载正常', () => {
      const steps = buildMaxSumBstStage1Steps('classic_lc1373');
      expect(() => {
        MaxSumBstCanvasAdapter.renderCustomMetrics(container, steps[2]);
      }).not.toThrow();
      expect(container.textContent).toContain('左子树 Info');
      expect(container.textContent).toContain('当前节点决策');
      expect(container.textContent).toContain('右子树 Info');
      expect(container.textContent).toContain('全局最高 BST 键值和');
    });
  });
});
