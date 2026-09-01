/**
 * 前缀优化建图 (Prefix Optimization Graph) 声明式可视化器
 * 进阶图论: 2-SAT / 前缀点前向连边链、边数由 O(N^2) 压缩至 O(N)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PREFIX_OPT_CODE_LANGUAGES,
  PREFIX_OPT_PROBLEM_HTML,
  PREFIX_OPT_ANALYSIS_HTML,
} from './prefix-opt-graph-problem-content';

export interface PrefixOptStep {
  mode: 'naive' | 'prefix';
  numOriginalNodes: number;
  numPrefixNodes: number;
  numEdges: number;
  status: 'naive' | 'prefix' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildPrefixOptSteps(mode: 'naive' | 'prefix'): PrefixOptStep[] {
  const steps: PrefixOptStep[] = [];

  if (mode === 'naive') {
    steps.push({
      mode: 'naive',
      numOriginalNodes: 5,
      numPrefixNodes: 0,
      numEdges: 10,
      status: 'naive',
      message: '❌ [朴素建图] 节点 $u$ 向区间 $[1, r]$ 内所有节点连边，产生 $O(N^2)$ 条稠密冗余边 (5 个节点需 10 条边)！',
      log: '朴素建图：边数 O(N^2) 爆炸 (10 条边)',
      codeLine: [12, 18],
    });
  } else {
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: 9,
      status: 'prefix',
      message: '1. [构建前缀虚点链] 建立辅助前缀节点 $P_1, P_2, \\dots, P_n$，连接 $P_i \\to P_{i-1}$ 与 $P_i \\to u_i$。',
      log: '构建前缀前向优化虚点链 P1..P5',
      codeLine: [20, 26],
    });

    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: 10,
      status: 'query',
      message: '2. [区间连边优化] 节点 $u$ 向区间 $[1, 4]$ 连边时，只需单向连接 $u \\to P_4$，前缀链即可自动级联覆盖！',
      log: '向区间 [1..4] 连边 -> 仅需连接 1 条边 u -> P4',
      codeLine: [28, 34],
    });

    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: 10,
      status: 'done',
      message: '🎉 边数由 $O(N^2)$ 严格压缩至 $O(N)$ 线性阶！',
      log: '✓ 优化建图完成：总边数保持 O(N)',
      codeLine: 36,
    });
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PrefixOptStep>({
  id: 'prefix-opt-graph',
  name: '前缀优化建图 (Prefix Opt Graph)',
  viewId: 'algo-prefix-opt-graph-view',
  category: 'graph',
  icon: '🌐',
  badge: {
    mode: '前缀虚点链边数压缩',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🌐 原点与前缀虚点拓扑沙盘',
  card2Title: '🧭 边数对比与级联前向监视器',
  card2Desc: '前缀辅助节点 P_i、级联连边与边数压缩 O(N^2) -> O(N)',
  legend: [
    { label: '原图实体节点 (1..5)', color: '#0284c7' },
    { label: '⭐ 前缀辅助虚点 (P1..P5)', color: '#f59e0b' },
    { label: '前缀级联链', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-opt-mode',
      label: '建图模式',
      type: 'select',
      defaultValue: 'prefix',
      options: [
        { label: '⚡ 前缀优化建图 O(N)', value: 'prefix' },
        { label: '❌ 朴素两两连边 O(N^2)', value: 'naive' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '前缀优化建图 O(N)', values: { 'input-opt-mode': 'prefix' } },
    { label: '朴素两两连边 O(N^2)', values: { 'input-opt-mode': 'naive' } },
  ],
  metrics: [
    { id: 'metric-opt-mode', label: '建图方案', color: '#2563eb' },
    { id: 'metric-edge-count', label: '总边数', color: '#10b981' },
  ],
  codeLanguages: PREFIX_OPT_CODE_LANGUAGES,
  problemHtml: PREFIX_OPT_PROBLEM_HTML,
  analysisHtml: PREFIX_OPT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const mode = (inputs['input-opt-mode'] || 'prefix') as 'naive' | 'prefix';
    return buildPrefixOptSteps(mode);
  },
  renderCanvas: (container, step) => {
    const isPrefix = step.mode === 'prefix';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>

          ${
            isPrefix
              ? `
            <!-- 上方前缀虚点链 P1..P5 -->
            <line x1="270" y1="50" x2="210" y2="50" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-green)" />
            <line x1="210" y1="50" x2="150" y2="50" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-green)" />
            <line x1="150" y1="50" x2="90" y2="50" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-green)" />
            <line x1="90" y1="50" x2="30" y2="50" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-green)" />

            <!-- P_i -> u_i 下垂连边 -->
            <line x1="30" y1="50" x2="30" y2="150" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="90" y1="50" x2="90" y2="150" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="150" y1="50" x2="150" y2="150" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="210" y1="50" x2="210" y2="150" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="270" y1="50" x2="270" y2="150" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow-blue)" />

            <!-- P 节点 -->
            <g><circle cx="30" cy="50" r="12" fill="#f59e0b" /><text x="30" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P1</text></g>
            <g><circle cx="90" cy="50" r="12" fill="#f59e0b" /><text x="90" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P2</text></g>
            <g><circle cx="150" cy="50" r="12" fill="#f59e0b" /><text x="150" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P3</text></g>
            <g><circle cx="210" cy="50" r="12" fill="#f59e0b" /><text x="210" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P4</text></g>
            <g><circle cx="270" cy="50" r="12" fill="#f59e0b" /><text x="270" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P5</text></g>
          `
              : `
            <!-- 朴素全连接网 -->
            <line x1="150" y1="100" x2="30" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="150" y1="100" x2="90" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="150" y1="100" x2="150" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="150" y1="100" x2="210" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="150" y1="100" x2="270" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
          `
          }

          <!-- 下方实体节点 1..5 -->
          <g><circle cx="30" cy="150" r="13" fill="#0284c7" /><text x="30" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1</text></g>
          <g><circle cx="90" cy="150" r="13" fill="#0284c7" /><text x="90" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2</text></g>
          <g><circle cx="150" cy="150" r="13" fill="#0284c7" /><text x="150" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3</text></g>
          <g><circle cx="210" cy="150" r="13" fill="#0284c7" /><text x="210" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4</text></g>
          <g><circle cx="270" cy="150" r="13" fill="#0284c7" /><text x="270" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">5</text></g>
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          ${isPrefix ? '⭐ 前缀链 P_i ➔ P_{i-1} 级联传递，连向 P_r 等价于连向 [1, r] 内所有实体节点' : '❌ 朴素两两连边：每多一个区间连边就新增 O(N) 条边，极易触发 MLE/TLE'}
        </div>
      </div>
    `;

    const root = container.closest('#algo-prefix-opt-graph-view');
    if (root) {
      const modeEl = root.querySelector('#metric-opt-mode');
      const edgeEl = root.querySelector('#metric-edge-count');

      if (modeEl) modeEl.textContent = isPrefix ? '前缀优化建图' : '朴素稠密建图';
      if (edgeEl) edgeEl.textContent = `${step.numEdges} 条边`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 建图复杂度压缩:</span>
              <strong style="font-family: monospace; color: #2563eb;">O(N²) ➔ O(N) 线性边数</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'prefix-opt-graph',
  name: '前缀优化建图 (Prefix Opt Graph)',
  viewId: 'algo-prefix-opt-graph-view',
  category: 'graph',
  description: '进阶图论建图优化：前缀虚点链级联传递、区间连边由 O(N^2) 稠密压缩至 O(N) 线性边数 (2-SAT 优化)',
  icon: '🌐',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 69,
  learningGoal: '掌握前缀优化建图的虚点级联构造法、2-SAT 命题前缀约束与边数线性压缩技巧',
});

export { Visualizer as PrefixOptGraphVisualizer };
