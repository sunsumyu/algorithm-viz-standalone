import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisualizerAppController } from './visualizer-app-controller';
import { AlgorithmModelRepository } from './model-repository';

// Lightweight Mock DOM
class MockElement {
  public id = '';
  public value = '';
  public textContent = '';
  private _innerHTML = '';
  public get innerHTML(): string { return this._innerHTML; }
  public set innerHTML(val: string) {
    this._innerHTML = val;
    if (val === '') {
      this.children = [];
    }
  }
  public className = '';
  public style: Record<string, any> = {
    setProperty: (k: string, v: string) => { (this.style as any)[k] = v; },
    getPropertyValue: (k: string) => (this.style as any)[k] || ''
  };
  public children: MockElement[] = [];
  public dataset: Record<string, string> = {};
  public listeners: Record<string, Function[]> = {};
  public title = '';
  public max = '';
  public scrollTop = 0;
  public scrollHeight = 100;
  public clientHeight = 50;
  public parentElement: MockElement | null = null;

  constructor(id = '') {
    this.id = id;
    this.children = [];
  }

  public appendChild(child: MockElement) {
    if (!this.children) this.children = [];
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  public insertBefore(newChild: MockElement, _refChild?: MockElement) {
    if (!this.children) this.children = [];
    newChild.parentElement = this;
    this.children.push(newChild);
    return newChild;
  }

  public addEventListener(event: string, cb: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  public removeEventListener(event: string, cb: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(fn => fn !== cb);
    }
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

  public attributes: Record<string, string> = {};

  public setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  public getAttribute(name: string) {
    return this.attributes[name] || null;
  }

  public classList = {
    _classes: new Set<string>(),
    add: (c: string) => { this.classList._classes.add(c); this.className = Array.from(this.classList._classes).join(' '); },
    remove: (c: string) => { this.classList._classes.delete(c); this.className = Array.from(this.classList._classes).join(' '); },
    toggle: (c: string, force?: boolean) => {
      if (force === true) this.classList._classes.add(c);
      else if (force === false) this.classList._classes.delete(c);
      else if (this.classList._classes.has(c)) this.classList._classes.delete(c);
      else this.classList._classes.add(c);
      this.className = Array.from(this.classList._classes).join(' ');
      return this.classList._classes.has(c);
    },
    contains: (c: string) => this.classList._classes.has(c) || this.className.includes(c)
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

    const docRoot = new MockElement('root');

    (globalThis as any).document = {
      documentElement: docRoot,
      getElementById: (id: string) => getOrCreate(id),
      createElement: () => new MockElement(),
      querySelectorAll: () => [],
      addEventListener: vi.fn()
    };

    const storageData: Record<string, string> = {};
    const mockStorage = {
      getItem: (k: string) => storageData[k] ?? null,
      setItem: (k: string, v: string) => { storageData[k] = String(v); },
      removeItem: (k: string) => { delete storageData[k]; },
      clear: () => { Object.keys(storageData).forEach(k => delete storageData[k]); }
    };
    (globalThis as any).localStorage = mockStorage;

    (globalThis as any).window = {
      localStorage: mockStorage,
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

  it('应该在用户点击阶段时记住选中项并在下次初始化时自动恢复', () => {
    const controller1 = new VisualizerAppController({ mode: 'lite', defaultModelId: 'unique-paths-ii' });
    controller1.init();

    const stageTabs = elementsMap.get('stage-tabs-container');
    // 模拟点击「3 二维DP」选项卡
    const stage3Btn = stageTabs?.children.find(c => c.dataset.stage === 'stage-3');
    expect(stage3Btn).toBeDefined();
    stage3Btn?.dispatch('click');

    expect(localStorage.getItem('algo-stage-unique-paths-ii')).toBe('stage-3');
    expect(localStorage.getItem('algo-preferred-stage')).toBe('stage-3');
    controller1.destroy();

    // 重新实例化控制器（模拟刷新或重新打开）
    const controller2 = new VisualizerAppController({ mode: 'lite', defaultModelId: 'unique-paths-ii' });
    controller2.init();

    const titleEl = elementsMap.get('header-algo-title');
    expect(titleEl?.textContent).toContain('二维 DP');
    controller2.destroy();
  });

  it('应该在用户切换演化方向时记住方向并在下次初始化时自动恢复', () => {
    const controller1 = new VisualizerAppController({ mode: 'lite', defaultModelId: 'unique-paths-ii' });
    controller1.init();

    const dirTabs = elementsMap.get('dir-tabs-container');
    const reverseBtn = dirTabs?.children.find(c => c.dataset.dir === 'reverse');
    expect(reverseBtn).toBeDefined();
    reverseBtn?.dispatch('click');

    expect(localStorage.getItem('algo-dir-unique-paths-ii')).toBe('reverse');
    expect(localStorage.getItem('algo-preferred-dir')).toBe('reverse');
    controller1.destroy();

    // 重新实例化控制器
    const controller2 = new VisualizerAppController({ mode: 'lite', defaultModelId: 'unique-paths-ii' });
    controller2.init();

    const legendRefEl = elementsMap.get('legend-ref');
    expect(legendRefEl?.innerHTML).toContain('参考下方/右方');
    controller2.destroy();
  });

  it('应该支持在阶段 3 切换 DP 状态表与状态依赖树子视图并持久化偏好', () => {
    const controller = new VisualizerAppController({ mode: 'lite', defaultModelId: 'unique-paths-ii' });
    controller.init();

    // 切换到 stage-3
    const stageTabs = elementsMap.get('stage-tabs-container');
    const stage3Btn = stageTabs?.children.find(c => c.dataset.stage === 'stage-3');
    stage3Btn?.dispatch('click');

    // 默认子视图为 matrix
    expect(controller.stage3SubView).toBe('matrix');
    const stage3Bar = elementsMap.get('stage3-subview-bar');
    expect(stage3Bar?.classList.contains('hidden')).toBe(false);

    // 切换为 tree 子视图
    controller.setStage3SubView('tree');
    expect(controller.stage3SubView).toBe('tree');
    expect(localStorage.getItem('algo-stage3-subview')).toBe('tree');

    // 切换回 matrix 子视图
    controller.setStage3SubView('matrix');
    expect(controller.stage3SubView).toBe('matrix');
    expect(localStorage.getItem('algo-stage3-subview')).toBe('matrix');

    controller.destroy();
  });
});
