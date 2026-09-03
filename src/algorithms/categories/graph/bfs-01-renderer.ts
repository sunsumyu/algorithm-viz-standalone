/**
 * 0-1 BFS 双端队列最短路 (0-1 BFS with Deque) 声明式可视化器
 * 核心：边权为 0 插队头 addFirst、边权为 1 插队尾 addLast、维护队列双段性与单调性、严格 O(V + E) (LeetCode 2290 / 洛谷 P4568)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（队列初始化、while非空循环、pollFirst、出边松弛、0权插队头/1权插队尾均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BFS_01_CODE_LANGUAGES,
  BFS_01_PROBLEM_HTML,
  BFS_01_ANALYSIS_HTML,
} from './bfs-01-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface BFS01Step {
  dequeList: Array<{ u: number; dist: number }>;
  distMap: Record<number, number>;
  curU: number;
  activeEdge?: { u: number; v: number; w: number };
  shortestPath?: number[];
  distArray: number[];
  dequeArray: number[];
  activeArray?: 'dist' | 'deque';
  activeSlot?: number;
  status: 'init' | 'pop' | 'relax0' | 'relax1' | 'skip' | 'target' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildBFS01Steps(preset: string = 'classic_5node'): BFS01Step[] {
  const steps: BFS01Step[] = [];
  const is5Node = preset === 'classic_5node';
  const n = is5Node ? 5 : 4;
  const src = 1;
  const target = n;

  const edges: Array<{ u: number; v: number; w: number }> = is5Node
    ? [
        { u: 1, v: 2, w: 0 },
        { u: 1, v: 3, w: 1 },
        { u: 2, v: 4, w: 1 },
        { u: 3, v: 4, w: 0 },
        { u: 4, v: 5, w: 0 },
      ]
    : [
        { u: 1, v: 2, w: 0 },
        { u: 1, v: 3, w: 1 },
        { u: 2, v: 4, w: 1 },
        { u: 3, v: 4, w: 0 },
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
  }

  const dist: number[] = new Array(n + 1).fill(Infinity);
  const pre: number[] = new Array(n + 1).fill(0);
  const deque: Array<{ u: number; dist: number }> = [];
  let curU = src;
  let activeEdge: { u: number; v: number; w: number } | undefined = undefined;

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 18, java: 9, python: 8, javascript: 2 },
    initDist: { cpp: 20, java: 11, python: 10, javascript: 7 },
    initFillDist: { cpp: 20, java: 12, python: 10, javascript: 8 },
    initDeque: { cpp: 21, java: 16, python: 11, javascript: 9 },
    initSrcDist: { cpp: 23, java: 17, python: 12, javascript: 10 },
    pushSrc: { cpp: 24, java: 18, python: 12, javascript: 11 },
    whileDeque: { cpp: 29, java: 22, python: 17, javascript: 13 },
    pollNode: { cpp: 30, java: 23, python: 18, javascript: 14 },
    checkTarget: { cpp: 33, java: 26, python: 19, javascript: 16 },
    loopEdges: { cpp: 35, java: 28, python: 22, javascript: 18 },
    checkRelax: { cpp: 40, java: 33, python: 26, javascript: 20 },
    applyRelax: { cpp: 41, java: 34, python: 27, javascript: 21 },
    checkWeightZero: { cpp: 42, java: 35, python: 28, javascript: 22 },
    pushFront: { cpp: 43, java: 36, python: 29, javascript: 23 },
    pushBack: { cpp: 45, java: 38, python: 31, javascript: 25 },
    returnAns: { cpp: 50, java: 44, python: 33, javascript: 30 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax0' | 'relax1' | 'skip' | 'target' | 'done',
    activeArray?: 'dist' | 'deque',
    activeSlot?: number
  ): void {
    const dMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) dMap[i] = dist[i];

    const curStr = status === 'done' ? `到达终点 Node ${target}` : `Node ${curU} (d:${dist[curU] === Infinity ? '∞' : dist[curU]})`;
    const targetDistStr = dist[target] === Infinity ? '∞' : `${dist[target]}`;
    const dqStr = deque.length > 0 ? `[ ${deque.map((x) => `N${x.u}(d:${x.dist})`).join(', ')} ]` : '空双端队列';

    const phaseStr =
      status === 'done'
        ? '0-1 BFS 最短路完成'
        : status === 'relax0'
          ? '0 权边插队头 (addFirst)'
          : status === 'relax1'
            ? '1 权边插队尾 (addLast)'
            : status === 'pop'
              ? '队头出队 (pollFirst)'
              : '算法初始化';

    let shortestPath: number[] | undefined = undefined;
    if (status === 'done') {
      let curr = target;
      shortestPath = [];
      while (curr !== 0) {
        shortestPath.unshift(curr);
        curr = pre[curr];
      }
    }

    const distSlice: number[] = [];
    for (let i = 1; i <= n; i++) distSlice.push(dist[i] === Infinity ? 999 : dist[i]);

    steps.push({
      dequeList: deque.map((x) => ({ ...x })),
      distMap: dMap,
      curU,
      activeEdge,
      shortestPath,
      distArray: distSlice,
      dequeArray: deque.map((x) => x.u),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-bfs01-node': curStr,
        'metric-bfs01-dist': `终点距离: ${targetDistStr}`,
        'metric-deque-size': `${deque.length} 个就绪元素`,
        'metric-bfs01-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] minimumObstacles(n=${n}, src=1, target=${target})：开启 0-1 双端队列 BFS。`, 'minimumObstacles 入口', 'init');
  makeStep(lines.initDist, `📊 [分配距离数组] int[] distance = new int[${n + 1}]；全部填充为无穷大 ∞。`, 'Arrays.fill(distance, INF)', 'init', 'dist');

  makeStep(lines.initDeque, '📦 [初始化双端队列] ArrayDeque<int[]> deque = new ArrayDeque<>()；用于维护两段性单调队列。', 'new ArrayDeque()', 'init', 'deque');

  dist[src] = 0;
  makeStep(lines.initSrcDist, `🌱 [设置起点距离] distance[${src}] = 0；起点初始距离为 0。`, `dist[${src}] = 0`, 'init', 'dist', src - 1);

  deque.push({ u: src, dist: 0 });
  makeStep(lines.pushSrc, `📥 [起点入队头] deque.addFirst([node=${src}, dist=0])；起点就绪！`, `addFirst(${src})`, 'init', 'deque', 0);

  // 2. 0-1 BFS 主循环
  while (deque.length > 0) {
    makeStep(lines.whileDeque, `🔁 [检查队列非空] while (!deque.isEmpty()) -> 当前双端队列长度: ${deque.length}。`, `!deque.isEmpty()`, 'pop');

    const top = deque.shift()!;
    curU = top.u;
    const curDist = top.dist;

    makeStep(lines.pollNode, `📤 [弹出队头最小距离点] pollFirst() -> 节点 ${curU} (当前距离 d = ${curDist})！`, `pollFirst Node ${curU}`, 'pop', 'deque', 0);

    makeStep(lines.checkTarget, `🎯 [终点核验] if (u == target) -> (${curU} == ${target})。`, `u == ${target}?`, 'target');
    if (curU === target) {
      makeStep(lines.checkTarget, `🏆 [抵达目标终点] 成功到达终点节点 ${target}！当前最短距离锁定为 ${dist[target]}！`, `到达终点 ${target}`, 'target');
      break;
    }

    for (const e of adj[curU]) {
      const v = e.to;
      const w = e.w;
      activeEdge = { u: curU, v, w };

      makeStep(lines.loopEdges, `  ↳ [遍历出边] 考察边 (${curU} ➔ ${v}, 权重 ${w})。`, `edge (${curU}, ${v}, w=${w})`, 'pop');

      makeStep(lines.checkRelax, `  🔎 [松弛检验] if (distance[${v}] > distance[${curU}] + ${w}) -> (${dist[v] === Infinity ? '∞' : dist[v]} > ${dist[curU] + w})。`, `check relax (${curU}->${v})`, 'pop');

      if (dist[v] > dist[curU] + w) {
        dist[v] = dist[curU] + w;
        pre[v] = curU;
        makeStep(lines.applyRelax, `  ⚡ [更新到达距离] 发现更优路径！distance[${v}] = ${dist[v]}！`, `dist[${v}] = ${dist[v]}`, 'pop', 'dist', v - 1);

        makeStep(lines.checkWeightZero, `  ⚖️ [边权分流判定] if (weight == 0) -> (权重为 ${w})。`, `weight == 0? (${w})`, 'pop');

        if (w === 0) {
          deque.unshift({ u: v, dist: dist[v] });
          makeStep(lines.pushFront, `  🚀 [0 权插队头] 零权无需耗费代价！调用 deque.addFirst(${v}) 插队头，维持严格单调递增！`, `addFirst(${v})`, 'relax0', 'deque', 0);
        } else {
          deque.push({ u: v, dist: dist[v] });
          makeStep(lines.pushBack, `  🐢 [1 权插队尾] 权值为 1 耗费代价！调用 deque.addLast(${v}) 插队尾，自然维持两段性 [d, d+1]！`, `addLast(${v})`, 'relax1', 'deque', deque.length - 1);
        }
      }
    }
    activeEdge = undefined;
  }

  makeStep(lines.returnAns, `🎉 [0-1 BFS 最短路完成] return distance[${target}] = ${dist[target]}！全过程无堆调整开销，严格 O(V + E)！`, `return dist[${target}]=${dist[target]}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BFS01Step>({
  id: 'bfs-01',
  name: '0-1 BFS 双端队列最短路 (0-1 BFS Deque)',
  viewId: 'algo-bfs-01-view',
  category: 'graph',
  icon: '⚡',
  badge: {
    mode: '双端队列 Deque · 0权插队头 / 1权插队尾',
    complexity: 'O(V + E) · O(V)',
  },
  card1Title: '⚡ 0-1 最短路拓扑与双端队列沙盘',
  card2Title: '📊 0-1 BFS 状态监视器 (dist[], deque)',
  card2Desc: '展示双端队列队头弹出 pollFirst、0 权插队头 addFirst 与 1 权插队尾 addLast 的两段性维护',
  legend: [
    { label: '🟢 0 权无损转移边 (插队头)', color: '#10b981' },
    { label: '🔵 1 权耗损转移边 (插队尾)', color: '#38bdf8' },
    { label: '⚡ 当前出队考察节点', color: '#f59e0b' },
    { label: '🏆 最优 0-1 最短路径', color: '#a855f7' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_5node',
      options: [
        { label: '5 节点经典 0-1 网络 (含 0/1 混合路径，最短代价 1)', value: 'classic_5node' },
        { label: '4 节点入门 0-1 网络 (含直连与折射对比，最短代价 1)', value: 'simple_4node' },
      ],
    },
  ],
  presets: [
    { label: '5 节点经典网络', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点入门网络', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-bfs01-node', label: '当前考察节点', color: '#f59e0b' },
    { id: 'metric-bfs01-dist', label: '终点到达代价', color: '#10b981' },
    { id: 'metric-deque-size', label: '双端队列规模', color: '#38bdf8' },
    { id: 'metric-bfs01-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: BFS_01_CODE_LANGUAGES,
  problemHtml: BFS_01_PROBLEM_HTML,
  analysisHtml: BFS_01_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_5node') as string;
    return buildBFS01Steps(preset);
  },
  renderCanvas: (container, step) => {
    const is5 = step.distArray.length === 5;
    const n = is5 ? 5 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = is5
      ? {
          1: { x: 45, y: 80 },
          2: { x: 110, y: 35 },
          3: { x: 110, y: 125 },
          4: { x: 195, y: 80 },
          5: { x: 265, y: 80 },
        }
      : {
          1: { x: 50, y: 80 },
          2: { x: 130, y: 35 },
          3: { x: 130, y: 125 },
          4: { x: 230, y: 80 },
        };

    const edges: Array<{ u: number; v: number; w: number }> = is5
      ? [
          { u: 1, v: 2, w: 0 },
          { u: 1, v: 3, w: 1 },
          { u: 2, v: 4, w: 1 },
          { u: 3, v: 4, w: 0 },
          { u: 4, v: 5, w: 0 },
        ]
      : [
          { u: 1, v: 2, w: 0 },
          { u: 1, v: 3, w: 1 },
          { u: 2, v: 4, w: 1 },
          { u: 3, v: 4, w: 0 },
        ];

    const isPathEdge = (u: number, v: number) => {
      if (!step.shortestPath || step.shortestPath.length < 2) return false;
      for (let i = 0; i < step.shortestPath.length - 1; i++) {
        if (step.shortestPath[i] === u && step.shortestPath[i + 1] === v) return true;
      }
      return false;
    };

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge.u === e.u && step.activeEdge.v === e.v;
        const onPath = isPathEdge(e.u, e.v);

        const color = onPath ? '#a855f7' : isAct ? '#facc15' : e.w === 0 ? '#10b981' : '#38bdf8';
        const width = onPath ? 3.5 : isAct ? 3 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#bfs01-arrow)" />
            <rect x="${mx - 7}" y="${my - 7}" width="14" height="12" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="${mx}" y="${my + 2}" fill="${e.w === 0 ? '#34d399' : '#38bdf8'}" font-size="8" font-weight="700" text-anchor="middle">${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = is5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';

        const isCur = step.curU === u && step.status !== 'done';
        const onPath = step.shortestPath && step.shortestPath.includes(u);
        const dVal = step.distArray[u - 1];
        const dStr = dVal === 999 || dVal === undefined ? '∞' : `${dVal}`;

        const bg = onPath ? '#581c87' : isCur ? '#b45309' : dVal < 999 ? '#065f46' : '#1e293b';
        const border = onPath ? '#c084fc' : isCur ? '#facc15' : dVal < 999 ? '#10b981' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${onPath || isCur ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="${dVal < 999 ? '#10b981' : '#64748b'}" font-size="7.5" font-weight="700" text-anchor="middle">d:${dStr}</text>
          </g>
        `;
      })
      .join('');

    const dequeBadges = step.dequeList.length > 0
      ? step.dequeList.map((item, idx) => `
          <div style="background: ${idx === 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(30, 41, 59, 0.7)'}; border: 1px solid ${idx === 0 ? '#eab308' : '#38bdf8'}; border-radius: 4px; padding: 4px 8px; display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 7.5px; color: ${idx === 0 ? '#facc15' : '#94a3b8'};">${idx === 0 ? '队头 (First)' : `Slot ${idx}`}</span>
            <span style="font-size: 10.5px; font-weight: 700; color: #e2e8f0;">Node ${item.u} (d=${item.dist})</span>
          </div>
        `).join('')
      : '<span style="font-size: 10.5px; color: #64748b;">(双端队列为空)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">⚡ 0-1 最短路网络拓扑</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            到达终点耗费: <b style="color: #10b981;">${step.distArray[n - 1] === 999 ? '∞' : step.distArray[n - 1]}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 310 150">
            <defs>
              <marker id="bfs01-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部双端队列沙盘舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">📦 0-1 双端队列 Deque 沙盘舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              队列元素: <b>${step.dequeList.length}</b> 个
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            ${dequeBadges}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const n = step.distArray.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = val === 999 ? '∞' : `${val}`;
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">N[${idx + 1}]</span>
              <span style="line-height: 1.1;">${displayVal}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const distRow = renderRow('distance[] (最短路)', step.distArray, 'dist', '#38bdf8');
    const dqStr = step.dequeList.length > 0
      ? step.dequeList.map((x) => `N${x.u}(d:${x.dist})`).join(' ➔ ')
      : '空';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${distRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">双端队列状态:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">[ ${dqStr} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'bfs-01',
  name: '0-1 BFS 双端队列最短路 (0-1 BFS Deque)',
  viewId: 'algo-bfs-01-view',
  category: 'graph',
  description: '左程云 Class 062 核心：边权为 0 插队头 addFirst、边权为 1 插队尾 addLast、维护双段性单调队列、时间复杂度 O(V + E) (LeetCode 2290)',
  icon: '⚡',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 25,
  learningGoal: '掌握 0-1 BFS 相比 Dijkstra 的常数与渐进复杂度优势，理解双端队列如何天然保持单调性',
});

export { Visualizer as BFS01Visualizer };
