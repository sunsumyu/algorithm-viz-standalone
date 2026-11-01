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
    expect(focusedHtml).toContain('inline-token-focus');
    expect(focusedHtml).toContain('data-var="dp"');
    expect(focusedHtml).toContain('data-var="i"');
    expect(focusedHtml).toContain('data-var="j"');
  });

  it('should cleanly highlight summation expressions (e.g. fromTop + fromLeft) as ONE unified capsule', () => {
    const rawLine = 'dp[i][j] = fromTop + fromLeft;';
    const focusedHtml = highlightTokens(rawLine, 'java', 'fromTop + fromLeft');

    const focusCount = (focusedHtml.match(/class="inline-token-focus"/g) || []).length;
    expect(focusCount).toBe(1);
    expect(focusedHtml).toContain('inline-token-focus');
    expect(focusedHtml).toContain('data-var="fromTop"');
    expect(focusedHtml).toContain('data-var="fromLeft"');
  });

  it('should cleanly highlight conditional guards (e.g. i >= m, grid[i][j] == 1) as ONE unified capsule', () => {
    const rawLine = 'if (i >= m || j >= n || grid[i][j] == 1) return 0;';
    const focusedHtml = highlightTokens(rawLine, 'java', 'grid[i][j] == 1');

    const focusCount = (focusedHtml.match(/class="inline-token-focus"/g) || []).length;
    expect(focusCount).toBe(1);
    expect(focusedHtml).toContain('inline-token-focus');
    expect(focusedHtml).toContain('data-var="grid"');
  });

  it('should distinguish variables from function calls', () => {
    const rawLine = 'int p1 = f(a, b, i - 1, j);';
    const html = highlightTokens(rawLine, 'java');

    // f 后紧跟 '(' 应识别为函数
    expect(html).toContain('<span class="algo-code-token-func text-sky-300">f</span>');
    // p1, a, b, i, j 应当被标记为变量
    expect(html).toContain('data-var="p1"');
    expect(html).toContain('data-var="a"');
    expect(html).toContain('data-var="b"');
    expect(html).toContain('data-var="i"');
    expect(html).toContain('data-var="j"');
  });

  it('extractFunctionCallsFromLine and resolveInlineFocusTarget cleanly extract recursive calls across languages', async () => {
    const { extractFunctionCallsFromLine, resolveInlineFocusTarget } = await import('./renderers/terminal/code-line-renderer');

    // 1. Java: if (!isValidBST(root.left)) {
    const javaLine = '        if (!isValidBST(root.left)) {';
    expect(extractFunctionCallsFromLine(javaLine)).toEqual(['isValidBST(root.left)']);
    expect(resolveInlineFocusTarget(javaLine, 'java', { focusMode: 'recursive-call' })).toBe('isValidBST(root.left)');

    // 2. Python: if not self.isValidBST(root.left):
    const pyLine = '        if not self.isValidBST(root.left):';
    expect(extractFunctionCallsFromLine(pyLine)).toEqual(['self.isValidBST(root.left)']);
    expect(resolveInlineFocusTarget(pyLine, 'python', { focusMode: 'recursive-call' })).toBe('self.isValidBST(root.left)');

    // 3. JS: if (!inorder(node.left)) {
    const jsLine = '        if (!inorder(node.left)) {';
    expect(extractFunctionCallsFromLine(jsLine)).toEqual(['inorder(node.left)']);
    expect(resolveInlineFocusTarget(jsLine, 'javascript', { focusMode: 'recursive-call' })).toBe('inorder(node.left)');

    // 4. Return statement: return isValidBST(root.right);
    const retLine = '        return isValidBST(root.right);';
    expect(extractFunctionCallsFromLine(retLine)).toEqual(['isValidBST(root.right)']);
    expect(resolveInlineFocusTarget(retLine, 'java', { focusMode: 'recursive-call' })).toBe('isValidBST(root.right)');

    // 5. 渲染包含 inline-token-focus 胶囊
    const focusedHtml = highlightTokens(javaLine, 'java', 'isValidBST(root.left)');
    expect(focusedHtml).toContain('inline-token-focus');
    expect(focusedHtml).toContain('isValidBST');
  });

  it('StepNormalizationEngine synthesizes two-stage recursive call highlight on if statements without modifying code', async () => {
    const { buildVBSteps } = await import('./renderers/adapters/valid-bst-step-compiler');
    const { StepNormalizationEngine } = await import('./step-normalization-engine');
    const { buildTreeFromArr } = await import('../algorithms/categories/tree/tree-template');

    const tree = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
    const rawSteps = buildVBSteps(tree);
    const normalized = StepNormalizationEngine.normalize(rawSteps, {
      algorithmId: 'valid-bst',
      stageId: 'stage-1',
    });

    // 寻找进入左子树的步骤，验证两段式高亮（arrive ➔ focusMode: recursive-call）
    const arriveStep = (normalized as any[]).find((s) => s.action === 'recurse-left-arrive');
    const callStep = (normalized as any[]).find((s) => s.action === 'recurse-left' && s.focusMode === 'recursive-call');

    expect(arriveStep).toBeDefined();
    expect(arriveStep.codeLine).toEqual({ java: 7, cpp: 8, python: 8, javascript: 7 });
    expect(arriveStep.focusMode).toBeUndefined();

    expect(callStep).toBeDefined();
    expect(callStep.codeLine).toEqual({ java: 7, cpp: 8, python: 8, javascript: 7 });
    expect(callStep.focusMode).toBe('recursive-call');
  });
});
