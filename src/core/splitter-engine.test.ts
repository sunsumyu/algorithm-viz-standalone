import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SplitterStorage, SplitterEngine } from './splitter-engine';

// Mock localStorage
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

(globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;

// Mock lightweight DOM
class MockElement {
  public tagName: string;
  public className = '';
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public clientWidth = 1000;
  public clientHeight = 800;
  private listeners: Record<string, Array<(e: any) => void>> = {};

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  appendChild(child: MockElement) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  insertBefore(child: MockElement, reference: MockElement | null) {
    child.parentElement = this;
    const idx = reference ? this.children.indexOf(reference) : -1;
    if (idx !== -1) {
      this.children.splice(idx, 0, child);
    } else {
      this.children.push(child);
    }
    return child;
  }

  removeChild(child: MockElement) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }

  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  addEventListener(event: string, fn: (e: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event: string, fn: (e: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
    }
  }

  dispatchEvent(event: { type: string }) {
    (this.listeners[event.type] || []).forEach((fn) => fn(event));
  }

  setAttribute(k: string, v: string) {
    (this as any)[k] = v;
  }

  getBoundingClientRect() {
    return {
      width: this.clientWidth,
      height: this.clientHeight,
      top: 0,
      left: 0,
      right: this.clientWidth,
      bottom: this.clientHeight,
    };
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
      contains(cls: string) {
        return self.className.split(' ').includes(cls);
      },
    };
  }
}

(globalThis as any).document = {
  createElement: (tag: string) => new MockElement(tag),
  body: new MockElement('body'),
};
(globalThis as any).window = {
  innerWidth: 1200,
  innerHeight: 900,
  dispatchEvent: vi.fn(),
  Event: class {
    constructor(public type: string) {}
  },
};
(globalThis as any).getComputedStyle = (el: any) => ({
  display: 'block',
  position: 'static',
  gridTemplateColumns: '1fr 300px',
  gridTemplateRows: '1fr 300px',
});

// Mock ResizeObserver：捕获回调以便测试中手动触发容器尺寸变化
let resizeObserverCallback: (() => void) | null = null;
class MockResizeObserver {
  constructor(cb: () => void) {
    resizeObserverCallback = cb;
  }
  observe(): void {}
  disconnect(): void {}
  unobserve(): void {}
}
(globalThis as any).ResizeObserver = MockResizeObserver;

describe('SplitterStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('generates correct storage keys for global and scoped', () => {
    expect(SplitterStorage.getKey('code-aside')).toBe('algo-splitter:global:code-aside');
    expect(SplitterStorage.getKey('code-aside', 'global')).toBe('algo-splitter:global:code-aside');
    expect(SplitterStorage.getKey('code-aside', 'dp-climb-stairs')).toBe('algo-splitter:dp-climb-stairs:code-aside');
  });

  it('reads global value when no scope is provided', () => {
    SplitterStorage.set('sidebar', 320);
    expect(SplitterStorage.get('sidebar', undefined, 280)).toBe(320);
  });

  it('reads scoped value if present, otherwise falls back to global value', () => {
    // 1. Set global
    SplitterStorage.set('code-aside', 450, 'global');
    // Scoped request should return global fallback
    expect(SplitterStorage.get('code-aside', 'my-algo', 400)).toBe(450);

    // 2. Set scoped with isolation
    SplitterStorage.set('code-aside', 520, 'my-algo', true);
    // Scoped request now returns scoped value
    expect(SplitterStorage.get('code-aside', 'my-algo', 400)).toBe(520);
    // Global request still returns global value when isolated
    expect(SplitterStorage.get('code-aside', 'global', 400)).toBe(450);

    // 3. Set without isolation (shared across all pages)
    SplitterStorage.set('code-aside', 560, 'another-algo');
    expect(SplitterStorage.get('code-aside', 'global', 400)).toBe(560);
    expect(SplitterStorage.get('code-aside', 'third-algo', 400)).toBe(560);
  });

  it('falls back to default value if neither scoped nor global exists', () => {
    expect(SplitterStorage.get('non-existent', 'some-scope', 350)).toBe(350);
  });
});

