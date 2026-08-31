import { describe, it, expect } from 'vitest';
import { StockTraderVisualizer, STOCK_TRADER_TEMPLATE } from './stock-trader-renderer';

describe('StockTrader (Stock Trader Empire Game)', () => {
  it('should instantiate StockTraderVisualizer properly', () => {
    const viz = new StockTraderVisualizer();
    expect(viz).toBeDefined();
    expect(STOCK_TRADER_TEMPLATE).toContain('algo-stock-trader-view');
    expect(STOCK_TRADER_TEMPLATE).toContain('stock-canvas');
    expect(STOCK_TRADER_TEMPLATE).toContain('stock-preset-btn');
    expect(STOCK_TRADER_TEMPLATE).toContain('stock-segments-list');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new StockTraderVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'stock-trader',
      viewId: 'algo-stock-trader-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
