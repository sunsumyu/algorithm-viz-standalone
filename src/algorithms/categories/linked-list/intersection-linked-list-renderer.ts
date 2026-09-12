/**
 * 链表相交可视化器 — 声明式 4-Card 标准架构
 * 面试题 02.07 / LC 160：双指针浪漫换道相遇，巧妙消除长度差
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  INTERSECTION_LINKED_LIST_PROBLEM_HTML,
  INTERSECTION_LINKED_LIST_ANALYSIS_HTML,
  INTERSECTION_LINKED_LIST_CODE_LANGUAGES,
} from './intersection-linked-list-problem-content';

export interface ILLStep {
  listA: number[];
  listB: number[];
  skipA: number; // 相交公共区间在 A 的起始下标 (-1 表示无)
  skipB: number; // 相交公共区间在 B 的起始下标 (-1 表示无)
  pa: number; // 在当前所在链表中的下标 (-1 表示 null)
  pb: number; // 在当前所在链表中的下标 (-1 表示 null)
  paOnList: 'A' | 'B' | 'null';
  pbOnList: 'A' | 'B' | 'null';
  found: boolean;
  missed: boolean;
  action: 'init' | 'step' | 'switch_lane' | 'meet' | 'done_null';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export const LIST_A_MEET = [4, 1, 8, 4, 5];
export const LIST_B_MEET = [5, 6, 1, 8, 4, 5];
export const LIST_A_MISS = [2, 6, 4];
export const LIST_B_MISS = [1, 5];

export function buildIntersectionSteps(intersect: boolean): ILLStep[] {
  const steps: ILLStep[] = [];
  const listA = intersect ? LIST_A_MEET : LIST_A_MISS;
  const listB = intersect ? LIST_B_MEET : LIST_B_MISS;
  const skipA = intersect ? 2 : -1;
  const skipB = intersect ? 3 : -1;

  const lines = {
    init: { java: [3, 4], cpp: [5, 6], python: 5, javascript: [3, 4] },
    step: { java: [8, 9], cpp: [9, 10], python: [8, 9], javascript: [7, 8] },
    meet: { java: 12, cpp: 13, python: 11, javascript: 11 },
    doneNull: { java: 12, cpp: 13, python: 11, javascript: 11 },
  };

  let pa = 0;
  let pb = 0;
  let paOnList: 'A' | 'B' | 'null' = 'A';
  let pbOnList: 'A' | 'B' | 'null' = 'B';

  steps.push({
    listA,
    listB,
    skipA,
    skipB,
    pa,
    pb,
    paOnList,
    pbOnList,
    found: false,
    missed: false,
    action: 'init',
    message: `初始化：pA 指向 headA (节点 ${listA[0]})，pB 指向 headB (节点 ${listB[0]})`,
    codeLine: lines.init,
  });

  const MAX_STEPS = 30;
  let loopCount = 0;

  while (loopCount++ < MAX_STEPS) {
    // 检查是否相遇
    const isSameNode =
      paOnList === pbOnList &&
      pa === pb &&
      pa !== -1;

    const bothAtIntersection =
      intersect &&
      ((paOnList === 'A' && pa >= skipA && pbOnList === 'B' && pb >= skipB && pa - skipA === pb - skipB) ||
        (paOnList === 'B' && pa >= skipB && pbOnList === 'A' && pb >= skipA && pa - skipB === pb - skipA));

    if (isSameNode || bothAtIntersection) {
      const meetVal = paOnList === 'A' ? listA[pa] : listB[pa];
      steps.push({
        listA,
        listB,
        skipA,
        skipB,
        pa,
        pb,
        paOnList,
        pbOnList,
        found: true,
        missed: false,
        action: 'meet',
        message: `🎉 浪漫相遇！pA 与 pB 在相同内存节点 (值 ${meetVal}) 处相遇，返回交点节点！`,
        codeLine: lines.meet,
      });
      break;
    }

    if (paOnList === 'null' && pbOnList === 'null') {
      steps.push({
        listA,
        listB,
        skipA,
        skipB,
        pa: -1,
        pb: -1,
        paOnList: 'null',
        pbOnList: 'null',
        found: false,
        missed: true,
        action: 'done_null',
        message: `两指针同时到达 null (pA == pB == null)，说明两链表无相交交点，返回 null`,
        codeLine: lines.doneNull,
      });
      break;
    }

    // 单步推进或换道
    let nextPaOnList: 'A' | 'B' | 'null' = paOnList;
    let nextPa = pa;
    let paSwitched = false;

    if (paOnList === 'A') {
      if (pa + 1 < listA.length) {
        nextPa = pa + 1;
      } else {
        nextPaOnList = 'null';
        nextPa = -1;
      }
    } else if (paOnList === 'null') {
      nextPaOnList = 'B';
      nextPa = 0;
      paSwitched = true;
    } else if (paOnList === 'B') {
      if (pa + 1 < listB.length) {
        nextPa = pa + 1;
      } else {
        nextPaOnList = 'null';
        nextPa = -1;
      }
    }

    let nextPbOnList: 'A' | 'B' | 'null' = pbOnList;
    let nextPb = pb;
    let pbSwitched = false;

    if (pbOnList === 'B') {
      if (pb + 1 < listB.length) {
        nextPb = pb + 1;
      } else {
        nextPbOnList = 'null';
        nextPb = -1;
      }
    } else if (pbOnList === 'null') {
      nextPbOnList = 'A';
      nextPb = 0;
      pbSwitched = true;
    } else if (pbOnList === 'A') {
      if (pb + 1 < listA.length) {
        nextPb = pb + 1;
      } else {
        nextPbOnList = 'null';
        nextPb = -1;
      }
    }

    pa = nextPa;
    paOnList = nextPaOnList;
    pb = nextPb;
    pbOnList = nextPbOnList;

    const action = paSwitched || pbSwitched ? 'switch_lane' : 'step';
    const paDesc = paOnList === 'null' ? 'null' : `${paOnList}[${pa}] (${(paOnList === 'A' ? listA : listB)[pa]})`;
    const pbDesc = pbOnList === 'null' ? 'null' : `${pbOnList}[${pb}] (${(pbOnList === 'B' ? listB : listA)[pb]})`;

    steps.push({
      listA,
      listB,
      skipA,
      skipB,
      pa,
      pb,
      paOnList,
      pbOnList,
      found: false,
      missed: false,
      action,
      message: `${action === 'switch_lane' ? '🔀 换道走对方链表' : '双指针前进一步'}：pA 移动到 ${paDesc}，pB 移动到 ${pbDesc}`,
      codeLine: lines.step,
    });
  }

  return steps;
}

/** 为每一步附加状态监视器指标与执行日志（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ILLStep[]): ILLStep[] {
  return steps.map((s) => {
    const paPos =
      s.paOnList === 'null' ? 'null' : `${s.paOnList}[${s.pa}] (值 ${(s.paOnList === 'A' ? s.listA : s.listB)[s.pa]})`;
    const pbPos =
      s.pbOnList === 'null' ? 'null' : `${s.pbOnList}[${s.pb}] (值 ${(s.pbOnList === 'B' ? s.listB : s.listA)[s.pb]})`;

    let action = '两指针同时到达 null';
    if (s.action === 'step') action = '双指针平移';
    else if (s.action === 'switch_lane') action = '🔀 换道走对方链表';
    else if (s.action === 'meet') action = '💖 浪漫相遇！';
    else if (s.action === 'init') action = '初始化双指针';

    let status = '探索同步中...';
    if (s.found) {
      const meetVal = s.paOnList === 'A' ? s.listA[s.pa] : s.listB[s.pa];
      status = `相交于节点 ${meetVal}`;
    } else if (s.missed) {
      status = 'null (两链表不相交)';
    }

    return {
      ...s,
      log: s.log ?? s.message,
      metrics: {
        pa: paPos,
        pb: pbPos,
        meet: s.found ? 'true (交点已锁定)' : 'false',
        intersection: status,
        action,
      },
    };
  });
}

export function renderIntersectionLinkedListCanvas(container: HTMLElement, step: ILLStep): void {
  const listA = step.listA;
  const listB = step.listB;
  const skipA = step.skipA;
  const skipB = step.skipB;
  const pa = step.pa;
  const pb = step.pb;
  const paOnList = step.paOnList;
  const pbOnList = step.pbOnList;

  const renderTrack = (title: string, list: number[], skip: number, listName: 'A' | 'B') => {
    const nodes = list
      .map((val, idx) => {
        const isIntersectNode = skip !== -1 && idx >= skip;
        const hasPa = paOnList === listName && pa === idx;
        const hasPb = pbOnList === listName && pb === idx;

        const pointerBadges: string[] = [];
        if (hasPa) pointerBadges.push('<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">pA</span>');
        if (hasPb) pointerBadges.push('<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">pB</span>');

        return `
          <div style="display: flex; align-items: center; gap: 4px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="min-height: 12px; display: flex; gap: 2px;">
                ${pointerBadges.join('')}
              </div>
              <div style="min-width: 38px; height: 38px; padding: 0 8px; border-radius: 8px; background: ${isIntersectNode ? '#fdf2f8' : '#ffffff'}; border: 2px ${isIntersectNode ? 'solid #ec4899' : 'solid #e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <span style="font-size: 12px; font-weight: 800; color: ${isIntersectNode ? '#be185d' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
                  ${val}
                </span>
                <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">${listName}[${idx}]</span>
              </div>
            </div>
            ${idx < list.length - 1 ? '<span style="color:#cbd5e1; font-size:12px;">▶</span>' : ''}
          </div>
        `;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; font-weight: 800; color: #475569; min-width: 44px;">${title}:</span>
        <div style="display: flex; align-items: center; gap: 4px; overflow-x: auto; padding: 4px 0;">
          ${nodes}
          <span style="color:#cbd5e1; font-size:12px;">▶</span>
          <div style="min-width: 34px; height: 38px; border-radius: 8px; background: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; font-family: monospace;">null</div>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${renderTrack('链表 A', listA, skipA, 'A')}
      ${renderTrack('链表 B', listB, skipB, 'B')}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'intersection-linked-list',
  name: '链表相交',
  category: 'linked-list',
  description: '面试题 02.07 / LC 160 · 双指针浪漫换道相遇，巧妙消除长度差确定两链表交点',
  icon: '🤝',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '透彻理解双指针换道算法数学原理 (a + c + b == b + c + a) 与链表相交判定技巧',
  inputs: [
    {
      id: 'case',
      label: '测试用例',
      type: 'select',
      defaultValue: 'meet',
      options: [
        { label: '示例 1 (相交于 8)', value: 'meet' },
        { label: '示例 2 (不相交)', value: 'miss' },
      ],
    },
  ],
  presets: [
    { label: '示例 1 (相交于 8)', values: { case: 'meet' } },
    { label: '示例 2 (不相交)', values: { case: 'miss' } },
  ],
  metrics: [
    { id: 'pa', label: 'pA 指针', color: '#2563eb' },
    { id: 'pb', label: 'pB 指针', color: '#059669' },
    { id: 'meet', label: '相遇判定', color: '#ec4899' },
    { id: 'intersection', label: '相交交点', color: '#ec4899' },
    { id: 'action', label: '当前指令', color: '#9333ea' },
  ],
  legend: [
    { label: '📍 pA 指针 (A → B)', color: '#2563eb' },
    { label: '📍 pB 指针 (B → A)', color: '#059669' },
    { label: '💖 公共相交节点', color: '#ec4899' },
  ],
  codeLanguages: INTERSECTION_LINKED_LIST_CODE_LANGUAGES,
  problemHtml: INTERSECTION_LINKED_LIST_PROBLEM_HTML,
  analysisHtml: INTERSECTION_LINKED_LIST_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildIntersectionSteps(String(inputs.case ?? 'meet') === 'meet')),
  renderCanvas: (container, step) => renderIntersectionLinkedListCanvas(container, step as ILLStep),
});
