import { describe, it, expect, beforeEach } from 'vitest';
import { CodePanel } from './code-panel';

// Lightweight DOM mock for node test environment
class MockHTMLElement {
  public tagName: string;
  public className = '';
  public innerHTML = '';
  private _textContent = '';
  public get textContent(): string {
    if (this.children.length > 0) {
      return this.children.map((c) => c.textContent).join('');
    }
    return this._textContent;
  }
  public set textContent(val: string) {
    this._textContent = val;
  }
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public children: MockHTMLElement[] = [];
  public parentElement: MockHTMLElement | null = null;
  public title = '';
  private listeners: Record<string, Array<() => void>> = {};

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  appendChild<T extends MockHTMLElement>(child: T): T {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild<T extends MockHTMLElement>(child: T): T {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }

  get classList() {
    const self = this;
    return {
      add(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.add(c));
        self.className = Array.from(set).join(' ');
      },
      remove(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.delete(c));
        self.className = Array.from(set).join(' ');
      },
      toggle(cls: string, force?: boolean) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        const shouldAdd = force !== undefined ? force : !set.has(cls);
        if (shouldAdd) set.add(cls);
        else set.delete(cls);
        self.className = Array.from(set).join(' ');
        return shouldAdd;
      },
      contains(cls: string) {
        return self.className.split(' ').includes(cls);
      },
    };
  }

  addEventListener(event: string, handler: () => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: () => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }

  dispatchEvent(event: { type: string }) {
    (this.listeners[event.type] || []).forEach((h) => h());
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  querySelector(selector: string): MockHTMLElement | null {
    const match = this.matchSelector(selector);
    if (match) return match;
    for (const child of this.children) {
      const res = child.querySelector(selector);
      if (res) return res;
    }
    return null;
  }

  querySelectorAll(selector: string): MockHTMLElement[] {
    const results: MockHTMLElement[] = [];
    if (this.matchSelector(selector)) results.push(this);
    for (const child of this.children) {
      results.push(...child.querySelectorAll(selector));
    }
    return results;
  }

  private matchSelector(selector: string): MockHTMLElement | null {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.classList.contains(cls) ? this : null;
    }
    if (selector.startsWith('#')) {
      return null;
    }
    if (selector.startsWith('[')) {
      return null;
    }
    return this.tagName.toLowerCase() === selector.toLowerCase() ? this : null;
  }

  scrollIntoView() {}
}

// Attach globals for testing
(globalThis as any).document = {
  createElement: (tag: string) => new MockHTMLElement(tag),
};
(globalThis as any).window = globalThis;

