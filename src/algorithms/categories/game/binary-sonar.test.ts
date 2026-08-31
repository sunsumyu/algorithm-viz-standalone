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
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BinarySonarVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'binary-sonar',
      viewId: 'algo-binary-sonar-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
