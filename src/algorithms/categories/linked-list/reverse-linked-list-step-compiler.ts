/**
 * 反转链表 — 步进推演编译器
 * LeetCode 206：双指针迭代
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface RLStep {
  values: number[];
  /** nextDir[i] = i.next 指向的下标（-1 表示 null） */
  nextDir: number[];
  preIndex: number; // -1 = null
  curIndex: number; // -1 = null
  cachedNext: number; // 当前暂存的 next 节点下标（-1 表示 null 或无）
  reversedCount: number;
  action: 'init' | 'cache_next' | 'reverse_pointer' | 'advance_pre' | 'advance_cur' | 'done';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export function buildReverseSteps(values: number[]): RLStep[] {
  const steps: RLStep[] = [];
  const n = values.length;

  const lines = {
    init: { java: [2, 3], cpp: [4, 5], python: [3, 4], javascript: [2, 3] },
    cacheNext: { java: [4, 5], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    reversePointer: { java: 6, cpp: 8, python: 7, javascript: 6 },
    advancePre: { java: 7, cpp: 9, python: 8, javascript: 7 },
    advanceCur: { java: 8, cpp: 10, python: 9, javascript: 8 },
    done: { java: 10, cpp: 12, python: 10, javascript: 10 },
  };

  if (n === 0) {
    steps.push({
      values: [],
      nextDir: [],
      preIndex: -1,
      curIndex: -1,
      cachedNext: -1,
      reversedCount: 0,
      action: 'done',
      message: '链表为空，直接返回 null',
      codeLine: lines.done,
    });
    return steps;
  }

  // 初始：0 -> 1 -> 2 -> ... -> -1
  const nextDir = values.map((_, i) => (i + 1 < n ? i + 1 : -1));
  let pre = -1;
  let cur = 0;
  let reversed = 0;

  // Step 0: init
  steps.push({
    values: [...values],
    nextDir: [...nextDir],
    preIndex: pre,
    curIndex: cur,
    cachedNext: -1,
    reversedCount: reversed,
    action: 'init',
    message: `初始化：pre = null, cur = head (节点 ${values[0]})，准备双指针迭代反转`,
    codeLine: lines.init,
  });

  while (cur !== -1) {
    const next = nextDir[cur];

    // 1. 暂存 next
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'cache_next',
      message: `① 暂存后继：next = cur.next (节点 ${next === -1 ? 'null' : values[next]})，防止反转后链表断裂`,
      codeLine: lines.cacheNext,
    });

    // 2. 反转 cur.next = pre
    nextDir[cur] = pre;
    reversed++;
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'reverse_pointer',
      message: `② 反转指向：cur.next = pre，将节点 ${values[cur]} 的指针逆转指向 ${pre === -1 ? 'null' : `节点 ${values[pre]}`}`,
      codeLine: lines.reversePointer,
    });

    // 3. pre = cur
    pre = cur;
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'advance_pre',
      message: `③ 前驱跟进：pre = cur，pre 指针移动到节点 ${values[pre]}`,
      codeLine: lines.advancePre,
    });

    // 4. cur = next
    cur = next;
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'advance_cur',
      message: `④ 当前前进：cur = next，cur 指针移动到 ${cur === -1 ? 'null' : `节点 ${values[cur]}`}`,
      codeLine: lines.advanceCur,
    });
  }

  // done
  steps.push({
    values: [...values],
    nextDir: [...nextDir],
    preIndex: pre,
    curIndex: -1,
    cachedNext: -1,
    reversedCount: reversed,
    action: 'done',
    message: `🎉 反转完成！cur == null 循环结束，新链表头节点为 pre (节点 ${values[pre]})，返回 pre`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标与执行日志（键名与 spec.metrics 的 id 一一对应） */
export function withReverseLinkedListMetrics(steps: RLStep[]): RLStep[] {
  return steps.map((s) => {
    let action = '🎉 反转完成';
    if (s.action === 'init') action = '初始化双指针';
    else if (s.action === 'cache_next') action = '① 暂存 next = cur.next';
    else if (s.action === 'reverse_pointer') action = '② 反转 cur.next = pre';
    else if (s.action === 'advance_pre') action = '③ 跟进 pre = cur';
    else if (s.action === 'advance_cur') action = '④ 前进 cur = next';

    const ptr = (i: number) => (i === -1 ? 'null' : `[${i}] 值 ${s.values[i]}`);

    return {
      ...s,
      log: s.log ?? s.message,
      metrics: {
        pre: ptr(s.preIndex),
        cur: ptr(s.curIndex),
        next: ptr(s.cachedNext),
        reversed: `${s.reversedCount} / ${s.values.length}`,
        action,
      },
    };
  });
}
