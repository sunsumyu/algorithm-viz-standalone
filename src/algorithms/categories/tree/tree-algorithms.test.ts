import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from './tree-template';
import { buildTTSteps } from './tree-traversal-renderer';
import { buildVBSteps } from './valid-bst-renderer';
import { buildTSSteps } from './tree-symmetric-renderer';
import { buildTDSteps } from './tree-depth-renderer';
import { buildPSSteps } from './path-sum-renderer';
import { buildBTLSteps } from './binary-tree-level-renderer';
import { buildTreeInvertSteps } from './tree-invert-renderer';
import { buildBSTSearchSteps } from './bst-search-renderer';
import { buildTreeSteps } from './build-tree-renderer';
import { buildLCASteps } from './lca-renderer';

describe('Tree Algorithms Step Generation (二叉树核心算法推导测试)', () => {
  describe('Tree Traversal (前/中/后序遍历)', () => {
    it('1. 前序遍历 [1, 2, 3] 产生根左右顺序 [1, 2, 3]', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildTTSteps(root, 'pre');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toEqual([1, 2, 3]);
      expect(lastStep.message).toContain('前序（根左右）遍历完成');
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
    it('4. 合法 BST [2, 1, 3] 判定为 true', () => {
      const root = buildTreeFromArr([2, 1, 3]);
      const steps = buildVBSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.valid).toBe(true);
      expect(lastStep.sequence).toEqual([1, 2, 3]);
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
    it('6. 对称二叉树 [1, 2, 2, 3, 4, 4, 3] 结果为 true', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toBe(true);
      expect(lastStep.message).toContain('是对称的');
    });

    it('7. 不对称二叉树 [1, 2, 2, null, 3, null, 3] 结果为 false', () => {
      const root = buildTreeFromArr([1, 2, 2, null, 3, null, 3]);
      const steps = buildTSSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toBe(false);
    });
  });

  describe('Tree Depth (二叉树最大深度)', () => {
    it('8. 正确计算二叉树 [3, 9, 20, null, null, 15, 7] 最大深度为 3', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildTDSteps(root);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxDepth).toBe(3);
    });

    it('9. 空树最大深度为 0', () => {
      const steps = buildTDSteps(null);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxDepth).toBe(0);
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

  describe('Build Tree (前中序构造二叉树)', () => {
    it('17. 根据 pre=[3,9,20,15,7] in=[9,3,15,20,7] 成功构造二叉树', () => {
      const pre = [3, 9, 20, 15, 7];
      const inArr = [9, 3, 15, 20, 7];
      const steps = buildTreeSteps(pre, inArr);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.tree?.val).toBe(3);
      expect(lastStep.tree?.left?.val).toBe(9);
      expect(lastStep.tree?.right?.val).toBe(20);
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
