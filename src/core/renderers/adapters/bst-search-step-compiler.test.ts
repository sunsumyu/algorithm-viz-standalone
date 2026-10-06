// @vitest-environment jsdom
/**
 * BST Search & Insert Step Compiler 伴生单元测试 (LeetCode 700 / 701)
 * 验证 Matt Pocock 深模块设计：步骤生成、CallTrace 快照、三阶段推演与 CanvasAdapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBSTSearchSteps,
  buildBstSearchStage2RecursiveSteps,
  buildBstSearchStage3InsertSteps,
  parseBstSearchInputs,
  cloneTree,
} from './bst-search-step-compiler';
import { BstSearchCanvasAdapter } from './bst-search-canvas-adapter';
import { buildTreeFromArr as buildTree } from '../../../algorithms/categories/tree/tree-template';

describe('bst-search-step-compiler', () => {
  describe('parseBstSearchInputs', () => {
    it('正确解析默认入参', () => {
      const res = parseBstSearchInputs();
      expect(res.root).not.toBeNull();
      expect(res.root?.val).toBe(4);
      expect(res.targetVal).toBe(2);
    });

    it('正确解析自定义入参', () => {
      const res = parseBstSearchInputs({
        'input-tree': '10, 5, 15, null, null, 12, 20',
        'input-target': '12',
      });
      expect(res.root?.val).toBe(10);
      expect(res.targetVal).toBe(12);
    });
  });

  describe('cloneTree', () => {
    it('深拷贝整棵二叉树，修改副本不影响原树', () => {
      const tree = buildTree([4, 2, 7]);
      const copy = cloneTree(tree);
      expect(copy).not.toBeNull();
      expect(copy?.val).toBe(4);
      if (copy && copy.left) copy.left.val = 99;
      expect(tree?.left?.val).toBe(2);
    });
  });

  describe('Stage 1: 迭代单向剪枝查找 (LC 700)', () => {
    it('成功命中目标节点 val = 2', () => {
      const root = buildTree([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 2);

      expect(steps.length).toBeGreaterThan(3);
      expect(steps[0].stageId).toBe('stage-1');
      expect(steps[0].phase).toBe('init');

      const foundStep = steps.find(s => s.found);
      expect(foundStep).toBeDefined();
      expect(foundStep?.action).toBe('found');
      expect(foundStep?.current).toBe(2);
      expect(foundStep?.path).toContain(4);
      expect(foundStep?.path).toContain(2);

      // 行号联动覆盖
      steps.forEach(s => {
        expect(s.codeLine).toBeDefined();
        expect(typeof s.codeLine.java).toBe('number');
        expect(Number(s.codeLine.java)).toBeGreaterThan(0);
      });
    });

    it('未命中目标节点 val = 5', () => {
      const root = buildTree([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 5);

      const notFoundStep = steps.find(s => s.action === 'not-found');
      expect(notFoundStep).toBeDefined();
      expect(steps.some(s => s.found)).toBe(false);
    });

    it('空树直接返回 not-found', () => {
      const steps = buildBSTSearchSteps(null, 5);
      expect(steps.length).toBe(2);
      expect(steps[1].action).toBe('not-found');
      expect(steps[1].found).toBe(false);
    });
  });

  describe('Stage 2: 递归分治查找 (LC 700)', () => {
    it('递归命中目标节点 val = 7 并生成 CallTrace 堆栈', () => {
      const root = buildTree([4, 2, 7, 1, 3]);
      const steps = buildBstSearchStage2RecursiveSteps(root, 7);

      expect(steps.length).toBeGreaterThan(4);
      expect(steps[0].stageId).toBe('stage-2');

      const foundStep = steps.find(s => s.found);
      expect(foundStep).toBeDefined();
      expect(foundStep?.current).toBe(7);

      // 验证 CallTrace 快照存在
      const traceSteps = steps.filter(s => s.callTrace && s.callTrace.lines.length > 0);
      expect(traceSteps.length).toBeGreaterThan(0);

      // 行号健全性
      steps.forEach(s => {
        expect(s.codeLine).toBeDefined();
        expect(typeof s.codeLine.java).toBe('number');
        expect(Number(s.codeLine.java)).toBeGreaterThan(0);
      });
    });

    it('递归未找到节点 val = 100', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildBstSearchStage2RecursiveSteps(root, 100);

      const notFoundStep = steps.find(s => s.action === 'not-found');
      expect(notFoundStep).toBeDefined();
      expect(steps.some(s => s.found)).toBe(false);
    });
  });

  describe('Stage 3: 动态插入新键值 (LC 701)', () => {
    it('成功插入新叶子节点 val = 5 到节点 7 的左子树', () => {
      const root = buildTree([4, 2, 7, 1, 3]);
      const steps = buildBstSearchStage3InsertSteps(root, 5);

      expect(steps.length).toBeGreaterThan(4);
      expect(steps[0].stageId).toBe('stage-3');

      const insertStep = steps.find(s => s.action === 'insert');
      expect(insertStep).toBeDefined();
      expect(insertStep?.insertedVal).toBe(5);

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.tree).not.toBeNull();
      // 验证 5 确实挂载到 7 的左孩子上
      expect(doneStep.tree?.right?.left?.val).toBe(5);
    });

    it('空树时直接将新值作为根节点插入', () => {
      const steps = buildBstSearchStage3InsertSteps(null, 10);
      const insertStep = steps.find(s => s.action === 'insert');
      expect(insertStep).toBeDefined();
      expect(insertStep?.insertedVal).toBe(10);
      expect(steps[steps.length - 1].tree?.val).toBe(10);
    });

    it('待插入的值已存在于树中时给出友好提示并直接完成', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildBstSearchStage3InsertSteps(root, 2);
      expect(steps.some(s => s.message.includes('已经存在') || s.message.includes('已存在'))).toBe(true);
      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
    });
  });

  describe('BstSearchCanvasAdapter', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('renderCanvas 能正常挂载 DOM 树', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildBSTSearchSteps(root, 2);
      expect(() => {
        BstSearchCanvasAdapter.renderCanvas(container, steps[1], 'stage-1');
      }).not.toThrow();
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it('renderCustomMetrics 能正常挂载 4 格 KPI 指标与状态', () => {
      const root = buildTree([4, 2, 7]);
      const steps = buildBSTSearchSteps(root, 2);
      const foundStep = steps.find(s => s.found)!;

      expect(() => {
        BstSearchCanvasAdapter.renderCustomMetrics(container, foundStep);
      }).not.toThrow();

      expect(container.textContent).toContain('检索目标数值');
      expect(container.textContent).toContain('当前考察节点');
      expect(container.textContent).toContain('分支转向决策');
      expect(container.textContent).toContain('搜索命中状态');
    });
  });
});
