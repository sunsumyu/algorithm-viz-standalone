/**
 * 单调递增的数字可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 738：从右向左逆序扫描，若 chars[i-1] > chars[i] 则 chars[i-1]-- 且记录 flag = i，后续位全置 9
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MONOTONE_DIGITS_PROBLEM_HTML,
  MONOTONE_DIGITS_ANALYSIS_HTML,
  MONOTONE_DIGITS_CODE_LANGUAGES,
} from './monotone-digits-problem-content';

export interface MonotoneStep {
  originalNum: number;
  digits: number[];
  checkIndex: number;
  flag: number;
  action: 'init' | 'check_ok' | 'borrow' | 'fill_9' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
  log?: string;
}

export function buildMonotoneDigitsSteps(num: number): MonotoneStep[] {
  const steps: MonotoneStep[] = [];
  const digits = String(num)
    .split('')
    .map(Number);
  const n = digits.length;

  if (n <= 1) {
    steps.push({
      originalNum: num,
      digits: [...digits],
      checkIndex: -1,
      flag: n,
      action: 'done',
      message: `数字 ${num} 仅有 1 位，天然满足单调递增，直接返回 ${num}`,
      codeLine: 1,
    });
    return steps;
  }

  let flag = n;

  steps.push({
    originalNum: num,
    digits: [...digits],
    checkIndex: -1,
    flag,
    action: 'init',
    message: `初始化：将数字 ${num} 拆解为 ${n} 位数数组 [${digits.join(', ')}]，初始变9标记 flag = ${flag}`,
    codeLine: 4,
  });

  // 1. 从右往左逆序扫描
  for (let i = n - 1; i > 0; i--) {
    if (digits[i - 1] > digits[i]) {
      digits[i - 1]--;
      flag = i;

      steps.push({
        originalNum: num,
        digits: [...digits],
        checkIndex: i,
        flag,
        action: 'borrow',
        message: `⚠️ 逆序比较 [${i - 1}] 位 (${digits[i - 1] + 1}) > [${i}] 位 (${digits[i]}) 违反单调递增！高位借位减 1 变为 ${digits[i - 1]}，更新变9起点 flag = ${flag}`,
        codeLine: 8,
      });
    } else {
      steps.push({
        originalNum: num,
        digits: [...digits],
        checkIndex: i,
        flag,
        action: 'check_ok',
        message: `✓ 逆序比较 [${i - 1}] 位 (${digits[i - 1]}) &le; [${i}] 位 (${digits[i]})，满足单调递增，继续向左扫描`,
        codeLine: 6,
      });
    }
  }

  // 2. 将 flag 之后的数字全部置为 9
  if (flag < n) {
    for (let i = flag; i < n; i++) {
      digits[i] = 9;
    }

    steps.push({
      originalNum: num,
      digits: [...digits],
      checkIndex: -1,
      flag,
      action: 'fill_9',
      message: `9️⃣ 统一将 flag=[${flag}] 及后续所有低位全部置为 9，使数值在满足单调递增前提下最大化！`,
      codeLine: 14,
    });
  }

  const resultNum = parseInt(digits.join(''), 10);

  steps.push({
    originalNum: num,
    digits: [...digits],
    checkIndex: -1,
    flag,
    action: 'done',
    message: `🎉 计算完成！小于或等于 ${num} 的最大单调递增整数为 ${resultNum}`,
    codeLine: 16,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MonotoneStep[]): MonotoneStep[] {
  return steps.map((s) => {
    const n = s.digits.length;
    const idx = s.checkIndex;
    const hasPair = idx > 0 && idx < n;
    const isBorrow = s.action === 'borrow';
    const isFill9 = s.action === 'fill_9';

    let action = '✓ 单调递增无违背';
    if (isBorrow) action = '⚠️ 高位 > 低位 (借位减1，更新flag)';
    else if (isFill9) action = '9️⃣ 后续低位全置 9 (最大化)';
    else if (s.action === 'done') action = '🎉 完成';

    const currentVal = parseInt(s.digits.join(''), 10);

    return {
      ...s,
      log: s.message,
      metrics: {
        pair: hasPair ? `digits[${idx - 1}](${s.digits[idx - 1]}) vs digits[${idx}](${s.digits[idx]})` : '—',
        flag: s.flag < n ? `下标 [${s.flag}]` : '未触发借位',
        value: String(currentVal),
        digits: `[${s.digits.join('')}]`,
        action,
      },
    };
  });
}

/** 主视觉：数字位数沙盘 */
export function renderMonotoneDigitsCanvas(container: HTMLElement, step: MonotoneStep): void {
  const digits = step.digits;
  const n = digits.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.checkIndex;
  const isDone = step.action === 'done';

  const digitsHtml = digits
    .map((d, idx) => {
      const isComparing = curIdx > 0 && (idx === curIdx || idx === curIdx - 1) && !isDone;
      const isFilled9 = idx >= step.flag && (step.action === 'fill_9' || isDone);

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isFilled9) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isComparing) {
        bg = '#fdf4ff';
        borderColor = '#c026d3';
        textColor = '#a21caf';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isComparing ? '#c026d3' : isFilled9 ? '#059669' : '#94a3b8'}; font-weight: 700;">
            ${isComparing ? (idx === curIdx - 1 ? '高位[i-1]' : '低位[i]') : `[${idx}]`}
          </span>
          <div style="width: 52px; height: 56px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
            <span>${d}</span>
          </div>
          <span style="font-size: 8.5px; color: ${idx === step.flag ? '#c026d3' : '#94a3b8'}; font-weight: 700;">
            ${idx === step.flag ? '🚩 flag' : ''}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>原输入数值: <strong style="color: #0f172a; font-family: monospace;">${step.originalNum}</strong></span>
        <span>置9起始位 flag: <strong style="color: #c026d3; font-family: monospace;">[${step.flag < n ? step.flag : '无'}]</strong></span>
      </div>

      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${digitsHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'monotone-digits',
  name: '单调递增的数字',
  category: 'greedy',
  description: '逆序扫描借位减 1 并标记起点，后续位数统一贪心置 9，求小于等于 N 的最大单调数',
  icon: '📈',
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握逆序遍历利用前序状态的解题技巧，理解贪心置 9 对数值最大化的精妙运用',
  inputs: [
    {
      id: 'num',
      label: '正整数 N',
      type: 'number',
      defaultValue: '986612',
      placeholder: '正整数',
    },
  ],
  presets: [
    { label: '示例 1', values: { num: '986612' } },
    { label: '含平坡', values: { num: '332' } },
    { label: '完全递增', values: { num: '12345' } },
    { label: '多位借位', values: { num: '100' } },
  ],
  metrics: [
    { id: 'pair', label: '逆序比较对', color: '#c026d3' },
    { id: 'flag', label: '变9起始点 flag', color: '#2563eb' },
    { id: 'value', label: '当前数值', color: '#c026d3' },
    { id: 'digits', label: '当前位数组', color: '#059669' },
    { id: 'action', label: '贪心判定', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前比较对', color: '#c026d3' },
    { label: '9️⃣ 置 9 位', color: '#10b981' },
  ],
  codeLanguages: MONOTONE_DIGITS_CODE_LANGUAGES,
  problemHtml: MONOTONE_DIGITS_PROBLEM_HTML,
  analysisHtml: MONOTONE_DIGITS_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let num = parseInt(String(inputs.num ?? '986612'), 10);
    if (!Number.isFinite(num) || num < 0) num = 986612;
    return withMetrics(buildMonotoneDigitsSteps(num));
  },
  renderCanvas: (container, step) => renderMonotoneDigitsCanvas(container, step as MonotoneStep),
});
