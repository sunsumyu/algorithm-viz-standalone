import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisualizerAppController } from './visualizer-app-controller';
import { AlgorithmModelRepository } from './model-repository';

// Lightweight Mock DOM
class MockElement {
  public id = '';
  public value = '';
  public textContent = '';
  public innerHTML = '';
  public className = '';
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public dataset: Record<string, string> = {};
  public listeners: Record<string, Function[]> = {};
  public title = '';
  public max = '';
  public scrollTop = 0;
  public scrollHeight = 100;
  public clientHeight = 50;

  constructor(id = '') {
    this.id = id;
  }

  public appendChild(child: MockElement) {
    this.children.push(child);
  }

  public addEventListener(event: string, cb: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  public dispatch(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data || { target: this }));
    }
  }

  public querySelector(selector: string): MockElement | null {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) return this;
      for (const c of this.children) {
        const found = c.querySelector(selector);
        if (found) return found;
      }
    }
    return null;
  }

  public querySelectorAll(selector: string): MockElement[] {
    const list: MockElement[] = [];
    for (const c of this.children) {
      if (selector.startsWith('.') && c.className.includes(selector.slice(1))) {
        list.push(c);
      }
    }
    return list;
  }

  public classList = {
    add: (cls: string) => {
      if (!this.className.includes(cls)) this.className += ` ${cls}`;
    },
    remove: (cls: string) => {
      this.className = this.className.replace(cls, '').trim();
    },
    contains: (cls: string) => this.className.includes(cls)
  };

  public scrollTo(_opts: any) {}
  public scrollIntoView(_opts: any) {}
}

describe('VisualizerAppController Deep Module', () => {
  let elementsMap: Map<string, MockElement>;

  beforeEach(() => {
    elementsMap = new Map<string, MockElement>();

    const getOrCreate = (id: string) => {
      if (!elementsMap.has(id)) {
        elementsMap.set(id, new MockElement(id));
      }
      return elementsMap.get(id)!;
    };

    (globalThis as any).document = {
      getElementById: (id: string) => getOrCreate(id),
      createElement: () => new MockElement(),
      querySelectorAll: () => []
    };

    (globalThis as any).window = {
      location: {
        search: '?model=unique-paths',
        pathname: '/stage-explorer-lite.html',
        hash: ''
      },
      history: {
        replaceState: vi.fn()
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该正确初始化 Lite 模式并生成初始执行步骤', () => {
    const controller = new VisualizerAppController({ mode: 'lite' });
    controller.init();

    const curEl = elementsMap.get('step-cur');
    const totEl = elementsMap.get('step-total');
    expect(curEl?.textContent).toBe('1');
    expect(Number(totEl?.textContent)).toBeGreaterThan(0);

    controller.destroy();
  });

  it('应该正确初始化 Full 模式并构建 2D 初始网格与 1D 槽位', () => {
    const controller = new VisualizerAppController({ mode: 'full', defaultModelId: 'min-path-sum' });
    controller.init();

    const fullCurEl = elementsMap.get('current-step-num');
    expect(fullCurEl?.textContent).toBe('1');

    const gridContainer = elementsMap.get('grid-container');
    expect(gridContainer?.children.length).toBeGreaterThan(0);

    controller.destroy();
  });

  it('应该支持切换阶段并重新派发步骤生成', () => {
    const controller = new VisualizerAppController({ mode: 'lite' });
    controller.init();

    const stageTabs = elementsMap.get('stage-tabs-container');
    expect(stageTabs?.children.length).toBeGreaterThan(1);

    // 模拟点击阶段 4 选项卡
    const stage4Btn = stageTabs?.children.find(c => c.dataset.stage === 'stage-4');
    if (stage4Btn) {
      stage4Btn.dispatch('click');
    }

    const titleEl = elementsMap.get('header-algo-title');
    expect(titleEl?.textContent).toContain('空间优化');

    controller.destroy();
  });

  it('应该在销毁时正确清理内部时间轴控制器与定时器', () => {
    const controller = new VisualizerAppController({ mode: 'lite' });
    controller.init();
    expect(() => controller.destroy()).not.toThrow();
  });
});
