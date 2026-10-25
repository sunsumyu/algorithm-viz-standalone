import { describe, it, expect, beforeEach } from 'vitest';
import { DarkCodeTerminalPresenter } from './dark-code-terminal-presenter';

class MockElement {
  public _innerHTML = '';
  public textContent = '';
  public className = '';
  public dataset: Record<string, string> = {};
  public style: Record<string, string> = {};
  public classList = {
    _classes: new Set<string>(),
    add: (c: string) => this.classList._classes.add(c),
    remove: (c: string) => this.classList._classes.delete(c),
    contains: (c: string) => this.classList._classes.has(c),
  };
  private listeners: Record<string, Function[]> = {};
  public children: MockElement[] = [];

  constructor(public id: string = '', public tagName: string = 'div') {}

  public get innerHTML(): string {
    return this._innerHTML;
  }

  public set innerHTML(val: string) {
    this._innerHTML = val;
  }

  public addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public removeEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((f) => f !== fn);
  }

  public click() {
    (this.listeners['click'] || []).forEach((fn) => fn({ currentTarget: this }));
  }

  public scrollIntoView() {}

  public appendChild(child: MockElement) {
    this.children.push(child);
    return child;
  }

  public removeChild(child: MockElement) {
    this.children = this.children.filter((c) => c !== child);
    return child;
  }

  public querySelector(sel: string): MockElement | null {
    for (const child of this.children) {
      if (sel.startsWith('.')) {
        const classes = sel.split('.').filter(Boolean);
        const matchAll = classes.every((c) => child.className.includes(c) || child.classList.contains(c));
        if (matchAll) return child;
      }
      if (sel.startsWith('#') && child.id === sel.slice(1)) return child;
      if (sel.includes('data-line="') && child.dataset.line === sel.match(/data-line="(\d+)"/)?.[1]) return child;
      const found = child.querySelector(sel);
      if (found) return found;
    }
    return null;
  }

  public querySelectorAll(sel: string): MockElement[] {
    let res: MockElement[] = [];
    for (const child of this.children) {
      if (sel.startsWith('.')) {
        const classes = sel.split('.').filter(Boolean);
        const matchAll = classes.every((c) => child.className.includes(c) || child.classList.contains(c));
        if (matchAll) res.push(child);
      } else if (sel.startsWith('#') && child.id === sel.slice(1)) {
        res.push(child);
      }
      res = res.concat(child.querySelectorAll(sel));
    }
    return res;
  }

  public setAttribute(name: string, val: string) {
    this.style[name] = val;
  }

  public getAttribute(name: string) {
    return this.style[name] ?? null;
  }

  public hasAttribute(name: string) {
    return name in this.dataset;
  }
}

class MockRoot {
  public elements: Map<string, MockElement> = new Map();
  public langBtns: MockElement[] = [];

  constructor() {
    this.register('btn-tab-code');
    this.register('btn-tab-problem');
    this.register('btn-tab-analysis');
    this.register('code-view-container');
    this.register('problem-view-container');
    this.register('analysis-view-container');
    this.register('code-lines-wrapper');
    this.register('btn-code-font-dec');
    this.register('code-font-indicator');
    this.register('btn-code-font-inc');
    this.register('btn-code-copy');
    this.register('btn-open-problem-modal');
    this.register('modal-problem');
    this.register('modal-problem-body');
    this.register('btn-close-problem-modal');
    this.register('code-vars-watch');

    const javaBtn = new MockElement('btn-java', 'button');
    javaBtn.dataset.lang = 'java';
    const cppBtn = new MockElement('btn-cpp', 'button');
    cppBtn.dataset.lang = 'cpp';
    this.langBtns = [javaBtn, cppBtn];
  }

  public register(id: string): MockElement {
    const el = new MockElement(id);
    this.elements.set(id, el);
    return el;
  }

  public querySelector(sel: string): MockElement | null {
    const parts = sel.split(',').map((s) => s.trim().replace(/^#/, '').split(/\s+/)[0]);
    for (const p of parts) {
      const match = this.elements.get(p);
      if (match) return match;
    }
    return null;
  }

  public querySelectorAll(sel: string): MockElement[] {
    if (sel.includes('.co-lang-btn') || sel.includes('.lang-btn') || sel.includes('[data-lang]')) {
      return this.langBtns;
    }
    if (sel.includes('#btn-open-problem-modal')) {
      const el = this.elements.get('btn-open-problem-modal');
      return el ? [el] : [];
    }
    return [];
  }
}

describe('DarkCodeTerminalPresenter (深模块测试 - 0 DOM依赖环境)', () => {
  let root: MockRoot;

  beforeEach(() => {
    root = new MockRoot();
  });

  it('正确初始化并渲染默认 Java 源码行', () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: {
        java: ['public void backtrack() {', '    res.add(path);', '}'],
        cpp: ['void backtrack() {', '    res.push_back(path);', '}'],
      },
      initialLang: 'java',
    });

    const wrapper = root.querySelector('#code-lines-wrapper');
    expect(wrapper?.innerHTML).toContain('algo-code-token-keyword');
    expect(wrapper?.innerHTML).toContain('backtrack');
    expect(wrapper?.innerHTML).toContain('res.add(path)');
    expect(presenter.getCurrentLanguage()).toBe('java');
  });

