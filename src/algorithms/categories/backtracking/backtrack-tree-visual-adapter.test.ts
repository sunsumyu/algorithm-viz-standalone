import { describe, it, expect, beforeEach } from 'vitest';
import { BacktrackTreeVisualAdapter } from './backtrack-tree-visual-adapter';
import type { BacktrackTreeNode, BacktrackTreeStep } from './tree-layout-engine';

class MockDomElement {
  public innerHTML = '';
  public children: any[] = [];
  public classList = {
    classes: new Set<string>(),
    add(cls: string) { this.classes.add(cls); },
    remove(cls: string) { this.classes.delete(cls); },
    contains(cls: string) { return this.classes.has(cls); }
  };
  public style: Record<string, string> = {};
  public attributes: Record<string, string> = {};
  public textContent = '';

  constructor(public tagName = 'div') {}

  public appendChild(child: any) {
    this.children.push(child);
    return child;
  }

  public setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  public getAttribute(name: string) {
    return this.attributes[name];
  }

  public querySelector(selector: string) {
    return null;
  }

  public addEventListener() {}
}

const mockHead = new MockDomElement('head');

(globalThis as any).document = {
  head: mockHead,
  createElement: (tag: string) => new MockDomElement(tag),
  createElementNS: (_ns: string, tag: string) => new MockDomElement(tag)
};

describe('BacktrackTreeVisualAdapter Deep Module Guard', () => {
  let container: MockDomElement;

  beforeEach(() => {
    container = new MockDomElement('div');
  });

  const rootNode: BacktrackTreeNode = {
    id: 'root',
    value: '[]',
    path: [],
    children: [
      {
        id: 'node-1',
        value: '[1]',
        path: [1],
        children: [],
        isLeaf: true,
        isPruned: false,
        parentId: 'root',
        depth: 1,
        x: 100,
        y: 110
      }
    ],
    isLeaf: false,
    isPruned: false,
    parentId: null,
    depth: 0,
    x: 100,
    y: 0
  };

  const mockStep: BacktrackTreeStep = {
    nodes: [rootNode, rootNode.children[0]],
    currentNodeId: 'node-1',
    visitedNodeIds: ['root', 'node-1'],
    foundPathIds: ['node-1'],
    prunedNodeIds: [],
    path: [1],
    message: '探索元素 1',
    codeLine: 5
  };

  it('应该正确管理容器视口缩放与平移状态', () => {
    const state = BacktrackTreeVisualAdapter.getContainerViewState(container as any);
    expect(state.scale).toBe(1);
    expect(state.tx).toBe(0);
    expect(state.ty).toBe(0);
    expect(state.userTouched).toBe(false);
  });

  it('应该正确生成指定 prefix 的 CSS 样式文本', () => {
    const css = BacktrackTreeVisualAdapter.getBacktrackTreeCSS('cs');
    expect(css).toContain('.cs-tree-toolbar');
    expect(css).toContain('.cs-node-circle');
    expect(css).toContain('.cs-node-current');
    expect(css).toContain('.cs-edge');
  });

  it('应该能安全渲染回溯 N 叉决策树 SVG 结构', () => {
    BacktrackTreeVisualAdapter.render({
      container: container as any,
      step: mockStep,
      cssPrefix: 'cs'
    });

    expect(container.children.length).toBeGreaterThan(0);
    const svgChild = container.children.find((c: any) => c.tagName === 'svg');
    expect(svgChild).toBeDefined();
  });
});
