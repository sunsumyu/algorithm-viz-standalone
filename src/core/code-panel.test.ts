import { describe, it, expect, beforeEach } from 'vitest';
import { CodePanel } from './code-panel';

// Lightweight DOM mock for node test environment
class MockHTMLElement {
  public tagName: string;
  public id = '';
  public className = '';
  private _innerHTML = '';
  public get innerHTML(): string {
    return this._innerHTML;
  }
  public set innerHTML(val: string) {
    this._innerHTML = val;
    if (val === '') {
      this.children = [];
    }
  }
  public value = '';
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
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      return this.id === id ? this : null;
    }
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.classList.contains(cls) ? this : null;
    }
    if (selector.startsWith('[')) {
      const match = selector.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
      if (match) {
        const attr = match[1];
        const val = match[2];
        if (attr.startsWith('data-')) {
          const key = attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (val === undefined) return this.dataset[key] !== undefined ? this : null;
          return this.dataset[key] === val ? this : null;
        }
      }
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

describe('CodePanel Adapter over DarkCodeTerminalPresenter', () => {
  let container: any;

  beforeEach(() => {
    container = (globalThis as any).document.createElement('div');
  });

  it('renders code lines and highlights active lines via DarkCodeTerminalPresenter', () => {
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

    panel.highlight(3);
    expect(codeLines[2].classList.contains('is-active')).toBe(true);

    panel.destroy();
  });

  it('renders custom lineExplanations and accesses via codeModel', () => {
    const lines = [
      'int m = word1.length();',
      'dp[i][j] = dp[i-1][j-1];',
    ];

    const panel = new CodePanel(container as any, {
      lines,
      language: 'java',
      lineExplanations: {
        1: '第一行自定义说明：提取源字符串长度',
        2: '第二行自定义说明：两端字符相同，直接继承对角线',
      },
    });

    expect(panel.codeModel.getLineExplanation(1, 'java')).toContain('提取源字符串长度');
    expect(panel.codeModel.getLineExplanation(2, 'java')).toContain('两端字符相同，直接继承对角线');

    panel.highlight(2);
    const codeLines = container.querySelectorAll('.algo-code-line');
    expect(codeLines[1].classList.contains('is-active')).toBe(true);

    panel.destroy();
  });

  it('renders key points and switches views seamlessly', () => {
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
      problemDetail: {
        title: '编辑距离',
        difficulty: 'hard',
        description: '给定两个单词 word1 和 word2...',
      },
    });

    // 检查视图切换
    panel.switchView('problem');
    const viewProblem = container.querySelector('#problem-view-container');
    if (viewProblem) {
      expect(viewProblem.style.display).not.toBe('none');
    }

    panel.switchView('keypoints');
    const viewAnalysis = container.querySelector('#analysis-view-container');
    if (viewAnalysis) {
      expect(viewAnalysis.style.display).not.toBe('none');
    }

    panel.switchView('code');
    const viewCode = container.querySelector('#code-view-container');
    if (viewCode) {
      expect(viewCode.style.display).not.toBe('none');
    }

    panel.destroy();
  });

  it('supports multi-language switching and dynamic line updating', () => {
    const javaCode = ['int x = 10;', 'int y = 20;'];
    const cppCode = ['int x = 10;', 'int y = 20;', 'int z = 30;'];

    const panel = new CodePanel(container as any, {
      language: 'java',
      languages: {
        java: javaCode,
        cpp: cppCode,
      },
    });

    let codeLines = container.querySelectorAll('.algo-code-line');
    expect(codeLines.length).toBe(2);
    expect(panel.getCurrentLanguage()).toBe('java');

    panel.switchLanguage('cpp');
    expect(panel.getCurrentLanguage()).toBe('cpp');
    codeLines = container.querySelectorAll('.algo-code-line');
    expect(codeLines.length).toBe(3);

    // 动态更新代码行
    panel.updateLines(['int a = 1;'], 'cpp');
    codeLines = container.querySelectorAll('.algo-code-line');
    expect(codeLines.length).toBe(1);

    panel.destroy();
  });

  it('supports variable watching and safe destruction', () => {
    const lines = ['int a = 1;'];
    const panel = new CodePanel(container as any, { lines });

    expect(() => {
      panel.updateVars([
        { name: 'i', value: '1' },
        { name: 'dp[i]', value: '42', changed: true },
      ]);
    }).not.toThrow();

    expect(() => {
      panel.destroy();
    }).not.toThrow();
  });
});
