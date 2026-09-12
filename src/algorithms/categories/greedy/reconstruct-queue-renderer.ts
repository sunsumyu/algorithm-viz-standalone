/**
 * 根据身高重建队列可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 406：[身高降序, k 升序] 排序，高个子先入队，矮个子直接按 k 插入对应槽位
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RECONSTRUCT_QUEUE_PROBLEM_HTML,
  RECONSTRUCT_QUEUE_ANALYSIS_HTML,
  RECONSTRUCT_QUEUE_CODE_LANGUAGES,
} from './reconstruct-queue-problem-content';

export interface RQStep {
  sorted: Array<[number, number]>;
  currentIndex: number;
  currentPerson: [number, number] | null;
  queue: Array<[number, number]>;
  insertIndex: number;
  action: 'init' | 'sort' | 'insert' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
  log?: string;
}

export function buildReconstructQueueSteps(rawPeople: Array<[number, number]>): RQStep[] {
  const steps: RQStep[] = [];
  const n = rawPeople.length;

  if (n === 0) {
    steps.push({
      sorted: [],
      currentIndex: -1,
      currentPerson: null,
      queue: [],
      insertIndex: -1,
      action: 'done',
      message: '输入为空，返回空数组',
      codeLine: 1,
    });
    return steps;
  }

  // 1. 身高降序，k 升序
  const sorted = rawPeople.map(([h, k]) => [h, k] as [number, number]).sort((a, b) => {
    if (a[0] === b[0]) return a[1] - b[1];
    return b[0] - a[0];
  });

  const queue: Array<[number, number]> = [];

  steps.push({
    sorted: sorted.map(([h, k]) => [h, k]),
    currentIndex: -1,
    currentPerson: null,
    queue: [],
    insertIndex: -1,
    action: 'sort',
    message: `第 1 步：按 [身高降序, k 升序] 排序完成：${sorted.map((p) => `[${p[0]},${p[1]}]`).join(', ')}`,
    codeLine: 4,
  });

  for (let i = 0; i < n; i++) {
    const p = sorted[i];
    const targetK = p[1];

    queue.splice(targetK, 0, [p[0], p[1]]);

    steps.push({
      sorted: sorted.map(([h, k]) => [h, k]),
      currentIndex: i,
      currentPerson: [p[0], p[1]],
      queue: queue.map(([h, k]) => [h, k]),
      insertIndex: targetK,
      action: 'insert',
      message: `📥 处理人员 [${p[0]}, ${p[1]}] (身高 ${p[0]}, 前方需 ${p[1]} 个更高者) &rarr; 贪心插入到队列 index = ${targetK} 处！`,
      codeLine: 8,
    });
  }

  steps.push({
    sorted: sorted.map(([h, k]) => [h, k]),
    currentIndex: n - 1,
    currentPerson: null,
    queue: queue.map(([h, k]) => [h, k]),
    insertIndex: -1,
    action: 'done',
    message: `🎉 队列重建完成！最终满足所有人身前身高要求：${queue.map((p) => `[${p[0]},${p[1]}]`).join(', ')}`,
    codeLine: 10,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: RQStep[]): RQStep[] {
  return steps.map((s) => {
    const p = s.currentPerson;

    let action = '🔍 排序 / 准备';
    if (s.action === 'sort') action = '🔀 身高降序 k 升序排序';
    else if (s.action === 'insert') action = '📥 按 k 精准插入槽位';
    else if (s.action === 'done') action = '🎉 重建完成';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-person': p ? `[身高: ${p[0]}, k: ${p[1]}]` : '—',
        'insert-idx': s.insertIndex >= 0 ? `第 [${s.insertIndex}] 位` : '—',
        'queue-len': String(s.queue.length),
        queue: `[${s.queue.map(([h, k]) => `${h},${k}`).join(' ')}]`,
        action,
      },
    };
  });
}

/** 主视觉：排序流 + 重建队列沙盘 */
export function renderReconstructQueueCanvas(container: HTMLElement, step: RQStep): void {
  const sorted = step.sorted;
  const queue = step.queue;
  const n = sorted.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const sortedHtml = sorted
    .map(([h, k], idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isProcessed = idx < curIdx || isDone;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#f0fdf4';
        borderColor = '#16a34a';
        textColor = '#16a34a';
      } else if (isProcessed) {
        bg = '#f8fafc';
        borderColor = '#cbd5e1';
        textColor = '#94a3b8';
      }

      return `
        <div style="width: 44px; height: 42px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <span>${h}</span>
          <span style="font-size: 8.5px; color: #64748b;">k=${k}</span>
        </div>
      `;
    })
    .join('');

  const queueHtml = queue
    .map(([h, k], idx) => {
      const isJustInserted = idx === step.insertIndex;

      let bg = '#ffffff';
      let borderColor = '#a7f3d0';
      let textColor = '#065f46';

      if (isJustInserted) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#047857';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isJustInserted ? '#10b981' : '#94a3b8'}; font-weight: 700;">
            [${idx}]
          </span>
          <div style="width: 46px; height: 46px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
            <span>h=${h}</span>
            <span style="font-size: 9px; color: #059669; font-weight: 700;">k=${k}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
        <span>1️⃣ 待插入序列 (按身高降序, k 升序):</span>
        <span style="color: #16a34a;">已处理: ${Math.min(n, Math.max(0, curIdx + 1))} / ${n}</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
        ${sortedHtml}
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
        <span>2️⃣ 重建后的队列 (按照 k 值精准插入对应槽位):</span>
        <span>当前队长: ${queue.length}</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0; min-height: 52px; align-items: center;">
        ${queue.length > 0 ? queueHtml : '<span style="font-size: 11px; color: #94a3b8; padding-left: 4px;">队列初始为空...</span>'}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'reconstruct-queue',
  name: '根据身高重建队列',
  category: 'greedy',
  description: '身高降序且 k 升序排序，高个子先入队确定相对骨架，矮个子直接按 k 插入槽位',
  icon: '👥',
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '掌握双维度贪心问题的排序拆解技巧，理解高维度先入队、低维度插空的经典解法',
  inputs: [
    {
      id: 'people',
      label: '人群 [身高, k] 二元组',
      type: 'text',
      defaultValue: '[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]',
      placeholder: '[[h,k],...]',
    },
  ],
  presets: [
    { label: '示例 1 (6人)', values: { people: '[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]' } },
    { label: '示例 2 (6人)', values: { people: '[[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]]' } },
    { label: '密集高个 (6人)', values: { people: '[[2,4],[3,4],[4,4],[5,0],[6,0],[7,0]]' } },
  ],
  metrics: [
    { id: 'cur-person', label: '当前待插人员', color: '#16a34a' },
    { id: 'insert-idx', label: '目标插入槽位', color: '#2563eb' },
    { id: 'queue-len', label: '当前队长', color: '#10b981' },
    { id: 'queue', label: '重建队列', color: '#059669' },
    { id: 'action', label: '贪心动作', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前待插', color: '#16a34a' },
    { label: '✓ 已入队', color: '#10b981' },
    { label: '⏳ 待处理', color: '#cbd5e1' },
  ],
  codeLanguages: RECONSTRUCT_QUEUE_CODE_LANGUAGES,
  problemHtml: RECONSTRUCT_QUEUE_PROBLEM_HTML,
  analysisHtml: RECONSTRUCT_QUEUE_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const raw = String(inputs.people ?? '[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]');
    let people: Array<[number, number]> = [];
    try {
      people = JSON.parse(raw);
    } catch {
      people = [];
    }
    return withMetrics(
      buildReconstructQueueSteps(people.length ? people : ([[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]] as Array<[number, number]>))
    );
  },
  renderCanvas: (container, step) => renderReconstructQueueCanvas(container, step as RQStep),
});
