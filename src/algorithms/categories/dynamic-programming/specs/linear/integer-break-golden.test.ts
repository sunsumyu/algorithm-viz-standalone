import { describe, it, expect } from 'vitest';
import { AlgorithmStrategyRegistry, LinearStepMatrixCompiler } from '../../../../../core/strategies';
import type { IYamlAlgorithmModel } from '../../../../../core/interfaces';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「整数拆分 (Integer Break)」规范与推导引擎
 */
describe('🏆 Integer Break Golden Baseline Regression Guard', () => {
  const model = {
    id: 'integer-break',
    name: '整数拆分',
    category: 'dynamic-programming',
    difficulty: 'medium'
  } as IYamlAlgorithmModel;

  it('should be registered in AlgorithmStrategyRegistry', () => {
    expect(AlgorithmStrategyRegistry.has('integer-break')).toBe(true);
    const strategy = AlgorithmStrategyRegistry.get('integer-break');
    expect(strategy).toBeDefined();
    expect(strategy?.canHandle('integer-break')).toBe(true);
  });

  it('should compile Stage 1, Stage 2, Stage 3 and Stage 5 correctly', () => {
    const s1 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'integer-break',
      stage: 1,
      n: 4,
      isMemo: false
    });
    expect(s1.length).toBeGreaterThan(0);

    const s2 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'integer-break',
      stage: 2,
      n: 4,
      isMemo: true
    });
    expect(s2.length).toBeGreaterThan(0);

    const s3 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'integer-break',
      stage: 3,
      n: 6
    });
    expect(s3.length).toBeGreaterThan(0);
    expect(s3[s3.length - 1].memo?.[6]).toBe(9); // 6 = 3 + 3, 3 * 3 = 9

    const s5 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'integer-break',
      stage: 5,
      n: 10
    });
    expect(s5.length).toBeGreaterThan(0);
    expect(s5[s5.length - 1].msg).toContain('36'); // 10 = 3 + 3 + 4, 3 * 3 * 4 = 36
  });
});
