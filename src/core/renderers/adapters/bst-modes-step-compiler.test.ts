// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { TreeCanvasAdapter } from './tree-canvas-adapter';
import {
  buildBstModesStage1Steps,
  buildBstModesStage2Steps,
  buildBstModesStage3Steps,
  cloneTree,
} from './bst-modes-step-compiler';
import {
  BST_MODES_STAGE1_CODES,
  BST_MODES_STAGE2_CODES,
  BST_MODES_STAGE3_CODES,
} from '../../../algorithms/categories/tree/bst-modes-stage-codes';

function assertCodeLineValid(codeLine: any, desc: string) {
  expect(codeLine, `${desc} codeLine 必须定义`).toBeDefined();
  if (typeof codeLine === 'number') {
    expect(codeLine).toBeGreaterThan(0);
  } else if (typeof codeLine === 'object' && codeLine !== null) {
    for (const lang of ['java', 'cpp', 'python', 'javascript']) {
      if (codeLine[lang] != null) {
        expect(codeLine[lang], `${desc} ${lang} 行号必须大于 0`).toBeGreaterThan(0);
      }
    }
  }
}

describe('BSTModesStepCompiler (LC 501 · 二叉搜索树中的众数)', () => {
  it('cloneTree 防环树安全克隆', () => {
    const root = buildTreeFromArr([1, null, 2, 2]);
    const cloned = cloneTree(root);
    expect(cloned?.val).toBe(1);
    expect(cloned?.right?.val).toBe(2);
    expect(cloneTree(null)).toBeNull();
  });

  describe('Stage 1: 经典中序双指针递归', () => {
    it('官方样例: [1, null, 2, 2] -> 众数 [2], 频次 2', () => {
      const root = buildTreeFromArr([1, null, 2, 2]);
      const steps = buildBstModesStage1Steps(root);
      expect(steps.length).toBeGreaterThan(8);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineValid(steps[i].codeLine, `Stage 1 Step ${i}`);
        expect(steps[i].callTrace).toBeDefined();
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.modes).toEqual([2]);
      expect(last.maxCount).toBe(2);
      expect(last.inorderSeq).toEqual([1, 2, 2]);
    });

    it('并列众数用例: [2, 1, 2, 1] -> 众数 [1, 2], 频次 2', () => {
      const root = buildTreeFromArr([2, 1, 2, 1]);
      const steps = buildBstModesStage1Steps(root);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.modes).toEqual([1, 2]);
      expect(last.maxCount).toBe(2);
    });

    it('单节点用例: [0] -> 众数 [0], 频次 1', () => {
      const root = buildTreeFromArr([0]);
      const steps = buildBstModesStage1Steps(root);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.modes).toEqual([0]);
      expect(last.maxCount).toBe(1);
    });

    it('空树特判返回 []', () => {
      const steps = buildBstModesStage1Steps(null);
      expect(steps.length).toBe(1);
      expect(steps[0].modes).toEqual([]);
      expect(steps[0].maxCount).toBe(0);
    });
  });

  describe('Stage 2: 显式单调栈迭代中序', () => {
    it('官方样例: [1, null, 2, 2] 显式栈逐步迭代并维护 stackVals', () => {
      const root = buildTreeFromArr([1, null, 2, 2]);
      const steps = buildBstModesStage2Steps(root);
      expect(steps.length).toBeGreaterThan(8);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineValid(steps[i].codeLine, `Stage 2 Step ${i}`);
        expect(steps[i].stackVals).toBeDefined();
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.modes).toEqual([2]);
      expect(last.maxCount).toBe(2);
    });

    it('并列众数用例: [2, 1, 2, 1] -> 众数 [1, 2]', () => {
      const root = buildTreeFromArr([2, 1, 2, 1]);
      const steps = buildBstModesStage2Steps(root);
      const last = steps[steps.length - 1];
      expect(last.modes).toEqual([1, 2]);
    });

    it('空树特判返回 []', () => {
      const steps = buildBstModesStage2Steps(null);
      expect(steps[0].modes).toEqual([]);
    });
  });

  describe('Stage 3: Morris 空间常数遍历', () => {
    it('官方样例: [1, null, 2, 2] Morris 遍历正确得出众数 [2]', () => {
      const root = buildTreeFromArr([1, null, 2, 2]);
      const steps = buildBstModesStage3Steps(root);
      expect(steps.length).toBeGreaterThan(8);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineValid(steps[i].codeLine, `Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.modes).toEqual([2]);
      expect(last.maxCount).toBe(2);
    });

    it('Morris 遍历在线索建立与拆除后保持整树拓扑完整', () => {
      const root = buildTreeFromArr([4, 2, 6, 2, 3, 5, 7]);
      const steps = buildBstModesStage3Steps(root);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      // 树结构在结束后恢复
      expect(last.tree?.val).toBe(4);
      expect(last.tree?.left?.val).toBe(2);
      expect(last.tree?.right?.val).toBe(6);
    });

    it('空树特判返回 []', () => {
      const steps = buildBstModesStage3Steps(null);
      expect(steps[0].modes).toEqual([]);
    });
  });

  describe('唯一身份标识与重复值节点高亮隔离 (Node Identity & Duplicate Isolation)', () => {
    it('[1, null, 2, 2] 重复节点具备不同唯一 ID 且每步单节点精准高亮', () => {
      const root = buildTreeFromArr([1, null, 2, 2]);
      expect(root?.id).toBeDefined();
      expect(root?.right?.id).toBeDefined();
      expect(root?.right?.left?.id).toBeDefined();
      expect(root?.right?.id).not.toBe(root?.right?.left?.id);

      const steps = buildBstModesStage1Steps(root);
      // 遍历所有有当前节点的步进，验证 currNodeId 存在且精准
      for (const step of steps) {
        if (step.currNodeVal !== null) {
          expect(step.currNodeId).toBeDefined();
          if (step.highlightedNodes && step.highlightedNodes.length === 1) {
            expect(typeof step.highlightedNodes[0]).toBe('string');
          }
        }
      }
    });

    it('TreeCanvasAdapter 渲染重复值树时，仅高亮 activeNodeId 对应节点', () => {
      const root = buildTreeFromArr([1, null, 2, 2]);
      const parentNodeId = root?.right?.id as string;
      const childNodeId = root?.right?.left?.id as string;

      const container = document.createElement('div');
      // 传入 childNodeId 作为 activeNodeId
      const state = {
        tree: root,
        activeNodeId: childNodeId,
        highlightedNodes: [childNodeId],
        primaryColor: '#c026d3',
      };
      TreeCanvasAdapter.renderTree(container, state);

      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(3); // 3 个节点

      // 仅有 1 个 circle 具备 primaryColor 高亮，其余节点不具备
      let highlightedCount = 0;
      circles.forEach((c) => {
        if (c.getAttribute('fill') === '#c026d3') {
          highlightedCount++;
        }
      });
      expect(highlightedCount).toBe(1);
    });
  });
});
