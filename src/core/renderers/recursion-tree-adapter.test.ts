import { describe, it, expect, beforeEach } from 'vitest';
import { RecursionTreeAdapter } from './recursion-tree-adapter';

// Lightweight Mock DOM
class MockElement {
  public tagName = 'DIV';
  public className = '';
  public innerHTML = '';
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public scrollLeft = 0;
  public scrollTop = 0;
  public clientWidth = 600;
  public clientHeight = 400;
  public scrollWidth = 1200;
  public scrollHeight = 800;

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  public querySelector(selector: string): MockElement | null {
    if (selector === '#tree-scroll-box') {
      return this.children.find(c => c.innerHTML.includes('tree-svg-canvas')) || (this.innerHTML.includes('tree-scroll-box') ? this : null);
    }
    return null;
  }

  public scrollTo(options: { left?: number; top?: number }) {
    if (options.left !== undefined) this.scrollLeft = options.left;
    if (options.top !== undefined) this.scrollTop = options.top;
  }
}

describe('RecursionTreeAdapter (Deep Module) Lifecycle & Layout Guard', () => {
  let container: MockElement;

  beforeEach(() => {
    container = new MockElement();
  });

  it('1. 当 root 为空时渲染优雅空状态占位', () => {
    RecursionTreeAdapter.renderRecursionTree(container as any, null);
    expect(container.innerHTML).toContain('暂无递归调用树');
  });

  it('2. 正常度量并渲染包含状态着色与青蛙坐标的 SVG 递归树', () => {
    const mockTree = {
      id: 'root-1',
      val: 'paths(0,0)',
      status: 'current',
      tag: '计算中',
      children: [
        {
          id: 'child-1',
          val: 'paths(1,0)',
          status: 'base',
          edgeLabel: '向下',
          tag: '= 1',
          children: []
        },
        {
          id: 'child-2',
          val: 'paths(0,1)',
          status: 'pruned',
          edgeLabel: '向右',
          tag: '🚫越界',
          children: []
        }
      ]
    };

    RecursionTreeAdapter.renderRecursionTree(container as any, mockTree, 'root-1');
    expect(container.innerHTML).toContain('tree-svg-canvas');
    expect(container.innerHTML).toContain('paths(0,0)');
    expect(container.innerHTML).toContain('🐸'); // 当前节点青蛙徽章
    expect(container.innerHTML).toContain('向下');
    expect(container.innerHTML).toContain('向右');
    expect(container.innerHTML).toContain('🚫越界');
  });

  it('3. 视口滚动聚焦与平滑滚动计算', () => {
    const mockTree = {
      id: 'root-1',
      val: 'root',
      status: 'normal',
      children: [
        {
          id: 'deep-active',
          val: 'deep(5,5)',
          status: 'current',
          children: []
        }
      ]
    };

    RecursionTreeAdapter.renderRecursionTree(container as any, mockTree, 'deep-active');
    expect(container.innerHTML).toContain('deep(5,5)');
  });
});
