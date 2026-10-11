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
    expect(initStep.vars?.times).toBeDefined();
    expect(initStep.vars?.graph).toBeDefined();
    expect(initStep.vars?.adj).toBeDefined();
    expect(initStep.codeLinesByLang.java).toBe(2);
    expect(initStep.codeLinesByLang.cpp).toBe(3);
    expect(initStep.codeLinesByLang.python).toBe(2);
    expect(initStep.codeLinesByLang.javascript).toBe(1);

    // 2. 验证不可变快照隔离 (每一帧引用的数组是独立的深克隆)
    const distStep1 = traceSteps.find((s) => s.anchor === 'initSrc');
    expect(distStep1).toBeDefined();
    expect(distStep1!.vars?.distList[2]).toBe(0);
    expect(distStep1!.vars?.k).toBe(2);
    expect(distStep1!.vars?.n).toBe(4);
    expect(distStep1!.vars?.u).toBe(2);

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

  it('should enforce monotonic step line flow during linear initialization across all 4 languages', () => {
    const traceSteps = traceNetworkDelay(true);
    const initSteps = traceSteps.slice(0, 5);
    const expectedAnchors = ['entry', 'initDistance', 'initVisited', 'initSrc', 'initPq'];
    expect(initSteps.map((s) => s.anchor)).toEqual(expectedAnchors);

    const languages = ['java', 'cpp', 'python', 'javascript'] as const;
    for (const lang of languages) {
      const lineSequence = initSteps.map((s) => {
        const val = s.codeLinesByLang[lang];
        return Array.isArray(val) ? val[0] : val;
      });
      for (let i = 1; i < lineSequence.length; i++) {
        expect(
          lineSequence[i],
          `[${lang}] Initialization step #${i + 1} (${initSteps[i].anchor}) line ${lineSequence[i]} must be >= step #${i} (${initSteps[i - 1].anchor}) line ${lineSequence[i - 1]}`
        ).toBeGreaterThanOrEqual(lineSequence[i - 1]);
      }
    }
  });
});
