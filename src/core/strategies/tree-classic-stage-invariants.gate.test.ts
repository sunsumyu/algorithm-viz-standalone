import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../algorithms/categories/tree/tree-template';

import { buildTTSteps } from '../../algorithms/categories/tree/tree-traversal-renderer';
import { TREE_TRAVERSAL_CODE_LANGUAGES } from '../../algorithms/categories/tree/tree-traversal-problem-content';

import {
  buildVBSteps,
  buildValidBstStage2RangeSteps,
  buildValidBstStage3StackSteps,
} from '../../algorithms/categories/tree/valid-bst-renderer';
import { VALID_BST_CODE_LANGUAGES } from '../../algorithms/categories/tree/valid-bst-problem-content';
import {
  VALID_BST_STAGE1_CODE,
  VALID_BST_STAGE2_RANGE_CODE,
  VALID_BST_STAGE3_STACK_CODE,
} from '../../algorithms/categories/tree/valid-bst-stage-codes';

import {
  buildTSSteps,
  buildTSIterativeQueueSteps,
  buildTSStaticArraySteps,
} from '../../algorithms/categories/tree/tree-symmetric-renderer';
import { TREE_SYMMETRIC_CODE_LANGUAGES } from '../../algorithms/categories/tree/tree-symmetric-problem-content';
import {
  TREE_SYMMETRIC_STAGE1_CODE,
  TREE_SYMMETRIC_STAGE2_QUEUE_CODE,
  TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_CODE,
} from '../../algorithms/categories/tree/tree-symmetric-stage-codes';

import {
  buildPSSteps,
  buildPathSumStage2BacktrackSteps,
  buildPathSumStage3BfsSteps,
} from '../../algorithms/categories/tree/path-sum-renderer';
import { PATH_SUM_CODE_LANGUAGES } from '../../algorithms/categories/tree/path-sum-problem-content';
import {
  PATH_SUM_STAGE1_CODE,
  PATH_SUM_STAGE2_BACKTRACK_CODE,
  PATH_SUM_STAGE3_BFS_CODE,
} from '../../algorithms/categories/tree/path-sum-stage-codes';

import {
  buildBTLSteps,
  buildStaticArrayLevelOrderSteps,
  buildHashMapLevelOrderSteps,
  buildDFSLevelOrderSteps,
} from '../../algorithms/categories/tree/binary-tree-level-renderer';
import { BINARY_TREE_LEVEL_CODE_LANGUAGES } from '../../algorithms/categories/tree/binary-tree-level-problem-content';
import {
  LEVEL_ORDER_STATIC_ARRAY_CODE,
  LEVEL_ORDER_HASH_MAP_CODE,
  LEVEL_ORDER_STAGE1_CODE,
} from '../../algorithms/categories/tree/binary-tree-level-stage-codes';

import {
  buildZigzagQueueSteps,
  buildZigzagStaticArraySteps,
  buildZigzagDfsSteps,
} from '../../algorithms/categories/tree/tree-036-037/zigzag-level-order-036-renderer';
import {
  ZIGZAG_STAGE1_CODE,
  ZIGZAG_STAGE2_STATIC_ARRAY_CODE,
  ZIGZAG_STAGE3_DFS_CODE,
} from '../../algorithms/categories/tree/tree-036-037/zigzag-level-order-036-stage-codes';

import {
  buildWidth036QueueSteps,
  buildWidth036StaticArraySteps,
  buildWidth036DfsSteps,
} from '../../algorithms/categories/tree/tree-036-037/width-of-binary-tree-036-renderer';
import {
  WIDTH_STAGE1_CODE,
  WIDTH_STAGE2_STATIC_ARRAY_CODE,
  WIDTH_STAGE3_DFS_CODE,
} from '../../algorithms/categories/tree/tree-036-037/width-of-binary-tree-036-stage-codes';

import {
  buildCompletenessQueueSteps,
  buildCompletenessStaticArraySteps,
  buildCompletenessSentinelSteps,
} from '../../algorithms/categories/tree/tree-036-037/completeness-binary-tree-036-renderer';
import {
  COMPLETENESS_STAGE1_CODE,
  COMPLETENESS_STAGE2_STATIC_ARRAY_CODE,
  COMPLETENESS_STAGE3_SENTINEL_CODE,
} from '../../algorithms/categories/tree/tree-036-037/completeness-binary-tree-036-stage-codes';

import {
  buildCountNodesDfsSteps,
  buildCountNodesZuoshenSteps,
  buildCountNodesBinarySearchSteps,
} from '../../algorithms/categories/tree/tree-036-037/count-complete-tree-nodes-036-renderer';
import {
  COUNT_NODES_STAGE1_CODE,
  COUNT_NODES_STAGE2_CODE,
  COUNT_NODES_STAGE3_CODE,
} from '../../algorithms/categories/tree/tree-036-037/count-complete-tree-nodes-036-stage-codes';

import {
  buildTDSteps,
  buildTDBfsSteps,
  buildTDStaticArraySteps,
} from '../../algorithms/categories/tree/tree-depth-renderer';
import {
  TREE_DEPTH_STAGE1_CODE,
  TREE_DEPTH_STAGE2_BFS_CODE,
  TREE_DEPTH_STAGE3_STATIC_ARRAY_CODE,
} from '../../algorithms/categories/tree/tree-depth-stage-codes';

import {
  buildTreeInvertSteps,
  buildTreeInvertBfsSteps,
  buildTreeInvertStaticArraySteps,
} from '../../algorithms/categories/tree/tree-invert-renderer';
import { TREE_INVERT_CODE_LANGUAGES } from '../../algorithms/categories/tree/tree-invert-problem-content';
import {
  TREE_INVERT_STAGE1_CODE,
  TREE_INVERT_STAGE2_QUEUE_CODE,
  TREE_INVERT_STAGE3_STATIC_ARRAY_CODE,
} from '../../algorithms/categories/tree/tree-invert-stage-codes';

import {
  buildBSTSearchSteps,
  buildBstSearchStage2RecursiveSteps,
  buildBstSearchStage3InsertSteps,
} from '../../algorithms/categories/tree/bst-search-renderer';
import { BST_SEARCH_CODE_LANGUAGES } from '../../algorithms/categories/tree/bst-search-problem-content';
import {
  BST_SEARCH_STAGE1_ITERATIVE_CODE,
  BST_SEARCH_STAGE2_RECURSIVE_CODE,
  BST_SEARCH_STAGE3_INSERT_CODE,
} from '../../algorithms/categories/tree/bst-search-stage-codes';

import {
  buildTreeSteps,
  buildTreeStage2PostorderSteps,
  buildTreeStage3StackSteps,
} from '../../algorithms/categories/tree/build-tree-renderer';
import {
  BUILD_TREE_STAGE1_PRE_IN_CODE,
  BUILD_TREE_STAGE2_POST_IN_CODE,
  BUILD_TREE_STAGE3_STACK_CODE,
} from '../../algorithms/categories/tree/build-tree-stage-codes';

import {
  buildLCASteps,
  buildLcaStage2ParentMapSteps,
  buildLcaStage3PathSteps,
} from '../../algorithms/categories/tree/lca-renderer';
import { LCA_CODE_LANGUAGES } from '../../algorithms/categories/tree/lca-problem-content';
import {
  LCA_STAGE1_CODE,
  LCA_STAGE2_PARENT_MAP_CODE,
  LCA_STAGE3_PATH_TRACE_CODE,
} from '../../algorithms/categories/tree/lca-stage-codes';

