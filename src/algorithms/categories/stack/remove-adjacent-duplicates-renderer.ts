/**
 * 删除字符串中的所有相邻重复项可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 1047：栈顶即当前前驱，遇到相同字符直接出栈消除，形成自然连锁反应
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  REMOVE_ADJACENT_DUPLICATES_PROBLEM_HTML,
  REMOVE_ADJACENT_DUPLICATES_ANALYSIS_HTML,
  REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES,
} from './remove-adjacent-duplicates-problem-content';

export interface RADStep {
  rawString: string;
  currentIndex: number;
  currentChar: string | null;
  stack: string[];
  eliminatedPairs: number;
  eliminatedChar: string | null;
  currentString: string;
  action: 'init' | 'scan' | 'eliminate' | 'push' | 'done';
  message: string;
  codeLine: number;
}

export function buildRemoveAdjacentDuplicatesSteps(rawInput: string): RADStep[] {
  const steps: RADStep[] = [];
  const s = (rawInput || 'abbaca').trim();
  const n = s.length;

  if (n === 0) {
    steps.push({
      rawString: '',
      currentIndex: -1,
      currentChar: null,
      stack: [],
      eliminatedPairs: 0,
      eliminatedChar: null,
      currentString: '',
      action: 'done',
      message: '输入为空字符串，化简结果为空',
      codeLine: 8,
    });
    return steps;
  }

  const stack: string[] = [];
  let eliminatedPairs = 0;

  steps.push({
    rawString: s,
    currentIndex: -1,
    currentChar: null,
    stack: [],
    eliminatedPairs: 0,
    eliminatedChar: null,
    currentString: '',
    action: 'init',
    message: `初始化：输入字符串 "${s}" (长度 ${n})，准备从左向右扫描，利用栈顶作为相邻前驱对消重复项`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const ch = s[i];

    if (stack.length > 0 && stack[stack.length - 1] === ch) {
      const popped = stack.pop()!;
      eliminatedPairs++;

      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: ch,
        stack: [...stack],
        eliminatedPairs,
        eliminatedChar: ch,
        currentString: stack.join(''),
        action: 'eliminate',
        message: `💥 触发相邻对消！当前字符 '${ch}' 与栈顶 '${popped}' 相同，双双抵消！已消除 ${eliminatedPairs} 对，当前结果: "${stack.join('')}"`,
        codeLine: 4,
      });
    } else {
      stack.push(ch);

      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: ch,
        stack: [...stack],
        eliminatedPairs,
        eliminatedChar: null,
        currentString: stack.join(''),
        action: 'push',
        message: `📥 字符 '${ch}' 与栈顶不重复，压入栈顶暂存。当前栈: "${stack.join('')}"`,
        codeLine: 6,
      });
    }
  }

  const resStr = stack.join('');
  steps.push({
    rawString: s,
    currentIndex: n,
    currentChar: null,
    stack: [...stack],
    eliminatedPairs,
    eliminatedChar: null,
    currentString: resStr,
    action: 'done',
    message: `🎉 字符串扫描完毕！共对消 ${eliminatedPairs} 对相邻重复项，最终化简结果为: "${resStr || '(空)'}"`,
    codeLine: 8,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<RADStep>({
  id: 'remove-adjacent-duplicates',
  name: '删除相邻重复项',
  category: 'stack',
  icon: '✨',
  badge: {
    mode: '栈消消乐·相邻对消',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '🔤 字符串扫描与相邻对消栈沙盘',
  card2Title: '🧭 对消决策与化简状态监视器',
  card2Desc: '当前扫描字符、栈顶前驱与实时化简结果',
  legend: [
    { label: '正在扫描', color: '#9333ea' },
    { label: '对消消除', color: '#ef4444' },
    { label: '入栈暂存', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-str',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'abbaca',
      width: '130px',
      placeholder: '如 abbaca',
    },
  ],
  presets: [
    { label: '经典示例', values: { 'input-str': 'abbaca' } },
    { label: '连续连锁消除', values: { 'input-str': 'azxxzy' } },
    { label: '全消除对称串', values: { 'input-str': 'abba' } },
    { label: '无重复串', values: { 'input-str': 'abcdef' } },
  ],
  metrics: [
    { id: 'cur-result', label: '当前化简结果', color: '#9333ea' },
    { id: 'eliminated-pairs', label: '已消除对数', color: '#ef4444' },
    { id: 'stack-size', label: '栈内保留字符', color: '#3b82f6' },
  ],
  codeLanguages: REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES,
  problemHtml: REMOVE_ADJACENT_DUPLICATES_PROBLEM_HTML,
  analysisHtml: REMOVE_ADJACENT_DUPLICATES_ANALYSIS_HTML,
  buildSteps: (inputs) => buildRemoveAdjacentDuplicatesSteps(inputs['input-str']),
  renderCanvas: (container, step) => {
    const s = step.rawString;
    const stack = step.stack;
    const curIdx = step.currentIndex;
    const isDone = step.action === 'done';
    const isEliminate = step.action === 'eliminate';

    // 字符串序列展示
    const charsHtml = s
      .split('')
      .map((ch, idx) => {
        const isCurrent = idx === curIdx && !isDone;
        const isProcessed = idx < curIdx || (isDone && idx <= curIdx);
        let bg = '#ffffff';
        let border = '#e2e8f0';
        let textColor = '#0f172a';

        if (isCurrent) {
          bg = isEliminate ? '#fef2f2' : '#faf5ff';
          border = isEliminate ? '#ef4444' : '#9333ea';
          textColor = isEliminate ? '#ef4444' : '#7e22ce';
        } else if (isProcessed) {
          bg = '#f8fafc';
          border = '#cbd5e1';
          textColor = '#64748b';
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="font-size: 8.5px; color: ${isCurrent ? '#9333ea' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
            <div style="width: 32px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              ${ch}
            </div>
          </div>
        `;
      })
      .join('');

    // 栈内展示 (扁平排布)
    const stackItemsHtml =
      stack.length === 0
        ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">栈空</span>'
        : stack
            .map(
              (ch) => `
              <div style="padding: 2px 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #9333ea; color: #7e22ce; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                ${ch}
              </div>
            `
            )
            .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 12px; box-sizing: border-box; padding: 4px;">
        <!-- 待处理字符串序列 -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>🔤 待处理字符串序列 (从左至右扫描):</span>
            <span style="color: #ef4444;">已对消: ${step.eliminatedPairs} 对</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;">
            ${charsHtml}
          </div>
        </div>

        <div style="border-top: 1px dashed #e2e8f0; margin: 1px 0;"></div>

        <!-- 栈内保留字符 (扁平直排) -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 栈内保留字符 (栈底 → 栈顶):</span>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #9333ea;">当前长度: ${stack.length}</span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
            ${stackItemsHtml}
          </div>
        </div>
      </div>
    `;

    // 更新指标卡片
    const root = container.closest('#algo-remove-adjacent-duplicates-view');
    if (root) {
      const resultEl = root.querySelector('#metric-cur-result');
      const pairsEl = root.querySelector('#metric-eliminated-pairs');
      const stackSizeEl = root.querySelector('#metric-stack-size');

      if (resultEl) resultEl.textContent = step.currentString ? `"${step.currentString}"` : '(空)';
      if (pairsEl) pairsEl.textContent = `${step.eliminatedPairs} 对`;
      if (stackSizeEl) stackSizeEl.textContent = `${step.stack.length}`;

      // 在 Card 2 中展示当前扫描与栈顶前驱
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const topCh = stack.length > 0 ? stack[stack.length - 1] : null;
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>当前扫描字符:</span>
              <strong style="font-family: monospace; color: #9333ea; font-size: 12px;">${step.currentChar !== null ? `'${step.currentChar}'` : '（结束）'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>当前栈顶前驱:</span>
              <strong style="font-family: monospace; color: #d97706; font-size: 12px;">${topCh !== null ? `'${topCh}'` : '（栈空）'}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'remove-adjacent-duplicates',
  name: '删除相邻重复项',
  viewId: 'algo-remove-adjacent-duplicates-view',
  category: 'stack',
  description: '栈消消乐模型：栈顶即当前前驱，遇到相同字符直接出栈对消，形成连锁反应',
  icon: '✨',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解栈在消除相邻元素中的经典应用，掌握利用栈顶作为动态前驱消除递归连锁重复项的设计范式',
});
