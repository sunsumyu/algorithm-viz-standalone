import { describe, it, expect } from 'vitest';
import { buildForwardStarSteps } from './forward-star-renderer';

describe('ForwardStar (Chained Forward Star Algorithm)', () => {
  it('should build steps for addEdge mode correctly', () => {
    const rawEdges = '1 2 5, 1 3 2, 2 4 1';
    const steps = buildForwardStarSteps(rawEdges, '1', 'build');

    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.action).toBe('build_done');
    expect(lastStep.edges.length).toBe(3);

    // Node 1 has two outgoing edges: 1->2 (idx 0) then 1->3 (idx 1)
    // Head insertion order: head[1] should point to edge 1
    expect(lastStep.head[1]).toBe(1);
    // Edge 1 (1->3) next should point to edge 0 (1->2)
    expect(lastStep.edges[1].next).toBe(0);
    // Edge 0 (1->2) next should be -1
    expect(lastStep.edges[0].next).toBe(-1);
  });

  it('should traverse outgoing edges in reverse insertion order', () => {
    const rawEdges = '1 2 5, 1 3 2, 1 4 9';
    const steps = buildForwardStarSteps(rawEdges, '1', 'traverse');

    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.action).toBe('traverse_done');
    // Edge insertion order: 0 (1->2), 1 (1->3), 2 (1->4)
    // Head insertion traversal order should be: 2 -> 1 -> 0
    expect(lastStep.traversedEdges).toEqual([2, 1, 0]);
  });
});
