/**
 * 严格次小生成树 (Strict Second-Best MST) — 声明式 Thin Domain Adapter 架构
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：Kruskal 求主生成树、树上倍增维护严格最大/次大边、枚举非树边换边 (洛谷 P4180)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SECOND_MST_CODE_LANGUAGES,
  SECOND_MST_PROBLEM_HTML,
  SECOND_MST_ANALYSIS_HTML,
} from './second-mst-problem-content';
import {
  type SecondMstStep,
  buildSecondMstSteps,
  SMST_COORDS_4,
  SMST_COORDS_5,
  SMST_EDGES_4,
  SMST_EDGES_5,
} from './second-mst-step-compiler';
import {
  SecondMstCanvasAdapter,
  renderSecondMstCanvas,
} from '../../../core/renderers/adapters/second-mst-canvas-adapter';

export type { SecondMstStep };
export { buildSecondMstSteps, renderSecondMstCanvas, SMST_COORDS_4, SMST_COORDS_5, SMST_EDGES_4, SMST_EDGES_5 };

const { template, Visualizer } = registerDeclarativeAlgorithm<SecondMstStep>({
  id: 'second-mst',
  aliases: ['strict-second-mst', 'luogu-p4180', 'second-best-mst'],
  name: '严格次小生成树 (Strict Second MST)',
  category: 'graph',
  icon: '🥈',
  difficulty: 3,
  levelOrder: 80,
  hasDeductionTree: true,
  description: '进阶图论经典：Kruskal 求解主最小生成树、倍增维护环上严格最大与严格次大边、破圈严格大于换边 (洛谷 P4180)',
  learningGoal: '掌握严格次小生成树破圈定理、倍增同时维护最大与次大边技巧及规避等权替换陷阱',
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_4node_p4180',
      options: [
        { label: 'P4180 经典 4 节点 (MST: 6, 次小: 7)', value: 'classic_4node_p4180' },
        { label: '含等权边 5 节点 (强制替换 max2, 次小: 10)', value: 'equal_weight_5node' },
      ],
    },
  ],
  presets: [
    { label: 'P4180 经典 4 节点', values: { 'input-preset': 'classic_4node_p4180' } },
    { label: '含等权边 5 节点', values: { 'input-preset': 'equal_weight_5node' } },
  ],
  metrics: [
    { id: 'metric-mst-w', label: '基础 MST 权值', color: '#10b981' },
    { id: 'metric-second-mst-w', label: '严格次小 MST 权值', color: '#f59e0b' },
    { id: 'metric-cur-edge', label: '当前试探非树边', color: '#38bdf8' },
    { id: 'metric-smst-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '🟢 最小生成树边 (MST)', state: 'discovered' },
    { label: '🟡 试探非树边 (黄虚线)', color: '#facc15' },
    { label: '🔴 被替换树边 (红线)', state: 'swapping' },
  ],
  codeLanguages: SECOND_MST_CODE_LANGUAGES,
  problemHtml: SECOND_MST_PROBLEM_HTML,
  analysisHtml: SECOND_MST_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'classic_4node_p4180') as string;
    return buildSecondMstSteps(preset);
  },
  renderCanvas: (container, step) => SecondMstCanvasAdapter.render(container, step as SecondMstStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as SecondMstStep;
    const is5Node = step.parentArray.length > 5;
    const nodes = is5Node ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];

    const renderRow = (name: string, arr: number[], color: string) => {
      const cells = nodes.map((idx) => {
        const val = arr[idx] ?? -1;
        const displayVal = val === -1 ? '-' : String(val);
        return `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:32px; height:28px; background:#ffffff; border:1px solid #cbd5e1; border-radius:4px; font-family:monospace; font-size:10.5px; font-weight:700;">
            <span style="font-size:7.5px; color:#64748b; line-height:1;">[${idx}]</span>
            <span style="line-height:1.1; color:#0f172a;">${displayVal}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-family:monospace; font-size:10.5px; font-weight:700; width:100px; color:${color};">${name}:</span>
          <div style="display:flex; gap:3px;">${cells}</div>
        </div>
      `;
    };

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px; padding:4px 0;">
        <div style="display:flex; flex-direction:column; gap:4px; background:#f8fafc; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
          ${renderRow('parent[] (并查集)', step.parentArray, '#0284c7')}
          ${renderRow('max1[] (路径最大)', step.max1Array, '#10b981')}
          ${renderRow('max2[] (严格次大)', step.max2Array, '#f59e0b')}
        </div>
      </div>
    `;
  },
});

export const secondMstVisualizer = Visualizer;
export { Visualizer as SecondMstVisualizer };
