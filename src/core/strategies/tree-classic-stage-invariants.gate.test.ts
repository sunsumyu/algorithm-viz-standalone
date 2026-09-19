import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../algorithms/categories/tree/tree-template';

import { buildTTSteps } from '../../algorithms/categories/tree/tree-traversal-renderer';
import { TREE_TRAVERSAL_CODE_LANGUAGES } from '../../algorithms/categories/tree/tree-traversal-problem-content';

import { buildVBSteps } from '../../algorithms/categories/tree/valid-bst-renderer';
import { VALID_BST_CODE_LANGUAGES } from '../../algorithms/categories/tree/valid-bst-problem-content';

import { buildTSSteps } from '../../algorithms/categories/tree/tree-symmetric-renderer';
import { TREE_SYMMETRIC_CODE_LANGUAGES } from '../../algorithms/categories/tree/tree-symmetric-problem-content';

import { buildTDSteps } from '../../algorithms/categories/tree/tree-depth-renderer';
import { TREE_DEPTH_CODE_LANGUAGES } from '../../algorithms/categories/tree/tree-depth-problem-content';

import { buildPSSteps } from '../../algorithms/categories/tree/path-sum-renderer';
import { PATH_SUM_CODE_LANGUAGES } from '../../algorithms/categories/tree/path-sum-problem-content';

import { buildBTLSteps } from '../../algorithms/categories/tree/binary-tree-level-renderer';
import { BINARY_TREE_LEVEL_CODE_LANGUAGES } from '../../algorithms/categories/tree/binary-tree-level-problem-content';

import { buildTreeInvertSteps } from '../../algorithms/categories/tree/tree-invert-renderer';
import { TREE_INVERT_CODE_LANGUAGES } from '../../algorithms/categories/tree/tree-invert-problem-content';

import { buildBSTSearchSteps } from '../../algorithms/categories/tree/bst-search-renderer';
import { BST_SEARCH_CODE_LANGUAGES } from '../../algorithms/categories/tree/bst-search-problem-content';

import { buildTreeSteps } from '../../algorithms/categories/tree/build-tree-renderer';
import { BUILD_TREE_CODE_LANGUAGES } from '../../algorithms/categories/tree/build-tree-problem-content';

import { buildLCASteps } from '../../algorithms/categories/tree/lca-renderer';
import { LCA_CODE_LANGUAGES } from '../../algorithms/categories/tree/lca-problem-content';

import { generateMaxPathSumSteps, MAX_PATH_SUM_CODES } from '../../algorithms/categories/tree/binary-tree-maximum-path-sum-renderer';
import { generateSumNumbersSteps, SUM_ROOT_TO_LEAF_NUMBERS_CODES } from '../../algorithms/categories/tree/sum-root-to-leaf-numbers-renderer';

