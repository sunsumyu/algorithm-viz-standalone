/**
 * 最小区间 (LeetCode 632) - 声明式教学级沙盘渲染器
 * 核心贪心：小顶堆维护多路游标 + 动态最大值追踪最小跨度
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import {
  SMALLEST_RANGE_CODES,
  SMALLEST_RANGE_LINES,
} from './greedy-091-stage-codes';
import {
  Greedy091Step,
  renderDecisionBalance,
} from './greedy-091-shared';

export interface HeapItem {
  val: number;
  listIdx: number;
  elemIdx: number;
}

export interface SmallestRangeStep extends Greedy091Step {
  lists: number[][];
  heap: HeapItem[];
  maxVal: number;
  ansL: number;
  ansR: number;
  poppedItem?: HeapItem;
  pushedItem?: HeapItem;
  isNewBest?: boolean;
}

export function buildSmallestRangeSteps(lists: number[][]): SmallestRangeStep[] {
  const steps: SmallestRangeStep[] = [];
  const lines = SMALLEST_RANGE_LINES;
  const k = lists.length;

  // Step 0: 入口
  steps.push({
    lists: lists.map(l => [...l]),
    heap: [],
    maxVal: -Infinity,
    ansL: 0,
    ansR: Infinity,
    decision: `主函数入口：接收 k=${k} 个有序列表，准备初始化小顶堆`,
    message: '从小顶堆维护每个列表的当前候选元素，同时追踪当前堆中所有元素的最大值',
    log: `enter smallestRange(k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 初始化堆与 maxVal
  const heap: HeapItem[] = [];
  let maxVal = -Infinity;
  for (let i = 0; i < k; i++) {
    const val = lists[i][0];
    heap.push({ val, listIdx: i, elemIdx: 0 });
    if (val > maxVal) maxVal = val;
  }
  heap.sort((a, b) => a.val - b.val);

  let ansL = 0;
  let ansR = Infinity;

  steps.push({
    lists: lists.map(l => [...l]),
    heap: heap.map(item => ({ ...item })),
    maxVal,
    ansL,
    ansR,
    decision: `初始化小顶堆：填入 ${k} 个列表首项 [${heap.map(h => h.val).join(', ')}]，当前最大值 maxVal=${maxVal}`,
    message: `当前首个区间为 [${heap[0].val}, ${maxVal}]，跨度 = ${maxVal - heap[0].val}`,
    log: `init heap with ${k} elements, maxVal=${maxVal}`,
    codeLine: lines.initHeap,
  });

  // 核心循环：不断弹出最小值并补充后继
  while (heap.length === k) {
    // 弹出堆顶最小值
    heap.sort((a, b) => a.val - b.val);
    const cur = heap.shift()!;
    const curSpan = maxVal - cur.val;
    const bestSpan = ansR - ansL;
    const isNewBest = curSpan < bestSpan;

    if (isNewBest) {
      ansL = cur.val;
      ansR = maxVal;
    }

    steps.push({
      lists: lists.map(l => [...l]),
      heap: heap.map(item => ({ ...item })),
      maxVal,
      ansL,
      ansR,
      poppedItem: { ...cur },
      isNewBest,
      decision: isNewBest
        ? `弹出堆顶最小值 ${cur.val} (来自列表 #${cur.listIdx})，当前候选区间 [${cur.val}, ${maxVal}] 跨度 ${curSpan} < 历史最佳 ${bestSpan === Infinity ? '∞' : bestSpan} ➔ 刷新全局最优解！`
        : `弹出堆顶最小值 ${cur.val} (来自列表 #${cur.listIdx})，当前候选区间 [${cur.val}, ${maxVal}] 跨度 ${curSpan} >= 历史最佳 ${bestSpan} ➔ 保持原解`,
      message: `当前全局最优区间: [${ansL}, ${ansR}] (跨度 ${ansR - ansL})`,
      log: `pop min=${cur.val} list=${cur.listIdx} span=${curSpan} newBest=${isNewBest}`,
      codeLine: isNewBest ? lines.checkAns : lines.popMin,
    });

    // 检查是否有下一个元素
    if (cur.elemIdx + 1 < lists[cur.listIdx].length) {
      const nextVal = lists[cur.listIdx][cur.elemIdx + 1];
      const nextItem: HeapItem = { val: nextVal, listIdx: cur.listIdx, elemIdx: cur.elemIdx + 1 };
      heap.push(nextItem);
      if (nextVal > maxVal) maxVal = nextVal;
      heap.sort((a, b) => a.val - b.val);

      steps.push({
        lists: lists.map(l => [...l]),
        heap: heap.map(item => ({ ...item })),
        maxVal,
        ansL,
        ansR,
        pushedItem: { ...nextItem },
        decision: `压入列表 #${cur.listIdx} 的下一项 ${nextVal} 到小顶堆，更新 maxVal=max(${maxVal}, ${nextVal})=${maxVal}`,
        message: `当前堆容量恢复为 ${heap.length}，准备进入下一轮极值探测`,
        log: `push next=${nextVal} list=${cur.listIdx} newMax=${maxVal}`,
        codeLine: lines.pushNext,
      });
    } else {
      steps.push({
        lists: lists.map(l => [...l]),
        heap: heap.map(item => ({ ...item })),
        maxVal,
        ansL,
        ansR,
        decision: `列表 #${cur.listIdx} 元素已全部遍历耗尽！无法再包含该列表的数值，算法终止`,
        message: `最终收敛全局最小区间: [${ansL}, ${ansR}]`,
        log: `list #${cur.listIdx} exhausted, terminating`,
        codeLine: lines.done,
      });
      break;
    }
  }

  // 最终收敛帧
  steps.push({
    lists: lists.map(l => [...l]),
    heap: heap.map(item => ({ ...item })),
    maxVal,
    ansL,
    ansR,
    decision: `🎉 推演完成！包含每个列表至少一个数的全局最小区间为 [${ansL}, ${ansR}] (跨度 = ${ansR - ansL})`,
    message: '算法成功收敛',
    log: `done ans=[${ansL},${ansR}]`,
    codeLine: lines.done,
  });

  return steps;
}

export const smallestRangeVisualizer = registerDeclarativeAlgorithm<SmallestRangeStep>({
  id: 'smallest-range-covering-elements-from-k-lists',
  name: '最小区间 (Smallest Range)',
  category: 'greedy',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 912,
  learningGoal: '掌握小顶堆维护多路有序游标与动态更新最大值的贪心滑动窗口原理',
  problemHtml: GREEDY_091_PROBLEMS.smallestRange.html,
  analysisHtml: GREEDY_091_PROBLEMS.smallestRange.html,
  inputs: [
    {
      id: 'input-lists',
      label: '有序列表集合 (分号隔开各行)',
      type: 'text',
      defaultValue: '4,10,15,24,26; 0,9,12,20; 5,18,22,30',
      placeholder: '4,10,15,24,26; 0,9,12,20; 5,18,22,30',
    },
  ],
  codeLanguages: SMALLEST_RANGE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-lists'] || '4,10,15,24,26; 0,9,12,20; 5,18,22,30');
    const lists = raw.split(';').map(line =>
      line.trim().split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    ).filter(l => l.length > 0);
    return buildSmallestRangeSteps(lists);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SmallestRangeStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    const bestText = step.ansR === Infinity ? '尚未形成' : `[${step.ansL}, ${step.ansR}] (跨度 ${step.ansR - step.ansL})`;
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">当前最大值 maxVal:</span>
          <span style="font-size: 13px; font-weight: 700; color: #ef4444; font-family: 'JetBrains Mono', monospace;">${step.maxVal === -Infinity ? '-∞' : step.maxVal}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; align-items: center;">
          <span style="color: #64748b;">历史最佳最小区间:</span>
          <span style="color: #059669; font-weight: 700; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #10b98140;">${bestText}</span>
        </div>
      </div>
    `;

    // 中部：多路列表与游标展示
    const listsBox = document.createElement('div');
    listsBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

    step.lists.forEach((list, listIdx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; gap: 8px;';

      const label = document.createElement('div');
      label.style.cssText = 'width: 60px; font-size: 11px; font-weight: 700; color: #475569; font-family: "JetBrains Mono", monospace;';
      label.textContent = `List #${listIdx}:`;
      row.appendChild(label);

      const itemsContainer = document.createElement('div');
      itemsContainer.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap; align-items: center;';

      // 查找该列表中当前在堆中的游标
      const heapItem = step.heap.find(h => h.listIdx === listIdx);

      list.forEach((val, elemIdx) => {
        const isCurInHeap = heapItem && heapItem.elemIdx === elemIdx;
        const isPopped = step.poppedItem && step.poppedItem.listIdx === listIdx && step.poppedItem.elemIdx === elemIdx;

        let bg = '#f8fafc';
        let border = '#e2e8f0';
        let text = '#64748b';

        if (isCurInHeap) {
          bg = '#eff6ff';
          border = '#3b82f6';
          text = '#1d4ed8';
        } else if (isPopped) {
          bg = '#fef2f2';
          border = '#ef4444';
          text = '#b91c1c';
        }

        const card = document.createElement('div');
        card.style.cssText = `min-width: 34px; height: 28px; padding: 0 6px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; color: ${text}; position: relative;`;
        card.textContent = String(val);

        if (isCurInHeap) {
          const badge = document.createElement('div');
          badge.style.cssText = 'position: absolute; top: -6px; right: -4px; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; border: 1.5px solid #fff;';
          card.appendChild(badge);
        }

        itemsContainer.appendChild(card);
      });

      row.appendChild(itemsContainer);
      listsBox.appendChild(row);
    });
    mainCard.appendChild(listsBox);

    // 底部：当前小顶堆卡片
    const heapBox = document.createElement('div');
    heapBox.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;';
    const heapHtml = step.heap.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">小顶堆为空</span>'
      : step.heap.map((h, idx) => {
          const isMin = idx === 0;
          return `
            <div style="padding: 4px 8px; border-radius: 6px; background: ${isMin ? '#ecfdf5' : '#ffffff'}; border: 1.5px solid ${isMin ? '#10b981' : '#cbd5e1'}; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: ${isMin ? '#047857' : '#334155'};">
              ${h.val} <span style="font-size: 9px; color: #94a3b8;">(L#${h.listIdx})</span>
            </div>
          `;
        }).join('');

    heapBox.innerHTML = `
      <span style="font-size: 11px; font-weight: 700; color: #1e293b; min-width: 70px;">小顶堆 (Heap):</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">${heapHtml}</div>
    `;
    mainCard.appendChild(heapBox);

    stageContainer.appendChild(mainCard);
  },
});
