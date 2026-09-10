import { describe, it, expect } from 'vitest';
import { LinearStepMatrixCompiler } from './linear-step-matrix-compiler';
import type { IYamlAlgorithmModel } from '../interfaces';

describe('LinearStepMatrixCompiler Deep Module Guard (Pipeline Pattern)', () => {
  const fibModel = {
    id: 'fibonacci',
    name: '斐波那契数',
    category: '线性 DP',
    difficulty: 'easy'
  } as IYamlAlgorithmModel;

  const climbModel = {
    id: 'climb-stairs',
    name: '爬楼梯',
    category: '线性 DP',
    difficulty: 'easy'
  } as IYamlAlgorithmModel;

  const minCostModel = {
    id: 'min-cost',
    name: '使用最小花费爬楼梯',
    category: '线性 DP',
    difficulty: 'easy'
  } as IYamlAlgorithmModel;

  const integerBreakModel = {
    id: 'integer-break',
    name: '整数拆分',
    category: '线性 DP',
    difficulty: 'medium'
  } as IYamlAlgorithmModel;

  const uniqueBstModel = {
    id: 'unique-bst',
    name: '不同的二叉搜索树',
    category: '线性 DP',
    difficulty: 'medium'
  } as IYamlAlgorithmModel;

  it('should compile Stage 1 & Stage 2 recursion tree with memoization correctly for fibonacci', () => {
    const s1 = LinearStepMatrixCompiler.compile(fibModel, {
      modelId: 'fibonacci',
      stage: 1,
      n: 4,
      isMemo: false
    });
    expect(s1.length).toBeGreaterThan(5);
    expect(s1[0].type).toBe('dfs-call');
    expect(s1.some((st) => st.type === 'boundary')).toBe(true);
    expect(s1.some((st) => st.type === 'return')).toBe(true);

    const s2 = LinearStepMatrixCompiler.compile(fibModel, {
      modelId: 'fibonacci',
      stage: 2,
      n: 4,
      isMemo: true
    });
    expect(s2.some((st) => st.type === 'cache-hit')).toBe(true);
  });

  it('should compile Stage 3 tabulation for all linear models', () => {
    const models = [fibModel, climbModel, minCostModel, integerBreakModel, uniqueBstModel];
    for (const m of models) {
      const s3 = LinearStepMatrixCompiler.compile(m, {
        modelId: m.id,
        stage: 3,
        n: 5
      });
      expect(s3.length).toBeGreaterThan(0);
      expect(s3[0].type).toBe('init');
      expect(s3[s3.length - 1].type).toBe('return');
    }
  });

  it('should compile Stage 4 rolling space compression correctly', () => {
    const s4 = LinearStepMatrixCompiler.compile(climbModel, {
      modelId: 'climb-stairs',
      stage: 4,
      n: 5
    });
    expect(s4.some((st) => st.type === 'accumulate')).toBe(true);
    expect(s4.some((st) => st.type === 'fetch-down')).toBe(true);
    expect(s4.some((st) => st.type === 'fetch-right')).toBe(true);
  });

  it('should compile Stage 5 advanced math and Catalan formulas correctly', () => {
    const s5Int = LinearStepMatrixCompiler.compile(integerBreakModel, {
      modelId: 'integer-break',
      stage: 5,
      n: 10
    });
    expect(s5Int.length).toBeGreaterThan(0);

    const s5Bst = LinearStepMatrixCompiler.compile(uniqueBstModel, {
      modelId: 'unique-bst',
      stage: 5,
      n: 3
    });
    expect(s5Bst.length).toBeGreaterThan(0);
    expect(s5Bst.some((st) => st.log?.includes('卡特兰数'))).toBe(true);
  });
});
