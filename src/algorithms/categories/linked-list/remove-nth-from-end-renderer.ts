/**
 * 删除链表的倒数第 N 个结点可视化器 — 声明式 4-Card 标准架构
 * LeetCode 19：dummyHead 虚拟头节点 + 快慢指针定距一趟扫描
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REMOVE_NTH_FROM_END_PROBLEM_HTML,
  REMOVE_NTH_FROM_END_ANALYSIS_HTML,
  REMOVE_NTH_FROM_END_CODE_LANGUAGES,
} from './remove-nth-from-end-problem-content';

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

export function parseValues(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
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
function withMetrics(steps: RNStep[]): RNStep[] {
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

export function renderRemoveNthFromEndCanvas(container: HTMLElement, step: RNStep): void {
  const originalValues = step.originalValues ?? step.values;
  const fast = step.fast;
  const slow = step.slow;
  const removed = step.removedIndex;
  const isDone = step.action === 'done';

  const nodesHtml = originalValues
    .map((val, idx) => {
      const isFast = fast === idx;
      const isSlow = slow === idx;
      const isTarget = removed === idx;

      const pointerBadges: string[] = [];
      if (isSlow) pointerBadges.push('<span style="background: #059669; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">slow</span>');
      if (isFast) pointerBadges.push('<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>');

      return `
        <div style="display: flex; align-items: center; gap: 6px;">
          <!-- 节点盒 -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <div style="min-height: 14px; display: flex; gap: 2px;">
              ${pointerBadges.join('')}
            </div>

            <div style="min-width: 44px; height: 44px; padding: 0 10px; border-radius: 10px; background: ${isTarget ? '#fef2f2' : isFast ? '#eff6ff' : isSlow ? '#ecfdf5' : '#ffffff'}; border: 2px ${isTarget ? 'dashed #ef4444' : isFast ? 'solid #2563eb' : isSlow ? 'solid #059669' : 'solid #e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: ${isDone && isTarget ? 0.35 : 1}; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
              <span style="font-size: 13.5px; font-weight: 800; color: ${isTarget ? '#ef4444' : isFast ? '#1d4ed8' : isSlow ? '#047857' : '#0f172a'}; font-family: 'JetBrains Mono', monospace; text-decoration: ${isDone && isTarget ? 'line-through' : 'none'};">
                ${val}
              </span>
              <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">idx:${idx}</span>
            </div>

            <div style="font-size: 9px; color: ${isTarget ? '#ef4444' : '#64748b'}; font-weight: 700;">
              ${isTarget ? '待删' : `第 ${idx + 1} 项`}
            </div>
          </div>

          <!-- 连接箭头 -->
          ${
            idx < originalValues.length - 1
              ? `<div style="font-size: 14px; font-weight: 800; color: ${isDone && isTarget ? '#ef4444' : '#cbd5e1'};">▶</div>`
              : ''
          }
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 6px 2px; min-height: 80px;">
        <!-- dummyHead 节点 -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px; display: flex; gap: 2px;">
            ${slow === -1 ? '<span style="background: #059669; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">slow</span>' : ''}
            ${fast === -1 ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>' : ''}
          </div>
          <div style="min-width: 44px; height: 44px; border-radius: 10px; background: #f8fafc; border: 2px solid #64748b; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 11px; font-weight: 800; color: #334155; font-family: monospace;">dummy</span>
            <span style="font-size: 8.5px; color: #64748b;">(0)</span>
          </div>
          <div style="font-size: 9px; color: #64748b; font-weight: 700;">虚拟头</div>
        </div>

        <div style="font-size: 14px; font-weight: 800; color: #94a3b8;">▶</div>

        ${nodesHtml}

        <div style="font-size: 14px; font-weight: 800; color: #cbd5e1;">▶</div>

        <!-- 末尾 null -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px;">
            ${fast >= originalValues.length ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>' : ''}
          </div>
          <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
            null
          </div>
          <div style="font-size: 9px; color: #94a3b8;">末尾终止</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'remove-nth-from-end',
  name: '删除链表的倒数第 N 个结点',
  category: 'linked-list',
  description: 'LeetCode 19 · 虚拟头节点 + 快慢指针定距一趟扫描完成倒数第 N 个节点跨越删除',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握虚拟头节点 (dummyHead) 消除特判与快慢指针定距一趟扫描删除链表结点的核心技巧',
  inputs: [
    {
      id: 'list',
      label: 'head',
      type: 'text',
      defaultValue: '1,2,3,4,5',
      placeholder: '1,2,3,4,5',
    },
    {
      id: 'n',
      label: 'n (倒数第几个)',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 10,
    },
  ],
  presets: [
    { label: '示例 1 (1..5, n=2)', values: { list: '1,2,3,4,5', n: 2 } },
    { label: '示例 2 (删头, n=1)', values: { list: '1,2,3,4,5', n: 5 } },
    { label: '单节点', values: { list: '7', n: 1 } },
    { label: '删中间 (n=3)', values: { list: '1,2,3,4,5,6', n: 3 } },
  ],
  metrics: [
    { id: 'fast', label: 'fast 快指针', color: '#2563eb' },
    { id: 'slow', label: 'slow 慢指针', color: '#059669' },
    { id: 'target', label: '待删除目标', color: '#ef4444' },
    { id: 'gap', label: '指针间距', color: '#64748b' },
    { id: 'head', label: '当前链表头', color: '#059669' },
    { id: 'remaining', label: '剩余节点数', color: '#2563eb' },
    { id: 'action', label: '当前阶段', color: '#2563eb' },
  ],
  legend: [
    { label: '🚩 dummyHead 虚拟头', color: '#64748b' },
    { label: '🚀 fast 快指针 (先行 n+1 步)', color: '#2563eb' },
    { label: '🐢 slow 慢指针', color: '#059669' },
    { label: '❌ 待删除目标节点', color: '#ef4444' },
  ],
  codeLanguages: REMOVE_NTH_FROM_END_CODE_LANGUAGES,
  problemHtml: REMOVE_NTH_FROM_END_PROBLEM_HTML,
  analysisHtml: REMOVE_NTH_FROM_END_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildRNSteps(
        parseValues(String(inputs.list ?? '1,2,3,4,5')),
        parseInt(String(inputs.n ?? '2'), 10) || 2
      )
    ),
  renderCanvas: (container, step) => renderRemoveNthFromEndCanvas(container, step as RNStep),
});
