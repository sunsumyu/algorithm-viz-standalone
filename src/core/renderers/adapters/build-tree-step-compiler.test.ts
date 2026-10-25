// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  BuildTreeStepCompiler,
  buildTreeSteps,
  buildTreeStage2PostorderSteps,
  buildTreeStage3StackSteps,
  buildTreeStage4StackSteps,
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

  describe('Stage 4: 迭代显式栈后序重构 ($O(N)$ 镜像对偶 · LC 106)', () => {
    it('正确构造二叉树拓扑结构并与 Stage 2 拓扑一致', () => {
      const steps = buildTreeStage4StackSteps(inorder, postorder);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
    });

    it('空数组边界防护产生异常退出步', () => {
      const steps = buildTreeStage4StackSteps([], []);
      expect(steps.length).toBe(1);
      expect(steps[0].action).toBe('done');
      expect(steps[0].tree).toBeNull();
    });
  });

  describe('BuildTreeCanvasAdapter 视觉呈现契约', () => {
    it('collectTreeValues 正确层序遍历节点值', () => {
      const steps = buildTreeSteps([1, 2, 3], [2, 1, 3]);
      const tree = steps[steps.length - 1].tree;
      const vals = collectTreeValues(tree);
      expect(vals).toEqual([1, 2, 3]);
    });

    it('所有推演步骤均具备非空指标值 (消除 Card 2 空横杠破相缺陷)', () => {
      const steps1 = buildTreeSteps(preorder, inorder);
      for (const step of steps1) {
        expect(step.metrics).toBeDefined();
        expect(step.metrics!['cur-root']).toBeTruthy();
        expect(step.metrics!['pre-range']).toBeTruthy();
        expect(step.metrics!['in-range']).toBeTruthy();
      }

      const steps2 = buildTreeStage2PostorderSteps(inorder, postorder);
      for (const step of steps2) {
        expect(step.metrics).toBeDefined();
        expect(step.metrics!['cur-root']).toBeTruthy();
        expect(step.metrics!['pre-range']).toBeTruthy();
        expect(step.metrics!['in-range']).toBeTruthy();
      }

      const steps3 = buildTreeStage3StackSteps(preorder, inorder);
      for (const step of steps3) {
        expect(step.metrics).toBeDefined();
        expect(step.metrics!['cur-root']).toBeTruthy();
        expect(step.metrics!['pre-range']).toBeTruthy();
        expect(step.metrics!['in-range']).toBeTruthy();
      }

      const steps4 = buildTreeStage4StackSteps(inorder, postorder);
      for (const step of steps4) {
        expect(step.metrics).toBeDefined();
        expect(step.metrics!['cur-root']).toBeTruthy();
        expect(step.metrics!['pre-range']).toBeTruthy();
        expect(step.metrics!['in-range']).toBeTruthy();
      }
    });

    it('renderCanvas 严格遵循 Zero-Subbox 契约与 100% 自包含内联布局', () => {
      const container = document.createElement('div');
      const steps = buildTreeSteps(preorder, inorder);
      BuildTreeCanvasAdapter.renderCanvas(container, steps[1]);

      // 1. 不包含违规的内联指标微型盒 (Zero-Subbox)
      expect(container.innerHTML).not.toContain('🎯 锁定根');

      // 2. 具有自包含内联样式与双轨切片
      expect(container.innerHTML).toContain('display: flex');
      expect(container.innerHTML).toContain('中序 &amp; 前序切片对齐');
      expect(container.innerHTML).toContain('preorder:');
      expect(container.innerHTML).toContain('inorder:');

      // 3. Stage 2 后序切片对齐测试
      const steps2 = buildTreeStage2PostorderSteps(inorder, postorder);
      BuildTreeCanvasAdapter.renderCanvas(container, steps2[1]);
      expect(container.innerHTML).toContain('中序 &amp; 后序切片对齐');
      expect(container.innerHTML).toContain('postorder:');
    });

    it('renderCustomMetrics 正确挂载方程卡片与递归深度监控', () => {
      const container = document.createElement('div');
      const steps = buildTreeSteps(preorder, inorder);
      const stepWithRoot = steps.find((s) => s.rootVal != null)!;
      expect(stepWithRoot).toBeDefined();
      BuildTreeCanvasAdapter.renderCustomMetrics(container, stepWithRoot);

      expect(container.innerHTML).toContain('分治切分方程与实参代入');
      expect(container.innerHTML).toContain('左子树递归实参');
      expect(container.innerHTML).toContain('右子树递归实参');
    });
  });
});

