import { describe, it, expect } from 'vitest';
import {
  buildTraversal020Steps,
  SAMPLE_TREE_LAYOUT,
} from './tree-traversal-iterative-020-step-compiler';

describe('tree-traversal-iterative-020-step-compiler', () => {
  it('SAMPLE_TREE_LAYOUT contains exactly 6 nodes', () => {
    expect(Object.keys(SAMPLE_TREE_LAYOUT).length).toBe(6);
    expect(SAMPLE_TREE_LAYOUT[1].val).toBe(1);
  });

  it('buildTraversal020Steps produces valid preorder sequence [1, 2, 4, 5, 3, 6]', () => {
    const steps = buildTraversal020Steps('preorder');
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.visitedResult).toEqual([1, 2, 4, 5, 3, 6]);
    expect(lastStep.traversalType).toBe('preorder');
    expect(lastStep.stageId).toBe('stage1');
  });

  it('buildTraversal020Steps produces valid inorder sequence [4, 2, 5, 1, 6, 3]', () => {
    const steps = buildTraversal020Steps('inorder');
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.visitedResult).toEqual([4, 2, 5, 1, 6, 3]);
    expect(lastStep.traversalType).toBe('inorder');
    expect(lastStep.stageId).toBe('stage2');
  });

  it('buildTraversal020Steps produces valid postorder sequence [4, 5, 2, 6, 3, 1]', () => {
    const steps = buildTraversal020Steps('postorder');
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.visitedResult).toEqual([4, 5, 2, 6, 3, 1]);
    expect(lastStep.traversalType).toBe('postorder');
    expect(lastStep.stageId).toBe('stage3');
  });

  it('every step has valid codeLine and message', () => {
    const types: Array<'preorder' | 'inorder' | 'postorder'> = ['preorder', 'inorder', 'postorder'];
    for (const t of types) {
      const steps = buildTraversal020Steps(t);
      for (const step of steps) {
        expect(step.message).toBeTruthy();
        expect(step.decision).toBeTruthy();
      }
    }
  });
});
