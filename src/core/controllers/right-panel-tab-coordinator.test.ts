import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RightPanelTabCoordinator } from './right-panel-tab-coordinator';

class MockElement {
  public innerHTML = '';
  public children: any[] = [];
  public classList = {
    classes: new Set<string>(),
    add(cls: string) { this.classes.add(cls); },
    remove(cls: string) { this.classes.delete(cls); },
    contains(cls: string) { return this.classes.has(cls); }
  };
  public className = '';
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public textContent = '';
  public scrollTop = 100;
  public listeners: Record<string, Function[]> = {};

  constructor(public tagName = 'div') {}

  public appendChild(child: any) {
    this.children.push(child);
    return child;
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
});
