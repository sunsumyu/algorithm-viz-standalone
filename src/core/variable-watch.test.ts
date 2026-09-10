import { describe, it, expect, beforeEach } from 'vitest';
import { VariableWatch } from './variable-watch';

// Lightweight Mock DOM
class MockElement {
  public id = '';
  public _innerHTML = '';
  public className = '';
  public textContent = '';
  public title = '';
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public classList = {
    _classes: new Set<string>(),
    add: (c: string) => this.classList._classes.add(c),
    remove: (c: string) => this.classList._classes.delete(c),
    toggle: (c: string) => {
      if (this.classList._classes.has(c)) {
        this.classList._classes.delete(c);
        return false;
      }
      this.classList._classes.add(c);
      return true;
    },
    contains: (c: string) => this.classList._classes.has(c)
  };

  constructor(public tagName = 'div') {}

  get innerHTML(): string {
    if (this._innerHTML) return this._innerHTML;
    return this.children.map(c => c.innerHTML).join('\n');
  }

  set innerHTML(val: string) {
    this._innerHTML = val;
    this.children = [];
  }

  public appendChild(child: MockElement) {
    this.children.push(child);
    return child;
  }

  public addEventListener(_ev: string, _fn: any) {}

  public querySelector(sel: string): MockElement | null {
    if (sel === '.algo-code-var-value') return this.children.find(c => c.className.includes('algo-code-var-value')) || null;
    return null;
  }

  public querySelectorAll(sel: string): MockElement[] {
    if (sel.includes('.algo-code-var-row')) return this.children.filter(c => c.className.includes('algo-code-var-row'));
    return [];
  }

  public remove() {}
}

describe('VariableWatch (Passive View Adapter) Unit Tests', () => {
  let container: MockElement;

  beforeEach(() => {
    container = new MockElement();
    (globalThis as any).document = {
      createElement: (tag: string) => new MockElement(tag)
    };
  });

  it('1. 渲染空变量时隐藏容器', () => {
    const watch = new VariableWatch(container as any);
    watch.renderSnapshots([]);
    expect(container.style.display).toBe('none');
  });

  it('2. 接收变量快照并正确渲染行元素', () => {
    const watch = new VariableWatch(container as any);
    const snapshots = [
      { name: 'i', value: '0', isChanged: false },
      { name: 'j', value: '1', isChanged: true }
    ];

    watch.renderSnapshots(snapshots);
    expect(container.style.display).toBe('flex');
    expect(watch).toBeDefined();
  });
});
