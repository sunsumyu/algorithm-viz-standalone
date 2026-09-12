/**
 * 翻转字符串里的单词可视化器 — 声明式 4-Card 标准架构
 * LeetCode 151：三步原地反转法
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REVERSE_WORDS_PROBLEM_HTML,
  REVERSE_WORDS_ANALYSIS_HTML,
  REVERSE_WORDS_CODE_LANGUAGES,
} from './reverse-words-problem-content';

export interface ReverseWordsStep {
  chars: string[];
  stage: 1 | 2 | 3;
  left: number;
  right: number;
  wordStart?: number;
  wordEnd?: number;
  swapping: boolean;
  phase: 'clean-spaces' | 'reverse-all' | 'reverse-words' | 'done';
  status: 'clean-spaces' | 'reverse-all' | 'reverse-words' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildReverseWordsSteps(inputStr: string): ReverseWordsStep[] {
  const steps: ReverseWordsStep[] = [];

  // Step 1: 移除多余空格
  const cleanedWords = inputStr.trim().split(/\s+/).filter(Boolean);
  const cleanedStr = cleanedWords.join(' ');
  const chars = cleanedStr.split('');

  steps.push({
    chars: inputStr.split(''),
    stage: 1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'clean-spaces',
    status: 'clean-spaces',
    message: `第 1 步：清除多余空格。原字符串 "${inputStr}" 清理前导、尾随及单词间连续空格。`,
    log: `清理空格: "${inputStr}" -> "${cleanedStr}"`,
    codeLine: 3,
  });

  steps.push({
    chars: [...chars],
    stage: 1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'clean-spaces',
    status: 'clean-spaces',
    message: `第 1 步完成：得到紧凑字符数组 "${cleanedStr}" (有效长度 ${chars.length})。`,
    log: `紧凑数组就绪 (长度 ${chars.length})`,
    codeLine: 3,
  });

  // Step 2: 反转整个字符串
  let left = 0;
  let right = chars.length - 1;

  steps.push({
    chars: [...chars],
    stage: 2,
    left,
    right,
    swapping: false,
    phase: 'reverse-all',
    status: 'reverse-all',
    message: `第 2 步：反转整个字符串。从 left = 0 到 right = ${right} 对撞反转。`,
    log: `开始整体反转 [0, ${right}]`,
    codeLine: 5,
  });

  while (left < right) {
    const temp = chars[left];
    chars[left] = chars[right];
    chars[right] = temp;

    steps.push({
      chars: [...chars],
      stage: 2,
      left,
      right,
      swapping: true,
      phase: 'reverse-all',
      status: 'reverse-all',
      message: `整体反转中：交换 chars[${left}] <-> chars[${right}] ('${temp}' <-> '${chars[left]}')。`,
      log: `交换 [${left}] <-> [${right}]`,
      codeLine: 5,
    });

    left++;
    right--;
  }

  steps.push({
    chars: [...chars],
    stage: 2,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'reverse-all',
    status: 'reverse-all',
    message: `第 2 步完成：整体反转后为 "${chars.join('')}" (单词顺序已倒序，但单词内部字母也是倒的)。`,
    log: `整体反转完成: "${chars.join('')}"`,
    codeLine: 5,
  });

  // Step 3: 逐个单词反转
  let wordStart = 0;
  const n = chars.length;

  for (let i = 0; i <= n; i++) {
    if (i === n || chars[i] === ' ') {
      let wLeft = wordStart;
      let wRight = i - 1;
      const currentWordBefore = chars.slice(wLeft, wRight + 1).join('');

      steps.push({
        chars: [...chars],
        stage: 3,
        left: wLeft,
        right: wRight,
        wordStart: wLeft,
        wordEnd: wRight,
        swapping: false,
        phase: 'reverse-words',
        status: 'reverse-words',
        message: `第 3 步：锁定倒序单词 "${currentWordBefore}" 区间 [${wLeft}, ${wRight}]，准备局部反转恢复正常语序。`,
        log: `锁定单词区间 [${wLeft}, ${wRight}] ("${currentWordBefore}")`,
        codeLine: 7,
      });

      while (wLeft < wRight) {
        const temp = chars[wLeft];
        chars[wLeft] = chars[wRight];
        chars[wRight] = temp;

        steps.push({
          chars: [...chars],
          stage: 3,
          left: wLeft,
          right: wRight,
          wordStart,
          wordEnd: i - 1,
          swapping: true,
          phase: 'reverse-words',
          status: 'reverse-words',
          message: `单词内部交换：chars[${wLeft}] <-> chars[${wRight}] ('${temp}' <-> '${chars[wLeft]}')。`,
          log: `单词内交换 [${wLeft}] <-> [${wRight}]`,
          codeLine: 7,
        });

        wLeft++;
        wRight--;
      }

      wordStart = i + 1;
    }
  }

  steps.push({
    chars: [...chars],
    stage: 3,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 三步反转全部完成！最终翻转单词字符串为 "${chars.join('')}"。`,
    log: `✓ 求解完成: "${chars.join('')}"`,
    codeLine: 8,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ReverseWordsStep[]): ReverseWordsStep[] {
  const phaseMap: Record<string, string> = {
    'clean-spaces': 'Step 1: 去空格',
    'reverse-all': 'Step 2: 整体反转',
    'reverse-words': 'Step 3: 单词反转',
    done: '完成',
  };
  return steps.map((s) => {
    let action = '三步反转完成';
    if (s.phase === 'clean-spaces') action = 'removeExtraSpaces(s)';
    else if (s.phase === 'reverse-all') action = 'reverse(s, 0, n - 1)';
    else if (s.phase === 'reverse-words')
      action = `reverseEachWord(s, [${s.wordStart ?? -1}, ${s.wordEnd ?? -1}])`;

    return {
      ...s,
      metrics: {
        left: s.left >= 0 && s.phase !== 'done' ? String(s.left) : '—',
        right: s.right >= 0 && s.phase !== 'done' ? String(s.right) : '—',
        length: `${s.chars.length}`,
        phase: phaseMap[s.phase] || s.phase,
        action,
      },
    };
  });
}

/** 主视觉：字符数组三阶段反转轨迹（指针徽章 + 单词窗口高亮） */
export function renderReverseWordsCanvas(container: HTMLElement, step: ReverseWordsStep): void {
  const { chars, left, right, wordStart, wordEnd, swapping, phase } = step;

  const cellsHtml = chars
    .map((ch, idx) => {
      const isSpace = ch === ' ';
      const inWordWindow =
        wordStart !== undefined && wordEnd !== undefined && idx >= wordStart && idx <= wordEnd;
      const isLeft = idx === left && phase !== 'done';
      const isRight = idx === right && phase !== 'done';
      const isSwapping = swapping && (idx === left || idx === right);

      let style =
        'width: 32px; height: 40px; border-radius: 8px; background: #ffffff; border: 2px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);';
      if (isSpace) style += ' background: #f1f5f9; border-style: dashed; color: #94a3b8;';
      if (inWordWindow) style += ' border-color: #818cf8; background: #eef2ff;';
      if (isSwapping) {
        style +=
          ' border-color: #10b981; background: #ecfdf5; transform: translateY(-3px) scale(1.05); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);';
      } else if (isLeft) {
        style += ' border-color: #2563eb; background: #eff6ff;';
      } else if (isRight) {
        style += ' border-color: #f59e0b; background: #fffbeb;';
      }

      let ptrTags = '';
      if (isLeft && isRight) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">L</span>' +
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">R</span>';
      } else if (isLeft) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">left</span>';
      } else if (isRight) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">right</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-height: 18px; display: flex; align-items: center; gap: 3px;">${ptrTags}</div>
          <div style="${style}">
            <span style="font-size: 14px; font-weight: 800; color: ${isSpace ? '#94a3b8' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">${isSpace ? '␣' : ch}</span>
            <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 6px; flex-wrap: wrap; justify-content: center; width: 100%; height: 100%; padding: 12px; box-sizing: border-box; overflow: auto;">
      ${cellsHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'reverse-words',
  name: '翻转字符串里的单词（双指针）',
  category: 'string',
  description: '移除多余空格并倒序拼接单词',
  icon: '🔃',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '学会分割-反转-重组的字符串处理模式',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: '  the sky is blue  ',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("  the sky is blue  ")', values: { s: '  the sky is blue  ' } },
    { label: '首尾多空格: ("  hello world  ")', values: { s: '  hello world  ' } },
    { label: '词间多空格: ("a good   example")', values: { s: 'a good   example' } },
    { label: '单单词: ("word")', values: { s: 'word' } },
  ],
  metrics: [
    { id: 'left', label: '左指针 left', color: '#3b82f6' },
    { id: 'right', label: '右指针 right', color: '#f59e0b' },
    { id: 'length', label: '字符数组有效长度', color: '#10b981' },
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: 'left 指针', color: '#2563eb' },
    { label: 'right 指针', color: '#f59e0b' },
    { label: '交换中', color: '#10b981' },
    { label: '单词窗口', color: '#818cf8' },
  ],
  codeLanguages: REVERSE_WORDS_CODE_LANGUAGES,
  problemHtml: REVERSE_WORDS_PROBLEM_HTML,
  analysisHtml: REVERSE_WORDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildReverseWordsSteps(String(inputs.s ?? '  the sky is blue  '))),
  renderCanvas: (container, step) =>
    renderReverseWordsCanvas(container, step as ReverseWordsStep),
});
