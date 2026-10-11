/**
 * 环形链表 II — 步进推演编译器
 * LeetCode 142：快慢指针判环 + 数学推导 (x = z) 定位入环口
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface CycleStep {
  values: number[];
  pos: number; // 入环下标，-1 无环
  fast: number; // fast / index2 当前下标 (-1 表示 null)
  slow: number; // slow / index1 当前下标 (-1 表示 null)
  meetIndex: number; // 相遇点下标，-1 未相遇
  entryIndex: number; // 入环口下标，-1 未确定
  phase: 'init' | 'chase' | 'meet' | 'find_entry' | 'done_entrance' | 'no_cycle';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export function buildCycleSteps(values: number[], pos: number): CycleStep[] {
  const steps: CycleStep[] = [];
  const n = values.length;

  if (n === 0) return steps;

  const lines = {
    init: { java: [2, 3], cpp: [4, 5], python: [3, 4], javascript: [2, 3] },
    chase: { java: [7, 8], cpp: [8, 9], python: [7, 8], javascript: [6, 7] },
    meet: { java: 9, cpp: 10, python: 9, javascript: 8 },
    findEntryInit: { java: [11, 12], cpp: [11, 12], python: [10, 11], javascript: [9, 10] },
    findEntryStep: { java: [14, 15], cpp: [14, 15], python: [13, 14], javascript: [12, 13] },
    doneEntrance: { java: 17, cpp: 17, python: 15, javascript: 15 },
    noCycle: { java: 20, cpp: 20, python: 17, javascript: 18 },
  };

  steps.push({
    values,
    pos,
    fast: 0,
    slow: 0,
    meetIndex: -1,
    entryIndex: -1,
    phase: 'init',
    message: pos === -1 ? '链表无环。fast 与 slow 从 head (下标 0) 出发。' : `链表有环 (尾节点连回下标 ${pos})。fast (每次2步) 与 slow (每次1步) 开始追逐。`,
    codeLine: lines.init,
  });

  if (pos === -1) {
    let fast = 0;
    let slow = 0;
    while (fast < n && fast + 1 < n) {
      fast += 2;
      slow += 1;
      steps.push({
        values,
        pos,
        fast: Math.min(fast, n),
        slow: Math.min(slow, n),
        meetIndex: -1,
        entryIndex: -1,
        phase: 'chase',
        message: `fast 走2步到 ${fast >= n ? 'null' : `[${fast}](${values[fast]})`}，slow 走1步到 [${slow}](${values[slow]})`,
        codeLine: lines.chase,
      });
    }
    steps.push({
      values,
      pos,
      fast: -1,
      slow,
      meetIndex: -1,
      entryIndex: -1,
      phase: 'no_cycle',
      message: 'fast 到达 null (fast == null || fast.next == null)，说明无环，返回 null。',
      codeLine: lines.noCycle,
    });
    return steps;
  }

  // 有环：阶段 1 追逐
  const next = (i: number): number => (i === n - 1 ? pos : i + 1);

  let fast = 0;
  let slow = 0;
  let meet = -1;

  for (let iter = 0; iter < 40; iter++) {
    const f1 = next(fast);
    const f2 = next(f1);
    const s1 = next(slow);

    fast = f2;
    slow = s1;

    if (fast === slow) {
      meet = fast;
      steps.push({
        values,
        pos,
        fast,
        slow,
        meetIndex: meet,
        entryIndex: -1,
        phase: 'meet',
        message: `🎉 fast 与 slow 在下标 [${meet}] (值 ${values[meet]}) 处相遇！开始启动阶段二：推纳入环口 (x = z)。`,
        codeLine: lines.meet,
      });
      break;
    } else {
      steps.push({
        values,
        pos,
        fast,
        slow,
        meetIndex: -1,
        entryIndex: -1,
        phase: 'chase',
        message: `fast 走2步到 [${fast}](${values[fast]})，slow 走1步到 [${slow}](${values[slow]})`,
        codeLine: lines.chase,
      });
    }
  }

  // 阶段 2: index1 = head, index2 = meet，每次各走 1 步
  let index1 = 0;
  let index2 = meet;

  steps.push({
    values,
    pos,
    fast: index2,
    slow: index1,
    meetIndex: meet,
    entryIndex: -1,
    phase: 'find_entry',
    message: `阶段二初始化：index1 指向 head (下标 0)，index2 指向相遇点 (下标 ${meet})，每次各走 1 步。`,
    codeLine: lines.findEntryInit,
  });

  while (index1 !== index2) {
    index1 = next(index1);
    index2 = next(index2);

    if (index1 === index2) {
      break;
    }

    steps.push({
      values,
      pos,
      fast: index2,
      slow: index1,
      meetIndex: meet,
      entryIndex: -1,
      phase: 'find_entry',
      message: `index1 移动到 [${index1}](${values[index1]})，index2 移动到 [${index2}](${values[index2]})`,
      codeLine: lines.findEntryStep,
    });
  }

  // 找到入环口
  steps.push({
    values,
    pos,
    fast: index2,
    slow: index1,
    meetIndex: meet,
    entryIndex: index1,
    phase: 'done_entrance',
    message: `🎉 index1 与 index2 在下标 [${index1}] (值 ${values[index1]}) 处相遇！成功锁定入环起始节点！`,
    codeLine: lines.doneEntrance,
  });

  return steps;
}

/** 为每一步附加状态监视器指标与执行日志（键名与 spec.metrics 的 id 一一对应） */
export function withLinkedListCycleIIMetrics(steps: CycleStep[]): CycleStep[] {
  return steps.map((s) => {
    const ptr = (i: number) => (i === -1 ? 'null' : `[${i}] (值 ${s.values[i]})`);

    let phase = '追击中';
    if (s.phase === 'init') phase = '初始化';
    else if (s.phase === 'chase') phase = '阶段一: 环内快慢追击';
    else if (s.phase === 'meet') phase = '🎉 阶段一完成: 相遇';
    else if (s.phase === 'find_entry') phase = '阶段二: 等速同步寻入口';
    else if (s.phase === 'done_entrance') phase = '🏆 阶段二完成: 锁定入环口';
    else phase = '无环判定';

    let status = '追击中';
    if (s.phase === 'done_entrance') status = '入环点已锁定';
    else if (s.phase === 'no_cycle') status = '无环';
    else if (s.phase === 'meet') status = '环内相遇';

    const met = s.phase === 'meet' || s.phase === 'done_entrance';

    return {
      ...s,
      log: s.log ?? s.message,
      metrics: {
        idx1: ptr(s.slow),
        idx2: ptr(s.fast),
        meet: met ? 'true' : 'false',
        entrance:
          s.phase === 'done_entrance'
            ? `索引 [${s.entryIndex}] (值 ${s.values[s.entryIndex]})`
            : s.phase === 'no_cycle'
              ? 'null (链表无环)'
              : '判定追击中...',
        status,
        phase,
      },
    };
  });
}
