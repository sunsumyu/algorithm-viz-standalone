import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RightPanelTabCoordinator } from './right-panel-tab-coordinator';

class MockElement {
  public innerHTML = '';
  public children: any[] = [];
  public classList = {
    classes: new Set<string>(),
    add(cls: string) { this.classes.add(cls); },
    remove(...clsList: string[]) { clsList.forEach(cls => this.classes.delete(cls)); },
    contains(cls: string) { return this.classes.has(cls); }
  };
  public className = '';
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public textContent = '';
  public scrollTop = 100;
  public parentElement: MockElement | null = null;
  public listeners: Record<string, Function[]> = {};

  constructor(public tagName = 'div') {}

  public appendChild(child: any) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  public prepend(child: any) {
    child.parentElement = this;
    this.children.unshift(child);
    return child;
  }

  public remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
    }
  }

  public querySelectorAll(selector: string): any[] {
    const res: any[] = [];
    const check = (node: any) => {
      const cls = selector.replace(/^\./, '');
      if (node.classList?.contains(cls) || node.className?.includes(cls)) res.push(node);
      node.children?.forEach(check);
    };
    this.children.forEach(check);
    return res;
  }

  public querySelector(selector: string): any | null {
    const match = selector.match(/\.code-line\[data-line="(\d+)"\]/);
    if (match) {
      const line = match[1];
      const find = (node: any): any | null => {
        if (node.dataset?.line === line) return node;
        for (const child of node.children || []) {
          const f = find(child);
          if (f) return f;
        }
        return null;
      };
      return find(this);
    }
    const cls = selector.replace(/^\./, '');
    const find = (node: any): any | null => {
      if (node.classList?.contains(cls) || node.className?.includes(cls)) return node;
      for (const child of node.children || []) {
        const f = find(child);
        if (f) return f;
      }
      return null;
    };
    return find(this);
  }

  public addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public click() {
    this.listeners['click']?.forEach(fn => fn());
  }
}

const mockDom: Record<string, MockElement> = {};

(globalThis as any).document = {
  getElementById: (id: string) => mockDom[id] || null,
  createElement: (tag: string) => new MockElement(tag)
};

