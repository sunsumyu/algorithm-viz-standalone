/**
 * 环形链表 II 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 142：快慢指针判环 + 数学推导 (x = z) 定位入环口
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  LINKED_LIST_CYCLE_II_PROBLEM_HTML,
  LINKED_LIST_CYCLE_II_ANALYSIS_HTML,
  LINKED_LIST_CYCLE_II_CODE_LANGUAGES,
} from './linked-list-cycle-ii-problem-content';

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
function withMetrics(steps: CycleStep[]): CycleStep[] {
  return steps.map((s) => {
    const isPhase2 = s.phase === 'find_entry' || s.phase === 'done_entrance';
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

export function renderLinkedListCycleIICanvas(container: HTMLElement, step: CycleStep): void {
  const values = step.values;
  const pos = step.pos;
  const isPhase2 = step.phase === 'find_entry' || step.phase === 'done_entrance';

  const nodesHtml = values
    .map((val, idx) => {
      const isEntrance = pos !== -1 && idx === pos;
      const isMeetNode = step.meetIndex !== -1 && idx === step.meetIndex;

      const pointerBadges: string[] = [];
      if (step.slow === idx) {
        pointerBadges.push(
          `<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">${isPhase2 ? 'idx1' : 'slow'}</span>`
        );
      }
      if (step.fast === idx) {
        pointerBadges.push(
          `<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">${isPhase2 ? 'idx2' : 'fast'}</span>`
        );
      }

      let borderColor = '#e2e8f0';
      let bgColor = '#ffffff';
      if (isEntrance) {
        borderColor = '#ec4899';
        bgColor = '#fdf2f8';
      }
      if (isMeetNode) {
        borderColor = '#8b5cf6';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; position: relative;">
          <div style="min-height: 14px; display: flex; gap: 2px;">
            ${pointerBadges.join('')}
          </div>
          <div style="min-width: 44px; height: 44px; padding: 0 8px; border-radius: 10px; background: ${bgColor}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <span style="font-size: 13px; font-weight: 800; color: ${isEntrance ? '#be185d' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
              ${val}
            </span>
            <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
          </div>
          ${isEntrance ? '<span style="font-size: 9px; color: #ec4899; font-weight: 800;">入环点</span>' : ''}
          ${isMeetNode ? '<span style="font-size: 9px; color: #8b5cf6; font-weight: 800;">相遇点</span>' : ''}
        </div>
      `;
    })
    .join(`
      <div style="display: flex; align-items: center; color: #94a3b8; font-size: 14px; margin-top: 14px;">▶</div>
    `);

  const loopBackHtml =
    pos !== -1
      ? `
    <div style="width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 8px;">
      <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: #fdf2f8; border: 1px dashed #ec4899; color: #be185d; font-size: 10.5px; font-weight: 700;">
        <span>↩ 末尾节点 [${values.length - 1}] 指向入环节点 [${pos}] (构成环状闭合)</span>
      </div>
    </div>
  `
      : `
    <div style="width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 8px;">
      <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: #f1f5f9; border: 1px dashed #cbd5e1; color: #64748b; font-size: 10.5px;">
        <span>末尾节点指向 null (无环线性单链表)</span>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
      <div style="display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 6px 0;">
        ${nodesHtml}
      </div>
      ${loopBackHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'linked-list-cycle-ii',
  name: '环形链表 II',
  category: 'linked-list',
  description: 'LeetCode 142 · 快慢指针判断环形与相遇点，严谨数学推导 (x = z) 寻找入环口',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握 Floyd 判圈算法数学推导原理与快慢双指针协作技巧',
  inputs: [
    {
      id: 'case',
      label: '测试用例',
      type: 'select',
      defaultValue: 'ex1',
      options: [
        { label: '[3,2,0,-4] pos=1 (入环点: 2)', value: 'ex1' },
        { label: '[1,2] pos=0 (入环点: 1)', value: 'ex2' },
        { label: '[1] pos=-1 (无环)', value: 'ex3' },
      ],
    },
  ],
  presets: [
    { label: '示例 1 (pos=1 入环点 2)', values: { case: 'ex1' } },
    { label: '示例 2 (pos=0 头部成环)', values: { case: 'ex2' } },
    { label: '示例 3 (无环)', values: { case: 'ex3' } },
  ],
  metrics: [
    { id: 'idx1', label: 'index1 / slow', color: '#059669' },
    { id: 'idx2', label: 'index2 / fast', color: '#2563eb' },
    { id: 'meet', label: '相遇判定', color: '#8b5cf6' },
    { id: 'entrance', label: '入环起始节点', color: '#ec4899' },
    { id: 'status', label: '判定状态', color: '#2563eb' },
    { id: 'phase', label: '当前算法阶段', color: '#2563eb' },
  ],
  legend: [
    { label: 'fast (2步)', color: '#2563eb' },
    { label: 'slow (1步)', color: '#059669' },
    { label: '环入口 (Entrance)', color: '#ec4899' },
  ],
  codeLanguages: LINKED_LIST_CYCLE_II_CODE_LANGUAGES,
  problemHtml: LINKED_LIST_CYCLE_II_PROBLEM_HTML,
  analysisHtml: LINKED_LIST_CYCLE_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const val = String(inputs.case ?? 'ex1');
    if (val === 'ex2') return withMetrics(buildCycleSteps([1, 2], 0));
    if (val === 'ex3') return withMetrics(buildCycleSteps([1], -1));
    return withMetrics(buildCycleSteps([3, 2, 0, -4], 1));
  },
  renderCanvas: (container, step) => renderLinkedListCycleIICanvas(container, step as CycleStep),
});
