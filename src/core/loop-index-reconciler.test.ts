import { describe, it, expect } from 'vitest';
import { LoopIndexReconciler } from './loop-index-reconciler';

describe('LoopIndexReconciler Deep Module Unit Tests', () => {
  it('1. 自动嗅探 Java/C++ 中的 1-based for 循环与 dp[i - 1] 依赖', () => {
    const javaCode = `
      int[][] dp = new int[n + 1][m + 1];
      for (int i = 1; i <= n; i++) {
          for (int j = 0; j <= m; j++) {
              dp[i][j] = dp[i - 1][j];
          }
      }
    `;

    const contracts = LoopIndexReconciler.snifferContracts(javaCode);
    expect(contracts.has('i')).toBe(true);
    const iContract = contracts.get('i')!;
    expect(iContract.startIndex).toBe(1);
    expect(iContract.isOneBased).toBe(true);

    expect(contracts.has('j')).toBe(true);
    const jContract = contracts.get('j')!;
    expect(jContract.startIndex).toBe(0);
    expect(jContract.isOneBased).toBe(false);
  });

  it('2. 自动嗅探 Python 中的 range(1, n + 1) 1-based 循环', () => {
    const pyCode = `
      for i in range(1, n + 1):
          for j in range(m + 1):
              dp[i][j] = dp[i - 1][j]
    `;

    const contracts = LoopIndexReconciler.snifferContracts(pyCode);
    expect(contracts.get('i')?.isOneBased).toBe(true);
    expect(contracts.get('j')?.isOneBased).toBe(false);
  });

  it('3. 当代码是 1-based (i = 1) 且传入 0 时，自动校准为 1', () => {
    const javaCode = `
      for (int i = 1; i <= n; i++) {
          dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - k] + preSum[k]);
      }
    `;

    const res = LoopIndexReconciler.reconcileVariableValue(
      'i',
      0,
      javaCode,
      'dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - k] + preSum[k]);'
    );

    expect(res.isAdjusted).toBe(true);
    expect(res.value).toBe('1');
  });

  it('4. 当代码本身是 0-based (for int i = 0; ...) 时，传入 0 不被错误篡改', () => {
    const code0Based = `
      for (int i = 0; i < n; i++) {
          process(i);
      }
    `;

    const res = LoopIndexReconciler.reconcileVariableValue('i', 0, code0Based, 'process(i);');
    expect(res.isAdjusted).toBe(false);
    expect(res.value).toBe('0');
  });
});
