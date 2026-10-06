import { describe, it, expect } from 'vitest';
import {
  SAMPLE_TREE_NODES,
  buildSerialization021Steps,
} from './tree-serialization-021-step-compiler';

describe('tree-serialization-021-step-compiler', () => {
  it('SAMPLE_TREE_NODES contains 5 nodes', () => {
    expect(Object.keys(SAMPLE_TREE_NODES).length).toBe(5);
    expect(SAMPLE_TREE_NODES[1].val).toBe('1');
  });

  it('buildSerialization021Steps (preorder) generates valid stream and reconstructed tree', () => {
    const steps = buildSerialization021Steps('preorder');
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.mode).toBe('preorder');
    expect(last.reconstructedTree.length).toBe(5);
    expect(last.tokensStream).toEqual(['1', '2', '4', '#', '#', '#', '3', '#', '5', '#', '#']);
  });

  it('buildSerialization021Steps (levelorder) generates valid stream and reconstructed tree', () => {
    const steps = buildSerialization021Steps('levelorder');
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.mode).toBe('levelorder');
    expect(last.reconstructedTree.length).toBe(5);
    expect(last.tokensStream).toEqual(['1', '2', '3', '4', '#', '#', '#', '#', '#', '#', '#']);
  });
});
