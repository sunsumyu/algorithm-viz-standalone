import { describe, it, expect } from 'vitest';
import {
  traceFindRoute,
  buildFindRouteSteps,
  FIND_ROUTE_PRESETS,
} from './find-route-step-compiler';
import { VariableContextResolver } from '../../../core/variable-context-resolver';

describe('Find Route (LC 1971) Execution Trace Engine', () => {
  it('should correctly trace connected graph, reach destination, and link 4-language return lines', () => {
    const traceSteps = traceFindRoute(FIND_ROUTE_PRESETS['connected-6']);
    expect(traceSteps.length).toBeGreaterThan(5);

    // 1. 验证初始状态
    const initStep = traceSteps[0];
    expect(initStep.anchor).toBe('entry');
    expect(initStep.vars?.source).toBe(0);
    expect(initStep.vars?.dest).toBe(5);
    expect(initStep.codeLinesByLang.java).toBe(2);
    expect(initStep.codeLinesByLang.cpp).toBe(3);
    expect(initStep.codeLinesByLang.python).toBe(2);
    expect(initStep.codeLinesByLang.javascript).toBe(1);

    // 2. 验证终态命中的返回行号精准对应
    const doneStep = traceSteps[traceSteps.length - 1];
    expect(doneStep.anchor).toBe('returnFound');
    expect(doneStep.vars?.found).toBe(true);
    expect(doneStep.vars?.path).toEqual([0, 1, 2, 5]);

    // 精确四语言 1-based return true 所在行
    expect(doneStep.codeLinesByLang.java).toBe(16);
    expect(doneStep.codeLinesByLang.cpp).toBe(16);
    expect(doneStep.codeLinesByLang.python).toBe(14);
    expect(doneStep.codeLinesByLang.javascript).toBe(13);

    // 3. 验证变量解析器可正常读取对象型 vars 与别名映射
    const varsMap = VariableContextResolver.resolve(doneStep);
    expect(VariableContextResolver.getVariable(varsMap, 'source')?.value).toBe('0');
    expect(VariableContextResolver.getVariable(varsMap, 'dest')?.value).toBe('5');
    expect(VariableContextResolver.getVariable(varsMap, 'destination')?.value).toBe('5');
    expect(VariableContextResolver.getVariable(varsMap, 'path')?.value).toBe('[0, 1, 2, 5]');
    expect(VariableContextResolver.getVariable(varsMap, 'visited')?.value).toContain('{0, 1, 3');
  });

  it('should correctly detect disconnected graph and point to return false lines', () => {
    const traceSteps = traceFindRoute(FIND_ROUTE_PRESETS['disconnected-6']);
    const doneStep = traceSteps[traceSteps.length - 1];

    expect(doneStep.anchor).toBe('returnFalse');
    expect(doneStep.vars?.found).toBe(false);
    expect(doneStep.vars?.path).toEqual([]);

    // 精确四语言 1-based return false 所在行
    expect(doneStep.codeLinesByLang.java).toBe(24);
    expect(doneStep.codeLinesByLang.cpp).toBe(24);
    expect(doneStep.codeLinesByLang.python).toBe(19);
    expect(doneStep.codeLinesByLang.javascript).toBe(21);
  });

  it('should handle base case when source equals destination', () => {
    const traceSteps = traceFindRoute({
      nodes: [0, 1],
      edges: [[0, 1]],
      source: 0,
      dest: 0,
    });
    expect(traceSteps.length).toBe(2);
    const baseStep = traceSteps[1];
    expect(baseStep.anchor).toBe('checkBase');
    expect(baseStep.vars?.found).toBe(true);
    expect(baseStep.vars?.path).toEqual([0]);
  });

  it('should maintain backward compatibility for buildFindRouteSteps', () => {
    const legacySteps = buildFindRouteSteps(FIND_ROUTE_PRESETS['connected-6']);
    expect(legacySteps.length).toBeGreaterThan(5);

    const first = legacySteps[0];
    expect(first.source).toBe(0);
    expect(first.dest).toBe(5);
    expect(first.codeLine).toBeDefined();
    expect(first.metrics['metric-visited-count']).toBeDefined();

    const last = legacySteps[legacySteps.length - 1];
    expect(last.found).toBe(true);
    expect(last.path).toEqual([0, 1, 2, 5]);
  });
});
