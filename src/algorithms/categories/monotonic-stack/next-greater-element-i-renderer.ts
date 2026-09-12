/**
 * 下一个更大元素 I 可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 496：母集 nums2 单调栈建表 map(num -> nextGreater)，子集 nums1 O(1) 查表输出答案
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  HighlightTarget,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  NEXT_GREATER_ELEMENT_I_PROBLEM_HTML,
  NEXT_GREATER_ELEMENT_I_ANALYSIS_HTML,
  NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES,
} from './next-greater-element-i-problem-content';

export interface NGE1Step {
  nums1: number[];
  nums2: number[];
  stack: number[]; // 存储数字本身
  nextGreaterMap: Record<number, number>;
  currentIndex2: number;
  queryIndex1: number;
  answers: number[];
  action: 'init' | 'scan_nums2' | 'pop_map' | 'push_nums2' | 'query_nums1' | 'done';
  message: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildNextGreaterElementISteps(nums1: number[], nums2: number[]): NGE1Step[] {
  const steps: NGE1Step[] = [];
  const n2 = nums2.length;
  const n1 = nums1.length;

  const lines = {
    init: { java: [2, 3], cpp: [4, 5], python: [3, 4], javascript: [2, 3] },
    scanNums2: { java: [5, 6], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    popMap: { java: 7, cpp: [8, 9], python: 7, javascript: 6 },
    pushNums2: { java: 9, cpp: 11, python: 8, javascript: 8 },
    queryNums1: { java: [13, 14], cpp: [14, 16], python: [10, 11], javascript: [11, 12] },
    done: { java: 16, cpp: 19, python: 12, javascript: 14 },
  };

  if (n1 === 0 || n2 === 0) {
    steps.push({
      nums1,
      nums2,
      stack: [],
      nextGreaterMap: {},
      currentIndex2: -1,
      queryIndex1: -1,
      answers: [],
      action: 'done',
      message: '输入数组为空，返回空数组',
      codeLine: lines.done,
    });
    return steps;
  }

  const stack: number[] = [];
  const nextGreaterMap: Record<number, number> = {};

  steps.push({
    nums1: [...nums1],
    nums2: [...nums2],
    stack: [],
    nextGreaterMap: {},
    currentIndex2: -1,
    queryIndex1: -1,
    answers: [],
    action: 'init',
    message: `阶段 1：初始化单调栈与哈希表，准备遍历母集 nums2=[${nums2.join(', ')}] 构建全量下一个更大元素映射`,
    codeLine: lines.init,
  });

  // 1. 遍历 nums2 构建映射
  for (let j = 0; j < n2; j++) {
    const cur = nums2[j];

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [...stack],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: j,
      queryIndex1: -1,
      answers: [],
      action: 'scan_nums2',
      message: `🔍 nums2 考察 [${j}]: 值 ${cur}，与单调栈顶 ${stack.length > 0 ? stack[stack.length - 1] : '（栈空）'} 比对`,
      codeLine: lines.scanNums2,
    });

    while (stack.length > 0 && cur > stack[stack.length - 1]) {
      const top = stack.pop()!;
      nextGreaterMap[top] = cur;

      steps.push({
        nums1: [...nums1],
        nums2: [...nums2],
        stack: [...stack],
        nextGreaterMap: { ...nextGreaterMap },
        currentIndex2: j,
        queryIndex1: -1,
        answers: [],
        action: 'pop_map',
        message: `🔥 弹出栈顶 ${top}！确立映射：${top} &rarr; 右侧首个更大元素为 ${cur}！`,
        codeLine: lines.popMap,
      });
    }

    stack.push(cur);

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [...stack],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: j,
      queryIndex1: -1,
      answers: [],
      action: 'push_nums2',
      message: `📥 将 ${cur} 压入单调栈，维持栈内单调递减`,
      codeLine: lines.pushNums2,
    });
  }

  // 栈中剩余元素映射为 -1
  while (stack.length > 0) {
    const rem = stack.pop()!;
    nextGreaterMap[rem] = -1;
  }

  // 2. 遍历 nums1 查表
  const answers: number[] = [];
  for (let i = 0; i < n1; i++) {
    const queryVal = nums1[i];
    const ans = nextGreaterMap[queryVal] ?? -1;
    answers.push(ans);

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: -1,
      queryIndex1: i,
      answers: [...answers],
      action: 'query_nums1',
      message: `📋 阶段 2：查询 nums1[${i}] = ${queryVal}，查哈希表得下一个更大元素为 ${ans === -1 ? '-1 (无)' : ans}，写入结果`,
      codeLine: lines.queryNums1,
    });
  }

  steps.push({
    nums1: [...nums1],
    nums2: [...nums2],
    stack: [],
    nextGreaterMap: { ...nextGreaterMap },
    currentIndex2: -1,
    queryIndex1: n1 - 1,
    answers: [...answers],
    action: 'done',
    message: `🎉 查询完毕！nums1 对应的下一个更大元素最终结果数组为：[${answers.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: NGE1Step[]): NGE1Step[] {
  return steps.map((s) => {
    const isScanNums2 = s.action === 'scan_nums2' || s.action === 'pop_map' || s.action === 'push_nums2';
    const cur2 = s.currentIndex2 >= 0 && s.currentIndex2 < s.nums2.length ? s.nums2[s.currentIndex2] : null;
    const cur1 = s.queryIndex1 >= 0 && s.queryIndex1 < s.nums1.length ? s.nums1[s.queryIndex1] : null;

    let action = '🔍 准备就绪';
    if (s.action === 'pop_map') action = '🔥 出栈确立哈希映射';
    else if (s.action === 'push_nums2') action = '📥 压栈 (维护单调递减)';
    else if (s.action === 'query_nums1') action = '📋 查表填入答案';
    else if (s.action === 'done') action = '🎉 完成';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-elem': isScanNums2 && cur2 !== null ? `nums2[${s.currentIndex2}] = ${cur2}` : cur1 !== null ? `nums1[${s.queryIndex1}] = ${cur1}` : '—',
        'stack-top': s.stack.length > 0 ? `${s.stack[s.stack.length - 1]}` : '（栈空）',
        'map-size': `${Object.keys(s.nextGreaterMap).length} 个`,
        answers: `[${s.answers.join(', ')}]`,
        action,
      },
    };
  });
}

export function renderNextGreaterElementICanvas(container: HTMLElement, step: NGE1Step): void {
  const nums1 = step.nums1;
  const nums2 = step.nums2;
  const stack = step.stack;
  const map = step.nextGreaterMap;
  const answers = step.answers;

  const curIdx2 = step.currentIndex2;
  const curIdx1 = step.queryIndex1;

  // nums2 流
  const nums2Html = nums2
    .map((num, idx) => {
      const isCurrent = idx === curIdx2;
      const inStack = stack.includes(num);
      const mappedVal = map[num];

      let bg = '#ffffff';
      let border = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eff6ff';
        border = '#2563eb';
        textColor = '#2563eb';
      } else if (inStack) {
        bg = '#fffbeb';
        border = '#fde68a';
        textColor = '#d97706';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            [${idx}]
          </span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <span>${num}</span>
            <span style="font-size: 8.5px; color: ${mappedVal !== undefined ? (mappedVal === -1 ? '#ef4444' : '#10b981') : '#94a3b8'}; font-weight: 700;">
              ${mappedVal !== undefined ? `&rarr;${mappedVal}` : ''}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  // nums1 查询流
  const nums1Html = nums1
    .map((num, idx) => {
      const isQuerying = idx === curIdx1;
      const ans = answers[idx];

      let bg = '#ffffff';
      let border = '#e2e8f0';

      if (isQuerying) {
        bg = '#ecfdf5';
        border = '#10b981';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <div style="padding: 3px 8px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${border}; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #0f172a; display: flex; align-items: center; gap: 4px;">
            <span>${num}</span>
            <span style="color: ${ans !== undefined ? (ans === -1 ? '#ef4444' : '#10b981') : '#94a3b8'}; font-weight: 800;">
              ${ans !== undefined ? `&rarr; ${ans}` : ''}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- nums2 母集单调栈流 -->
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
        <span>1️⃣ 母集 nums2 (单调栈建立映射):</span>
        <span style="color: #d97706;">栈内: [${stack.join(', ')}]</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
        ${nums2Html}
      </div>

      <!-- nums1 子集查询流 -->
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
        <span>2️⃣ 子集 nums1 (查表生成答案):</span>
        <span>已查: ${answers.length} / ${nums1.length}</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
        ${nums1Html}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'next-greater-element-i',
  name: '下一个更大元素 I',
  category: 'monotonic-stack',
  description: '单调栈在母集 nums2 中构建下一个更大元素哈希映射，子集 nums1 查表输出答案',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握单调栈与哈希表结合的高效解题范式，理解子集查询先在母集建表的降维思路',
  inputs: [
    {
      id: 'nums1',
      label: '子集 nums1',
      type: 'text',
      defaultValue: '4,1,2',
      placeholder: '逗号分隔数字',
    },
    {
      id: 'nums2',
      label: '母集 nums2',
      type: 'text',
      defaultValue: '1,3,4,2',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '示例 1', values: { nums1: '4,1,2', nums2: '1,3,4,2' } },
    { label: '示例 2', values: { nums1: '2,4', nums2: '1,2,3,4' } },
    { label: '单调降后升', values: { nums1: '1,3,5,2,4', nums2: '6,5,4,3,2,1,7' } },
  ],
  metrics: [
    { id: 'cur-elem', label: '当前处理元素', color: '#2563eb' },
    { id: 'stack-top', label: '单调栈顶', color: '#d97706' },
    { id: 'map-size', label: '已建映射', color: '#059669' },
    { id: 'answers', label: '答案数组', color: '#2563eb' },
    { id: 'action', label: '操作状态', color: '#2563eb' },
  ],
  legend: [
    { label: '当前考察', color: '#2563eb' },
    { label: '栈内元素', color: '#d97706' },
    { label: '映射确立', color: '#10b981' },
  ],
  codeLanguages: NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES,
  problemHtml: NEXT_GREATER_ELEMENT_I_PROBLEM_HTML,
  analysisHtml: NEXT_GREATER_ELEMENT_I_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums1 = parseNumberList(inputs.nums1, '4,1,2');
    const nums2 = parseNumberList(inputs.nums2, '1,3,4,2');
    return withMetrics(buildNextGreaterElementISteps(nums1.length ? nums1 : [4, 1, 2], nums2.length ? nums2 : [1, 3, 4, 2]));
  },
  renderCanvas: (container, step) => renderNextGreaterElementICanvas(container, step as NGE1Step),
});
