import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderKnapsackStageSVG,
  renderGridExplorerStageSVG,
  renderThematicStage,
} from './index';

// Lightweight DOM element mock
class MockElement {
  public tagName: string;
  public innerHTML = '';
  public textContent = '';
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public attributes: Record<string, string> = {};

  constructor(tagName = 'div') {
    this.tagName = tagName;
  }

  setAttribute(name: string, val: string) {
    this.attributes[name] = val;
  }

  getAttribute(name: string): string | undefined {
    return this.attributes[name];
  }

  appendChild<T extends MockElement>(child: T): T {
    this.children.push(child);
    return child;
  }

  querySelector(selector: string): MockElement | null {
    if (selector === 'svg') {
      const found = this.children.find((c) => c.tagName === 'svg');
      return found || null;
    }
    return null;
  }
  getAllText(): string {
    let res = this.textContent + ' ' + this.innerHTML;
    for (const ch of this.children) {
      res += ' ' + ch.getAllText();
    }
    return res;
  }
}

describe('Thematic Physical Stage Renderers', () => {
  let container: any;

  beforeEach(() => {
    container = new MockElement('div');
    if (typeof globalThis.document === 'undefined') {
      (globalThis as any).document = {
        createElement: (tag: string) => new MockElement(tag),
        createElementNS: (_ns: string, tag: string) => new MockElement(tag),
      };
    }
  });

  it('renders knapsack stage SVG with container elements', () => {
    renderKnapsackStageSVG(container, {
      capacity: 10,
      currentCapacity: 4,
      totalWeight: 4,
      totalValue: 6,
      action: 'include',
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders grid explorer stage SVG with character and telemetry card', () => {
    renderGridExplorerStageSVG(container, {
      rows: 3,
      cols: 4,
      curRow: 1,
      curCol: 2,
      status: 'enter',
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('dispatches thematic stage by algorithm id safely', () => {
    renderThematicStage(container, 'knapsack-01-2d', {
      current: { i: 1, j: 2 },
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders obstacles and avoids NaN path count for unique-paths-ii', () => {
    renderThematicStage(container, 'unique-paths-ii', {
      thematicMeta: {
        type: 'grid',
        grid: {
          rows: 3,
          cols: 4,
          curRow: 1,
          curCol: 1,
          obstacles: [[1, 1], [2, 2]],
          status: 'eval-obstacle',
          pathCount: 0,
        },
      },
    });

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const allText = svg!.getAllText();
    expect(allText).toContain('🚧');
    expect(allText).not.toContain('NaN');
    expect(allText).toContain('(1,1) 障碍');
    expect(allText).toContain('遇障阻断');
  });
});
