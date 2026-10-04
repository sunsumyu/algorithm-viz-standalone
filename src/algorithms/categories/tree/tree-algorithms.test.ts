import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from './tree-template';
import { buildTTSteps } from './tree-traversal-renderer';
import { buildVBSteps } from './valid-bst-renderer';
import { buildTSSteps } from './tree-symmetric-renderer';
import { buildTDSteps } from './tree-depth-renderer';
import { buildPSSteps } from './path-sum-renderer';
import { buildBTLSteps, buildStaticArrayLevelOrderSteps } from './binary-tree-level-renderer';
import { buildTreeInvertSteps } from './tree-invert-renderer';
import { buildBSTSearchSteps } from './bst-search-renderer';
import {
  buildTreeSteps,
  buildTreeStage2PostorderSteps,
  buildTreeStage3StackSteps,
} from './build-tree-renderer';
import { buildLCASteps } from './lca-renderer';

describe('Tree Algorithms Step Generation (二叉树核心算法推导测试)', () => {
  describe('Tree Traversal (前/中/后序遍历)', () => {
    it('1. 前序遍历 [1, 2, 3] 产生根左右顺序 [1, 2, 3]', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildTTSteps(root, 'pre');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([1, 2, 3]);
      expect(lastStep.message).toMatch(/前序（根左右）.*遍历完成/);
    });

    it('2. 中序遍历 [1, 2, 3] 产生左根右顺序 [2, 1, 3]', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildTTSteps(root, 'in');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([2, 1, 3]);
    });

    it('3. 后序遍历 [1, 2, 3] 产生左右根顺序 [2, 3, 1]', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildTTSteps(root, 'post');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([2, 3, 1]);
    });
  });

  describe('Valid BST (验证二叉搜索树)', () => {
    it('4. 合法 BST [2, 1, 3] 判定为 true 且收尾步全树节点常驻高亮', () => {
      const root = buildTreeFromArr([2, 1, 3]);
      const steps = buildVBSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.valid).toBe(true);
      expect(lastStep.sequence).toEqual([1, 2, 3]);
      expect(lastStep.action).toBe('done');
    });

    it('5. 非法 BST [5, 1, 4, null, null, 3, 6] 能够定位到非法节点并判定为 false', () => {
      const root = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
      const steps = buildVBSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.valid).toBe(false);
      expect(lastStep.invalidNode).toBe(3);
    });
  });

  describe('Tree Symmetric (对称二叉树)', () => {
    it('6. 对称二叉树 [1, 2, 2, 3, 4, 4, 3] 结果为 true 且收尾步全树高亮不变量成立', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toBe(true);
      expect(lastStep.action).toBe('done');
      expect(lastStep.message).toContain('是对称的');
    });

    it('7. 不对称二叉树 [1, 2, 2, null, 3, null, 3] 结果为 false 且精确定位失配', () => {
      const root = buildTreeFromArr([1, 2, 2, null, 3, null, 3]);
      const steps = buildTSSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toBe(false);
      expect(lastStep.action).toBe('done');
    });
  });

  describe('Tree Depth (二叉树最大深度)', () => {
    it('8. 正确计算二叉树 [3, 9, 20, null, null, 15, 7] 最大深度为 3', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildTDSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxDepth).toBe(3);
    });

    it('8.1 生成完整的递归调用跟踪快照 (CallTraceSnapshot)', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildTDSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.callTrace).toBeDefined();
      expect(lastStep.callTrace!.lines.length).toBeGreaterThan(5);
      expect(lastStep.callTrace!.finalResult).toBe(3);

      const stepsWithTrace = steps.filter((s) => s.callTrace != null);
      expect(stepsWithTrace.length).toBe(steps.length);

      const kinds = lastStep.callTrace!.lines.map((l) => l.kind);
      expect(kinds).toContain('header');
      expect(kinds).toContain('unwind-calc');
    });

    it('9. 空树最大深度为 0', () => {
      const steps = buildTDSteps(null);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxDepth).toBe(0);
    });

    it('9.1 空树时生成正确的空快照', () => {
      const steps = buildTDSteps(null);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.callTrace).toBeDefined();
      expect(lastStep.callTrace!.finalResult).toBe(0);
    });
  });

  describe('Path Sum (路径总和)', () => {
    it('10. 存在目标和路径 [5, 4, 8, 11, null, 13, 4, 7, 2], target=22 时 found 为 true', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2]);
      const steps = buildPSSteps(root, 22);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(true);
    });

    it('11. 不存在目标和路径时 found 为 false', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildPSSteps(root, 5);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(false);
    });
  });

  describe('Binary Tree Level Order (二叉树层序遍历)', () => {
    it('12. [3, 9, 20, null, null, 15, 7] 正确收集各层节点 [[3], [9, 20], [15, 7]]', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBTLSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([[3], [9, 20], [15, 7]]);
    });

    it('13. 空树直接返回空层序', () => {
      const steps = buildBTLSteps(null);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([]);
    });

    it('13b. 最终收尾步与遍历全阶段必须完整保持已访问节点高亮与 metrics 存在', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const staticSteps = buildStaticArrayLevelOrderSteps(root);
      expect(staticSteps.length).toBeGreaterThan(30);

      // 验证每一个 step 都有 metrics 字典
      for (const step of staticSteps) {
        expect(step.metrics).toBeDefined();
        expect(step.metrics!['cur-level']).toBeDefined();
        expect(step.metrics!['queue-size']).toBeDefined();
        expect(step.metrics!['total-collected']).toBeDefined();
      }

      // 验证最后几步收敛时，全树所有 5 个节点都已在 result.flat() 中，不可退化为白色无高亮
      const finalStep = staticSteps[staticSteps.length - 1];
      const allCollected = finalStep.result.flat();
      expect(allCollected.sort((a, b) => a - b)).toEqual([3, 7, 9, 15, 20]);
    });
  });

  describe('Tree Invert (翻转二叉树)', () => {
    it('14. 翻转满二叉树 [4, 2, 7, 1, 3, 6, 9] 产生镜像树', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3, 6, 9]);
      const steps = buildTreeInvertSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.invertedCount).toBe(7);
      expect(lastStep.tree?.left?.val).toBe(7);
      expect(lastStep.tree?.right?.val).toBe(2);
    });
  });

  describe('BST Search (BST 节点搜索)', () => {
    it('15. 在 BST [4, 2, 7, 1, 3] 中搜索 2 命中目标', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(true);
      expect(lastStep.targetSubtree?.val).toBe(2);
    });

    it('16. 在 BST [4, 2, 7, 1, 3] 中搜索 5 返回未找到', () => {
      const root = buildTreeFromArr([4, 2, 7, 1, 3]);
      const steps = buildBSTSearchSteps(root, 5);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(false);
    });
  });

  describe('Build Tree (前序/后序与中序构造二叉树 · LC 105 & 106)', () => {
    it('17.1 Stage 1: 根据 pre=[3,9,20,15,7] in=[9,3,15,20,7] 成功构造二叉树且收尾步全树翡翠绿高亮', () => {
      const pre = [3, 9, 20, 15, 7];
      const inArr = [9, 3, 15, 20, 7];
      const steps = buildTreeSteps(pre, inArr);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.tree?.val).toBe(3);
      expect(lastStep.tree?.left?.val).toBe(9);
      expect(lastStep.tree?.right?.val).toBe(20);
      expect(lastStep.action).toBe('done');
      // 收尾步高亮不变量：全树 5 个节点 100% 覆盖且常驻高亮，根节点 3 为金色聚焦点
      expect(lastStep.highlightedNodes).toEqual([3]);
      expect(lastStep.visitedNodes?.sort((a, b) => a - b)).toEqual([3, 7, 9, 15, 20]);
    });

    it('17.2 Stage 2: 根据 in=[9,3,15,20,7] post=[9,15,7,20,3] 成功构造二叉树且收尾步全树翡翠绿高亮', () => {
      const inArr = [9, 3, 15, 20, 7];
      const post = [9, 15, 7, 20, 3];
      const steps = buildTreeStage2PostorderSteps(inArr, post);
      expect(steps.length).toBeGreaterThan(5);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.tree?.val).toBe(3);
      expect(lastStep.tree?.left?.val).toBe(9);
      expect(lastStep.tree?.right?.val).toBe(20);
      expect(lastStep.action).toBe('done');
      // 检验收尾步高亮不变量
      expect(lastStep.highlightedNodes).toEqual([3]);
      expect(lastStep.visitedNodes?.sort((a, b) => a - b)).toEqual([3, 7, 9, 15, 20]);
    });

    it('17.3 Stage 2: 完美满二叉树 7 节点后序+中序构造验证', () => {
      const inArr = [1, 2, 3, 4, 5, 6, 7];
      const post = [1, 3, 2, 5, 7, 6, 4];
      const steps = buildTreeStage2PostorderSteps(inArr, post);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.tree?.val).toBe(4);
      expect(lastStep.tree?.left?.val).toBe(2);
      expect(lastStep.tree?.right?.val).toBe(6);
      expect(lastStep.visitedNodes?.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(lastStep.highlightedNodes).toEqual([4]);
    });

    it('17.4 Stage 3: 迭代显式栈模拟前序重构且收尾步全树翡翠绿高亮', () => {
      const pre = [3, 9, 20, 15, 7];
      const inArr = [9, 3, 15, 20, 7];
      const steps = buildTreeStage3StackSteps(pre, inArr);
      expect(steps.length).toBeGreaterThan(4);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.tree?.val).toBe(3);
      expect(lastStep.tree?.left?.val).toBe(9);
      expect(lastStep.tree?.right?.val).toBe(20);
      expect(lastStep.action).toBe('done');
      expect(lastStep.highlightedNodes).toEqual([3]);
      expect(lastStep.visitedNodes?.sort((a, b) => a - b)).toEqual([3, 7, 9, 15, 20]);
    });
  });

  describe('LCA (二叉树最近公共祖先)', () => {
    it('18. 在 [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4] 中查找 p=5, q=1 的 LCA 为 3', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLCASteps(root, 5, 1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.lcaResult).toBe(3);
    });

    it('19. 在 [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4] 中查找 p=5, q=4 的 LCA 为 5', () => {
      const root = buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
      const steps = buildLCASteps(root, 5, 4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.lcaResult).toBe(5);
    });
  });
});
