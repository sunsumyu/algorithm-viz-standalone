import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ViewMountEngine, viewMountEngine } from './view-mount-engine';
import { IVisualizer, VisualizerContext } from './interfaces';

class MockHTMLElement {
  public tagName: string;
  public className = '';
  public id = '';
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
  public children: MockHTMLElement[] = [];
  public parentElement: MockHTMLElement | null = null;
  private listeners: Record<string, Array<(e: any) => void>> = {};

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  appendChild<T extends MockHTMLElement>(child: T): T {
    child.parentElement = this;
    this.children.push(child);
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
      contains(cls: string) {
        return self.className.split(' ').includes(cls);
      },
    };
  }

  addEventListener(event: string, handler: (e: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: (e: any) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }

  dispatchEvent(event: { type: string; preventDefault?: () => void; stopPropagation?: () => void }) {
    (this.listeners[event.type] || []).forEach((h) => h(event));
  }

  querySelector(selector: string): MockHTMLElement | null {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      return this.id === id ? this : null;
    }
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      if (this.classList.contains(cls)) return this;
    }
    for (const child of this.children) {
      const res = child.querySelector(selector);
      if (res) return res;
    }
    return null;
  }

  querySelectorAll(selector: string): MockHTMLElement[] {
    const results: MockHTMLElement[] = [];
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) {
      results.push(this);
    }
    for (const child of this.children) {
      results.push(...child.querySelectorAll(selector));
    }
    return results;
  }
}

(globalThis as any).document = {
  createElement: (tag: string) => new MockHTMLElement(tag),
  getElementById: (id: string) => null,
  body: new MockHTMLElement('body'),
};

describe('ViewMountEngine', () => {
  beforeEach(() => {
    viewMountEngine.unmountCurrent();
  });

  it('mounts algorithm visualizer, injects template, and handles unmounting cleanly', async () => {
    const initSpy = vi.fn().mockResolvedValue(undefined);
    const pauseSpy = vi.fn();
    const destroySpy = vi.fn();

    class TestVisualizer implements IVisualizer {
      init = initSpy;
      pause = pauseSpy;
      destroy = destroySpy;
    }

    const parent = new MockHTMLElement('div');
    const navigateBack = vi.fn();

    const viz = await viewMountEngine.mount({
      algorithmId: 'algo-test-1',
      viewId: 'view-test-1',
      templateContent: '<button class="btn-back">Back</button><div class="content">Hello</div>',
      VisualizerClass: TestVisualizer,
      navigateBack,
      containerParent: parent as any,
    });

    expect(viz).toBeInstanceOf(TestVisualizer);
    expect(viewMountEngine.getCurrentAlgorithmId()).toBe('algo-test-1');
    expect(initSpy).toHaveBeenCalledTimes(1);

    const container = viewMountEngine.getActiveContainer();
    expect(container).not.toBeNull();
    expect(container?.classList.contains('active')).toBe(true);

    // Unmount
    viewMountEngine.unmountCurrent();

    expect(pauseSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(viewMountEngine.getCurrentAlgorithmId()).toBeNull();
    expect(viewMountEngine.getCurrentVisualizer()).toBeNull();
    expect(container?.innerHTML).toBe('');
  });

  it('automatically unmounts and clears previous visualizer when mounting a new one', async () => {
    const destroySpy1 = vi.fn();
    class Viz1 implements IVisualizer {
      init = vi.fn().mockResolvedValue(undefined);
      destroy = destroySpy1;
    }

    class Viz2 implements IVisualizer {
      init = vi.fn().mockResolvedValue(undefined);
      destroy = vi.fn();
    }

    const parent = new MockHTMLElement('div');

    await viewMountEngine.mount({
      algorithmId: 'algo-1',
      viewId: 'view-1',
      templateContent: '<div>Algo 1</div>',
      VisualizerClass: Viz1,
      containerParent: parent as any,
    });

    expect(viewMountEngine.getCurrentAlgorithmId()).toBe('algo-1');

    // Mount second algorithm
    await viewMountEngine.mount({
      algorithmId: 'algo-2',
      viewId: 'view-2',
      templateContent: '<div>Algo 2</div>',
      VisualizerClass: Viz2,
      containerParent: parent as any,
    });

    expect(destroySpy1).toHaveBeenCalledTimes(1);
    expect(viewMountEngine.getCurrentAlgorithmId()).toBe('algo-2');
  });
});
