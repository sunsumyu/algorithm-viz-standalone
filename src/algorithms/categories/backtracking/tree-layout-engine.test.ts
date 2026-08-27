import { describe, it, expect } from 'vitest';
import { TreeLayoutEngine, BacktrackTreeNode } from './tree-layout-engine';

describe('TreeLayoutEngine Deep Module Guard', () => {
  function buildTestTree(): BacktrackTreeNode {
    const root: BacktrackTreeNode = {
      id: 'root',
      value: '[]',
      path: [],
      children: [],
      isLeaf: false,
      isPruned: false,
      parentId: null,
      depth: 0
    };

    const c1: BacktrackTreeNode = {
      id: 'c1',
      value: '[1]',
      path: [1],
      children: [],
      isLeaf: false,
      isPruned: false,
      parentId: 'root',
      depth: 1
    };

    const c2: BacktrackTreeNode = {
      id: 'c2',
      value: '[2]',
      path: [2],
      children: [],
      isLeaf: true,
      isPruned: false,
      parentId: 'root',
      depth: 1
    };

    root.children.push(c1, c2);
    return root;
  }

  it('should flatten tree correctly into 1D node array', () => {
    const root = buildTestTree();
    const list = TreeLayoutEngine.flatten(root);

    expect(list.length).toBe(3);
    expect(list.map((n) => n.id)).toEqual(['root', 'c1', 'c2']);
  });

  it('should calculate layout coordinates without modifying node hierarchy', () => {
    const root = buildTestTree();
    TreeLayoutEngine.layout(root);

    const list = TreeLayoutEngine.flatten(root);
    list.forEach((node) => {
      expect(node.x).toBeDefined();
      expect(node.y).toBeDefined();
    });

    expect(root.y).toBe(40);
    expect(root.children[0].y).toBe(150); // 40 + 110
    expect(root.children[1].y).toBe(150);
    expect(root.children[0].x).toBeLessThan(root.children[1].x!);
  });

  it('should compute bounding box and viewBox dimensions correctly', () => {
    const root = buildTestTree();
    TreeLayoutEngine.layout(root);
    const nodes = TreeLayoutEngine.flatten(root);

    const bounds = TreeLayoutEngine.computeBounds(nodes);
    expect(bounds.vWidth).toBeGreaterThan(0);
    expect(bounds.vHeight).toBeGreaterThan(0);
    expect(bounds.minY).toBe(40);
    expect(bounds.maxY).toBe(150);
  });

  it('should accurately test if a node is on path from currentNode to root', () => {
    const root = buildTestTree();
    const nodes = TreeLayoutEngine.flatten(root);
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    expect(TreeLayoutEngine.isNodeOnPath('root', nodeMap, 'c1')).toBe(true);
    expect(TreeLayoutEngine.isNodeOnPath('c1', nodeMap, 'c1')).toBe(true);
    expect(TreeLayoutEngine.isNodeOnPath('c2', nodeMap, 'c1')).toBe(false);
  });
});
