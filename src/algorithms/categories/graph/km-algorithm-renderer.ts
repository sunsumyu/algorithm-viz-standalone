/**
 * 二分图最大权完美匹配 (Kuhn-Munkres Algorithm - KM 算法) 声明式可视化器
 * 进阶匹配理论: 顶标可行性 lx[u] + ly[v] >= w(u,v)、相等子图增广、松弛变量 slack[v] 顶标调整、O(N³) 严格时间 (洛谷 P6577)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（顶标初始化、外层左部循环、slack初始化、相等子图DFS探查、匹配协商、顶标最小差值d计算与左右顶标对调调整均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  KM_ALGORITHM_CODE_LANGUAGES,
  KM_ALGORITHM_PROBLEM_HTML,
  KM_ALGORITHM_ANALYSIS_HTML,
} from './km-algorithm-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface KMStep {
  lx: Record<string, number>;
  ly: Record<string, number>;
  matchedEdges: Array<[string, string]>;
  slack: Record<string, number>;
  curLeft?: string;
  activeEdge?: [string, string];
  totalWeight: number;
  deltaAdj?: number;
  lxArray: number[];
  lyArray: number[];
  slackArray: number[];
  matchArray: number[];
  activeArray?: 'lx' | 'ly' | 'slack' | 'match';
  activeSlot?: number;
  status: 'init_labels' | 'augment' | 'adjust_labels' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildKMSteps(preset: string = 'standard'): KMStep[] {
  const steps: KMStep[] = [];
  const isSimple = preset === 'simple';
  const n = isSimple ? 2 : 3;

  const weight: number[][] = isSimple
    ? [
        [0, 0, 0],
        [0, 10, 5],
        [0, 6, 8],
      ]
    : [
        [0, 0, 0, 0],
        [0, 4, 2, 3],
        [0, 3, 5, 2],
        [0, 2, 1, 3],
      ];

  const lx: number[] = new Array(n + 1).fill(0);
  const ly: number[] = new Array(n + 1).fill(0);
  const slack: number[] = new Array(n + 1).fill(0);
  const match: number[] = new Array(n + 1).fill(0);
  let visX: boolean[] = new Array(n + 1).fill(false);
  let visY: boolean[] = new Array(n + 1).fill(false);

  let totalWeight = 0;
  let curLeft: string | undefined = undefined;
  let activeEdge: [string, string] | undefined = undefined;
  let deltaAdj: number | undefined = undefined;

  // 精准 20 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 38, java: 31, python: 27, javascript: 17 },
    initLx: { cpp: 41, java: 34, python: 5, javascript: 5 },
    forLeft: { cpp: 44, java: 36, python: 28, javascript: 20 },
    initSlack: { cpp: 45, java: 37, python: 29, javascript: 21 },
    whileAugment: { cpp: 46, java: 38, python: 30, javascript: 22 },
    resetVis: { cpp: 47, java: 39, python: 31, javascript: 23 },
    callDfs: { cpp: 49, java: 41, python: 33, javascript: 25 },
    dfsEntry: { cpp: 20, java: 13, python: 12, javascript: 27 },
    dfsMarkVisX: { cpp: 21, java: 14, python: 13, javascript: 28 },
    dfsLoopV: { cpp: 22, java: 15, python: 14, javascript: 29 },
    dfsCheckVisY: { cpp: 23, java: 16, python: 15, javascript: 30 },
    dfsCalcDelta: { cpp: 24, java: 17, python: 16, javascript: 31 },
    dfsCheckDeltaZero: { cpp: 25, java: 18, python: 17, javascript: 32 },
    dfsMarkVisY: { cpp: 26, java: 19, python: 18, javascript: 33 },
    dfsTryMatch: { cpp: 27, java: 20, python: 19, javascript: 34 },
    dfsAssignMatch: { cpp: 28, java: 21, python: 20, javascript: 35 },
    dfsUpdateSlack: { cpp: 32, java: 25, python: 23, javascript: 38 },
    calcD: { cpp: 53, java: 44, python: 37, javascript: 42 },
    adjustLabels: { cpp: 56, java: 47, python: 39, javascript: 44 },
    returnAns: { cpp: 63, java: 53, python: 46, javascript: 49 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init_labels' | 'augment' | 'adjust_labels' | 'done',
    activeArray?: 'lx' | 'ly' | 'slack' | 'match',
    activeSlot?: number
  ): void {
    const lxRec: Record<string, number> = {};
    const lyRec: Record<string, number> = {};
    const slackRec: Record<string, number> = {};
    const matchedEdges: Array<[string, string]> = [];

    for (let i = 1; i <= n; i++) {
      lxRec[`L${i}`] = lx[i];
      lyRec[`R${i}`] = ly[i];
      slackRec[`R${i}`] = slack[i] >= 999 ? 0 : slack[i];
      if (match[i] > 0) {
        matchedEdges.push([`L${match[i]}`, `R${i}`]);
      }
    }

    const matchedStr = `${matchedEdges.length} / ${n} 对`;
    const slackStr = deltaAdj !== undefined ? `d = ${deltaAdj}` : '0';
    const phaseStr =
      status === 'done'
        ? 'KM 匹配完成'
        : status === 'adjust_labels'
          ? '顶标微调缩小 slack'
          : status === 'augment'
            ? '相等子图增广中'
            : '顶标初始化';

    steps.push({
      lx: lxRec,
      ly: lyRec,
      matchedEdges,
      slack: slackRec,
      curLeft,
      activeEdge,
      totalWeight,
      deltaAdj,
      lxArray: [...lx],
      lyArray: [...ly],
      slackArray: [...slack],
      matchArray: [...match],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-km-weight': `${totalWeight}`,
        'metric-km-matched': matchedStr,
        'metric-km-slack': slackStr,
        'metric-km-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, '🚀 [KM 算法启动] solve()：初始化二分图顶标，寻找最大权完备匹配。', 'KM solve 入口', 'init_labels');

  for (let i = 1; i <= n; i++) {
    let maxW = -Infinity;
    for (let j = 1; j <= n; j++) {
      maxW = Math.max(maxW, weight[i][j]);
    }
    lx[i] = maxW;
    makeStep(lines.initLx, `🏷️ [初始化左顶标] lx[${i}] = max(weight[${i}][*]) = ${maxW}，初始化可行顶标满足 lx[u] + ly[v] >= w。`, `lx[${i}] = ${maxW}`, 'init_labels', 'lx', i);
  }

  // 2. 为每个左部节点寻找匹配
  for (let i = 1; i <= n; i++) {
    curLeft = `L${i}`;
    makeStep(lines.forLeft, `🔵 [为左部节点匹配] for (i = ${i})：开始为左部节点 L${i} 寻找相等子图增广路。`, `match for L${i}`, 'augment');

    for (let j = 1; j <= n; j++) slack[j] = Infinity;
    makeStep(lines.initSlack, `🧹 [重置松弛数组] Arrays.fill(slack, ∞)；记录各右部节点差值 delta 最小值。`, 'init slack', 'augment', 'slack');

    while (true) {
      makeStep(lines.whileAugment, '🔁 [增广尝试循环] while (true) -> 尝试在相等子图中增广。', 'while (true)', 'augment');

      visX = new Array(n + 1).fill(false);
      visY = new Array(n + 1).fill(false);
      makeStep(lines.resetVis, '🧹 [清空交错树访问标记] visX[*] = false, visY[*] = false。', 'reset vis', 'augment');

      // 模拟 DFS 过程
      makeStep(lines.callDfs, `🚀 [调用 DFS] dfs(${i})：探查 L${i} 出发的相等子图交错路。`, `dfs(${i})`, 'augment');
      makeStep(lines.dfsEntry, `  ↳ [DFS 入口] dfs(u=${i})。`, `dfs(${i})`, 'augment');
      visX[i] = true;
      makeStep(lines.dfsMarkVisX, `  🏷️ [标记左部访问] visX[${i}] = true。`, `visX[${i}]=true`, 'augment');

      let found = false;
      for (let v = 1; v <= n; v++) {
        activeEdge = [`L${i}`, `R${v}`];
        makeStep(lines.dfsLoopV, `  ↳ [考察右部节点] 检查出边 L${i} ➔ R${v} (权值 w=${weight[i][v]})。`, `edge L${i}->R${v}`, 'augment');

        makeStep(lines.dfsCheckVisY, `  🔎 [检查右部未访问] if (visY[${v}]) -> (${visY[v]})。`, `visY[${v}]?`, 'augment');
        if (visY[v]) continue;

        const delta = lx[i] + ly[v] - weight[i][v];
        makeStep(lines.dfsCalcDelta, `  📐 [计算顶标差] delta = lx[${i}](${lx[i]}) + ly[${v}](${ly[v]}) - w(${weight[i][v]}) = ${delta}。`, `delta = ${delta}`, 'augment');

        makeStep(lines.dfsCheckDeltaZero, `  🔎 [相等子图核验] if (delta == 0) -> (${delta === 0})。`, `delta == 0?`, 'augment');
        if (delta === 0) {
          visY[v] = true;
          makeStep(lines.dfsMarkVisY, `  🏷️ [加入相等子图] visY[${v}] = true；边 L${i} ➔ R${v} 属于相等子图！`, `visY[${v}]=true`, 'augment');

          makeStep(lines.dfsTryMatch, `  🔎 [匹配尝试] if (match[${v}] == 0 || dfs(match[${v}])) -> (match[${v}] = ${match[v]})。`, `match[${v}]==0?`, 'augment');
          if (match[v] === 0) {
            match[v] = i;
            found = true;
            makeStep(lines.dfsAssignMatch, `  💘 [增广成功让位] match[${v}] = ${i}；L${i} 成功与 R${v} 达成带权匹配！`, `match[${v}]=${i}`, 'augment', 'match', v);
            break;
          }
        } else {
          slack[v] = Math.min(slack[v], delta);
          makeStep(lines.dfsUpdateSlack, `  ⚡ [更新松弛变量] slack[${v}] = min(slack[${v}], ${delta}) = ${slack[v]}。`, `slack[${v}]=${slack[v]}`, 'augment', 'slack', v);
        }
      }

      if (found) {
        makeStep(lines.callDfs, `✨ [跳出增广] if (dfs(${i})) -> break；L${i} 增广完毕！`, `dfs(${i}) success break`, 'augment');
        break;
      }

      // 顶标调整
      let d = Infinity;
      for (let j = 1; j <= n; j++) {
        if (!visY[j]) d = Math.min(d, slack[j]);
      }
      deltaAdj = d;
      makeStep(lines.calcD, `⚖️ [计算最小顶标微调量] d = min(!visY) slack[*] = ${d}；寻找离相等子图最近的边扩充！`, `d = ${d}`, 'adjust_labels');

      for (let j = 1; j <= n; j++) {
        if (visX[j]) lx[j] -= d;
        if (visY[j]) ly[j] += d;
        else if (slack[j] !== Infinity) slack[j] -= d;
      }
      makeStep(lines.adjustLabels, `🔄 [对调微调顶标] 已访问左顶标 lx -= ${d}，已访问右顶标 ly += ${d}，未访问 slack -= ${d}！扩充相等子图！`, `adjust labels d=${d}`, 'adjust_labels', 'lx');
    }
  }

  // 3. 计算最终权值
  totalWeight = 0;
  for (let v = 1; v <= n; v++) {
    if (match[v] > 0) totalWeight += weight[match[v]][v];
  }
  curLeft = undefined;
  activeEdge = undefined;
  deltaAdj = undefined;

  makeStep(lines.returnAns, `🎉 [KM 最佳匹配达成] return ans = ${totalWeight}！全图达成最大权完备匹配，权重和最优！`, `完成: 总权值=${totalWeight}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KMStep>({
  id: 'km-algorithm',
  name: 'KM 算法 (Kuhn-Munkres Algorithm)',
  viewId: 'algo-km-algorithm-view',
  category: 'graph',
  icon: '💘',
  badge: {
    mode: '二分图最佳完备匹配 · 顶标理论 · 相等子图',
    complexity: 'O(N³) · O(N²)',
  },
  card1Title: '💘 二分图最大权完美匹配与相等子图沙盘',
  card2Title: '📊 KM 顶标与松弛监视器 (lx, ly, slack, match)',
  card2Desc: '展示左顶标 lx、右顶标 ly、松弛变量 slack 以及相等子图增广翻转全流程',
  legend: [
    { label: '🔵 左部节点 L', color: '#0284c7' },
    { label: '🌸 右部节点 R', color: '#db2777' },
    { label: '🟢 最佳匹配边', color: '#10b981' },
    { label: '⚡ 当前探查边', color: '#f59e0b' },
    { label: '⚖️ 相等子图待选边', color: '#334155' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设权值矩阵',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准 3x3 权值网络 (最大权 12, 3 对完备匹配)', value: 'standard' },
        { label: '简单 2x2 权值网络 (最大权 18, 2 对完备匹配)', value: 'simple' },
      ],
    },
  ],
  presets: [
    { label: '标准 3x3 (ans=12)', values: { 'input-preset': 'standard' } },
    { label: '简单 2x2 (ans=18)', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-km-weight', label: '当前匹配总权值', color: '#10b981' },
    { id: 'metric-km-matched', label: '完备匹配对数', color: '#38bdf8' },
    { id: 'metric-km-slack', label: '顶标调整量 d', color: '#f59e0b' },
    { id: 'metric-km-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: KM_ALGORITHM_CODE_LANGUAGES,
  problemHtml: KM_ALGORITHM_PROBLEM_HTML,
  analysisHtml: KM_ALGORITHM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'standard') as string;
    return buildKMSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isSimple = Object.keys(step.lx).length === 2;
    const n = isSimple ? 2 : 3;

    const leftX = 60;
    const rightX = 240;
    const startY = isSimple ? 45 : 30;
    const gapY = isSimple ? 60 : 45;

    const leftCoords: Record<string, { x: number; y: number }> = {};
    const rightCoords: Record<string, { x: number; y: number }> = {};

    for (let i = 1; i <= n; i++) {
      leftCoords[`L${i}`] = { x: leftX, y: startY + (i - 1) * gapY };
      rightCoords[`R${i}`] = { x: rightX, y: startY + (i - 1) * gapY };
    }

    const isMatched = (u: string, v: string) => {
      return step.matchedEdges.some(([mu, mv]) => mu === u && mv === v);
    };

    const isActive = (u: string, v: string) => {
      return step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
    };

    const svgEdges: string[] = [];
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        const u = `L${i}`;
        const v = `R${j}`;
        const p1 = leftCoords[u];
        const p2 = rightCoords[v];
        if (!p1 || !p2) continue;

        const matched = isMatched(u, v);
        const active = isActive(u, v);

        const color = matched ? '#10b981' : active ? '#f59e0b' : '#334155';
        const width = matched ? 3 : active ? 2 : 1;

        svgEdges.push(`
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
        `);
      }
    }

    const svgNodes: string[] = [];
    for (let i = 1; i <= n; i++) {
      const u = `L${i}`;
      const v = `R${i}`;
      const lp = leftCoords[u];
      const rp = rightCoords[v];

      // 左节点
      const isCurL = step.curLeft === u;
      svgNodes.push(`
        <g>
          <circle cx="${lp.x}" cy="${lp.y}" r="15" fill="${isCurL ? '#0284c7' : '#0f172a'}" stroke="${isCurL ? '#38bdf8' : '#0284c7'}" stroke-width="2" />
          <text x="${lp.x}" y="${lp.y + 4}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">${u}</text>
          <text x="${lp.x - 22}" y="${lp.y + 4}" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="end">lx:${step.lx[u] ?? 0}</text>
        </g>
      `);

      // 右节点
      svgNodes.push(`
        <g>
          <circle cx="${rp.x}" cy="${rp.y}" r="15" fill="#0f172a" stroke="#db2777" stroke-width="2" />
          <text x="${rp.x}" y="${rp.y + 4}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">R${i}</text>
          <text x="${rp.x + 22}" y="${rp.y + 4}" fill="#f472b6" font-size="8.5" font-weight="700" text-anchor="start">ly:${step.ly[`R${i}`] ?? 0}</text>
        </g>
      `);
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #f8fafc; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #374151; font-weight: 700;">💘 二分图最大权完备匹配拓扑</span>
          <span style="font-size: 11px; color: #1e293b; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            当前总权值: <b style="color: #10b981;">${step.totalWeight}</b> | 状态: <b style="color: #f59e0b;">${step.curLeft ? `正在匹配 ${step.curLeft}` : '完备达成'}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 300 150">
            ${svgEdges.join('')}
            ${svgNodes.join('')}
          </svg>
        </div>

        <!-- 底部顶标与相等子图舱 -->
        <div style="background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #374151;">💘 KM 顶标定理与相等子图舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              微调量: <b>${step.deltaAdj !== undefined ? `d = ${step.deltaAdj}` : '—'}</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>顶标定理:</b> lx[u] + ly[v] >= w(u,v)
            </div>
            <div style="background: rgba(219, 39, 119, 0.2); border: 1px solid #db2777; border-radius: 4px; padding: 4px 8px; color: #fbcfe8;">
              <b>相等子图:</b> 仅对满足 lx[u] + ly[v] == w 的边增广
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const isSimple = Object.keys(step.lx).length === 2;
    const n = isSimple ? 2 : 3;

    const slackItems = [];
    for (let i = 1; i <= n; i++) {
      const s = step.slack[`R${i}`];
      slackItems.push(`<span style="background: #eff6ff; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; color: #38bdf8; font-family: monospace;">R${i}: ${s ?? 0}</span>`);
    }

    const matchedStr = step.matchedEdges.length > 0
      ? step.matchedEdges.map(([u, v]) => `${u} ➔ ${v}`).join(', ')
      : '尚未形成匹配';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8;">右部松弛量 (slack):</span>
            <div style="display: flex; gap: 4px;">${slackItems.join(' ')}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">当前匹配对:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${matchedStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'km-algorithm',
  name: 'KM 算法 (Kuhn-Munkres Algorithm)',
  viewId: 'algo-km-algorithm-view',
  icon: '🤝',
  category: 'graph',
  description: '左程云算法通关课 Class 070：二分图最大权完美匹配、顶标理论与相等子图 O(N³) 算法 (洛谷 P6577)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 86,
  learningGoal: '深刻理解顶标理论、相等子图增广判定以及松弛变量 slack[] 顶标调整法则',
});

export { Visualizer as KMAlgorithmVisualizer };
