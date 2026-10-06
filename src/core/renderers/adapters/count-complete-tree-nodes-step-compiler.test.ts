// @vitest-environment jsdom
/**
 * Count Complete Tree Nodes Step Compiler 伴生单元测试 (LeetCode 222 / Class 036)
 * 验证 Matt Pocock 深模块设计：三阶段推演、左神 2^k 满树剪枝、二分寻路与 CanvasAdapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildCountNodesDfsSteps,
  buildCountNodesZuoshenSteps,
  buildCountNodesBinarySearchSteps,
  buildCountNodes036Steps,
  parseCountNodesInputs,
} from './count-complete-tree-nodes-step-compiler';
import { CountCompleteTreeNodesCanvasAdapter } from './count-complete-tree-nodes-canvas-adapter';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('count-complete-tree-nodes-step-compiler', () => {
  describe('parseCountNodesInputs', () => {
    it('正确解析默认入参并构建二叉树', () => {
      const root = parseCountNodesInputs();
      expect(root).not.toBeNull();
      expect(root?.val).toBe(1);
    });

    it('正确解析自定义入参', () => {
      const root = parseCountNodesInputs({ tree: '1, 2, 3, 4' });
      expect(root?.val).toBe(1);
      expect(root?.left?.left?.val).toBe(4);
    });
  });

  describe('Stage 1: 朴素递归 DFS (LC 222 O(N))', () => {
    it('完整遍历整树并正确统计 6 个节点', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesDfsSteps(root);

      expect(steps.length).toBeGreaterThan(10);
      expect(steps[0].action).toBe('entry');

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.metrics?.['最终结果']).toBe(6);

      // 行号覆盖
      steps.forEach((s) => {
        expect(s.codeLine).toBeDefined();
        if (typeof s.codeLine === 'object' && 'java' in s.codeLine) {
          expect(Number((s.codeLine as any).java)).toBeGreaterThan(0);
        }
      });
    });

    it('空树边界正常返回 0', () => {
      const steps = buildCountNodesDfsSteps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].metrics?.['最终结果']).toBe(0);
    });
  });

  describe('Stage 2: 左神满树公式剪枝 (Class 036 O((logN)^2))', () => {
    it('利用 2^k 公式剪枝并测定总树高 h=3', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesZuoshenSteps(root);

      expect(steps.length).toBeGreaterThan(5);

      // 验证包含测定树高与探测右子树最左深度的步骤
      const heightStep = steps.find((s) => s.action === 'height-confirmed');
      expect(heightStep).toBeDefined();
      expect(heightStep?.metrics?.['总树高 h']).toBe(3);

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.metrics?.['最终结果']).toBe(6);

      // 行号覆盖
      steps.forEach((s) => {
        expect(s.codeLine).toBeDefined();
        if (typeof s.codeLine === 'object' && 'java' in s.codeLine) {
          expect(Number((s.codeLine as any).java)).toBeGreaterThan(0);
        }
      });
    });

    it('空树边界返回 0', () => {
      const steps = buildCountNodesZuoshenSteps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].metrics?.['最终结果']).toBe(0);
    });

    it('单节点树返回 1', () => {
      const root = buildTreeFromArr([1]);
      const steps = buildCountNodesZuoshenSteps(root);
      const doneStep = steps[steps.length - 1];
      expect(doneStep.metrics?.['最终结果']).toBe(1);
    });

    it('Legacy buildCountNodes036Steps 兼容调用正常', () => {
      const steps = buildCountNodes036Steps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].metrics?.['最终结果']).toBe(6);
    });
  });

  describe('Stage 3: 二分叶子编号 + 二进制寻路 (LC 222 进阶)', () => {
    it('二分收敛至 6 个节点', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesBinarySearchSteps(root);

      expect(steps.length).toBeGreaterThan(5);

      // 验证包含二分区间初始化
      const rangeStep = steps.find((s) => s.action === 'init-range');
      expect(rangeStep).toBeDefined();

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.metrics?.['最终结果']).toBe(6);
    });

    it('空树与单节点边界', () => {
      const emptySteps = buildCountNodesBinarySearchSteps(null);
      expect(emptySteps[0].metrics?.['最终结果']).toBe(0);

      const singleSteps = buildCountNodesBinarySearchSteps(buildTreeFromArr([1]));
      expect(singleSteps[singleSteps.length - 1].metrics?.['最终结果']).toBe(1);
    });
  });

  describe('CountCompleteTreeNodesCanvasAdapter', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('renderCanvas 挂载正常', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesZuoshenSteps(root);
      expect(() => {
        CountCompleteTreeNodesCanvasAdapter.renderCanvas(container, steps[1]);
      }).not.toThrow();
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it('renderStage1Metrics 挂载正常', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesDfsSteps(root);
      expect(() => {
        CountCompleteTreeNodesCanvasAdapter.renderStage1Metrics(container, steps[2]);
      }).not.toThrow();
      expect(container.textContent).toContain('当前考察节点');
    });

    it('renderStage2Metrics 挂载正常', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesZuoshenSteps(root);
      expect(() => {
        CountCompleteTreeNodesCanvasAdapter.renderStage2Metrics(container, steps[2]);
      }).not.toThrow();
      expect(container.textContent).toContain('左神 2^k 满树公式剪枝计算');
    });

    it('renderStage3Metrics 挂载正常', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesBinarySearchSteps(root);
      expect(() => {
        CountCompleteTreeNodesCanvasAdapter.renderStage3Metrics(container, steps[2]);
      }).not.toThrow();
      expect(container.textContent).toContain('二分底层编号区间');
    });
  });
});
