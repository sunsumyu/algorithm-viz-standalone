/**
 * 二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm) 声明式可视化器
 * 进阶匹配理论: 顶标可行性 lx[u] + ly[v] >= w(u,v)、相等子图增广、松弛变量 slack[v] 顶标调整、O(N³) 严格时间 (洛谷 P6577 / 左程云 class073)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type KMStep, buildKMSteps } from './km-algorithm-step-compiler';
import { renderKMAlgorithmCanvas } from '../../../core/renderers/adapters/km-algorithm-canvas-adapter';
import {
  KM_ALGORITHM_CODE_LANGUAGES,
  KM_ALGORITHM_PROBLEM_HTML,
  KM_ALGORITHM_ANALYSIS_HTML,
} from './km-algorithm-problem-content';

export type { KMStep };
export { buildKMSteps };

const { Visualizer } = registerDeclarativeAlgorithm<KMStep>({
  id: 'km-algorithm',
  name: 'KM 算法 (Kuhn-Munkres Algorithm)',
  category: 'graph',
  aliases: ['km', 'kuhn-munkres', 'class073', 'P6577'],
  hasDeductionTree: true,
  icon: '💘',
  difficulty: 3,
  levelOrder: 86,
  learningGoal: '深刻理解顶标理论、相等子图增广判定以及松弛变量 slack[] 顶标调整法则',
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
    { label: '🟢 最佳匹配边', state: 'discovered' },
    { label: '⚡ 当前探查边', color: '#f59e0b' },
    { label: '⚪ 相等子图备选边', color: '#475569' },
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
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'standard') as string;
    return buildKMSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderKMAlgorithmCanvas(container, step as KMStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as KMStep;
    const isSimple = Object.keys(step.lx).length === 2;
    const n = isSimple ? 2 : 3;

    const slackItems = Array.from({ length: n }, (_, i) => i + 1).map((i) => {
      const s = step.slack[`R${i}`];
      const sStr = s === undefined || s >= 999 ? '∞' : `${s}`;
      return `
        <div class="flex flex-col items-center justify-center min-w-[34px] h-7 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[10px] font-bold">
          <span class="text-[7.5px] text-pink-400 leading-none">R${i}</span>
          <span class="leading-tight">${sStr}</span>
        </div>
      `;
    }).join('');

    const matchedStr = step.matchedEdges.length > 0
      ? step.matchedEdges.map(([u, v]) => `<span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-[10px]">${u}➔${v}</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">尚未形成匹配</span>';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-2 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] font-bold text-pink-400">右部松弛量 slack[]:</span>
            <div class="flex gap-1">${slackItems}</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-emerald-400 font-bold">当前匹配对:</span>
            <div class="flex items-center gap-1">${matchedStr}</div>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-bold">顶标微调量 d:</span>
            <span class="font-mono font-bold text-amber-400">${step.deltaAdj !== undefined ? `d = ${step.deltaAdj}` : '—'}</span>
          </div>
        </div>
        <div class="flex justify-between items-center bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px]">
          <span class="text-slate-400">执行指令:</span>
          <strong class="font-mono text-sky-400">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
        </div>
      </div>
    `;
  },
});

export { Visualizer as KMAlgorithmVisualizer };
