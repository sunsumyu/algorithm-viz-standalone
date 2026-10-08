import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface RQStep extends StepBase {
  sorted: Array<[number, number]>;
  currentIndex: number;
  currentPerson: [number, number] | null;
  queue: Array<[number, number]>;
  insertIndex: number;
  action: 'init' | 'sort' | 'insert' | 'done';
  message: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const RECONSTRUCT_QUEUE_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 1, cpp: 3, python: 2, javascript: 1 },
  sort: { java: 3, cpp: 4, python: 4, javascript: 2 },
  insert: { java: 10, cpp: 11, python: 7, javascript: 8 },
  done: { java: 12, cpp: 13, python: 8, javascript: 10 },
};

export function parsePeople(raw: string): Array<[number, number]> {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((arr: [number, number]) => [arr[0], arr[1]] as [number, number]);
    }
  } catch {
    // fallback
  }
  return [
    [7, 0],
    [4, 4],
    [7, 1],
    [5, 0],
    [6, 1],
    [5, 2],
  ];
}

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: RQStep[]): RQStep[] {
  return steps.map((s) => {
    const p = s.currentPerson;

    let action = '🔍 排序 / 准备';
    if (s.action === 'sort') action = '🔀 身高降序 k 升序排序';
    else if (s.action === 'insert') action = '📥 按 k 精准插入槽位';
    else if (s.action === 'done') action = '🎉 重建完成';

    return {
      ...s,
      line: getLine(s.codeLine),
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
      codeLine: RECONSTRUCT_QUEUE_CODE_LINES.guard,
    });
    return withMetrics(steps);
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
    codeLine: RECONSTRUCT_QUEUE_CODE_LINES.sort,
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
      message: `📥 处理人员 [${p[0]}, ${p[1]}] (身高 ${p[0]}, 前方需 ${p[1]} 个更高者) → 贪心插入到队列 index = ${targetK} 处！`,
      codeLine: RECONSTRUCT_QUEUE_CODE_LINES.insert,
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
    codeLine: RECONSTRUCT_QUEUE_CODE_LINES.done,
  });

  return withMetrics(steps);
}
