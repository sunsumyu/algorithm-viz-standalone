// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { BinaryTreeOfTreesSynthesizer } from './binary-tree-of-trees-synthesizer';
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

    it('严格一行一步：visit 块按行展开 compare→分支→maxCount 判定→分支体，分支行绝不静默跳过', () => {
      // 中序访问序列 [1, 1, 2, 2, 2]，覆盖 count++(22)/count=1(24) 双分支与破纪录(27)/并列(31)/无变更三种 maxCount 分支
      const root = buildTreeFromArr([2, 1, 2, 1, null, null, 2]);
      const steps = buildBstModesStage1Steps(root);
      const javaOf = (s: any) => (s.codeLine as Record<string, number>).java;
      const visitSteps = steps.filter((s) => s.action === 'visit' && s.currNodeVal !== null);
      const visitSeq = visitSteps.map(javaOf);

      // 每次访问严格按行展开：compare(21) → 分支(22|24) → maxCount 判定(26) →
      // 破纪录三连(27 maxCount=count → 28 modes.clear → 29 modes.add) | 并列(31) → updatePrev(33)
      expect(visitSeq).toEqual([
        21, 24, 26, 27, 28, 29, 33, // v1 = 1: prev=null → count=1(24) → 破纪录重置(27/28/29)
        21, 22, 26, 27, 28, 29, 33, // v2 = 1: 相同 → count++(22) → 破纪录重置(27/28/29)
        21, 24, 26, 33, // v3 = 2: 不同 → count=1(24) → count < maxCount 无变更（无分支体行）
        21, 22, 26, 31, 33, // v4 = 2: 相同 → count++(22) → 并列追加(31)
        21, 22, 26, 27, 28, 29, 33, // v5 = 2: 相同 → count++(22) → 破纪录重置(27/28/29)
      ]);

      // 状态推进精确锚定：count 恰在分支行变更，compare 行保持旧值
      const v2Compare = visitSteps[7];
      expect(javaOf(v2Compare)).toBe(21);
      expect(v2Compare.count).toBe(1); // v1 结束后的旧值
      const v2Branch = visitSteps[8];
      expect(javaOf(v2Branch)).toBe(22);
      expect(v2Branch.count).toBe(2); // 恰在本行累加
      const v1Branch = visitSteps[1];
      expect(javaOf(v1Branch)).toBe(24);
      expect(v1Branch.count).toBe(1);
      // 破纪录三连的状态可见性：maxCount 变更行保留旧众数集，清空行展示空集，安装行展示新集
      const v1Record = visitSteps[3];
      expect(javaOf(v1Record)).toBe(27);
      expect(v1Record.maxCount).toBe(1);
      expect(v1Record.modes).toEqual([]); // 旧集（此处本为空）
      const v2Wipe = visitSteps[11];
      expect(javaOf(v2Wipe)).toBe(28);
      expect(v2Wipe.modes).toEqual([]); // [1] 被清空的瞬间
      const v2Install = visitSteps[12];
      expect(javaOf(v2Install)).toBe(29);
      expect(v2Install.modes).toEqual([1]);
      // v5 的清空是教学关键时刻：旧众数集 [1, 2] 可见 → 清空 → 安装 [2]
      const v5Record = visitSteps[26];
      expect(javaOf(v5Record)).toBe(27);
      expect(v5Record.modes).toEqual([1, 2]); // 旧众数集仍可见
      const v5Wipe = visitSteps[27];
      expect(javaOf(v5Wipe)).toBe(28);
      expect(v5Wipe.modes).toEqual([]); // 旧集 [1, 2] 被清空的瞬间
      const v5Install = visitSteps[28];
      expect(javaOf(v5Install)).toBe(29);
      expect(v5Install.modes).toEqual([2]);
      // 并列行(31)的状态
      const v4Tie = visitSteps[21];
      expect(javaOf(v4Tie)).toBe(31);
      expect(v4Tie.modes).toEqual([1, 2]);
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

      // 本单测验证单树视图的高亮隔离：显式钉住子视图为单树，避免全景挂树 (Tree-of-Trees)
      // 面板内的迷你树节点 circle 混入全局计数（commit 58b5508 起 renderTree 默认双视图挂载）
      const prevSubView = BinaryTreeOfTreesSynthesizer.activeSubView;
      BinaryTreeOfTreesSynthesizer.activeSubView = 'single-tree';

      const container = document.createElement('div');
      // 传入 childNodeId 作为 activeNodeId
      const state = {
        tree: root,
        activeNodeId: childNodeId,
        highlightedNodes: [childNodeId],
        primaryColor: '#c026d3',
      };
      try {
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
      } finally {
        BinaryTreeOfTreesSynthesizer.activeSubView = prevSubView;
      }
    });
  });
});
