import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
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
    await assertVisualizerLifecycleContract(StockTraderVisualizer, {
      algorithmId: 'stock-trader',
      viewId: 'algo-stock-trader-view',
    });
  });
});