function assertCodeLineWithinBounds(
  codeLine: any,
  codeDict: Record<string, string[] | string>,
  stepDesc: string
) {
  if (codeLine === undefined || codeLine === null) return;
  if (typeof codeLine === 'number') {
    for (const [lang, code] of Object.entries(codeDict)) {
      const lineCount = Array.isArray(code) ? code.length : code.trim().split('\n').length;
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} exceeds ${lang} line count ${lineCount}`
      ).toBeLessThanOrEqual(lineCount);
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} must be >= 1`
      ).toBeGreaterThanOrEqual(1);
    }
  } else if (Array.isArray(codeLine)) {
    for (const [lang, code] of Object.entries(codeDict)) {
      const lineCount = Array.isArray(code) ? code.length : code.trim().split('\n').length;
      for (const line of codeLine) {
        expect(
          line,
          `${stepDesc}: array codeLine ${line} exceeds ${lang} line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          line,
          `${stepDesc}: array codeLine ${line} must be >= 1`
        ).toBeGreaterThanOrEqual(1);
      }
    }
  } else if (typeof codeLine === 'object') {
    for (const [lang, lineVal] of Object.entries(codeLine)) {
      if (codeDict[lang] !== undefined) {
        const code = codeDict[lang];
        const lineCount = Array.isArray(code) ? code.length : code.trim().split('\n').length;
        const linesToCheck = Array.isArray(lineVal) ? lineVal : [lineVal];
        for (const line of linesToCheck) {
          if (typeof line === 'number') {
            expect(
              line,
              `${stepDesc}: ${lang} line ${line} exceeds total lines ${lineCount}`
            ).toBeLessThanOrEqual(lineCount);
            expect(
              line,
              `${stepDesc}: ${lang} line ${line} must be >= 1`
            ).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }
  }
}

describe('Tree Classic Stage Invariants Gatekeeper (经典二叉树与核心树形算法门禁矩阵)', () => {
  // 1. Tree Traversal (LC 144/94/145)
  describe('1. Tree Traversal (LeetCode 144/94/145 · 二叉树前序/中序/后序遍历)', () => {
    it('前序、中序、后序应严格满足访问次序与代码映射不变量', () => {
      const root = buildTreeFromArr([1, 2, 3]);

      // 前序
      const preSteps = buildTTSteps(root, 'pre');
      expect(preSteps.length).toBeGreaterThan(0);
      expect(preSteps[0].action).toBe('enter');
      for (let i = 0; i < preSteps.length; i++) {
        assertCodeLineWithinBounds(preSteps[i].codeLine, TREE_TRAVERSAL_CODE_LANGUAGES, `Preorder Step ${i}`);
      }
      expect(preSteps[preSteps.length - 1].result).toEqual([1, 2, 3]);

      // 中序
      const inSteps = buildTTSteps(root, 'in');
      for (let i = 0; i < inSteps.length; i++) {
        assertCodeLineWithinBounds(inSteps[i].codeLine, TREE_TRAVERSAL_CODE_LANGUAGES, `Inorder Step ${i}`);
      }
      expect(inSteps[inSteps.length - 1].result).toEqual([2, 1, 3]);

      // 后序
      const postSteps = buildTTSteps(root, 'post');
      for (let i = 0; i < postSteps.length; i++) {
        assertCodeLineWithinBounds(postSteps[i].codeLine, TREE_TRAVERSAL_CODE_LANGUAGES, `Postorder Step ${i}`);
      }
      expect(postSteps[postSteps.length - 1].result).toEqual([2, 3, 1]);
    });

    it('空树遍历应立即退出', () => {
      const steps = buildTTSteps(null, 'pre');
      expect(steps.length).toBe(2);
      expect(steps[1].result).toEqual([]);
      assertCodeLineWithinBounds(steps[1].codeLine, TREE_TRAVERSAL_CODE_LANGUAGES, 'Empty Preorder');
    });
  });

  // 2. Valid BST (LC 98)
  describe('2. Valid BST (LeetCode 98 · 验证二叉搜索树)', () => {
    it('合法 BST [2, 1, 3] 应单调递增判定为 true', () => {
      const root = buildTreeFromArr([2, 1, 3]);
      const steps = buildVBSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].phase).toBe('init');

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, VALID_BST_CODE_LANGUAGES, `ValidBST Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(true);
      expect(last.sequence).toEqual([1, 2, 3]);
    });

    it('非法 BST [5, 1, 4, null, null, 3, 6] 应准确定位违规节点并判定为 false', () => {
      const root = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
      const steps = buildVBSteps(root);
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(false);
      expect(last.invalidNode).toBe(3);
    });
  });

  // 3. Tree Symmetric (LC 101)
  describe('3. Tree Symmetric (LeetCode 101 · 对称二叉树)', () => {
    it('对称树 [1, 2, 2, 3, 4, 4, 3] 应返回 true', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_SYMMETRIC_CODE_LANGUAGES, `TreeSymmetric Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toBe(true);
    });

    it('不对称树 [1, 2, 2, null, 3, null, 3] 应及时判定为 false', () => {
      const root = buildTreeFromArr([1, 2, 2, null, 3, null, 3]);
      const steps = buildTSSteps(root);
      expect(steps[steps.length - 1].result).toBe(false);
    });
  });

  // 4. Tree Depth (LC 104)
  describe('4. Tree Depth (LeetCode 104 · 二叉树的最大深度)', () => {
    it('[3, 9, 20, null, null, 15, 7] 最大深度为 3', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildTDSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_DEPTH_CODE_LANGUAGES, `TreeDepth Step ${i}`);
      }
      expect(steps[steps.length - 1].maxDepth).toBe(3);
    });

    it('空树最大深度为 0', () => {
      const steps = buildTDSteps(null);
      expect(steps[steps.length - 1].maxDepth).toBe(0);
    });
  });

  // 5. Path Sum (LC 112)
  describe('5. Path Sum (LeetCode 112 · 路径总和)', () => {
    it('目标和 22 存在时正确返回 found=true', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2]);
      const steps = buildPSSteps(root, 22);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, PATH_SUM_CODE_LANGUAGES, `PathSum Step ${i}`);
      }
      expect(steps[steps.length - 1].found).toBe(true);
    });

    it('不存在路径和时返回 found=false', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildPSSteps(root, 5);
      expect(steps[steps.length - 1].found).toBe(false);
    });
  });

  // 6. Binary Tree Level Order (LC 102)
  describe('6. Binary Tree Level Order (LeetCode 102 · 二叉树层序遍历)', () => {
    it('[3, 9, 20, null, null, 15, 7] 正确收集分层结果', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBTLSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BINARY_TREE_LEVEL_CODE_LANGUAGES, `BTL Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [9, 20], [15, 7]]);
    });

    it('空树层序遍历返回 []', () => {
      const steps = buildBTLSteps(null);
      expect(steps[steps.length - 1].result).toEqual([]);
    });
  });

  // 7. Tree Invert (LC 226)
  describe('7. Tree Invert (LeetCode 226 · 翻转二叉树)', () => {
    it('满二叉树翻转后左右子节点互换且计数守恒', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3, 6, 9]);
      const steps = buildTreeInvertSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_INVERT_CODE_LANGUAGES, `TreeInvert Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.invertedCount).toBe(7);
      expect(last.tree?.left?.val).toBe(7);
      expect(last.tree?.right?.val).toBe(2);
    });
  });

  // 8. BST Search (LC 700)
  describe('8. BST Search (LeetCode 700 · 二叉搜索树中的搜索)', () => {
    it('BST [4, 2, 7, 1, 3] 搜索存在的目标 2 返回子树', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 2);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BST_SEARCH_CODE_LANGUAGES, `BSTSearch Step ${i}`);
      }
      expect(steps[steps.length - 1].found).toBe(true);
      expect(steps[steps.length - 1].targetSubtree?.val).toBe(2);
    });

    it('BST [4, 2, 7, 1, 3] 搜索不存在的目标 5 返回未找到', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 5);
      expect(steps[steps.length - 1].found).toBe(false);
    });
  });

  // 9. Build Tree (LC 106)
  describe('9. Build Tree (LeetCode 106 · 构造二叉树)', () => {
    it('根据 pre 与 in 正确还原二叉树拓扑结构', () => {
      const pre = [3, 9, 20, 15, 7];
      const inArr = [9, 3, 15, 20, 7];
      const steps = buildTreeSteps(pre, inArr);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BUILD_TREE_CODE_LANGUAGES, `BuildTree Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
    });
  });

  // 10. LCA (LC 236)
  describe('10. LCA (LeetCode 236 · 二叉树最近公共祖先)', () => {
    it('标准树查找 p=5, q=1 的 LCA 为 3', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLCASteps(root, 5, 1);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LCA_CODE_LANGUAGES, `LCA Step ${i}`);
      }
      expect(steps[steps.length - 1].lcaResult).toBe(3);
    });

    it('标准树查找 p=5, q=4 的 LCA 为 5', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLCASteps(root, 5, 4);
      expect(steps[steps.length - 1].lcaResult).toBe(5);
    });
  });

  // 11. Binary Tree Maximum Path Sum (LC 124)
  describe('11. Binary Tree Maximum Path Sum (LeetCode 124 · 二叉树中的最大路径和)', () => {
    it('含负值节点经典二叉树最大拱形路径和应收敛为 42', () => {
      const steps = generateMaxPathSumSteps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].currentNode).toBe(-10);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MAX_PATH_SUM_CODES, `MaxPathSum Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.maxGlobalSum).toBe(42);
    });
  });

  // 12. Sum Root to Leaf Numbers (LC 129)
  describe('12. Sum Root to Leaf Numbers (LeetCode 129 · 求根节点到叶节点数字之和)', () => {
    it('经典二叉树路径数字累计求和应收敛至 281', () => {
      const steps = generateSumNumbersSteps();
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, SUM_ROOT_TO_LEAF_NUMBERS_CODES, `SumNumbers Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.totalSum).toBe(281);
    });
  });
});
