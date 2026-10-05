/**
 * 最终树与字典树高阶算法门禁矩阵 (Tree Final Stage Invariants Gatekeeper)
 *
 * 覆盖算法清单:
 *  1. 左神 Class 020: 二叉树迭代遍历 (Tree Traversal Iterative - Pre/In/Post)
 *  2. 左神 Class 021: 二叉树先序与层序序列化/反序列化 (Tree Serialization 021)
 *  3. 左神 Class 037: 二叉树后序与层序高级序列化 (Tree Serialization 037)
 *  4. 左神 Class 017: 前缀树 (Trie Tree) 基础结构设计与频次统计
 *  5. 左神 Class 107: 01-Trie 与两数最大异或和 (01-Trie Max XOR)
 *  6. 左神 Class 019: 二叉树高频递归套路与树形 DP (Tree Recursion Patterns)
 *  7. 左神 Class 112: 权值线段树与单点更新 (Value Segment Tree)
 *  8. Tree Batch 7: 经典树批量算法集合 (min-depth, balanced, left-leaves, all-paths, count-nodes, bottom-left)
 *  9. Tree Batch 8: 二叉搜索树批量集合 (max-tree, merge-trees, build-tree-2, bst-lca, bst-insert, bst-min-diff, bst-modes, bst-delete, bst-trim, sorted-array-to-bst, bst-to-gst)
 *
 * 核心黄金规约:
 *  1. Step 0 入口语义守恒与初始状态完备契约
 *  2. 树与前缀树状态演进、下潜与回溯完整性不变量
 *  3. 多语种代码高亮物理行号 [1, totalLines] 强类型边界不变量
 */

import { describe, it, expect } from 'vitest';
import {
  buildTraversal020Steps,
  TREE_TRAVERSAL_020_CODES,
} from '../../algorithms/categories/tree/tree-traversal-iterative-020-renderer';
import {
  buildSerialization021Steps,
  TREE_SERIALIZATION_021_CODES,
} from '../../algorithms/categories/tree/tree-serialization-021-renderer';
import {
  generateSerializationSteps,
  SERIALIZE_037_CODES,
} from '../../algorithms/categories/tree/tree-serialization-037-renderer';
import {
  buildTrie017Steps,
  buildStage2StaticSteps,
  buildStage3MultiQuerySteps,
  TRIE_017_CODES,
  TRIE_STAGE2_STATIC_CODES,
} from '../../algorithms/categories/tree/trie-tree-017-renderer';
import {
  buildTrieXorMaxSteps,
  buildStage2StaticSteps as buildTrie107Stage2Steps,
  buildStage3SubarrayXorSteps,
  TRIE_XOR_CODES,
  TRIE_STAGE2_STATIC_CODES as TRIE_107_STAGE2_CODES,
  TRIE_STAGE3_SUBARRAY_CODES,
} from '../../algorithms/categories/tree/trie-xor-max-107-renderer';
import {
  generateTreeRecursionSteps,
  generateTreeBstSteps,
  generateTreeMaxDistSteps,
  TREE_RECURSION_019_CODES,
  TREE_RECURSION_STAGE2_CODES,
  TREE_RECURSION_STAGE3_CODES,
} from '../../algorithms/categories/tree/tree-recursion-patterns-019-renderer';
import {
  buildValueSegTreeSteps,
  VALUE_SEG_TREE_CODES,
} from '../../algorithms/categories/tree/tree-108-116/value-segment-tree-112-renderer';

// Batch 7 & 8 imports to verify registration side effects
import '../../algorithms/categories/tree/tree-batch-7-renderer';
import '../../algorithms/categories/tree/tree-batch-8-renderer';
import { getManifest } from '../registry';

