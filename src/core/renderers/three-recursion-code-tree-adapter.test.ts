import { describe, it, expect } from 'vitest';
import { ThreeRecursionCodeTreeAdapter } from './three-recursion-code-tree-adapter';

describe('ThreeRecursionCodeTreeAdapter 3D Code Slices', () => {
  it('should extract standard code tree data from fallback step data', () => {
    const dummyStep = {
      i: 2,
      j: 3,
      s1: 'abc',
      s2: 'def',
    };

    const tree = ThreeRecursionCodeTreeAdapter.extractCodeTreeFromStep(dummyStep);
    expect(tree).toBeDefined();
    expect(tree.name).toBe('f(2, 3)');
    expect(tree.depth).toBe(0);
    expect(tree.codeSnippet.length).toBeGreaterThan(0);
    expect(tree.children?.length).toBe(2);
  });

  it('should convert treeRoot structure into 3D code slices properly', () => {
    const stepWithTree = {
      i: 1,
      j: 1,
      s1: 'abc',
      s2: 'abc',
      activeNodeId: 'node-1',
      treeRoot: {
        id: 'node-1',
        r: 1,
        c: 1,
        val: 'f(1, 1)',
        status: 'current',
        children: [
          {
            id: 'node-2',
            r: 0,
            c: 0,
            val: 'f(0, 0)',
            status: 'completed',
            tag: 'ret=1',
            children: [],
          },
        ],
      },
    };

    const tree = ThreeRecursionCodeTreeAdapter.extractCodeTreeFromStep(stepWithTree);
    expect(tree.name).toBe('f(1, 1)');
    expect(tree.status).toBe('current');
    expect(tree.children?.length).toBe(1);
    expect(tree.children?.[0].name).toBe('f(0, 0)');
    expect(tree.children?.[0].status).toBe('completed');
    expect(tree.children?.[0].returnValue).toBe('1');
  });
});
