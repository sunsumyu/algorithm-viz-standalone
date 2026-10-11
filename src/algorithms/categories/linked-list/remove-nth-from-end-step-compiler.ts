/**
 * 删除链表的倒数第 N 个结点 — 步进推演编译器
 * LeetCode 19：dummyHead + 快慢指针定距扫描
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface RNStep {
  values: number[];
  fast: number; // -1 = dummy, values.length = null
  slow: number; // -1 = dummy
  removedIndex: number; // -1 表示未删除
  action: 'init' | 'fast_advance' | 'move_together' | 'delete_node' | 'done';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
  /** 初始链表值（withMetrics 附带）：done 阶段 values 已是删除后链表，渲染器仍需展示被删前完整链表 */
  originalValues?: number[];
}

export function buildRNSteps(values: number[], n: number): RNStep[] {
  const steps: RNStep[] = [];
  const len = values.length;

  const lines = {
    init: { java: [2, 5], cpp: [4, 7], python: [3, 5], javascript: [2, 4] },
    fastAdvance: { java: [8, 9], cpp: [8, 9], python: [7, 8], javascript: [6, 7] },
    moveTogether: { java: [13, 15], cpp: [11, 13], python: [10, 12], javascript: [9, 11] },
    deleteNode: { java: 19, cpp: [16, 17], python: 14, javascript: 13 },
    done: { java: 20, cpp: 18, python: 15, javascript: 14 },
  };

  if (len === 0 || n > len || n <= 0) {
    steps.push({
      values: [...values],
      fast: -1,
      slow: -1,
      removedIndex: -1,
      action: 'done',
      message: '输入不合法：链表为空或 n 超过链表总长度',
      codeLine: lines.done,
    });
    return steps;
  }

  // 1. 初始化
  let fast = -1; // -1 为 dummyHead
  let slow = -1;
  steps.push({
    values: [...values],
    fast,
    slow,
    removedIndex: -1,
    action: 'init',
    message: `创建虚拟头节点 dummyHead 指向 head，fast = slow = dummyHead。准备让 fast 先走 ${n + 1} 步建立定距窗口。`,
    codeLine: lines.init,
  });

  // 2. fast 先走 n + 1 步 (从 -1 走到 n-1，再走到 n)
  for (let i = 0; i <= n; i++) {
    fast = fast === -1 ? 0 : fast + 1;
    steps.push({
      values: [...values],
      fast,
      slow,
      removedIndex: -1,
      action: 'fast_advance',
      message: `① fast 先行第 ${i + 1} / ${n + 1} 步：fast 移动到 ${fast >= len ? 'null' : `节点 ${values[fast]}`}`,
      codeLine: lines.fastAdvance,
    });
  }

  // 3. fast 与 slow 同时移动
  while (fast < len) {
    fast++;
    slow = slow === -1 ? 0 : slow + 1;
    steps.push({
      values: [...values],
      fast,
      slow,
      removedIndex: -1,
      action: 'move_together',
      message: `② 同步平移：fast 和 slow 同时前进 1 步 (保持间距)。fast=${fast >= len ? 'null' : `节点 ${values[fast]}`}, slow=${slow === -1 ? 'dummyHead' : `节点 ${values[slow]}`}`,
      codeLine: lines.moveTogether,
    });
  }

  // 4. 删除 slow.next
  const targetIdx = slow + 1;
  const targetVal = values[targetIdx];
  const nextVals = [...values];
  nextVals.splice(targetIdx, 1);

  steps.push({
    values: [...values],
    fast,
    slow,
    removedIndex: targetIdx,
    action: 'delete_node',
    message: `③ 跨越删除：fast 已到达末尾 null，slow.next 指向待删除的倒数第 ${n} 个节点 (节点 ${targetVal})。执行 slow.next = slow.next.next 完成删除！`,
    codeLine: lines.deleteNode,
  });

  // 5. done
  steps.push({
    values: nextVals,
    fast,
    slow,
    removedIndex: targetIdx,
    action: 'done',
    message: `🎉 删除完成！返回 dummyHead.next (新头节点 ${nextVals.length > 0 ? `节点 ${nextVals[0]}` : 'null'})`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标与执行日志（键名与 spec.metrics 的 id 一一对应） */
export function withRemoveNthFromEndMetrics(steps: RNStep[]): RNStep[] {
  const original = steps[0]?.values ?? [];
  const ptr = (i: number) => (i === -1 ? 'dummyHead' : i >= original.length ? 'null (末尾)' : `[${i}] 值 ${original[i]}`);

  return steps.map((s) => {
    let action = '🎉 删除完成';
    if (s.action === 'init') action = '初始化 dummyHead';
    else if (s.action === 'fast_advance') action = '① fast 先行 (拉开间距)';
    else if (s.action === 'move_together') action = '② fast & slow 同步平移';
    else if (s.action === 'delete_node') action = '③ slow.next = slow.next.next';

    return {
      ...s,
      originalValues: original,
      log: s.log ?? s.message,
      metrics: {
        fast: ptr(s.fast),
        slow: ptr(s.slow),
        target:
          s.removedIndex >= 0 && s.removedIndex < original.length
            ? `[${s.removedIndex}] 节点 ${original[s.removedIndex]}`
            : '无',
        gap: `${Math.max(0, s.fast - s.slow)} 步`,
        head: s.values.length > 0 ? `节点 ${s.values[0]}` : 'null (空链表)',
        remaining: `${s.values.length}`,
        action,
      },
    };
  });
}
