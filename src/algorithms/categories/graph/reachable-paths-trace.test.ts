import { describe, it, expect } from 'vitest';
import {
  traceReachablePaths,
  buildReachableSteps,
  DEFAULT_GRAPH,
} from './reachable-paths-step-compiler';
import { VariableContextResolver } from '../../../core/variable-context-resolver';

describe('Reachable Paths (LC 797) Execution Trace Engine', () => {
  it('should correctly trace DAG, collect all paths, and link 4-language lines within valid ranges', () => {
    const traceSteps = traceReachablePaths(DEFAULT_GRAPH);
    expect(traceSteps.length).toBeGreaterThan(8);

    // 1. 验证初始状态
    const initStep = traceSteps[0];
    expect(initStep.anchor).toBe('initPath');
    expect(initStep.vars?.target).toBe(3);
    expect(initStep.vars?.currentPath).toEqual([0]);

    // 2. 验证行号必须在有效源码行数范围内 (杜绝历史 52/75/97 等脱靶行号)
    expect(initStep.codeLinesByLang.java).toBe(5);
    expect(initStep.codeLinesByLang.cpp).toBe(5);
    expect(initStep.codeLinesByLang.python).toBe(4);
    expect(initStep.codeLinesByLang.javascript).toBe(3);

    // 3. 验证路径收集步骤行号
    const collectSteps = traceSteps.filter((s) => s.anchor === 'collectPath');
    expect(collectSteps.length).toBe(2);
    for (const step of collectSteps) {
      expect(step.codeLinesByLang.java).toBe(11);
      expect(step.codeLinesByLang.cpp).toBe(12);
      expect(step.codeLinesByLang.python).toBe(7);
      expect(step.codeLinesByLang.javascript).toBe(6);
    }

    // 4. 验证回溯步骤行号
    const backtrackSteps = traceSteps.filter((s) => s.anchor === 'backtrack');
    expect(backtrackSteps.length).toBeGreaterThan(0);
    for (const step of backtrackSteps) {
      expect(step.codeLinesByLang.java).toBe(17);
      expect(step.codeLinesByLang.cpp).toBe(18);
      expect(step.codeLinesByLang.python).toBe(12);
      expect(step.codeLinesByLang.javascript).toBe(12);
    }

    // 5. 验证终态
    const doneStep = traceSteps[traceSteps.length - 1];
    expect(doneStep.anchor).toBe('done');
    expect(doneStep.vars?.allPaths).toEqual([
      [0, 1, 3],
      [0, 2, 3],
    ]);
    expect(doneStep.codeLinesByLang.java).toBe(7);
    expect(doneStep.codeLinesByLang.cpp).toBe(7);
    expect(doneStep.codeLinesByLang.python).toBe(14);
    expect(doneStep.codeLinesByLang.javascript).toBe(16);

    // 6. 验证变量上下文解析
    const varsMap = VariableContextResolver.resolve(doneStep);
    expect(VariableContextResolver.getVariable(varsMap, 'target')?.value).toBe('3');
  });

  it('should maintain backward compatibility for buildReachableSteps', () => {
    const legacySteps = buildReachableSteps(DEFAULT_GRAPH);
    expect(legacySteps.length).toBeGreaterThan(8);

    const first = legacySteps[0];
    expect(first.currentPath).toEqual([0]);
    expect(first.codeLine).toBeDefined();

    const last = legacySteps[legacySteps.length - 1];
    expect(last.allPaths.length).toBe(2);
  });
});
