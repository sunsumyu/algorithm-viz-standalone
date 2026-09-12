/**
 * 无重叠区间可视化器（贪心算法）
 * LeetCode 435：找到最少的区间数量使得剩余区间不重叠
 */


import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
interface IntervalStep {
  intervals: [number, number][];
  currentIndex: number;
  selected: number[];
  removed: number[];
  currentEnd: number;
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
  log?: string;
}

/**
 * 无重叠区间算法（贪心），生成可视化步骤
 */
function intervalSteps(intervals: [number, number][]): IntervalStep[] {
  const steps: IntervalStep[] = [];

  if (intervals.length === 0) {
    steps.push({
      intervals: [],
      currentIndex: -1,
      selected: [],
      removed: [],
      currentEnd: -Infinity,
      message: '输入为空，返回 0',
      codeLine: 1
    });
    return steps;
  }

  // 按终点排序（贪心策略：优先选择终点小的区间）
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let end = -Infinity;
  const selected: number[] = [];
  const removed: number[] = [];

  // 初始状态
  steps.push({
    intervals: sorted,
    currentIndex: -1,
    selected: [],
    removed: [],
    currentEnd: end,
    message: '按区间终点升序排序，准备贪心选择',
    codeLine: 4
  });

  for (let i = 0; i < sorted.length; i++) {
    const interval = sorted[i];

    steps.push({
      intervals: sorted,
      currentIndex: i,
      selected: [...selected],
      removed: [...removed],
      currentEnd: end,
      message: `考虑区间 ${i}: [${interval[0]}, ${interval[1]}]，当前终点 = ${end === -Infinity ? '-' : end}`,
      codeLine: 8
    });

    if (interval[0] >= end) {
      // 不重叠，选择该区间
      selected.push(i);
      end = interval[1];

      steps.push({
        intervals: sorted,
        currentIndex: i,
        selected: [...selected],
        removed: [...removed],
        currentEnd: end,
        message: `区间起点 ${interval[0]} >= 当前终点 ${end === interval[1] ? interval[1] : end}，不重叠，选择该区间`,
        codeLine: 9
      });
    } else {
      // 重叠，移除该区间
      removed.push(i);

      steps.push({
        intervals: sorted,
        currentIndex: i,
        selected: [...selected],
        removed: [...removed],
        currentEnd: end,
        message: `区间起点 ${interval[0]} < 当前终点 ${end}，重叠，移除该区间`,
        codeLine: 13
      });
    }
  }

  // 完成
  steps.push({
    intervals: sorted,
    currentIndex: sorted.length,
    selected: [...selected],
    removed: [...removed],
    currentEnd: end,
    message: `完成！移除 ${removed.length} 个重叠区间`,
    codeLine: 16
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: IntervalStep[]): IntervalStep[] {
  return steps.map((s) => ({
    ...s,
    log: s.message,
    metrics: {
      selected: String(s.selected.length),
      removed: String(s.removed.length),
      'cur-end': s.currentEnd === -Infinity ? '—' : String(s.currentEnd),
      'cur-idx': s.currentIndex >= 0 ? `#${s.currentIndex} [${s.intervals[s.currentIndex]?.[0] ?? ''}, ${s.intervals[s.currentIndex]?.[1] ?? ''}]` : '—',
    },
  }));
}

/** 主视觉：区间保留/移除列表 */
export function renderIntervalCanvas(container: HTMLElement, step: IntervalStep): void {
  const itemsHtml = step.intervals
    .map((interval, index) => {
      const isCurrent = index === step.currentIndex;
      const isSelected = step.selected.includes(index);
      const isRemoved = step.removed.includes(index);

      let bg = 'rgba(20, 18, 38, 0.45)';
      let border = 'rgba(255, 255, 255, 0.1)';
      let opacity = '1';
      let transform = 'none';
      let textColor = '#e2e8f0';

      if (isCurrent) {
        bg = 'rgba(167, 139, 250, 0.18)';
        border = '#a78bfa';
        transform = 'scale(1.02)';
      } else if (isSelected) {
        bg = 'rgba(236, 72, 153, 0.14)';
        border = '#ec4899';
      } else if (isRemoved) {
        bg = 'rgba(248, 113, 113, 0.1)';
        border = 'rgba(248, 113, 113, 0.4)';
        opacity = '0.55';
      }

      return `
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; border: 1px solid ${border}; background: ${bg}; opacity: ${opacity}; transform: ${transform}; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); font-family: 'JetBrains Mono', monospace; color: ${textColor};">
          <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">#${index}</span>
          <span style="font-size: 13px; font-weight: 700; color: ${isCurrent ? '#c4b5fd' : textColor};">[${interval[0]}, ${interval[1]}]</span>
          ${isSelected ? '<span style="font-size: 10px; font-weight: 800; color: #f9a8d4; background: rgba(236, 72, 153, 0.2); padding: 2px 6px; border-radius: 4px;">保留</span>' : ''}
          ${isRemoved ? '<span style="font-size: 10px; font-weight: 800; color: #fca5a5; background: rgba(248, 113, 113, 0.2); padding: 2px 6px; border-radius: 4px;">移除</span>' : ''}
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box; overflow-y: auto;">
      ${itemsHtml}
    </div>
  `;
}

function parseIntervals(raw: string): [number, number][] {
  const input = raw.trim();
  if (input) {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((arr: [number, number]) => [arr[0], arr[1]] as [number, number]);
      }
    } catch {
      const nums = input.split(',').map((n) => parseInt(n.trim(), 10));
      if (nums.length > 0 && nums.length % 2 === 0) {
        const intervals: [number, number][] = [];
        for (let i = 0; i < nums.length; i += 2) intervals.push([nums[i], nums[i + 1]]);
        return intervals;
      }
    }
  }
  return [[1, 2], [2, 3], [3, 4], [1, 3]];
}

registerDeclarativeAlgorithm({
  id: 'interval',
  name: '无重叠区间',
  category: 'greedy',
  description: 'LeetCode 435：贪心算法，找到最少的区间数量使得剩余区间不重叠',
  icon: '📐',
  difficulty: 2,
  levelOrder: 999,
  learningGoal: '理解区间排序后贪心求不重叠数量的思路',
  inputs: [
    {
      id: 'intervals',
      label: '区间集合',
      type: 'text',
      defaultValue: '[[1,2],[2,3],[3,4],[1,3]]',
      placeholder: '[[start,end],...]',
    },
  ],
  presets: [
    { label: '基础示例', values: { intervals: '[[1,2],[2,3],[3,4],[1,3]]' } },
    { label: '嵌套重叠', values: { intervals: '[[1,10],[2,3],[4,5],[6,7]]' } },
    { label: '全不重叠', values: { intervals: '[[1,2],[3,4],[5,6],[7,8]]' } },
  ],
  metrics: [
    { id: 'selected', label: '保留区间数', color: '#ec4899' },
    { id: 'removed', label: '移除区间数', color: '#f87171' },
    { id: 'cur-end', label: '当前右边界', color: '#a78bfa' },
    { id: 'cur-idx', label: '当前区间', color: '#a78bfa' },
  ],
  legend: [
    { label: '📍 当前考察', color: '#a78bfa' },
    { label: '✓ 保留', color: '#ec4899' },
    { label: '✗ 移除', color: '#f87171' },
  ],
  generateSteps: (inputs) => withMetrics(intervalSteps(parseIntervals(String(inputs.intervals ?? '[[1,2],[2,3],[3,4],[1,3]]')))),
  renderCanvas: (container, step) => renderIntervalCanvas(container, step as IntervalStep),
});
