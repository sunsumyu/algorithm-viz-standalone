/**
 * 反向索引堆优化 Dijkstra (Dijkstra with Index Heap / Decrease-Key) 声明式可视化器
 * 最短路架构: 反向索引映射 indexMap[u]、支持 decreaseKey 原地 O(log N) 向上调整、消除冗余死节点压堆 (左程云图论核心)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
  DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
  DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
} from './dijkstra-index-heap-problem-content';

export interface IndexHeapStep {
  heapNodes: Array<{ u: number; dist: number }>;
  indexMap: Record<number, number>;
  settled: number[];
  curPop: number | null;
  status: 'init' | 'pop' | 'decrease' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildIndexHeapSteps(): IndexHeapStep[] {
  const steps: IndexHeapStep[] = [];

  steps.push({
    heapNodes: [{ u: 1, dist: 0 }],
    indexMap: { 1: 0, 2: -1, 3: -1, 4: -1 },
    settled: [],
    curPop: null,
    status: 'init',
    message: '1. [反向索引堆初始化] 起点 1 入堆，堆顶为 (1, d:0)，indexMap[1] = 0，其余点标记为 -1 (未入堆)！',
    log: '起点 1 入索引堆：heap=[(1, 0)], indexMap[1]=0',
    codeLine: [18, 25],
  });

  steps.push({
    heapNodes: [
      { u: 2, dist: 2 },
      { u: 3, dist: 5 },
    ],
    indexMap: { 1: -2, 2: 0, 3: 1, 4: -1 },
    settled: [1],
    curPop: 1,
    status: 'pop',
    message: '2. [弹出堆顶 1 并松弛邻居] 弹出 1 (标记为 -2 锁定)，松弛 2 (d:2) 与 3 (d:5)，直接入堆并更新索引！',
    log: '弹出节点 1 并锁定 (indexMap=-2)，加入邻居 2(d:2), 3(d:5)',
    codeLine: [28, 35],
  });

  steps.push({
    heapNodes: [
      { u: 3, dist: 3 },
      { u: 4, dist: 6 },
    ],
    indexMap: { 1: -2, 2: -2, 3: 0, 4: 1 },
    settled: [1, 2],
    curPop: 2,
    status: 'decrease',
    message: '3. [Decrease-Key 原地向上调整] 弹出 2，通过边 (2-3, w:1) 发现到达 3 距离缩短至 2+1=3！原地修改堆中 3 并 siftUp 调整，无需重复入堆！',
    log: 'decreaseKey(Node 3): 原地调整 dist 5 ➔ 3，保持堆严格只有 N 个节点',
    codeLine: [38, 45],
  });

  steps.push({
    heapNodes: [],
    indexMap: { 1: -2, 2: -2, 3: -2, 4: -2 },
    settled: [1, 2, 3, 4],
    curPop: 4,
    status: 'done',
    message: '🎉 [索引堆最短路求解完成] 所有节点严格各出堆 1 次，堆内节点数恒 ≤ N，内存与常数极度优异！',
    log: '✓ 反向索引堆 Dijkstra 求解完毕：全图最短路确定',
    codeLine: [48, 52],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<IndexHeapStep>({
  id: 'dijkstra-index-heap',
  name: '反向索引堆 Dijkstra (Dijkstra Index Heap)',
  category: 'graph',
  icon: '🗂️',
  badge: {
    mode: '原位 decreaseKey 优化',
    complexity: 'O(E log V) · O(V)',
  },
  card1Title: '🗂️ 图拓扑与反向索引堆映射沙盘',
  card2Title: '🧭 反向索引表 indexMap 与堆结构监视器',
  card2Desc: 'indexMap[u] (-1未入堆, ≥0堆位置, -2已锁定) 与堆内原位更新',
  legend: [
    { label: '未处理节点 (indexMap: -1)', color: '#0284c7' },
    { label: '🗂️ 堆中节点 (indexMap: ≥0)', color: '#f59e0b' },
    { label: '🟢 已锁定最短路 (indexMap: -2)', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点索引堆测试图', values: {} },
  ],
  metrics: [
    { id: 'metric-heap-size', label: '堆内活跃节点数', color: '#f59e0b' },
    { id: 'metric-settled-count', label: '已确定最短路节点', color: '#10b981' },
  ],
  codeLanguages: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
  problemHtml: DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
  analysisHtml: DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
  buildSteps: () => buildIndexHeapSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 110 },
      2: { x: 155, y: 55 },
      3: { x: 155, y: 165 },
      4: { x: 235, y: 110 },
    };

    const edges = [
      { u: 1, v: 2, w: 2 },
      { u: 1, v: 3, w: 5 },
      { u: 2, v: 3, w: 1 },
      { u: 2, v: 4, w: 4 },
      { u: 3, v: 4, w: 2 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" />
            <text x="${midX}" y="${midY}" fill="#94a3b8" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const status = step.indexMap[u];
        const isSettled = status === -2;
        const inHeap = status >= 0;
        const bg = isSettled ? '#065f46' : inHeap ? '#b45309' : '#0369a1';
        const border = isSettled ? '#10b981' : inHeap ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${isSettled ? '#34d399' : inHeap ? '#facc15' : '#94a3b8'}" font-size="8.5" font-weight="700" text-anchor="middle">idx:${status}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟡 金色为堆中活跃点 | 🟢 绿色为确定锁定点 | 索引堆维护 indexMap 保证每个点在堆中严格至多一份
        </div>
      </div>
    `;

    const root = container.closest('#algo-dijkstra-index-heap-view');
    if (root) {
      const hEl = root.querySelector('#metric-heap-size');
      const sEl = root.querySelector('#metric-settled-count');

      if (hEl) hEl.textContent = `${step.heapNodes.length} 个`;
      if (sEl) sEl.textContent = `${step.settled.length} / 4`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const mapItems = Object.entries(step.indexMap)
          .map(([u, idx]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">map[N${u}]: ${idx}</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>反向索引映射表:</span>
              <div style="display: flex; gap: 4px;">${mapItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 索引堆核心机制:</span>
              <strong style="font-family: monospace; color: #2563eb;">利用 indexMap 追踪节点在堆中的物理下标，实现 O(log V) 真正原地更新</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'dijkstra-index-heap',
  name: '反向索引堆 Dijkstra (Dijkstra Index Heap)',
  viewId: 'algo-dijkstra-index-heap-view',
  category: 'graph',
  description: '左程云算法通关课核心堆优化：设计反向索引映射表 indexMap、支持 decreaseKey 原地 O(log V) 向上调整、消除系统优先队列冗余垃圾节点',
  icon: '🗂️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 38,
  learningGoal: '掌握手写反向索引堆的 indexMap 双向同步技巧、decreaseKey 原地修改与标准 Dijkstra 性能对比',
});

export { Visualizer as DijkstraIndexHeapVisualizer };
