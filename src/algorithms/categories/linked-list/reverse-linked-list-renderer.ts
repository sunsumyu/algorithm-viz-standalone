/**
 * 反转链表可视化器 — 声明式 4-Card 标准架构
 * LeetCode 206：双指针迭代，暂存 next 后继，原地反转指针指向
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REVERSE_LINKED_LIST_PROBLEM_HTML,
  REVERSE_LINKED_LIST_ANALYSIS_HTML,
  REVERSE_LINKED_LIST_CODE_LANGUAGES,
} from './reverse-linked-list-problem-content';

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

export function parseValues(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
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
function withMetrics(steps: RLStep[]): RLStep[] {
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

export function renderReverseLinkedListCanvas(container: HTMLElement, step: RLStep): void {
  const { values, nextDir, preIndex: pre, curIndex: cur, cachedNext } = step;

  const nodesHtml = values
    .map((val, idx) => {
      const isCur = cur === idx;
      const isPre = pre === idx;
      const isNext = cachedNext === idx;
      const targetNext = nextDir[idx];
      const isReversed = targetNext === -1 ? pre === idx : targetNext < idx;

      // 指针徽标
      const pointerBadges: string[] = [];
      if (isPre) pointerBadges.push('<span style="background: #fbbf24; color: #78350f; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">pre</span>');
      if (isCur) pointerBadges.push('<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">cur</span>');
      if (isNext) pointerBadges.push('<span style="background: #9333ea; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">next</span>');

      return `
        <div style="display: flex; align-items: center; gap: 6px;">
          <!-- 节点盒 -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <!-- 指针标识栏 -->
            <div style="min-height: 14px; display: flex; gap: 2px;">
              ${pointerBadges.join('')}
            </div>

            <!-- 节点主体 -->
            <div style="min-width: 44px; height: 44px; padding: 0 10px; border-radius: 10px; background: ${isCur ? '#eff6ff' : isPre ? '#fffbeb' : '#ffffff'}; border: 2px solid ${isCur ? '#2563eb' : isPre ? '#f59e0b' : '#e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.04); position: relative;">
              <span style="font-size: 13.5px; font-weight: 800; color: ${isCur ? '#1d4ed8' : isPre ? '#b45309' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
                ${val}
              </span>
              <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">idx:${idx}</span>
            </div>

            <!-- 指针目标 -->
            <div style="font-size: 9px; color: ${isReversed ? '#10b981' : '#64748b'}; font-weight: 700; font-family: monospace;">
              &rarr; ${targetNext === -1 ? 'null' : values[targetNext]}
            </div>
          </div>

          <!-- 连接箭头 -->
          ${
            idx < values.length - 1
              ? `<div style="font-size: 14px; font-weight: 800; color: ${nextDir[idx] === idx - 1 ? '#10b981' : '#cbd5e1'}; display: flex; align-items: center;">
                  ${nextDir[idx] === idx - 1 ? '◀' : '▶'}
                </div>`
              : ''
          }
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <!-- 链表主视图 -->
      <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 6px 2px; min-height: 80px;">
        <!-- null 虚拟起点 -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px;">
            ${pre === -1 ? '<span style="background: #fbbf24; color: #78350f; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">pre</span>' : ''}
          </div>
          <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
            null
          </div>
          <div style="font-size: 9px; color: #94a3b8;">前驱起点</div>
        </div>

        <div style="font-size: 14px; color: #cbd5e1;">|</div>

        ${nodesHtml}

        <div style="font-size: 14px; color: #cbd5e1;">|</div>

        <!-- null 尾端 -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px;">
            ${cur === -1 ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">cur</span>' : ''}
          </div>
          <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
            null
          </div>
          <div style="font-size: 9px; color: #94a3b8;">尾端终点</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'reverse-linked-list',
  name: '反转链表',
  category: 'linked-list',
  description: 'LeetCode 206 · 双指针迭代原地修改指针指向，暂存 next 节点防止链表断裂',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '透彻掌握单链表双指针迭代与原地指针反转技巧，理解暂存 next 防止断链的本质',
  inputs: [
    {
      id: 'list',
      label: 'head',
      type: 'text',
      defaultValue: '1,2,3,4,5',
      placeholder: '1,2,3,4,5',
    },
  ],
  presets: [
    { label: '示例 1 (1..5)', values: { list: '1,2,3,4,5' } },
    { label: '示例 2 (两节点)', values: { list: '1,2' } },
    { label: '三节点', values: { list: '10,20,30' } },
  ],
  metrics: [
    { id: 'pre', label: 'pre 指针 (前驱)', color: '#fbbf24' },
    { id: 'cur', label: 'cur 指针 (当前)', color: '#2563eb' },
    { id: 'next', label: 'next 暂存 (后继)', color: '#9333ea' },
    { id: 'reversed', label: '已反转节点', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: 'pre 前驱', color: '#fbbf24' },
    { label: 'cur 当前', color: '#2563eb' },
    { label: 'next 暂存', color: '#9333ea' },
    { label: '反转边', color: '#10b981' },
  ],
  codeLanguages: REVERSE_LINKED_LIST_CODE_LANGUAGES,
  problemHtml: REVERSE_LINKED_LIST_PROBLEM_HTML,
  analysisHtml: REVERSE_LINKED_LIST_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildReverseSteps(parseValues(String(inputs.list ?? '1,2,3,4,5')))),
  renderCanvas: (container, step) => renderReverseLinkedListCanvas(container, step as RLStep),
});
