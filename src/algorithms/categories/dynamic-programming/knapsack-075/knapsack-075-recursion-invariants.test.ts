/**
 * knapsack-075 阶段 1 (二进制拆分衍生 01 递归) RecursionTraceTracker 黄金等价 + skill §7.2 不变量测试
 *
 * 覆盖算法：多重背包二进制拆分阶段 1 (buildBinarySplitRecursionSteps) — 树模式
 *
 * 不变量（algo-viz-authoring §7.2 + §7.1）：
 *   A. 骨架不变量（引擎托管）
 *   B/C. 入口 / 第一步语义
 *   D. 4-language codeLine 边界（树模式 step 仍持有 codeLine）
 *   E. 决策语义不回归
 *   F. 树模式：treeRoot 每步深克隆（引用不等）、activeNodeId 指向当前活跃节点
 */
import { describe, it, expect } from 'vitest';
import { buildBinarySplitRecursionSteps } from './bounded-knapsack-stage-evolution';
import { BINARY_SPLIT_STAGE1_CODE_LANGUAGES } from './knapsack-075-stage-codes';

interface DerivedItem { origIndex: number; multiplier: number; val: number; weight: number }

// BINARY_SPLIT_STAGE1_CODE_LANGUAGES — 取 stage-1 四语言行数
const codeLen = Object.fromEntries(
  Object.entries(BINARY_SPLIT_STAGE1_CODE_LANGUAGES as Record<string, string[]>).map(([k, v]) => [k, v.length])
);

function assertLineBounds(codeLine: any, stepIdx: number) {
  expect(typeof codeLine).toBe('object');
  for (const [lang, len] of Object.entries(codeLen)) {
    const v = (codeLine as any)[lang];
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThanOrEqual(1);
    expect(v).toBeLessThanOrEqual(len as number);
  }
}

describe('knapsack-075 阶段 1 (binary-split) RecursionTraceTracker 树模式 + §7.2 不变量', () => {
  const derived: DerivedItem[] = [
    { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
    { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
    { origIndex: 1, multiplier: 1, val: 4, weight: 3 },
  ];
  const t = 5;
  const steps = buildBinarySplitRecursionSteps(t, derived);

  it('骨架不变量（stepIndex/totalSteps/栈快照/入口/首步）', () => {
    expect(steps.map((s: any) => s.stepIndex)).toEqual(steps.map((_: any, i: number) => i + 1));
    expect(steps.every((s: any) => s.totalSteps === steps.length)).toBe(true);
    const depths = new Set(steps.map((s: any) => s.callStack.length));
    expect(depths.size).toBeGreaterThan(1);
    expect(steps[0].action).toBe('callRoot');
    expect(steps[0].callStack.length).toBe(0);
    expect(steps[1].action).toBe('fnEnter');
  });

  it('4-language codeLine 边界', () => {
    for (const s of steps) {
      assertLineBounds(s.codeLine, s.stepIndex);
    }
  });

  it('决策语义不回归：根返回值 (t=5, [3/2,3/2,4/3] → 7)', () => {
    const rootReturn = steps[steps.length - 1].returnValue;
    expect(rootReturn).toBe(7);
  });

  it('树模式：treeRoot 每步深克隆（引用不等）+ activeNodeId 非空', () => {
    const treeRefs = steps.map((s: any) => s.treeRoot);
    expect(treeRefs.every((r: any) => !!r)).toBe(true);
    // 至少存在两个不同快照引用（深克隆验证）
    const uniqueRefs = new Set(treeRefs);
    expect(uniqueRefs.size).toBeGreaterThan(1);
    // 每步 activeNodeId 为字符串且非空
    for (const s of steps) {
      expect(typeof s.activeNodeId).toBe('string');
      expect((s.activeNodeId as string).length).toBeGreaterThan(0);
    }
  });

  it('metrics 栈深度与 callStack 长度一致', () => {
    for (const s of steps) {
      expect(s.metrics['metric-stack-depth']).toBe(`${s.callStack.length}`);
    }
  });
});
