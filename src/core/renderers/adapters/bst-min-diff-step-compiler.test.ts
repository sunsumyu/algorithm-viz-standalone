// @vitest-environment jsdom
/**
 * BST Min Diff Step Compiler 伴生单元测试 (LeetCode 530 / 783)
 * 验证 Matt Pocock 深模块设计：三阶段中序遍历、CallTrace 快照、栈/Morris 线索与 CanvasAdapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBstMinDiffStage1Steps,
  buildBstMinDiffStage2Steps,
  buildBstMinDiffStage3Steps,
  parseBstMinDiffInputs,
  cloneTree,
} from './bst-min-diff-step-compiler';
import { BstMinDiffCanvasAdapter } from './bst-min-diff-canvas-adapter';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('bst-min-diff-step-compiler', () => {
  describe('parseBstMinDiffInputs & cloneTree', () => {
    it('正确解析默认输入并构建 BST', () => {
      const root = parseBstMinDiffInputs();
      expect(root).not.toBeNull();
      expect(root?.val).toBe(4);
      expect(root?.left?.val).toBe(2);
      expect(root?.right?.val).toBe(6);
    });

    it('正确解析自定义输入', () => {
      const root = parseBstMinDiffInputs({ 'input-tree': '[5, 1, 7]' });
      expect(root?.val).toBe(5);
      expect(root?.left?.val).toBe(1);
      expect(root?.right?.val).toBe(7);
    });

    it('cloneTree 深拷贝树结构', () => {
      const root = buildTreeFromArr([4, 2, 6]);
      const copy = cloneTree(root);
      expect(copy).not.toBeNull();
      if (copy && copy.left) copy.left.val = 99;
      expect(root?.left?.val).toBe(2);
    });
  });

  describe('Stage 1: 经典中序双指针递归 (LC 530)', () => {
    it('计算 BST [4, 2, 6, 1, 3] 最小绝对差为 1 并生成 CallTrace', () => {
      const root = buildTreeFromArr([4, 2, 6, 1, 3]);
      const steps = buildBstMinDiffStage1Steps(root);

      expect(steps.length).toBeGreaterThan(10);
      expect(steps[0].action).toBe('enter');

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.minDiff).toBe(1);
      expect(doneStep.inorderSeq).toEqual([1, 2, 3, 4, 6]);

      // 验证 CallTrace 快照存在
      const traceSteps = steps.filter((s) => s.callTrace && s.callTrace.lines.length > 0);
      expect(traceSteps.length).toBeGreaterThan(0);

      // 行号健全性
      steps.forEach((s) => {
        expect(s.codeLine).toBeDefined();
        if (typeof s.codeLine === 'object' && 'java' in s.codeLine) {
          expect(Number((s.codeLine as any).java)).toBeGreaterThan(0);
        }
      });
    });

    it('空树边界返回 0', () => {
      const steps = buildBstMinDiffStage1Steps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].minDiff).toBe(0);
      expect(steps[0].action).toBe('done');
    });
  });

  describe('Stage 2: 显式单调栈迭代中序', () => {
    it('显式栈迭代计算最小差为 1 并维护 stackVals', () => {
      const root = buildTreeFromArr([4, 2, 6, 1, 3]);
      const steps = buildBstMinDiffStage2Steps(root);

      expect(steps.length).toBeGreaterThan(10);

      // 验证包含栈操作
      const stackStep = steps.find((s) => s.stackVals && s.stackVals.length > 0);
      expect(stackStep).toBeDefined();

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.minDiff).toBe(1);
      expect(doneStep.inorderSeq).toEqual([1, 2, 3, 4, 6]);
    });

    it('空树边界返回 0', () => {
      const steps = buildBstMinDiffStage2Steps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].minDiff).toBe(0);
    });
  });

  describe('Stage 3: Morris 空间常数遍历', () => {
    it('Morris 遍历建立并拆除线索，正确得出最小差 1', () => {
      const root = buildTreeFromArr([4, 2, 6, 1, 3]);
      const steps = buildBstMinDiffStage3Steps(root);

      expect(steps.length).toBeGreaterThan(10);

      // 验证线索建立与拆除
      const buildStep = steps.find((s) => s.action === 'thread-build');
      expect(buildStep).toBeDefined();
      expect(buildStep?.morrisThread?.active).toBe(true);

      const cutStep = steps.find((s) => s.action === 'thread-cut');
      expect(cutStep).toBeDefined();
      expect(cutStep?.morrisThread?.active).toBe(false);

      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.minDiff).toBe(1);
      expect(doneStep.inorderSeq).toEqual([1, 2, 3, 4, 6]);
    });

    it('空树边界返回 0', () => {
      const steps = buildBstMinDiffStage3Steps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].minDiff).toBe(0);
    });
  });

  describe('BstMinDiffCanvasAdapter', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('renderCanvas 挂载正常', () => {
      const root = buildTreeFromArr([4, 2, 6]);
      const steps = buildBstMinDiffStage1Steps(root);
      expect(() => {
        BstMinDiffCanvasAdapter.renderCanvas(container, steps[1]);
      }).not.toThrow();
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it('renderCustomMetrics 挂载指标与决策卡', () => {
      const root = buildTreeFromArr([4, 2, 6]);
      const steps = buildBstMinDiffStage1Steps(root);
      expect(() => {
        BstMinDiffCanvasAdapter.renderCustomMetrics(container, steps[2]);
      }).not.toThrow();
      expect(container.textContent).toContain('当前节点 curr');
      expect(container.textContent).toContain('全局最小 minDiff');
      expect(container.textContent).toContain('已访问中序升序序列');
    });
  });
});
