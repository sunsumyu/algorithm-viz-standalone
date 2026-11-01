import { describe, it, expect } from 'vitest';
import { GridUniquePathsCompiler } from './grid-unique-paths-compiler';
import type { IYamlAlgorithmModel } from '../interfaces';

describe('GridUniquePathsCompiler Deep Module Test (Canonical Compiler Taxonomy)', () => {
  const modelUP: IYamlAlgorithmModel = {
    id: 'unique-paths',
    name: '不同路径',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: '不同路径测试',
    directions: {
      forward: {} as any,
      reverse: {} as any,
    },
    stages: {
      'stage-1': {} as any,
      'stage-2': {} as any,
      'stage-3': {} as any,
      'stage-4': {} as any,
    },
    defaultParams: { m: 3, n: 3 },
  };

  const modelUPII: IYamlAlgorithmModel = {
    id: 'unique-paths-ii',
    name: '不同路径 II',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: '不同路径 II 测试',
    directions: {
      forward: {} as any,
      reverse: {} as any,
    },
    stages: {
      'stage-1': {} as any,
      'stage-2': {} as any,
      'stage-3': {} as any,
      'stage-4': {} as any,
    },
    defaultParams: {
      m: 3,
      n: 3,
      obstacleGrid: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ],
    },
  };

  const modelMinPath: IYamlAlgorithmModel = {
    id: 'min-path-sum',
    name: '最小路径和',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: '最小路径和测试',
    directions: {
      forward: {} as any,
      reverse: {} as any,
    },
    stages: {
      'stage-1': {} as any,
      'stage-2': {} as any,
      'stage-3': {} as any,
      'stage-4': {} as any,
    },
    defaultParams: {
      m: 3,
      n: 3,
      grid: [
        [1, 3, 1],
        [1, 5, 1],
        [4, 2, 1],
      ],
    },
  };

  const modelDungeon: IYamlAlgorithmModel = {
    id: 'dungeon-game-reverse-dp',
    name: '地下城游戏',
    category: 'dynamic-programming',
    difficulty: 'hard',
    description: '地下城游戏反向 DP 测试',
    directions: {
      forward: {} as any,
      reverse: {} as any,
    },
    stages: {
      'stage-1': {} as any,
      'stage-2': {} as any,
      'stage-3': {} as any,
      'stage-4': {} as any,
    },
    defaultParams: {
      m: 3,
      n: 3,
      grid: [
        [-2, -3, 3],
        [-5, -10, 1],
        [10, 30, -5],
      ],
    },
  };

  describe('buildContext 上下文构建与参数归一化', () => {
    it('正确填充默认尺寸与方向', () => {
      const ctx = GridUniquePathsCompiler.buildContext(modelUP, { stage: 3 });
      expect(ctx.m).toBe(3);
      expect(ctx.n).toBe(3);
      expect(ctx.direction).toBe('forward');
      expect(ctx.isForward).toBe(true);
      expect(ctx.isDungeon).toBe(false);
      expect(ctx.isMinPath).toBe(false);
      expect(ctx.isUniquePathsII).toBe(false);
    });

    it('正确识别地下城与最小路径和特征', () => {
      const ctxMin = GridUniquePathsCompiler.buildContext(modelMinPath, { stage: 3 });
      expect(ctxMin.isMinPath).toBe(true);
      expect(ctxMin.isDungeon).toBe(false);

      const ctxDungeon = GridUniquePathsCompiler.buildContext(modelDungeon, { stage: 3, direction: 'reverse' });
      expect(ctxDungeon.isDungeon).toBe(true);
      expect(ctxDungeon.isForward).toBe(false);
    });
  });

  describe('Stage 1 & 2: 递归与记忆化搜索', () => {
    it('Stage 1 暴力搜索生成完整递归树', () => {
      const steps = GridUniquePathsCompiler.compile(modelUP, { stage: 1, m: 3, n: 3 });
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].type).toBe('dfs-call');
      expect(steps.some(s => s.type === 'boundary')).toBe(true);
      expect(steps.some(s => s.type === 'combine')).toBe(true);
      expect(steps[steps.length - 1].type).toBe('return');
    });

    it('Stage 2 记忆化剪枝后步骤数显著少于 Stage 1', () => {
      const s1Steps = GridUniquePathsCompiler.compile(modelUP, { stage: 1, m: 3, n: 3 });
      const s2Steps = GridUniquePathsCompiler.compile(modelUP, { stage: 2, m: 3, n: 3, isMemo: true });
      expect(s2Steps.length).toBeLessThan(s1Steps.length);
      expect(s2Steps.some(s => s.type === 'cache-hit')).toBe(true);
    });
  });

  describe('Stage 3: 二维 DP 填表与结果计算', () => {
    it('不同路径 3x3 最终返回 6 且首帧全为 null', () => {
      const steps = GridUniquePathsCompiler.compile(modelUP, { stage: 3, m: 3, n: 3 });
      const initStep = steps.find(s => s.type === 'init');
      expect(initStep).toBeDefined();
      const nonNullInit = initStep?.grid?.flatMap(r => r).filter(c => c !== null);
      expect(nonNullInit?.length).toBe(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.grid?.[2]?.[2]).toBe(6);
    });

    it('不同路径 II 能够正确识别障碍物', () => {
      const steps = GridUniquePathsCompiler.compile(modelUPII, { stage: 3, m: 3, n: 3 });
      const obstacleStep = steps.find(s => s.type === 'obstacle-cell');
      expect(obstacleStep).toBeDefined();
      expect(obstacleStep?.i).toBe(1);
      expect(obstacleStep?.j).toBe(1);
    });

    it('最小路径和正确计算结果 (1->3->1->1->1 = 7)', () => {
      const steps = GridUniquePathsCompiler.compile(modelMinPath, { stage: 3, m: 3, n: 3 });
      const lastStep = steps[steps.length - 1];
      expect(lastStep.grid?.[2]?.[2]).toBe(7);
    });
  });

  describe('Stage 4: 一维滚动数组优化', () => {
    it('不同路径 Stage 4 返回正确最终答案', () => {
      const steps = GridUniquePathsCompiler.compile(modelUP, { stage: 4, m: 3, n: 3, stageVariant: 'if' });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.memo?.[2]).toBe(6);
    });

    it('逆推方向能够正确执行并生成充分有效步骤', () => {
      const forwardSteps = GridUniquePathsCompiler.compile(modelUP, { stage: 4, m: 3, n: 3, direction: 'forward' });
      const reverseSteps = GridUniquePathsCompiler.compile(modelUP, { stage: 4, m: 3, n: 3, direction: 'reverse' });
      expect(reverseSteps.length).toBeGreaterThan(4);
      expect(reverseSteps[0].type).toBe('init');
      // 逆推不能与顺推 100% 相同
      expect(reverseSteps).not.toEqual(forwardSteps);
    });
  });
});
