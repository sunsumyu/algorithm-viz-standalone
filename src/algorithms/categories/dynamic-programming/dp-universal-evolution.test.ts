import { describe, it, expect } from 'vitest';
import {
  EVOLUTION_MODES,
  getEvolutionCodeForAlgorithm,
  buildUniversalEvolutionSteps,
} from './dp-universal-evolution';

describe('Universal DP Evolution Engine', () => {
  it('should export all 4 evolution modes with correct labels and complexity badges', () => {
    expect(EVOLUTION_MODES).toHaveLength(4);
    const ids = EVOLUTION_MODES.map((m) => m.id);
    expect(ids).toEqual(['naive-recursive', 'memo-topdown', 'tabulation-bottomup', 'space-optimized']);
    expect(EVOLUTION_MODES[0].badge).toContain('O(2ⁿ)');
    expect(EVOLUTION_MODES[1].badge).toContain('O(n)');
    expect(EVOLUTION_MODES[2].badge).toContain('O(n)');
    expect(EVOLUTION_MODES[3].badge).toContain('O(1)');
  });

  it('should generate stage-tailored multi-language code for any DP algorithm', () => {
    const baseLines = ['int[] dp = new int[n + 1];'];
    const naive = getEvolutionCodeForAlgorithm('爬楼梯', baseLines, undefined, undefined, undefined, 'naive-recursive');
    expect(naive.languages.java).toBeDefined();
    expect(naive.languages.python).toBeDefined();
    expect(naive.languages.cpp).toBeDefined();
    expect(naive.languages.javascript).toBeDefined();
    expect(naive.languages.java.join('\n')).toContain('helper');

    const memo = getEvolutionCodeForAlgorithm('爬楼梯', baseLines, undefined, undefined, undefined, 'memo-topdown');
    expect(memo.languages.java.join('\n')).toContain('memo');

    const space = getEvolutionCodeForAlgorithm('爬楼梯', baseLines, undefined, undefined, undefined, 'space-optimized');
    expect(space.languages.java.join('\n')).toContain('prev2');
  });

  it('should generate grid-tailored multi-language code and steps for unique-paths (both backward and forward)', () => {
    const baseLines = ['int[][] dp = new int[m][n];'];
    
    // 1. Backward recursion (Default: matches user Java memo screenshot)
    const naiveBackward = getEvolutionCodeForAlgorithm('不同路径', baseLines, undefined, undefined, undefined, 'naive-recursive', 'unique-paths', 'backward');
    expect(naiveBackward.languages.java.join('\n')).toContain('dfs(m - 1, n - 1)');
    expect(naiveBackward.languages.java.join('\n')).toContain('left + up');

    const memoBackward = getEvolutionCodeForAlgorithm('不同路径', baseLines, undefined, undefined, undefined, 'memo-topdown', 'unique-paths', 'backward');
    expect(memoBackward.languages.java.join('\n')).toContain('int[][] memo');
    expect(memoBackward.languages.java.join('\n')).toContain('memo[i][j] = left + up');

    // 2. Forward recursion
    const naiveForward = getEvolutionCodeForAlgorithm('不同路径', baseLines, undefined, undefined, undefined, 'naive-recursive', 'unique-paths', 'forward');
    expect(naiveForward.languages.java.join('\n')).toContain('dfs(0, 0, m, n)');
    expect(naiveForward.languages.java.join('\n')).toContain('down + right');

    const space = getEvolutionCodeForAlgorithm('不同路径', baseLines, undefined, undefined, undefined, 'space-optimized', 'unique-paths');
    expect(space.languages.java.join('\n')).toContain('memo[j] = right + down');

    const mockGridBuilder = () => [
      {
        message: 'tabulation step',
        log: 'tabulation step',
        dp2d: [[1, 1, 1], [1, 2, 3], [1, 3, 6]],
        thematicMeta: { type: 'grid' as const, grid: { rows: 3, cols: 3, curRow: 2, curCol: 2 } },
      },
    ];

    // Backward steps
    const gridNaiveBackward = buildUniversalEvolutionSteps('unique-paths', mockGridBuilder, { m: 3, n: 3, direction: 'backward' }, 'two-phase', 'naive-recursive');
    expect(gridNaiveBackward.length).toBeGreaterThan(1);
    expect(gridNaiveBackward[0].message).toContain('uniquePaths(3, 3)');
    expect(gridNaiveBackward[0].message).toContain('倒序');
    expect(gridNaiveBackward.some((s) => s.tree != null)).toBe(true);
    expect(gridNaiveBackward.some((s) => s.message.includes('Base Case 命中') && s.message.includes('第 0 行或第 0 列'))).toBe(true);

    const gridMemoBackward = buildUniversalEvolutionSteps('unique-paths', mockGridBuilder, { m: 3, n: 3, direction: 'backward' }, 'two-phase', 'memo-topdown');
    expect(gridMemoBackward.length).toBeGreaterThan(1);
    expect(gridMemoBackward.some((s) => s.message.includes('备忘录命中剪枝'))).toBe(true);

    // Forward steps
    const gridNaiveForward = buildUniversalEvolutionSteps('unique-paths', mockGridBuilder, { m: 3, n: 3, direction: 'forward' }, 'two-phase', 'naive-recursive');
    expect(gridNaiveForward.length).toBeGreaterThan(1);
    expect(gridNaiveForward.some((s) => s.message.includes('越界判断'))).toBe(true);

    // Space-optimized steps
    const gridSpace = buildUniversalEvolutionSteps('unique-paths', mockGridBuilder, { m: 3, n: 3 }, 'two-phase', 'space-optimized');
    expect(gridSpace.length).toBeGreaterThan(1);
    expect(gridSpace[0].dp1d).toBeDefined();
    // 验证逐行单步步进是否完整进到了 memo[j] = right + down 累加更新核心执行行 (Java 行 12)
    const updateSteps = gridSpace.filter((s) => {
      const codeLineAny = s.codeLine as any;
      const p = codeLineAny?.java?.primary ?? codeLineAny?.java;
      return p === 12;
    });
    expect(updateSteps.length).toBe(4); // (3-1)*(3-1) = 4 个累加更新
    expect(updateSteps[0].message).toContain('memo[');

    // 验证外层循环行、内层循环行、返回行的代码行精准度
    expect(gridSpace.some((s) => [5, 6].includes((s.codeLine as any)?.java?.primary ?? (s.codeLine as any)?.java))).toBe(true);
    expect(gridSpace.some((s) => [6, 7].includes((s.codeLine as any)?.java?.primary ?? (s.codeLine as any)?.java))).toBe(true);
    expect(gridSpace.some((s) => [11, 16].includes((s.codeLine as any)?.java?.primary ?? (s.codeLine as any)?.java))).toBe(true);
  });

  it('should generate staircase steps for climb-stairs across all evolution stages', () => {
    const mockLinearBuilder = () => [
      {
        message: 'tabulation step',
        log: 'tabulation step',
        dp1d: ['-', 1, 2, 3, 5, 8, 13],
        staircase: { totalSteps: 6, dp: ['-', 1, 2, 3, 5, 8, 13], currentStep: 6, characterPosition: 6 },
      },
    ];

    const naiveSteps = buildUniversalEvolutionSteps('climb-stairs', mockLinearBuilder, { n: 6 }, 'two-phase', 'naive-recursive');
    expect(naiveSteps.length).toBeGreaterThan(1);
    expect(naiveSteps[0].tree).toBeDefined();
    expect(naiveSteps[0].staircase).toBeDefined();

    const memoSteps = buildUniversalEvolutionSteps('climb-stairs', mockLinearBuilder, { n: 6 }, 'two-phase', 'memo-topdown');
    expect(memoSteps.length).toBeGreaterThan(1);
    expect(memoSteps[0].tree).toBeDefined();
    expect(memoSteps[0].staircase).toBeDefined();

    const spaceSteps = buildUniversalEvolutionSteps('climb-stairs', mockLinearBuilder, { n: 6 }, 'two-phase', 'space-optimized');
    expect(spaceSteps.length).toBeGreaterThan(1);
    expect(spaceSteps[0].rollingVars).toBeDefined();
    expect(spaceSteps[0].staircase).toBeDefined();
  });
});

