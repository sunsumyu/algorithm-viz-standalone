import { describe, it, expect } from 'vitest';
import { AlgorithmStrategyRegistry, LinearStepMatrixCompiler } from '../../../../../core/strategies';
import type { IYamlAlgorithmModel } from '../../../../../core/interfaces';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「不同的二叉搜索树 (Unique BST / Catalan Number)」规范与推导引擎
 */
describe('🏆 Unique BST Golden Baseline Regression Guard', () => {
  const model = {
    id: 'unique-bst',
    name: '不同的二叉搜索树',
    category: 'dynamic-programming',
    difficulty: 'medium'
  } as IYamlAlgorithmModel;

  it('should be registered in AlgorithmStrategyRegistry', () => {
    expect(AlgorithmStrategyRegistry.has('unique-bst')).toBe(true);
    const strategy = AlgorithmStrategyRegistry.get('unique-bst');
    expect(strategy).toBeDefined();
    expect(strategy?.canHandle('unique-bst')).toBe(true);
  });

  it('should compile Stage 1, Stage 2, Stage 3 and Stage 5 correctly', () => {
    const s1 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'unique-bst',
      stage: 1,
      n: 3,
      isMemo: false
    });
    expect(s1.length).toBeGreaterThan(0);

    const s2 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'unique-bst',
      stage: 2,
      n: 3,
      isMemo: true
    });
    expect(s2.length).toBeGreaterThan(0);

    const s3 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'unique-bst',
      stage: 3,
      n: 3
    });
    expect(s3.length).toBeGreaterThan(0);
    // n=3 Catalan number C_3 = 5 (BST combinations)
    expect(s3[s3.length - 1].memo?.[3]).toBe(5);

    const s5 = LinearStepMatrixCompiler.compile(model, {
      modelId: 'unique-bst',
      stage: 5,
      n: 3
    });
    expect(s5.length).toBeGreaterThan(0);
    expect(s5[s5.length - 1].tag).toContain('5');
  });
});
