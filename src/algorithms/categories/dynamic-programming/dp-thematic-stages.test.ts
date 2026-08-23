import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderKnapsackStageSVG,
  renderCoinChangeStageSVG,
  renderGridExplorerStageSVG,
  renderHouseRobberStageSVG,
  renderStockTradingStageSVG,
  renderMathCutStageSVG,
  renderThematicStage,
} from './dp-thematic-stages';

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
}

describe('dp-thematic-stages', () => {
  let container: any;

  beforeEach(() => {
    container = new MockElement('div');
    // Mock global document if not present
    if (typeof globalThis.document === 'undefined') {
      (globalThis as any).document = {
        createElement: (tag: string) => new MockElement(tag),
        createElementNS: (_ns: string, tag: string) => new MockElement(tag),
      };
    }
  });

  it('renders knapsack physical stage with SVG elements', () => {
    renderKnapsackStageSVG(container, {
      capacity: 10,
      currentCapacity: 4,
      items: [{ id: 1, name: '石', weight: 2, value: 3 }],
      currentItemIndex: 0,
      action: 'include',
      totalWeight: 2,
      totalValue: 3,
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders coin change physical stage with SVG elements', () => {
    renderCoinChangeStageSVG(container, {
      targetAmount: 11,
      currentAmount: 6,
      coins: [1, 2, 5],
      currentCoin: 5,
      action: 'drop',
      usedCoins: [5, 1],
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders grid explorer physical stage with SVG elements', () => {
    renderGridExplorerStageSVG(container, {
      rows: 3,
      cols: 4,
      curRow: 1,
      curCol: 2,
      pathCount: 3,
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders house robber physical stage with SVG elements', () => {
    renderHouseRobberStageSVG(container, {
      houses: [
        { index: 0, val: 2 },
        { index: 1, val: 7 },
      ],
      curHouse: 1,
      robbedHouses: [1],
      decision: 'rob',
      totalStolen: 7,
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders stock trading physical stage with SVG elements', () => {
    renderStockTradingStageSVG(container, {
      prices: [7, 1, 5, 3, 6, 4],
      curDay: 2,
      action: 'buy',
      profit: 4,
      holding: true,
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders math cut energy rod physical stage with SVG elements', () => {
    renderMathCutStageSVG(container, {
      totalLength: 8,
      cutPoint: 3,
      product: 15,
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('dispatches thematic stage by algorithmId cleanly', () => {
    renderThematicStage(container, 'bag-problem', { current: { i: 1, j: 2 } });
    expect(container.querySelector('svg')).not.toBeNull();

    renderThematicStage(container, 'coin-change', { current: { index: 3 } });
    expect(container.querySelector('svg')).not.toBeNull();

    renderThematicStage(container, 'unique-paths', { current: { i: 0, j: 1 } });
    expect(container.querySelector('svg')).not.toBeNull();

    renderThematicStage(container, 'house-robber', { current: { index: 1 } });
    expect(container.querySelector('svg')).not.toBeNull();

    renderThematicStage(container, 'stock-trading', { current: { i: 2 } });
    expect(container.querySelector('svg')).not.toBeNull();

    renderThematicStage(container, 'integer-break', { current: { index: 2 } });
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
