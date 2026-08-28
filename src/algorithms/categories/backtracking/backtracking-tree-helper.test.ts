import { describe, it, expect, beforeEach } from 'vitest';
import {
  flattenTree,
  layoutTree,
  isNodeOnPath,
  renderBacktrackLog,
  getBacktrackTreeCSS,
  BacktrackTreeNode,
  BacktrackTreeStep
} from './backtracking-tree-helper';

describe('backtracking-tree-helper (回溯决策树门面模块)', () => {
  let mockRoot: BacktrackTreeNode;

  beforeEach(() => {
    mockRoot = {
      id: 'root',
      value: '',
      path: [],
      children: [
        {
          id: 'root-1',
          value: '1',
          path: [1],
          children: [
            {
              id: 'root-1-2',
              value: '2',
              path: [1, 2],
              children: [],
              isLeaf: true,
              isPruned: false,
              parentId: 'root-1',
              depth: 2
            }
          ],
          isLeaf: false,
          isPruned: false,
          parentId: 'root',
          depth: 1
        },
        {
          id: 'root-2',
          value: '2',
          path: [2],
          children: [],
          isLeaf: false,
          isPruned: true,
          parentId: 'root',
          depth: 1
        }
      ],
      isLeaf: false,
      isPruned: false,
      parentId: null,
      depth: 0
    };
  });

  it('应该正确将树形结构扁平化为节点列表', () => {
    const flatNodes = flattenTree(mockRoot);
    expect(flatNodes.length).toBe(4);
    expect(flatNodes.map(n => n.id)).toEqual(['root', 'root-1', 'root-1-2', 'root-2']);
  });

  it('应该正确计算树节点的二维坐标布局', () => {
    layoutTree(mockRoot);
    const flatNodes = flattenTree(mockRoot);
    
    // 所有节点应被赋予有效的 x 和 y 坐标
    flatNodes.forEach(node => {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(node.y).toBeGreaterThanOrEqual(40);
    });

    // 兄弟节点的 x 坐标应不重叠
    const node1 = flatNodes.find(n => n.id === 'root-1');
    const node2 = flatNodes.find(n => n.id === 'root-2');
    expect(node1?.x).toBeLessThan(node2?.x || 0);
  });

  it('应该精准判定祖先溯源路径 (isNodeOnPath)', () => {
    const flatNodes = flattenTree(mockRoot);
    const nodeMap = new Map<string, BacktrackTreeNode>();
    flatNodes.forEach(n => nodeMap.set(n.id, n));

    // 当前在 root-1-2，root 和 root-1 应在路径上
    expect(isNodeOnPath('root', nodeMap, 'root-1-2')).toBe(true);
    expect(isNodeOnPath('root-1', nodeMap, 'root-1-2')).toBe(true);
    expect(isNodeOnPath('root-1-2', nodeMap, 'root-1-2')).toBe(true);

    // root-2 不在路径上
    expect(isNodeOnPath('root-2', nodeMap, 'root-1-2')).toBe(false);
  });

  it('应该生成包含特定前缀的决策树 CSS 模板', () => {
    const css = getBacktrackTreeCSS('custom-prefix');
    expect(css).toContain('custom-prefix-tree-toolbar');
    expect(css).toContain('custom-prefix-node-current');
    expect(css).toContain('custom-prefix-node-pruned');
  });

  it('应该安全渲染回溯日志流', () => {
    class MockElement {
      public innerHTML = '';
      public className = '';
      public textContent = '';
      public scrollTop = 0;
      public scrollHeight = 100;
      public children: any[] = [];
      public attributes: Record<string, string> = {};
      public appendChild(el: any) { this.children.push(el); }
      public setAttribute(k: string, v: string) { this.attributes[k] = v; }
    }
    const mockDocument = {
      createElement: () => new MockElement(),
      head: { appendChild: () => {} },
      getElementById: () => null
    };
    (globalThis as any).document = mockDocument;

    const container = new MockElement();
    const baseFields = { nodes: [], visitedNodeIds: [], foundPathIds: [], prunedNodeIds: [], codeLine: { line: 1 } };
    const steps: BacktrackTreeStep[] = [
      { ...baseFields, currentNodeId: 'root', message: '开始搜索', path: [] },
      { ...baseFields, currentNodeId: 'root-1', message: '选择元素 1', path: [1] },
      { ...baseFields, currentNodeId: 'root-1-2', message: '收集结果 [1, 2]', path: [1, 2] }
    ];

    renderBacktrackLog(container as any, steps, 1, 'cs');
    expect(container.children.length).toBe(2);
    expect(container.children[1].className).toContain('cs-log-active');
    expect(container.children[0].className).not.toContain('cs-log-active');
  });
});
