import { describe, it, expect } from 'vitest';
import {
  buildMaxTreeStage1Steps,
  buildMaxTreeStage2StackSteps,
  buildMaxTreeStage3IterativeSteps,
  buildMaxTreeSteps,
  collectTreeValues,
  MaxTreeStepCompiler,
} from './max-tree-step-compiler';

describe('MaxTreeStepCompiler Deep Module Test Suite', () => {
  const nums = [3, 2, 1, 6, 0, 5];

  describe('Stage 1: 递归分治与区间扫描 (Recursive Divide & Conquer)', () => {
    it('正确构建最大二叉树 [3, 2, 1, 6, 0, 5] 且 CallTrace 完备与行号覆盖健全', () => {
      const steps = buildMaxTreeStage1Steps(nums);
      expect(steps.length).toBeGreaterThan(0);

      // 验证 CallTrace 快照
      for (const step of steps) {
        expect(step.callTrace).toBeDefined();
        expect(step.callTrace?.activeLineId).toBeTruthy();
      }

      // 验证关键 Java 行号覆盖
      const javaLines = steps.map((s) => (s.codeLine as Record<string, number>)?.java).filter(Boolean);
      expect(javaLines).toContain(2); // entry
      expect(javaLines).toContain(4); // start
      expect(javaLines).toContain(7); // buildSignature
      expect(javaLines).toContain(8); // baseCheck
      expect(javaLines).toContain(9); // initMax
      expect(javaLines).toContain(10); // scanLoop
      expect(javaLines).toContain(13); // createNode
      expect(javaLines).toContain(14); // recurseLeft
      expect(javaLines).toContain(15); // recurseRight
      expect(javaLines).toContain(16); // returnRoot

      const last = steps[steps.length - 1];
      expect(last.tree).not.toBeNull();
      expect(last.tree!.val).toBe(6);
      expect(last.tree!.left!.val).toBe(3);
      expect(last.tree!.right!.val).toBe(5);
      expect(last.current).toBe(6);
      expect(last.visitedNodes).toEqual(expect.arrayContaining([3, 2, 1, 6, 0, 5]));
    });

    it('空数组安全返回并包含合法结算帧', () => {
      const steps = buildMaxTreeStage1Steps([]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.tree).toBeNull();
      expect(last.callTrace).toBeDefined();
    });
  });

  describe('Stage 2: 单调栈 O(N) 笛卡尔树 (Monotonic Stack Cartesian Tree)', () => {
    it('正确构建最大二叉树且收尾树结构与 Stage 1 一致', () => {
      const steps = buildMaxTreeStage2StackSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const actions = steps.map((s) => s.action);
      expect(actions).toContain('create-curr');
      expect(actions).toContain('attach-left');
      expect(actions).toContain('attach-right');
      expect(actions).toContain('push-curr');

      const last = steps[steps.length - 1];
      expect(last.tree).not.toBeNull();
      expect(last.tree!.val).toBe(6);
      expect(last.tree!.left!.val).toBe(3);
      expect(last.tree!.right!.val).toBe(5);
      expect(last.visitedNodes).toEqual(expect.arrayContaining([3, 2, 1, 6, 0, 5]));
    });

    it('空数组安全返回 null 树', () => {
      const steps = buildMaxTreeStage2StackSteps([]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].tree).toBeNull();
    });
  });

  describe('Stage 3: 显式任务栈迭代构建 (Explicit Construction Stack)', () => {
    it('正确构建最大二叉树且任务调度顺畅', () => {
      const steps = buildMaxTreeStage3IterativeSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const actions = steps.map((s) => s.action);
      expect(actions).toContain('init-root');
      expect(actions).toContain('push-subtasks');
      expect(actions).toContain('pop-task');
      expect(actions).toContain('find-child-max');
      expect(actions).toContain('attach-child');

      const last = steps[steps.length - 1];
      expect(last.tree).not.toBeNull();
      expect(last.tree!.val).toBe(6);
      expect(last.tree!.left!.val).toBe(3);
      expect(last.tree!.right!.val).toBe(5);
    });

    it('空数组安全返回 null 树', () => {
      const steps = buildMaxTreeStage3IterativeSteps([]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].tree).toBeNull();
    });
  });

  describe('跨阶段不变性与门面委托 (Invariants & Compiler Facade)', () => {
    it('三大 Stage 对递增序列 [1, 2, 3, 4] 根节点统一为 4', () => {
      const incNums = [1, 2, 3, 4];
      const r1 = buildMaxTreeStage1Steps(incNums).pop()?.tree;
      const r2 = buildMaxTreeStage2StackSteps(incNums).pop()?.tree;
      const r3 = buildMaxTreeStage3IterativeSteps(incNums).pop()?.tree;

      expect(r1?.val).toBe(4);
      expect(r2?.val).toBe(4);
      expect(r3?.val).toBe(4);
    });

    it('门面 MaxTreeStepCompiler 委托与 buildMaxTreeSteps legacy 别名一致', () => {
      const s1 = MaxTreeStepCompiler.buildStage1Steps(nums);
      const sLegacy = buildMaxTreeSteps(nums);
      expect(s1.length).toBe(sLegacy.length);
      expect(s1[s1.length - 1].tree?.val).toBe(sLegacy[sLegacy.length - 1].tree?.val);

      const allVals = collectTreeValues(s1[s1.length - 1].tree);
      expect(allVals).toEqual(expect.arrayContaining([3, 2, 1, 6, 0, 5]));
    });
  });
});
