/**
 * 单词搜索 (LeetCode 79) - Canvas Adapter
 * 表现层渲染适配器：网格沙盘渲染、回溯现场追踪、剪枝监视器与 Stage 4-Card 装配
 */

import { renderRecursionCard1 } from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-shared';
import { renderUniversalDpGrid } from '../../../algorithms/categories/dynamic-programming/dp-shared';
import {
  WORD_SEARCH_STAGE1_CODE_LANGUAGES,
  WORD_SEARCH_STAGE2_CODE_LANGUAGES,
  WORD_SEARCH_STAGE3_CODE_LANGUAGES,
  WORD_SEARCH_STAGE4_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-stage-codes';
import {
  buildWordSearchStage1Steps,
  buildWordSearchStage2Steps,
  buildWordSearchStage3Steps,
  buildWordSearchStage4Steps,
  type WordSearchStep,
} from './word-search-step-compiler';

export function renderBoardGrid(
  container: HTMLElement,
  board: string[][],
  activeI: number,
  activeJ: number,
  path: Array<[number, number]>
): void {
  if (!container) return;
  const rows = board.length;
  const cols = board[0]?.length || 0;

  const displayGrid = board.map((row) =>
    row.map((char) => (char === '#' ? '🚫' : char))
  );

  const activeStack = path.map(([pr, pc]) => `${pr},${pc}`);

  renderUniversalDpGrid(container, {
    title: `🔤 字母网格看板: ${rows} × ${cols}`,
    badgeText: `已锁定路径: ${path.length} 步`,
    subTitle: activeI >= 0 && activeJ >= 0 ? `当前光标 (${activeI}, ${activeJ})` : undefined,
    grid: displayGrid,
    activeI,
    activeJ,
    activeStack,
    rowLabels: Array.from({ length: rows }, (_, r) => `r${r}`),
    colLabels: Array.from({ length: cols }, (_, c) => `c${c}`),
    legend: [
      { label: '探险家 🤠', color: '#2563eb' },
      { label: '回溯路径 👣', color: '#0284c7' },
      { label: '网格字符', color: '#059669' },
    ],
    modelId: 'word-search',
  });
}

export function renderPruneDashboard(container: HTMLElement, step: WordSearchStep): void {
  if (!container) return;
  const origWord = step.originalWord || step.word;
  const isReversed = Boolean(step.wordReversed || (step.originalWord && step.originalWord !== step.word));

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      box-sizing: border-box;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 600; color: #64748b;">用户输入原目标:</span>
          <span style="font-size: 12px; font-weight: 700; color: #1e293b; font-family: 'JetBrains Mono', monospace;">"${origWord}"</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 5px; border-top: 1px dashed #e2e8f0;">
          <span style="font-size: 11px; font-weight: 600; color: ${isReversed ? '#d97706' : '#059669'};">
            ${isReversed ? '⚡ 启发式倒序优化 (尾频更少 ➔ 倒序搜索):' : '✨ 实际搜索匹配序列 (保持正序):'}
          </span>
          <span style="font-size: 13px; font-weight: 800; color: ${isReversed ? '#d97706' : '#059669'}; font-family: 'JetBrains Mono', monospace;">"${step.word}"</span>
        </div>
      </div>

      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <div style="font-size: 11px; font-weight: 700; color: #2563eb;">🎯 搜索动态决策与启发式分析</div>
        <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.4;">${step.decision}</div>
        <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-top: 2px;">${step.message}</div>
      </div>
    </div>
  `;
}

export function createWordSearchStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力回溯',
      shortName: '回溯',
      num: 1,
      timeBadge: 'O(M×N×4^L)',
      theme: 'bg-blue',
      badge: {
        mode: '回溯搜索 · 深度优先',
        complexity: 'O(M×N×4^L) · O(L)',
      },
      primaryVisual: {
        title: '🔤 字符网格与搜索路径地图',
        render: (container: HTMLElement, step: WordSearchStep) => {
          renderBoardGrid(container, step.board, step.i, step.j, step.path);
        },
      },
      auxiliaryVisual: {
        title: '📚 DFS 递归调用栈与状态',
        desc: '基于 DFS 回溯搜索，按上下左右探查匹配单词字符',
        render: (container: HTMLElement, step: WordSearchStep) => {
          renderRecursionCard1(
            container,
            `dfs(${step.i}, ${step.j}, k=${step.k})`,
            step.callStack || [],
            `<div style="font-size:12px; font-weight:700; color:#0f172a;">${step.decision}</div>
             <div style="font-size:11px; color:#64748b; margin-top:3px;">${step.message}</div>`
          );
        },
      },
      legend: [
        { label: '当前探查', color: '#3b82f6' },
        { label: '已匹配路径', color: '#10b981' },
        { label: '待探查字符', color: '#94a3b8' },
      ],
      codeLanguages: WORD_SEARCH_STAGE1_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage1Steps,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化反例剖析',
      shortName: '无后效性反例',
      num: 2,
      timeBadge: '破坏无后效性',
      theme: 'bg-red',
      badge: {
        mode: 'DP 反例教学 · 无后效性',
        complexity: '无法转 DP',
      },
      primaryVisual: {
        title: '🔤 字符网格与状态冲突点',
        render: (container: HTMLElement, step: WordSearchStep) => {
          renderBoardGrid(container, step.board, step.i, step.j, step.path);
        },
      },
      auxiliaryVisual: {
        title: '⚠️ 无后效性破坏反例剖析',
        desc: '阐释动态规划的前提假设，辨析为什么本题无法转为记忆化/DP',
        render: (container: HTMLElement, step: WordSearchStep) => {
          container.innerHTML = `
            <div style="padding:4px; display:flex; flex-direction:column; gap:8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height:100%; box-sizing:border-box; overflow-y:auto;">
              <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 14px;">
                <div style="font-size:12.5px; font-weight:800; color:#b91c1c;">${step.decision}</div>
                <div style="font-size:11px; color:#991b1b; margin-top:4px; line-height:1.5;">${step.message}</div>
              </div>
              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 14px; font-size:11px; color:#1e3a8a; line-height:1.6; flex:1;">
                <b style="color:#1d4ed8; font-size:11.5px;">💡 左程云核心语录：</b><br/>
                “动态规划能成立的前提是【无后效性】。如果以后的过程还要受到【之前具体怎么走过来的】影响，这就叫有后效性。单词搜索中哪些格子被用过了，就是最典型的后效性！”
              </div>
            </div>
          `;
        },
      },
      legend: [
        { label: '状态冲突', color: '#ef4444' },
        { label: '当前探查', color: '#3b82f6' },
        { label: '未走字符', color: '#94a3b8' },
      ],
      codeLanguages: WORD_SEARCH_STAGE3_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage2Steps,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 原地现场恢复',
      shortName: '现场恢复',
      num: 3,
      timeBadge: 'O(M×N×3^L)',
      theme: 'bg-emerald',
      badge: {
        mode: '原地回溯 · 0 额外空间标记',
        complexity: 'O(M×N×3^L) · O(L) 栈深',
      },
      primaryVisual: {
        title: '🔤 字符网格与回溯状态',
        render: (container: HTMLElement, step: WordSearchStep) => {
          renderBoardGrid(container, step.board, step.i, step.j, step.path);
        },
      },
      auxiliaryVisual: {
        title: '🔄 原地标记与回溯现场还原',
        desc: '将访问过的格子临时改为 # 占位，递归退出时恢复原字符',
        render: (container: HTMLElement, step: WordSearchStep) => {
          renderRecursionCard1(
            container,
            `dfs(${step.i}, ${step.j}, k=${step.k})`,
            step.callStack || [],
            `<div style="font-size:12px; font-weight:700; color:#0f172a;">${step.decision}</div>
             <div style="font-size:11px; color:#64748b; margin-top:3px;">${step.message}</div>`
          );
        },
      },
      legend: [
        { label: '当前探查', color: '#3b82f6' },
        { label: '标记走过', color: '#f59e0b' },
        { label: '现场恢复', color: '#10b981' },
      ],
      codeLanguages: WORD_SEARCH_STAGE2_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage3Steps,
    },
    {
      id: 'stage-4',
      name: '阶段 4: 首尾词频剪枝优化',
      shortName: '词频优化',
      num: 4,
      timeBadge: '最优剪枝',
      theme: 'bg-amber',
      badge: {
        mode: '启发式频次统计 · 首尾翻转',
        complexity: '大幅剪除无效搜索分支',
      },
      primaryVisual: {
        title: '🔤 字符网格与路径跟踪',
        render: (container: HTMLElement, step: WordSearchStep) => {
          renderBoardGrid(container, step.board, step.i, step.j, step.path);
        },
      },
      auxiliaryVisual: {
        title: '📈 首尾词频启发式剪枝监控',
        desc: '统计目标单词首尾字符在网格中的出现频次，反转搜索起点降低分支数',
        render: (container: HTMLElement, step: WordSearchStep) => {
          renderPruneDashboard(container, step);
        },
      },
      legend: [
        { label: '当前探查', color: '#3b82f6' },
        { label: '已匹配路径', color: '#10b981' },
        { label: '首尾剪枝', color: '#f59e0b' },
      ],
      codeLanguages: WORD_SEARCH_STAGE4_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage4Steps,
    },
  ];
}
