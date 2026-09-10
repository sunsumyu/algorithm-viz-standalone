import { describe, it, expect } from 'vitest';
import { AlgorithmStrategyRegistry, LinearStepMatrixCompiler } from '../../../../../core/strategies';
import type { IYamlAlgorithmModel } from '../../../../../core/interfaces';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「使用最小花费爬楼梯 (Min Cost Climbing Stairs)」规范与推导引擎
 */
describe('🏆 Min Cost Climbing Stairs Golden Baseline Regression Guard', () => {
  const model = {
    id: 'min-cost',
    name: '使用最小花费爬楼梯',
    category: 'dynamic-programming',
    difficulty: 'easy'
  } as IYamlAlgorithmModel;

  it('should be registered in AlgorithmStrategyRegistry', () => {
    expect(AlgorithmStrategyRegistry.has('min-cost')).toBe(true);
    const strategy = AlgorithmStrategyRegistry.get('min-cost');
    expect(strategy).toBeDefined();
    expect(strategy?.canHandle('min-cost')).toBe(true);
  });

  it('should compile Stage 1, Stage 2, Stage 3 and Stage 4 correctly', () => {
    const s1 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'min-cost',
      stage: 1,
      n: 4,
      isMemo: false
    });
    expect(s1.length).toBeGreaterThan(0);
    expect(s1[0].type).toBe('dfs-call');

    const s2 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'min-cost',
      stage: 2,
      n: 4,
      isMemo: true
    });
    expect(s2.length).toBeGreaterThan(0);

    const s3 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'min-cost',
      stage: 3,
      n: 4
    });
    expect(s3.length).toBeGreaterThan(0);
    expect(s3[0].type).toBe('init');
    expect(s3[s3.length - 1].type).toBe('return');

    const s4 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'min-cost',
      stage: 4,
      n: 4
    });
    expect(s4.length).toBeGreaterThan(0);
    expect(s4[s4.length - 1].type).toBe('return');
  });
});
