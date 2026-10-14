// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  BinaryTreeTraversalCompiler,
  BinaryTreeStep,
} from './binary-tree-traversal-compiler';
import { buildTreeFromArr, TreeNode } from '../../../algorithms/categories/tree/tree-template';

describe('BinaryTreeTraversalCompiler (Deep Module Core Verification)', () => {
  describe('DFS Traversal Engine', () => {
    it('null root yields standard 3-step baseline sequence with CallTrace', () => {
      const steps = BinaryTreeTraversalCompiler.compileDfs<TreeNode, number>({
        root: null,
        funcName: 'maxDepth',
        onBaseNull: () => ({
          result: 0,
          decision: '空节点深度为 0',
          codeLine: 2,
        }),
        onCombine: (_n, l, r) => ({
          result: Math.max(l, r) + 1,
          decision: '合并',
          message: '合并',
          log: 'combine',
        }),
      });

      expect(steps.length).toBe(3);
      expect(steps[0].action).toBe('entry');
      expect(steps[1].action).toBe('base-check');
      expect(steps[2].action).toBe('done');
      expect(steps[2].result).toBe(0);
      expect(steps[0].callTrace?.lines.length).toBeGreaterThan(0);
    });

    it('computes correct max depth and generates full 5-stage lifecycle steps', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = BinaryTreeTraversalCompiler.compileDfs<TreeNode, number>({
        root,
        funcName: 'maxDepth',
        onBaseNull: () => ({
          result: 0,
          decision: 'null 节点深度返回 0',
        }),
        onEnter: (node) => ({
          decision: `访问节点 ${node.val}`,
        }),
        beforeLeft: (node) => ({
          decision: `深入左子树`,
        }),
        beforeRight: (node, leftRes) => ({
          decision: `左子树就绪=${leftRes}，深入右子树`,
        }),
        onCombine: (node, leftRes, rightRes) => ({
          result: Math.max(leftRes, rightRes) + 1,
          decision: `节点 ${node.val} 最大深度为 max(${leftRes}, ${rightRes}) + 1 = ${Math.max(leftRes, rightRes) + 1}`,
          message: `合并结果`,
          log: `combine(${node.val})`,
        }),
      });

      expect(steps.length).toBeGreaterThan(10);
      const doneStep = steps[steps.length - 1];
      expect(doneStep.action).toBe('done');
      expect(doneStep.result).toBe(3);

      // 验证每一步都具备快照
      steps.forEach((s) => {
        expect(s.callTrace).toBeDefined();
        expect(s.decision).toBeTruthy();
      });
    });

    it('supports onBaseLeaf early return without delving into null children', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = BinaryTreeTraversalCompiler.compileDfs<TreeNode, number>({
        root,
        funcName: 'leafSum',
        onBaseNull: () => ({ result: 0 }),
        onBaseLeaf: (node) => ({
          hit: !node.left && !node.right,
          result: node.val,
          decision: `叶节点 ${node.val} 直接返回值`,
        }),
        onCombine: (_n, l, r) => ({
          result: l + r,
          decision: 'sum',
          message: 'sum',
          log: 'sum',
        }),
      });

      const leafSteps = steps.filter((s) => s.action === 'base-leaf');
      expect(leafSteps.length).toBe(2); // 节点 2 和 3 是叶子
      const doneStep = steps[steps.length - 1];
      expect(doneStep.result).toBe(5); // 2 + 3
    });

    it('supports onPruneCheck to prune right branch when left branch triggers threshold', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      let prunedCount = 0;

      const steps = BinaryTreeTraversalCompiler.compileDfs<TreeNode, number>({
        root,
        funcName: 'prunedDfs',
        onBaseNull: () => ({ result: 0 }),
        onPruneCheck: (_node, branch, branchRes) => {
          if (branch === 'left' && branchRes === -1) {
            prunedCount++;
            return { shouldPrune: true, result: -1, decision: '左分支失衡，立即剪枝' };
          }
          return { shouldPrune: false, result: branchRes };
        },
        onCombine: (node) => ({
          result: node.val === 2 ? -1 : 1,
          decision: 'combine',
          message: 'combine',
          log: 'combine',
        }),
      });

      expect(steps.some((s) => s.action === 'prune')).toBe(true);
      expect(steps[steps.length - 1].result).toBe(-1);
    });
  });

  describe('BFS Level Order Traversal Engine', () => {
    it('null root delegates to onEmpty', () => {
      const steps = BinaryTreeTraversalCompiler.compileBfs<TreeNode, number>({
        root: null,
        onEmpty: () => ({
          result: 0,
          steps: [
            {
              tree: null,
              current: null,
              action: 'empty',
              decision: '空树BFS返回0',
              message: 'empty',
              log: 'empty',
            },
          ],
        }),
        onDone: (res) => ({
          tree: null,
          current: null,
          action: 'done',
          decision: `done: ${res}`,
          message: 'done',
          log: 'done',
        }),
      });

      expect(steps.length).toBe(1);
      expect(steps[0].action).toBe('empty');
    });

    it('traverses levels and calculates height accurately', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = BinaryTreeTraversalCompiler.compileBfs<TreeNode, number>({
        root,
        onInit: (ctx) => ({
          tree: root,
          current: 3,
          action: 'init',
          decision: 'BFS 初始化',
          message: 'init',
          log: 'init',
          queue: [...ctx.queueVals],
        }),
        onLevelStart: (ctx) => ({
          tree: root,
          current: null,
          action: 'level-start',
          decision: `第 ${ctx.levelIndex} 层开始`,
          message: 'level start',
          log: 'level start',
          queue: [...ctx.queueVals],
        }),
        onDone: (finalRes) => ({
          tree: root,
          current: 3,
          action: 'done',
          decision: `BFS 完成，层数 = ${finalRes}`,
          message: 'done',
          log: 'done',
          result: finalRes,
        }),
      });

      expect(steps.length).toBeGreaterThan(3);
      const doneStep = steps[steps.length - 1];
      expect(doneStep.result).toBe(3);
    });

    it('early exits on first leaf hit', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = BinaryTreeTraversalCompiler.compileBfs<TreeNode, number>({
        root,
        onLeafHit: (node, ctx) => {
          if (!node.left && !node.right) {
            return {
              earlyExit: true,
              result: ctx.levelIndex,
              step: {
                tree: root,
                current: node.val,
                action: 'leaf-exit',
                decision: `命中首个叶子节点 ${node.val}，最小深度为 ${ctx.levelIndex}`,
                message: 'leaf exit',
                log: 'leaf exit',
              },
            };
          }
          return { earlyExit: false };
        },
        onDone: (finalRes) => ({
          tree: root,
          current: null,
          action: 'done',
          decision: `完成: ${finalRes}`,
          message: 'done',
          log: 'done',
          result: finalRes,
        }),
      });

      const leafStep = steps.find((s) => s.action === 'leaf-exit');
      expect(leafStep).toBeDefined();
      expect(leafStep?.current).toBe(9); // 节点 9 是第一个叶子
      expect(steps[steps.length - 1].result).toBe(2);
    });
  });

  describe('Static Array Queue Simulation Engine', () => {
    it('accurately tracks window [l, r] on continuous array', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = BinaryTreeTraversalCompiler.compileStaticQueue<TreeNode, number>({
        root,
        onInit: (l, r) => ({
          tree: root,
          current: 1,
          action: 'init',
          decision: `静态队列初始化: l=${l}, r=${r}`,
          message: 'init',
          log: 'init',
        }),
        onDone: (finalRes, l, r) => ({
          tree: root,
          current: 1,
          action: 'done',
          decision: `静态队列求解完毕: 深度=${finalRes}, l=${l}, r=${r}`,
          message: 'done',
          log: 'done',
          result: finalRes,
        }),
      });

      expect(steps.length).toBeGreaterThan(1);
      const done = steps[steps.length - 1];
      expect(done.result).toBe(2);
    });
  });
});
