/**
 * 2-SAT 问题与强连通缩点 (2-Satisfiability Problem - Tarjan SCC) 声明式可视化器
 * 进阶图论: 逻辑子句 (a ∨ b) 转蕴涵有向边 (¬a ➔ b ∧ ¬b ➔ a)、Tarjan SCC 拓扑染色判定 (洛谷 P4782)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TWO_SAT_CODE_LANGUAGES,
  TWO_SAT_PROBLEM_HTML,
  TWO_SAT_ANALYSIS_HTML,
} from './two-sat-problem-content';

export interface TwoSATStep {
  curClause: string;
  sccGroup: Record<string, number>;
  isSatisfiable: boolean;
  chosenLiterals: string[];
  status: 'imply' | 'tarjan' | 'check' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTwoSATSteps(): TwoSATStep[] {
  const steps: TwoSATStep[] = [];

  steps.push({
    curClause: '(x1 ∨ x2) ∧ (¬x1 ∨ x2)',
    sccGroup: { x1: 0, '¬x1': 0, x2: 0, '¬x2': 0 },
    isSatisfiable: true,
    chosenLiterals: [],
    status: 'imply',
    message: '1. [逻辑子句转化为蕴涵边] (x1 ∨ x2) 转换为 ¬x1 ➔ x2 与 ¬x2 ➔ x1；(¬x1 ∨ x2) 转换为 x1 ➔ x2 与 ¬x2 ➔ ¬x1！',
    log: '构建 2-SAT 蕴涵图：¬x1➔x2, ¬x2➔x1, x1➔x2, ¬x2➔¬x1',
    codeLine: [15, 22],
  });

  steps.push({
    curClause: '(x1 ∨ x2) ∧ (¬x1 ∨ x2)',
    sccGroup: { x1: 1, '¬x1': 2, x2: 3, '¬x2': 4 },
    isSatisfiable: true,
    chosenLiterals: [],
    status: 'tarjan',
    message: '2. [Tarjan 求强连通分量 SCC] 求解各文字的强连通分量，检查发现 x1 与 ¬x1 分属不同 SCC (1 与 2)，满足可满足性！',
    log: 'Tarjan 缩点：x1 与 ¬x1 处于不同 SCC (SCC(x1)!=SCC(¬x1))',
    codeLine: [24, 30],
  });

  steps.push({
    curClause: '(x1 ∨ x2) ∧ (¬x1 ∨ x2)',
    sccGroup: { x1: 1, '¬x1': 2, x2: 3, '¬x2': 4 },
    isSatisfiable: true,
    chosenLiterals: ['x1=False', 'x2=True'],
    status: 'done',
    message: '🎉 [2-SAT 赋值确定] 按拓扑逆序（SCC 编号较小者优先）选取赋值：x1 = False, x2 = True！所有子句均满足真值！',
    log: '✓ 2-SAT 求解完成：选取可行真值解 (x1=False, x2=True)',
    codeLine: [32, 38],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TwoSATStep>({
  id: 'two-sat-problem',
  name: '2-SAT 问题与强连通缩点 (2-SAT Problem)',
  category: 'graph',
  icon: '⚖️',
  badge: {
    mode: '蕴涵有向图 Tarjan 缩点',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '⚖️ 2-SAT 命题文字与蕴涵有向图沙盘',
  card2Title: '🧭 强连通编号与真值赋值监视器',
  card2Desc: '文字原变量与非变量节点、强连通分量编号 scc[x] 与真值分配',
  legend: [
    { label: '原文字 x_i', color: '#0284c7' },
    { label: '否定文字 ¬x_i', color: '#6366f1' },
    { label: '🟢 最终选取的真值文字', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '2 变量经典蕴涵子句 (P4782)', values: {} },
  ],
  metrics: [
    { id: 'metric-sat-status', label: '可满足性判定', color: '#10b981' },
    { id: 'metric-sat-assign', label: '真值分配结果', color: '#2563eb' },
  ],
  codeLanguages: TWO_SAT_CODE_LANGUAGES,
  problemHtml: TWO_SAT_PROBLEM_HTML,
  analysisHtml: TWO_SAT_ANALYSIS_HTML,
  buildSteps: () => buildTwoSATSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      '¬x1': { x: 75, y: 65 },
      x1: { x: 75, y: 155 },
      '¬x2': { x: 235, y: 65 },
      x2: { x: 235, y: 155 },
    };

    const edges = [
      { u: '¬x1', v: 'x2' },
      { u: '¬x2', v: 'x1' },
      { u: 'x1', v: 'x2' },
      { u: '¬x2', v: '¬x1' },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-sat)" />`;
      })
      .join('');

    const nodes = ['¬x1', 'x1', '¬x2', 'x2'];
    const svgNodes = nodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const isNeg = id.startsWith('¬');
        const scc = step.sccGroup[id] || 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isNeg ? '#4338ca' : '#0369a1'}" stroke="#38bdf8" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">scc:${scc}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          <defs>
            <marker id="arrow-sat" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          ⚖️ $a \\lor b$ 转化为 $\\neg a \\to b$ 与 $\\neg b \\to a$ | 存在可行解充要条件：$\\forall i, \\text{scc}(x_i) \\ne \\text{scc}(\\neg x_i)$
        </div>
      </div>
    `;

    const root = container.closest('#algo-two-sat-problem-view');
    if (root) {
      const satEl = root.querySelector('#metric-sat-status');
      const assignEl = root.querySelector('#metric-sat-assign');

      if (satEl) satEl.textContent = step.isSatisfiable ? '✓ 可满足 (Satisfiable)' : '无解';
      if (assignEl) assignEl.textContent = step.chosenLiterals.join(', ') || '推导中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 2-SAT 可满足性定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">scc[x] != scc[¬x] 恒成立 ⟺ 逻辑式必有真值解，取 scc 拓扑序小者</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'two-sat-problem',
  name: '2-SAT 问题与强连通缩点 (2-SAT Problem)',
  viewId: 'algo-two-sat-problem-view',
  category: 'graph',
  description: '经典判定图论：逻辑子句转蕴涵边有向图、Tarjan 强连通分量缩点、拓扑逆序真值赋值与 O(V+E) 求解 (洛谷 P4782)',
  icon: '⚖️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 48,
  learningGoal: '掌握 2-SAT 问题向蕴涵有向图的转化、Tarjan 缩点判定无解的充要条件以及拓扑逆序构造可行解',
});

export { Visualizer as TwoSATVisualizer };
