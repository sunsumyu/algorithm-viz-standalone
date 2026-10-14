/**
 * 双向广度优先搜索 (Bidirectional BFS - 单词接龙 LeetCode 127) 声明式可视化器
 * 核心：起点与终点双端交替扩展、优先扩展规模较小队列、两端相遇终止、搜索空间由 b^d 降为 2*b^(d/2)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type BiBFSStep,
  buildBiBFSSteps,
} from './bi-bfs-step-compiler';
import { BiBFSCanvasAdapter } from '../../../core/renderers/adapters/bi-bfs-canvas-adapter';
import {
  BI_BFS_CODE_LANGUAGES,
  BI_BFS_PROBLEM_HTML,
  BI_BFS_ANALYSIS_HTML,
} from './bi-bfs-problem-content';

export type { BiBFSStep };
export { buildBiBFSSteps };
export { BiBFSCanvasAdapter };

const { Visualizer: BiBFSVisualizer } = registerDeclarativeAlgorithm<BiBFSStep>({
  id: 'bi-bfs',
  name: '双向广度优先搜索 (Bidirectional BFS)',
  category: 'graph',
  aliases: ['leetcode-127', 'lc-127', 'word-ladder', 'class063-code01'],
  hasDeductionTree: true,
  icon: '↔️',
  difficulty: 3,
  levelOrder: 26,
  learningGoal: '深刻理解双向广搜的核心依据与优化精髓，掌握小集合优先扩散与碰撞判定的标准写法',
  presets: [
    { label: '经典 6 词接龙', values: { 'input-preset': 'classic_word' } },
    { label: '4 词入门接龙', values: { 'input-preset': 'line_4word' } },
  ],
  metrics: [
    { id: 'metric-bibfs-step', label: '转换序列长度', color: '#10b981' },
    { id: 'metric-bibfs-meet', label: '两波相遇单词', color: '#f59e0b' },
    { id: 'metric-small-size', label: '当前小波前规模', color: '#38bdf8' },
    { id: 'metric-bibfs-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  legend: [
    { label: '🔵 正向波前扩展词', color: '#0369a1' },
    { label: '🌸 反向波前扩展词', color: '#db2777' },
    { label: '💥 双向碰撞相遇词', color: '#f59e0b' },
    { label: '🟢 最优接龙完整路径', state: 'discovered' },
  ],
  codeLanguages: BI_BFS_CODE_LANGUAGES,
  problemHtml: BI_BFS_PROBLEM_HTML,
  analysisHtml: BI_BFS_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'classic_word') as string;
    return buildBiBFSSteps(preset);
  },
  renderCanvas: (container, step) => BiBFSCanvasAdapter.render(container, step as BiBFSStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as BiBFSStep;
    const smallBadges = step.smallLevelList.length > 0
      ? step.smallLevelList.map((w) => `<span class="bg-sky-900 border border-sky-500 text-sky-200 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">${w}</span>`).join(' ')
      : '<span class="text-slate-500">空</span>';

    const bigBadges = step.bigLevelList.length > 0
      ? step.bigLevelList.map((w) => `<span class="bg-pink-900 border border-pink-500 text-pink-200 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">${w}</span>`).join(' ')
      : '<span class="text-slate-500">空</span>';

    const pathStr = step.activePath && step.activePath.length > 0
      ? step.activePath.join(' ➔ ')
      : '尚未相遇闭合';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex items-center justify-between">
          <span class="font-bold text-sky-400">优先扩展波前 (small):</span>
          <div class="flex gap-1">${smallBadges}</div>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold text-pink-400">对向等待波前 (big):</span>
          <div class="flex gap-1">${bigBadges}</div>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[11px]">
          <span class="text-emerald-400 font-bold">接龙路径:</span>
          <span class="font-mono text-emerald-300 font-bold">${pathStr}</span>
        </div>
      </div>
    `;
  },
});

export { BiBFSVisualizer };
