import { describe, it, expect, beforeEach } from 'vitest';
import { MemoSlotVisualAdapter } from './memo-slot-visual-adapter';

// Lightweight Mock DOM
class MockElement {
  public id = '';
  public _innerHTML = '';
  public className = '';
  public textContent = '';
  public children: MockElement[] = [];

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

  public querySelector(sel: string): MockElement | null {
    if (sel.startsWith('#memo-slot-')) {
      const idx = sel.replace('#memo-slot-', '');
      return this.children.find(c => c.id === `memo-slot-${idx}`) || null;
    }
    if (sel === '.slot-val') return this.children.find(c => c.className.includes('slot-val')) || null;
    if (sel === '.slot-badge') return this.children.find(c => c.className.includes('slot-badge')) || null;
    return null;
  }
}

describe('MemoSlotVisualAdapter (Deep Module) Unit Tests', () => {
  let container: MockElement;

  beforeEach(() => {
    container = new MockElement();
    (globalThis as any).document = {
      createElement: (tag: string) => new MockElement(tag),
      getElementById: (id: string) => null
    };
  });

  it('1. 成功构建 Full 模式下指定长度的一维槽位骨架', () => {
    MemoSlotVisualAdapter.build1DSlots(container as any, 5, 'dp');
    expect(container.children.length).toBe(5);
    expect(container.children[0].innerHTML).toContain('dp[0]');
    expect(container.children[4].innerHTML).toContain('dp[4]');
  });

  it('2. 成功渲染 Lite 模式下一维 memo 状态解释条与槽位', () => {
    const mockStep = {
      slotMode: 'updated',
      activeSlot: 2,
      memoj: 6,
      memoSnapshot: [1, 2, 6, 0]
    };

    MemoSlotVisualAdapter.renderLiteMemoSlots(container as any, mockStep, 4);
    expect(container.innerHTML).toContain('memo[2] = 6');
    expect(container.innerHTML).toContain('滚动覆盖累加');
  });

  it('3. 渲染 Lite 模式下读取上方旧值 (down) 状态', () => {
    const mockStep = {
      slotMode: 'down',
      activeSlot: 1,
      down: 3,
      memoSnapshot: [1, 3, 0]
    };

    MemoSlotVisualAdapter.renderLiteMemoSlots(container as any, mockStep, 3);
    expect(container.innerHTML).toContain('读取上方旧值');
    expect(container.innerHTML).toContain('memo[1] = 3');
  });
});
