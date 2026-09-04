/**
 * 最近公共祖先 LCA (Binary Lifting LCA - 树上倍增) 声明式可视化器
 * 进阶树论: 深度对齐 depth[u] == depth[v]、二进制倍增同步上跳 up[u][i] != up[v][i]、O(log N) 极速查询 (洛谷 P3379)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (depth, up[0], up[1]) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  LCA_BINARY_LIFTING_CODE_LANGUAGES,
  LCA_BINARY_LIFTING_PROBLEM_HTML,
  LCA_BINARY_LIFTING_ANALYSIS_HTML,
} from './lca-binary-lifting-problem-content';

export interface LCAStep {
  nodeU: number;
  nodeV: number;
  curU: number;
  curV: number;
  curPower?: number;
  lcaResult: number | null;
  treeDist?: number;
  activePath?: number[];
  depthArray: number[];
  up0Array: number[];
  up1Array: number[];
  activeArray?: 'depth' | 'up0' | 'up1';
  activeSlot?: number;
  stage: 'init' | 'dfs_up' | 'align' | 'leap' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildLCASteps(preset: string = 'classic_7node'): LCAStep[] {
  const steps: LCAStep[] = [];
  const isFork = preset === 'fork_5node';
  const n = isFork ? 5 : 7;
  const root = 1;

  // 树结构边定义
  // classic_7node: (1,2), (1,3), (2,4), (2,5), (4,6), (3,7) -> 查询 (6, 5), LCA=2, dist=3
  // fork_5node: (1,2), (1,3), (2,4), (3,5) -> 查询 (4, 5), LCA=1, dist=4
  const edges: Array<[number, number]> = isFork
    ? [
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 5],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [4, 6],
        [3, 7],
      ];

  const qU = isFork ? 4 : 6;
  const qV = isFork ? 5 : 5;

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const depth: number[] = new Array(n + 1).fill(0);
  const up: number[][] = Array.from({ length: n + 1 }, () => new Array(21).fill(0));

  let curU = qU;
  let curV = qV;
  let curPower: number | undefined = undefined;
  let lcaResult: number | null = null;
  let treeDist: number | undefined = undefined;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    stage: 'init' | 'dfs_up' | 'align' | 'leap' | 'done',
    activePath?: number[],
    activeArray?: 'depth' | 'up0' | 'up1',
    activeSlot?: number
  ): void {
    const resStr = lcaResult !== null ? `Node ${lcaResult}` : '计算中...';
    const stateStr = lcaResult !== null ? `LCA = ${lcaResult}` : `u:${curU}, v:${curV}`;

    const phaseStr =
      stage === 'done'
        ? '查询完成'
        : stage === 'leap'
          ? '同步试跳'
          : stage === 'align'
            ? '深度对齐'
            : stage === 'dfs_up'
              ? 'DFS 预处理倍增表'
              : '算法初始化';

    const up0 = up.map((row) => row[0]);
    const up1 = up.map((row) => row[1]);

    steps.push({
      nodeU: qU,
      nodeV: qV,
      curU,
      curV,
      curPower,
      lcaResult,
      treeDist,
      activePath,
      depthArray: [...depth],
      up0Array: up0,
      up1Array: up1,
      activeArray,
      activeSlot,
      stage,
      message,
      log,
      codeLine,
      metrics: {
        'metric-lca-query': `(${qU}, ${qV})`,
        'metric-lca-res': resStr,
        'metric-cur-state': stateStr,
        'metric-lca-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 7: Code01_LCA_BinaryLifting
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 个顶点的树，以 root=${root} 为根。待查询节点对为 (${qU}, ${qV})。`, `init(${n})`, 'init');

  // ==================== 2. DFS 预处理 depth[] 与倍增表 up[][] ====================
  function dfs(u: number, p: number, d: number): void {
    // 行 8: depth[u] = d;
    depth[u] = d;
    makeStep(8, `📏 [记录深度] depth[${u}] = ${d}; 访问节点 ${u}。`, `depth[${u}] = ${d}`, 'dfs_up', [u], 'depth', u);

    // 行 9: up[u][0] = p;
    up[u][0] = p;
    makeStep(9, `👆 [直系父节点] up[${u}][0] = ${p} (向上跳 2^0=1 步到达父节点)。`, `up[${u}][0] = ${p}`, 'dfs_up', [u, p], 'up0', u);

    // 行 10-11: 倍增递推 up[u][i] = up[up[u][i-1]][i-1]
    for (let i = 1; i <= 3; i++) {
      up[u][i] = up[up[u][i - 1]][i - 1];
    }
    if (up[u][1] > 0) {
      makeStep(11, `🚀 [递推倍增祖先] up[${u}][1] = up[up[${u}][0]][0] = ${up[u][1]} (向上跳 2^1=2 步)。`, `up[${u}][1] = ${up[u][1]}`, 'dfs_up', [u, up[u][1]], 'up1', u);
    }

    for (const v of adj[u]) {
      if (v !== p) {
        dfs(v, u, d + 1);
      }
    }
  }

  dfs(root, 0, 1);

  // ==================== 3. 求解 LCA ====================
  // 行 18: getLCA(u, v)
  makeStep(18, `🧭 [启动倍增查询] getLCA(${qU}, ${qV}): 两阶段求解——阶段一深度对齐，阶段二二进制同步跃升。`, `getLCA(${qU}, ${qV})`, 'align');

  // 行 19: if (depth[u] < depth[v]) swap
  if (depth[curU] < depth[curV]) {
    const t = curU;
    curU = curV;
    curV = t;
    makeStep(19, `🔄 [确保 u 更深] 交换变量使得 depth[u=${curU}] >= depth[v=${curV}]。`, 'swap(u, v)', 'align');
  }

  // 行 20-22: 阶段一：深度对齐
  for (let i = 3; i >= 0; i--) {
    if (depth[curU] - (1 << i) >= depth[curV]) {
      curPower = i;
      const nextU = up[curU][i];
      makeStep(21, `🪜 [深度对齐跃升] depth[${curU}] - 2^${i} >= depth[${curV}] (${depth[curU] - (1 << i)} >= ${depth[curV]})：u 从 ${curU} 向上跳到 ${nextU}。`, `u 跳跃 2^${i} 至 ${nextU}`, 'align', [curU, nextU]);
      curU = nextU;
    }
  }

  makeStep(20, `🎯 [深度对齐完毕] 此时 u 与 v 深度完全对齐：depth[${curU}]=${depth[curU]}, depth[${curV}]=${depth[curV]}。`, '深度对齐就绪', 'align');

  // 行 23: if (u == v) return u;
  if (curU === curV) {
    lcaResult = curU;
    makeStep(23, `👑 [直接相遇] u == v == ${curU}！二者已在同一节点相遇，LCA 判定完毕！`, `LCA = ${curU}`, 'done');
  } else {
    // 行 24-29: 阶段二：同步倍增试跳
    makeStep(24, `⚡ [启动同步跃升] u=${curU} 与 v=${curV} 深度相同但不同点，从大到小尝试二进制步长 2^i 跃升。`, '开始二进制试跳', 'leap');

    for (let i = 3; i >= 0; i--) {
      curPower = i;
      if (up[curU][i] !== up[curV][i]) {
        const nextU = up[curU][i];
        const nextV = up[curV][i];
        makeStep(26, `🚀 [同步向上跃升] up[${curU}][${i}] (${nextU}) != up[${curV}][${i}] (${nextV})：未跨过 LCA，u 跃升至 ${nextU}，v 跃升至 ${nextV}！`, `同步跳 2^${i}`, 'leap', [nextU, nextV]);
        curU = nextU;
        curV = nextV;
      } else {
        makeStep(25, `⚠️ [尝试跨过 LCA] 若跳 2^${i} 步将到达相同祖先 ${up[curU][i]} (可能越过 LCA)，保持当前位置不跳。`, `步长 2^${i} 越过 LCA，放弃`, 'leap');
      }
    }

    // 行 30: return up[u][0];
    lcaResult = up[curU][0];
    makeStep(30, `👑 [停在 LCA 正下方] 当前 u=${curU}, v=${curV} 位于 LCA 的两个不同分支正下方！其共同父亲 up[u][0] = ${lcaResult} 即为所求 LCA！`, `LCA = ${lcaResult}`, 'done');
  }

  // ==================== 4. 计算树上两点距离 ====================
  // 行 33-35: getDist
  treeDist = depth[qU] + depth[qV] - 2 * depth[lcaResult];
  makeStep(35, `📏 [树上两点距离] dist(${qU}, ${qV}) = depth[${qU}] (${depth[qU]}) + depth[${qV}] (${depth[qV]}) - 2 * depth[${lcaResult}] (${2 * depth[lcaResult]}) = ${treeDist}！`, `dist(${qU}, ${qV}) = ${treeDist}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<LCAStep>({
  id: 'lca-binary-lifting',
  name: '最近公共祖先与树上倍增 (LCA Binary Lifting)',
  viewId: 'algo-lca-binary-lifting-view',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: '深度对齐 + 二进制倍增上跳',
    complexity: 'O(N log N) · O(log N)',
  },
  card1Title: '🌳 树形拓扑、深度分层与倍增试跳沙盘',
  card2Title: '📊 倍增状态分析器 (depth, up[0], up[1], 试跳步长)',
  card2Desc: '逐行对齐 DFS 树深度与倍增表递推、阶段一深度对齐跃升、阶段二二进制试跳与两点最短距离计算',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 查询节点 u / v', color: '#ef4444' },
    { label: '👑 最近公共祖先 LCA', color: '#f59e0b' },
    { label: '🟢 试跳路径边', color: '#10b981' },
    { label: '⚪ 普通树边', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树拓扑',
      type: 'select',
      defaultValue: 'classic_7node',
      options: [
        { label: '7 节点经典树 (查询 6 与 5，LCA 为 2)', value: 'classic_7node' },
        { label: '5 节点分叉树 (查询 4 与 5，LCA 为 1)', value: 'fork_5node' },
      ],
    },
  ],
  presets: [
    { label: '7 节点经典树', values: { 'input-preset': 'classic_7node' } },
    { label: '5 节点分叉树', values: { 'input-preset': 'fork_5node' } },
  ],
  metrics: [
    { id: 'metric-lca-query', label: '当前查询点对', color: '#ef4444' },
    { id: 'metric-lca-res', label: '最近公共祖先 LCA', color: '#f59e0b' },
    { id: 'metric-cur-state', label: '跃升指针当前状态', color: '#38bdf8' },
    { id: 'metric-lca-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: LCA_BINARY_LIFTING_CODE_LANGUAGES,
  problemHtml: LCA_BINARY_LIFTING_PROBLEM_HTML,
  analysisHtml: LCA_BINARY_LIFTING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_7node') as string;
    return buildLCASteps(preset);
  },
  renderCanvas: (container, step) => {
    const isFork = step.nodeU === 4 && step.nodeV === 5;
    const nodeCoords: Record<number, { x: number; y: number }> = isFork
      ? {
          1: { x: 155, y: 35 },
          2: { x: 95, y: 105 },
          3: { x: 215, y: 105 },
          4: { x: 95, y: 175 },
          5: { x: 215, y: 175 },
        }
      : {
          1: { x: 155, y: 35 },
          2: { x: 95, y: 85 },
          3: { x: 215, y: 85 },
          4: { x: 65, y: 135 },
          5: { x: 125, y: 135 },
          6: { x: 65, y: 185 },
          7: { x: 215, y: 135 },
        };

    const edges = isFork
      ? [
          [1, 2],
          [1, 3],
          [2, 4],
          [3, 5],
        ]
      : [
          [1, 2],
          [1, 3],
          [2, 4],
          [2, 5],
          [4, 6],
          [3, 7],
        ];

    const svgEdges = edges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const inPath = step.activePath && step.activePath.includes(u) && step.activePath.includes(v);
        const color = inPath ? '#10b981' : '#475569';
        const width = inPath ? 3.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = isFork ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isLCA = step.lcaResult === u;
        const isCur = step.curU === u || step.curV === u;
        const isQuery = step.nodeU === u || step.nodeV === u;

        const bg = isLCA ? '#b45309' : isCur ? '#065f46' : isQuery ? '#991b1b' : '#1e3a8a';
        const border = isLCA ? '#f59e0b' : isCur ? '#10b981' : isQuery ? '#ef4444' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isLCA || isCur ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 25}" fill="${isLCA ? '#f59e0b' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isLCA ? '👑LCA' : `d:${step.depthArray[u] || 0}`}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          节点底部为深度 depth[u] | 金色皇冠为最近公共祖先 LCA | 树上最短距离 dist = depth[u] + depth[v] - 2*depth[LCA]
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-lca-binary-lifting-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const totalIndices = nodes;
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = totalIndices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 30px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${val}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 3px;">${cells}</div>
            </div>
          `;
        };

        const depthRow = renderRow('depth[] (树深度)', step.depthArray, 'depth', '#38bdf8');
        const up0Row = renderRow('up[u][0] (父节点)', step.up0Array, 'up0', '#10b981');
        const up1Row = renderRow('up[u][1] (祖先2步)', step.up1Array, 'up1', '#f59e0b');

        const distStr = step.treeDist !== undefined ? `dist = ${step.treeDist}` : '计算中...';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${depthRow}
              ${up0Row}
              ${up1Row}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">两点树上最短距离:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">${distStr}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #94a3b8; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'lca-binary-lifting',
  name: '最近公共祖先与树上倍增 (LCA Binary Lifting)',
  viewId: 'algo-lca-binary-lifting-view',
  category: 'graph',
  description: '进阶树论经典：树上倍增跳转表 up[u][i]、深度对齐、二进制试跳求 LCA 及两点最短距离 (洛谷 P3379)',
  icon: '🌳',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 82,
  learningGoal: '掌握倍增递推原理 up[u][i]=up[up[u][i-1]][i-1]、两阶段深度对齐与二进制试跳算法',
});

export { Visualizer as LCABinaryLiftingVisualizer };