  it('支持无缝切换编程语言并重新渲染', () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: {
        java: ['public void backtrack() {}'],
        cpp: ['void backtrack() {}', '// cpp line 2'],
      },
    });

    presenter.switchLanguage('cpp');
    expect(presenter.getCurrentLanguage()).toBe('cpp');

    const wrapper = root.querySelector('#code-lines-wrapper');
    expect(wrapper?.innerHTML).toContain('// cpp line 2');
  });

  it('支持字号缩放器点击增减', () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: { java: ['code'] },
      fontSize: 12,
    });

    const btnInc = root.querySelector('#btn-code-font-inc');
    btnInc?.click();

    expect(presenter.getFontSize()).toBe(13);
    expect(root.querySelector('#code-font-indicator')?.textContent).toBe('13');

    const btnDec = root.querySelector('#btn-code-font-dec');
    btnDec?.click();
    btnDec?.click();
    expect(presenter.getFontSize()).toBe(11);
  });

  it('支持 Tab 切换与模态弹窗开闭', () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: { java: ['code'] },
      problemHtml: '<p>题目内容</p>',
      analysisHtml: '<p>回溯精讲</p>',
    });

    presenter.switchTab('problem');
    expect(root.querySelector('#code-view-container')?.style.display).toBe('none');
    expect(root.querySelector('#problem-view-container')?.style.display).toBe('flex');
    expect(root.querySelector('#problem-view-container')?.innerHTML).toContain('题目内容');

    // 模态弹窗
    const openBtn = root.querySelector('#btn-open-problem-modal');
    const closeBtn = root.querySelector('#btn-close-problem-modal');
    const modal = root.querySelector('#modal-problem');

    openBtn?.click();
    expect(modal?.classList.contains('hidden')).toBe(false);

    closeBtn?.click();
    expect(modal?.classList.contains('hidden')).toBe(true);
  });

  it('支持在仅有占位容器时自动注入骨架 DOM', () => {
    const emptyRoot = new MockRoot();
    emptyRoot.elements.delete('code-lines-wrapper');
    const placeholder = emptyRoot.register('code-terminal-card');

    DarkCodeTerminalPresenter.mount(emptyRoot as unknown as HTMLElement, {
      codeLanguages: {
        java: ['public void moveZeroes() {}'],
      },
    });

    expect(placeholder.innerHTML).toContain('code-lines-wrapper');
    expect(placeholder.innerHTML).toContain('code-lang-tabs');
  });

  it('支持集成式变量监视底栏更新与渲染', () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: { java: ['int a = 10;'] },
    });

    presenter.updateVars([
      { name: 'i', value: '3', type: 'number' },
      { name: 'found', value: 'true', type: 'boolean' },
    ]);

    const varsEl = root.querySelector('#code-vars-watch');
    expect(varsEl).not.toBeNull();
    expect(varsEl?.innerHTML).toContain('i:');
    expect(varsEl?.innerHTML).toContain('3');
    expect(varsEl?.innerHTML).toContain('found:');
    expect(varsEl?.innerHTML).toContain('true');

    // 传入空数组隐藏
    presenter.updateVars([]);
    expect(varsEl?.style.display).toBe('none');
  });

  it('normalizeHighlightTarget 纯函数能精准归一化各类多态高亮目标', () => {
    expect(DarkCodeTerminalPresenter.normalizeHighlightTarget(3, 'java')).toEqual({
      lines: [3],
      focusLine: 3,
    });

    expect(DarkCodeTerminalPresenter.normalizeHighlightTarget('5', 'java')).toEqual({
      lines: [5],
      focusLine: 5,
    });

    expect(DarkCodeTerminalPresenter.normalizeHighlightTarget([2, 4], 'java')).toEqual({
      lines: [2, 4],
      focusLine: 2,
    });

    expect(DarkCodeTerminalPresenter.normalizeHighlightTarget({ from: 10, to: 12 }, 'java')).toEqual({
      lines: [10, 11, 12],
      focusLine: 10,
    });

    expect(
      DarkCodeTerminalPresenter.normalizeHighlightTarget({ java: 2, cpp: 8 }, 'cpp')
    ).toEqual({
      lines: [8],
      focusLine: 8,
    });
  });

  it('copyCode 能够提取当前语言代码并触发复制', async () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: {
        java: ['public void solve() {', '    // solution', '}'],
        cpp: ['void solve() {', '    // solution', '}'],
      },
      initialLang: 'java',
    });

    const res = await presenter.copyCode();
    // 在 Node 测试环境中回退执行，返回 boolean
    expect(typeof res).toBe('boolean');

    const copyBtn = root.querySelector('#btn-code-copy');
    expect(copyBtn).not.toBeNull();
    // 模拟用户点击复制按钮
    copyBtn?.click();
    expect(copyBtn?.classList.contains('copied')).toBe(true);
  });

  it('updateVars 能够接收 step 上下文并为当前高亮行生成行末内联调试提示', () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: {
        java: [
          'public int f(int i, int j) {',
          '    int p1 = f(i - 1, j);',
          '    return p1;',
          '}',
        ],
      },
      initialLang: 'java',
    });

    // 1. 高亮第 2 行: int p1 = f(i - 1, j);
    presenter.highlightLine(2);

    // 2. 传入带有 stepContext 的变量 (i=3, j=1)
    presenter.updateVars([], {
      i: 3,
      j: 1,
      metrics: { 'metric-pos': 'i=3, j=1' },
    });

    const linesWrapper = root.querySelector('#code-lines-wrapper');
    expect(linesWrapper).not.toBeNull();
    const activeLine = linesWrapper?.querySelector('[data-line="2"]');
    expect(activeLine).not.toBeNull();

    // 验证活动行子节点中生成了 algo-code-inline-hint
    const inlineHint = activeLine?.querySelector('.algo-code-inline-hint');
    expect(inlineHint).not.toBeNull();
    expect(inlineHint?.textContent).toContain('//');
    expect(inlineHint?.textContent).toContain('i: 3');
    expect(inlineHint?.textContent).toContain('j: 1');
  });

  it('preserves outer scope variables across consecutive steps via persistent execution scope', () => {
    const presenter = DarkCodeTerminalPresenter.mount(root as unknown as HTMLElement, {
      codeLanguages: {
        java: [
          'int teams = 2;',
          'for (int i = 1; i <= teams; i++) {',
          '    for (int k = start; k < end; k++) {',
          '    }',
          '}',
        ],
      },
      initialLang: 'java',
    });

    // Step 0: 初始化外层变量 teams=2, m=45
    presenter.updateVars([], { index: 0, teams: 2, m: 45 });

    // Step 1: 进入外层循环，只声明 i=1, start=1, end=3 (未重复声明 teams 和 m)
    presenter.updateVars([], { index: 1, i: 1, start: 1, end: 3 });

    // Step 2: 进入内层循环，只声明 k=1
    presenter.highlightLine(3);
    presenter.updateVars([], { index: 2, k: 1 });

    const linesWrapper = root.querySelector('#code-lines-wrapper');
    const activeLine = linesWrapper?.querySelector('[data-line="3"]');
    const inlineHint = activeLine?.querySelector('.algo-code-inline-hint');

    // 验证：即使第 2 步只传了 k=1，外层已计算的 start=1 和 end=3 仍然跨步保留！
    expect(inlineHint?.textContent).toContain('k: 1');
    expect(inlineHint?.textContent).toContain('start: 1');
    expect(inlineHint?.textContent).toContain('end: 3');
  });

  it('correctly extracts matching brackets and subscript expressions for 2D and 1D indexing', async () => {
    const { extractMatchingBrackets } = await import('./terminal/hover-tooltip-manager');

    // 1. 2D 下标: [k][1]
    expect(extractMatchingBrackets('[k][1]);', 2)).toBe('[k][1]');

    // 2. 2D 复合嵌套下标: [i - 1][j - arr[k][0]]
    expect(extractMatchingBrackets('[i - 1][j - arr[k][0]] + arr[k][1]);', 2)).toBe('[i - 1][j - arr[k][0]]');

    // 3. 1D 下标: [k]
    expect(extractMatchingBrackets('[k];', 1)).toBe('[k]');

    // 4. 空或者非括号开头
    expect(extractMatchingBrackets(' = 10;', 2)).toBeNull();
    expect(extractMatchingBrackets('', 2)).toBeNull();
  });
});



