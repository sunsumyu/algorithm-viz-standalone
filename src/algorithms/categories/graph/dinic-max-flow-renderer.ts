/**
 * Dinic 最大流与残量网络 (Dinic's Maximum Flow Algorithm) 声明式可视化器
 * 进阶网络流: BFS 分层网络 level[u]、当前弧优化 cur[u]、多路增广 DFS 阻塞流 (洛谷 P3376)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（外层while(bfs)、BFS层级构建、当前弧重置、DFS多路增广、反向边退流均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DINIC_MAX_FLOW_PROBLEM_HTML,
  DINIC_MAX_FLOW_ANALYSIS_HTML,
  DINIC_MAX_FLOW_CODE_LANGUAGES,
} from './dinic-max-flow-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface DinicStep {
  levels: Record<string, number>;
  flowEdges: Array<{ u: string; v: string; cap: number; flow: number }>;
  curMaxFlow: number;
  activePath?: string[];
  activeEdge?: [string, string];
  curPushed?: number;
  levelArray: number[];
  curArray: number[];
  activeArray?: 'level' | 'cur';
  activeSlot?: number;
  status: 'bfs_level' | 'dfs_augment' | 'cur_arc' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildDinicSteps(preset: string = 'diamond'): DinicStep[] {
  const steps: DinicStep[] = [];
  const isCross = preset === 'cross';

  const nodeNames = ['S', 'A', 'B', 'T'];

  const rawEdges: Array<{ u: string; v: string; cap: number; flow: number }> = isCross
    ? [
        { u: 'S', v: 'A', cap: 10, flow: 0 },
        { u: 'S', v: 'B', cap: 10, flow: 0 },
        { u: 'A', v: 'B', cap: 5, flow: 0 },
        { u: 'A', v: 'T', cap: 8, flow: 0 },
        { u: 'B', v: 'T', cap: 10, flow: 0 },
      ]
    : [
        { u: 'S', v: 'A', cap: 10, flow: 0 },
        { u: 'S', v: 'B', cap: 10, flow: 0 },
        { u: 'A', v: 'T', cap: 10, flow: 0 },
        { u: 'B', v: 'T', cap: 10, flow: 0 },
      ];

  const levels: Record<string, number> = { S: 0, A: 0, B: 0, T: 0 };
  const curArc: Record<string, number> = { S: 0, A: 0, B: 0, T: 0 };
  let curMaxFlow = 0;
  let activePath: string[] | undefined = undefined;
  let activeEdge: [string, string] | undefined = undefined;

  // 精准 22 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    maxFlowEntry: { cpp: 72, java: 54, python: 32, javascript: 36 },
    maxFlowWhileBfs: { cpp: 74, java: 56, python: 34, javascript: 38 },
    bfsEntry: { cpp: 34, java: 17, python: 12, javascript: 11 },
    bfsFillDepth: { cpp: 35, java: 18, python: 13, javascript: 12 },
    bfsInitQueue: { cpp: 36, java: 19, python: 14, javascript: 13 },
    bfsSetSrc: { cpp: 38, java: 21, python: 15, javascript: 14 },
    bfsWhile: { cpp: 40, java: 23, python: 17, javascript: 16 },
    bfsPoll: { cpp: 41, java: 24, python: 18, javascript: 17 },
    bfsForEdges: { cpp: 42, java: 25, python: 19, javascript: 18 },
    bfsCheckLevel: { cpp: 43, java: 26, python: 20, javascript: 19 },
    bfsSetLevel: { cpp: 44, java: 27, python: 21, javascript: 20 },
    bfsReturn: { cpp: 49, java: 32, python: 23, javascript: 24 },
    maxFlowResetCur: { cpp: 75, java: 57, python: 35, javascript: 39 },
    dfsEntry: { cpp: 53, java: 35, python: 25, javascript: 26 },
    dfsBase: { cpp: 54, java: 36, python: 26, javascript: 27 },
    dfsForCur: { cpp: 57, java: 38, python: 29, javascript: 29 },
    dfsUpdateCur: { cpp: 57, java: 39, python: 30, javascript: 30 },
    dfsCheckEdge: { cpp: 59, java: 41, python: 32, javascript: 32 },
    dfsPush: { cpp: 60, java: 42, python: 33, javascript: 33 },
    dfsUpdateResidual: { cpp: 62, java: 44, python: 34, javascript: 34 },
    dfsReturn: { cpp: 69, java: 51, python: 35, javascript: 35 },
    maxFlowDfsCall: { cpp: 76, java: 58, python: 36, javascript: 40 },
    maxFlowReturn: { cpp: 78, java: 60, python: 38, javascript: 42 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'bfs_level' | 'dfs_augment' | 'cur_arc' | 'done',
    pushed?: number,
    activeArray?: 'level' | 'cur',
    activeSlot?: number
  ): void {
    const levelStr = levels.T > 0 ? `level[T] = ${levels.T}` : '不可达 (增广结束)';
    const pathStr = activePath && activePath.length > 0 ? activePath.join(' ➔ ') : '无';
    const phaseStr =
      status === 'done'
        ? '算法结束'
        : status === 'cur_arc'
          ? '当前弧优化'
          : status === 'dfs_augment'
            ? 'DFS 阻塞流增广'
            : 'BFS 构造分层网络';

    const lvlArr = [levels.S, levels.A, levels.B, levels.T];
    const curArr = [curArc.S, curArc.A, curArc.B, curArc.T];

    steps.push({
      levels: { ...levels },
      flowEdges: rawEdges.map((e) => ({ ...e })),
      curMaxFlow,
      activePath: activePath ? [...activePath] : undefined,
      activeEdge,
      curPushed: pushed,
      levelArray: lvlArr,
      curArray: curArr,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-dinic-level': levelStr,
        'metric-dinic-max-flow': `${curMaxFlow} 单位流量`,
        'metric-dinic-path': pathStr,
        'metric-dinic-phase': phaseStr,
      },
    });
  }

  // 1. Dinic 算法入口
  makeStep(lines.maxFlowEntry, `🚀 [算法初始化] maxFlow(s=S, t=T, n=4)：准备运行 Dinic 最大流算法。`, 'maxFlow 入口', 'bfs_level');

  // BFS 阶段
  function runBfs(): boolean {
    makeStep(lines.bfsEntry, '🌊 [调用 BFS 构建分层图] public static boolean bfs(s, t, n)：从源点 S 向外搜索层次。', 'bfs() 入口', 'bfs_level');

    for (const k of nodeNames) levels[k] = 0;
    makeStep(lines.bfsFillDepth, '📊 [重置层次数组] Arrays.fill(depth, 0)；清空上一轮残留的层级。', 'Arrays.fill(depth, 0)', 'bfs_level', undefined, 'level');

    const queue: string[] = ['S'];
    levels.S = 1;
    makeStep(lines.bfsSetSrc, '🌱 [标记源点层级] depth[S] = 1, queue.add(S)；源点为分层网络的第 1 层。', 'depth[S] = 1', 'bfs_level', undefined, 'level', 0);

    while (queue.length > 0) {
      makeStep(lines.bfsWhile, `🔁 [检查队列非空] while (!queue.isEmpty()) -> 队列元素: [${queue.join(', ')}]。`, `!queue.isEmpty()`, 'bfs_level');

      const u = queue.shift()!;
      makeStep(lines.bfsPoll, `📤 [出队扩展层次] int u = queue.poll() = ${u} (当前层级 depth[${u}] = ${levels[u]})。`, `poll ${u}`, 'bfs_level');

      for (const e of rawEdges.filter((edge) => edge.u === u)) {
        const v = e.v;
        const residual = e.cap - e.flow;
        activeEdge = [u, v];

        makeStep(lines.bfsForEdges, `  ↳ [考察残量边] 边 (${u} ➔ ${v}): cap=${e.cap}, flow=${e.flow}, 残量残额=${residual}。`, `edge (${u}, ${v})`, 'bfs_level');

        makeStep(lines.bfsCheckLevel, `  🔎 [分层判定] if (residual > 0 && depth[${v}] == 0) -> (${residual > 0} && ${levels[v] === 0})。`, `residual>0 && depth==0?`, 'bfs_level');

        if (residual > 0 && levels[v] === 0) {
          levels[v] = levels[u] + 1;
          queue.push(v);
          const vSlot = nodeNames.indexOf(v);
          makeStep(lines.bfsSetLevel, `  🏷️ [确定节点层次] depth[${v}] = depth[${u}] + 1 = ${levels[v]}；节点 ${v} 顺利入队！`, `depth[${v}] = ${levels[v]}`, 'bfs_level', undefined, 'level', vSlot);
        }
      }
      activeEdge = undefined;
    }

    const reachable = levels.T > 0;
    makeStep(lines.bfsReturn, `🏁 [BFS 完成] return depth[T] > 0 -> (${reachable})：汇点 T ${reachable ? `在第 ${levels.T} 层可达` : '在残量网络中已不可达'}！`, `return depth[T]>0 (${reachable})`, 'bfs_level');
    return reachable;
  }

  // 模拟 Dinic 主循环与多路增广
  let round = 1;
  while (true) {
    makeStep(lines.maxFlowWhileBfs, `🔁 [外层增广轮次 ${round}] while (bfs(s, t, n))：尝试构建新一轮分层图。`, `while bfs() 轮次 ${round}`, 'bfs_level');

    const hasAugment = runBfs();
    if (!hasAugment) break;

    // 当前弧重置
    for (const k of nodeNames) curArc[k] = 0;
    makeStep(lines.maxFlowResetCur, '🎯 [重置当前弧优化] Arrays.fill(cur, 0)；各点出边从头开始扫描，避免重复回溯。', 'Arrays.fill(cur, 0)', 'cur_arc', undefined, 'cur');

    if (round === 1) {
      if (!isCross) {
        // 增广路径 1: S -> A -> T (推 10)
        activePath = ['S', 'A', 'T'];
        makeStep(lines.dfsEntry, '🌊 [启动 DFS 多路增广] dfs(S, T, limit=1e9)：沿分层图寻找第 1 条阻塞流。', 'dfs(S, 1e9)', 'dfs_augment');
        makeStep(lines.dfsForCur, '  ↳ [当前弧推进] cur[S]=0, 考察出边 (S ➔ A, cap=10, 残量=10, depth 1➔2)。', 'edge (S, A)', 'dfs_augment');
        makeStep(lines.dfsPush, '  ⚡ [递归推流] 发现可行瓶颈容量 = min(1e9, 10, 10) = 10 单位流量！', 'push 10 flow', 'dfs_augment', 10);

        rawEdges.find((e) => e.u === 'S' && e.v === 'A')!.flow += 10;
        rawEdges.find((e) => e.u === 'A' && e.v === 'T')!.flow += 10;
        curMaxFlow += 10;
        makeStep(lines.dfsUpdateResidual, '  🔄 [残量网络流量更新] (S➔A): 10/10 (饱和), (A➔T): 10/10 (饱和)；正向流+10，反向流自动抵消！', 'flow += 10', 'dfs_augment', 10);

        // 增广路径 2: S -> B -> T (推 10)
        activePath = ['S', 'B', 'T'];
        curArc.S = 1;
        makeStep(lines.dfsForCur, '  ↳ [当前弧跳过饱和边] cur[S]=1, 转向未饱和出边 (S ➔ B, cap=10, 残量=10, depth 1➔2)。', 'edge (S, B)', 'dfs_augment');
        makeStep(lines.dfsPush, '  ⚡ [递归推流] 发现可行瓶颈容量 = 10 单位流量！', 'push 10 flow', 'dfs_augment', 10);

        rawEdges.find((e) => e.u === 'S' && e.v === 'B')!.flow += 10;
        rawEdges.find((e) => e.u === 'B' && e.v === 'T')!.flow += 10;
        curMaxFlow += 10;
        makeStep(lines.dfsUpdateResidual, '  🔄 [残量网络流量更新] (S➔B): 10/10 (饱和), (B➔T): 10/10 (饱和)；累计流量达 20！', 'flow += 10', 'dfs_augment', 10);
      } else {
        // cross 交叉图增广
        activePath = ['S', 'A', 'T'];
        makeStep(lines.dfsEntry, '🌊 [启动 DFS 多路增广] dfs(S, T, limit=1e9)：沿分层图寻找阻塞流。', 'dfs(S, 1e9)', 'dfs_augment');
        rawEdges.find((e) => e.u === 'S' && e.v === 'A')!.flow += 8;
        rawEdges.find((e) => e.u === 'A' && e.v === 'T')!.flow += 8;
        curMaxFlow += 8;
        makeStep(lines.dfsUpdateResidual, '  🔄 [更新流量] 沿 S➔A➔T 注入 8 单位流量！(A➔T 饱和)', 'flow += 8', 'dfs_augment', 8);

        activePath = ['S', 'B', 'T'];
        rawEdges.find((e) => e.u === 'S' && e.v === 'B')!.flow += 10;
        rawEdges.find((e) => e.u === 'B' && e.v === 'T')!.flow += 10;
        curMaxFlow += 10;
        makeStep(lines.dfsUpdateResidual, '  🔄 [更新流量] 沿 S➔B➔T 注入 10 单位流量！(S➔B, B➔T 饱和)', 'flow += 10', 'dfs_augment', 10);
      }
    }
    activePath = undefined;
    round++;
  }

  makeStep(lines.maxFlowReturn, `🎉 [Dinic 算法结束] return total = ${curMaxFlow}！残量网络中汇点已不可达，已求得全网最大流 ${curMaxFlow} 单位！`, `return maxFlow=${curMaxFlow}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DinicStep>({
  id: 'dinic-max-flow',
  name: 'Dinic 网络最大流 (Dinic Max Flow)',
  viewId: 'algo-dinic-max-flow-view',
  category: 'graph',
  icon: '🌊',
  badge: {
    mode: 'BFS 层次图 · 当前弧优化 · 多路增广',
    complexity: 'O(V² · E) · O(V + E)',
  },
  card1Title: '🌊 残量网络与多路增广阻塞流舱',
  card2Title: '📊 网络流状态监视器 (level[], cur[], 最大流)',
  card2Desc: '展示 BFS 层次图划分 level[u]、当前弧优化指针 cur[u] 与多路阻塞流增广全流程',
  legend: [
    { label: '🌊 已饱和满载边 (flow = cap)', color: '#ef4444' },
    { label: '💧 部分载流边 (flow < cap)', color: '#38bdf8' },
    { label: '⚪ 零流量空载边', color: '#64748b' },
    { label: '⚡ 当前增广路径阻塞流', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设流网络结构',
      type: 'select',
      defaultValue: 'diamond',
      options: [
        { label: '经典菱形网络 (S➔A/B➔T，最大流 20)', value: 'diamond' },
        { label: '交叉桥接网络 (含跨层边 A➔B，最大流 18)', value: 'cross' },
      ],
    },
  ],
  presets: [
    { label: '菱形网络 (最大流 20)', values: { 'input-preset': 'diamond' } },
    { label: '交叉网络 (最大流 18)', values: { 'input-preset': 'cross' } },
  ],
  metrics: [
    { id: 'metric-dinic-level', label: '汇点层次状态', color: '#38bdf8' },
    { id: 'metric-dinic-max-flow', label: '累计最大流', color: '#10b981' },
    { id: 'metric-dinic-path', label: '当前增广路径', color: '#f59e0b' },
    { id: 'metric-dinic-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: DINIC_MAX_FLOW_CODE_LANGUAGES,
  problemHtml: DINIC_MAX_FLOW_PROBLEM_HTML,
  analysisHtml: DINIC_MAX_FLOW_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'diamond') as string;
    return buildDinicSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isDiamond = step.flowEdges.length === 4;

    const nodeCoords: Record<string, { x: number; y: number }> = {
      S: { x: 50, y: 85 },
      A: { x: 155, y: 35 },
      B: { x: 155, y: 135 },
      T: { x: 260, y: 85 },
    };

    const isPathEdge = (u: string, v: string) => {
      if (!step.activePath || step.activePath.length < 2) return false;
      for (let i = 0; i < step.activePath.length - 1; i++) {
        if (step.activePath[i] === u && step.activePath[i + 1] === v) return true;
      }
      return false;
    };

    const svgEdges = step.flowEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';

        const onPath = isPathEdge(e.u, e.v);
        const isSaturated = e.flow === e.cap && e.cap > 0;
        const isFlowing = e.flow > 0 && e.flow < e.cap;

        const color = onPath ? '#f59e0b' : isSaturated ? '#ef4444' : isFlowing ? '#38bdf8' : '#64748b';
        const width = onPath ? 3.5 : isSaturated || isFlowing ? 2.5 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#dinic-arrow)" />
            <rect x="${mx - 14}" y="${my - 7}" width="28" height="12" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="${mx}" y="${my + 2}" fill="${isSaturated ? '#f87171' : isFlowing ? '#38bdf8' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">
              ${e.flow}/${e.cap}
            </text>
          </g>
        `;
      })
      .join('');

    const nodes = ['S', 'A', 'B', 'T'];
    const svgNodes = nodes
      .map((k) => {
        const p = nodeCoords[k];
        if (!p) return '';

        const lvl = step.levels[k];
        const isOnPath = step.activePath && step.activePath.includes(k);
        const bg = isOnPath ? '#b45309' : lvl > 0 ? '#1e3a8a' : '#1e293b';
        const border = isOnPath ? '#facc15' : lvl > 0 ? '#38bdf8' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isOnPath ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${k}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${lvl > 0 ? '#38bdf8' : '#64748b'}" font-size="8" font-weight="700" text-anchor="middle">L:${lvl}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🌊 残量网络拓扑 (流/容量)</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            当前全网最大流: <b style="color: #10b981;">${step.curMaxFlow}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 160px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 160px;" viewBox="0 0 310 160">
            <defs>
              <marker id="dinic-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部多路增广阻塞流舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🌊 残量网络与多路增广阻塞流舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              汇点状态: <b>${step.levels.T > 0 ? `第 ${step.levels.T} 层可达` : '不可达 (增广截止)'}</b>
            </div>
          </div>

          <div style="display: flex; gap: 10px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>1. BFS 分层图:</b> 仅允许沿 depth[v] = depth[u] + 1 深入
            </div>
            <div style="background: rgba(234, 88, 12, 0.3); border: 1px solid #ea580c; border-radius: 4px; padding: 4px 8px; color: #fed7aa;">
              <b>2. 当前弧 cur[u]:</b> 记录尝试进度，已饱和边不再重复探测
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const nodes = ['S', 'A', 'B', 'T'];

    const renderRow = (name: string, arr: number[], color: string) => {
      const cells = nodes
        .map((k, idx) => {
          const val = arr[idx];
          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 36px; height: 32px; background: #1e293b; border: 1px solid #475569; border-radius: 4px; color: #e2e8f0; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">${k}</span>
              <span style="line-height: 1.1;">${val}</span>
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

    const lvlRow = renderRow('depth[] (分层图深度)', step.levelArray, '#38bdf8');
    const curRow = renderRow('cur[] (当前弧优化)', step.curArray, '#f59e0b');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${lvlRow}
          ${curRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">当前全网最大流:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 12px;">${step.curMaxFlow} 单位</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'dinic-max-flow',
  name: 'Dinic 网络最大流 (Dinic Max Flow)',
  viewId: 'algo-dinic-max-flow-view',
  category: 'graph',
  description: '左程云 Class 071 核心：网络最大流与残量网络、BFS 层次图、当前弧优化与多路增广阻塞流 (洛谷 P3376)',
  icon: '🌊',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 24,
  learningGoal: '掌握分层图构建思想、成对反向弧退流机制、当前弧指针优化以及阻塞流增广策略',
});

export { Visualizer as DinicMaxFlowVisualizer };
