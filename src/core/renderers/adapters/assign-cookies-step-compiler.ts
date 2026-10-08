import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export type AcPhase = 'init' | 'check' | 'matched' | 'skip' | 'done';

export interface AssignCookiesStep extends StepBase {
  phase: AcPhase;
  children: number[];
  cookies: number[];
  childIndex: number;
  cookieIndex: number;
  satisfiedCount: number;
  satisfiedChildren: number[];
  matchedCookies: number[];
  skippedCookies: number[];
  message: string;
  log?: string;
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
}

export const ASSIGN_COOKIES_CODE_LINES: Record<string, HighlightTarget> = {
  sort: { java: 2, cpp: 4, python: 3, javascript: 2 },
  check: { java: 8, cpp: 9, python: 7, javascript: 7 },
  matched: { java: 9, cpp: 10, python: 8, javascript: 8 },
  skip: { java: 11, cpp: 12, python: 9, javascript: 10 },
  done: { java: 13, cpp: 14, python: 10, javascript: 12 },
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

function withMetrics(steps: AssignCookiesStep[]): AssignCookiesStep[] {
  return steps.map((s) => {
    let action = '排序预处理 (sort)';
    if (s.phase === 'check') action = `比较 s[${s.cookieIndex}] vs g[${s.childIndex}]`;
    else if (s.phase === 'matched') action = '✓ 满足分配 (s[j] >= g[i])';
    else if (s.phase === 'skip') action = '⏭️ 尺寸不足 (s[j] < g[i])';
    else if (s.phase === 'done') action = '贪心扫描完成';

    return {
      ...s,
      decision: s.decision ?? action,
      log: s.log ?? s.message,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'child-pointer': String(s.childIndex),
        'cookie-pointer': String(s.cookieIndex),
        satisfied: `${s.satisfiedCount} / ${s.children.length}`,
        action,
      },
    };
  });
}

export function assignCookiesSteps(children: number[], cookies: number[]): AssignCookiesStep[] {
  const steps: AssignCookiesStep[] = [];
  const lines = ASSIGN_COOKIES_CODE_LINES;

  const sortedChildren = [...children].sort((a, b) => a - b);
  const sortedCookies = [...cookies].sort((a, b) => a - b);

  steps.push({
    phase: 'init',
    children: [...sortedChildren],
    cookies: [...sortedCookies],
    childIndex: 0,
    cookieIndex: 0,
    satisfiedCount: 0,
    satisfiedChildren: [],
    matchedCookies: [],
    skippedCookies: [],
    message: `升序排序完成：孩子胃口 g=[${sortedChildren.join(', ')}]，饼干尺寸 s=[${sortedCookies.join(', ')}]`,
    decision: '升序排序完成',
    codeLine: lines.sort,
    line: getLine(lines.sort),
  });

  let childIdx = 0;
  let cookieIdx = 0;
  let satisfied = 0;
  const satisfiedChildren: number[] = [];
  const matchedCookies: number[] = [];
  const skippedCookies: number[] = [];

  while (childIdx < sortedChildren.length && cookieIdx < sortedCookies.length) {
    const curG = sortedChildren[childIdx];
    const curS = sortedCookies[cookieIdx];

    steps.push({
      phase: 'check',
      children: [...sortedChildren],
      cookies: [...sortedCookies],
      childIndex: childIdx,
      cookieIndex: cookieIdx,
      satisfiedCount: satisfied,
      satisfiedChildren: [...satisfiedChildren],
      matchedCookies: [...matchedCookies],
      skippedCookies: [...skippedCookies],
      message: `贪心比较：孩子 g[${childIdx}]=${curG} 与 饼干 s[${cookieIdx}]=${curS}`,
      decision: `比较 s[${cookieIdx}] 与 g[${childIdx}]`,
      codeLine: lines.check,
      line: getLine(lines.check),
    });

    if (curS >= curG) {
      satisfied++;
      satisfiedChildren.push(childIdx);
      matchedCookies.push(cookieIdx);
      childIdx++;
      cookieIdx++;

      steps.push({
        phase: 'matched',
        children: [...sortedChildren],
        cookies: [...sortedCookies],
        childIndex: childIdx - 1,
        cookieIndex: cookieIdx - 1,
        satisfiedCount: satisfied,
        satisfiedChildren: [...satisfiedChildren],
        matchedCookies: [...matchedCookies],
        skippedCookies: [...skippedCookies],
        message: `✓ 匹配成功！饼干 ${curS} 满足孩子胃口 ${curG}，累计满足 ${satisfied} 人`,
        decision: '满足分配',
        codeLine: lines.matched,
        line: getLine(lines.matched),
      });
    } else {
      skippedCookies.push(cookieIdx);
      cookieIdx++;

      steps.push({
        phase: 'skip',
        children: [...sortedChildren],
        cookies: [...sortedCookies],
        childIndex: childIdx,
        cookieIndex: cookieIdx - 1,
        satisfiedCount: satisfied,
        satisfiedChildren: [...satisfiedChildren],
        matchedCookies: [...matchedCookies],
        skippedCookies: [...skippedCookies],
        message: `⏭️ 饼干太小：s[${cookieIdx - 1}]=${curS} < g[${childIdx}]=${curG}，无法满足，跳过该饼干`,
        decision: '尺寸不足跳过',
        codeLine: lines.skip,
        line: getLine(lines.skip),
      });
    }
  }

  steps.push({
    phase: 'done',
    children: [...sortedChildren],
    cookies: [...sortedCookies],
    childIndex: childIdx,
    cookieIndex: cookieIdx,
    satisfiedCount: satisfied,
    satisfiedChildren: [...satisfiedChildren],
    matchedCookies: [...matchedCookies],
    skippedCookies: [...skippedCookies],
    message: `🎉 贪心扫描结束！最多可以满足 ${satisfied} 个孩子`,
    decision: '贪心扫描结束',
    codeLine: lines.done,
    line: getLine(lines.done),
  });

  return withMetrics(steps);
}
