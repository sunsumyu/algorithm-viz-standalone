/**
 * step-types 泛型基类结构验证
 * 确保 3 个基类携带约定的共享字段，具体算法接口 extends 后零字段丢失
 */
import { describe, it, expect } from 'vitest';
import type { StepBase, RecursionStepBase, MemoStepBase, Dp2DStepBase } from './step-types';

describe('step-types base interfaces', () => {
  it('StepBase carries the 7 shared fields', () => {
    const step: StepBase = {
      stepIndex: 1,
      totalSteps: 10,
      action: 'fnEnter',
      decision: '进入栈帧',
      message: 'msg',
      log: 'log',
      metrics: {},
    };
    expect(step.stepIndex).toBe(1);
    expect(step.metrics).toEqual({});
  });

  it('RecursionStepBase adds codeLine, callStack, returnValue', () => {
    const frame = { i: 0, remCap: 5, label: 'dfs(0, 5)' };
    const step: RecursionStepBase<typeof frame> = {
      stepIndex: 1,
      totalSteps: 1,
      action: 'fnEnter',
      decision: '',
      message: '',
      log: '',
      metrics: {},
      codeLine: { java: 1, cpp: 1, python: 1, javascript: 1 },
      callStack: [frame],
      returnValue: 3,
    };
    expect(step.callStack.length).toBe(1);
    expect(step.returnValue).toBe(3);
    // returnValue 可选
    const noRet: RecursionStepBase<{}> = {
      stepIndex: 1, totalSteps: 1, action: '', decision: '', message: '', log: '', metrics: {},
      codeLine: { java: 1, cpp: 1, python: 1, javascript: 1 },
      callStack: [],
    };
    expect(noRet.returnValue).toBeUndefined();
  });

  it('MemoStepBase adds codeLine, i, hitCount, missCount', () => {
    const step: MemoStepBase = {
      stepIndex: 2,
      totalSteps: 8,
      action: 'memoCheck',
      decision: '',
      message: '',
      log: '',
      metrics: {},
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 2 },
      i: 1,
      hitCount: 3,
      missCount: 4,
    };
    expect(step.i).toBe(1);
    expect(step.hitCount + step.missCount).toBe(7);
  });

  it('Dp2DStepBase adds codeLine, curI, curJ', () => {
    const step: Dp2DStepBase = {
      stepIndex: 3,
      totalSteps: 12,
      action: 'updatePick',
      decision: '',
      message: '',
      log: '',
      metrics: {},
      codeLine: { java: 3, cpp: 3, python: 3, javascript: 3 },
      curI: 2,
      curJ: 4,
    };
    expect(step.curI).toBe(2);
    expect(step.curJ).toBe(4);
  });
});
