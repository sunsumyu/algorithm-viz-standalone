/**
 * 火星词典拓扑排序 (Alien Dictionary - LeetCode 269 / 左程云 Class 060 题目4) 声明式可视化器
 * 核心：字典序首个不同字符提取有向偏序关系、入度统计与拓扑排序、非法前缀与环检测
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  ALIEN_DICT_CODE_LANGUAGES,
  ALIEN_DICT_PROBLEM_HTML,
  ALIEN_DICT_ANALYSIS_HTML,
} from './alien-dict-problem-content';

export interface AlienStep {
  wordList: string[];
  edges: Array<[string, string]>;
  inDegrees: Record<string, number>;
  topoOrder: string[];
  status: 'extract' | 'topo' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildAlienDictSteps(): AlienStep[] {
  const steps: AlienStep[] = [];

  steps.push({
    wordList: ['wrt', 'wrf', 'er', 'ett', 'rftt'],
    edges: [
      ['t', 'f'],
      ['w', 'e'],
      ['r', 't'],
      ['e', 'r'],
    ],
    inDegrees: { w: 0, e: 1, r: 1, t: 1, f: 1 },
    topoOrder: [],
    status: 'extract',
    message: '1. [相邻单词前缀比对提取字符偏序] "wrt" vs "wrf" ➔ t➔f；"wrt" vs "er" ➔ w➔e；"er" vs "ett" ➔ r➔t；"ett" vs "rftt" ➔ e➔r！',
    log: '提取有向偏序边：t➔f, w➔e, r➔t, e➔r',
    codeLine: [18, 26],
  });

  steps.push({
    wordList: ['wrt', 'wrf', 'er', 'ett', 'rftt'],
    edges: [
      ['t', 'f'],
      ['w', 'e'],
      ['r', 't'],
      ['e', 'r'],
    ],
    inDegrees: { w: 0, e: 0, r: 0, t: 0, f: 0 },
    topoOrder: ['w', 'e', 'r', 't', 'f'],
    status: 'done',
    message: '🎉 [Kahn 拓扑排序完成] 入度为 0 的唯一序列出队：w ➔ e ➔ r ➔ t ➔ f！火星字符全序为 "wertf"！',
    log: '✓ 拓扑排序完成：火星字符顺序 = "wertf"',
    codeLine: [28, 36],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<AlienStep>({
  id: 'alien-dict',
  name: '火星词典拓扑排序 (Alien Dictionary)',
  category: 'graph',
  icon: '👽',
  badge: {
    mode: '相邻前缀比对 + Kahn 拓扑',
    complexity: 'O(C + V + E) · O(V + E)',
  },
  card1Title: '👽 词典前缀提取与字符有向图沙盘',
  card2Title: '🧭 字符入度 inDegree 与全序结果监视器',
  card2Desc: '首个不同字符偏序提取、入度表与 Kahn 队列拓扑排序',
  legend: [
    { label: '火星文字节点 (w, e, r, t, f)', color: '#0284c7' },
    { label: '🟢 偏序有向边 (u ➔ v)', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '5 单词经典火星文 (LeetCode 269)', values: {} },
  ],
  metrics: [
    { id: 'metric-alien-chars', label: '涉及字符数', color: '#2563eb' },
    { id: 'metric-alien-order', label: '火星字典全序', color: '#10b981' },
  ],
  codeLanguages: ALIEN_DICT_CODE_LANGUAGES,
  problemHtml: ALIEN_DICT_PROBLEM_HTML,
  analysisHtml: ALIEN_DICT_ANALYSIS_HTML,
  buildSteps: () => buildAlienDictSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      w: { x: 45, y: 110 },
      e: { x: 105, y: 110 },
      r: { x: 165, y: 110 },
      t: { x: 225, y: 110 },
      f: { x: 285, y: 110 },
    };

    const svgEdges = step.edges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-alien)" />`;
      })
      .join('');

    const nodes = ['w', 'e', 'r', 't', 'f'];
    const svgNodes = nodes
      .map((ch) => {
        const p = nodeCoords[ch];
        if (!p) return '';
        const inDeg = step.inDegrees[ch] || 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="#0369a1" stroke="#38bdf8" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="12" font-weight="800" font-family="monospace" text-anchor="middle">${ch}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">in:${inDeg}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 320 200">
          <defs>
            <marker id="arrow-alien" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色连线为字符偏序有向边 | 拓扑排序唯一解："wertf"
        </div>
      </div>
    `;

    const root = container.closest('#algo-alien-dict-view');
    if (root) {
      const cEl = root.querySelector('#metric-alien-chars');
      const oEl = root.querySelector('#metric-alien-order');

      if (cEl) cEl.textContent = '5 个字符';
      if (oEl) oEl.textContent = step.topoOrder.length > 0 ? `"${step.topoOrder.join('')}"` : '推导中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 词典偏序建图规则:</span>
              <strong style="font-family: monospace; color: #2563eb;">比对相邻两词，首个不同字符 s[k] != t[k] 产生单向偏序边 s[k] ➔ t[k]</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'alien-dict',
  name: '火星词典拓扑排序 (Alien Dictionary)',
  viewId: 'algo-alien-dict-view',
  category: 'graph',
  description: '左程云算法通关课 Class 060 题目4：相邻字符串前缀首异字符建偏序有向图、Kahn 入度拓扑排序与非法前缀环检测 (LeetCode 269)',
  icon: '👽',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 26,
  learningGoal: '掌握字典序相邻比较提取拓扑偏序的算法模型、非法前缀判错及有向环检测',
});

export { Visualizer as AlienDictVisualizer };
