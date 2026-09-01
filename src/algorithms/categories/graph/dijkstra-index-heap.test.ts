import { describe, it, expect } from 'vitest';
import { DijkstraIndexHeapVisualizer, DIJKSTRA_INDEX_HEAP_TEMPLATE } from './dijkstra-index-heap-renderer';

describe('DijkstraIndexHeap (Dijkstra with Index Min-Heap)', () => {
  it('should instantiate DijkstraIndexHeapVisualizer properly', () => {
    const viz = new DijkstraIndexHeapVisualizer();
    expect(viz).toBeDefined();
    expect(DIJKSTRA_INDEX_HEAP_TEMPLATE).toContain('algo-dijkstra-index-heap-view');
    expect(DIJKSTRA_INDEX_HEAP_TEMPLATE).toContain('dijkstra-heap-canvas');
    expect(DIJKSTRA_INDEX_HEAP_TEMPLATE).toContain('dijkstra-heap-array');
    expect(DIJKSTRA_INDEX_HEAP_TEMPLATE).toContain('dijkstra-where-map');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DijkstraIndexHeapVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dijkstra-index-heap',
      viewId: 'algo-dijkstra-index-heap-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
