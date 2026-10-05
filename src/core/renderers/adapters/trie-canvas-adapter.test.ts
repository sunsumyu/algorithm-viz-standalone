// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  TrieCanvasAdapter,
  TrieVisualNode,
  TrieCanvasState,
  TrieCard2State,
} from './trie-canvas-adapter';

describe('TrieCanvasAdapter (字典树领域视觉适配器深模块门禁)', () => {
  const sampleNodes: TrieVisualNode[] = [
    { id: 1, depth: 0, label: 'ROOT', bit: null, parentId: null, children: [2, 3] },
    { id: 2, depth: 1, label: '0', bit: 0, parentId: 1, children: [4, 0] },
    { id: 3, depth: 1, label: '1', bit: 1, parentId: 1, children: [0, 5] },
    { id: 4, depth: 2, label: '0', bit: 0, parentId: 2, children: [] },
    { id: 5, depth: 2, label: '1', bit: 1, parentId: 3, children: [] },
  ];

  it('1. computeCoordinates 能够正确计算所有节点的分层 (x, y) 坐标且严格单调', () => {
    const nodes = JSON.parse(JSON.stringify(sampleNodes));
    TrieCanvasAdapter.computeCoordinates(nodes, 800, 400, 2);

    for (const node of nodes) {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(node.x).toBeGreaterThan(0);
      expect(node.x).toBeLessThan(800);
      expect(node.y).toBeGreaterThanOrEqual(40);
    }

    // 深度越深，y 坐标越大
    expect(nodes[3].y).toBeGreaterThan(nodes[1].y);
    expect(nodes[1].y).toBeGreaterThan(nodes[0].y);
  });

  it('2. renderTrieCanvas 能够生成包含 bit 标尺与连接线的纯净 SVG DOM', () => {
    const container = document.createElement('div');
    const state: TrieCanvasState = {
      nodesList: JSON.parse(JSON.stringify(sampleNodes)),
      activeNodeId: 3,
      activePathNodeIds: [1, 3, 5],
      maxBit: 2,
      curBit: 1,
      globalMaxXor: 3,
    };

    TrieCanvasAdapter.renderTrieCanvas(container, state);

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 720 380');

    // 检查标尺文本与节点圆圈
    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts).toContain('bit 2');
    expect(texts).toContain('ROOT');
    expect(texts).toContain('1');

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(5);
  });

  it('3. renderTrieCard2 在 Stage 1 / 2 / 3 下均能稳定渲染且不发生 NaN 泄露', () => {
    const container = document.createElement('div');

    // Stage 1
    const stage1State: TrieCard2State = {
      stageId: 'stage-1',
      curNum: 25,
      curBit: 4,
      expectedBit: 1,
      actualBit: 1,
      curXor: 16,
      globalMaxXor: 28,
      bestPair: [5, 25],
    };
    TrieCanvasAdapter.renderTrieCard2(container, stage1State);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.textContent).toContain('25');
    expect(container.textContent).toContain('28');

    // Stage 2: 静态数组
    const stage2State: TrieCard2State = {
      stageId: 'stage-2',
      globalMaxXor: 28,
      staticTable: {
        rows: [
          { index: 1, left: 2, right: 3 },
          { index: 2, left: 0, right: 0 },
        ],
        activeRow: 1,
      },
    };
    TrieCanvasAdapter.renderTrieCard2(container, stage2State);
    expect(container.textContent).toContain('tree[N][2]');
    expect(container.textContent).toContain('tree[idx][0]');

    // Stage 3: 前缀异或
    const stage3State: TrieCard2State = {
      stageId: 'stage-3',
      globalMaxXor: 7,
      prefixXorList: [
        { idx: 0, num: 0, eor: 0 },
        { idx: 1, num: 3, eor: 3, isCurrent: true },
      ],
    };
    TrieCanvasAdapter.renderTrieCard2(container, stage3State);
    expect(container.textContent).toContain('前缀异或自反性');
    expect(container.textContent).toContain('eor[0..1]');
  });
});
