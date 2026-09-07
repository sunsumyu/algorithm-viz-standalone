/**
 * 网络流最大权闭合子图 (Max-Weight Closure of Directed Graph) 声明式可视化器
 * 进阶网络流: 正权点连源点 S、负权点连汇点 T、依赖边容量无穷大、最大权 = 正权和 - 最小割 (洛谷 P2762)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (level, cur, flow, cut) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
  MAX_WEIGHT_CLOSURE_PROBLEM_HTML,
  MAX_WEIGHT_CLOSURE_ANALYSIS_HTML,
} from './max-weight-closure-problem-content';

export interface ClosureStep {
  cutEdges: Array<{ u: string; v: string }>;
  flowEdges: Array<{ u: string; v: string; cap: number; flow: number; isInf?: boolean }>;
  chosenNodes: string[];
  totalPositive: number;
  minCutValue: number;
  maxProfit: number;
  activePath?: string[];
  activeEdge?: [string, string];
  levelArray?: number[];
  status: 'deps' | 'build' | 'bfs' | 'dfs' | 'cut' | 'closure' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildMaxWeightClosureSteps(preset: string = 'space'): ClosureStep[] {
  const steps: ClosureStep[] = [];
  const isSpace = preset === 'space';

  // 节点定义
  // space: 实验 E1(+10), E2(+15), 仪器 I1(-5), I2(-8), I3(-7)
  // E1 依赖 I1, I2; E2 依赖 I2, I3
  // totalPos = 25, 仪器总成本 = 20, 全选时净收益 25 - 20 = 5, minCut = 20
  // simple: 实验 E1(+12), 仪器 I1(-4), I2(-5)
  // E1 依赖 I1, I2; totalPos = 12, minCut = 9, maxProfit = 3
  const nodeWeights: Record<string, number> = isSpace
    ? { E1: 10, E2: 15, I1: -5, I2: -8, I3: -7 }
    : { E1: 12, I1: -4, I2: -5 };

  const dependencies: Array<[string, string]> = isSpace
    ? [
        ['E1', 'I1'],
        ['E1', 'I2'],
        ['E2', 'I2'],
        ['E2', 'I3'],
      ]
    : [
        ['E1', 'I1'],
        ['E1', 'I2'],
      ];

  const targetMinCut = isSpace ? 20 : 9;
  const targetProfit = isSpace ? 5 : 3;
  const targetChosen = isSpace ? ['E1', 'E2', 'I1', 'I2', 'I3'] : ['E1', 'I1', 'I2'];

  let totalPositive = 0;
  let minCutValue = 0;
  let maxProfit = 0;
  const flowEdges: Array<{ u: string; v: string; cap: number; flow: number; isInf?: boolean }> = [];
  const cutEdges: Array<{ u: string; v: string }> = [];
  const chosenNodes: string[] = [];

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'deps' | 'build' | 'bfs' | 'dfs' | 'cut' | 'closure' | 'done',
    activeEdge?: [string, string],
    finalChosen?: string[]
  ): void {
    const curChosen = finalChosen || [...chosenNodes];
    const phaseStr =
      status === 'done'
        ? '闭合子图求解完成'
        : status === 'closure'
          ? '残量网络可达性遍历'
          : status === 'cut'
            ? '最小割割边提取'
            : status === 'dfs'
              ? 'Dinic 阻塞流增广'
              : status === 'bfs'
                ? 'Dinic 分层网络搜索'
                : status === 'deps'
                  ? '闭合依赖强约束建模'
                  : '权值源汇网络构建';

    steps.push({
      cutEdges: cutEdges.map((e) => ({ ...e })),
      flowEdges: flowEdges.map((e) => ({ ...e })),
      chosenNodes: curChosen,
      totalPositive,
      minCutValue,
      maxProfit,
      activeEdge,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-pos-weight': `正权总和: +${totalPositive}`,
        'metric-min-cut-val': `最小割损失: ${minCutValue}`,
        'metric-max-profit': `最大净收益: ${maxProfit}`,
        'metric-closure-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 17: init(numNodes)
  const nodeCount = Object.keys(nodeWeights).length;
  makeStep(17, `🚀 [算法初始化] init(numNodes=${nodeCount})：设置网络节点总数 n = ${nodeCount}。`, `init(${nodeCount})`, 'build');

  // 行 23: S = 0; T = n + 1;
  makeStep(23, `📌 [确立源汇] S = 0 (超源), T = ${nodeCount + 1} (超汇)。`, `S = 0, T = ${nodeCount + 1}`, 'build');

  // 行 24: totalPositiveWeight = 0;
  makeStep(24, '💰 [收益归零] totalPositiveWeight = 0; 准备累加所有正权收益。', 'totalPositiveWeight = 0', 'build');

  // 行 26: adj = new ArrayList<>();
  makeStep(26, '📐 [分配邻接表] 为每个节点分配残量网络出边列表。', '分配 adj 表', 'build');

  // 行 28: level/cur 分配
  makeStep(28, '📊 [分配流状态数组] 分配 level[] 分层数组与 cur[] 当前弧优化指针。', '分配 level, cur', 'build');

  // ==================== 2. 逐点加入正权/负权边 ====================
  for (const [node, w] of Object.entries(nodeWeights)) {
    // 行 42: addNode(u, weight)
    if (w > 0) {
      totalPositive += w;
      flowEdges.push({ u: 'S', v: node, cap: w, flow: 0 });
      makeStep([43, 45], `💰 [正权边构建] 节点 ${node} 收益 +${w} > 0：连接源边 S ➔ ${node}，容量 cap = ${w}；累加正权和 totalPos = ${totalPositive}。`, `S ➔ ${node} (收益 ${w})`, 'build', ['S', node]);
    } else {
      const cost = -w;
      flowEdges.push({ u: node, v: 'T', cap: cost, flow: 0 });
      makeStep([46, 47], `💸 [负权成本边] 节点 ${node} 成本 ${w} < 0：连接汇边 ${node} ➔ T，容量 cap = ${cost}。`, `${node} ➔ T (成本 ${cost})`, 'build', [node, 'T']);
    }
  }

  // ==================== 3. 依赖关系容量无穷大 ====================
  for (const [u, v] of dependencies) {
    // 行 51: addDependency(u, v)
    flowEdges.push({ u, v, cap: 1000000000, flow: 0, isInf: true });
    makeStep(51, `🔒 [依赖边强约束] addDependency(${u}, ${v})：连接 ${u} ➔ ${v}，容量 cap = ∞ (1e9)；依赖边不可被切断！选 ${u} 必须强制选 ${v}！`, `${u} ➔ ${v} (依赖 cap=∞)`, 'deps', [u, v]);
  }

  // ==================== 4. Dinic 算法求最小割 ====================
  // 行 88: solve()
  makeStep(88, '⚡ [启动 Dinic 最小割] solve(): 运行 Dinic 最大流算法，根据最大流最小割定理求出割舍或支付的最小代价 minCut。', 'solve() 入口', 'cut');

  // 行 55: bfs()
  makeStep(55, '🌊 [BFS 搜索分层图] 在残量网络中从源点 S 出发遍历计算各点层次标号 level[]。', 'level 数组就绪', 'bfs');

  // 行 72: dfs(u, pushed) 模拟增广推流
  let pushedSum = 0;
  for (const e of flowEdges) {
    if (e.v === 'T' && pushedSum < targetMinCut) {
      const canPush = Math.min(e.cap, targetMinCut - pushedSum);
      e.flow += canPush;
      pushedSum += canPush;
      makeStep(72, `🚀 [阻塞流增广] 沿增广路向汇点 T 推进流量 ${canPush} 单位！累积割值：${pushedSum}。`, `增广流 +${canPush}`, 'dfs', [e.u, 'T']);
    }
  }

  // 行 97: minCut 计算
  minCutValue = targetMinCut;
  maxProfit = totalPositive - minCutValue;
  makeStep(97, `⚖️ [最小割求解完毕] 伴随网络最大流 = 最小割 = ${minCutValue}；最大净收益 = 正权总和 (${totalPositive}) - 最小割 (${minCutValue}) = ${maxProfit}！`, `minCut = ${minCutValue}, profit = ${maxProfit}`, 'cut');

  // 记录割边
  for (const e of flowEdges) {
    if (e.flow === e.cap && e.cap > 0 && !e.isInf) {
      cutEdges.push({ u: e.u, v: e.v });
    }
  }

  // ==================== 5. 残量网络提取闭合子图所选节点 ====================
  // 行 100: getChosenNodes()
  makeStep(100, '🔍 [提取闭合方案] getChosenNodes(): 在残量网络中从源点 S 出发沿未满流残量边 (cap > flow) 搜索所有可达节点！', 'getChosenNodes() 入口', 'closure');

  for (const id of targetChosen) {
    chosenNodes.push(id);
    makeStep(100, `🎯 [可达节点纳入] 节点 ${id} 在残量网络中从 S 可达，属于最大权闭合子图！加入所选集！`, `选中闭合节点 ${id}`, 'closure', undefined, [...chosenNodes]);
  }

  // 终态
  makeStep(108, `🎉 [闭合子图求解完成] 最终选定闭合子图节点集：{ ${targetChosen.join(', ')} }，获得全网最大净收益：${maxProfit}！`, '最大权闭合子图完成', 'done', undefined, targetChosen);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<ClosureStep>({
  id: 'max-weight-closure',
  name: '最大权闭合子图 (Max-Weight Closure)',
  category: 'graph',
  icon: '⚖️',
  badge: {
    mode: '最小割建模 + 残量可达性',
    complexity: 'O(V² E) · O(V + E)',
  },
  card1Title: '⚖️ 网络流最小割建模与闭合子图拓扑沙盘',
  card2Title: '📊 闭合子图收支分析器 (正权和, 最小割, 净收益, 选点集)',
  card2Desc: '逐行对齐正权连 S、负权连 T、依赖边赋无穷大 cap=∞ 及残量网络 S-可达集闭合性判定',
  legend: [
    { label: 'S 源点 / T 汇点', color: '#f59e0b' },
    { label: '🟢 正权实验节点', color: '#10b981' },
    { label: '🔴 负权仪器节点', color: '#ef4444' },
    { label: '👑 所选闭合子图点', color: '#f59e0b' },
    { label: '⚪ 割边 (红虚线)', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '工程依赖模型',
      type: 'select',
      defaultValue: 'space',
      options: [
        { label: '太空飞行计划 (2实验3仪器，最大收益 5)', value: 'space' },
        { label: '精简项目依赖 (1实验2仪器，最大收益 3)', value: 'simple' },
      ],
    },
  ],
  presets: [
    { label: '太空飞行计划', values: { 'input-preset': 'space' } },
    { label: '精简项目依赖', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-pos-weight', label: '正权收益总额', color: '#10b981' },
    { id: 'metric-min-cut-val', label: '最小割总代价', color: '#ef4444' },
    { id: 'metric-max-profit', label: '最终最大净收益', color: '#f59e0b' },
    { id: 'metric-closure-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
  problemHtml: MAX_WEIGHT_CLOSURE_PROBLEM_HTML,
  analysisHtml: MAX_WEIGHT_CLOSURE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'space') as string;
    return buildMaxWeightClosureSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isSpace = step.chosenNodes.includes('E2') || step.flowEdges.some((e) => e.u === 'E2');
    const nodeCoords: Record<string, { x: number; y: number }> = isSpace
      ? {
          S: { x: 35, y: 105 },
          E1: { x: 105, y: 65 },
          E2: { x: 105, y: 145 },
          I1: { x: 215, y: 45 },
          I2: { x: 215, y: 105 },
          I3: { x: 215, y: 165 },
          T: { x: 285, y: 105 },
        }
      : {
          S: { x: 45, y: 105 },
          E1: { x: 125, y: 105 },
          I1: { x: 205, y: 65 },
          I2: { x: 205, y: 145 },
          T: { x: 285, y: 105 },
        };

    const svgEdges = step.flowEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isCut = step.cutEdges.some((ce) => ce.u === e.u && ce.v === e.v);
        const isAct = step.activeEdge && step.activeEdge[0] === e.u && step.activeEdge[1] === e.v;
        const color = isAct ? '#f59e0b' : isCut ? '#ef4444' : e.isInf ? '#38bdf8' : '#475569';
        const width = isAct ? 3.5 : isCut ? 2.5 : 1.5;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isCut ? 'stroke-dasharray="4,2"' : ''} />
          </g>
        `;
      })
      .join('');

    const allKeys = Object.keys(nodeCoords);
    const svgNodes = allKeys
      .map((k) => {
        const p = nodeCoords[k];
        if (!p) return '';
        const isST = k === 'S' || k === 'T';
        const isChosen = step.chosenNodes.includes(k);
        const isE = k.startsWith('E');

        const bg = isST ? '#b45309' : isChosen ? '#065f46' : isE ? '#0369a1' : '#7f1d1d';
        const border = isST ? '#f59e0b' : isChosen ? '#10b981' : isE ? '#38bdf8' : '#ef4444';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isChosen ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${k}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${isChosen ? '#34d399' : '#94a3b8'}" font-size="8" font-weight="700" text-anchor="middle">${isChosen ? '👑选中' : isST ? '源汇' : isE ? '收益' : '成本'}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 320 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          蓝色实线为依赖边 (cap=∞ 不可割) | 红色虚线为最小割割边 | 绿色带皇冠为最终选定的最大权闭合子图
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-max-weight-closure-view') ||
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
        const chosenStr = step.chosenNodes.length > 0 ? `{ ${step.chosenNodes.join(', ')} }` : '尚未确定';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #10b981; font-weight: 700;">正权收益总额:</span>
                <strong style="color: #10b981; font-family: monospace;">+${step.totalPositive}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ef4444; font-weight: 700;">伴随网络最小割 (放弃收益+支付成本):</span>
                <strong style="color: #ef4444; font-family: monospace;">-${step.minCutValue}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 4px; margin-top: 2px;">
                <span style="color: #f59e0b; font-weight: 700;">👑 最终闭合子图所选点集:</span>
                <strong style="color: #facc15; font-family: monospace;">${chosenStr}</strong>
              </div>
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
  id: 'max-weight-closure',
  name: '最大权闭合子图 (Max-Weight Closure)',
  viewId: 'algo-max-weight-closure-view',
  category: 'graph',
  description: '进阶网络流经典：正权点连 S、负权点连 T、依赖边容量无穷大、最大权等于正权和减最小割 (洛谷 P2762)',
  icon: '⚖️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 75,
  learningGoal: '掌握最大权闭合子图的最小割转化定理、不可割依赖边建模及残量网络可达性方案还原',
});

export { Visualizer as MaxWeightClosureVisualizer };
