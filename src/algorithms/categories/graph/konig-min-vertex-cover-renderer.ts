/**
 * 二分图最小点覆盖与 König 定理 (König's Theorem - Min Vertex Cover) 声明式可视化器
 * 进阶匹配理论: 最大匹配数 = 最小点覆盖数、未匹配点交错路 DFS 染色提取覆盖集与最大独立集 (洛谷 P6062 / 左程云 class069)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 125 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type KonigStep, buildKonigSteps } from './konig-min-vertex-cover-step-compiler';
import { renderKonigMinVertexCoverCanvas } from '../../../core/renderers/adapters/konig-min-vertex-cover-canvas-adapter';
import {
  KONIG_COVER_CODE_LANGUAGES,
  KONIG_COVER_PROBLEM_HTML,
  KONIG_COVER_ANALYSIS_HTML,
} from './konig-min-vertex-cover-problem-content';

export type { KonigStep };
export { buildKonigSteps };

const { Visualizer } = registerDeclarativeAlgorithm<KonigStep>({
  id: 'konig-min-vertex-cover',
  name: '二分图最小点覆盖与 König 定理 (König Theorem)',
  category: 'graph',
  aliases: ['konig-theorem', 'min-vertex-cover', 'class069', 'P6062'],
  hasDeductionTree: true,
  icon: '🛡️',
  difficulty: 3,
  levelOrder: 74,
  learningGoal: '掌握 König 定理证明思想、交错路标记法构造最小点覆盖及最大独立集对偶互补关系',
  badge: {
    mode: '匈牙利匹配 + 交错轨提取',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🛡️ 二分图拓扑、交错路染色与覆盖集沙盘',
  card2Title: '📊 König 多数组 (matchL, matchR, visL, visR) 监控器',
  card2Desc: '逐行对齐未匹配左部点出发的交错路 DFS 染色、!visL 与 visR 最小点覆盖提取及互补最大独立集',
  legend: [
    { label: '左部未覆盖点', color: '#1e3a8a' },
    { label: '右部未覆盖点', color: '#581c87' },
    { label: '🛡️ 最小点覆盖点', state: 'swapping' },
    { label: '🟢 匹配边 (实线)', state: 'discovered' },
    { label: '⚪ 非匹配边 (虚线)', color: '#475569' },
  ],
  presets: [
    { label: '经典用例 (左4右3)', values: { 'input-preset': 'classic' } },
    { label: '简单用例 (左3右2)', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-match-size', label: '二分图最大匹配数', color: '#10b981' },
    { id: 'metric-cover-size', label: '最小点覆盖集大小', color: '#ef4444' },
    { id: 'metric-indep-size', label: '最大独立集大小', color: '#38bdf8' },
    { id: 'metric-konig-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: KONIG_COVER_CODE_LANGUAGES,
  problemHtml: KONIG_COVER_PROBLEM_HTML,
  analysisHtml: KONIG_COVER_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'classic') as string;
    return buildKonigSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderKonigMinVertexCoverCanvas(container, step as KonigStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as KonigStep;
    const isClassic = step.visLArray.length > 4;
    const leftCount = isClassic ? 4 : 3;
    const rightCount = isClassic ? 3 : 2;

    const renderRow = (name: string, arr: any[], count: number, activeName: string, color: string, prefix: string) => {
      const cells = Array.from({ length: count }, (_, i) => i + 1).map((idx) => {
        const val = arr[idx];
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
        return `
          <div class="flex flex-col items-center justify-center min-w-[28px] h-7 ${isActive ? 'bg-amber-950 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-700 text-slate-200'} border rounded font-mono text-[9.5px] font-bold">
            <span class="text-[7.5px] text-slate-400 leading-none">${prefix}${idx}</span>
            <span class="leading-tight">${displayVal}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="flex items-center justify-between">
          <span class="font-mono text-[10.5px] font-bold ${color}">${name}:</span>
          <div class="flex gap-1">${cells}</div>
        </div>
      `;
    };

    const matchLRow = renderRow('matchL[] (左配右)', step.matchLArray, leftCount, 'matchL', 'text-sky-400', 'L');
    const matchRRow = renderRow('matchR[] (右配左)', step.matchRArray, rightCount, 'matchR', 'text-purple-400', 'R');
    const visLRow = renderRow('visL[] (交错左)', step.visLArray, leftCount, 'visL', 'text-emerald-400', 'L');
    const visRRow = renderRow('visR[] (交错右)', step.visRArray, rightCount, 'visR', 'text-amber-400', 'R');
    const coverStr = step.coverSet.length > 0 ? `{ ${step.coverSet.join(', ')} }` : '推导中';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          ${matchLRow}
          ${matchRRow}
          ${visLRow}
          ${visRRow}
          <div class="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-rose-400 font-bold">🛡️ 最小点覆盖集:</span>
            <strong class="font-mono text-rose-300">${coverStr}</strong>
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

export { Visualizer as KonigMinVertexCoverVisualizer };
