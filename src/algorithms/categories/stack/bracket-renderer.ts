/**
 * 括号匹配可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 20：遇左括号压入对应右括号，遇右括号只需 O(1) 比对并弹出栈顶
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BRACKET_PROBLEM_HTML,
  BRACKET_ANALYSIS_HTML,
  BRACKET_CODE_LANGUAGES,
} from './bracket-problem-content';

export interface BracketStep {
  rawString: string;
  currentIndex: number;
  currentChar: string | null;
  stack: string[];
  matchedPairs: number;
  isValid: boolean;
  action: 'init' | 'push_expected' | 'match_pop' | 'mismatch' | 'done';
  message: string;
  codeLine: number;
}

export function buildBracketSteps(rawInput: string): BracketStep[] {
  const steps: BracketStep[] = [];
  const s = (rawInput || '()[]{}').trim();
  const n = s.length;

  if (n === 0) {
    steps.push({
      rawString: '',
      currentIndex: -1,
      currentChar: null,
      stack: [],
      matchedPairs: 0,
      isValid: true,
      action: 'done',
      message: '输入为空字符串，判定为有效括号',
      codeLine: 10,
    });
    return steps;
  }

  if (n % 2 !== 0) {
    steps.push({
      rawString: s,
      currentIndex: 0,
      currentChar: s[0],
      stack: [],
      matchedPairs: 0,
      isValid: false,
      action: 'mismatch',
      message: `❌ 长度为 ${n}（奇数），不可能成对闭合，直接判定为无效 (False)`,
      codeLine: 2,
    });
    return steps;
  }

  const stack: string[] = [];
  let matchedPairs = 0;

  steps.push({
    rawString: s,
    currentIndex: -1,
    currentChar: null,
    stack: [],
    matchedPairs: 0,
    isValid: true,
    action: 'init',
    message: `初始化：字符串长度 ${n}（偶数），准备从左往右扫描，使用「遇左压右」单调匹配策略`,
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    const c = s[i];

    if (c === '(') {
      stack.push(')');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左圆括号 '('，将期望的右括号 ')' 压入栈顶`,
        codeLine: 6,
      });
    } else if (c === '[') {
      stack.push(']');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左方括号 '['，将期望的右括号 ']' 压入栈顶`,
        codeLine: 7,
      });
    } else if (c === '{') {
      stack.push('}');
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'push_expected',
        message: `📥 遇到左花括号 '{'，将期望的右括号 '}' 压入栈顶`,
        codeLine: 8,
      });
    } else {
      if (stack.length === 0) {
        steps.push({
          rawString: s,
          currentIndex: i,
          currentChar: c,
          stack: [],
          matchedPairs,
          isValid: false,
          action: 'mismatch',
          message: `❌ 扫描到右括号 '${c}' 但栈已为空！右括号多于左括号，判定无效 (False)`,
          codeLine: 9,
        });
        return steps;
      }

      const expected = stack[stack.length - 1];
      if (expected !== c) {
        steps.push({
          rawString: s,
          currentIndex: i,
          currentChar: c,
          stack: [...stack],
          matchedPairs,
          isValid: false,
          action: 'mismatch',
          message: `❌ 括号类型不匹配：当前为 '${c}'，而栈顶期望闭合符为 '${expected}'，判定无效 (False)`,
          codeLine: 10,
        });
        return steps;
      }

      stack.pop();
      matchedPairs++;
      steps.push({
        rawString: s,
        currentIndex: i,
        currentChar: c,
        stack: [...stack],
        matchedPairs,
        isValid: true,
        action: 'match_pop',
        message: `✓ 成功闭合！'${c}' 与期望符吻合，弹出栈顶期望符，已闭合 ${matchedPairs} 对`,
        codeLine: 11,
      });
    }
  }

  const allMatched = stack.length === 0;
  steps.push({
    rawString: s,
    currentIndex: n,
    currentChar: null,
    stack: [...stack],
    matchedPairs,
    isValid: allMatched,
    action: allMatched ? 'done' : 'mismatch',
    message: allMatched
      ? `🎉 遍历结束！栈为空，全部括号完美闭合，判定为有效 (True)！`
      : `❌ 遍历结束但栈仍有剩余 [${stack.join(', ')}]，左括号多于右括号，判定无效 (False)`,
    codeLine: 14,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BracketStep>({
  id: 'bracket',
  name: '有效的括号',
  category: 'stack',
  icon: '🎯',
  badge: {
    mode: '遇左压右·栈匹配',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '🔤 字符串扫描与期望括号栈沙盘',
  card2Title: '🧭 括号匹配状态与决策监视器',
  card2Desc: '当前扫描字符、栈顶期望闭合符与匹配有效性判定',
  legend: [
    { label: '正在比对', color: '#10b981' },
    { label: '期望压栈', color: '#f59e0b' },
    { label: '失配报警', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-brackets',
      label: '括号序列',
      type: 'text',
      defaultValue: '()[]{}',
      width: '130px',
      placeholder: '如 ()[]{}',
    },
  ],
  presets: [
    { label: '简单成对', values: { 'input-brackets': '()[]{}' } },
    { label: '嵌套闭合', values: { 'input-brackets': '{[()]}' } },
    { label: '交叉失配', values: { 'input-brackets': '([)]' } },
    { label: '左多右少', values: { 'input-brackets': '((()' } },
  ],
  metrics: [
    { id: 'match-status', label: '有效性判定', color: '#10b981' },
    { id: 'matched-pairs', label: '已匹配对数', color: '#2563eb' },
    { id: 'stack-size', label: '栈内期望数', color: '#f59e0b' },
  ],
  codeLanguages: BRACKET_CODE_LANGUAGES,
  problemHtml: BRACKET_PROBLEM_HTML,
  analysisHtml: BRACKET_ANALYSIS_HTML,
  buildSteps: (inputs) => buildBracketSteps(inputs['input-brackets']),
  renderCanvas: (container, step) => {
    const s = step.rawString;
    const stack = step.stack;
    const curIdx = step.currentIndex;
    const isDone = step.action === 'done';
    const isMismatch = step.action === 'mismatch';

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
          bg = isMismatch ? '#fef2f2' : '#ecfdf5';
          border = isMismatch ? '#ef4444' : '#10b981';
          textColor = isMismatch ? '#ef4444' : '#047857';
        } else if (isProcessed) {
          bg = '#f8fafc';
          border = '#cbd5e1';
          textColor = '#64748b';
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="font-size: 8.5px; color: ${isCurrent ? '#059669' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
            <div style="width: 32px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              ${ch}
            </div>
          </div>
        `;
      })
      .join('');

    // 期望栈内展示
    const stackItemsHtml =
      stack.length === 0
        ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">栈空（全部已闭合）</span>'
        : stack
            .map(
              (expCh) => `
              <div style="padding: 2px 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #f59e0b; color: #b45309; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                ${expCh}
              </div>
            `
            )
            .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 12px; box-sizing: border-box; padding: 4px;">
        <!-- 待匹配字符串流 -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>🔤 待匹配括号序列 (字符串流):</span>
            <span style="color: #059669;">已闭合: ${step.matchedPairs} 对</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;">
            ${charsHtml}
          </div>
        </div>

        <div style="border-top: 1px dashed #e2e8f0; margin: 1px 0;"></div>

        <!-- 期望右括号栈 (扁平直排) -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 期望右括号栈 (栈底 → 栈顶):</span>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #d97706;">栈深: ${stack.length}</span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
            ${stackItemsHtml}
          </div>
        </div>
      </div>
    `;

    // 更新指标卡片
    const root = container.closest('#algo-bracket-view');
    if (root) {
      const statusEl = root.querySelector('#metric-match-status');
      const pairsEl = root.querySelector('#metric-matched-pairs');
      const stackSizeEl = root.querySelector('#metric-stack-size');

      if (statusEl) {
        statusEl.textContent = step.isValid ? (isDone ? '有效 (True)' : '匹配正常') : '无效 (False)';
        statusEl.style.color = step.isValid ? '#059669' : '#ef4444';
      }
      if (pairsEl) pairsEl.textContent = `${step.matchedPairs} 对`;
      if (stackSizeEl) stackSizeEl.textContent = `${step.stack.length}`;

      // 在 Card 2 中展示当前扫描字符与期望
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const topExpected = stack.length > 0 ? stack[stack.length - 1] : null;
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>当前扫描字符:</span>
              <strong style="font-family: monospace; color: #059669; font-size: 12px;">${step.currentChar !== null ? `'${step.currentChar}'` : '（无）'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>栈顶期望闭合符:</span>
              <strong style="font-family: monospace; color: #d97706; font-size: 12px;">${topExpected !== null ? `'${topExpected}'` : '（空）'}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'bracket',
  name: '有效的括号',
  viewId: 'algo-bracket-view',
  category: 'stack',
  description: '遇左括号压入对应右括号，遇右括号只需 O(1) 比对并弹出栈顶元素',
  icon: '🎯',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握经典栈匹配思想与“遇左压右”简化比对逻辑的巧妙设计技巧',
});
