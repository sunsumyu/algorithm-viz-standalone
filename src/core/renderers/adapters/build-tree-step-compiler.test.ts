// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  BuildTreeStepCompiler,
  buildTreeSteps,
  buildTreeStage2PostorderSteps,
  buildTreeStage3StackSteps,
  collectTreeValues,
} from './build-tree-step-compiler';
import { BuildTreeCanvasAdapter } from './build-tree-canvas-adapter';

describe('BuildTreeStepCompiler & BuildTreeCanvasAdapter Deep Module Suite', () => {
  const preorder = [3, 9, 20, 15, 7];
  const inorder = [9, 3, 15, 20, 7];
  const postorder = [9, 15, 7, 20, 3];

  describe('Stage 1: 前序+中序分治递归构造 (LC 105)', () => {
    it('正确重构二叉树并产生包含完整 CallTrace 快照的步骤序列', () => {
      const steps = buildTreeSteps(preorder, inorder);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.rootVal).toBe(3);
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
      expect(last.tree?.right?.left?.val).toBe(15);
      expect(last.tree?.right?.right?.val).toBe(7);
      expect(last.callTrace).toBeDefined();
    });

    it('空数组边界防护产生异常退出步', () => {
      const steps = buildTreeSteps([], []);
      expect(steps.length).toBe(1);
      expect(steps[0].action).toBe('done');
      expect(steps[0].tree).toBeNull();
    });
  });

  describe('Stage 2: 后序+中序分治递归构造 (LC 106)', () => {
    it('正确重构二叉树并产出与 Stage 1 一致的拓扑结构', () => {
      const steps = buildTreeStage2PostorderSteps(inorder, postorder);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
      expect(last.tree?.right?.left?.val).toBe(15);
      expect(last.tree?.right?.right?.val).toBe(7);
    });

    it('长度不匹配时安全退出', () => {
      const steps = buildTreeStage2PostorderSteps([1, 2], [1]);
      expect(steps.length).toBe(1);
      expect(steps[0].tree).toBeNull();
    });
  });

  describe('Stage 3: 迭代显式栈前序重构 ($O(N)$ 零哈希表 · LC 105)', () => {
    it('正确构造二叉树拓扑结构', () => {
      const steps = buildTreeStage3StackSteps(preorder, inorder);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
    });
  });

  describe('BuildTreeCanvasAdapter 视觉呈现契约', () => {
    it('collectTreeValues 正确层序遍历节点值', () => {
      const steps = buildTreeSteps([1, 2, 3], [2, 1, 3]);
      const tree = steps[steps.length - 1].tree;
      const vals = collectTreeValues(tree);
      expect(vals).toEqual([1, 2, 3]);
    });

    it('renderCanvas 与 renderCustomMetrics 不抛出异常', () => {
      const container = document.createElement('div');
      const steps = buildTreeSteps(preorder, inorder);
      expect(() => {
        BuildTreeCanvasAdapter.renderCanvas(container, steps[0]);
        BuildTreeCanvasAdapter.renderCustomMetrics(container, steps[steps.length - 1]);
      }).not.toThrow();
    });
  });
});
