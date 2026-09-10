/**
 * 树上差分 (Tree Difference - 点差分与边差分) 声明式可视化器
 * 进阶树论: 点差分 (diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--) 与 边差分 (diff[u]++, diff[v]++, diff[lca]-=2)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (depth, diff, val, up) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_DIFF_CODE_LANGUAGES,
  TREE_DIFF_PROBLEM_HTML,
  TREE_DIFF_ANALYSIS_HTML,
} from './tree-difference-problem-content';

export interface TreeDiffStep {
  mode: 'node' | 'edge';
  diffArray: Record<number, number>;
  recoveredCounts: Record<number, number>;
  depthArray: Record<number, number>;
  activeLca: number;
  activeNode: number;
  activeArray?: 'diff' | 'val' | 'depth';
  activeSlot?: number;
  status: 'init' | 'lca' | 'tag' | 'dfs' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildTreeDifferenceSteps(preset: string = 'node_diff_5node'): TreeDiffStep[] {
  const steps: TreeDiffStep[] = [];
  const isNodeDiff = preset === 'node_diff_5node';
  const mode: 'node' | 'edge' = isNodeDiff ? 'node' : 'edge';
  const n = 5;

  // 经典 5 节点树: 1 为根, 1-2, 1-3, 2-4, 2-5
  const treeEdges: Array<[number, number]> = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
  ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of treeEdges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const depth: number[] = new Array(n + 1).fill(0);
  const up: number[][] = Array.from({ length: n + 1 }, () => new Array(21).fill(0));
  const diff: number[] = new Array(n + 1).fill(0);
  const val: number[] = new Array(n + 1).fill(0);

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'lca' | 'tag' | 'dfs' | 'done',
    activeNode: number = 1,
    activeLca: number = 0,
    activeArray?: 'diff' | 'val' | 'depth',
    activeSlot?: number
  ): void {
    const diffMap: Record<number, number> = {};
    const valMap: Record<number, number> = {};
    const depthMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      diffMap[i] = diff[i];
      valMap[i] = val[i];
      depthMap[i] = depth[i];
    }

    const formulaStr = isNodeDiff
      ? 'diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--'
      : 'diff[u]++, diff[v]++, diff[lca] -= 2';

    const maxVal = Math.max(...Object.values(valMap));

    const phaseStr =
      status === 'done'
        ? '差分汇总完成'
        : status === 'dfs'
          ? '自底向上求子树和'
          : status === 'tag'
            ? '打差分端点标记'
            : status === 'lca'
              ? 'LCA 最近公共祖先'
              : '树结构初始化';

    steps.push({
      mode,
      diffArray: diffMap,
      recoveredCounts: valMap,
      depthArray: depthMap,
      activeLca,
      activeNode,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-active-lca': activeLca ? `LCA 节点 ${activeLca}` : '未计算',
        'metric-max-cover': status === 'done' || status === 'dfs' ? `最大覆盖值: ${maxVal}` : '计算中',
        'metric-diff-formula': formulaStr,
        'metric-diff-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 17: Solver(n)
  makeStep(17, `🚀 [算法初始化] Solver(n=${n})：准备在 5 节点树上执行${isNodeDiff ? '点差分 (路径 4 ➔ 5 点权 +1)' : '边差分 (路径 4 ➔ 5 边权 +1)'}。`, `Solver(${n})`, 'init', 1);

  // 行 20-24: 分配数组
  makeStep([20, 24], '📊 [分配状态数组] 分配 adj, up[][], depth[], diff[], val[] 数组。', '分配状态数组', 'init', 1);

  // 逐条建边
  for (const [u, v] of treeEdges) {
    // 行 27-29: addEdge(u, v)
    makeStep([27, 29], `🔗 [添加树边] addEdge(${u}, ${v})：连接无向边 (${u}, ${v})。`, `addEdge(${u}, ${v})`, 'init', u);
  }

  // ==================== 2. 预处理深度与倍增 LCA ====================
  function dfsLCA(u: number, p: number, d: number): void {
    // 行 33: dfsLCA(u, p, d)
    depth[u] = d;
    up[u][0] = p;
    makeStep([33, 35], `📏 [设置深度与祖先] 节点 ${u}: depth[${u}]=${d}, up[${u}][0]=${p}。`, `depth[${u}]=${d}, up[${u}][0]=${p}`, 'init', u, 0, 'depth', u);

    // 行 36: 倍增递推
    for (let i = 1; i <= 4; i++) {
      up[u][i] = up[up[u][i - 1]][i - 1];
    }

    // 行 37: 遍历子树
    for (const v of adj[u]) {
      if (v !== p) {
        dfsLCA(v, u, d + 1);
      }
    }
  }

  dfsLCA(1, 0, 1);

  // ==================== 3. 计算 LCA(4, 5) ====================
  // 行 42: getLCA(u, v)
  makeStep(42, '🎯 [查询 LCA] 调用 getLCA(u=4, v=5)：计算修改路径两端点的最近公共祖先。', 'getLCA(4, 5)', 'lca', 4);

  // 行 43-51: 倍增得出 LCA
  const lca = 2;
  makeStep([43, 51], `⭐ [锁定 LCA] 倍增求得 4 与 5 的最近公共祖先为节点 2 (LCA=2)！深度为 2。`, `LCA(4, 5) = 2`, 'lca', 2, 2);

  // ==================== 4. 打差分标记 ====================
  if (isNodeDiff) {
    // 点差分：addPathNode(4, 5, 1)
    // 行 55: addPathNode(u, v, w)
    makeStep(55, '✏️ [进入点差分] addPathNode(u=4, v=5, w=1)：覆盖路径 4 ➔ 2 ➔ 5 上所有点。', 'addPathNode(4, 5, 1)', 'tag', 4, 2);

    // 行 57: diff[u] += w;
    diff[4] += 1;
    makeStep(57, '➕ [端点打标] diff[4] += 1; 路径起点 4 权值差分 +1。', 'diff[4] += 1', 'tag', 4, 2, 'diff', 4);

    // 行 58: diff[v] += w;
    diff[5] += 1;
    makeStep(58, '➕ [端点打标] diff[5] += 1; 路径终点 5 权值差分 +1。', 'diff[5] += 1', 'tag', 5, 2, 'diff', 5);

    // 行 59: diff[lca] -= w;
    diff[lca] -= 1;
    makeStep(59, `➖ [LCA 抵消] diff[${lca}] -= 1; LCA 节点 2 被两端点重复计入，抵消 1 次。`, `diff[${lca}] -= 1`, 'tag', lca, 2, 'diff', lca);

    // 行 60: if (up[lca][0] > 0) diff[up[lca][0]] -= w;
    const faLca = up[lca][0]; // 1
    diff[faLca] -= 1;
    makeStep(60, `➖ [父节点截断] diff[${faLca}] -= 1; 防止子树和继续向上溢出至祖先。`, `diff[${faLca}] -= 1`, 'tag', faLca, 2, 'diff', faLca);
  } else {
    // 边差分：addPathEdge(4, 5, 1)
    // 行 64: addPathEdge(u, v, w)
    makeStep(64, '✏️ [进入边差分] addPathEdge(u=4, v=5, w=1)：覆盖路径边 (4,2) 与 (2,5)。', 'addPathEdge(4, 5, 1)', 'tag', 4, 2);

    // 行 66: diff[u] += w;
    diff[4] += 1;
    makeStep(66, '➕ [端点打标] diff[4] += 1; 边 (4, 2) 对应点 4 差分 +1。', 'diff[4] += 1', 'tag', 4, 2, 'diff', 4);

    // 行 67: diff[v] += w;
    diff[5] += 1;
    makeStep(67, '➕ [端点打标] diff[5] += 1; 边 (5, 2) 对应点 5 差分 +1。', 'diff[5] += 1', 'tag', 5, 2, 'diff', 5);

    // 行 68: diff[lca] -= 2 * w;
    diff[lca] -= 2;
    makeStep(68, `➖ [LCA 截断] diff[${lca}] -= 2; 两条树边向上汇总至 LCA 节点 2 时在此完全抵消！`, `diff[${lca}] -= 2`, 'tag', lca, 2, 'diff', lca);
  }

  // ==================== 5. 自底向上 DFS 子树和汇总 ====================
  // 行 72: dfsSum(1, 0)
  makeStep(72, '⚡ [发起子树求和] dfsSum(u=1, p=0): 从根节点向下递归，并在后序回溯时自底向上汇总差分前缀和！', 'dfsSum(1, 0) 启动', 'dfs', 1, 2);

  function dfsSum(u: number, p: number): void {
    // 行 73: val[u] = diff[u];
    val[u] = diff[u];
    makeStep(73, `📍 [初始自身差分] val[${u}] = diff[${u}] = ${diff[u]}; 先载入节点自身的差分标记。`, `val[${u}] = diff[${u}]`, 'dfs', u, 2, 'val', u);

    // 行 74: for (int v : adj.get(u))
    for (const v of adj[u]) {
      // 行 75: if (v != p)
      if (v !== p) {
        // 行 76: dfsSum(v, u);
        dfsSum(v, u);

        // 行 77: val[u] += val[v];
        const oldVal = val[u];
        val[u] += val[v];
        makeStep(77, `➕ [汇总子树和] val[${u}] += val[${v}] (${val[v]}) -> val[${u}] = ${val[u]}; 累加子树贡献。`, `val[${u}] += val[${v}]`, 'dfs', u, 2, 'val', u);
      }
    }
  }

  dfsSum(1, 0);

  // 行 80: 完成
  makeStep(80, `🎉 [差分还原完成] 自底向上求和完毕！各节点最终还原值：${Array.from({ length: n }, (_, i) => `val[${i + 1}]=${val[i + 1]}`).join(', ')}！`, '树上差分全部完成', 'done', 1, 2);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreeDiffStep>({
  id: 'tree-difference',
  name: '树上差分 (Tree Difference)',
  category: 'graph',
  icon: '🌴',
  badge: {
    mode: 'LCA + 自底向上前缀和',
    complexity: 'O(log N) · O(N)',
  },
  card1Title: '🌴 树形拓扑与路径差分打标沙盘',
  card2Title: '📊 差分多数组 (depth, diff, val) 实时监控器',
  card2Desc: '逐行对齐点差分/边差分端点与 LCA 标记抵消公式，自底向上后序遍历前缀和汇总推导',
  legend: [
    { label: '树节点', color: '#1e3a8a' },
    { label: '⭐ LCA 节点', color: '#f59e0b' },
    { label: '🟢 路径端点', color: '#10b981' },
    { label: '🔴 覆盖边/点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '差分模式预设',
      type: 'select',
      defaultValue: 'node_diff_5node',
      options: [
        { label: '点差分 (路径 4 ➔ 5 点权 +1)', value: 'node_diff_5node' },
        { label: '边差分 (路径 4 ➔ 5 边权 +1)', value: 'edge_diff_5node' },
      ],
    },
  ],
  presets: [
    { label: '点差分 (路径 4➔5)', values: { 'input-preset': 'node_diff_5node' } },
    { label: '边差分 (路径 4➔5)', values: { 'input-preset': 'edge_diff_5node' } },
  ],
  metrics: [
    { id: 'metric-active-lca', label: '最近公共祖先 LCA', color: '#f59e0b' },
    { id: 'metric-max-cover', label: '最高覆盖次数', color: '#10b981' },
    { id: 'metric-diff-formula', label: '当前差分公式', color: '#38bdf8' },
    { id: 'metric-diff-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TREE_DIFF_CODE_LANGUAGES,
  problemHtml: TREE_DIFF_PROBLEM_HTML,
  analysisHtml: TREE_DIFF_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'node_diff_5node') as string;
    return buildTreeDifferenceSteps(preset);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 40 },
      2: { x: 95, y: 105 },
      3: { x: 215, y: 105 },
      4: { x: 55, y: 170 },
      5: { x: 135, y: 170 },
    };

    const treeEdges = [
      [1, 2],
      [1, 3],
      [2, 4],
      [2, 5],
    ];

    const svgEdges = treeEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isCovered = (u === 2 && v === 4) || (u === 4 && v === 2) || (u === 2 && v === 5) || (u === 5 && v === 2);
        const color = isCovered ? '#ef4444' : '#475569';
        const width = isCovered ? 3 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.activeNode === u;
        const isLca = step.activeLca === u;
        const isEndpoint = u === 4 || u === 5;
        const val = step.recoveredCounts[u] ?? 0;
        const diffVal = step.diffArray[u] ?? 0;

        const bg = isCur ? '#f59e0b' : isLca ? '#854d0e' : isEndpoint ? '#065f46' : val > 0 ? '#991b1b' : '#1e3a8a';
        const border = isCur ? '#facc15' : isLca ? '#f59e0b' : isEndpoint ? '#10b981' : val > 0 ? '#ef4444' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur || isLca || isEndpoint ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">d:${diffVal > 0 ? `+${diffVal}` : diffVal} v:${val}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          节点底部为 d:差分标记 diff[u] | v:还原权值 val[u] (自底向上子树前缀和)
        </div>
      </div>
    `;

    const root =
      container.closest('#algo-tree-difference-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = root.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const indices = [1, 2, 3, 4, 5];
        const renderRow = (name: string, map: Record<number, number>, activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = map[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${val > 0 && activeName === 'diff' ? `+${val}` : val}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const depthRow = renderRow('depth[] (深度)', step.depthArray, 'depth', '#38bdf8');
        const diffRow = renderRow('diff[] (差分标记)', step.diffArray, 'diff', '#f59e0b');
        const valRow = renderRow('val[] (还原权值)', step.recoveredCounts, 'val', '#10b981');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${depthRow}
              ${diffRow}
              ${valRow}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-difference',
  name: '树上差分 (Tree Difference)',
  viewId: 'algo-tree-difference-view',
  category: 'graph',
  description: '进阶树论经典：树上点差分与边差分标记、倍增 LCA 快速定位、自底向上后序子树和还原 (洛谷 P3128)',
  icon: '🌴',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 70,
  learningGoal: '掌握树上点差分与边差分原理、LCA 端点标记法及自底向上还原覆盖权值全流程',
});

export { Visualizer as TreeDifferenceVisualizer };