describe('CodePanel with Line Explanations and Key Points', () => {
  let container: any;

  beforeEach(() => {
    container = (globalThis as any).document.createElement('div');
  });

  it('renders code lines and default heuristic explanations', () => {
    const lines = [
      'public int minDistance(String word1, String word2) {',
      '    int m = word1.length(), n = word2.length();',
      '    int[][] dp = new int[m + 1][n + 1];',
      '    for (int i = 1; i <= m; i++) {',
      '        if (word1.charAt(i-1) == word2.charAt(j-1)) {',
      '            dp[i][j] = dp[i-1][j-1];',
      '        }',
      '    }',
      '    return dp[m][n];',
      '}',
    ];

    const panel = new CodePanel(container as any, {
      lines,
      title: '测试代码',
    });

    const codeLines = container.querySelectorAll('.algo-code-line');
    expect(codeLines.length).toBe(lines.length);

    const explanationEl = container.querySelector('.algo-code-explanation');
    expect(explanationEl).not.toBeNull();

    panel.destroy();
  });

  it('renders custom lineExplanations and updates on highlight', () => {
    const lines = [
      'int m = word1.length();',
      'dp[i][j] = dp[i-1][j-1];',
    ];

    const panel = new CodePanel(container as any, {
      lines,
      lineExplanations: {
        1: '第一行自定义说明：提取源字符串长度',
        2: '第二行自定义说明：两端字符相同，直接继承对角线',
      },
    });

    const expBody = container.querySelector('.algo-code-exp-body');
    expect(expBody.innerHTML).toContain('提取源字符串长度');

    panel.highlight(2);
    expect(expBody.innerHTML).toContain('两端字符相同，直接继承对角线');

    const expLineNum = container.querySelector('.exp-line-num');
    expect(expLineNum.textContent).toBe('2');

    panel.destroy();
  });

  it('renders key points and switches between code, walkthrough, and keypoints views', () => {
    const lines = ['int x = 1;'];
    const panel = new CodePanel(container as any, {
      lines,
      keyPoints: {
        title: '🎯 核心考点',
        summary: '算法概要总结',
        points: [
          { label: '一、状态定义', desc: 'dp[i] 表示前 i 个字符的解', icon: '🎯', badge: '核心' },
          { label: '二、转移方程', desc: 'dp[i] = dp[i-1] + 1', icon: '⚡' },
        ],
      },
    });

    const viewTabs = container.querySelectorAll('.algo-code-view-tab');
    expect(viewTabs.length).toBe(4);

    const contentEl = container.querySelector('.algo-code-content') as HTMLElement;
    const walkthroughEl = container.querySelector('.algo-code-walkthrough-container') as HTMLElement;
    const keypointsEl = container.querySelector('.algo-code-keypoints-container') as HTMLElement;
    const problemEl = container.querySelector('.algo-problem-container') as HTMLElement;
    expect(contentEl.style.display).not.toBe('none');
    expect(walkthroughEl.style.display).toBe('none');
    expect(keypointsEl.style.display).toBe('none');
    expect(problemEl.style.display).toBe('none');

    // Switch to walkthrough
    panel.switchView('walkthrough');
    expect(contentEl.style.display).toBe('none');
    expect(walkthroughEl.style.display).not.toBe('none');
    expect(keypointsEl.style.display).toBe('none');

    // Switch to keypoints
    panel.switchView('keypoints');
    expect(contentEl.style.display).toBe('none');
    expect(walkthroughEl.style.display).toBe('none');
    expect(keypointsEl.style.display).not.toBe('none');

    // Switch to problem
    panel.switchView('problem');
    expect(contentEl.style.display).toBe('none');
    expect(walkthroughEl.style.display).toBe('none');
    expect(keypointsEl.style.display).toBe('none');
    expect(problemEl.style.display).not.toBe('none');

    // Switch back to code
    panel.switchView('code');
    expect(contentEl.style.display).toBe('block');
    expect(walkthroughEl.style.display).toBe('none');
    expect(keypointsEl.style.display).toBe('none');
    expect(problemEl.style.display).toBe('none');

    panel.destroy();
  });

  it('supports inspecting mode and restores executing explanation on highlight', () => {
    const lines = [
      'const dp = Array(n + 1).fill(0);',
      'dp[0] = 0; dp[1] = 1;',
      'for (let i = 2; i <= n; i++) {',
      '  dp[i] = dp[i-1] + dp[i-2];',
      '}',
      'return dp[n];',
    ];

    const panel = new CodePanel(container as any, {
      lines,
      lineExplanations: {
        1: '一维数组初始化',
        4: '状态转移方程执行',
      },
    });

    panel.highlight(4);
    const expTag = container.querySelector('.algo-code-exp-tag');
    const expLineNum = container.querySelector('.exp-line-num');
    const expBody = container.querySelector('.algo-code-exp-body');

    expect(expLineNum.textContent).toBe('4');
    expect(expBody.innerHTML).toContain('状态转移方程执行');
    expect(expTag.textContent).toContain('💡 正在执行：第');

    // Inspecting line 1
    panel.setExplanation(1, undefined, 'inspecting');
    expect(expLineNum.textContent).toBe('1');
    expect(expBody.innerHTML).toContain('一维数组初始化');
    expect(expTag.textContent).toContain('🔍 查看精解：第');

    // Trigger mouseleave on contentEl
    const contentEl = container.querySelector('.algo-code-content');
    contentEl.dispatchEvent({ type: 'mouseleave' });
    expect(expLineNum.textContent).toBe('4');
    expect(expBody.innerHTML).toContain('状态转移方程执行');
    expect(expTag.textContent).toContain('💡 正在执行：第');

    panel.destroy();
  });
});
