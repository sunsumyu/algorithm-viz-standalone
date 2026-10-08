import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface PartitionStep extends StepBase {
  str: string;
  currentIndex: number;
  currentChar: string;
  lastOccurrence: Record<string, number>;
  currentEnd: number;
  partitionStart: number;
  partitions: number[];
  cutIndices: number[];
  action: 'init' | 'scan' | 'cut' | 'done';
  message: string;
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const PARTITION_LABELS_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  init: { java: 7, cpp: 6, python: 3, javascript: 4 },
  scan: { java: 12, cpp: 11, python: 8, javascript: 9 },
  cut: { java: 14, cpp: 13, python: 10, javascript: 11 },
  done: { java: 18, cpp: 17, python: 12, javascript: 15 },
};

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: PartitionStep[]): PartitionStep[] {
  return steps.map((s) => {
    const isCut = s.action === 'cut';

    let action = '🔍 扫描扩展右边界';
    if (isCut) action = '✂️ 触碰右界 (即刻切割)';
    else if (s.action === 'done') action = '🏁 全部切分完成';
    else if (s.action === 'init') action = '初始化';

    const char = s.currentChar;
    const last = char ? s.lastOccurrence[char] : -1;

    return {
      ...s,
      decision: s.decision ?? action,
      log: s.log ?? s.message,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'cur-char': char ? `'${char}'` : '—',
        'last-pos': char ? `[${last >= 0 ? last : '-'}]` : '—',
        'cur-partition': `[${s.partitionStart} .. ${s.currentEnd}]`,
        'partition-count': `${s.partitions.length} 个`,
        'partition-list': s.partitions.length ? `[${s.partitions.join(', ')}]` : '—',
        action,
      },
    };
  });
}

export function buildPartitionLabelsSteps(s: string): PartitionStep[] {
  const steps: PartitionStep[] = [];
  const n = s.length;
  const lines = PARTITION_LABELS_CODE_LINES;

  if (n === 0) {
    steps.push({
      str: '',
      currentIndex: -1,
      currentChar: '',
      lastOccurrence: {},
      currentEnd: 0,
      partitionStart: 0,
      partitions: [],
      cutIndices: [],
      action: 'done',
      message: '字符串为空，划分片段数为 0',
      decision: '空字符串',
      codeLine: lines.guard,
      line: getLine(lines.guard),
    });
    return withMetrics(steps);
  }

  // 1. 统计每个字符最后出现的位置
  const lastOccurrence: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    lastOccurrence[s[i]] = i;
  }

  steps.push({
    str: s,
    currentIndex: -1,
    currentChar: '',
    lastOccurrence: { ...lastOccurrence },
    currentEnd: 0,
    partitionStart: 0,
    partitions: [],
    cutIndices: [],
    action: 'init',
    message: `第 1 步：统计所有 ${Object.keys(lastOccurrence).length} 种不同字符的最后出现下标`,
    decision: '统计最后出现下标',
    codeLine: lines.init,
    line: getLine(lines.init),
  });

  let start = 0;
  let end = 0;
  const partitions: number[] = [];
  const cutIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    const char = s[i];
    const lastPos = lastOccurrence[char];
    const oldEnd = end;
    end = Math.max(end, lastPos);

    steps.push({
      str: s,
      currentIndex: i,
      currentChar: char,
      lastOccurrence: { ...lastOccurrence },
      currentEnd: end,
      partitionStart: start,
      partitions: [...partitions],
      cutIndices: [...cutIndices],
      action: 'scan',
      message: `🔍 扫描 s[${i}]='${char}' (最后出现在 [${lastPos}])，当前片段边界更新为 max(${oldEnd}, ${lastPos}) = ${end}`,
      decision: `更新右边界为 ${end}`,
      codeLine: lines.scan,
      line: getLine(lines.scan),
    });

    if (i === end) {
      const len = end - start + 1;
      partitions.push(len);
      cutIndices.push(i);

      steps.push({
        str: s,
        currentIndex: i,
        currentChar: char,
        lastOccurrence: { ...lastOccurrence },
        currentEnd: end,
        partitionStart: start,
        partitions: [...partitions],
        cutIndices: [...cutIndices],
        action: 'cut',
        message: `✂️ 触碰最远边界 [${i}]！片段 "${s.substring(start, end + 1)}" 内字符后续不再出现，切分出长度为 ${len} 的片段！`,
        decision: `触碰最远边界切分片段长度 ${len}`,
        codeLine: lines.cut,
        line: getLine(lines.cut),
      });

      start = i + 1;
    }
  }

  steps.push({
    str: s,
    currentIndex: n - 1,
    currentChar: '',
    lastOccurrence: { ...lastOccurrence },
    currentEnd: n - 1,
    partitionStart: start,
    partitions: [...partitions],
    cutIndices: [...cutIndices],
    action: 'done',
    message: `🎉 字符串划分完成！共划分为 ${partitions.length} 个片段：[${partitions.join(', ')}]`,
    decision: '字符串划分完成',
    codeLine: lines.done,
    line: getLine(lines.done),
  });

  return withMetrics(steps);
}
