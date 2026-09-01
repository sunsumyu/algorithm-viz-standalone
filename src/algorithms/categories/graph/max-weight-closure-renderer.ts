/**
 * 网络流最大权闭合子图 (Max-Weight Closure of Directed Graph) 声明式可视化器
 * 进阶网络流: 正权点连源点 S、负权点连汇点 T、依赖边容量无穷大、最大权 = 正权和 - 最小割 (洛谷 P2762)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
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
  status: 'deps' | 'build' | 'cut' | 'closure' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildMaxWeightClosureSteps(): ClosureStep[] {
  const steps: ClosureStep[] = [];

  const depEdges = [
    { u: 'E1', v: 'I1', cap: Infinity, flow: 0, isInf: true },
    { u: 'E1', v: 'I2', cap: Infinity, flow: 0, isInf: true },
    { u: 'E2', v: 'I2', cap: Infinity, flow: 0, isInf: true },
    { u: 'E2', v: 'I3', cap: Infinity, flow: 0, isInf: true },
  ];

  steps.push({
    cutEdges: [],
    flowEdges: depEdges,
    chosenNodes: [],
    totalPositive: 25,
    minCutValue: 0,
    maxProfit: 0,
    status: 'deps',
    message: '1. [原图依赖关系] 实验 E1(+10) 依赖仪器 I1(-5), I2(-7)；实验 E2(+15) 依赖仪器 I2(-7), I3(-8)。',
    log: '加载原图依赖关系：正权实验 E1(+10), E2(+15) 与 负权仪器 I1(-5), I2(-7), I3(-8)',
    codeLine: [10, 18],
  });

  const netEdges = [
    ...depEdges,
    { u: 'S', v: 'E1', cap: 10, flow: 0 },
    { u: 'S', v: 'E2', cap: 15, flow: 0 },
    { u: 'I1', v: 'T', cap: 5, flow: 0 },
    { u: 'I2', v: 'T', cap: 7, flow: 0 },
    { u: 'I3', v: 'T', cap: 8, flow: 0 },
  ];

  steps.push({
    cutEdges: [],
    flowEdges: netEdges,
    chosenNodes: [],
    totalPositive: 25,
    minCutValue: 0,
    maxProfit: 0,
    status: 'build',
    message: '2. [网络流建图] 源点 S 连正权点(容量=收益)，负权点连汇点 T(容量=|成本|)，原依赖边容量为 ∞！',
    log: '建立网络流：S ➔ E1(10), S ➔ E2(15); I1(5) ➔ T, I2(7) ➔ T, I3(8) ➔ T',
    codeLine: [20, 28],
  });

  const flowedEdges = [
    { u: 'E1', v: 'I1', cap: Infinity, flow: 5, isInf: true },
    { u: 'E1', v: 'I2', cap: Infinity, flow: 5, isInf: true },
    { u: 'E2', v: 'I2', cap: Infinity, flow: 2, isInf: true },
    { u: 'E2', v: 'I3', cap: Infinity, flow: 8, isInf: true },
    { u: 'S', v: 'E1', cap: 10, flow: 10 },
    { u: 'S', v: 'E2', cap: 15, flow: 10 },
    { u: 'I1', v: 'T', cap: 5, flow: 5 },
    { u: 'I2', v: 'T', cap: 7, flow: 7 },
    { u: 'I3', v: 'T', cap: 8, flow: 8 },
  ];

  const cuts = [
    { u: 'I1', v: 'T' },
    { u: 'I2', v: 'T' },
    { u: 'I3', v: 'T' },
  ];

  steps.push({
    cutEdges: cuts,
    flowEdges: flowedEdges,
    chosenNodes: [],
    totalPositive: 25,
    minCutValue: 20,
    maxProfit: 5,
    status: 'cut',
    message: '3. [Dinic 求解最小割] 求得 S-T 最大流 = 20，最小割容量 = 20。割断的边均为连向汇点 T 的边！',
    log: 'Dinic 最大流/最小割计算完毕：MinCut = 20',
    codeLine: [30, 36],
  });

  steps.push({
    cutEdges: cuts,
    flowEdges: flowedEdges,
    chosenNodes: ['E1', 'E2', 'I1', 'I2', 'I3'],
    totalPositive: 25,
    minCutValue: 20,
    maxProfit: 5,
    status: 'done',
    message: '🎉 [闭合子图与最大净收益确定] 在残量网络中从 S 出发可达的节点集合为 {E1, E2, I1, I2, I3}。最大净收益 = 正权和(25) - 最小割(20) = 5！',
    log: '✓ 选取闭合子图: {E1, E2, I1, I2, I3}, 最大净收益 = 5',
    codeLine: [38, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<ClosureStep>({
  id: 'max-weight-closure',
  name: '最大权闭合子图 (Max-Weight Closure)',
  category: 'graph',
  icon: '💰',
  badge: {
    mode: '最小割最大权转化定理',
    complexity: 'O(V² · E) · O(V + E)',
  },
  card1Title: '💰 正负权依赖网络与最小割沙盘',
  card2Title: '🧭 净收益与最小割监视器',
  card2Desc: '正权点收益和 ∑W+、S-T 最小割容量与最优闭合子图收益',
  legend: [
    { label: '正权实验 (收益)', color: '#0284c7' },
    { label: '负权仪器 (成本)', color: '#6366f1' },
    { label: '⭐ 源点 S / 汇点 T', color: '#f59e0b' },
    { label: '🟢 最优闭合子图选中点', color: '#10b981' },
    { label: '🔴 最小割断边', color: '#ef4444' },
  ],
  inputs: [],
  presets: [
    { label: '太空飞行计划经典用例 (P2762)', values: {} },
  ],
  metrics: [
    { id: 'metric-pos-weight', label: '正权总和 ∑W+', color: '#2563eb' },
    { id: 'metric-min-cut-val', label: 'S-T 最小割容量', color: '#ef4444' },
    { id: 'metric-max-profit', label: '最大净收益', color: '#10b981' },
  ],
  codeLanguages: MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
  problemHtml: MAX_WEIGHT_CLOSURE_PROBLEM_HTML,
  analysisHtml: MAX_WEIGHT_CLOSURE_ANALYSIS_HTML,
  buildSteps: () => buildMaxWeightClosureSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      S: { x: 30, y: 110 },
      E1: { x: 105, y: 65 },
      E2: { x: 105, y: 155 },
      I1: { x: 205, y: 45 },
      I2: { x: 205, y: 110 },
      I3: { x: 205, y: 175 },
      T: { x: 280, y: 110 },
    };

    const isCutEdge = (u: string, v: string) => step.cutEdges.some((e) => e.u === u && e.v === v);

    const svgEdges = step.flowEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isCut = isCutEdge(e.u, e.v);
        const color = isCut ? '#ef4444' : e.isInf ? '#f59e0b' : '#475569';
        const width = isCut ? 3 : e.flow > 0 ? 2 : 1.5;
        const dash = isCut ? 'stroke-dasharray="4,4"' : '';

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${dash} />`;
      })
      .join('');

    const nodes = ['S', 'E1', 'E2', 'I1', 'I2', 'I3', 'T'];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isChosen = step.chosenNodes.includes(u);
        const isST = u === 'S' || u === 'T';
        const bg = isChosen ? '#065f46' : isST ? '#f59e0b' : u.startsWith('E') ? '#0284c7' : '#6366f1';
        const border = isChosen ? '#10b981' : isST ? '#facc15' : '#ffffff';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="13" fill="${bg}" stroke="${border}" stroke-width="${isChosen ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="9.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色高亮为残量网络从 S 出发可达的闭合子图 | 🔴 红色虚线为最小割断边
        </div>
      </div>
    `;

    const root = container.closest('#algo-max-weight-closure-view');
    if (root) {
      const posEl = root.querySelector('#metric-pos-weight');
      const cutEl = root.querySelector('#metric-min-cut-val');
      const profitEl = root.querySelector('#metric-max-profit');

      if (posEl) posEl.textContent = `${step.totalPositive}`;
      if (cutEl) cutEl.textContent = `${step.minCutValue}`;
      if (profitEl) profitEl.textContent = `${step.maxProfit}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const chosenStr = step.chosenNodes.length > 0 ? `{ ${step.chosenNodes.join(', ')} }` : '—';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>闭合子图选中节点:</span>
              <strong style="color: #10b981; font-family: monospace;">${chosenStr}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 最大权闭合子图定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">MaxProfit = ∑Positive - MinCut = 25 - ${step.minCutValue} = ${step.maxProfit}</strong>
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
  description: '进阶网络流最小割经典应用：正权点连源点 S、负权点连汇点 T、依赖边无穷大、最大权=正权和-最小割 (洛谷 P2762 太空飞行计划)',
  icon: '💰',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 62,
  learningGoal: '掌握最大权闭合子图转化为最小割的数学证明、建图方法与残量网络可达性提取方案',
});

export { Visualizer as MaxWeightClosureVisualizer };
