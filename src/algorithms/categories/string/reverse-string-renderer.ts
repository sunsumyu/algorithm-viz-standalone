/**
 * 反转字符串可视化器 — 声明式 4-Card 标准架构
 * LeetCode 344：首尾双指针对撞交换
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REVERSE_STRING_PROBLEM_HTML,
  REVERSE_STRING_ANALYSIS_HTML,
  REVERSE_STRING_CODE_LANGUAGES,
} from './reverse-string-problem-content';

export interface ReverseStringStep {
  s: string[];
  left: number;
  right: number;
  swapping: boolean;
  swapCount: number;
  status: 'init' | 'inspect' | 'swap' | 'move' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildReverseStringSteps(inputStr: string): ReverseStringStep[] {
  const steps: ReverseStringStep[] = [];
  const s = inputStr.split('');
  let left = 0;
  let right = s.length - 1;
  let swapCount = 0;

  steps.push({
    s: [...s],
    left,
    right,
    swapping: false,
    swapCount: 0,
    status: 'init',
    message: `初始化双指针：left = 0 指向首字符 '${s[0] || ''}'，right = ${right} 指向尾字符 '${s[right] || ''}'。`,
    log: `初始化双指针: left=0, right=${right}`,
    codeLine: 2,
  });

  while (left < right) {
    steps.push({
      s: [...s],
      left,
      right,
      swapping: false,
      swapCount,
      status: 'inspect',
      message: `检查指针：left(${left}) < right(${right})，准备交换 s[${left}] ('${s[left]}') 和 s[${right}] ('${s[right]}')。`,
      log: `比对指针: left(${left}) < right(${right})`,
      codeLine: 3,
    });

    // 交换
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    swapCount++;

    steps.push({
      s: [...s],
      left,
      right,
      swapping: true,
      swapCount,
      status: 'swap',
      message: `交换完成：s[${left}] 变为 '${s[left]}'，s[${right}] 变为 '${s[right]}'。`,
      log: `交换 s[${left}] <-> s[${right}] ('${temp}' <-> '${s[left]}')`,
      codeLine: [4, 5, 6],
    });

    left++;
    right--;

    steps.push({
      s: [...s],
      left,
      right,
      swapping: false,
      swapCount,
      status: 'move',
      message: `双指针向中间靠拢：left 移动至 ${left}，right 移动至 ${right}。`,
      log: `指针步进: left=${left}, right=${right}`,
      codeLine: [7, 8],
    });
  }

  steps.push({
    s: [...s],
    left,
    right,
    swapping: false,
    swapCount,
    status: 'done',
    message: `🎉 反转完成！left(${left}) >= right(${right})，字符串成功原地反转为 "${s.join('')}"。`,
    log: `✓ 反转结束: "${s.join('')}" (共交换 ${swapCount} 次)`,
    codeLine: 10,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ReverseStringStep[]): ReverseStringStep[] {
  const statusMap: Record<string, string> = {
    init: '初始化',
    inspect: '对撞检查',
    swap: '交换中...',
    move: '指针移动',
    done: '反转完成',
  };
  return steps.map((step) => {
    let action = 'swap(s[left], s[right])';
    if (step.swapping) action = `swap(s[${step.left}], s[${step.right}]) 交换`;
    else if (step.status === 'done') action = '反转完成';

    return {
      ...step,
      metrics: {
        left: step.status === 'done' ? '—' : String(step.left),
        right: step.status === 'done' ? '—' : String(step.right),
        swaps: `${step.swapCount} 次`,
        status: statusMap[step.status] || step.status,
        action,
      },
    };
  });
}

export function renderReverseStringCanvas(container: HTMLElement, step: ReverseStringStep): void {
  const { s, left, right, swapping, status } = step;

  const cellsHtml = s
    .map((ch, idx) => {
      const isLeft = idx === left && status !== 'done';
      const isRight = idx === right && status !== 'done';
      const isSwapping = swapping && (idx === left || idx === right);

      let border = '#cbd5e1';
      let bg = '#ffffff';
      let transform = 'none';
      let boxShadow = 'none';
      if (isSwapping) {
        border = '#10b981';
        bg = '#ecfdf5';
        transform = 'translateY(-3px) scale(1.05)';
        boxShadow = '0 4px 10px rgba(16, 185, 129, 0.2)';
      } else if (isLeft) {
        border = '#2563eb';
        bg = '#eff6ff';
      } else if (isRight) {
        border = '#f59e0b';
        bg = '#fffbeb';
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
          <div style="width: 44px; height: 48px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform: ${transform}; box-shadow: ${boxShadow};">
            <span style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${ch}</span>
            <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; justify-content: center; height: 100%; padding: 12px; box-sizing: border-box;">
      ${cellsHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'reverse-string',
  name: '反转字符串（双指针）',
  category: 'string',
  description: '首尾双指针原地反转字符数组',
  icon: '↔️',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握原地反转字符串的双指针法',
  inputs: [
    {
      id: 's',
      label: '字符数组',
      type: 'text',
      defaultValue: 'hello',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("hello")', values: { s: 'hello' } },
    { label: '示例 2: ("Hannah")', values: { s: 'Hannah' } },
    { label: '奇数长度: ("algorithm")', values: { s: 'algorithm' } },
    { label: '回文字符串: ("radar")', values: { s: 'radar' } },
  ],
  metrics: [
    { id: 'left', label: '左指针 left', color: '#3b82f6' },
    { id: 'right', label: '右指针 right', color: '#f59e0b' },
    { id: 'swaps', label: '已交换次数', color: '#10b981' },
    { id: 'status', label: '当前执行阶段', color: '#0f172a' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: 'left 指针', color: '#2563eb' },
    { label: 'right 指针', color: '#f59e0b' },
    { label: 'swap 交换', color: '#10b981' },
  ],
  codeLanguages: REVERSE_STRING_CODE_LANGUAGES,
  problemHtml: REVERSE_STRING_PROBLEM_HTML,
  analysisHtml: REVERSE_STRING_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildReverseStringSteps(String(inputs.s ?? 'hello'))),
  renderCanvas: (container, step) => renderReverseStringCanvas(container, step as ReverseStringStep),
});
