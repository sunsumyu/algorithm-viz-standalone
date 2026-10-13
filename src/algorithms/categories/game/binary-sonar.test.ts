import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { BinarySonarVisualizer, BINARY_SONAR_TEMPLATE } from './binary-sonar-renderer';

describe('BinarySonar (Binary Search Sonar Game)', () => {
  it('should instantiate BinarySonarVisualizer properly', () => {
    const viz = new BinarySonarVisualizer();
    expect(viz).toBeDefined();
    expect(BINARY_SONAR_TEMPLATE).toContain('algo-binary-sonar-view');
    expect(BINARY_SONAR_TEMPLATE).toContain('sonar-canvas');
    expect(BINARY_SONAR_TEMPLATE).toContain('sonar-preset-btn');
    expect(BINARY_SONAR_TEMPLATE).toContain('sonar-range-slots');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(BinarySonarVisualizer, {
      algorithmId: 'binary-sonar',
      viewId: 'algo-binary-sonar-view',
    });
  });
});
