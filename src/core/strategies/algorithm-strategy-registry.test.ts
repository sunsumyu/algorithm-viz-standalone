import { describe, it, expect, beforeEach } from 'vitest';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

describe('AlgorithmStrategyRegistry (策略注册表深层模块)', () => {
  beforeEach(() => {
    AlgorithmStrategyRegistry.clear();
  });

  const mockModel: IYamlAlgorithmModel = {
    id: 'mock-unique-paths',
    title: '不同路径模拟',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: '测试用例',
    stages: [],
    defaultParams: { m: 3, n: 3 }
  };

  it('能够成功注册策略并在查询时返回', () => {
    const mockStrategy: IAlgorithmStrategy = {
      modelId: 'mock-unique-paths',
      canHandle: (id) => id === 'mock-unique-paths',
      generateSteps: () => [{ type: 'dfs-call', i: 0, j: 0 }]
    };

    AlgorithmStrategyRegistry.register(mockStrategy);
    expect(AlgorithmStrategyRegistry.has('mock-unique-paths')).toBe(true);
    expect(AlgorithmStrategyRegistry.get('mock-unique-paths')).toBe(mockStrategy);
  });

  it('未注册策略时 tryGenerate 应该安全返回 null', () => {
    const params: StageExecutionParams = { stage: 1, m: 3, n: 3 };
    const res = AlgorithmStrategyRegistry.tryGenerate(mockModel, params);
    expect(res).toBeNull();
  });

  it('已注册策略时 tryGenerate 应该正确派发并返回生成的步骤', () => {
    const expectedStep: UniversalStep = {
      type: 'test-step',
      i: 1,
      j: 1,
      tag: '策略输出'
    };

    const mockStrategy: IAlgorithmStrategy = {
      modelId: 'mock-unique-paths',
      canHandle: (id) => id === 'mock-unique-paths',
      generateSteps: (_model, params) => {
        expect(params.stage).toBe(2);
        return [expectedStep];
      }
    };

    AlgorithmStrategyRegistry.register(mockStrategy);
    const params: StageExecutionParams = { stage: 2, m: 3, n: 3, isMemo: true };
    const res = AlgorithmStrategyRegistry.tryGenerate(mockModel, params);

    expect(res).not.toBeNull();
    expect(res).toHaveLength(1);
    expect(res![0].tag).toBe('策略输出');
  });
});
