/**
 * 前 K 个高频元素可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 347：哈希统计频次 + 维护大小为 k 的小顶堆 (Min-Heap)，堆顶淘汰低频元素
 * 遵循 Zero-Subbox 规范，100% 扁平画板，彻底消除嵌套白色边框卡片
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TOP_K_FREQUENT_PROBLEM_HTML,
  TOP_K_FREQUENT_ANALYSIS_HTML,
  TOP_K_FREQUENT_CODE_LANGUAGES,
} from './top-k-frequent-problem-content';

export interface HeapItem {
  num: number;
  freq: number;
}

export interface TKFStep {
  nums: number[];
  k: number;
  freqMap: Map<number, number>;
  heap: HeapItem[];
  currentEntry: { num: number; freq: number } | null;
  poppedRoot: HeapItem | null;
  result: number[];
  action: 'init' | 'count_freq' | 'heap_push' | 'heap_poll_min' | 'collect_result' | 'done';
  message: string;
  codeLine: number;
}

export function buildTopKFrequentSteps(rawNums: number[], k: number): TKFStep[] {
  const steps: TKFStep[] = [];
  const nums = [...rawNums];
  const n = nums.length;

  if (n === 0 || k <= 0) {
    steps.push({
      nums: [],
      k,
      freqMap: new Map(),
      heap: [],
      currentEntry: null,
      poppedRoot: null,
      result: [],
      action: 'done',
      message: '输入无效或 k <= 0',
      codeLine: 1,
    });
    return steps;
  }

  // 1. 统计频率
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [],
    currentEntry: null,
    poppedRoot: null,
    result: [],
    action: 'init',
    message: `初始化：共 ${n} 个元素，统计得到 ${freqMap.size} 个不同元素的出现频次，准备建立容量为 k=${k} 的小顶堆`,
    codeLine: 2,
  });

  // 2. 维护大小为 k 的小顶堆
  const heap: HeapItem[] = [];

  const heapPush = (item: HeapItem) => {
    heap.push(item);
    heap.sort((a, b) => a.freq - b.freq);
  };

  const heapPoll = (): HeapItem => {
    return heap.shift()!;
  };

  for (const [num, freq] of freqMap.entries()) {
    heapPush({ num, freq });

    steps.push({
      nums: [...nums],
      k,
      freqMap: new Map(freqMap),
      heap: [...heap],
      currentEntry: { num, freq },
      poppedRoot: null,
      result: [],
      action: 'heap_push',
      message: `📥 将元素 [值:${num}, 频次:${freq}] 压入小顶堆。当前堆大小: ${heap.length} / ${k}`,
      codeLine: 7,
    });

    if (heap.length > k) {
      const min = heapPoll();
      steps.push({
        nums: [...nums],
        k,
        freqMap: new Map(freqMap),
        heap: [...heap],
        currentEntry: { num, freq },
        poppedRoot: min,
        result: [],
        action: 'heap_poll_min',
        message: `💥 堆大小达到 ${k + 1} 超出限制！弹出当前堆顶最小频次元素 [值:${min.num}, 频次:${min.freq}]，保留较高频元素`,
        codeLine: 9,
      });
    }
  }

  // 3. 收集结果
  const result: number[] = [];
  const tempHeap = [...heap];
  while (tempHeap.length > 0) {
    result.unshift(tempHeap.shift()!.num);
  }

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [...heap],
    currentEntry: null,
    poppedRoot: null,
    result: [...result],
    action: 'collect_result',
    message: `🥇 遍历完毕！堆内留存的 ${heap.length} 个元素即为全数组出现频次最高的前 ${k} 个元素`,
    codeLine: 12,
  });

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [...heap],
    currentEntry: null,
    poppedRoot: null,
    result: [...result],
    action: 'done',
    message: `🎉 前 K 个高频元素计算完成！最终输出结果: [${result.join(', ')}]`,
    codeLine: 15,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TKFStep>({
  id: 'top-k-frequent',
  name: '前 K 个高频元素',
  category: 'stack',
  icon: '🏆',
  badge: {
    mode: '哈希计数+小顶堆',
    complexity: 'O(N log K) · O(N)',
  },
  card1Title: '📊 频次统计与小顶堆沙盘',
  card2Title: '🧭 堆维护状态与 Top-K 结果监视器',
  card2Desc: '当前考察项、堆顶最小频次元素与最终输出',
  legend: [
    { label: '小顶堆元素', color: '#10b981' },
    { label: '堆顶最小频次', color: '#ef4444' },
    { label: '哈希统计项', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '输入数组',
      type: 'text',
      defaultValue: '1, 1, 1, 2, 2, 3',
      width: '150px',
      placeholder: '以逗号分隔',
    },
    {
      id: 'input-k',
      label: '前 K 个',
      type: 'number',
      defaultValue: 2,
      width: '45px',
    },
  ],
  presets: [
    { label: '经典示例', values: { 'input-nums': '1, 1, 1, 2, 2, 3', 'input-k': 2 } },
    { label: '单元素多频', values: { 'input-nums': '1', 'input-k': 1 } },
    { label: '复杂多频次', values: { 'input-nums': '4, 1, -1, 2, -1, 2, 3, 2, 3, 3, 3', 'input-k': 2 } },
  ],
  metrics: [
    { id: 'heap-size', label: '小顶堆容量', color: '#10b981' },
    { id: 'unique-count', label: '不同元素数', color: '#f59e0b' },
    { id: 'top-freq-val', label: '堆顶最小频次', color: '#ef4444' },
  ],
  codeLanguages: TOP_K_FREQUENT_CODE_LANGUAGES,
  problemHtml: TOP_K_FREQUENT_PROBLEM_HTML,
  analysisHtml: TOP_K_FREQUENT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-nums'] || '1, 1, 1, 2, 2, 3';
    const nums = raw.split(/[,，\s]+/).map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
    const k = parseInt(inputs['input-k'] || '2', 10);
    return buildTopKFrequentSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    const freqMap = step.freqMap;
    const heap = step.heap;
    const curEntry = step.currentEntry;

    // 1. 哈希频次项展示 (扁平直排)
    const freqHtml = Array.from(freqMap.entries())
      .map(([num, freq]) => {
        const isCurrent = curEntry !== null && curEntry.num === num;
        let bg = '#ffffff';
        let border = '#e2e8f0';
        let textColor = '#334155';

        if (isCurrent) {
          bg = '#fffbeb';
          border = '#f59e0b';
          textColor = '#b45309';
        }

        return `
          <div style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: ${bg}; border: 1.5px solid ${border}; font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 700;">
            <span style="color: ${textColor};">${num}</span>
            <span style="color: #64748b; font-size: 9.5px;">×${freq}</span>
          </div>
        `;
      })
      .join('');

    // 2. 小顶堆展示 (扁平直排)
    const heapHtml =
      heap.length === 0
        ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">小顶堆为空</span>'
        : heap
            .map((item, idx) => {
              const isRoot = idx === 0;
              const bg = isRoot ? '#fef2f2' : '#ecfdf5';
              const border = isRoot ? '#ef4444' : '#10b981';
              const textColor = isRoot ? '#b91c1c' : '#047857';

              return `
              <div style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; background: ${bg}; border: 1.5px solid ${border}; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; color: ${textColor};">
                <span>${item.num}</span>
                <span style="font-size: 9.5px; opacity: 0.85;">(频:${item.freq})${isRoot ? ' [堆顶最小]' : ''}</span>
              </div>
            `;
            })
            .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-around; gap: 8px; box-sizing: border-box;">
        <!-- 哈希频次统计表 (扁平排布) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #d97706;">
            <span>📊 哈希频次统计表 (Map):</span>
            <span>不同元素: ${freqMap.size} 项</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0; align-items: center; min-height: 28px;">
            ${freqHtml}
          </div>
        </div>

        <div style="border-top: 1px dashed #e2e8f0; margin: 2px 0;"></div>

        <!-- 小顶堆 (扁平直排) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #059669;">🥞 容量为 k=${step.k} 的小顶堆 (堆顶频次最小 → 堆底):</span>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #10b981;">容量: ${heap.length} / ${step.k}</span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
            ${heapHtml}
          </div>
        </div>
      </div>
    `;

    // 更新指标卡片
    const root = container.closest('#algo-top-k-frequent-view');
    if (root) {
      const heapSizeEl = root.querySelector('#metric-heap-size');
      const uniqueEl = root.querySelector('#metric-unique-count');
      const topFreqEl = root.querySelector('#metric-top-freq-val');

      if (heapSizeEl) heapSizeEl.textContent = `${heap.length} / ${step.k}`;
      if (uniqueEl) uniqueEl.textContent = `${freqMap.size}`;
      if (topFreqEl) topFreqEl.textContent = heap.length > 0 ? `值:${heap[0].num} (频:${heap[0].freq})` : '—';

      // 在 Card 2 中展示当前收集的 Top-K 结果
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">当前 Top-${step.k} 结果列表:</span>
            <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #d97706;">
              [ ${step.result.join(', ')} ]
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'top-k-frequent',
  name: '前 K 个高频元素',
  viewId: 'algo-top-k-frequent-view',
  category: 'stack',
  description: '哈希统计频次 + 维护大小为 k 的小顶堆，堆顶淘汰低频元素，最终堆内保留前 K 高频',
  icon: '🏆',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握利用小顶堆维护 Top-K 最优状态的经典算法模式，理解为什么求前 K 大需要用小顶堆',
});
