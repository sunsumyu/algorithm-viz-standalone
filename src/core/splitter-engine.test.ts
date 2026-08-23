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
});