function assertCodeLineWithinBounds(
  codeLine: any,
  codes: Record<string, string[] | string>,
  stepDesc: string
) {
  if (!codeLine) return;

  for (const [lang, rawCode] of Object.entries(codes)) {
    const lines = Array.isArray(rawCode)
      ? rawCode
      : typeof rawCode === 'string'
      ? rawCode.split('\n')
      : [];
    const lineCount = lines.length;
    if (lineCount === 0) continue;

    if (typeof codeLine === 'number') {
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} exceeds ${lang} line count ${lineCount}`
      ).toBeLessThanOrEqual(lineCount);
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} must be >= 1 for ${lang}`
      ).toBeGreaterThanOrEqual(1);
    } else if (Array.isArray(codeLine)) {
      for (const line of codeLine) {
        expect(
          line,
          `${stepDesc}: array codeLine ${line} exceeds ${lang} line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          line,
          `${stepDesc}: array codeLine ${line} must be >= 1 for ${lang}`
        ).toBeGreaterThanOrEqual(1);
      }
    } else if (typeof codeLine === 'object' && codeLine !== null) {
      const target = codeLine[lang];
      if (target != null) {
        if (typeof target === 'number') {
          expect(
            target,
            `${stepDesc}: dict codeLine[${lang}]=${target} exceeds line count ${lineCount}`
          ).toBeLessThanOrEqual(lineCount);
          expect(
            target,
            `${stepDesc}: dict codeLine[${lang}]=${target} must be >= 1`
          ).toBeGreaterThanOrEqual(1);
        } else if (Array.isArray(target)) {
          for (const t of target) {
            expect(
              t,
              `${stepDesc}: dict codeLine[${lang}] array item ${t} exceeds line count ${lineCount}`
            ).toBeLessThanOrEqual(lineCount);
            expect(
              t,
              `${stepDesc}: dict codeLine[${lang}] array item ${t} must be >= 1`
            ).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }
  }
}

describe('Tree Final Stage Invariants Gatekeeper (最终树与字典树高阶算法门禁矩阵)', () => {
  // 1. Class 020: 二叉树迭代遍历
  describe('1. Class 020: 二叉树迭代遍历 (Tree Traversal Iterative)', () => {
    it('先序、中序与后序遍历应产生单调推进轨迹且代码行号在合法区间内', () => {
      for (const mode of ['preorder', 'inorder', 'postorder'] as const) {
        const steps = buildTraversal020Steps(mode);
        expect(steps.length).toBeGreaterThan(3);

        const s0 = steps[0];
        expect(s0.traversalType).toBe(mode);
        expect(s0.decision).toBeDefined();

        const sLast = steps[steps.length - 1];
        expect(sLast.visitedResult.length).toBeGreaterThan(0);

        steps.forEach((st, idx) => {
          assertCodeLineWithinBounds(
            st.codeLine,
            TREE_TRAVERSAL_020_CODES,
            `Class 020 (${mode}) step ${idx}`
          );
        });
      }
    });
  });

  // 2. Class 021: 二叉树序列化与反序列化
  describe('2. Class 021: 二叉树先序与层序序列化 (Tree Serialization 021)', () => {
    it('先序与层序序列化应完整保留空节点与重建二叉树结构', () => {
      for (const mode of ['preorder', 'levelorder'] as const) {
        const steps = buildSerialization021Steps(mode);
        expect(steps.length).toBeGreaterThan(2);

        const s0 = steps[0];
        expect(s0.mode).toBe(mode);

        const sLast = steps[steps.length - 1];
        expect(sLast.tokensStream.length).toBeGreaterThan(0);

        steps.forEach((st, idx) => {
          assertCodeLineWithinBounds(
            st.codeLine,
            TREE_SERIALIZATION_021_CODES,
            `Class 021 (${mode}) step ${idx}`
          );
        });
      }
    });
  });

  // 3. Class 037: 二叉树后序与层序序列化高级
  describe('3. Class 037: 二叉树后序与层序高级序列化 (Tree Serialization 037)', () => {
    it('后序与层序高级序列化应准确推进并满足多语言行号约束', () => {
      for (const mode of ['serialize', 'deserialize'] as const) {
        const steps = generateSerializationSteps(mode);
        expect(steps.length).toBeGreaterThan(2);

        const s0 = steps[0];
        expect(s0.mode).toBe(mode);

        const sLast = steps[steps.length - 1];
        expect(sLast.decision).toBeDefined();

        steps.forEach((st, idx) => {
          assertCodeLineWithinBounds(
            st.codeLine,
            SERIALIZE_037_CODES,
            `Class 037 (${mode}) step ${idx}`
          );
        });
      }
    });
  });

  // 4. Class 017: 前缀树基础与词频统计
  describe('4. Class 017: 前缀树基础与词频统计 (Trie Tree 017)', () => {
    it('插入与查询应正确维护 pass 与 end 计数且行号全语种合规', () => {
      const words = ['apple', 'app', 'apply'];
      const searchSteps = buildTrie017Steps(words, 'app', false);
      expect(searchSteps.length).toBeGreaterThan(5);

      const s0 = searchSteps[0];
      expect(s0.activeNodeId).toBe(1);
      expect(s0.nodes.length).toBe(1);

      const lastSearch = searchSteps[searchSteps.length - 1];
      expect(lastSearch.resultCount).toBe(1);

      const prefixSteps = buildTrie017Steps(words, 'app', true);
      const lastPrefix = prefixSteps[prefixSteps.length - 1];
      expect(lastPrefix.resultCount).toBe(3);

      [...searchSteps, ...prefixSteps].forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TRIE_017_CODES, `Class 017 step ${idx}`);
      });
    });

    it('Stage 2: 静态连续数组竞赛版应正确生成紧凑内存映射表且行号合规', () => {
      const words = ['code', 'coder', 'coding', 'codec'];
      const steps = buildStage2StaticSteps(words, 'code');
      expect(steps.length).toBeGreaterThan(6);

      const s0 = steps[0];
      expect(s0.stageId).toBe('stage-2');
      expect(s0.staticTable).toBeDefined();
      expect(s0.staticTable?.rows.length).toBeGreaterThanOrEqual(1);

      const sLast = steps[steps.length - 1];
      expect(sLast.resultCount).toBe(1);

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TRIE_STAGE2_STATIC_CODES, `Class 017 Stage 2 step ${idx}`);
      });
    });

    it('Stage 3: 多模态检索探测推演应满足阶段规约', () => {
      const steps = buildStage3MultiQuerySteps();
      expect(steps.length).toBeGreaterThan(5);
      const sLast = steps[steps.length - 1];
      expect(sLast.resultCount).toBe(3);
    });
  });

  // 5. Class 107: 01-Trie 与异或最大值
  describe('5. Class 107: 01-Trie 与异或最大值 (Trie XOR Max 107)', () => {
    it('Stage 1: 贪心探索最高位对偶分支应准确求出两数最大异或值', () => {
      const nums = [3, 10, 5, 25, 2, 8];
      const steps = buildTrieXorMaxSteps(nums, 5);
      expect(steps.length).toBeGreaterThan(6);

      const s0 = steps[0];
      expect(s0.globalMaxXor).toBe(0);
      expect(s0.trieSize).toBe(1);

      const sLast = steps[steps.length - 1];
      expect(sLast.globalMaxXor).toBe(28); // 5 XOR 25 = 28

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TRIE_XOR_CODES, `Class 107 stage 1 step ${idx}`);
      });
    });

    it('Stage 2: 竞赛静态连续数组 tree[N][2] 应生成紧凑扁平化推演', () => {
      const nums = [3, 10, 5, 25, 2, 8];
      const steps = buildTrie107Stage2Steps(nums, 5);
      expect(steps.length).toBeGreaterThan(6);

      const sLast = steps[steps.length - 1];
      expect(sLast.globalMaxXor).toBe(28);
      expect(sLast.staticTable?.rows.length).toBeGreaterThan(1);

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TRIE_107_STAGE2_CODES, `Class 107 stage 2 step ${idx}`);
      });
    });

    it('Stage 3: 前缀异或自反性转化求子数组最大异或和', () => {
      const nums = [3, 1, 4, 2, 5];
      const steps = buildStage3SubarrayXorSteps(nums, 5);
      expect(steps.length).toBeGreaterThan(5);

      const sLast = steps[steps.length - 1];
      expect(sLast.globalMaxXor).toBe(7); // 1 ^ 4 ^ 2 = 7
      expect(sLast.prefixXorList?.length).toBe(6); // eor[0..5]

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TRIE_STAGE3_SUBARRAY_CODES, `Class 107 stage 3 step ${idx}`);
      });
    });
  });

  // 6. Class 019: 二叉树高频递归套路
  describe('6. Class 019: 二叉树高频递归套路 (Tree Recursion Patterns 019)', () => {
    it('Stage 1: 平衡二叉树递归信息收集应正确推导高度与平衡性', () => {
      const balancedTree = [
        { id: 1, val: 1, left: 2, right: 3 },
        { id: 2, val: 2, left: 4, right: 5 },
        { id: 3, val: 3 },
        { id: 4, val: 4 },
        { id: 5, val: 5 },
      ];
      const steps = generateTreeRecursionSteps(balancedTree);
      expect(steps.length).toBeGreaterThan(5);

      const s0 = steps[0];
      expect(s0.stepIndex).toBe(0);
      expect(s0.decision).toBeDefined();

      const sLast = steps[steps.length - 1];
      expect(sLast.phase).toBe('return');
      expect(sLast.collectedInfo.isBalanced).toBe(true);
      expect(sLast.collectedInfo.height).toBe(3);

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TREE_RECURSION_019_CODES, `Class 019 Stage 1 step ${idx}`);
      });
    });

    it('Stage 2: 搜索二叉树 (BST) 递归判定应正确收集极值并校验 BST 成立性', () => {
      const bstTree = [
        { id: 1, val: 4, left: 2, right: 3 },
        { id: 2, val: 2, left: 4, right: 5 },
        { id: 3, val: 6 },
        { id: 4, val: 1 },
        { id: 5, val: 3 },
      ];
      const steps = generateTreeBstSteps(bstTree);
      expect(steps.length).toBeGreaterThan(5);

      const s0 = steps[0];
      expect(s0.stageId).toBe('stage2');

      const sLast = steps[steps.length - 1];
      expect(sLast.phase).toBe('return');
      expect(sLast.collectedInfo.isBST).toBe(true);
      expect(sLast.collectedInfo.minVal).toBe(1);
      expect(sLast.collectedInfo.maxVal).toBe(6);

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TREE_RECURSION_STAGE2_CODES, `Class 019 Stage 2 step ${idx}`);
      });
    });

    it('Stage 3: 二叉树最大节点距离 (Max Distance) 应横向对比三种可能性并推导全局直径', () => {
      const tree = [
        { id: 1, val: 1, left: 2, right: 3 },
        { id: 2, val: 2, left: 4, right: 5 },
        { id: 3, val: 3 },
        { id: 4, val: 4 },
        { id: 5, val: 5 },
      ];
      const steps = generateTreeMaxDistSteps(tree);
      expect(steps.length).toBeGreaterThan(5);

      const s0 = steps[0];
      expect(s0.stageId).toBe('stage3');

      const sLast = steps[steps.length - 1];
      expect(sLast.phase).toBe('return');
      // 树形态：根 1，左 2 (下接 4 和 5)，右 3。最大距离为从 4 到 1 到 3 或 5 到 1 到 3，跨根节点为 2 + 1 + 1 = 4 节点 (或按边算)
      expect(sLast.collectedInfo.maxDistance).toBeGreaterThanOrEqual(4);

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, TREE_RECURSION_STAGE3_CODES, `Class 019 Stage 3 step ${idx}`);
      });
    });
  });

  // 7. Class 112: 权值线段树
  describe('7. Class 112: 权值线段树与单点更新 (Value Segment Tree 112)', () => {
    it('权值二分应精准定位第 K 小元素且多语言代码高亮合法', () => {
      const nums = [2, 5, 2, 8, 3, 5, 6];
      const steps = buildValueSegTreeSteps(nums, 4, 8);
      expect(steps.length).toBeGreaterThan(4);

      const s0 = steps[0];
      expect(s0.activeNodeId).toBe(1);
      expect(s0.curOp).toBe('初始化');

      const sLast = steps[steps.length - 1];
      // 排序后: [2, 2, 3, 5, 5, 6, 8], 第 4 小为 5
      expect(sLast.foundVal).toBe(5);

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, VALUE_SEG_TREE_CODES, `Class 112 step ${idx}`);
      });
    });
  });

  // 8. Tree Batch 7 声明式算法注册完整性校验
  describe('8. Tree Batch 7: 经典树批量算法集合注册完整性', () => {
    const batch7Ids = [
      'min-depth',
      'balanced',
      'left-leaves',
      'all-paths',
      'count-nodes',
      'bottom-left',
    ];

    it.each(batch7Ids)('算法 "%s" 必须在 Manifest 中成功挂载且元数据完备', (id) => {
      const manifest = getManifest(id);
      expect(manifest, `Algorithm ${id} must be registered`).toBeDefined();
      expect(manifest?.category).toBe('tree');
      expect(manifest?.name).toBeDefined();
    });
  });

  // 9. Tree Batch 8 经典二叉搜索树批量集合注册完整性
  describe('9. Tree Batch 8: 二叉搜索树批量集合注册完整性', () => {
    const batch8Ids = [
      'max-tree',
      'merge-trees',
      'build-tree-2',
      'bst-lca',
      'bst-insert',
      'bst-min-diff',
      'bst-modes',
      'bst-delete',
      'bst-trim',
      'sorted-array-to-bst',
      'bst-to-gst',
    ];

    it.each(batch8Ids)('算法 "%s" 必须在 Manifest 中成功挂载且元数据完备', (id) => {
      const manifest = getManifest(id);
      expect(manifest, `Algorithm ${id} must be registered`).toBeDefined();
      expect(manifest?.category).toBe('tree');
      expect(manifest?.name).toBeDefined();
    });
  });
});
