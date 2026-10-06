import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  buildBstDeleteStage1Steps,
  buildBstDeleteStage2Steps,
  buildBstDeleteStage3Steps,
  collectTreeValues,
} from './bst-delete-step-compiler';
import {
  BST_DELETE_STAGE1_GRAFT_CODE,
  BST_DELETE_STAGE2_REPLACE_CODE,
  BST_DELETE_STAGE3_ITERATIVE_CODE,
} from '../../../algorithms/categories/tree/bst-delete-stage-codes';

function assertCodeLineValid(codeLine: any, codeObj: any, desc: string) {
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

describe('BSTDeleteStepCompiler (LC 450 · 二叉搜索树中的删除)', () => {
  it('collectTreeValues 正确层序遍历收集节点值', () => {
    const root = buildTreeFromArr([5, 3, 6, 2, 4, null, 7]);
    expect(collectTreeValues(root)).toEqual([5, 3, 6, 2, 4, 7]);
    expect(collectTreeValues(null)).toEqual([]);
  });

  describe('Stage 1: 递归直接嫁接删除 (LC 450 指针重连)', () => {
    it('双子树节点删除: 5, 3, 6, 2, 4, null, 7 删 3，右子树 4 晋升且 2 挂载在 4 的左边', () => {
      const root = buildTreeFromArr([5, 3, 6, 2, 4, null, 7]);
      const steps = buildBstDeleteStage1Steps(root, 3);
      expect(steps.length).toBeGreaterThan(6);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineValid(steps[i].codeLine, BST_DELETE_STAGE1_GRAFT_CODE, `Stage 1 Step ${i}`);
        expect(steps[i].callTrace).toBeDefined();
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(5);
      expect(last.tree?.left?.val).toBe(4);
      expect(last.tree?.left?.left?.val).toBe(2);
    });

    it('删除叶子节点 7，父节点 6 的右子树置空', () => {
      const root = buildTreeFromArr([5, 3, 6, 2, 4, null, 7]);
      const steps = buildBstDeleteStage1Steps(root, 7);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.right?.right).toBeNull();
    });

    it('删除单孩子节点 6 (只有右孩子 7)，7 晋升替代 6', () => {
      const root = buildTreeFromArr([5, 3, 6, 2, 4, null, 7]);
      const steps = buildBstDeleteStage1Steps(root, 6);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.right?.val).toBe(7);
    });

    it('空树边界防守与单节点树删除', () => {
      const emptySteps = buildBstDeleteStage1Steps(null, 3);
      expect(emptySteps.length).toBe(1);
      expect(emptySteps[0].tree).toBeNull();

      const singleRoot = buildTreeFromArr([1]);
      const singleSteps = buildBstDeleteStage1Steps(singleRoot, 1);
      expect(singleSteps[singleSteps.length - 1].tree).toBeNull();
    });

    it('不存在的目标键安全返回原树', () => {
      const root = buildTreeFromArr([5, 3, 6]);
      const steps = buildBstDeleteStage1Steps(root, 100);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(collectTreeValues(last.tree)).toEqual([5, 3, 6]);
    });
  });

  describe('Stage 2: 递归后继节点值覆盖 (算法导论经典解法)', () => {
    it('双子树节点 3 发生后继值 4 覆盖，并递归清除 4', () => {
      const root = buildTreeFromArr([5, 3, 6, 2, 4, null, 7]);
      const steps = buildBstDeleteStage2Steps(root, 3);
      expect(steps.length).toBeGreaterThan(6);

      const replaceStep = steps.find((s) => s.action === 'replace');
      expect(replaceStep).toBeDefined();
      expect(replaceStep?.successorVal).toBe(4);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(5);
      expect(last.tree?.left?.val).toBe(4);
    });

    it('Stage 2 空树与不存在键安全处理', () => {
      const emptySteps = buildBstDeleteStage2Steps(null, 5);
      expect(emptySteps.length).toBe(1);
      expect(emptySteps[0].tree).toBeNull();

      const root = buildTreeFromArr([5, 3, 6]);
      const notFoundSteps = buildBstDeleteStage2Steps(root, 99);
      expect(notFoundSteps.length).toBeGreaterThan(1);
      expect(notFoundSteps[notFoundSteps.length - 1].tree?.val).toBe(5);
    });
  });

  describe('Stage 3: 双指针显式迭代删除 (O(1) 辅助空间)', () => {
    it('双子树节点 3 迭代嫁接删除', () => {
      const root = buildTreeFromArr([5, 3, 6, 2, 4, null, 7]);
      const steps = buildBstDeleteStage3Steps(root, 3);
      expect(steps.length).toBeGreaterThan(3);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineValid(steps[i].codeLine, BST_DELETE_STAGE3_ITERATIVE_CODE, `Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.left?.val).toBe(4);
    });

    it('删除根节点 5 (pre === null 边界)', () => {
      const root = buildTreeFromArr([5, 3, 6, 2, 4, null, 7]);
      const steps = buildBstDeleteStage3Steps(root, 5);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(6);
    });

    it('Stage 3 空树与未命中键', () => {
      const emptySteps = buildBstDeleteStage3Steps(null, 1);
      expect(emptySteps[0].tree).toBeNull();

      const root = buildTreeFromArr([5, 3]);
      const notFound = buildBstDeleteStage3Steps(root, 10);
      expect(notFound[notFound.length - 1].action).toBe('done');
    });
  });
});
