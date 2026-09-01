/**
 * 双向广度优先搜索 (Bidirectional BFS - 单词接龙 LeetCode 127) 声明式可视化器
 * 核心：起点与终点双端交替扩展、优先扩展规模较小队列、两端相遇终止、搜索空间由 b^d 降为 2*b^(d/2)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BI_BFS_CODE_LANGUAGES,
  BI_BFS_PROBLEM_HTML,
  BI_BFS_ANALYSIS_HTML,
} from './bi-bfs-problem-content';

export interface BiBFSStep {
  forwardVisited: string[];
  backwardVisited: string[];
  curWord: string;
  meetWord: string | null;
  stepCount: number;
  status: 'init' | 'forward' | 'backward' | 'meet' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBiBFSSteps(): BiBFSStep[] {
  const steps: BiBFSStep[] = [];

  steps.push({
    forwardVisited: ['hit'],
    backwardVisited: ['cog'],
    curWord: 'hit',
    meetWord: null,
    stepCount: 1,
    status: 'init',
    message: '1. [双端初始化] 正向从 "hit" 出发，反向从 "cog" 出发，两端队列大小均为 1！',
    log: '初始化：Forward={"hit"}, Backward={"cog"}',
    codeLine: [18, 25],
  });

  steps.push({
    forwardVisited: ['hit', 'hot'],
    backwardVisited: ['cog'],
    curWord: 'hot',
    meetWord: null,
    stepCount: 2,
    status: 'forward',
    message: '2. [正向扩展 1 层] "hit" 变换 1 字符扩展到 "hot"，正向集合变为 {"hot"}！',
    log: '正向扩展：hit ➔ hot',
    codeLine: [28, 36],
  });

  steps.push({
    forwardVisited: ['hit', 'hot'],
    backwardVisited: ['cog', 'dog', 'log'],
    curWord: 'dog',
    meetWord: null,
    stepCount: 3,
    status: 'backward',
    message: '3. [反向扩展 1 层] "cog" 变换 1 字符扩展到 "dog" 与 "log"，反向集合为 {"dog", "log"}！',
    log: '反向扩展：cog ➔ dog, log',
    codeLine: [28, 36],
  });

  steps.push({
    forwardVisited: ['hit', 'hot', 'dot', 'lot'],
    backwardVisited: ['cog', 'dog', 'log'],
    curWord: 'dot',
    meetWord: 'dot',
    stepCount: 5,
    status: 'done',
    message: '🎉 [两端相交于 "dot"] 正向 "hot" 扩展出 "dot"，命中反向集合（"dog" 亦可达 "dot"）！最短转换序列长度 = 5！',
    log: '✓ 双向 BFS 相遇于 "dot"：最短转换序列长度 = 5',
    codeLine: [38, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BiBFSStep>({
  id: 'bi-bfs',
  name: '双向广度优先搜索 (Bi-directional BFS)',
  category: 'graph',
  icon: '↔️',
  badge: {
    mode: '双端交替扩展 b^(d/2)',
    complexity: 'O(2 · B^(d/2)) · O(B^(d/2))',
  },
  card1Title: '↔️ 单词状态图与双端交替扩散沙盘',
  card2Title: '🧭 正向/反向队列与相遇判定监视器',
  card2Desc: '正向集合 Forward、反向集合 Backward 与相交中继词',
  legend: [
    { label: '正向探索词 (Forward)', color: '#0284c7' },
    { label: '反向探索词 (Backward)', color: '#ec4899' },
    { label: '🟢 双向相遇中继词', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: 'hit -> cog 经典单词接龙 (LeetCode 127)', values: {} },
  ],
  metrics: [
    { id: 'metric-bibfs-step', label: '最短接龙步数', color: '#10b981' },
    { id: 'metric-bibfs-meet', label: '双端相遇中继词', color: '#2563eb' },
  ],
  codeLanguages: BI_BFS_CODE_LANGUAGES,
  problemHtml: BI_BFS_PROBLEM_HTML,
  analysisHtml: BI_BFS_ANALYSIS_HTML,
  buildSteps: () => buildBiBFSSteps(),
  renderCanvas: (container, step) => {
    const words: Record<string, { x: number; y: number }> = {
      hit: { x: 50, y: 110 },
      hot: { x: 110, y: 110 },
      dot: { x: 170, y: 70 },
      lot: { x: 170, y: 150 },
      dog: { x: 230, y: 70 },
      log: { x: 230, y: 150 },
      cog: { x: 290, y: 110 },
    };

    const edges = [
      { u: 'hit', v: 'hot' },
      { u: 'hot', v: 'dot' },
      { u: 'hot', v: 'lot' },
      { u: 'dot', v: 'dog' },
      { u: 'lot', v: 'log' },
      { u: 'dog', v: 'cog' },
      { u: 'log', v: 'cog' },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = words[e.u];
        const p2 = words[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" />`;
      })
      .join('');

    const svgNodes = Object.entries(words)
      .map(([w, p]) => {
        const inFwd = step.forwardVisited.includes(w);
        const inBwd = step.backwardVisited.includes(w);
        const isMeet = step.meetWord === w;
        const bg = isMeet ? '#065f46' : inFwd ? '#0369a1' : inBwd ? '#db2777' : '#1e293b';
        const border = isMeet ? '#10b981' : inFwd ? '#38bdf8' : inBwd ? '#f472b6' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isMeet ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${w}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 340 210">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🔵 蓝色为正向队列 | 🌸 粉色为反向队列 | 🟢 绿色为双端相遇中继词
        </div>
      </div>
    `;

    const root = container.closest('#algo-bi-bfs-view');
    if (root) {
      const sEl = root.querySelector('#metric-bibfs-step');
      const mEl = root.querySelector('#metric-bibfs-meet');

      if (sEl) sEl.textContent = `${step.stepCount} 步`;
      if (mEl) mEl.textContent = step.meetWord ? `"${step.meetWord}"` : '搜索中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 双向搜索剪枝定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">每次挑两端中规模较小的一侧单步扩展，搜索空间由 b^d 降低到 2·b^(d/2)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'bi-bfs',
  name: '双向广度优先搜索 (Bi-directional BFS)',
  viewId: 'algo-bi-bfs-view',
  category: 'graph',
  description: '经典搜索剪枝优化：双端起点终点同时交替扩展、优先扩展小队列、状态交汇立即返回最优解 (LeetCode 127 单词接龙)',
  icon: '↔️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 24,
  learningGoal: '掌握双向 BFS 的小集合优先扩展技巧、哈希表相交判定及指数级搜索剪枝原理',
});

export { Visualizer as BiBFSVisualizer };
