/**
 * 火星词典拓扑排序 (Alien Dictionary - LeetCode 269 / 剑指 Offer II 114) 声明式可视化器
 * 核心：字典序首个不同字符提取有向偏序关系、入度统计与拓扑排序、非法前缀与环检测
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type AlienStep, buildAlienDictSteps } from './alien-dict-step-compiler';
import { AlienDictCanvasAdapter } from '../../../core/renderers/adapters/alien-dict-canvas-adapter';
import {
  ALIEN_DICT_PROBLEM_HTML,
  ALIEN_DICT_ANALYSIS_HTML,
  ALIEN_DICT_CODE_LANGUAGES,
} from './alien-dict-problem-content';

export type { AlienStep };
export { buildAlienDictSteps, AlienDictCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<AlienStep>({
  id: 'alien-dict',
  name: '火星词典拓扑排序 (Alien Dictionary)',
  category: 'graph',
  aliases: ['class059-code03', 'alien-dictionary-269', 'alien-dict-269'],
  hasDeductionTree: true,
  icon: '👽',
  difficulty: 3,
  levelOrder: 89,
  learningGoal: '掌握字符偏序依赖建图、非法前缀陷阱的检测机制以及拓扑排序判环',
  badge: {
    mode: '邻词首异字符偏序 · 前缀判定 · 拓扑排序',
    complexity: 'O(C) · O(U + min(U, 26²))',
  },
  card1Title: '👽 火星字符偏序字典与拓扑沙盘',
  card2Title: '📊 字符入度与拓扑序列监视器',
  card2Desc: '展示相邻单词偏序提取、入度表、拓扑队列以及前缀/环冲突检测全过程',
  legend: [
    { label: '🔤 火星字符节点', color: '#0369a1' },
    { label: '🟢 已确定顺序字符', state: 'discovered' },
    { label: '⚡ 当前提取/考察边', color: '#f59e0b' },
    { label: '🚨 异常冲突字符', state: 'swapping' },
  ],
  presets: [
    { label: '合法字典序', values: { 'input-preset': 'valid' } },
    { label: '非法前缀陷阱', values: { 'input-preset': 'prefix_error' } },
    { label: '环冲突无解', values: { 'input-preset': 'cycle' } },
  ],
  metrics: [
    { id: 'metric-alien-chars', label: '涉及字符总数', color: '#38bdf8' },
    { id: 'metric-alien-order', label: '当前拓扑序列', color: '#10b981' },
    { id: 'metric-alien-queue', label: '0入度队列', color: '#f59e0b' },
    { id: 'metric-alien-phase', label: '当前分析阶段', color: '#a855f7' },
  ],
  codeLanguages: ALIEN_DICT_CODE_LANGUAGES,
  problemHtml: ALIEN_DICT_PROBLEM_HTML,
  analysisHtml: ALIEN_DICT_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'valid') as string;
    return buildAlienDictSteps(preset);
  },
  renderCanvas: (container, step) => {
    AlienDictCanvasAdapter.render(container, step as AlienStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as AlienStep;
    const degItems = step.charList
      .map((c) => {
        const d = step.inDegrees[c] ?? 0;
        return `
          <div class="flex flex-col items-center justify-center min-w-[32px] h-7 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[10px] font-bold">
            <span class="text-[8px] text-slate-400 leading-none">'${c}'</span>
            <span class="leading-tight text-amber-300">${d}</span>
          </div>
        `;
      })
      .join('');

    const orderStr =
      step.status === 'error'
        ? '<span class="text-rose-400 font-bold">❌ 存在环/非法前缀 (无有效字典序)</span>'
        : step.topoOrder.length > 0
          ? step.topoOrder.join(' ➔ ')
          : '排序中...';

    const queueStr =
      step.queue && step.queue.length > 0
        ? step.queue.map((c) => `'${c}'`).join(', ')
        : '空';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[11px] font-bold text-amber-400 w-28">inDegree[]:</span>
            <div class="flex flex-wrap gap-1">${degItems}</div>
          </div>
          <div class="flex justify-between items-center text-[11px]">
            <span class="font-mono font-bold text-sky-400">0入度队列:</span>
            <span class="font-mono text-slate-200 font-semibold">[ ${queueStr} ]</span>
          </div>
          <div class="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-emerald-400 font-bold">当前拓扑序列:</span>
            <strong class="text-emerald-400 font-mono text-xs">${orderStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as AlienDictVisualizer };
