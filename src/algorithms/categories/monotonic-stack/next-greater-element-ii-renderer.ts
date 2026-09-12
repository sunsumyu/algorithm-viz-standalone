/**
 * 下一个更大元素 II 可视化器（单调栈 · 循环数组）— 4-Card 标准现代架构
 * LeetCode 503：利用取模 2n 轮循环遍历 (i % n)，单调递增栈（栈头到栈底）
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
  HighlightTarget,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  NEXT_GREATER_ELEMENT_II_PROBLEM_HTML,
  NEXT_GREATER_ELEMENT_II_ANALYSIS_HTML,
  NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES,
} from './next-greater-element-ii-problem-content';

export interface NGE2Step {
  nums: number[];
  currentIndex: number; // 0 到 2n-1
  actualIndex: number;  // currentIndex % n
  lap: number;          // 0 = 第 1 轮, 1 = 第 2 轮
  stack: number[];      // 存储实际下标
  result: number[];
  poppedIndex: number | null;
  action: 'init' | 'scan' | 'pop_resolve' | 'push' | 'done';
  message: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildNextGreaterElementIISteps(rawNums: number[]): NGE2Step[] {
  const steps: NGE2Step[] = [];
  const n = rawNums.length;

  const lines = {
    init: { java: [3, 5], cpp: [4, 6], python: [3, 5], javascript: [3, 4] },
    scan: { java: [7, 8], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    popResolve: { java: 9, cpp: [9, 10], python: 8, javascript: 7 },
    push: { java: 11, cpp: 12, python: 9, javascript: 9 },
    done: { java: 13, cpp: 14, python: 10, javascript: 11 },
  };

  if (n === 0) {
    steps.push({
      nums: [],
      currentIndex: -1,
      actualIndex: -1,
      lap: 0,
      stack: [],
      result: [],
      poppedIndex: null,
      action: 'done',
      message: '输入数组为空，返回空数组',
      codeLine: lines.done,
    });
    return steps;
  }

  const result = new Array(n).fill(-1);
  const stack: number[] = [];

  steps.push({
    nums: [...rawNums],
    currentIndex: -1,
    actualIndex: -1,
    lap: 0,
    stack: [],
    result: [...result],
    poppedIndex: null,
    action: 'init',
    message: `初始化：共 ${n} 个元素，结果数组全置 -1，通过模拟 2 轮遍历 (0 &rarr; ${2 * n - 1}) 处理循环边界`,
    codeLine: lines.init,
  });

  for (let i = 0; i < 2 * n; i++) {
    const idx = i % n;
    const lap = i < n ? 0 : 1;
    const curVal = rawNums[idx];

    steps.push({
      nums: [...rawNums],
      currentIndex: i,
      actualIndex: idx,
      lap,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'scan',
      message: `🔁 模拟步数 [${i}] (第 ${lap + 1} 轮, 实际下标 [${idx}], 值 ${curVal})：与栈顶 ${stack.length > 0 ? `下标 [${stack[stack.length - 1]}] (${rawNums[stack[stack.length - 1]]})` : '（栈空）'} 比对`,
      codeLine: lines.scan,
    });

    while (stack.length > 0 && curVal > rawNums[stack[stack.length - 1]]) {
      const topIdx = stack.pop()!;
      result[topIdx] = curVal;

      steps.push({
        nums: [...rawNums],
        currentIndex: i,
        actualIndex: idx,
        lap,
        stack: [...stack],
        result: [...result],
        poppedIndex: topIdx,
        action: 'pop_resolve',
        message: `🔥 循环破局！下标 [${idx}] (${curVal}) > 栈顶下标 [${topIdx}] (${rawNums[topIdx]})！设置 res[${topIdx}] = ${curVal}，出栈！`,
        codeLine: lines.popResolve,
      });
    }

    stack.push(idx);

    steps.push({
      nums: [...rawNums],
      currentIndex: i,
      actualIndex: idx,
      lap,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'push',
      message: `📥 将下标 [${idx}] (值 ${curVal}) 压入单调栈，维持单调递减`,
      codeLine: lines.push,
    });
  }

  steps.push({
    nums: [...rawNums],
    currentIndex: 2 * n - 1,
    actualIndex: n - 1,
    lap: 1,
    stack: [...stack],
    result: [...result],
    poppedIndex: null,
    action: 'done',
    message: `🎉 2 轮循环遍历结算完成！最终循环下一个更大元素数组：[${result.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: NGE2Step[]): NGE2Step[] {
  return steps.map((s) => {
    const n = s.nums.length;
    const topIdx = s.stack.length > 0 ? s.stack[s.stack.length - 1] : null;
    const resolvedCount = s.result.filter((r) => r !== -1).length;

    let action = '🔍 比对栈顶';
    if (s.action === 'pop_resolve') action = `🔥 循环找到更大值 (res[${s.poppedIndex}] = ${s.result[s.poppedIndex ?? 0]})`;
    else if (s.action === 'push') action = '📥 压入栈顶 (维持单调递减)';
    else if (s.action === 'done') action = '🎉 完成';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'loop-idx': s.currentIndex >= 0 ? `i=${s.currentIndex} &rarr; [${s.actualIndex}] (值 ${s.nums[s.actualIndex]})` : '—',
        'stack-top': topIdx !== null ? `[${topIdx}] (值 ${s.nums[topIdx]})` : '（栈空）',
        resolved: `已确定 ${resolvedCount} / ${n} 个`,
        result: `[${s.result.join(', ')}]`,
        action,
      },
    };
  });
}

export function renderNextGreaterElementIICanvas(container: HTMLElement, step: NGE2Step): void {
  const nums = step.nums;
  const stack = step.stack;
  const result = step.result;
  const n = nums.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  // 展开为 2 轮条带
  const doubleArray = [...nums, ...nums];
  const ribbonsHtml = doubleArray
    .map((num, i) => {
      const isCurrent = i === curIdx && !isDone;
      const origIdx = i % n;
      const isRound2 = i >= n;
      const inStack = stack.includes(origIdx);
      const isPopped = origIdx === step.poppedIndex;
      const resVal = result[origIdx];

      let bg = '#ffffff';
      let border = isRound2 ? '#c7d2fe' : '#e2e8f0';
      let textColor = isRound2 ? '#4f46e5' : '#0f172a';

      if (isCurrent) {
        bg = '#eef2ff';
        border = '#4f46e5';
        textColor = '#4338ca';
      } else if (isPopped) {
        bg = '#ecfdf5';
        border = '#10b981';
        textColor = '#059669';
      } else if (inStack) {
        bg = '#fffbeb';
        border = '#fde68a';
        textColor = '#d97706';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8px; color: ${isCurrent ? '#4f46e5' : isRound2 ? '#818cf8' : '#94a3b8'}; font-weight: 700;">
            ${isRound2 ? `R2[${origIdx}]` : `[${origIdx}]`}
          </span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <span>${num}</span>
            <span style="font-size: 8.5px; color: ${resVal !== -1 ? '#10b981' : '#94a3b8'}; font-weight: 700;">
              ${resVal !== -1 ? `&rarr;${resVal}` : ''}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  // 栈内展示
  const stackItemsHtml = stack
    .map((idx) => {
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #4f46e5;">val: ${nums[idx]}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 循环展开条带 -->
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
        <span>🔄 循环 2 轮展开 (第 1 轮 [0..${n - 1}] + 第 2 轮 [${n}..${2 * n - 1}]):</span>
        <span style="color: #4f46e5;">当前轮次: 第 ${step.lap + 1} 轮 (i=${curIdx >= 0 ? curIdx : '-'})</span>
      </div>
      <div style="display: flex; gap: 5px; overflow-x: auto; padding: 2px 0;">
        ${ribbonsHtml}
      </div>

      <!-- 单调栈容器 -->
      <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px; border-top: 1px dashed #e2e8f0;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调栈 (栈底 &rarr; 栈顶):</span>
        <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
          ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'next-greater-element-ii',
  name: '下一个更大元素 II',
  category: 'monotonic-stack',
  description: '循环数组通过取模模拟 2 轮遍历 (i % n)，单调递减栈寻找循环右侧首个更大元素',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握循环数组在单调栈中的取模模拟技巧，理解两轮遍历即可完备覆盖循环边界的数学原理',
  inputs: [
    {
      id: 'nums',
      label: '循环数组',
      type: 'text',
      defaultValue: '1,2,1',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '示例 1', values: { nums: '1,2,1' } },
    { label: '示例 2', values: { nums: '1,2,3,4,3' } },
    { label: '单调递减', values: { nums: '5,4,3,2,1' } },
  ],
  metrics: [
    { id: 'loop-idx', label: '循环步数/实际下标', color: '#4f46e5' },
    { id: 'stack-top', label: '当前栈顶', color: '#d97706' },
    { id: 'resolved', label: '已确定数量', color: '#059669' },
    { id: 'result', label: '答案数组', color: '#4f46e5' },
    { id: 'action', label: '操作决策', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前考察', color: '#4f46e5' },
    { label: '🥞 栈内待结算', color: '#fbbf24' },
    { label: '✓ 已结算', color: '#10b981' },
  ],
  codeLanguages: NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES,
  problemHtml: NEXT_GREATER_ELEMENT_II_PROBLEM_HTML,
  analysisHtml: NEXT_GREATER_ELEMENT_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawNums = String(inputs.nums ?? '1,2,1')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(buildNextGreaterElementIISteps(rawNums.length ? rawNums : [1, 2, 1]));
  },
  renderCanvas: (container, step) => renderNextGreaterElementIICanvas(container, step as NGE2Step),
});