describe('SplitterEngine', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('clamps size within minSize and maxSize constraints', () => {
    const parent = new MockElement('div') as unknown as HTMLElement;
    const target = new MockElement('div') as unknown as HTMLElement;
    parent.appendChild(target as any);

    const engine = new SplitterEngine({
      id: 'test-panel',
      direction: 'horizontal',
      targetElement: target,
      containerElement: parent,
      defaultSize: 400,
      minSize: 200,
      maxSize: 600,
      mode: 'dimension',
    });

    expect(engine.clampSize(150)).toBe(200);
    expect(engine.clampSize(500)).toBe(500);
    expect(engine.clampSize(750)).toBe(600);

    engine.destroy();
  });

  it('clamps size using maxRatio of container', () => {
    const parent = new MockElement('div') as unknown as HTMLElement;
    (parent as any).clientWidth = 1000;
    const target = new MockElement('div') as unknown as HTMLElement;
    parent.appendChild(target as any);

    const engine = new SplitterEngine({
      id: 'test-ratio',
      direction: 'horizontal',
      targetElement: target,
      containerElement: parent,
      defaultSize: 300,
      minSize: 100,
      maxRatio: 0.7, // max 700px
      mode: 'dimension',
    });

    expect(engine.clampSize(850)).toBe(700);
    expect(engine.clampSize(50)).toBe(100);

    engine.destroy();
  });

  it('resets to default size on resetSize()', () => {
    const parent = new MockElement('div') as unknown as HTMLElement;
    const target = new MockElement('div') as unknown as HTMLElement;
    parent.appendChild(target as any);

    const onResize = vi.fn();
    const engine = new SplitterEngine({
      id: 'test-reset',
      direction: 'horizontal',
      targetElement: target,
      containerElement: parent,
      defaultSize: 320,
      mode: 'dimension',
      onResize,
    });

    engine.applySize(450);
    expect(engine.getCurrentSize()).toBe(450);

    engine.resetSize();
    expect(engine.getCurrentSize()).toBe(320);
    expect(onResize).toHaveBeenCalledWith(320);

    engine.destroy();
  });

  it('应该支持小窗口和大窗口独立控制变量，在大窗口调整不影响小窗口', () => {
    // 1. 在小窗口模式下存储小窗口尺寸
    SplitterStorage.set('grid-dp-split', 480, 'global', false, 'small');
    // 2. 在大窗口模式下存储大窗口尺寸
    SplitterStorage.set('grid-dp-split', 1050, 'global', false, 'large');

    // 3. 验证分别读取不同断点时，互不干扰
    expect(SplitterStorage.get('grid-dp-split', 'global', 500, 'small')).toBe(480);
    expect(SplitterStorage.get('grid-dp-split', 'global', 500, 'large')).toBe(1050);

    // 4. 验证中等窗口未配置时优雅降级
    expect(SplitterStorage.get('grid-dp-split', 'global', 600, 'medium')).toBe(1050); // falls back to global base
  });

  it('应该支持基于 defaultRatio 动态计算大窗口与小窗口的自适应默认宽度', () => {
    const parentLarge = new MockElement('div') as unknown as HTMLElement;
    (parentLarge as any).clientWidth = 2048; // 大屏 2K
    const target = new MockElement('div') as unknown as HTMLElement;
    parentLarge.appendChild(target as any);

    const engineLarge = new SplitterEngine({
      id: 'grid-dp-split-test',
      direction: 'horizontal',
      targetElement: target,
      containerElement: parentLarge,
      defaultRatio: 0.5,
      minSize: 320,
      mode: 'flex',
    });

    expect(engineLarge.getCurrentBreakpoint()).toBe('large');
    expect(engineLarge.getCurrentSize()).toBe(1024); // 2048 * 0.5

    engineLarge.destroy();
  });

  it('应该支持传入动态函数 minSize，确保面板拖拽时绝不挤压遮挡正常内容', () => {
    const parent = new MockElement('div') as unknown as HTMLElement;
    (parent as any).clientHeight = 800;
    const target = new MockElement('div') as unknown as HTMLElement;
    parent.appendChild(target as any);

    let dynamicContentHeight = 246; // 模拟 Card 2 头部 + 4格KPI + 中序序列 + 决策卡的总内容高度

    const engine = new SplitterEngine({
      id: 'test-dynamic-min-height',
      direction: 'vertical',
      targetElement: target,
      containerElement: parent,
      defaultSize: 300,
      minSize: () => dynamicContentHeight,
      maxRatio: 0.6,
      mode: 'flex',
    });

    // 当用户尝试拖拽缩小到 120px 时，应该被 clamp 拦截，不得低于当前内容的真实高度 246px
    expect(engine.clampSize(120)).toBe(246);
    expect(engine.clampSize(200)).toBe(246);
    expect(engine.clampSize(250)).toBe(250);

    // 当内容动态扩展为 280px 时，下限随之自适应联动
    dynamicContentHeight = 280;
    expect(engine.clampSize(246)).toBe(280);
    expect(engine.clampSize(300)).toBe(300);

    engine.destroy();
  });

  it('容器尺寸变化时必须按比例智能缩放，严禁固定像素导致另一侧面板被挤压', () => {
    const parent = new MockElement('div') as unknown as HTMLElement;
    (parent as any).clientWidth = 1920;
    const target = new MockElement('div') as unknown as HTMLElement;
    parent.appendChild(target as any);

    const engine = new SplitterEngine({
      id: 'test-proportional-resize',
      direction: 'horizontal',
      targetElement: target,
      containerElement: parent,
      defaultSize: 450,
      minSize: 340,
      maxRatio: 0.60,
      mode: 'grid',
    });

    // 1920 宽容器 + defaultSize 450：大屏黄金规则升级为 50% = 960px
    expect(engine.getCurrentSize()).toBe(960);

    // 全屏 -> 中窗口：必须保持 50% 占比 (960 * 1200/1920 = 600)，而非固定 960px 挤压左侧
    (parent as any).clientWidth = 1200;
    resizeObserverCallback?.();
    expect(engine.getCurrentSize()).toBe(600);

    // 中窗口 -> 小窗口：继续等比 (600 * 800/1200 = 400)
    (parent as any).clientWidth = 800;
    resizeObserverCallback?.();
    expect(engine.getCurrentSize()).toBe(400);

    // 继续缩到极限：等比结果 300 低于 minSize 340，必须被安全下限拦截
    (parent as any).clientWidth = 600;
    resizeObserverCallback?.();
    expect(engine.getCurrentSize()).toBe(340);

    engine.destroy();
  });

  it('跨断点窗口变化同样按比例缩放，严禁跳载另一份固定像素记忆', () => {
    const parent = new MockElement('div') as unknown as HTMLElement;
    (parent as any).clientWidth = 1600;
    const target = new MockElement('div') as unknown as HTMLElement;
    parent.appendChild(target as any);

    const engine = new SplitterEngine({
      id: 'test-cross-breakpoint-ratio',
      direction: 'horizontal',
      targetElement: target,
      containerElement: parent,
      defaultSize: 450,
      minSize: 340,
      mode: 'grid',
    });

    // 大屏初始 50% = 800px；窗口 1600 -> 1200 跨断点，等比结果应为 600px
    expect(engine.getCurrentSize()).toBe(800);
    (parent as any).clientWidth = 1200;
    resizeObserverCallback?.();
    expect(engine.getCurrentSize()).toBe(600);

    engine.destroy();
  });

  it('自身 applySize 引发的容器回弹不得触发循环缩放', () => {
    const parent = new MockElement('div') as unknown as HTMLElement;
    (parent as any).clientWidth = 1000;
    const target = new MockElement('div') as unknown as HTMLElement;
    parent.appendChild(target as any);

    const engine = new SplitterEngine({
      id: 'test-no-feedback-loop',
      direction: 'horizontal',
      targetElement: target,
      containerElement: parent,
      defaultSize: 400,
      mode: 'flex',
    });
    expect(engine.getCurrentSize()).toBe(400);

    // 外部调用 applySize（如拖拽结束恢复、setScope）：引擎自身引发的布局变化须被抑制，禁止观测器再放大/缩小一轮
    engine.applySize(500);
    resizeObserverCallback?.();
    expect(engine.getCurrentSize()).toBe(500);

    // 抑制只作用于紧跟的一次观测；后续真实外部变化仍须正常等比
    (parent as any).clientWidth = 1200;
    resizeObserverCallback?.();
    expect(engine.getCurrentSize()).toBe(600);

    engine.destroy();
  });
});
