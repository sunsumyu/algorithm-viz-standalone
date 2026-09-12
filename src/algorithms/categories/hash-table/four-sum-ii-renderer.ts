/**
 * 四数相加 II 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 454：分组哈希 (2+2 拆分)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  FOUR_SUM_II_PROBLEM_HTML,
  FOUR_SUM_II_ANALYSIS_HTML,
  FOUR_SUM_II_CODE_LANGUAGES,
} from './four-sum-ii-problem-content';

export interface FourSumIIStep {
  a: number[];
  b: number[];
  c: number[];
  d: number[];
  phase: 'group1-init' | 'group1-add' | 'group2-init' | 'group2-search' | 'done';
  status: 'group1-init' | 'group1-add' | 'group2-init' | 'group2-search' | 'done';
  idxA: number;
  idxB: number;
  idxC: number;
  idxD: number;
  sumAB?: number;
  sumCD?: number;
  target?: number;
  increment: number;
  count: number;
  mapEntries: [number, number][];
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildFourSumIISteps(
  nums1: number[],
  nums2: number[],
  nums3: number[],
  nums4: number[]
): FourSumIIStep[] {
  const steps: FourSumIIStep[] = [];
  const map = new Map<number, number>();
  let count = 0;

  const lines = {
    group1Init: { java: 2, cpp: 4, python: 3, javascript: 2 },
    group1Add: { java: [4, 5, 6], cpp: [5, 6, 7], python: [4, 5, 6], javascript: [3, 4, 5] },
    group2Init: { java: 9, cpp: 10, python: 7, javascript: 8 },
    group2Search: { java: [10, 11], cpp: [12, 13, 14], python: [9, 10], javascript: [10, 11] },
    done: { java: 14, cpp: 18, python: 11, javascript: 14 },
  };

  // 1. Group 1 初始化
  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'group1-init',
    status: 'group1-init',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count: 0,
    mapEntries: [],
    message: '初始化哈希表 Map，进入 Phase 1：统计 nums1 与 nums2 所有两数之和出现的频次。',
    log: 'Phase 1: 统计 A+B 频次',
    codeLine: lines.group1Init,
  });

  // Group 1: A + B
  for (let i = 0; i < nums1.length; i++) {
    for (let j = 0; j < nums2.length; j++) {
      const sumAB = nums1[i] + nums2[j];
      const prevFreq = map.get(sumAB) || 0;
      map.set(sumAB, prevFreq + 1);

      steps.push({
        a: nums1,
        b: nums2,
        c: nums3,
        d: nums4,
        phase: 'group1-add',
        status: 'group1-add',
        idxA: i,
        idxB: j,
        idxC: -1,
        idxD: -1,
        sumAB,
        increment: 0,
        count: 0,
        mapEntries: Array.from(map.entries()),
        message: `枚举 nums1[${i}] (${nums1[i]}) + nums2[${j}] (${nums2[j]}) = ${sumAB}。将和 ${sumAB} 存入 Map，频次更新为 ${map.get(sumAB)}。`,
        log: `A[${i}]+B[${j}] = ${sumAB} -> Map[${sumAB}] = ${map.get(sumAB)}`,
        codeLine: lines.group1Add,
      });
    }
  }

  // 2. Group 2 初始化
  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'group2-init',
    status: 'group2-init',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count: 0,
    mapEntries: Array.from(map.entries()),
    message: '进入 Phase 2：遍历 nums3 与 nums4，寻找 0 - (c + d) 是否在 Map 中存在。',
    log: 'Phase 2: 查找 0 - (C+D)',
    codeLine: lines.group2Init,
  });

  // Group 2: C + D
  for (let k = 0; k < nums3.length; k++) {
    for (let l = 0; l < nums4.length; l++) {
      const sumCD = nums3[k] + nums4[l];
      const target = 0 - sumCD;
      const matched = map.get(target) || 0;
      count += matched;

      steps.push({
        a: nums1,
        b: nums2,
        c: nums3,
        d: nums4,
        phase: 'group2-search',
        status: 'group2-search',
        idxA: -1,
        idxB: -1,
        idxC: k,
        idxD: l,
        sumCD,
        target,
        increment: matched,
        count,
        mapEntries: Array.from(map.entries()),
        message:
          matched > 0
            ? `🎉 nums3[${k}] (${nums3[k]}) + nums4[${l}] (${nums4[l]}) = ${sumCD}，目标 target = 0 - (${sumCD}) = ${target}。在 Map 中找到匹配频次 ${matched} 次，累计 count += ${matched} (现为 ${count})。`
            : `nums3[${k}] (${nums3[k]}) + nums4[${l}] (${nums4[l]}) = ${sumCD}，目标 target = ${target} 未在 Map 中找到，继续扫描。`,
        log: `C[${k}]+D[${l}] = ${sumCD}, 找 ${target} -> 命中 +${matched} (总计: ${count})`,
        codeLine: lines.group2Search,
      });
    }
  }

  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'done',
    status: 'done',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count,
    mapEntries: Array.from(map.entries()),
    message: `🎉 搜索完成！共找到 ${count} 个满足条件的四元组。`,
    log: `求解完成: 共 ${count} 个合法四元组`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: FourSumIIStep[]): FourSumIIStep[] {
  return steps.map((s) => {
    return {
      ...s,
      metrics: {
        phase: s.phase.startsWith('group1') ? 'Group 1 (A+B)' : 'Group 2 (C+D)',
        target: s.target !== undefined ? String(s.target) : '—',
        inc: `+${s.increment}`,
        count: String(s.count),
      },
    };
  });
}

export function renderFourSumIICanvas(container: HTMLElement, step: FourSumIIStep): void {
  const { a, b, c, d, idxA, idxB, idxC, idxD, mapEntries, target } = step;

  // 1. 渲染 4 数组
  const renderRow = (arr: number[], activeIdx: number) =>
    arr
      .map((num, idx) => {
        const isActive = idx === activeIdx;
        return `
          <div style="width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; color: ${isActive ? '#1d4ed8' : '#334155'}; background: ${isActive ? '#eff6ff' : '#ffffff'}; border: 1px solid ${isActive ? '#2563eb' : '#cbd5e1'}; transition: all 0.15s; box-shadow: ${isActive ? '0 0 0 2px rgba(37, 99, 235, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.03)'}; transform: ${isActive ? 'scale(1.08)' : 'none'};">
            <span>${num}</span>
          </div>
        `;
      })
      .join('');

  const arrayCol = (title: string, arr: number[], activeIdx: number) => `
    <div style="padding: 2px; display: flex; flex-direction: column; align-items: center; gap: 5px;">
      <span style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">${title}</span>
      <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">${renderRow(arr, activeIdx)}</div>
    </div>
  `;

  // 2. 渲染 Map
  const mapHtml =
    mapEntries.length === 0
      ? '<span style="color: #94a3b8; font-size: 10.5px;">(Map 当前为空)</span>'
      : mapEntries
          .map(([k, v]) => {
            const isTarget = target !== undefined && k === target;
            return `
              <div style="padding: 3px 8px; border-radius: 6px; background: ${isTarget ? '#ecfdf5' : '#ffffff'}; border: 1px solid ${isTarget ? '#10b981' : '#cbd5e1'}; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; transition: all 0.15s; box-shadow: ${isTarget ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.03)'};">
                <span style="color: #3b82f6; font-weight: 700;">sum=${k}</span>
                <span style="color: #94a3b8;">:</span>
                <span style="color: #10b981; font-weight: 700;">freq=${v}</span>
              </div>
            `;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; gap: 14px; height: 100%; width: 100%; padding: 12px; box-sizing: border-box;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%;">
        ${arrayCol('nums1 (a)', a, idxA)}
        ${arrayCol('nums2 (b)', b, idxB)}
        ${arrayCol('nums3 (c)', c, idxC)}
        ${arrayCol('nums4 (d)', d, idxD)}
      </div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b; align-self: flex-start;">
        哈希表 Map (Key: a+b 和, Value: 出现次数)
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; width: 100%; min-height: 28px; align-items: center;">
        ${mapHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'four-sum-ii',
  name: '四数相加II（分组哈希）',
  category: 'hash-table',
  description: '将四数组分为两组，用哈希表统计和为0的元组数',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握分组降维 + 哈希表计数优化四重循环',
  inputs: [
    { id: 'nums1', label: 'nums1', type: 'text', defaultValue: '1, 2', placeholder: '逗号分隔', width: '70px' },
    { id: 'nums2', label: 'nums2', type: 'text', defaultValue: '-2, -1', placeholder: '逗号分隔', width: '70px' },
    { id: 'nums3', label: 'nums3', type: 'text', defaultValue: '-1, 2', placeholder: '逗号分隔', width: '70px' },
    { id: 'nums4', label: 'nums4', type: 'text', defaultValue: '0, 2', placeholder: '逗号分隔', width: '70px' },
  ],
  presets: [
    {
      label: '示例 1: (2 组有效解)',
      values: { nums1: '1, 2', nums2: '-2, -1', nums3: '-1, 2', nums4: '0, 2' },
    },
    {
      label: '全零 4 数组: (16 组解)',
      values: { nums1: '0, 0', nums2: '0, 0', nums3: '0, 0', nums4: '0, 0' },
    },
    {
      label: '单解案例: (1 组解)',
      values: { nums1: '1, 1', nums2: '-1, 2', nums3: '0, 1', nums4: '0, -2' },
    },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'target', label: '待查 Target', color: '#9333ea' },
    { id: 'inc', label: '单次匹配增量', color: '#f59e0b' },
    { id: 'count', label: '累计有效元组', color: '#10b981' },
  ],
  legend: [
    { label: 'Group 1: A+B 频次', color: '#2563eb' },
    { label: 'Group 2: -(C+D) 匹配', color: '#10b981' },
  ],
  codeLanguages: FOUR_SUM_II_CODE_LANGUAGES,
  problemHtml: FOUR_SUM_II_PROBLEM_HTML,
  analysisHtml: FOUR_SUM_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const parse = (v: any, fallback: number[]) => {
      const arr = String(v ?? '')
        .split(/[,，\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n));
      return arr.length > 0 ? arr : fallback;
    };
    return withMetrics(
      buildFourSumIISteps(
        parse(inputs.nums1, [1, 2]),
        parse(inputs.nums2, [-2, -1]),
        parse(inputs.nums3, [-1, 2]),
        parse(inputs.nums4, [0, 2])
      )
    );
  },
  renderCanvas: (container, step) => renderFourSumIICanvas(container, step as FourSumIIStep),
});
