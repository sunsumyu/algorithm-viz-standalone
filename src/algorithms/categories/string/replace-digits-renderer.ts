/**
 * 替换数字可视化器 — 声明式 4-Card 标准架构
 * KamaCoder 54：预扩容与从后向前双指针替换
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REPLACE_DIGITS_PROBLEM_HTML,
  REPLACE_DIGITS_ANALYSIS_HTML,
  REPLACE_DIGITS_CODE_LANGUAGES,
} from './replace-digits-problem-content';

export interface ReplaceDigitsStep {
  chars: string[];
  oldIndex: number;
  newIndex: number;
  digitCount: number;
  isDigit: boolean;
  phase: 'count' | 'resize' | 'replace-letter' | 'replace-number' | 'done';
  status: 'count' | 'resize' | 'replace-letter' | 'replace-number' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildReplaceDigitsSteps(inputStr: string): ReplaceDigitsStep[] {
  const steps: ReplaceDigitsStep[] = [];
  const oldChars = inputStr.split('');
  const oldSize = oldChars.length;
  let count = 0;

  for (const c of oldChars) {
    if (c >= '0' && c <= '9') count++;
  }

  const newSize = oldSize + count * 5;
  const newChars = new Array<string>(newSize).fill('');
  for (let idx = 0; idx < oldSize; idx++) {
    newChars[idx] = oldChars[idx];
  }

  steps.push({
    chars: [...newChars],
    oldIndex: oldSize - 1,
    newIndex: newSize - 1,
    digitCount: count,
    isDigit: false,
    phase: 'count',
    status: 'count',
    message: `扫描统计数字字符：共找到 ${count} 个数字。旧长度 oldSize = ${oldSize}。`,
    log: `统计数字: ${count} 个数字字符`,
    codeLine: [4, 5, 6, 7],
  });

  steps.push({
    chars: [...newChars],
    oldIndex: oldSize - 1,
    newIndex: newSize - 1,
    digitCount: count,
    isDigit: false,
    phase: 'resize',
    status: 'resize',
    message: `执行数组预扩容：newSize = ${oldSize} + ${count} * 5 = ${newSize}。双指针 oldIndex=${oldSize - 1}, newIndex=${newSize - 1} 从后向前填充。`,
    log: `数组预扩容: ${oldSize} -> ${newSize}`,
    codeLine: [8, 9, 10],
  });

  let i = oldSize - 1;
  let j = newSize - 1;

  while (i >= 0 && j >= 0) {
    const char = newChars[i];
    const isDigitChar = char >= '0' && char <= '9';

    if (!isDigitChar) {
      newChars[j] = char;
      if (i !== j) newChars[i] = '';

      steps.push({
        chars: [...newChars],
        oldIndex: i,
        newIndex: j,
        digitCount: count,
        isDigit: false,
        phase: 'replace-letter',
        status: 'replace-letter',
        message: `非数字字符 '${char}'：直接从 oldIndex(${i}) 搬移至 newIndex(${j})。`,
        log: `复制字母 '${char}': [${i}] -> [${j}]`,
        codeLine: [11, 12],
      });

      i--;
      j--;
    } else {
      const numberToken = 'number';
      for (let k = numberToken.length - 1; k >= 0; k--) {
        newChars[j] = numberToken[k];
        j--;
      }
      if (i < j + 1) newChars[i] = '';

      steps.push({
        chars: [...newChars],
        oldIndex: i,
        newIndex: j + 1,
        digitCount: count,
        isDigit: true,
        phase: 'replace-number',
        status: 'replace-number',
        message: `数字字符 '${char}'：替换为 "number"，从 newIndex 向前连续填入 6 个字符。`,
        log: `替换数字 '${char}' -> "number"`,
        codeLine: [13, 14, 15],
      });

      i--;
    }
  }

  steps.push({
    chars: [...newChars],
    oldIndex: -1,
    newIndex: -1,
    digitCount: count,
    isDigit: false,
    phase: 'done',
    status: 'done',
    message: `🎉 替换全部完成！最终字符串为 "${newChars.join('')}"。`,
    log: `✓ 完成: "${newChars.join('')}"`,
    codeLine: 18,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ReplaceDigitsStep[]): ReplaceDigitsStep[] {
  const phaseMap: Record<string, string> = {
    count: '统计数字',
    resize: '预扩容',
    'replace-letter': '搬移字母',
    'replace-number': '替换 number',
    done: '替换完成',
  };
  return steps.map((step) => ({
    ...step,
    metrics: {
      'old-idx': step.oldIndex >= 0 ? String(step.oldIndex) : '—',
      'new-idx': step.newIndex >= 0 ? String(step.newIndex) : '—',
      digits: `${step.digitCount} 个`,
      phase: phaseMap[step.phase] || step.phase,
      action: `newSize = ${step.chars.length - step.digitCount * 5} + ${step.digitCount} * 5 = ${step.chars.length}`,
    },
  }));
}

export function renderReplaceDigitsCanvas(container: HTMLElement, step: ReplaceDigitsStep): void {
  const { chars, oldIndex, newIndex, phase } = step;

  const cellsHtml = chars
    .map((ch, idx) => {
      const isOld = idx === oldIndex && phase !== 'done';
      const isNew = idx === newIndex && phase !== 'done';
      const isNumberToken =
        !isOld && !isNew && ['n', 'u', 'm', 'b', 'e', 'r'].includes(ch);

      let border = '#cbd5e1';
      let bg = '#ffffff';
      let valColor = '#0f172a';
      if (isOld) {
        border = '#2563eb';
        bg = '#eff6ff';
      } else if (isNew) {
        border = '#f59e0b';
        bg = '#fffbeb';
      } else if (isNumberToken) {
        border = '#10b981';
        bg = '#ecfdf5';
        valColor = '#047857';
      }

      let ptrTags = '';
      if (isOld && isNew) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">old</span>' +
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">new</span>';
      } else if (isOld) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">old</span>';
      } else if (isNew) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">new</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-height: 18px; display: flex; align-items: center; gap: 3px;">${ptrTags}</div>
          <div style="width: 38px; height: 44px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
            <span style="font-size: 15px; font-weight: 800; color: ${valColor}; font-family: 'JetBrains Mono', monospace;">${ch || '&nbsp;'}</span>
            <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 6px; flex-wrap: wrap; justify-content: center; height: 100%; padding: 12px; box-sizing: border-box;">
      ${cellsHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'replace-digits',
  name: '替换数字（单指针遍历）',
  category: 'string',
  description: '遍历字符串，将数字字符替换为指定内容',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握字符串遍历中条件替换的逻辑',
  inputs: [
    {
      id: 's',
      label: '字符串',
      type: 'text',
      defaultValue: 'a1b2c',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("a1b2c")', values: { s: 'a1b2c' } },
    { label: '纯数字: ("123")', values: { s: '123' } },
    { label: '纯字母: ("hello")', values: { s: 'hello' } },
    { label: '单个数字: ("a9b")', values: { s: 'a9b' } },
  ],
  metrics: [
    { id: 'old-idx', label: '读取指针 oldIndex', color: '#3b82f6' },
    { id: 'new-idx', label: '写入指针 newIndex', color: '#f59e0b' },
    { id: 'digits', label: '数字个数 count', color: '#10b981' },
    { id: 'phase', label: '当前阶段', color: '#0f172a' },
    { id: 'action', label: '扩容公式', color: '#2563eb' },
  ],
  legend: [
    { label: 'oldIndex (读)', color: '#2563eb' },
    { label: 'newIndex (写)', color: '#f59e0b' },
    { label: '"number"', color: '#10b981' },
  ],
  codeLanguages: REPLACE_DIGITS_CODE_LANGUAGES,
  problemHtml: REPLACE_DIGITS_PROBLEM_HTML,
  analysisHtml: REPLACE_DIGITS_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildReplaceDigitsSteps(String(inputs.s ?? 'a1b2c'))),
  renderCanvas: (container, step) => renderReplaceDigitsCanvas(container, step as ReplaceDigitsStep),
});
