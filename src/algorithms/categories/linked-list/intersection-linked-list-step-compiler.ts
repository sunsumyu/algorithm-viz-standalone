/**
 * 链表相交 — 步进推演编译器
 * 面试题 02.07 / LC 160：双指针浪漫换道相遇，巧妙消除长度差
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

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
export function withIntersectionLinkedListMetrics(steps: ILLStep[]): ILLStep[] {
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
