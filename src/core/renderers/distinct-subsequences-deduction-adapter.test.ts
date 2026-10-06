import { describe, it, expect } from 'vitest';
import { DistinctSubsequencesDeductionAdapter } from './distinct-subsequences-deduction-adapter';

describe('DistinctSubsequencesDeductionAdapter', () => {
  it('should generate correct mathematical DP values for babgbag and bag', () => {
    const data = DistinctSubsequencesDeductionAdapter.generateDeductionData('babgbag', 'bag');
    expect(data.m).toBe(7);
    expect(data.n).toBe(3);
    expect(data.dp[7][3]).toBe(5);

    // Base cases
    for (let i = 0; i <= 7; i++) {
      expect(data.dp[i][0]).toBe(1);
    }
    expect(data.dp[0][1]).toBe(0);
    expect(data.dp[0][2]).toBe(0);
    expect(data.dp[0][3]).toBe(0);

    // Loop steps
    expect(data.loopRounds.length).toBe(7);
    expect(data.loopRounds[0].innerSteps.length).toBe(3);
  });

  it('should render HTML with all 3 phases into container', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    DistinctSubsequencesDeductionAdapter.renderDeduction(container, { s: 'babgbag', t: 'bag' });

    expect(container.innerHTML).toContain('第一阶段：填 Base Case');
    expect(container.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(container.innerHTML).toContain('第三阶段：返回结果');
    expect(container.innerHTML).toContain('dp[7][3]');
    expect(container.innerHTML).toContain('最终返回 <span class="text-lg text-emerald-600 font-mono underline">5</span>');
  });
});
