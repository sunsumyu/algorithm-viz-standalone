/**
 * 滑动窗口最大值可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 239：单调队列（队头到队尾单调递减），队头恒为当前窗口最大值，O(1) 读取
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SLIDING_WINDOW_MAX_PROBLEM_HTML,
  SLIDING_WINDOW_MAX_ANALYSIS_HTML,
  SLIDING_WINDOW_MAX_CODE_LANGUAGES,
} from './sliding-window-max-problem-content';

export interface SWMStep {
  nums: number[];
  k: number;
  currentIndex: number;
  windowLeft: number;
  windowRight: number;
  deque: number[];
  result: number[];
  outVal: number | null;
  inVal: number | null;
  poppedBackVals: number[];
  action: 'init' | 'init_window' | 'slide_out' | 'slide_in' | 'record_max' | 'done';
  message: string;
  codeLine: number;
}

export function buildSlidingWindowMaxSteps(rawNums: number[], k: number): SWMStep[] {
  const steps: SWMStep[] = [];
  const nums = [...rawNums];
  const n = nums.length;

  if (n === 0 || k <= 0 || k > n) {
    steps.push({
      nums: [],
      k,
      currentIndex: -1,
      windowLeft: 0,
      windowRight: -1,
      deque: [],
      result: [],
      outVal: null,
      inVal: null,
      poppedBackVals: [],
      action: 'done',
      message: '输入无效或窗口大小超出数组长度',
      codeLine: 18,
    });
    return steps;
  }

  const deque: number[] = [];
  const result: number[] = [];

  const dequeAdd = (val: number): number[] => {
    const popped: number[] = [];
    while (deque.length > 0 && val > deque[deque.length - 1]) {
      popped.push(deque.pop()!);
    }
    deque.push(val);
    return popped;
  };

  const dequePoll = (val: number): boolean => {
    if (deque.length > 0 && val === deque[0]) {
      deque.shift();
      return true;
    }
    return false;
  };

  steps.push({
    nums: [...nums],
    k,
    currentIndex: -1,
    windowLeft: 0,
    windowRight: -1,
    deque: [],
    result: [],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'init',
    message: `初始化：数组长度 ${n}，窗口大小 k = ${k}。准备使用单调队列维护窗口最大值`,
    codeLine: 2,
  });

  // 1. 初始化前 k 个元素
  for (let i = 0; i < k; i++) {
    const num = nums[i];
    const popped = dequeAdd(num);

    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: 0,
      windowRight: i,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: num,
      poppedBackVals: popped,
      action: 'init_window',
      message:
        popped.length > 0
          ? `📥 压入元素 nums[${i}]=${num}，单调性维护：淘汰队尾较小元素 [${popped.join(', ')}]`
          : `📥 压入元素 nums[${i}]=${num} 到单调队列`,
      codeLine: 7,
    });
  }

  result.push(deque[0]);
  steps.push({
    nums: [...nums],
    k,
    currentIndex: k - 1,
    windowLeft: 0,
    windowRight: k - 1,
    deque: [...deque],
    result: [...result],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'record_max',
    message: `🥇 初始窗口 [0..${k - 1}] 构建完毕，队头元素 ${deque[0]} 即为窗口最大值，加入结果列表`,
    codeLine: 10,
  });

  // 2. 窗口向右滑动
  for (let i = k; i < n; i++) {
    const removeVal = nums[i - k];
    const addVal = nums[i];

    // 移出窗口左侧
    const polled = dequePoll(removeVal);
    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: i - k + 1,
      windowRight: i - 1,
      deque: [...deque],
      result: [...result],
      outVal: removeVal,
      inVal: null,
      poppedBackVals: [],
      action: 'slide_out',
      message: polled
        ? `🚪 窗口右移：移出左边界元素 nums[${i - k}]=${removeVal}，恰为当前队头，从队列弹出`
        : `🚪 窗口右移：移出左边界元素 nums[${i - k}]=${removeVal}，早已被淘汰不在队列中，无需操作`,
      codeLine: 13,
    });

    // 移入窗口右侧
    const popped = dequeAdd(addVal);
    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: i - k + 1,
      windowRight: i,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: addVal,
      poppedBackVals: popped,
      action: 'slide_in',
      message:
        popped.length > 0
          ? `📥 移入右边界元素 nums[${i}]=${addVal}，淘汰队尾较小元素 [${popped.join(', ')}]，维持递减`
          : `📥 移入右边界元素 nums[${i}]=${addVal} 到单调队列`,
      codeLine: 15,
    });

    // 记录最大值
    result.push(deque[0]);
    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: i - k + 1,
      windowRight: i,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: null,
      poppedBackVals: [],
      action: 'record_max',
      message: `🥇 窗口 [${i - k + 1}..${i}] 最大值为队头 ${deque[0]}，加入结果列表: [${result.join(', ')}]`,
      codeLine: 17,
    });
  }

  steps.push({
    nums: [...nums],
    k,
    currentIndex: n,
    windowLeft: n - k,
    windowRight: n - 1,
    deque: [...deque],
    result: [...result],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'done',
    message: `🎉 滑动窗口最大值计算完成！最终收集数组: [${result.join(', ')}]`,
    codeLine: 18,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SWMStep>({
  id: 'sliding-window-max',
  name: '滑动窗口最大值',
  category: 'stack',
  icon: '🪟',
  badge: {
    mode: '单调队列·O(n)',
    complexity: 'O(n) · O(k)',
  },
  card1Title: '🪟 数组窗口与单调队列沙盘',
  card2Title: '🧭 窗口指标与最大值序列监视器',
  card2Desc: '当前窗口范围、单调队列递减序列与输出列表',
  legend: [
    { label: '窗口最大值', color: '#10b981' },
    { label: '窗口内元素', color: '#ef4444' },
    { label: '单调队列元素', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '数组 nums',
      type: 'text',
      defaultValue: '1, 3, -1, -3, 5, 3, 6, 7',
      width: '170px',
      placeholder: '以逗号分隔',
    },
    {
      id: 'input-k',
      label: '窗口 k',
      type: 'number',
      defaultValue: 3,
      width: '45px',
    },
  ],
  presets: [
    { label: '经典示例', values: { 'input-nums': '1, 3, -1, -3, 5, 3, 6, 7', 'input-k': 3 } },
    { label: '单调递减', values: { 'input-nums': '9, 8, 7, 6, 5, 4, 3, 2, 1', 'input-k': 3 } },
    { label: '单调递增', values: { 'input-nums': '1, 2, 3, 4, 5, 6, 7, 8', 'input-k': 4 } },
  ],
  metrics: [
    { id: 'window-max', label: '当前窗口最大值', color: '#10b981' },
    { id: 'window-range', label: '窗口范围 [L..R]', color: '#ef4444' },
    { id: 'deque-size', label: '单调队列大小', color: '#f59e0b' },
  ],
  codeLanguages: SLIDING_WINDOW_MAX_CODE_LANGUAGES,
  problemHtml: SLIDING_WINDOW_MAX_PROBLEM_HTML,
  analysisHtml: SLIDING_WINDOW_MAX_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-nums'] || '1, 3, -1, -3, 5, 3, 6, 7';
    const nums = raw.split(/[,，\s]+/).map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
    const k = parseInt(inputs['input-k'] || '3', 10);
    return buildSlidingWindowMaxSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    const nums = step.nums;
    const deque = step.deque;
    const isDone = step.action === 'done';
    const wL = step.windowLeft;
    const wR = step.windowRight;

    // 数组与窗口元素展示
    const numsHtml = nums
      .map((num, idx) => {
        const inWindow = idx >= wL && idx <= wR && !isDone;
        const isMax = inWindow && deque.length > 0 && num === deque[0];
        let bg = '#ffffff';
        let border = '#e2e8f0';
        let textColor = '#0f172a';

        if (inWindow) {
          if (isMax) {
            bg = '#ecfdf5';
            border = '#10b981';
            textColor = '#047857';
          } else {
            bg = '#fef2f2';
            border = '#f87171';
            textColor = '#ef4444';
          }
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="font-size: 8.5px; color: ${inWindow ? '#ef4444' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
            <div style="min-width: 34px; height: 34px; padding: 0 4px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              ${num}
            </div>
          </div>
        `;
      })
      .join('');

    // 单调队列元素展示 (扁平直排)
    const dequeHtml =
      deque.length === 0
        ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">空队列</span>'
        : deque
            .map((val, idx) => {
              const isFront = idx === 0;
              return `
              <div style="padding: 2px 8px; border-radius: 4px; background: ${isFront ? '#ecfdf5' : '#ffffff'}; border: 1.5px solid ${isFront ? '#10b981' : '#f59e0b'}; color: ${isFront ? '#047857' : '#b45309'}; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                ${val}${isFront ? ' (最大)' : ''}
              </div>
            `;
            })
            .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 12px; box-sizing: border-box; padding: 4px;">
        <!-- 数组与滑动窗口条带 -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>🪟 数组条带 (当前活动窗口 [${wL}..${wR}]):</span>
            <span style="color: #ef4444;">k = ${step.k}</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;">
            ${numsHtml}
          </div>
        </div>

        <div style="border-top: 1px dashed #e2e8f0; margin: 1px 0;"></div>

        <!-- 单调队列容器 (扁平直排) -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 单调队列 (队头最大 → 队尾):</span>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #059669;">队列长度: ${deque.length}</span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
            ${dequeHtml}
          </div>
        </div>
      </div>
    `;

    // 更新指标卡片
    const root = container.closest('#algo-sliding-window-max-view');
    if (root) {
      const maxEl = root.querySelector('#metric-window-max');
      const rangeEl = root.querySelector('#metric-window-range');
      const dequeSizeEl = root.querySelector('#metric-deque-size');

      if (maxEl) maxEl.textContent = deque.length > 0 ? `${deque[0]}` : '—';
      if (rangeEl) rangeEl.textContent = step.windowRight >= 0 ? `[${step.windowLeft}..${step.windowRight}]` : '—';
      if (dequeSizeEl) dequeSizeEl.textContent = `${step.deque.length}`;

      // 在 Card 2 中展示收集的最大值答案
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">收集的最大值答案数组:</span>
            <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #059669;">
              [ ${step.result.join(', ')} ]
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'sliding-window-max',
  name: '滑动窗口最大值',
  viewId: 'algo-sliding-window-max-view',
  category: 'stack',
  description: '单调队列经典应用：维护队头到队尾单调递减，O(1) 获取当前滑动窗口内的最大元素',
  icon: '🪟',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 6,
  learningGoal: '掌握单调队列在滑动窗口最值问题中的精妙设计，理解 push 淘汰较小元素与 pop 仅移出匹配队头的核心准则',
});
