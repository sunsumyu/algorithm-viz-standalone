import { describe, it, expect } from 'vitest';
import { highlightTokens } from './code-highlighter';

describe('🛡️ CodeHighlighter Lexer & Inline Focus Unit Tests', () => {
  it('should highlight keywords, types, and numbers cleanly without HTML corruption', () => {
    const rawLine = 'int fromTop = (i > 0) ? dp[i - 1][j] : 0;';
    const html = highlightTokens(rawLine, 'java');

    expect(html).toContain('algo-code-token-keyword');
    expect(html).toContain('algo-code-token-number');
    expect(html).not.toContain('<span class="inline-token-focus">');
  });

  it('should safely focus the target token (number 0) without breaking class attributes', () => {
    const rawLine = 'int fromTop = (i > 0) ? dp[i - 1][j] : 0;';
    const focusedHtml = highlightTokens(rawLine, 'java', '0');

    // 必须包含聚焦 class
    expect(focusedHtml).toContain('inline-token-focus');
    // 绝对不能破坏 HTML 属性
    expect(focusedHtml).not.toContain('30<span');

    // 验证末尾的 0 被包裹在单一 inline-token-focus 胶囊中
    expect(focusedHtml).toContain('<span class="inline-token-focus"><span class="algo-code-token-number text-amber-300 font-bold">0</span></span>;');
  });

  it('should cleanly highlight multi-token sub-expressions (e.g. dp[i - 1][j]) as ONE unified capsule', () => {
    const rawLine = 'int fromTop = (i > 0) ? dp[i - 1][j] : 0;';
    const focusedHtml = highlightTokens(rawLine, 'java', 'dp[i - 1][j]');

    // 必须只有 1 个统一的外层 inline-token-focus 胶囊框，杜绝碎块化
    const focusCount = (focusedHtml.match(/class="inline-token-focus"/g) || []).length;
    expect(focusCount).toBe(1);
    expect(focusedHtml).toContain('<span class="inline-token-focus">dp[i - <span class="algo-code-token-number text-amber-300 font-bold">1</span>][j]</span>');
  });

  it('should cleanly highlight summation expressions (e.g. fromTop + fromLeft) as ONE unified capsule', () => {
    const rawLine = 'dp[i][j] = fromTop + fromLeft;';
    const focusedHtml = highlightTokens(rawLine, 'java', 'fromTop + fromLeft');

    const focusCount = (focusedHtml.match(/class="inline-token-focus"/g) || []).length;
    expect(focusCount).toBe(1);
    expect(focusedHtml).toContain('<span class="inline-token-focus">fromTop + fromLeft</span>');
  });

  it('should cleanly highlight conditional guards (e.g. i >= m, grid[i][j] == 1) as ONE unified capsule', () => {
    const rawLine = 'if (i >= m || j >= n || grid[i][j] == 1) return 0;';
    const focusedHtml = highlightTokens(rawLine, 'java', 'grid[i][j] == 1');

    const focusCount = (focusedHtml.match(/class="inline-token-focus"/g) || []).length;
    expect(focusCount).toBe(1);
    expect(focusedHtml).toContain('<span class="inline-token-focus">grid[i][j] == <span class="algo-code-token-number text-amber-300 font-bold">1</span></span>');
  });
});
