/**
 * 分发饼干可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 455：贪心双指针小饼干优先分配
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ASSIGN_COOKIES_PROBLEM_HTML,
  ASSIGN_COOKIES_ANALYSIS_HTML,
  ASSIGN_COOKIES_CODE_LANGUAGES,
} from './assign-cookies-problem-content';

export type AcPhase = 'init' | 'check' | 'matched' | 'skip' | 'done';

export interface AssignCookiesStep {
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
  codeLine: number;
  metrics?: Record<string, string>;
}

export function assignCookiesSteps(children: number[], cookies: number[]): AssignCookiesStep[] {
  const steps: AssignCookiesStep[] = [];

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
    codeLine: 2,
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
      codeLine: 7,
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
        codeLine: 8,
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
        codeLine: 10,
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
    codeLine: 12,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: AssignCookiesStep[]): AssignCookiesStep[] {
  return steps.map((s) => {
    let action = '排序预处理 (sort)';
    if (s.phase === 'check') action = `比较 s[${s.cookieIndex}] vs g[${s.childIndex}]`;
    else if (s.phase === 'matched') action = '✓ 满足分配 (s[j] >= g[i])';
    else if (s.phase === 'skip') action = '⏭️ 尺寸不足 (s[j] < g[i])';
    else if (s.phase === 'done') action = '贪心扫描完成';

    return {
      ...s,
      metrics: {
        'child-pointer': String(s.childIndex),
        'cookie-pointer': String(s.cookieIndex),
        satisfied: `${s.satisfiedCount} / ${s.children.length}`,
        action,
      },
    };
  });
}

export function renderAssignCookiesCanvas(container: HTMLElement, step: AssignCookiesStep): void {
  const isDone = step.phase === 'done';

  // 孩子数组条
  const childrenHtml = step.children
    .map((val, idx) => {
      const isSatisfied = step.satisfiedChildren.includes(idx);
      const isCurrent = !isDone && idx === step.childIndex;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isSatisfied) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isCurrent) {
        bg = '#fff7ed';
        borderColor = '#ea580c';
        textColor = '#ea580c';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">${isCurrent ? '▼ child' : `g[${idx}]`}</span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: all 0.15s;">
            ${val}
          </div>
          <span style="font-size: 9px; color: ${isSatisfied ? '#10b981' : '#94a3b8'}; font-weight: 600;">${isSatisfied ? '✓ 满足' : '待满足'}</span>
        </div>
      `;
    })
    .join('');

  // 饼干数组条
  const cookiesHtml = step.cookies
    .map((val, idx) => {
      const isMatched = step.matchedCookies.includes(idx);
      const isSkipped = step.skippedCookies.includes(idx);
      const isCurrent = !isDone && idx === step.cookieIndex;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isMatched) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isSkipped) {
        bg = '#f1f5f9';
        borderColor = '#cbd5e1';
        textColor = '#94a3b8';
      } else if (isCurrent) {
        bg = '#fff7ed';
        borderColor = '#ea580c';
        textColor = '#ea580c';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">${isCurrent ? '▼ cookie' : `s[${idx}]`}</span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: all 0.15s;">
            ${val}
          </div>
          <span style="font-size: 9px; color: ${isMatched ? '#10b981' : isSkipped ? '#94a3b8' : '#64748b'}; font-weight: 600;">${isMatched ? '🍪 已发' : isSkipped ? '⏭️ 跳过' : '可用'}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
        <span>👦 孩子胃口数组 (g, 已排序):</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
        ${childrenHtml}
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
      <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
        <span>🍪 饼干尺寸数组 (s, 已排序):</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
        ${cookiesHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'assign-cookies',
  name: '分发饼干',
  category: 'greedy',
  description: '贪心双指针小饼干优先分配，最大化满足孩子数量',
  icon: '🍪',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握贪心算法在排序+双指针场景下的局部最优到全局最优推导',
  inputs: [
    { id: 'g', label: '胃口 g', type: 'text', defaultValue: '1,2,3', placeholder: '1,2,3' },
    { id: 's', label: '饼干 s', type: 'text', defaultValue: '1,1', placeholder: '1,1' },
  ],
  presets: [
    { label: '示例 1 (1解)', values: { g: '1,2,3', s: '1,1' } },
    { label: '示例 2 (2解)', values: { g: '1,2', s: '1,2,3' } },
    { label: '综合测试 (3解)', values: { g: '3,5,6,8', s: '1,3,4,7,9' } },
  ],
  metrics: [
    { id: 'child-pointer', label: '孩子指针 i', color: '#ea580c' },
    { id: 'cookie-pointer', label: '饼干指针 j', color: '#ea580c' },
    { id: 'satisfied', label: '满足孩子数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '✓ 满足匹配', color: '#10b981' },
    { label: '📍 当前扫描指针', color: '#ea580c' },
    { label: '⏭️ 跳过过小饼干', color: '#94a3b8' },
  ],
  codeLanguages: ASSIGN_COOKIES_CODE_LANGUAGES,
  problemHtml: ASSIGN_COOKIES_PROBLEM_HTML,
  analysisHtml: ASSIGN_COOKIES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const parseArr = (str: string, fallback: number[]) => {
      const arr = str
        .split(/[,，\s]+/)
        .map((t) => parseInt(t.trim(), 10))
        .filter((n) => !isNaN(n));
      return arr.length > 0 ? arr : fallback;
    };
    const children = parseArr(String(inputs.g ?? '1,2,3'), [1, 2, 3]);
    const cookies = parseArr(String(inputs.s ?? '1,1'), [1, 1]);
    return withMetrics(assignCookiesSteps(children, cookies));
  },
  renderCanvas: (container, step) => renderAssignCookiesCanvas(container, step as AssignCookiesStep),
});
