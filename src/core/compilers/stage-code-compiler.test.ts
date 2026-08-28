import { describe, it, expect } from 'vitest';
import { StageCodeCompiler } from './stage-code-compiler';

describe('StageCodeCompiler (Deep Module Unit Tests)', () => {
  it('1. 成功编译阶段 1 递归模板并提取语义断点映射', () => {
    const res = StageCodeCompiler.compile('fibonacci', 'stage-1');
    expect(res.rawCode).toContain('class Solution');
    expect(res.rawCode).toContain('// @step:entry');
    expect(res.cleanCode).not.toContain('// @step:');
    expect(res.anchorLineMap.entry).toBeGreaterThan(0);
    expect(res.anchorLineMap.boundary).toBeGreaterThan(0);
    expect(res.anchorLineMap.combine).toBeGreaterThan(0);
  });

  it('2. 成功编译阶段 3 DP 填表模板并输出纯净 Java 源码', () => {
    const res = StageCodeCompiler.compile('longest-repeated-subarray', 'stage-3');
    expect(res.rawCode).toContain('int[][] dp = new int[m + 1][n + 1]');
    expect(res.cleanCode).not.toContain('// @step:');
    expect(res.cleanCode).toContain('dp[i][j] = dp[i - 1][j - 1] + 1;');
    expect(res.anchorLineMap.init).toBeGreaterThan(0);
    expect(res.anchorLineMap.transfer).toBeGreaterThan(0);
  });

  it('3. 当题目未显式定义专属模板时提供优雅的 Fallback 编译', () => {
    const res = StageCodeCompiler.compile('unknown-algo', 'stage-1', 'class Solution {\n    // custom\n}');
    expect(res.cleanCode).toContain('class Solution');
  });
});
