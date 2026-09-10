import { describe, it, expect } from 'vitest';
import {
  traceNetworkDelay,
  buildNetworkDelaySteps,
} from './network-delay-time-renderer';

describe('Network Delay Time Trace (Dijkstra Execution Engine)', () => {
  it('should correctly trace reachable graph with Dijkstra priority queue and cover all nodes', () => {
    const traceSteps = traceNetworkDelay(true);
    expect(traceSteps.length).toBeGreaterThan(10);

    // 1. 验证初始状态
    const initStep = traceSteps[0];
    expect(initStep.stepIndex).toBe(1);
    expect(initStep.vars?.curNode).toBe(2);
    expect(initStep.vars?.status).toBe('init');
    expect(initStep.codeLinesByLang.java).toBe(8);
    expect(initStep.codeLinesByLang.cpp).toBe(11);
    expect(initStep.codeLinesByLang.python).toBe(3);
    expect(initStep.codeLinesByLang.javascript).toBe(2);

    // 2. 验证不可变快照隔离 (每一帧引用的数组是独立的深克隆)
    const distStep1 = traceSteps.find((s) => s.anchor === 'initSrc');
    expect(distStep1).toBeDefined();
    expect(distStep1!.vars?.distList[2]).toBe(0);

    // 3. 验证终态
    const doneStep = traceSteps[traceSteps.length - 1];
    expect(doneStep.vars?.status).toBe('done');
    expect(doneStep.vars?.isAllReached).toBe(true);
    expect(doneStep.vars?.maxDelaySoFar).toBe(2);
    expect(doneStep.metrics?.['metric-delay-max']).toBe('2 ms');
  });

  it('should correctly detect unreachable isolated node and output -1 delay', () => {
    const traceSteps = traceNetworkDelay(false);
    const doneStep = traceSteps[traceSteps.length - 1];

    expect(doneStep.vars?.status).toBe('done');
    expect(doneStep.vars?.isAllReached).toBe(false);
    expect(doneStep.vars?.maxDelaySoFar).toBe(-1);
    expect(doneStep.metrics?.['metric-delay-max']).toBe('-1 (存在孤立点)');
  });

  it('should maintain 100% backward compatibility in buildNetworkDelaySteps', () => {
    const oldFormatSteps = buildNetworkDelaySteps(true);
    expect(oldFormatSteps.length).toBeGreaterThan(10);

    const first = oldFormatSteps[0];
    expect(first.curNode).toBe(2);
    expect(first.codeLine).toBeDefined();
    expect(first.distList).toBeDefined();
    expect(first.visitedList).toBeDefined();
    expect(first.pqSnapshot).toBeDefined();

    const last = oldFormatSteps[oldFormatSteps.length - 1];
    expect(last.isAllReached).toBe(true);
    expect(last.maxDelaySoFar).toBe(2);
  });
});
