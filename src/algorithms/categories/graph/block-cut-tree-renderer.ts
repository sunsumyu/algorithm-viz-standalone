/**
 * 广义圆方树 (Block-Cut Tree / Round-Square Tree) 声明式可视化器
 * 进阶树论: 点双连通分量 (v-BCC) 缩点、圆点代表原图节点、方点代表点双、树上必经割点 (洛谷 P4320 / P4630)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (dfn, low, 栈, 方点树) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BLOCK_CUT_TREE_CODE_LANGUAGES,
  BLOCK_CUT_TREE_PROBLEM_HTML,
  BLOCK_CUT_TREE_ANALYSIS_HTML,
} from './block-cut-tree-problem-content';

export interface BlockCutStep {
  roundNodes: number[];
  squareNodes: string[];
  treeEdges: Array<{ u: string | number; v: string | number }>;
  activeBcc?: string[];
  cutVertices?: number[];
  pathRoundNodes?: number[];
  mustPassCutNodes?: number[];
  curNode?: number;
  dfnArray: number[];
  lowArray: number[];
  stackArray: number[];
  activeArray?: 'dfn' | 'low';
  activeSlot?: number;
  status: 'init' | 'tarjan_dfs' | 'bcc_found' | 'add_square' | 'bct_done' | 'query_path' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildBlockCutTreeSteps(preset: string = 'classic_6node'): BlockCutStep[] {
  const steps: BlockCutStep[] = [];
  const isSimple = preset === 'simple_4node';
  const n = isSimple ? 4 : 6;

  // 原始边定义
  // classic_6node: (1,2), (2,3), (1,3), (3,4), (4,5), (5,6), (4,6) -> 点双 1: {1,2,3}, 点双 2: {3,4}, 点双 3: {4,5,6}
  // simple_4node: (1,2), (2,3), (1,3), (3,4) -> 点双 1: {1,2,3}, 点双 2: {3,4}
  const edges: Array<[number, number]> = isSimple
    ? [
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4],
      ]
    : [
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [4, 6],
      ];

  const roundNodes = Array.from({ length: n }, (_, i) => i + 1);
  const squareNodes: string[] = [];
  const treeEdges: Array<{ u: string | number; v: string | number }> = [];
  const cutVertices: number[] = [];
  const mustPassCutNodes: number[] = isSimple ? [3] : [3, 4];

  const dfn: number[] = new Array(n + 1).fill(0);
  const low: number[] = new Array(n + 1).fill(0);
  const stack: number[] = [];

  let dfnCnt = 0;
  let squareCnt = 0;
  let curNode: number | undefined = undefined;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'tarjan_dfs' | 'bcc_found' | 'add_square' | 'bct_done' | 'query_path' | 'done',
    activeBcc?: string[],
    activeArray?: 'dfn' | 'low',
    activeSlot?: number
  ): void {
    const cutStr = cutVertices.length > 0 ? `{ ${cutVertices.join(', ')} }` : '尚未确定';
    const phaseStr =
      status === 'done'
        ? '圆方树构建完成'
        : status === 'query_path'
          ? '路径必经割点查询'
          : status === 'add_square'
            ? '圆方相间连边'
            : status === 'bcc_found'
              ? '发现点双连通分量'
              : status === 'tarjan_dfs'
                ? 'Tarjan 点双 DFS'
                : '算法初始化';

    steps.push({
      roundNodes: [...roundNodes],
      squareNodes: [...squareNodes],
      treeEdges: treeEdges.map((e) => ({ ...e })),
      activeBcc,
      cutVertices: [...cutVertices],
      pathRoundNodes: isSimple ? [1, 3, 4] : [1, 3, 4, 6],
      mustPassCutNodes: [...mustPassCutNodes],
      curNode,
      dfnArray: [...dfn],
      lowArray: [...low],
      stackArray: [...stack],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-round-count': `${n} 个圆点`,
        'metric-square-count': `${squareNodes.length} 个方点`,
        'metric-cut-vertices': cutStr,
        'metric-bct-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 7: Code01_BlockCutTree
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 个原图节点的网络，准备运行 Tarjan 点双缩点算法构建广义圆方树。`, `init(${n})`, 'init');

  // 行 8: 分配 dfn
  makeStep(8, '📊 [分配时间戳数组] dfn = new int[n + 1]; 记录 DFS 首次访问次序。', '分配 dfn 数组', 'init', undefined, 'dfn');

  // 行 8: 分配 low
  makeStep(8, '📊 [分配追溯数组] low = new int[n + 1]; 记录能够回溯到的最早祖先。', '分配 low 数组', 'init', undefined, 'low');

  // 行 8: 分配栈
  makeStep(8, '📦 [分配辅助栈] st = new ArrayDeque<>(); 维护当前搜索路径上的点双候选节点。', '分配辅助栈', 'init');

  // ==================== 2. Tarjan 点双连通分量演练 ====================
  // 行 32: buildTree()
  makeStep(32, '⚡ [启动圆方树构建] buildTree(): 遍历所有未访问节点发起 Tarjan 点双遍历。', 'buildTree() 入口', 'tarjan_dfs');

  // 节点 1
  curNode = 1;
  dfn[1] = low[1] = ++dfnCnt;
  stack.push(1);
  makeStep([8, 9], '⏱️ [访问节点 1] dfn[1] = low[1] = 1；节点 1 压入点双栈：[1]。', 'dfn[1]=low[1]=1', 'tarjan_dfs', undefined, 'dfn', 1);

  makeStep(10, '🔍 [探索邻居] Node 1 考察出边 (1 ➔ 2)。', '考察边 (1, 2)', 'tarjan_dfs');

  // 节点 2
  curNode = 2;
  dfn[2] = low[2] = ++dfnCnt;
  stack.push(2);
  makeStep([8, 9], '⏱️ [访问节点 2] dfn[2] = low[2] = 2；节点 2 压入点双栈：[1, 2]。', 'dfn[2]=low[2]=2', 'tarjan_dfs', undefined, 'dfn', 2);

  makeStep(10, '🔍 [探索邻居] Node 2 考察出边 (2 ➔ 3)。', '考察边 (2, 3)', 'tarjan_dfs');

  // 节点 3
  curNode = 3;
  dfn[3] = low[3] = ++dfnCnt;
  stack.push(3);
  makeStep([8, 9], '⏱️ [访问节点 3] dfn[3] = low[3] = 3；节点 3 压入点双栈：[1, 2, 3]。', 'dfn[3]=low[3]=3', 'tarjan_dfs', undefined, 'dfn', 3);

  // 回退边 3 -> 1
  makeStep(10, '🔍 [探索邻居] Node 3 考察反向边 (3 ➔ 1)。', '考察边 (3, 1)', 'tarjan_dfs');
  low[3] = Math.min(low[3], dfn[1]);
  makeStep(25, '🔄 [返祖回溯边 3 ➔ 1] low[3] 更新为 min(3, dfn[1]=1) = 1。', 'low[3] = 1', 'tarjan_dfs', undefined, 'low', 3);

  // 回溯到 2: low[2] = min(low[2], low[3]) = 1
  low[2] = Math.min(low[2], low[3]);
  makeStep(13, '📉 [回溯更新 low[2]] low[2] 更新为 min(2, low[3]=1) = 1。', 'low[2] = 1', 'tarjan_dfs', undefined, 'low', 2);

  // 回溯到 1: low[1] = 1，检查 low[2] >= dfn[1] (1 >= 1) -> 触发点双 v-BCC 1！
  // 行 14: if (low[v] >= dfn[u])
  squareCnt++;
  const sq1 = `S${squareCnt}`;
  squareNodes.push(sq1);
  makeStep(14, `🎉 [发现点双分量 1] 节点 1 处判定 low[2] >= dfn[1] (1 >= 1)！识别出环状点双 {1, 2, 3}，分配方点 ${sq1}！`, `发现点双 ${sq1}`, 'bcc_found');

  // 行 16-22: 弹栈并连边
  treeEdges.push({ u: sq1, v: 3 }, { u: sq1, v: 2 }, { u: sq1, v: 1 });
  stack.pop(); // 3
  stack.pop(); // 2
  makeStep([16, 22], `🟩 [圆方连边] 方点 ${sq1} 分别与点双内所有节点 {1, 2, 3} 连边！节点 3 作为后续连接点仍保留在原图。`, `方点 ${sq1} 连接 1, 2, 3`, 'add_square', [sq1]);

  // 从 3 探索 4
  makeStep(10, '🔍 [探索邻居] Node 3 考察割边 (3 ➔ 4)。', '考察边 (3, 4)', 'tarjan_dfs');
  curNode = 4;
  dfn[4] = low[4] = ++dfnCnt;
  stack.push(4);
  makeStep([8, 9], '⏱️ [访问节点 4] dfn[4] = low[4] = 4；节点 4 压入栈：[1, 4]。', 'dfn[4]=low[4]=4', 'tarjan_dfs', undefined, 'dfn', 4);

  if (isSimple) {
    makeStep(13, '📉 [回溯判定] Node 4 无其他未访邻居，回溯至 Node 3。', '回溯至 Node 3', 'tarjan_dfs');
    makeStep(14, '⚖️ [割点判定] 检查 low[4] >= dfn[3] (4 >= 3) 成立！', 'low[4] >= dfn[3]', 'tarjan_dfs');
    // simple_4node: 3-4 割边构成点双 2
    squareCnt++;
    const sq2 = `S${squareCnt}`;
    squareNodes.push(sq2);
    treeEdges.push({ u: sq2, v: 4 }, { u: sq2, v: 3 });
    cutVertices.push(3);
    makeStep(15, `🎉 [发现割边点双 2] 节点 3 处判定 low[4] >= dfn[3] (4 >= 3)！割边 {3, 4} 构成独立点双，新建方点 ${sq2}！`, `新建方点 ${sq2}`, 'add_square');
    makeStep(16, `🟩 [弹栈并连边] 弹出节点 4，方点 ${sq2} 连接节点 4 与割点 3！`, `连接 ${sq2} 到 3, 4`, 'add_square');
  } else {
    // classic_6node: 3-4 点双，然后 4-5-6 点双
    // 3-4 点双
    squareCnt++;
    const sq2 = `S${squareCnt}`;
    squareNodes.push(sq2);
    treeEdges.push({ u: sq2, v: 4 }, { u: sq2, v: 3 });
    cutVertices.push(3);
    makeStep(15, `🎉 [发现桥连点双 2] 节点 3 处 low[4] >= dfn[3]！割点 3 显现，连接方点 ${sq2} 至 {3, 4}！`, `新建方点 ${sq2}`, 'add_square');

    // 4-5-6 点双
    curNode = 5;
    dfn[5] = low[5] = ++dfnCnt;
    stack.push(5);
    makeStep([8, 9], '⏱️ [访问节点 5] dfn[5] = low[5] = 5。', 'dfn[5]=5', 'tarjan_dfs', undefined, 'dfn', 5);

    curNode = 6;
    dfn[6] = low[6] = ++dfnCnt;
    stack.push(6);
    makeStep([8, 9], '⏱️ [访问节点 6] dfn[6] = low[6] = 6。', 'dfn[6]=6', 'tarjan_dfs', undefined, 'dfn', 6);

    // 6-4 回退边
    low[6] = Math.min(low[6], dfn[4]);
    low[5] = Math.min(low[5], low[6]);

    squareCnt++;
    const sq3 = `S${squareCnt}`;
    squareNodes.push(sq3);
    treeEdges.push({ u: sq3, v: 6 }, { u: sq3, v: 5 }, { u: sq3, v: 4 });
    cutVertices.push(4);
    makeStep(15, `🎉 [发现点双分量 3] 节点 4 处判定 low[5] >= dfn[4]！识别出环状点双 {4, 5, 6}，新建方点 ${sq3}！割点 4 显现！`, `新建方点 ${sq3}`, 'add_square');
  }

  // ==================== 3. 必经点查询 ====================
  makeStep(32, `🔍 [路径必经割点定理] 在圆方树上，任意两点间所有简单路径的公共必经点，恰好等于圆方树上对应路径上出现的所有【圆点】！本次必经割点为：{ ${mustPassCutNodes.join(', ')} }！`, '必经割点查询', 'query_path');

  // 终态
  makeStep(32, `🎉 [圆方树构建完成] 全图包含 ${n} 个圆点与 ${squareNodes.length} 个方点，割点集合为 { ${cutVertices.join(', ')} }！`, '圆方树完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BlockCutStep>({
  id: 'block-cut-tree',
  name: '广义圆方树 (Block-Cut Tree)',
  viewId: 'algo-block-cut-tree-view',
  category: 'graph',
  icon: '🔲',
  badge: {
    mode: '点双连通分量 + 圆方相间连边',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🔲 原图拓扑与广义圆方相间二分树沙盘',
  card2Title: '📊 圆方树多数组 (dfn, low, 栈, 割点) 监控器',
  card2Desc: '逐行对齐 Tarjan 求点双连通分量 (v-BCC)、新建方点并弹栈连边、割点判定及圆方树上必经点转化',
  legend: [
    { label: '⚪ 原图圆点 (节点)', color: '#1e3a8a' },
    { label: '🔲 点双方点 (BCC)', color: '#f59e0b' },
    { label: '🔴 必经割点', color: '#ef4444' },
    { label: '🟢 圆方树边 (实线)', color: '#10b981' },
    { label: '⚪ 原图边 (虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图拓扑',
      type: 'select',
      defaultValue: 'classic_6node',
      options: [
        { label: '6 节点经典哑铃双环 (割点 3, 4，方点 S1, S2, S3)', value: 'classic_6node' },
        { label: '4 节点简单仙人掌 (割点 3，方点 S1, S2)', value: 'simple_4node' },
      ],
    },
  ],
  presets: [
    { label: '6 节点经典图', values: { 'input-preset': 'classic_6node' } },
    { label: '4 节点简单图', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-round-count', label: '原图圆点数', color: '#38bdf8' },
    { id: 'metric-square-count', label: '点双方点数', color: '#f59e0b' },
    { id: 'metric-cut-vertices', label: '全图割点集', color: '#ef4444' },
    { id: 'metric-bct-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: BLOCK_CUT_TREE_CODE_LANGUAGES,
  problemHtml: BLOCK_CUT_TREE_PROBLEM_HTML,
  analysisHtml: BLOCK_CUT_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6node') as string;
    return buildBlockCutTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is6Node = step.roundNodes.length === 6;
    const nodeCoords: Record<string, { x: number; y: number }> = is6Node
      ? {
          1: { x: 45, y: 55 },
          2: { x: 45, y: 155 },
          3: { x: 105, y: 105 },
          4: { x: 205, y: 105 },
          5: { x: 265, y: 55 },
          6: { x: 265, y: 155 },
          S1: { x: 75, y: 105 },
          S2: { x: 155, y: 105 },
          S3: { x: 235, y: 105 },
        }
      : {
          1: { x: 65, y: 55 },
          2: { x: 65, y: 155 },
          3: { x: 155, y: 105 },
          4: { x: 255, y: 105 },
          S1: { x: 105, y: 105 },
          S2: { x: 205, y: 105 },
        };

    const svgEdges = step.treeEdges
      .map(({ u, v }) => {
        const p1 = nodeCoords[`${u}`];
        const p2 = nodeCoords[`${v}`];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2" />`;
      })
      .join('');

    const roundSvg = step.roundNodes
      .map((u) => {
        const p = nodeCoords[`${u}`];
        if (!p) return '';
        const isCut = step.cutVertices && step.cutVertices.includes(u);
        const bg = isCut ? '#7f1d1d' : '#1e3a8a';
        const border = isCut ? '#ef4444' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCut ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 25}" fill="${isCut ? '#f87171' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isCut ? '割点' : `d:${step.dfnArray[u] || 0}`}</text>
          </g>
        `;
      })
      .join('');

    const squareSvg = step.squareNodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        return `
          <g>
            <rect x="${p.x - 13}" y="${p.y - 13}" width="26" height="26" fill="#78350f" stroke="#f59e0b" stroke-width="2" rx="3" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${roundSvg}
          ${squareSvg}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          圆形为原图圆点，方形为点双方点 | 圆方相间成树 | 原图两点间所有简单路径的必经点严格等价于圆方树路径上的所有圆点！
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-block-cut-tree-view') ||
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
        const totalIndices = step.roundNodes;
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

        const dfnRow = renderRow('dfn[] (时间戳)', step.dfnArray, 'dfn', '#38bdf8');
        const lowRow = renderRow('low[] (追溯值)', step.lowArray, 'low', '#10b981');
        const stStr = step.stackArray.length > 0 ? `[ ${step.stackArray.join(', ')} ]` : '空栈';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${dfnRow}
              ${lowRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">Tarjan 点双辅助栈:</span>
                <strong style="color: #facc15; font-family: monospace; font-size: 10.5px;">${stStr}</strong>
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
  id: 'block-cut-tree',
  name: '广义圆方树 (Block-Cut Tree)',
  viewId: 'algo-block-cut-tree-view',
  category: 'graph',
  description: '进阶树论经典：点双连通分量 (v-BCC) 缩点、圆方相间连边成树、树上必经点定理转化 (洛谷 P4320)',
  icon: '🔲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 84,
  learningGoal: '掌握广义圆方树构建算法、low[v] >= dfn[u] 点双识别判定及圆方树树上必经割点定理',
});

export { Visualizer as BlockCutTreeVisualizer };
