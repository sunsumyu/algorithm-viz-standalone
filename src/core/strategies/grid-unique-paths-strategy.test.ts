import { describe, it, expect } from 'vitest';
import { GridUniquePathsStrategy } from './grid-unique-paths-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';

describe('GridUniquePathsStrategy (不同路径独立策略模块)', () => {
  const strategy = new GridUniquePathsStrategy('unique-paths');
  const strategyII = new GridUniquePathsStrategy('unique-paths-ii');

  const modelUP: IYamlAlgorithmModel = {
    id: 'unique-paths',
    title: '不同路径',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: '不同路径测试',
    stages: [],
    defaultParams: { m: 3, n: 3 }
  };

  const modelUPII: IYamlAlgorithmModel = {
    id: 'unique-paths-ii',
    title: '不同路径 II',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: '不同路径 II 测试',
    stages: [],
    defaultParams: {
      m: 3,
      n: 3,
      obstacleGrid: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ]
    }
  };

  it('Stage 1 & 2: 能够正确生成阶段 1 (递归) 和阶段 2 (记忆化) 步骤', () => {
    const s1Steps = strategy.generateSteps(modelUP, { stage: 1, m: 3, n: 3 });
    expect(s1Steps.length).toBeGreaterThan(0);
    expect(s1Steps[0].type).toBe('dfs-call');

    const s2Steps = strategy.generateSteps(modelUP, { stage: 2, m: 3, n: 3, isMemo: true });
    expect(s2Steps.length).toBeGreaterThan(0);
    expect(s2Steps.length).toBeLessThan(s1Steps.length); // 记忆化剪枝后步骤数显著更少
  });

  it('Stage 3: 能够正确生成阶段 3 二维 DP 填表步骤并计算最终结果', () => {
    const s3Steps = strategy.generateSteps(modelUP, { stage: 3, m: 3, n: 3 });
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastStep = s3Steps[s3Steps.length - 1];
    expect(lastStep.type).toBe('return');
    expect(lastStep.grid?.[2]?.[2]).toBe(6); // 3x3 unique paths = 6
  });

  it('Stage 4: 能够正确生成阶段 4 一维空间优化步骤', () => {
    const s4Steps = strategy.generateSteps(modelUP, { stage: 4, m: 3, n: 3, stageVariant: 'if' });
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastStep = s4Steps[s4Steps.length - 1];
    expect(lastStep.type).toBe('return');
  });

  it('Unique Paths II: 包含障碍物时能够正确阻断并标记 obstacleGrid', () => {
    const steps = strategyII.generateSteps(modelUPII, { stage: 3, m: 3, n: 3 });
    const obstacleStep = steps.find(s => s.type === 'obstacle-cell');
    expect(obstacleStep).toBeDefined();
    expect(obstacleStep?.i).toBe(1);
    expect(obstacleStep?.j).toBe(1);
  });
});
