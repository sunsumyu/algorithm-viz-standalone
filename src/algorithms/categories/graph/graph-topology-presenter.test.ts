import { describe, it, expect } from 'vitest';
import {
  GraphTopologyPresenter,
  GraphNodeVisualItem,
  GraphEdgeVisualItem
} from './graph-topology-presenter';

describe('GraphTopologyPresenter Deep Module Guard', () => {
  it('should compute correct vector arrow geometry points', () => {
    const p1 = { x: 80, y: 140 };
    const p2 = { x: 240, y: 140 };

    const { points, arrowTip } = GraphTopologyPresenter.computeArrowPoints(p1, p2, 22, 10);

    expect(points).toBeDefined();
    expect(points.split(' ').length).toBe(3);
    expect(arrowTip.x).toBeCloseTo(240 - 26, 1);
    expect(arrowTip.y).toBeCloseTo(140, 1);
  });

  it('should handle zero distance gracefully without NaN coordinates', () => {
    const p1 = { x: 100, y: 100 };
    const p2 = { x: 100, y: 100 };

    const { points, arrowTip } = GraphTopologyPresenter.computeArrowPoints(p1, p2);

    expect(points).not.toContain('NaN');
    expect(arrowTip.x).toBeDefined();
  });
});
