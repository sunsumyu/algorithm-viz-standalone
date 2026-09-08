import { describe, it, expect } from 'vitest';
import {
  traceGoodPaths,
  buildGoodPathsSteps,
} from './good-paths-renderer';

describe('Good Paths Trace (UnionFind + Multiplication Combination Engine)', () => {
  it('should correctly trace classic 4-node tree and count all good paths', () => {
    const traceSteps = traceGoodPaths('classic_4node');
    expect(traceSteps.length).toBeGreaterThan(10);

    // 1. 验证初始状态
    const initStep = traceSteps[0];
    expect(initStep.stepIndex).toBe(1);
    expect(initStep.vars?.status).toBe('init');
    expect(initStep.vars?.totalGoodPaths).toBe(4); // 每个单节点自成 1 条好路径
    expect(initStep.codeLinesByLang.java).toBe(32);
    expect(initStep.codeLinesByLang.cpp).toBe(9);
    expect(initStep.codeLinesByLang.python).toBe(13);
    expect(initStep.codeLinesByLang.javascript).toBe(19);

    // 2. 验证同权代表元相遇时，乘法原理累加好路径
    const pairSteps = traceSteps.filter((s) => s.vars?.status === 'pair');
    expect(pairSteps.length).toBeGreaterThanOrEqual(1);
    for (const s of pairSteps) {
      expect(s.vars?.newPathsCount).toBeGreaterThan(0);
    }

    // 3. 验证终态
    const doneStep = traceSteps[traceSteps.length - 1];
    expect(doneStep.vars?.status).toBe('done');
    expect(doneStep.vars?.totalGoodPaths).toBe(5);
    expect(doneStep.metrics?.['metric-good-paths']).toBe('5 条');
  });

  it('should trace star 5-node preset correctly with multiple component merges', () => {
    const traceSteps = traceGoodPaths('star_5node');
    const doneStep = traceSteps[traceSteps.length - 1];

    expect(doneStep.vars?.status).toBe('done');
    expect(doneStep.vars?.totalGoodPaths).toBeGreaterThanOrEqual(5);
    expect(doneStep.vars?.parentArray).toBeDefined();
    expect(doneStep.vars?.countArray).toBeDefined();
  });

  it('should maintain 100% backward compatibility in buildGoodPathsSteps', () => {
    const oldFormatSteps = buildGoodPathsSteps('classic_4node');
    expect(oldFormatSteps.length).toBeGreaterThan(10);

    const first = oldFormatSteps[0];
    expect(first.totalGoodPaths).toBe(4);
    expect(first.codeLine).toBeDefined();
    expect(first.parentArray).toBeDefined();
    expect(first.countArray).toBeDefined();
    expect(first.valsArray).toBeDefined();

    const last = oldFormatSteps[oldFormatSteps.length - 1];
    expect(last.status).toBe('done');
    expect(last.totalGoodPaths).toBe(5);
  });
});