import {
  generateMaxPathSumSteps,
  buildMaxPathSumStage1Steps,
  buildMaxPathSumStage2InfoSteps,
  buildMaxPathSumStage3StackSteps,
  MAX_PATH_SUM_CODES,
} from '../../algorithms/categories/tree/binary-tree-maximum-path-sum-renderer';
import {
  MAX_PATH_SUM_STAGE1_CODES,
  MAX_PATH_SUM_STAGE2_CODES,
  MAX_PATH_SUM_STAGE3_CODES,
} from '../../algorithms/categories/tree/binary-tree-maximum-path-sum-stage-codes';
import {
  generateSumNumbersSteps,
  SUM_ROOT_TO_LEAF_NUMBERS_CODES,
  buildSumNumbersStage1Steps,
  buildSumNumbersStage2BfsSteps,
  buildSumNumbersStage3StackSteps,
} from '../../algorithms/categories/tree/sum-root-to-leaf-numbers-renderer';
import {
  SUM_NUMBERS_STAGE1_CODES,
  SUM_NUMBERS_STAGE2_CODES,
  SUM_NUMBERS_STAGE3_CODES,
} from '../../algorithms/categories/tree/sum-root-to-leaf-numbers-stage-codes';
import {
  buildMinDepthStage1Steps,
  buildMinDepthStage2BfsSteps,
  buildMinDepthStage3StaticArraySteps,
  buildMinDepthSteps,
} from '../../algorithms/categories/tree/min-depth-renderer';
import {
  MIN_DEPTH_STAGE1_CODES,
  MIN_DEPTH_STAGE2_CODES,
  MIN_DEPTH_STAGE3_CODES,
} from '../../algorithms/categories/tree/min-depth-stage-codes';
import {
  buildBalancedStage1Steps,
  buildBalancedStage2PruneSteps,
  buildBalancedStage3StackSteps,
  buildBalancedTree037Steps,
} from '../../algorithms/categories/tree/tree-036-037/balanced-binary-tree-037-renderer';
import {
  BALANCED_TREE_037_STAGE1_CODES,
  BALANCED_TREE_037_STAGE2_CODES,
  BALANCED_TREE_037_STAGE3_CODES,
} from '../../algorithms/categories/tree/tree-036-037/tree-036-037-stage-codes';
import {
  buildLeftLeavesStage1Steps,
  buildLeftLeavesStage2BfsSteps,
  buildLeftLeavesStage3StackSteps,
  buildLeftLeavesSteps,
} from '../../algorithms/categories/tree/left-leaves-renderer';
import {
  LEFT_LEAVES_STAGE1_CODES,
  LEFT_LEAVES_STAGE2_CODES,
  LEFT_LEAVES_STAGE3_CODES,
} from '../../algorithms/categories/tree/left-leaves-stage-codes';
import {
  buildAllPathsStage1BacktrackSteps,
  buildAllPathsStage2FunctionalSteps,
  buildAllPathsStage3BfsSteps,
  buildAllPathsSteps,
} from '../../algorithms/categories/tree/all-paths-renderer';
import {
  ALL_PATHS_STAGE1_CODES,
  ALL_PATHS_STAGE2_CODES,
  ALL_PATHS_STAGE3_CODES,
} from '../../algorithms/categories/tree/all-paths-stage-codes';
import {
  buildBottomLeftStage1PreorderSteps,
  buildBottomLeftStage2BfsSteps,
  buildBottomLeftStage3ReverseBfsSteps,
  buildBottomLeftSteps,
} from '../../algorithms/categories/tree/bottom-left-renderer';
import {
  BOTTOM_LEFT_STAGE1_CODES,
  BOTTOM_LEFT_STAGE2_CODES,
  BOTTOM_LEFT_STAGE3_CODES,
} from '../../algorithms/categories/tree/bottom-left-stage-codes';
import {
  buildMaxTreeStage1Steps,
  buildMaxTreeStage2StackSteps,
  buildMaxTreeStage3IterativeSteps,
  buildMaxTreeSteps,
} from '../../algorithms/categories/tree/max-tree-renderer';
import {
  MAX_TREE_STAGE1_CODES,
  MAX_TREE_STAGE2_CODES,
  MAX_TREE_STAGE3_CODES,
} from '../../algorithms/categories/tree/max-tree-stage-codes';

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
    it('Stage 1: 中序递归合法 BST [2, 1, 3] 应单调递增判定为 true 且四语言行号合法', () => {
      const root = buildTreeFromArr([2, 1, 3]);
      const steps = buildVBSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].phase).toBe('init');

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, VALID_BST_STAGE1_CODE, `ValidBST Stage 1 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(true);
      expect(last.sequence).toEqual([1, 2, 3]);
    });

    it('Stage 1: 非法 BST [5, 1, 4, null, null, 3, 6] 应准确定位违规节点并判定为 false', () => {
      const root = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
      const steps = buildVBSteps(root);
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(false);
      expect(last.invalidNode).toBe(3);
    });

    it('Stage 2: 上下界区间约束先序定界正确判定合法与越界剪枝且四语言行号合法', () => {
      const validRoot = buildTreeFromArr([2, 1, 3]);
      const validSteps = buildValidBstStage2RangeSteps(validRoot);
      expect(validSteps.length).toBeGreaterThan(0);
      for (let i = 0; i < validSteps.length; i++) {
        assertCodeLineWithinBounds(validSteps[i].codeLine, VALID_BST_STAGE2_RANGE_CODE, `ValidBST Stage 2 Valid Step ${i}`);
      }
      expect(validSteps[validSteps.length - 1].valid).toBe(true);

      const invalidRoot = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
      const invalidSteps = buildValidBstStage2RangeSteps(invalidRoot);
      for (let i = 0; i < invalidSteps.length; i++) {
        assertCodeLineWithinBounds(invalidSteps[i].codeLine, VALID_BST_STAGE2_RANGE_CODE, `ValidBST Stage 2 Invalid Step ${i}`);
      }
      const lastInvalid = invalidSteps[invalidSteps.length - 1];
      expect(lastInvalid.valid).toBe(false);
      expect(lastInvalid.invalidNode).toBe(4);
    });

    it('Stage 3: 迭代显式栈模拟中序遍历正确判定且四语言行号合法', () => {
      const validRoot = buildTreeFromArr([2, 1, 3]);
      const validSteps = buildValidBstStage3StackSteps(validRoot);
      expect(validSteps.length).toBeGreaterThan(0);
      for (let i = 0; i < validSteps.length; i++) {
        assertCodeLineWithinBounds(validSteps[i].codeLine, VALID_BST_STAGE3_STACK_CODE, `ValidBST Stage 3 Valid Step ${i}`);
      }
      expect(validSteps[validSteps.length - 1].valid).toBe(true);
      expect(validSteps[validSteps.length - 1].sequence).toEqual([1, 2, 3]);

      const invalidRoot = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
      const invalidSteps = buildValidBstStage3StackSteps(invalidRoot);
      expect(invalidSteps[invalidSteps.length - 1].valid).toBe(false);
      expect(invalidSteps[invalidSteps.length - 1].invalidNode).toBe(3);
    });

    it('空树判定为合法 BST (true)', () => {
      expect(buildVBSteps(null).pop()?.valid).toBe(true);
      expect(buildValidBstStage2RangeSteps(null).pop()?.valid).toBe(true);
      expect(buildValidBstStage3StackSteps(null).pop()?.valid).toBe(true);
    });
  });

  // 3. Tree Symmetric (LC 101)
  describe('3. Tree Symmetric (LeetCode 101 · 对称二叉树)', () => {
    it('Stage 1: 双指针镜像递归 [1, 2, 2, 3, 4, 4, 3] 应返回 true 且四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_SYMMETRIC_STAGE1_CODE, `TreeSymmetric Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toBe(true);
    });

    it('Stage 1: 不对称树 [1, 2, 2, null, 3, null, 3] 应及时判定为 false', () => {
      const root = buildTreeFromArr([1, 2, 2, null, 3, null, 3]);
      const steps = buildTSSteps(root);
      expect(steps[steps.length - 1].result).toBe(false);
    });

    it('Stage 2: 队列成对迭代 (Iterative Queue BFS) [1, 2, 2, 3, 4, 4, 3] 返回 true 且四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSIterativeQueueSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_SYMMETRIC_STAGE2_QUEUE_CODE, `TreeSymmetric Stage 2 Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toBe(true);
    });

    it('Stage 2: 不对称树 [1, 2, 2, null, 3, null, 3] 及时阻断并返回 false', () => {
      const root = buildTreeFromArr([1, 2, 2, null, 3, null, 3]);
      const steps = buildTSIterativeQueueSteps(root);
      expect(steps[steps.length - 1].result).toBe(false);
    });

    it('Class 036 Stage 3: 静态数组模拟队列 (Static Array Queue) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSStaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_CODE, `TreeSymmetric Stage 3 Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toBe(true);
      const last = steps[steps.length - 1];
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
    });

    it('空树判定为对称二叉树 (true)', () => {
      expect(buildTSSteps(null).pop()?.result).toBe(true);
      expect(buildTSIterativeQueueSteps(null).pop()?.result).toBe(true);
      expect(buildTSStaticArraySteps(null).pop()?.result).toBe(true);
    });
  });

  // 4. Tree Depth (LC 104 / Class 036 Code04)
  describe('4. Tree Depth (LeetCode 104 / Class 036 Code04 · 二叉树的最大深度)', () => {
    it('[3, 9, 20, null, null, 15, 7] Stage 1: 递归后序自底向上归约深度为 3 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildTDSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_DEPTH_STAGE1_CODE, `TreeDepth Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].maxDepth).toBe(3);
    });

    it('Class 036 Stage 2: 层次遍历 BFS 队列层数计数步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildTDBfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_DEPTH_STAGE2_BFS_CODE, `TreeDepth Stage 2 Step ${i}`);
      }
      expect(steps[steps.length - 1].maxDepth).toBe(3);
    });

    it('Class 036 Stage 3: 静态数组模拟队列 (Static Array Queue BFS) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildTDStaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_DEPTH_STAGE3_STATIC_ARRAY_CODE, `TreeDepth Stage 3 Step ${i}`);
      }
      expect(steps[steps.length - 1].maxDepth).toBe(3);
      const last = steps[steps.length - 1];
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
    });

    it('空树最大深度返回 0', () => {
      expect(buildTDSteps(null).pop()?.maxDepth).toBe(0);
      expect(buildTDBfsSteps(null).pop()?.maxDepth).toBe(0);
      expect(buildTDStaticArraySteps(null).pop()?.maxDepth).toBe(0);
    });
  });

  // 5. Path Sum (LC 112 & LC 113)
  describe('5. Path Sum (LeetCode 112 & 113 · 路径总和与全解收集)', () => {
    it('Stage 1: 递归减法回溯 (LC 112) 目标和 22 存在时正确返回 found=true 且四语言行号合法', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2]);
      const steps = buildPSSteps(root, 22);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, PATH_SUM_STAGE1_CODE, `PathSum Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].found).toBe(true);
    });

    it('Stage 1: 不存在路径和时返回 found=false', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildPSSteps(root, 5);
      expect(steps[steps.length - 1].found).toBe(false);
    });

    it('Stage 2: 回溯现场恢复与全解收集 (LC 113 / Class 037) 正确收集所有路径且四语言行号合法', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
      const steps = buildPathSumStage2BacktrackSteps(root, 22);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, PATH_SUM_STAGE2_BACKTRACK_CODE, `PathSum Stage 2 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.found).toBe(true);
      expect(last.allPaths.length).toBe(2);
      expect(last.allPaths).toEqual([
        [5, 4, 11, 2],
        [5, 8, 4, 5],
      ]);
    });

    it('Stage 3: 迭代 BFS 双队列层序求和正确判定且四语言行号合法', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2]);
      const steps = buildPathSumStage3BfsSteps(root, 22);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, PATH_SUM_STAGE3_BFS_CODE, `PathSum Stage 3 Step ${i}`);
      }
      expect(steps[steps.length - 1].found).toBe(true);
    });

    it('空树路径求和安全退出', () => {
      expect(buildPSSteps(null, 10).pop()?.found).toBe(false);
      expect(buildPathSumStage2BacktrackSteps(null, 10).pop()?.found).toBe(false);
      expect(buildPathSumStage3BfsSteps(null, 10).pop()?.found).toBe(false);
    });
  });

  // 6. Binary Tree Level Order (LC 102)
  describe('6. Binary Tree Level Order (LeetCode 102 · 二叉树层序遍历)', () => {
    it('[3, 9, 20, null, null, 15, 7] 正确收集分层结果 (Stage 1 标准队列)', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBTLSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BINARY_TREE_LEVEL_CODE_LANGUAGES, `BTL Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [9, 20], [15, 7]]);
    });

    it('Class 036 Stage 2: 静态数组模拟队列 (Static Array Queue) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildStaticArrayLevelOrderSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LEVEL_ORDER_STATIC_ARRAY_CODE, `StaticArray Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [9, 20], [15, 7]]);
      // 验证静态队列最终 l 与 r 状态对齐
      const last = steps[steps.length - 1];
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
    });

    it('Class 036 Stage 3: 哈希表记录层级 (HashMap Queue) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildHashMapLevelOrderSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LEVEL_ORDER_HASH_MAP_CODE, `HashMap Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [9, 20], [15, 7]]);
      expect(steps[steps.length - 1].hashMapState?.entries.length).toBe(5);
    });

    it('Stage 4: 递归 DFS 分层收集步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildDFSLevelOrderSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LEVEL_ORDER_STAGE1_CODE, `DFS Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [9, 20], [15, 7]]);
    });

    it('空树层序遍历返回 []', () => {
      const steps = buildBTLSteps(null);
      expect(steps[steps.length - 1].result).toEqual([]);
      const staticSteps = buildStaticArrayLevelOrderSteps(null);
      expect(staticSteps[staticSteps.length - 1].result).toEqual([]);
      const hashSteps = buildHashMapLevelOrderSteps(null);
      expect(hashSteps[hashSteps.length - 1].result).toEqual([]);
      const dfsSteps = buildDFSLevelOrderSteps(null);
      expect(dfsSteps[dfsSteps.length - 1].result).toEqual([]);
    });
  });

  // 6.1 Binary Tree Zigzag Level Order (LC 103 / Class 036 Code02)
  describe('6.1 Binary Tree Zigzag Level Order (LeetCode 103 / Class 036 Code02 · 锯齿形层序遍历)', () => {
    it('[3, 9, 20, null, null, 15, 7] 正确收集之字形折返结果 [[3], [20, 9], [15, 7]] (Stage 1 双端队列)', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildZigzagQueueSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, ZIGZAG_STAGE1_CODE, `Zigzag Queue Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [20, 9], [15, 7]]);
    });

    it('Class 036 Stage 2: 静态数组模拟队列 (Static Array Queue) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildZigzagStaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, ZIGZAG_STAGE2_STATIC_ARRAY_CODE, `Zigzag StaticArray Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [20, 9], [15, 7]]);
      const last = steps[steps.length - 1];
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
    });

    it('Stage 3: 递归 DFS 深度奇偶映射收集步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildZigzagDfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, ZIGZAG_STAGE3_DFS_CODE, `Zigzag DFS Step ${i}`);
      }
      expect(steps[steps.length - 1].result).toEqual([[3], [20, 9], [15, 7]]);
    });

    it('空树锯齿形层序遍历返回 []', () => {
      expect(buildZigzagQueueSteps(null).pop()?.result).toEqual([]);
      expect(buildZigzagStaticArraySteps(null).pop()?.result).toEqual([]);
      expect(buildZigzagDfsSteps(null).pop()?.result).toEqual([]);
    });
  });

  // 6.2 Binary Tree Maximum Width (LC 662 / Class 036 Code03)
  describe('6.2 Binary Tree Maximum Width (LeetCode 662 / Class 036 Code03 · 二叉树最大宽度)', () => {
    it('[1, 3, 2, 5, 3, null, 9] Stage 1: 标准 Queue + 基准偏移防溢出结算最大宽度为 4', () => {
      const root = buildTreeFromArr([1, 3, 2, 5, 3, null, 9]);
      const steps = buildWidth036QueueSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, WIDTH_STAGE1_CODE, `Width Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].maxWidth).toBe(4);
    });

    it('Class 036 Stage 2: 静态连续双数组模拟队列 (Two Static Arrays Queue) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([1, 3, 2, 5, 3, null, 9]);
      const steps = buildWidth036StaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, WIDTH_STAGE2_STATIC_ARRAY_CODE, `Width Stage 2 Step ${i}`);
      }
      expect(steps[steps.length - 1].maxWidth).toBe(4);
      const last = steps[steps.length - 1];
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
    });

    it('Stage 3: DFS 递归先序每层最左节点首访入表步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([1, 3, 2, 5, 3, null, 9]);
      const steps = buildWidth036DfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, WIDTH_STAGE3_DFS_CODE, `Width Stage 3 Step ${i}`);
      }
      expect(steps[steps.length - 1].maxWidth).toBe(4);
      expect(steps[steps.length - 1].dfsState?.leftMost.size).toBe(3);
    });

    it('空树最大宽度返回 0', () => {
      expect(buildWidth036QueueSteps(null).pop()?.maxWidth).toBe(0);
      expect(buildWidth036StaticArraySteps(null).pop()?.maxWidth).toBe(0);
      expect(buildWidth036DfsSteps(null).pop()?.maxWidth).toBe(0);
    });
  });

  // 6.3 Completeness of Binary Tree (LC 958 / Class 036 Code05)
  describe('6.3 Completeness of Binary Tree (LeetCode 958 / Class 036 Code05 · 完全二叉树检验)', () => {
    it('[1, 2, 3, 4, 5, 6] Stage 1: 标准 Queue + 左神两大铁律判定为 true', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCompletenessQueueSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, COMPLETENESS_STAGE1_CODE, `Completeness Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].isValid).toBe(true);
    });

    it('有右无左违规案例 [1, 2, 3, null, 4] Stage 1 准确拦截并返回 false', () => {
      const root = buildTreeFromArr([1, 2, 3, null, 4]);
      const steps = buildCompletenessQueueSteps(root);
      expect(steps[steps.length - 1].isValid).toBe(false);
      expect(steps[steps.length - 1].violationReason).toContain('有右无左');
    });

    it('Class 036 Stage 2: 静态连续数组模拟队列 (Static Array Queue) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCompletenessStaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, COMPLETENESS_STAGE2_STATIC_ARRAY_CODE, `Completeness Stage 2 Step ${i}`);
      }
      expect(steps[steps.length - 1].isValid).toBe(true);
      const last = steps[steps.length - 1];
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
    });

    it('Stage 3: 空节点哨兵单调队列 (Null Sentinel Queue) 步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCompletenessSentinelSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, COMPLETENESS_STAGE3_SENTINEL_CODE, `Completeness Stage 3 Step ${i}`);
      }
      expect(steps[steps.length - 1].isValid).toBe(true);
    });

    it('断层违规案例 [1, 2, 3, 4, 5, null, 7] Stage 3 成功检测到中间空隙并返回 false', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, null, 7]);
      const steps = buildCompletenessSentinelSteps(root);
      expect(steps[steps.length - 1].isValid).toBe(false);
      expect(steps[steps.length - 1].violationReason).toContain('空隙断层');
    });

    it('空树判定为合法的完全二叉树 (true)', () => {
      expect(buildCompletenessQueueSteps(null).pop()?.isValid).toBe(true);
      expect(buildCompletenessStaticArraySteps(null).pop()?.isValid).toBe(true);
      expect(buildCompletenessSentinelSteps(null).pop()?.isValid).toBe(true);
    });
  });

  // 6.4 Count Complete Tree Nodes (LC 222 / Class 036 Code06)
  describe('6.4 Count Complete Tree Nodes (LeetCode 222 / Class 036 Code06 · 完全二叉树节点个数)', () => {
    it('[1, 2, 3, 4, 5, 6] Stage 1: 朴素递归 DFS 遍历结果正确且四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesDfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, COUNT_NODES_STAGE1_CODE, `CountNodes Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].metrics?.['最终结果']).toBe(6);
    });

    it('Class 036 Stage 2: 左神 O((logN)^2) 满二叉树公式剪枝步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesZuoshenSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, COUNT_NODES_STAGE2_CODE, `CountNodes Stage 2 Step ${i}`);
      }
      expect(steps[steps.length - 1].metrics?.['最终结果']).toBe(6);
    });

    it('满二叉树 [1, 2, 3, 4, 5, 6, 7] Stage 2 计算结果为 7', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6, 7]);
      const steps = buildCountNodesZuoshenSteps(root);
      expect(steps[steps.length - 1].metrics?.['最终结果']).toBe(7);
    });

    it('Stage 3: 二分叶子编号 + 二进制寻路探测步骤与四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, 5, 6]);
      const steps = buildCountNodesBinarySearchSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, COUNT_NODES_STAGE3_CODE, `CountNodes Stage 3 Step ${i}`);
      }
      expect(steps[steps.length - 1].metrics?.['最终结果']).toBe(6);
    });

    it('空树返回 0', () => {
      expect(buildCountNodesDfsSteps(null).pop()?.metrics?.['最终结果']).toBe(0);
      expect(buildCountNodesZuoshenSteps(null).pop()?.metrics?.['最终结果']).toBe(0);
      expect(buildCountNodesBinarySearchSteps(null).pop()?.metrics?.['最终结果']).toBe(0);
    });
  });

  // 7. Tree Invert (LC 226)
  describe('7. Tree Invert (LeetCode 226 · 翻转二叉树)', () => {
    it('Stage 1: 前序递归翻转满二叉树后左右子节点互换且计数守恒', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3, 6, 9]);
      const steps = buildTreeInvertSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_INVERT_STAGE1_CODE, `TreeInvert Stage 1 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.invertedCount).toBe(7);
      expect(last.tree?.left?.val).toBe(7);
      expect(last.tree?.right?.val).toBe(2);
    });

    it('Stage 2: 队列层序遍历翻转 (Iterative Queue BFS) 结果正确且四语言行号合法', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3, 6, 9]);
      const steps = buildTreeInvertBfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_INVERT_STAGE2_QUEUE_CODE, `TreeInvert Stage 2 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.invertedCount).toBe(7);
      expect(last.tree?.left?.val).toBe(7);
      expect(last.tree?.right?.val).toBe(2);
    });

    it('Class 036 Stage 3: 静态连续数组模拟队列 (Static Array Queue · 左神招牌零 GC) 步骤与行号合法', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3, 6, 9]);
      const steps = buildTreeInvertStaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, TREE_INVERT_STAGE3_STATIC_ARRAY_CODE, `TreeInvert Stage 3 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.invertedCount).toBe(7);
      expect(last.tree?.left?.val).toBe(7);
      expect(last.tree?.right?.val).toBe(2);
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
    });

    it('空树翻转应安全退出', () => {
      expect(buildTreeInvertSteps(null).pop()?.tree).toBeNull();
      expect(buildTreeInvertBfsSteps(null).pop()?.tree).toBeNull();
      expect(buildTreeInvertStaticArraySteps(null).pop()?.tree).toBeNull();
    });
  });

  // 8. BST Search (LC 700 / 701)
  describe('8. BST Search (LeetCode 700 / 701 · 二叉搜索树中的搜索与插入)', () => {
    it('Stage 1: 迭代单向剪枝查找存在目标 2 返回子树且四语言行号合法', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 2);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BST_SEARCH_STAGE1_ITERATIVE_CODE, `BSTSearch Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].found).toBe(true);
      expect(steps[steps.length - 1].targetSubtree?.val).toBe(2);
    });

    it('Stage 1: 迭代查找不存在目标 5 返回未找到', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 5);
      expect(steps[steps.length - 1].found).toBe(false);
    });

    it('Stage 2: 递归分支剪枝查找命中 2 且四语言行号合法', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBstSearchStage2RecursiveSteps(root, 2);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BST_SEARCH_STAGE2_RECURSIVE_CODE, `BSTSearch Stage 2 Step ${i}`);
      }
      expect(steps[steps.length - 1].found).toBe(true);
      expect(steps[steps.length - 1].targetSubtree?.val).toBe(2);
    });

    it('Stage 2: 递归查找不存在目标 5 返回未找到', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBstSearchStage2RecursiveSteps(root, 5);
      expect(steps[steps.length - 1].found).toBe(false);
    });

    it('Stage 3: 动态插入新值 5 成功挂载为 7 的左叶子且四语言行号合法', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBstSearchStage3InsertSteps(root, 5);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BST_SEARCH_STAGE3_INSERT_CODE, `BSTSearch Stage 3 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.found).toBe(true);
      expect(last.insertedVal).toBe(5);
      expect(last.tree?.right?.left?.val).toBe(5);
    });

    it('空树情况下三大 Stage 安全退出', () => {
      expect(buildBSTSearchSteps(null, 2).pop()?.found).toBe(false);
      expect(buildBstSearchStage2RecursiveSteps(null, 2).pop()?.found).toBe(false);
      expect(buildBstSearchStage3InsertSteps(null, 2).pop()?.tree?.val).toBe(2);
    });
  });

  // 9. Build Tree (LC 105 & 106)
  describe('9. Build Tree (LeetCode 105 & 106 · 从前序/后序与中序构造二叉树)', () => {
    it('Stage 1: 根据 pre=[3,9,20,15,7] in=[9,3,15,20,7] 分治构造还原拓扑且四语言行号合法', () => {
      const pre = [3, 9, 20, 15, 7];
      const inArr = [9, 3, 15, 20, 7];
      const steps = buildTreeSteps(pre, inArr);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BUILD_TREE_STAGE1_PRE_IN_CODE, `BuildTree Stage 1 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
      expect(last.tree?.right?.left?.val).toBe(15);
      expect(last.tree?.right?.right?.val).toBe(7);
    });

    it('Stage 2: 根据 in=[9,3,15,20,7] post=[9,15,7,20,3] 后序递归构造且四语言行号合法', () => {
      const inArr = [9, 3, 15, 20, 7];
      const post = [9, 15, 7, 20, 3];
      const steps = buildTreeStage2PostorderSteps(inArr, post);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BUILD_TREE_STAGE2_POST_IN_CODE, `BuildTree Stage 2 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
      expect(last.tree?.right?.left?.val).toBe(15);
      expect(last.tree?.right?.right?.val).toBe(7);
    });

    it('Stage 3: 迭代显式栈模拟重构 pre=[3,9,20,15,7] in=[9,3,15,20,7] 且四语言行号合法', () => {
      const pre = [3, 9, 20, 15, 7];
      const inArr = [9, 3, 15, 20, 7];
      const steps = buildTreeStage3StackSteps(pre, inArr);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BUILD_TREE_STAGE3_STACK_CODE, `BuildTree Stage 3 Step ${i}`);
      }
      const last = steps[steps.length - 1];
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
      expect(last.tree?.right?.left?.val).toBe(15);
      expect(last.tree?.right?.right?.val).toBe(7);
      expect(last.stackState).toBeDefined();
    });

    it('空数组与长度不匹配情况下三大 Stage 安全退出', () => {
      expect(buildTreeSteps([], []).pop()?.tree).toBeNull();
      expect(buildTreeStage2PostorderSteps([], []).pop()?.tree).toBeNull();
      expect(buildTreeStage3StackSteps([], []).pop()?.tree).toBeNull();

      expect(buildTreeSteps([1, 2], [1]).pop()?.tree).toBeNull();
      expect(buildTreeStage2PostorderSteps([1], [1, 2]).pop()?.tree).toBeNull();
      expect(buildTreeStage3StackSteps([1, 2], [1]).pop()?.tree).toBeNull();
    });
  });

  // 10. LCA (LC 236)
  describe('10. LCA (LeetCode 236 · 二叉树最近公共祖先)', () => {
    it('Stage 1: 标准树查找 p=5, q=1 的 LCA 为 3 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLCASteps(root, 5, 1);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LCA_STAGE1_CODE, `LCA Stage 1 Step ${i}`);
      }
      expect(steps[steps.length - 1].lcaResult).toBe(3);
    });

    it('Stage 1: 同侧祖先包含 p=5, q=4 的 LCA 为 5', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLCASteps(root, 5, 4);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].lcaResult).toBe(5);
    });

    it('Stage 2: 父节点哈希表遍历 p=5, q=1 的 LCA 为 3 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLcaStage2ParentMapSteps(root, 5, 1);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LCA_STAGE2_PARENT_MAP_CODE, `LCA Stage 2 Step ${i}`);
      }
      expect(steps[steps.length - 1].lcaResult).toBe(3);
      expect(steps[steps.length - 1].visitedAncestors).toContain(5);
    });

    it('Stage 2: 同侧包含 p=5, q=4 的 LCA 为 5', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLcaStage2ParentMapSteps(root, 5, 4);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].lcaResult).toBe(5);
    });

    it('Stage 3: 根到目标显式双路径交汇比对 p=5, q=1 的 LCA 为 3 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLcaStage3PathSteps(root, 5, 1);
      expect(steps.length).toBeGreaterThan(0);
      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LCA_STAGE3_PATH_TRACE_CODE, `LCA Stage 3 Step ${i}`);
      }
      expect(steps[steps.length - 1].lcaResult).toBe(3);
      expect(steps[steps.length - 1].pathP).toEqual([3, 5]);
      expect(steps[steps.length - 1].pathQ).toEqual([3, 1]);
    });

    it('Stage 3: 同侧包含 p=5, q=4 的 LCA 为 5', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLcaStage3PathSteps(root, 5, 4);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].lcaResult).toBe(5);
      expect(steps[steps.length - 1].pathP).toEqual([3, 5]);
      expect(steps[steps.length - 1].pathQ).toEqual([3, 5, 2, 4]);
    });

    it('空树情况下三大 Stage 安全退出', () => {
      expect(buildLCASteps(null, 5, 1).pop()?.lcaResult).toBeNull();
      expect(buildLcaStage2ParentMapSteps(null, 5, 1).pop()?.lcaResult).toBeNull();
      expect(buildLcaStage3PathSteps(null, 5, 1).pop()?.lcaResult).toBeNull();
    });
  });

  // 11. Binary Tree Maximum Path Sum (LC 124)
  describe('11. Binary Tree Maximum Path Sum (LeetCode 124 · 二叉树中的最大路径和)', () => {
    it('Stage 1: 经典树 [-10, 9, 20, null, null, 15, 7] 拱形路径和收敛至 42 且四语言行号合法', () => {
      const steps = generateMaxPathSumSteps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].currentNode).toBe(-10);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MAX_PATH_SUM_STAGE1_CODES, `MaxPathSum Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.maxGlobalSum).toBe(42);
    });

    it('Stage 1: 全负数树 [-3, -2, -1] 应返回最大单个节点 -1', () => {
      const root = buildTreeFromArr([-3, -2, -1]);
      const steps = buildMaxPathSumStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].maxGlobalSum).toBe(-1);
    });

    it('Stage 2: 树形 DP 二元信息汇聚模型正确收敛至 42 且四语言行号合法', () => {
      const root = buildTreeFromArr([-10, 9, 20, null, null, 15, 7]);
      const steps = buildMaxPathSumStage2InfoSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MAX_PATH_SUM_STAGE2_CODES, `MaxPathSum Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.maxGlobalSum).toBe(42);
    });

    it('Stage 2: 简单树 [1, 2, 3] 返回 6', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildMaxPathSumStage2InfoSteps(root);
      expect(steps[steps.length - 1].maxGlobalSum).toBe(6);
    });

    it('Stage 3: 显式后序遍历与状态表映射收敛至 42 且四语言行号合法', () => {
      const root = buildTreeFromArr([-10, 9, 20, null, null, 15, 7]);
      const steps = buildMaxPathSumStage3StackSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MAX_PATH_SUM_STAGE3_CODES, `MaxPathSum Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.maxGlobalSum).toBe(42);
    });

    it('空树情况下三大 Stage 安全退出返回 0', () => {
      expect(buildMaxPathSumStage1Steps(null).pop()?.maxGlobalSum).toBe(0);
      expect(buildMaxPathSumStage2InfoSteps(null).pop()?.maxGlobalSum).toBe(0);
      expect(buildMaxPathSumStage3StackSteps(null).pop()?.maxGlobalSum).toBe(0);
    });
  });

  // 12. Sum Root to Leaf Numbers (LC 129)
  describe('12. Sum Root to Leaf Numbers (LeetCode 129 · 求根节点到叶节点数字之和)', () => {
    it('兼容接口: 经典二叉树路径数字累计求和应收敛至 281', () => {
      const steps = generateSumNumbersSteps();
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, SUM_ROOT_TO_LEAF_NUMBERS_CODES, `SumNumbers Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.totalSum).toBe(281);
    });

    it('Stage 1: 经典树 [4, 9, 0, 5, 1] 前序递归累加总和收敛至 1026 且四语言行号合法', () => {
      const root = buildTreeFromArr([4, 9, 0, 5, 1]);
      const steps = buildSumNumbersStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, SUM_NUMBERS_STAGE1_CODES, `SumNumbers Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.totalSum).toBe(1026);
      expect(last.completedPaths.length).toBe(3);
    });

    it('Stage 2: 经典树 [4, 9, 0, 5, 1] BFS 双队列层序累加总和收敛至 1026 且四语言行号合法', () => {
      const root = buildTreeFromArr([4, 9, 0, 5, 1]);
      const steps = buildSumNumbersStage2BfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, SUM_NUMBERS_STAGE2_CODES, `SumNumbers Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.totalSum).toBe(1026);
      expect(last.completedPaths.length).toBe(3);
    });

    it('Stage 3: 经典树 [4, 9, 0, 5, 1] 显式迭代双栈累加总和收敛至 1026 且四语言行号合法', () => {
      const root = buildTreeFromArr([4, 9, 0, 5, 1]);
      const steps = buildSumNumbersStage3StackSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, SUM_NUMBERS_STAGE3_CODES, `SumNumbers Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.totalSum).toBe(1026);
      expect(last.completedPaths.length).toBe(3);
    });

    it('简单三节点树 [1, 2, 3] 在三大 Stage 均产出 25 (12 + 13)', () => {
      const root1 = buildTreeFromArr([1, 2, 3]);
      const root2 = buildTreeFromArr([1, 2, 3]);
      const root3 = buildTreeFromArr([1, 2, 3]);
      expect(buildSumNumbersStage1Steps(root1).pop()?.totalSum).toBe(25);
      expect(buildSumNumbersStage2BfsSteps(root2).pop()?.totalSum).toBe(25);
      expect(buildSumNumbersStage3StackSteps(root3).pop()?.totalSum).toBe(25);
    });

    it('空树情况下三大 Stage 安全退出返回 0', () => {
      expect(buildSumNumbersStage1Steps(null).pop()?.totalSum).toBe(0);
      expect(buildSumNumbersStage2BfsSteps(null).pop()?.totalSum).toBe(0);
      expect(buildSumNumbersStage3StackSteps(null).pop()?.totalSum).toBe(0);
    });
  });

  // 13. Minimum Depth of Binary Tree (LC 111 / Class 036)
  describe('13. Minimum Depth of Binary Tree (LeetCode 111 / Class 036 · 二叉树的最小深度)', () => {
    it('Stage 1: 经典树 [3, 9, 20, null, null, 15, 7] 后序递归特判返回 2 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildMinDepthStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MIN_DEPTH_STAGE1_CODES, `MinDepth Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.minDepth).toBe(2);
    });

    it('Stage 1 避坑测试: 单侧斜链 [1, 2] 最小深度必须为 2 而非 1', () => {
      const root = buildTreeFromArr([1, 2]);
      const steps = buildMinDepthStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].minDepth).toBe(2);
    });

    it('Stage 1 避坑测试: 单侧右斜长链 [2, null, 3, null, 4, null, 5, null, 6] 最小深度为 5', () => {
      const root = buildTreeFromArr([2, null, 3, null, 4, null, 5, null, 6]);
      const steps = buildMinDepthStage1Steps(root);
      expect(steps[steps.length - 1].minDepth).toBe(5);
    });

    it('Stage 2: BFS 层序最短路遇首个叶子提前终止返回 2 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildMinDepthStage2BfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MIN_DEPTH_STAGE2_CODES, `MinDepth Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.minDepth).toBe(2);
    });

    it('Stage 3: 静态数组模拟队列 (Static Array Queue BFS) 提前终止返回 2 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildMinDepthStage3StaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MIN_DEPTH_STAGE3_CODES, `MinDepth Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.minDepth).toBe(2);
      expect(last.staticQueueState).toBeDefined();
    });

    it('三大 Stage 对空树统一安全返回 0', () => {
      expect(buildMinDepthStage1Steps(null).pop()?.minDepth).toBe(0);
      expect(buildMinDepthStage2BfsSteps(null).pop()?.minDepth).toBe(0);
      expect(buildMinDepthStage3StaticArraySteps(null).pop()?.minDepth).toBe(0);
      expect(buildMinDepthSteps(null).pop()?.minDepth).toBe(0);
    });
  });

  // 14. Balanced Binary Tree (LC 110 / Class 037 Code04)
  describe('14. Balanced Binary Tree (LeetCode 110 / Class 037 · 判断平衡二叉树)', () => {
    it('Stage 1: 经典平衡树 [3, 9, 20, null, null, 15, 7] 返回平衡 TRUE 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BALANCED_TREE_037_STAGE1_CODES, `Balanced Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.metrics?.['整树平衡判定']).toContain('TRUE');
    });

    it('Stage 1: 单侧偏斜非平衡树 [1, 2, 2, 3, 3, null, null, 4, 4] 判定失衡 FALSE', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const steps = buildBalancedStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].metrics?.['整树平衡判定']).toContain('FALSE');
    });

    it('Stage 2: 剪枝返回值复用优化 (-1 标记) 快速判定平衡与失衡且四语言行号合法', () => {
      const balRoot = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const balSteps = buildBalancedStage2PruneSteps(balRoot);
      expect(balSteps.length).toBeGreaterThan(0);
      for (let i = 0; i < balSteps.length; i++) {
        assertCodeLineWithinBounds(balSteps[i].codeLine, BALANCED_TREE_037_STAGE2_CODES, `Balanced Stage 2 Step ${i}`);
      }
      expect(balSteps[balSteps.length - 1].metrics?.['整树平衡判定']).toContain('TRUE');

      const unbalRoot = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const unbalSteps = buildBalancedStage2PruneSteps(unbalRoot);
      expect(unbalSteps.length).toBeGreaterThan(0);
      expect(unbalSteps[unbalSteps.length - 1].metrics?.['整树平衡判定']).toContain('FALSE');
    });

    it('Stage 3: 显式后序遍历与深度表映射 (零递归栈) 步骤与四语言行号合法', () => {
      const balRoot = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const balSteps = buildBalancedStage3StackSteps(balRoot);
      expect(balSteps.length).toBeGreaterThan(0);
      for (let i = 0; i < balSteps.length; i++) {
        assertCodeLineWithinBounds(balSteps[i].codeLine, BALANCED_TREE_037_STAGE3_CODES, `Balanced Stage 3 Step ${i}`);
      }
      expect(balSteps[balSteps.length - 1].metrics?.['整树平衡判定']).toContain('TRUE');

      const unbalRoot = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const unbalSteps = buildBalancedStage3StackSteps(unbalRoot);
      expect(unbalSteps.length).toBeGreaterThan(0);
      expect(unbalSteps[unbalSteps.length - 1].metrics?.['整树平衡判定']).toContain('FALSE');
    });

    it('三大 Stage 对空树与单节点树统一安全返回 TRUE', () => {
      expect(buildBalancedStage1Steps(null).pop()?.metrics?.['整树平衡判定']).toContain('TRUE');
      expect(buildBalancedStage2PruneSteps(null).pop()?.metrics?.['整树平衡判定']).toContain('TRUE');
      expect(buildBalancedStage3StackSteps(null).pop()?.metrics?.['整树平衡判定']).toContain('TRUE');
      expect(buildBalancedTree037Steps('[]').pop()?.metrics?.['整树平衡判定']).toContain('TRUE');

      const single = buildTreeFromArr([1]);
      expect(buildBalancedStage1Steps(single).pop()?.metrics?.['整树平衡判定']).toContain('TRUE');
      expect(buildBalancedStage2PruneSteps(single).pop()?.metrics?.['整树平衡判定']).toContain('TRUE');
      expect(buildBalancedStage3StackSteps(single).pop()?.metrics?.['整树平衡判定']).toContain('TRUE');
      expect(buildBalancedTree037Steps('1').pop()?.metrics?.['整树平衡判定']).toContain('TRUE');
    });
  });

  // 15. Sum of Left Leaves (LC 404 · 左叶子之和)
  describe('15. Sum of Left Leaves (LeetCode 404 · 左叶子之和)', () => {
    it('Stage 1: 经典树 [3, 9, 20, null, null, 15, 7] 返回左叶子之和 24 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildLeftLeavesStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LEFT_LEAVES_STAGE1_CODES, `LeftLeaves Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.sum).toBe(24);
      expect(last.metrics?.['左叶子之和']).toBe(24);
    });

    it('Stage 1 避坑测试: 单节点树 [1] 根非左叶子，左叶子之和必须严格为 0', () => {
      const root = buildTreeFromArr([1]);
      const steps = buildLeftLeavesStage1Steps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].sum).toBe(0);
      expect(steps[steps.length - 1].metrics?.['左叶子之和']).toBe(0);
    });

    it('Stage 2: BFS 层序队列广搜返回左叶子之和 24 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildLeftLeavesStage2BfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LEFT_LEAVES_STAGE2_CODES, `LeftLeaves Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.sum).toBe(24);
      expect(last.metrics?.['左叶子之和']).toBe(24);
    });

    it('Stage 3: 显式迭代栈模拟前序 DFS 返回左叶子之和 24 且四语言行号合法', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildLeftLeavesStage3StackSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, LEFT_LEAVES_STAGE3_CODES, `LeftLeaves Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.sum).toBe(24);
      expect(last.metrics?.['左叶子之和']).toBe(24);
    });

    it('三大 Stage 对空树统一安全返回 0', () => {
      expect(buildLeftLeavesStage1Steps(null).pop()?.sum).toBe(0);
      expect(buildLeftLeavesStage2BfsSteps(null).pop()?.sum).toBe(0);
      expect(buildLeftLeavesStage3StackSteps(null).pop()?.sum).toBe(0);
      expect(buildLeftLeavesSteps(null).pop()?.sum).toBe(0);
    });
  });

  // 16. Binary Tree Paths (LC 257 · 二叉树的所有路径)
  describe('16. Binary Tree Paths (LeetCode 257 · 二叉树的所有路径)', () => {
    it('Stage 1: 经典二叉树 [1, 2, 3, null, 5] 回溯收集路径 ["1->2->5", "1->3"] 且四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, null, 5]);
      const steps = buildAllPathsStage1BacktrackSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, ALL_PATHS_STAGE1_CODES, `AllPaths Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.allPaths).toEqual(['1->2->5', '1->3']);
      expect(last.metrics?.['已收集路径数']).toBe(2);
    });

    it('Stage 1 边界测试: 单节点树 [1] 自身为叶子，输出单一路径 ["1"]', () => {
      const root = buildTreeFromArr([1]);
      const steps = buildAllPathsStage1BacktrackSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].allPaths).toEqual(['1']);
    });

    it('Stage 2: 纯函数递归不可变字符串传递收集路径 ["1->2->5", "1->3"] 且四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, null, 5]);
      const steps = buildAllPathsStage2FunctionalSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, ALL_PATHS_STAGE2_CODES, `AllPaths Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.allPaths).toEqual(['1->2->5', '1->3']);
      expect(last.metrics?.['已收集路径数']).toBe(2);
    });

    it('Stage 3: BFS 双队列层序遍历收集路径 ["1->2->5", "1->3"] 且四语言行号合法', () => {
      const root = buildTreeFromArr([1, 2, 3, null, 5]);
      const steps = buildAllPathsStage3BfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, ALL_PATHS_STAGE3_CODES, `AllPaths Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.allPaths.slice().sort()).toEqual(['1->2->5', '1->3'].sort());
      expect(last.metrics?.['已收集路径数']).toBe(2);
    });

    it('三大 Stage 对空树统一安全返回空列表 []', () => {
      expect(buildAllPathsStage1BacktrackSteps(null).pop()?.allPaths).toEqual([]);
      expect(buildAllPathsStage2FunctionalSteps(null).pop()?.allPaths).toEqual([]);
      expect(buildAllPathsStage3BfsSteps(null).pop()?.allPaths).toEqual([]);
      expect(buildAllPathsSteps(null).pop()?.allPaths).toEqual([]);
    });
  });

  // 17. Find Bottom Left Tree Value (LC 513 · 找树左下角的值)
  describe('17. Find Bottom Left Tree Value (LeetCode 513 · 找树左下角的值)', () => {
    it('Stage 1: 经典二叉树 [2, 1, 3] 先序 DFS 搜索返回左下角值 1 且四语言行号合法', () => {
      const root = buildTreeFromArr([2, 1, 3]);
      const steps = buildBottomLeftStage1PreorderSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BOTTOM_LEFT_STAGE1_CODES, `BottomLeft Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.bottomLeft).toBe(1);
      expect(last.maxDepth).toBe(1);
    });

    it('Stage 1 深度测试: 复杂树 [1, 2, 3, 4, null, 5, 6, null, null, 7] 返回最深层最左值 7', () => {
      const root = buildTreeFromArr([1, 2, 3, 4, null, 5, 6, null, null, 7]);
      const steps = buildBottomLeftStage1PreorderSteps(root);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].bottomLeft).toBe(7);
      expect(steps[steps.length - 1].maxDepth).toBe(3);
    });

    it('Stage 2: 标准层序 BFS 队列分层捕获返回左下角值 1 且四语言行号合法', () => {
      const root = buildTreeFromArr([2, 1, 3]);
      const steps = buildBottomLeftStage2BfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BOTTOM_LEFT_STAGE2_CODES, `BottomLeft Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.bottomLeft).toBe(1);
    });

    it('Stage 3: 逆向右先层序 BFS (终节点即答案) 返回左下角值 1 且四语言行号合法', () => {
      const root = buildTreeFromArr([2, 1, 3]);
      const steps = buildBottomLeftStage3ReverseBfsSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BOTTOM_LEFT_STAGE3_CODES, `BottomLeft Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.bottomLeft).toBe(1);
    });

    it('Stage 3 逆向 BFS 检验深度右偏链 [1, null, 2, null, 3, null, 4] 返回 4', () => {
      const root = buildTreeFromArr([1, null, 2, null, 3, null, 4]);
      expect(buildBottomLeftStage3ReverseBfsSteps(root).pop()?.bottomLeft).toBe(4);
    });

    it('三大 Stage 对空树统一安全返回 0', () => {
      expect(buildBottomLeftStage1PreorderSteps(null).pop()?.bottomLeft).toBe(0);
      expect(buildBottomLeftStage2BfsSteps(null).pop()?.bottomLeft).toBe(0);
      expect(buildBottomLeftStage3ReverseBfsSteps(null).pop()?.bottomLeft).toBe(0);
      expect(buildBottomLeftSteps(null).pop()?.bottomLeft).toBe(0);
    });
  });

  // ══════════════════════════════════════════════════════════
  // Section 18: 最大二叉树 (Maximum Binary Tree - LeetCode 654)
  // ══════════════════════════════════════════════════════════
  describe('🌲 Section 18: 最大二叉树三大阶段演化与笛卡尔树线性不变性', () => {
    const nums = [3, 2, 1, 6, 0, 5];

    it('Stage 1: 递归分治与区间扫描正确构建最大二叉树且四语言行号合法', () => {
      const steps = buildMaxTreeStage1Steps(nums);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MAX_TREE_STAGE1_CODES, `MaxTree Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.tree).not.toBeNull();
      expect(last.tree!.val).toBe(6);
      expect(last.tree!.left!.val).toBe(3);
      expect(last.tree!.right!.val).toBe(5);
    });

    it('Stage 2: 单调栈 O(N) 笛卡尔树构建且四语言行号合法', () => {
      const steps = buildMaxTreeStage2StackSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MAX_TREE_STAGE2_CODES, `MaxTree Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.tree).not.toBeNull();
      expect(last.tree!.val).toBe(6);
      expect(last.tree!.left!.val).toBe(3);
      expect(last.tree!.right!.val).toBe(5);
    });

    it('Stage 3: 显式任务栈迭代构建且四语言行号合法', () => {
      const steps = buildMaxTreeStage3IterativeSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, MAX_TREE_STAGE3_CODES, `MaxTree Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.tree).not.toBeNull();
      expect(last.tree!.val).toBe(6);
      expect(last.tree!.left!.val).toBe(3);
      expect(last.tree!.right!.val).toBe(5);
    });

    it('三大 Stage 对递增序列 [1, 2, 3, 4] 根节点统一为 4', () => {
      const incNums = [1, 2, 3, 4];
      const root1 = buildMaxTreeStage1Steps(incNums).pop()?.tree;
      const root2 = buildMaxTreeStage2StackSteps(incNums).pop()?.tree;
      const root3 = buildMaxTreeStage3IterativeSteps(incNums).pop()?.tree;

      expect(root1?.val).toBe(4);
      expect(root2?.val).toBe(4);
      expect(root3?.val).toBe(4);
    });

    it('三大 Stage 对空数组统一安全返回 null', () => {
      expect(buildMaxTreeStage1Steps([]).pop()?.tree).toBeNull();
      expect(buildMaxTreeStage2StackSteps([]).pop()?.tree).toBeNull();
      expect(buildMaxTreeStage3IterativeSteps([]).pop()?.tree).toBeNull();
      expect(buildMaxTreeSteps([]).pop()?.tree).toBeNull();
    });
  });

  // 17. 从前序/后序与中序构造二叉树 (LC 105 & 106)
  describe('17. 从前序/后序与中序遍历构造二叉树 (Build Tree LC 105 & 106)', () => {
    const pre = [3, 9, 20, 15, 7];
    const inArr = [9, 3, 15, 20, 7];
    const post = [9, 15, 7, 20, 3];

    it('Stage 1 (LC 105): 前序+中序分治切分递归四语言行号合法且收尾步全树翡翠绿高亮', () => {
      const steps = buildTreeSteps(pre, inArr);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BUILD_TREE_STAGE1_PRE_IN_CODE, `BuildTree Stage 1 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
      expect(last.highlightedNodes).toEqual([3]);
      expect(last.visitedNodes?.sort((a, b) => a - b)).toEqual([3, 7, 9, 15, 20]);
    });

    it('Stage 2 (LC 106): 后序+中序分治切分递归四语言行号合法且收尾步全树翡翠绿高亮', () => {
      const steps = buildTreeStage2PostorderSteps(inArr, post);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BUILD_TREE_STAGE2_POST_IN_CODE, `BuildTree Stage 2 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(3);
      expect(last.tree?.left?.val).toBe(9);
      expect(last.tree?.right?.val).toBe(20);
      expect(last.highlightedNodes).toEqual([3]);
      expect(last.visitedNodes?.sort((a, b) => a - b)).toEqual([3, 7, 9, 15, 20]);
    });

    it('Stage 3 (LC 105 迭代法): 显式栈模拟前序重构四语言行号合法且收尾步全树翡翠绿高亮', () => {
      const steps = buildTreeStage3StackSteps(pre, inArr);
      expect(steps.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        assertCodeLineWithinBounds(steps[i].codeLine, BUILD_TREE_STAGE3_STACK_CODE, `BuildTree Stage 3 Step ${i}`);
      }

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.tree?.val).toBe(3);
      expect(last.highlightedNodes).toEqual([3]);
      expect(last.visitedNodes?.sort((a, b) => a - b)).toEqual([3, 7, 9, 15, 20]);
    });

    it('三大 Stage 针对空数组均安全防御', () => {
      expect(buildTreeSteps([], []).pop()?.action).toBe('done');
      expect(buildTreeStage2PostorderSteps([], []).pop()?.action).toBe('done');
      expect(buildTreeStage3StackSteps([], []).pop()?.action).toBe('done');
    });
  });
});




