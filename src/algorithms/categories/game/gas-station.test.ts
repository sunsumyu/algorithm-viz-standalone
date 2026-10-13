import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { GasStationVisualizer, GAS_STATION_TEMPLATE } from './gas-station-renderer';

describe('GasStation (Gas Station Rally Game)', () => {
  it('should instantiate GasStationVisualizer properly', () => {
    const viz = new GasStationVisualizer();
    expect(viz).toBeDefined();
    expect(GAS_STATION_TEMPLATE).toContain('algo-gas-station-view');
    expect(GAS_STATION_TEMPLATE).toContain('gas-station-canvas');
    expect(GAS_STATION_TEMPLATE).toContain('gas-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(GasStationVisualizer, {
      algorithmId: 'gas-station-rally',
      viewId: 'algo-gas-station-view',
    });
  });
});
