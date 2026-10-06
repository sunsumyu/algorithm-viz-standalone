import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  buildTSRecursiveSteps,
  buildTSIterativeQueueSteps,
  buildTSStaticArraySteps,
  buildTSSteps,
  collectTreeValues,
  TreeSymmetricStepCompiler,
} from './tree-symmetric-step-compiler';

describe('TreeSymmetricStepCompiler Deep Module Test Suite', () => {
  describe('Stage 1: 双指针镜像递归 (Recursive Mirror DFS)', () => {
    it('标准对称完全二叉树 [1, 2, 2, 3, 4, 4, 3] 计算正确并生成 CallTrace 快照', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSRecursiveSteps(root);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(true);
      expect(last.action).toBe('done');
      expect(last.phase).toBe('symmetric');
      expect(last.message).toContain('是对称的');

      // 验证 CallTrace 快照
      expect(last.callTrace).toBeDefined();
      expect(last.callTrace!.lines.length).toBeGreaterThan(10);
      expect(last.callTrace!.finalResult).toBe('True');

      const actions = steps.map((s) => s.action);
      expect(actions).toContain('recurse-outside');
      expect(actions).toContain('recurse-inside');
      expect(actions).toContain('both-null');
      expect(actions).toContain('val-match');

      // 验证 1-based 行号
      const javaLines = steps.map((s) => (s.codeLine as Record<string, number>)?.java);
      expect(javaLines).toContain(2); // init
      expect(javaLines).toContain(3); // empty
      expect(javaLines).toContain(4); // startCheck / done
      expect(javaLines).toContain(6); // checkEntry
      expect(javaLines).toContain(7); // bothNull
      expect(javaLines).toContain(8); // oneNull
      expect(javaLines).toContain(9); // valMatch
      expect(javaLines).toContain(10); // recurseOutside
      expect(javaLines).toContain(11); // recurseInside
      expect(javaLines).toContain(12); // combine
    });

    it('结构不对称树 [1, 2, 2, null, 3, null, 3] 返回 false 且捕获结构失配', () => {
      const root = buildTreeFromArr([1, 2, 2, null, 3, null, 3]);
      const steps = buildTSRecursiveSteps(root);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(false);
      expect(last.phase).toBe('asymmetric');
      expect(last.mismatchNode).toBe(3);

      const oneNullStep = steps.find((s) => s.action === 'one-null');
      expect(oneNullStep).toBeDefined();
      expect(oneNullStep?.match).toBe(false);
    });

    it('数值不对称树 [1, 2, 3] 返回 false 且捕获数值失配', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildTSRecursiveSteps(root);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(false);
      expect(last.phase).toBe('asymmetric');

      const valMismatchStep = steps.find((s) => s.action === 'val-mismatch');
      expect(valMismatchStep).toBeDefined();
      expect(valMismatchStep?.match).toBe(false);
    });

    it('空树特判返回天然对称 true', () => {
      const steps = buildTSRecursiveSteps(null);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(true);
      expect(last.phase).toBe('symmetric');
      expect(last.codeLine).toBeDefined();
    });
  });

  describe('Stage 2: 队列成对迭代 (Iterative Queue BFS)', () => {
    it('对称二叉树 [1, 2, 2, 3, 4, 4, 3] 队列成对出入校验通过', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSIterativeQueueSteps(root);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(true);
      expect(last.phase).toBe('symmetric');

      const actions = steps.map((s) => s.action);
      expect(actions).toContain('init-queue');
      expect(actions).toContain('poll-pair');
      expect(actions).toContain('push-outside');
      expect(actions).toContain('push-inside');
    });

    it('数值不对称树 [1, 2, 3] 队列校验中途失配阻断', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildTSIterativeQueueSteps(root);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(false);
      expect(last.phase).toBe('asymmetric');

      const mismatchStep = steps.find((s) => s.action === 'mismatch');
      expect(mismatchStep).toBeDefined();
      expect(mismatchStep?.match).toBe(false);
    });

    it('空树队列特判返回天然对称', () => {
      const steps = buildTSIterativeQueueSteps(null);
      const last = steps[steps.length - 1];
      expect(last.result).toBe(true);
      expect(last.phase).toBe('symmetric');
    });
  });

  describe('Stage 3: 静态数组模拟队列 (Static Array Queue)', () => {
    it('对称二叉树 [1, 2, 2, 3, 4, 4, 3] 静态数组模拟队列正常运行且收尾 l == r', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const steps = buildTSStaticArraySteps(root);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(true);
      expect(last.phase).toBe('symmetric');
      expect(last.staticQueueState).toBeDefined();
      expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);

      const actions = steps.map((s) => s.action);
      expect(actions).toContain('static-init');
      expect(actions).toContain('poll-pair');
      expect(actions).toContain('push-outside');
      expect(actions).toContain('push-inside');
    });

    it('不对称树 [1, 2, 3] 静态数组校验捕获失配', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildTSStaticArraySteps(root);
      const last = steps[steps.length - 1];

      expect(last.result).toBe(false);
      expect(last.phase).toBe('asymmetric');
    });

    it('空树特判返回天然对称', () => {
      const steps = buildTSStaticArraySteps(null);
      const last = steps[steps.length - 1];
      expect(last.result).toBe(true);
      expect(last.phase).toBe('symmetric');
    });
  });

  describe('门面委托与工具函数 (TreeSymmetricStepCompiler & Utilities)', () => {
    it('collectTreeValues 正确收集层序节点值', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 4, 4, 3]);
      const vals = collectTreeValues(root);
      expect(vals).toEqual([1, 2, 2, 3, 4, 4, 3]);
      expect(collectTreeValues(null)).toEqual([]);
    });

    it('门面 TreeSymmetricStepCompiler 委托与 buildTSSteps legacy 别名一致', () => {
      const root = buildTreeFromArr([1, 2, 2]);
      const steps1 = TreeSymmetricStepCompiler.buildRecursiveSteps(root);
      const steps2 = TreeSymmetricStepCompiler.buildSteps(root);
      const stepsLegacy = buildTSSteps(root);

      expect(steps1.length).toBe(steps2.length);
      expect(steps2.length).toBe(stepsLegacy.length);
      expect(steps1[steps1.length - 1].result).toBe(stepsLegacy[stepsLegacy.length - 1].result);
    });
  });
});
