import { describe, it, expect, beforeEach } from 'vitest';
import { CodeStepIndexer, codeStepIndexer } from './code-step-indexer';

describe('CodeStepIndexer', () => {
  beforeEach(() => {
    codeStepIndexer.clear();
  });

  it('compiles multi-language code snippets and extracts physical line numbers', () => {
    const rawJava = [
      'class Solution {',
      '    public int uniquePaths(int m, int n) { // @step:entry',
      '        int[] dp = new int[n]; // @step:init',
      '        Arrays.fill(dp, 1);',
      '        for (int i = 1; i < m; i++) { // @step:loop-outer',
      '            for (int j = 1; j < n; j++) { // @step:loop-inner',
      '                dp[j] += dp[j - 1]; // @step:update',
      '            }',
      '        }',
      '        return dp[n - 1]; // @step:return',
      '    }',
      '}',
    ];

    const rawPython = [
      'class Solution:',
      '    def uniquePaths(self, m: int, n: int) -> int: # @step:entry',
      '        dp = [1] * n # @step:init',
      '        for i in range(1, m): # @step:loop-outer',
      '            for j in range(1, n): # @step:loop-inner',
      '                dp[j] += dp[j - 1] # @step:update',
      '        return dp[n - 1] # @step:return',
    ];

    const rawCpp = [
      'class Solution {',
      'public:',
      '    int uniquePaths(int m, int n) { // @step:entry',
      '        vector<int> dp(n, 1); // @step:init',
      '        for (int i = 1; i < m; i++) { // @step:loop-outer',
      '            for (int j = 1; j < n; j++) { // @step:loop-inner',
      '                dp[j] += dp[j - 1]; // @step:update',
      '            }',
      '        }',
      '        return dp[n - 1]; // @step:return',
      '    }',
      '};',
    ];

    const rawJs = [
      'function uniquePaths(m, n) { // @step:entry',
      '    const dp = new Array(n).fill(1); // @step:init',
      '    for (let i = 1; i < m; i++) { // @step:loop-outer',
      '        for (let j = 1; j < n; j++) { // @step:loop-inner',
      '            dp[j] += dp[j - 1]; // @step:update',
      '        }',
      '    }',
      '    return dp[n - 1]; // @step:return',
      '}',
    ];

    const compiled = codeStepIndexer.register('unique-paths:space-optimized', {
      java: rawJava,
      python: rawPython,
      cpp: rawCpp,
      javascript: rawJs,
    });

    // Verify clean code strips @step annotations
    expect(compiled.cleanCode.java[1]).toBe('    public int uniquePaths(int m, int n) {');
    expect(compiled.cleanCode.java[6]).toBe('                dp[j] += dp[j - 1];');
    expect(compiled.cleanCode.python[5]).toBe('                dp[j] += dp[j - 1]');

    // Query update statement across 4 languages
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'update', 'java')).toBe(7);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'update', 'python')).toBe(6);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'update', 'cpp')).toBe(7);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'update', 'javascript')).toBe(5);

    // Query return statement across 4 languages
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'return', 'java')).toBe(10);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'return', 'python')).toBe(7);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'return', 'cpp')).toBe(10);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'return', 'javascript')).toBe(8);

    // Query loop-outer statement across 4 languages
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'loop-outer', 'java')).toBe(5);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'loop-outer', 'python')).toBe(4);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'loop-outer', 'cpp')).toBe(5);
    expect(codeStepIndexer.resolveHighlight('unique-paths:space-optimized', 'loop-outer', 'javascript')).toBe(3);
  });

  it('handles multiple anchors on single line and optional context args', () => {
    const rawJava = [
      'class Solution {',
      '    int[] dp = new int[n]; // @step:alloc @step:init',
      '    dp[j] += dp[j-1]; // @step:update(ctx:5,6)',
      '}',
    ];

    codeStepIndexer.register('test-algo', { java: rawJava });

    expect(codeStepIndexer.resolveHighlight('test-algo', 'alloc', 'java')).toBe(2);
    expect(codeStepIndexer.resolveHighlight('test-algo', 'init', 'java')).toBe(2);

    const updateTarget = codeStepIndexer.resolveHighlight('test-algo', 'update', 'java');
    expect(updateTarget).toEqual({ primary: 3, context: [5, 6] });
  });

  it('returns null for unregistered keys or missing anchors gracefully', () => {
    expect(codeStepIndexer.resolveHighlight('non-existent', 'update', 'java')).toBeNull();
    codeStepIndexer.register('dummy', { java: ['int x = 1;'] });
    expect(codeStepIndexer.resolveHighlight('dummy', 'missing-anchor', 'java')).toBeNull();
  });
});