describe('RightPanelTabCoordinator (右侧多看板选项卡与代码面板协调深模块)', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockDom)) delete mockDom[key];

    mockDom['btn-tab-code'] = new MockElement('button');
    mockDom['btn-tab-problem'] = new MockElement('button');
    mockDom['btn-tab-analysis'] = new MockElement('button');
    mockDom['code-view-container'] = new MockElement('div');
    mockDom['problem-view-container'] = new MockElement('div');
    mockDom['analysis-view-container'] = new MockElement('div');
    mockDom['code-variant-bar'] = new MockElement('div');
    mockDom['code-font-container'] = new MockElement('div');
    mockDom['code-container-box'] = new MockElement('div');
  });

  it('切换到题目面板时应高亮题目按钮并调用 onRenderProblem', () => {
    const onProblem = vi.fn();
    RightPanelTabCoordinator.switchRightTab('problem', {
      modelId: 'unique-paths',
      currentStage: 'stage-3',
      onRenderProblem: onProblem
    });

    expect(mockDom['btn-tab-problem'].className).toContain('active');
    expect(mockDom['btn-tab-code'].className).not.toContain('active');
    expect(mockDom['problem-view-container'].classList.contains('hidden')).toBe(false);
    expect(mockDom['code-view-container'].classList.contains('hidden')).toBe(true);
    expect(onProblem).toHaveBeenCalledTimes(1);
  });

  it('切换到代码面板且存在多变体时应展示变体栏', () => {
    RightPanelTabCoordinator.switchRightTab('code', {
      modelId: 'unique-paths',
      currentStage: 'stage-4',
      hasMultipleVariants: true
    });

    expect(mockDom['code-variant-bar'].classList.contains('hidden')).toBe(false);
    expect(mockDom['code-font-container'].classList.contains('hidden')).toBe(false);
  });

  it('更新具有多个代码变体的阶段配置时应正确渲染变体按钮并支持点击切换', () => {
    const onSelect = vi.fn();
    const stageConfig = {
      variants: {
        'var-1': { variantLabel: '递归优化', codeHtml: '<code>var1</code>' },
        'var-2': { variantLabel: '迭代解法', codeHtml: '<code>var2</code>' }
      }
    };

    RightPanelTabCoordinator.updateCodePanel(stageConfig, {
      modelId: 'unique-paths',
      currentStage: 'stage-4',
      currentVariant: 'var-1',
      onSelectVariant: onSelect
    });

    expect(mockDom['code-variant-bar'].children.length).toBe(2);
    expect(mockDom['code-variant-bar'].children[0].className).toContain('bg-blue-600');

    mockDom['code-variant-bar'].children[1].click();
    expect(onSelect).toHaveBeenCalledWith('var-2');
  });

  it('应该正确初始化与动态设置代码面板字号并在合法范围内截断', () => {
    mockDom['code-font-indicator'] = new MockElement('span');
    const size1 = RightPanelTabCoordinator.initCodeFontSize(12);
    expect(size1).toBe(12);

    const size2 = RightPanelTabCoordinator.setCodeFontSize(14.5);
    expect(size2).toBe(14.5);
    expect(mockDom['code-font-indicator'].textContent).toBe('14.5');

    // 边界越界保护
    const sizeMax = RightPanelTabCoordinator.setCodeFontSize(25);
    expect(sizeMax).toBe(16);

    const sizeMin = RightPanelTabCoordinator.setCodeFontSize(5);
    expect(sizeMin).toBe(9.5);
  });

  it('updateCodeHighlight 在 isReturn=true 时应挂载 return-line 与 code-return-icon，并在下次切换时完全清理', () => {
    const container = new MockElement('div');
    const line10 = new MockElement('div');
    line10.classList.add('code-line');
    line10.dataset.line = '10';
    line10.dataset.rawCode = 'int useMatch = dfs(s, t, i + 1, j + 1);';
    container.appendChild(line10);

    const line11 = new MockElement('div');
    line11.classList.add('code-line');
    line11.dataset.line = '11';
    line11.dataset.rawCode = 'int skipChar = dfs(s, t, i + 1, j);';
    container.appendChild(line11);

    // 1. 触发普通调用
    RightPanelTabCoordinator.updateCodeHighlight(container as any, 10, undefined, 'java', false);
    expect(line10.classList.contains('active-line')).toBe(true);
    expect(line10.classList.contains('return-line')).toBe(false);
    expect(line10.querySelector('.code-return-icon')).toBeNull();

    // 2. 触发递归返回
    RightPanelTabCoordinator.updateCodeHighlight(container as any, 10, undefined, 'java', true);
    expect(line10.classList.contains('active-line')).toBe(true);
    expect(line10.classList.contains('return-line')).toBe(true);
    const returnIcon = line10.querySelector('.code-return-icon');
    expect(returnIcon).not.toBeNull();
    expect(returnIcon?.textContent).toContain('↩');

    // 3. 推进到下一行普通调用，上一行的 return-line 与 icon 必须被干净清理
    RightPanelTabCoordinator.updateCodeHighlight(container as any, 11, undefined, 'java', false);
    expect(line10.classList.contains('active-line')).toBe(false);
    expect(line10.classList.contains('return-line')).toBe(false);
    expect(line10.querySelector('.code-return-icon')).toBeNull();
    expect(line11.classList.contains('active-line')).toBe(true);
    expect(line11.classList.contains('return-line')).toBe(false);
  });

  it('updateCodeHighlight 传入 stepContext 时应自动解析变量并在行末生成 algo-code-inline-hint', () => {
    const container = new MockElement('div');
    const line10 = new MockElement('div');
    line10.classList.add('code-line');
    line10.dataset.line = '10';
    line10.dataset.rawCode = 'for (int l = 0; l <= n - len; l++) {';
    container.appendChild(line10);

    const mockStep = {
      l: 4,
      n: 5,
      len: 2,
      log: 'for l = 4 (l <= 3) -> false',
    };

    RightPanelTabCoordinator.updateCodeHighlight(container as any, 10, undefined, 'java', false, mockStep);

    expect(line10.classList.contains('active-line')).toBe(true);
    const inlineHint = line10.querySelector('.algo-code-inline-hint');
    expect(inlineHint).not.toBeNull();
    expect(inlineHint?.textContent).toContain('l: 4');
    expect(inlineHint?.textContent).toContain('len: 2');
    expect(inlineHint?.textContent).toContain('n: 5');
  });
});
