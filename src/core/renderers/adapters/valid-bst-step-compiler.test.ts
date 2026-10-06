import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  buildVBSteps,
  buildValidBstStage2RangeSteps,
  buildValidBstStage3StackSteps,
  collectTreeValues,
  ValidBstStepCompiler,
} from './valid-bst-step-compiler';

describe('ValidBstStepCompiler Deep Module Test Suite', () => {
  const validTree = buildTreeFromArr([2, 1, 3]);
  const invalidTree = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);

  describe('Stage 1: 中序递归单调性校验 (Recursive Inorder Monotonicity)', () => {
    it('合法 BST [2, 1, 3] 计算正确，具备完整 CallTrace 快照且一行一步行号覆盖', () => {
      const steps = buildVBSteps(validTree);
      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        expect(step.callTrace).toBeDefined();
        expect(step.callTrace?.activeLineId).toBeTruthy();
      }

      // 验证生命周期关键行覆盖 (Java)
      const javaLines = steps.map((s) => (s.codeLine as Record<string, number>)?.java).filter(Boolean);
      expect(javaLines).toContain(3);  // entry
      expect(javaLines).toContain(4);  // nullCheck
      expect(javaLines).toContain(5);  // nullReturn
      expect(javaLines).toContain(7);  // checkLeft
      expect(javaLines).toContain(10); // comparePrev
      expect(javaLines).toContain(13); // updatePrev
      expect(javaLines).toContain(14); // checkRight

      // 验证首 5 步严格连续执行 [3, 3, 4, 7, 3]
      const firstLines = steps.slice(0, 5).map((s) => (s.codeLine as Record<string, number>)?.java);
      expect(firstLines).toEqual([3, 3, 4, 7, 3]);

      const last = steps[steps.length - 1];
      expect(last.valid).toBe(true);
      expect(last.sequence).toEqual([1, 2, 3]);
      expect(last.callTrace!.finalResult).toBe('true');
    });

    it('非法 BST [5, 1, 4, null, null, 3, 6] 准确定位违规节点 3', () => {
      const steps = buildVBSteps(invalidTree);
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(false);
      expect(last.invalidNode).toBe(3);
    });

    it('空树特判返回 true 且具备合法步', () => {
      const steps = buildVBSteps(null);
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(true);
      expect(last.phase).toBe('valid');
    });
  });

  describe('Stage 2: 上下界区间约束先序定界 (Boundary Range Pruning)', () => {
    it('合法 BST [2, 1, 3] 区间定界全部通过且生成 CallTrace 快照', () => {
      const steps = buildValidBstStage2RangeSteps(validTree);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(step.callTrace).toBeDefined();
        expect(step.boundary).toBeDefined();
      }
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(true);
    });

    it('非法 BST [5, 1, 4, null, null, 3, 6] 准确定位越界节点 4', () => {
      const steps = buildValidBstStage2RangeSteps(invalidTree);
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(false);
      expect(last.invalidNode).toBe(4);
    });

    it('空树定界安全返回 true', () => {
      const steps = buildValidBstStage2RangeSteps(null);
      expect(steps.pop()?.valid).toBe(true);
    });
  });

  describe('Stage 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder)', () => {
    it('合法 BST [2, 1, 3] 显式栈出入顺序与单调性正确', () => {
      const steps = buildValidBstStage3StackSteps(validTree);
      expect(steps.length).toBeGreaterThan(0);

      const actions = steps.map((s) => s.action);
      expect(actions).toContain('push-left');
      expect(actions).toContain('pop-node');
      expect(actions).toContain('update-prev');

      const last = steps[steps.length - 1];
      expect(last.valid).toBe(true);
      expect(last.sequence).toEqual([1, 2, 3]);
    });

    it('非法 BST [5, 1, 4, null, null, 3, 6] 显式栈遍历捕获违规节点 3', () => {
      const steps = buildValidBstStage3StackSteps(invalidTree);
      const last = steps[steps.length - 1];
      expect(last.valid).toBe(false);
      expect(last.invalidNode).toBe(3);
    });

    it('空树显式栈安全返回 true', () => {
      const steps = buildValidBstStage3StackSteps(null);
      expect(steps.pop()?.valid).toBe(true);
    });
  });

  describe('门面委托与工具函数 (ValidBstStepCompiler & Utilities)', () => {
    it('collectTreeValues 正确收集非空节点值', () => {
      const vals = collectTreeValues(validTree);
      expect(vals).toEqual([2, 1, 3]);
      expect(collectTreeValues(null)).toEqual([]);
    });

    it('ValidBstStepCompiler 门面委托与阶段构建函数一致', () => {
      const s1 = ValidBstStepCompiler.buildStage1Steps(validTree);
      const sDirect = buildVBSteps(validTree);
      expect(s1.length).toBe(sDirect.length);
      expect(s1[s1.length - 1].valid).toBe(sDirect[sDirect.length - 1].valid);
    });
  });
});
