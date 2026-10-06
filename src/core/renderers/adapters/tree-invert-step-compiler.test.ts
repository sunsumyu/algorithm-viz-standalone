// @vitest-environment jsdom
/**
 * Tree Invert Step Compiler 伴生单元测试 (LeetCode 226)
 * 验证 Matt Pocock 深模块设计：三阶段翻转推演、CallTrace 快照、队列状态与 CanvasAdapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTreeInvertSteps,
  buildTreeInvertBfsSteps,
  buildTreeInvertStaticArraySteps,
  parseTreeInvertInputs,
  collectTreeValues,
  cloneTree,
} from './tree-invert-step-compiler';
import { TreeInvertCanvasAdapter } from './tree-invert-canvas-adapter';
import { buildTreeFromArr as buildTree } from '../../../algorithms/categories/tree/tree-template';

describe('tree-invert-step-compiler', () => {
  describe('parseTreeInvertInputs & helpers', () => {
    it('正确解析默认入参并构建二叉树', () => {
      const root = parseTreeInvertInputs();
      expect(root).not.toBeNull();
      expect(root?.val).toBe(4);
      expect(root?.left?.val).toBe(2);
      expect(root?.right?.val).toBe(7);
    });

    it('正确解析自定义入参', () => {
      const root = parseTreeInvertInputs({ 'input-tree': '1, 2, 3' });
      expect(root?.val).toBe(1);
      expect(root?.left?.val).toBe(2);
      expect(root?.right?.val).toBe(3);
    });

    it('collectTreeValues 收集所有节点值', () => {
      const root = buildTree([4, 2, 7]);
      const vals = collectTreeValues(root);
      expect(vals).toEqual([4, 2, 7]);
    });

    it('cloneTree 深拷贝树结构', () => {
      const root = buildTree([4, 2, 7]);
      const copy = cloneTree(root);
      expect(copy).not.toBeNull();
      if (copy && copy.left) copy.left.val = 99;
      expect(root?.left?.val).toBe(2);
    });
  });

  describe('Stage 1: 前序递归翻转 (LC 226 DFS)', () => {
    it('完整推演二叉树翻转并生成 CallTrace 堆栈', () => {
      const root = buildTree([4, 2, 7, 1, 3, 6, 9]);
      const steps = buildTreeInvertSteps(root);

      expect(steps.length).toBeGreaterThan(10);
      expect(steps[0].action).toBe('enter');

      // 验证左右孩子发生过交换
      const swapSteps = steps.filter(s => s.action === 'swap');
      expect(swapSteps.length).toBeGreaterThan(0);
      expect(swapSteps[0].isSwapping).toBe(true);

      // 验证最后完成状态
      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.tree?.left?.val).toBe(7);
      expect(doneStep.tree?.right?.val).toBe(2);

      // 验证 CallTrace 快照存在
      const traceSteps = steps.filter(s => s.callTrace && s.callTrace.lines.length > 0);
      expect(traceSteps.length).toBeGreaterThan(0);

      // 行号健全性
      steps.forEach(s => {
        expect(s.codeLine).toBeDefined();
        if (typeof s.codeLine === 'object' && 'java' in s.codeLine) {
          expect(Number((s.codeLine as any).java)).toBeGreaterThan(0);
        }
      });
    });

    it('空树边界正常处理', () => {
      const steps = buildTreeInvertSteps(null);
      expect(steps.length).toBe(2);
      expect(steps[1].action).toBe('done');
      expect(steps[1].tree).toBeNull();
    });
  });

  describe('Stage 2: 队列层序遍历翻转 (LC 226 BFS)', () => {
    it('逐层出队交换指针并维护队列状态', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildTreeInvertBfsSteps(root);

      expect(steps.length).toBeGreaterThan(4);
      expect(steps[0].action).toBe('init');
      expect(steps[0].queue).toEqual([4]);

      // 验证包含出队与交换步骤
      const pollStep = steps.find(s => s.action === 'poll');
      expect(pollStep).toBeDefined();

      const swapStep = steps.find(s => s.action === 'swap');
      expect(swapStep).toBeDefined();

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.tree?.left?.val).toBe(7);
      expect(doneStep.tree?.right?.val).toBe(2);
    });

    it('空树边界正常返回', () => {
      const steps = buildTreeInvertBfsSteps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].action).toBe('done');
    });
  });

  describe('Stage 3: 静态数组模拟队列 (LC 226 零 GC)', () => {
    it('双指针 l, r 演进并维护连续数组快照', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildTreeInvertStaticArraySteps(root);

      expect(steps.length).toBeGreaterThan(4);
      expect(steps[0].action).toBe('init');
      expect(steps[0].staticQueueState).toBeDefined();
      expect(steps[0].staticQueueState?.l).toBe(0);
      expect(steps[0].staticQueueState?.r).toBe(1);

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.tree?.left?.val).toBe(7);
      expect(doneStep.tree?.right?.val).toBe(2);
      expect(doneStep.staticQueueState?.cur).toBeNull();
    });

    it('空树边界正常返回', () => {
      const steps = buildTreeInvertStaticArraySteps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].action).toBe('done');
    });
  });

  describe('TreeInvertCanvasAdapter', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('renderCanvas 挂载正常', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildTreeInvertSteps(root);
      expect(() => {
        TreeInvertCanvasAdapter.renderCanvas(container, steps[1]);
      }).not.toThrow();
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it('renderStage1Metrics 挂载指标与递归推演栈', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildTreeInvertSteps(root);
      expect(() => {
        TreeInvertCanvasAdapter.renderStage1Metrics(container, steps[2]);
      }).not.toThrow();
      expect(container.textContent).toContain('当前考察节点');
      expect(container.textContent).toContain('已互换子树次数');
    });

    it('renderStage2Metrics 挂载 BFS 队列管道', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildTreeInvertBfsSteps(root);
      expect(() => {
        TreeInvertCanvasAdapter.renderStage2Metrics(container, steps[1]);
      }).not.toThrow();
      expect(container.textContent).toContain('BFS 层序遍历队列大小');
    });

    it('renderStage3Metrics 挂载连续数组 queue[MAXN] 与双指针', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildTreeInvertStaticArraySteps(root);
      expect(() => {
        TreeInvertCanvasAdapter.renderStage3Metrics(container, steps[1]);
      }).not.toThrow();
      expect(container.textContent).toContain('左神静态连续数组 queue[MAXN]');
    });
  });
});
