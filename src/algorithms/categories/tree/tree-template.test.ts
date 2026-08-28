import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  buildTreeFromArr,
  buildTreeTemplate,
  renderTreeSVG,
  renderLog,
  TreeNode
} from './tree-template';

class MockSVGElement {
  tagName: string;
  attributes = new Map<string, string>();
  children: MockSVGElement[] = [];
  textContent = '';
  innerHTML = '';
  scrollTop = 0;
  scrollHeight = 100;
  className = '';

  constructor(tag: string) {
    this.tagName = tag;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | undefined {
    return this.attributes.get(name);
  }

  appendChild(child: MockSVGElement) {
    this.children.push(child);
    return child;
  }
}

describe('Tree Template & Visualizer Utilities', () => {
  describe('buildTreeFromArr', () => {
    it('1. 空数组或以 null 开头应当返回 null', () => {
      expect(buildTreeFromArr([])).toBeNull();
      expect(buildTreeFromArr([null])).toBeNull();
    });

    it('2. 单节点树应当正确构建', () => {
      const tree = buildTreeFromArr([1]);
      expect(tree).not.toBeNull();
      expect(tree?.val).toBe(1);
      expect(tree?.left).toBeNull();
      expect(tree?.right).toBeNull();
    });

    it('3. 层序多节点树带 null 应当正确构建左右子树', () => {
      // 树结构:
      //      1
      //     / \
      //    2   3
      //     \
      //      4
      const tree = buildTreeFromArr([1, 2, 3, null, 4]);
      expect(tree?.val).toBe(1);
      expect(tree?.left?.val).toBe(2);
      expect(tree?.right?.val).toBe(3);
      expect(tree?.left?.left).toBeNull();
      expect(tree?.left?.right?.val).toBe(4);
      expect(tree?.right?.left).toBeNull();
      expect(tree?.right?.right).toBeNull();
    });
  });

  describe('buildTreeTemplate', () => {
    it('4. 正确使用 prefix 和参数生成 HTML 模板', () => {
      const html = buildTreeTemplate({
        prefix: 'tt-',
        title: '二叉树遍历',
        subtitle: '前序/中序/后序',
        accentA: 'rgb(249, 226, 175)',
        accentB: 'rgb(166, 227, 161)',
        tip: '深度优先搜索',
        icon: '🌳',
        extraStats: [{ id: 'nodes', label: '节点数' }]
      });

      expect(html).toContain('tt-title');
      expect(html).toContain('二叉树遍历');
      expect(html).toContain('tt-nodes');
      expect(html).toContain('节点数');
      expect(html).toContain('id="step-play"');
      expect(html).toContain('id="step-reset"');
    });
  });

  describe('renderTreeSVG & renderLog', () => {
    let mockDoc: any;

    beforeEach(() => {
      mockDoc = {
        createElementNS: (_ns: string, tag: string) => new MockSVGElement(tag),
        createElement: (tag: string) => new MockSVGElement(tag)
      };
      (globalThis as any).document = mockDoc;
    });

    afterEach(() => {
      delete (globalThis as any).document;
    });

    it('5. renderTreeSVG 空树时设置提示文字', () => {
      const container = new MockSVGElement('div');
      renderTreeSVG(container as any, null, new Set(), '#fff');
      expect(container.innerHTML).toContain('空树');
    });

    it('6. renderTreeSVG 渲染节点、边与高亮标签', () => {
      const container = new MockSVGElement('div');
      const tree = buildTreeFromArr([10, 5, 15]);
      const labels = new Map<number, string>([[10, 'Root']]);

      renderTreeSVG(
        container as any,
        tree,
        new Set([10]),
        '#fab387',
        new Set([5]),
        '#89b4fa',
        labels
      );

      expect(container.children.length).toBe(1);
      const svg = container.children[0];
      expect(svg.tagName).toBe('svg');
      expect(svg.getAttribute('viewBox')).toBe('0 0 600 280');
      // Should have lines, circles, texts
      expect(svg.children.length).toBeGreaterThan(5);
    });

    it('7. renderLog 渲染日志列表并高亮当前步骤', () => {
      const container = new MockSVGElement('div');
      const logs = ['访问根节点 10', '进入左子树 5', '回溯到根节点'];

      renderLog(container as any, logs, 1);

      expect(container.children.length).toBe(3);
      expect(container.children[1].className).toBe('active');
      expect(container.children[1].textContent).toContain('进入左子树 5');
      expect(container.children[0].className).toBe('');
    });
  });
});
