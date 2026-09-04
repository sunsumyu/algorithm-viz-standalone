import { describe, it, expect } from 'vitest';
import { ModelSynthesisEngine, bridgeSemanticLinesToAnchorMap, resolveSemanticLine } from './model-synthesis-engine';
import '../algorithms/categories/dynamic-programming/specs';

describe('ModelSynthesisEngine Deep Module', () => {
  it('正确解析各典型算法的默认输入参数字典', () => {
    expect(ModelSynthesisEngine.getDefaultParams('target-sum')).toEqual({
      nums: [1, 1, 1, 1, 1],
      target: 3,
      n: 6,
    });
    expect(ModelSynthesisEngine.getDefaultParams('multiple-knapsack')).toEqual({
      weights: [1, 3, 4],
      values: [15, 20, 30],
      nums: [2, 3, 2],
      bagWeight: 4,
      n: 4,
    });
    expect(ModelSynthesisEngine.getDefaultParams('unknown-algo')).toEqual({ n: 6 });
  });

  it('从 DpStepEngine 规范动态合成标准 5A 级算法模型', () => {
    const model = ModelSynthesisEngine.synthesizeFromSpec('target-sum');
    expect(model).toBeDefined();
    expect(model?.id).toBe('target-sum');
    expect(model?.category).toBe('dynamic-programming');
    expect(model?.defaultStage).toBe('stage-3');
    expect(model?.stages['stage-1']).toBeDefined();
    expect(model?.stages['stage-2']).toBeDefined();
    expect(model?.stages['stage-3']).toBeDefined();
    expect(model?.stages['stage-4']).toBeDefined();
  });

  it('精准解析 semanticLines 并映射到多语言语义锚点', () => {
    const semanticLines = {
      entry: 2,
      guard: 3,
      init: 4,
      loopCheck: 5,
      innerLoopCheck: 6,
      stateTransfer: 7,
      returnResult: 10,
    };
    const anchorMap = bridgeSemanticLinesToAnchorMap(semanticLines, 'java');
    expect(anchorMap.entry).toBe(2);
    expect(anchorMap.guard).toBe(3);
    expect(anchorMap.init).toBe(4);
    expect(anchorMap.loop_i).toBe(5);
    expect(anchorMap.loop_j).toBe(6);
    expect(anchorMap.transfer).toBe(7);
    expect(anchorMap.return).toBe(10);
  });

  it('支持复杂多态结构解析 resolveSemanticLine', () => {
    expect(resolveSemanticLine(15)).toBe(15);
    expect(resolveSemanticLine([10, 12, 14])).toBe(14);
    expect(resolveSemanticLine({ java: 8, python: 6 }, 'java')).toBe(8);
    expect(resolveSemanticLine({ java: { primary: 9 } }, 'java')).toBe(9);
    expect(resolveSemanticLine(undefined)).toBeUndefined();
  });
});
