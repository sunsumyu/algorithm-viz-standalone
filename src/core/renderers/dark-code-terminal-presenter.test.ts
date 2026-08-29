import { describe, it, expect, beforeEach } from 'vitest';
import { DarkCodeTerminalPresenter } from './dark-code-terminal-presenter';

class MockElement {
  public innerHTML = '';
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

  constructor(public id: string = '', public tagName: string = 'div') {}

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

  public querySelector(_sel: string): MockElement | null {
    return null;
  }

  public querySelectorAll(_sel: string): MockElement[] {
    return [];
  }

  public setAttribute(name: string, val: string) {
    this.style[name] = val;
  }

  public getAttribute(name: string) {
    return this.style[name] ?? null;
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
    this.register('btn-open-problem-modal');
    this.register('modal-problem');
    this.register('modal-problem-body');
    this.register('btn-close-problem-modal');

    const javaBtn = new MockElement('btn-java', 'button');
    javaBtn.dataset.lang = 'java';
    const cppBtn = new MockElement('btn-cpp', 'button');
    cppBtn.dataset.lang = 'cpp';
    this.langBtns = [javaBtn, cppBtn];
  }

  private register(id: string): MockElement {
    const el = new MockElement(id);
    this.elements.set(id, el);
    return el;
  }

  public querySelector(sel: string): MockElement | null {
    const cleanId = sel.replace('#', '');
    return this.elements.get(cleanId) || null;
  }

  public querySelectorAll(sel: string): MockElement[] {
    if (sel.includes('.co-lang-btn') || sel.includes('.lang-btn')) {
      return this.langBtns;
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
});
