import { describe, it, expect } from 'vitest';
import { VariableContextResolver } from './variable-context-resolver';

describe('VariableContextResolver Deep Module Unit Tests', () => {
  it('should cleanly extract variables from step.vars', () => {
    const step = {
      vars: [
        { name: 'i', value: '3', type: 'number' },
        { name: 'j', value: '1', type: 'number' },
        { name: 'ans', value: '10', type: 'number' },
      ],
    };

    const varsMap = VariableContextResolver.resolve(step);
    expect(varsMap.size).toBeGreaterThanOrEqual(3);

    const iVar = VariableContextResolver.getVariable(varsMap, 'i');
    expect(iVar).toBeDefined();
    expect(iVar?.value).toBe('3');

    const jVar = VariableContextResolver.getVariable(varsMap, 'j');
    expect(jVar?.value).toBe('1');
  });

  it('should parse metric key-values like metric-pos and metric-ans', () => {
    const step = {
      metrics: {
        'metric-pos': 'i=3, j=1',
        'metric-status': '向上分支探索',
        'metric-ans': '5',
      },
    };

    const varsMap = VariableContextResolver.resolve(step);
    const iVar = VariableContextResolver.getVariable(varsMap, 'i');
    expect(iVar).toBeDefined();
    expect(iVar?.value).toBe('3');

    const jVar = VariableContextResolver.getVariable(varsMap, 'j');
    expect(jVar).toBeDefined();
    expect(jVar?.value).toBe('1');

    const ansVar = VariableContextResolver.getVariable(varsMap, 'ans');
    expect(ansVar).toBeDefined();
    expect(ansVar?.value).toBe('5');
  });

  it('should extract direct primitive properties from step', () => {
    const step = {
      i: 4,
      j: 2,
      target: 9,
      nums: [1, 2, 3],
      decision: '忽略该属性',
    };

    const varsMap = VariableContextResolver.resolve(step);
    expect(VariableContextResolver.getVariable(varsMap, 'i')?.value).toBe('4');
    expect(VariableContextResolver.getVariable(varsMap, 'j')?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'target')?.value).toBe('9');
    expect(VariableContextResolver.getVariable(varsMap, 'nums')?.value).toContain('[1, 2, 3]');
    expect(VariableContextResolver.getVariable(varsMap, 'decision')).toBeUndefined();
  });

  it('should handle cross-language camelCase and snake_case aliases', () => {
    const step = {
      vars: [
        { name: 'startIndex', value: '2' },
        { name: 'has_cycle', value: 'true' },
      ],
    };

    const varsMap = VariableContextResolver.resolve(step);

    // Python queries start_index -> should match startIndex
    const pyVar = VariableContextResolver.getVariable(varsMap, 'start_index');
    expect(pyVar).toBeDefined();
    expect(pyVar?.value).toBe('2');

    // Java queries hasCycle -> should match has_cycle
    const javaVar = VariableContextResolver.getVariable(varsMap, 'hasCycle');
    expect(javaVar).toBeDefined();
    expect(javaVar?.value).toBe('true');
  });

  it('should generate concise inline debugging summaries for code lines', () => {
    const step = {
      i: 3,
      j: 1,
      ans: 0,
    };
    const varsMap = VariableContextResolver.resolve(step);

    const lineCode = 'int p1 = f(a, b, i - 1, j);';
    const summary = VariableContextResolver.formatInlineSummary(varsMap, lineCode);

    expect(summary).toContain('//');
    expect(summary).toContain('i: 3');
    expect(summary).toContain('j: 1');
  });

  it('should accurately resolve l=0 from staticQueueState and scope without false positive from arithmetic r - l', () => {
    const step = {
      tree: { val: 3 },
      current: null,
      levelIndex: 0,
      levelSize: 1,
      staticQueueState: { array: [3], l: 0, r: 1, windowSize: 1 },
      scope: { l: 0, r: 1, size: 1 },
      decision: '锁定本层大小: size = r - l = 1 - 0 = 1',
      log: 'int size = r - l -> 1',
      codeLine: 11,
    };

    const varsMap = VariableContextResolver.resolve(step);
    const lVar = VariableContextResolver.getVariable(varsMap, 'l');
    const rVar = VariableContextResolver.getVariable(varsMap, 'r');
    const sizeVar = VariableContextResolver.getVariable(varsMap, 'size');

    expect(lVar?.value).toBe('0');
    expect(rVar?.value).toBe('1');
    expect(sizeVar?.value).toBe('1');

    const summary = VariableContextResolver.formatInlineSummary(varsMap, 'int size = r - l;');
    expect(summary).toContain('l: 0');
    expect(summary).toContain('r: 1');
    expect(summary).toContain('size: 1');
    expect(summary).not.toContain('l: 1');
  });
});

