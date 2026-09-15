/**
 * knapsack-075 零钱兑换 (Coins Change Kinds) 阶段 1 RecursionTraceTracker + skill §7.2 不变量
 */
import { describe, it, expect } from 'vitest';
import { buildCoinsChangeRecursionSteps } from './bounded-knapsack-stage-evolution';
import { COINS_CHANGE_STAGE1_CODE_LANGUAGES } from './knapsack-075-stage-codes';

const codeLen = Object.fromEntries(
  Object.entries(COINS_CHANGE_STAGE1_CODE_LANGUAGES as Record<string, string[]>).map(([k, v]) => [k, v.length])
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

describe('knapsack-075 零钱兑换阶段 1 RecursionTraceTracker + §7.2 不变量', () => {
  // POJ 1742 风格：面值 [1,3,4], 数量不限, 目标 m=6 → 找零方案存在
  const valList = [1, 3, 4], cntList = [10, 10, 10], m = 6;
  const steps = buildCoinsChangeRecursionSteps(m, valList, cntList);

  it('骨架不变量（stepIndex/totalSteps/栈快照/入口）', () => {
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.map((s: any) => s.stepIndex)).toEqual(steps.map((_: any, i: number) => i + 1));
    expect(steps.every((s: any) => s.totalSteps === steps.length)).toBe(true);
    const depths = new Set(steps.map((s: any) => s.callStack.length));
    expect(depths.size).toBeGreaterThan(1);
  });

  it('4-language codeLine 边界', () => {
    for (const s of steps) assertLineBounds(s.codeLine, s.stepIndex);
  });

  it('决策语义不回归：所有 target 枚举均产生步骤且存在 returnTrue/returnFalse', () => {
    const actions = new Set(steps.map((s: any) => s.action));
    expect(actions.has('fnEnter')).toBe(true);
    expect(actions.has('loopK')).toBe(true);
    // 至少存在一条终止路径（金额可凑齐或穷尽）
    expect(steps.some((s: any) => s.action === 'returnTrue' || s.action === 'returnFalse')).toBe(true);
  });

  it('metrics 栈深度与 callStack 长度一致', () => {
    for (const s of steps) {
      expect(s.metrics['metric-stack-depth']).toBe(`${s.callStack.length} 层`);
    }
  });

  it('保险丝：小上限截断不抛异常且 totalSteps 回填', () => {
    const fused = buildCoinsChangeRecursionSteps(m, valList, cntList, 5);
    expect(fused.length).toBeLessThanOrEqual(5);
    expect(fused.every((s: any) => s.totalSteps === fused.length)).toBe(true);
  });
});
