/**
 * 合并两个有序数组可视化器（逆向双指针）
 * LeetCode 88
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MERGE_SORTED_ARRAY_PROBLEM_HTML,
  MERGE_SORTED_ARRAY_ANALYSIS_HTML,
  MERGE_SORTED_ARRAY_CODE_LANGUAGES,
} from './merge-sorted-array-problem-content';

export interface MSAStep {
  nums1: (number | null)[];
  nums2: number[];
  m: number;
  n: number;
  p1: number; // nums1 当前待比较指针
  p2: number; // nums2 当前待比较指针
  k: number;  // 写入目标位置
  action: 'init' | 'compare' | 'fill_p1' | 'fill_p2' | 'done';
  chosenSource?: 'nums1' | 'nums2';
  chosenValue?: number;
  message: string;
  codeLine: HighlightTarget;
}

export function parseValues(input: string, defaultVals: number[]): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : defaultVals;
}

export function buildMSASteps(nums1Valid: number[], nums2Arr: number[]): MSAStep[] {
  const steps: MSAStep[] = [];
  const m = nums1Valid.length;
  const n = nums2Arr.length;
  // 物理 nums1 长度为 m + n，初始后 n 个为 null
  const nums1Full: (number | null)[] = [...nums1Valid, ...new Array(n).fill(null)];
  const nums2Copy = [...nums2Arr];

  const lines = {
    init: { java: [3, 4, 5], cpp: [4, 5, 6], python: 3, javascript: [2, 3, 4] },
    compare: { java: 7, cpp: 8, python: 5, javascript: 6 },
    fillP1: { java: 8, cpp: 9, python: [6, 7], javascript: 7 },
    fillP2: { java: 10, cpp: 11, python: [9, 10], javascript: 9 },
    done: { java: 12, cpp: 13, python: 4, javascript: 11 },
  };

  let p1 = m - 1;
  let p2 = n - 1;
  let k = m + n - 1;

  steps.push({
    nums1: [...nums1Full],
    nums2: [...nums2Copy],
    m,
    n,
    p1,
    p2,
    k,
    action: 'init',
    message: `初始化：nums1 有效长度 m=${m}，nums2 长度 n=${n}。分配写入指针 k=${k}，p1=${p1}，p2=${p2}。从后向前比较填充。`,
    codeLine: lines.init,
  });

  while (p2 >= 0) {
    if (p1 >= 0) {
      const v1 = nums1Full[p1] as number;
      const v2 = nums2Copy[p2];

      steps.push({
        nums1: [...nums1Full],
        nums2: [...nums2Copy],
        m,
        n,
        p1,
        p2,
        k,
        action: 'compare',
        message: `比较末尾元素：nums1[${p1}]=${v1} 与 nums2[${p2}]=${v2}。`,
        codeLine: lines.compare,
      });

      if (v1 > v2) {
        nums1Full[k] = v1;
        steps.push({
          nums1: [...nums1Full],
          nums2: [...nums2Copy],
          m,
          n,
          p1,
          p2,
          k,
          action: 'fill_p1',
          chosenSource: 'nums1',
          chosenValue: v1,
          message: `nums1[${p1}]=${v1} > nums2[${p2}]=${v2}，将 ${v1} 写入 nums1[${k}]。p1 和 k 前移。`,
          codeLine: lines.fillP1,
        });
        p1--;
      } else {
        nums1Full[k] = v2;
        steps.push({
          nums1: [...nums1Full],
          nums2: [...nums2Copy],
          m,
          n,
          p1,
          p2,
          k,
          action: 'fill_p2',
          chosenSource: 'nums2',
          chosenValue: v2,
          message: `nums1[${p1}]=${v1} <= nums2[${p2}]=${v2}，将 ${v2} 写入 nums1[${k}]。p2 和 k 前移。`,
          codeLine: lines.fillP2,
        });
        p2--;
      }
    } else {
      // p1 已经全部处理完，直接把 nums2 剩余元素拷贝进 nums1
      const v2 = nums2Copy[p2];
      nums1Full[k] = v2;
      steps.push({
        nums1: [...nums1Full],
        nums2: [...nums2Copy],
        m,
        n,
        p1,
        p2,
        k,
        action: 'fill_p2',
        chosenSource: 'nums2',
        chosenValue: v2,
        message: `nums1 原有效元素已处理完 (p1 < 0)，将 nums2[${p2}]=${v2} 写入 nums1[${k}]。`,
        codeLine: lines.fillP2,
      });
      p2--;
    }
    k--;
  }

  steps.push({
    nums1: [...nums1Full],
    nums2: [...nums2Copy],
    m,
    n,
    p1,
    p2,
    k,
    action: 'done',
    message: `🎉 合并完成！最终 nums1 为 [${nums1Full.join(', ')}]。`,
    codeLine: lines.done,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MSAStep[]): MSAStep[] {
  return steps.map((s) => {
    let phase = '初始化';
    let phaseColor = '#3b82f6';
    if (s.action === 'compare') {
      phase = '双指针比对';
      phaseColor = '#2563eb';
    } else if (s.action === 'fill_p1' || s.action === 'fill_p2') {
      phase = `写入 ${s.chosenValue}`;
      phaseColor = '#f59e0b';
    } else if (s.action === 'done') {
      phase = '合并完成';
      phaseColor = '#10b981';
    }

    return {
      ...s,
      log: s.message,
      metrics: {
        p1: s.p1 >= 0 ? `[${s.p1}]=${s.nums1[s.p1]}` : '已越界 (-1)',
        p2: s.p2 >= 0 ? `[${s.p2}]=${s.nums2[s.p2]}` : '已越界 (-1)',
        k: s.k >= 0 ? `[${s.k}]` : '已完成 (-1)',
        phase,
      },
    };
  });
}

/** 主视觉：nums1 物理存储区 + nums2 来源数组（双指针沙盘） */
export function renderMergeSortedArrayCanvas(container: HTMLElement, step: MSAStep): void {
  const totalLen1 = step.nums1.length;
  const len2 = step.nums2.length;

  let html = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">

      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
          <span>nums1 物理存储区 (长度 ${totalLen1})</span>
          <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">(前 ${step.m} 个有效，后 ${step.n} 个待写入)</span>
        </div>
        <div style="display: flex; gap: 6px; position: relative;">
  `;

  for (let i = 0; i < totalLen1; i++) {
    const val = step.nums1[i];
    const isP1 = step.p1 === i;
    const isK = step.k === i;
    const isFilledInStep = step.k === i && (step.action === 'fill_p1' || step.action === 'fill_p2');

    let bg = '#ffffff';
    let border = '2px solid #cbd5e1';
    let textColor = '#0f172a';

    if (val === null) {
      bg = '#f8fafc';
      border = '2px dashed #94a3b8';
      textColor = '#94a3b8';
    }

    if (isK) {
      border = '2px solid #f59e0b';
      bg = isFilledInStep ? '#fef3c7' : '#fffbeb';
    } else if (isP1) {
      border = '2px solid #3b82f6';
      bg = '#eff6ff';
    }

    html += `
      <div style="display: flex; flex-direction: column; align-items: center; width: 38px; position: relative;">
        <div style="height: 18px; display: flex; align-items: center; justify-content: center;">
          ${isP1 ? '<span style="background: #3b82f6; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px;">p1</span>' : ''}
          ${isK ? '<span style="background: #f59e0b; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; margin-left: 2px;">k</span>' : ''}
        </div>
        <div style="width: 38px; height: 38px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
          ${val !== null ? val : '∅'}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${i}]</div>
      </div>
    `;
  }

  html += `
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 11px;">
        <span>↑ 逆向合并与数据回填</span>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
          <span>nums2 来源数组 (长度 ${len2})</span>
        </div>
        <div style="display: flex; gap: 6px; position: relative;">
  `;

  for (let j = 0; j < len2; j++) {
    const val = step.nums2[j];
    const isP2 = step.p2 === j;

    let bg = '#ffffff';
    let border = '2px solid #cbd5e1';

    if (isP2) {
      border = '2px solid #10b981';
      bg = '#ecfdf5';
    }

    html += `
      <div style="display: flex; flex-direction: column; align-items: center; width: 38px; position: relative;">
        <div style="height: 18px; display: flex; align-items: center; justify-content: center;">
          ${isP2 ? '<span style="background: #10b981; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px;">p2</span>' : ''}
        </div>
        <div style="width: 38px; height: 38px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
          ${val}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${j}]</div>
      </div>
    `;
  }

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function parseNums(raw: string): number[] {
  return String(raw ?? '')
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

registerDeclarativeAlgorithm({
  id: 'merge-sorted-array',
  name: '合并两个有序数组（双指针）',
  category: 'linked-list',
  description: '逆向双指针从后向前填充，O(m+n) 时间 O(1) 额外空间',
  icon: '🔀',
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '学会从后向前的逆向双指针合并技术，避免元素后移与额外空间消耗',
  inputs: [
    { id: 'n1', label: 'nums1 有效元素', type: 'text', defaultValue: '1, 2, 3' },
    { id: 'n2', label: 'nums2', type: 'text', defaultValue: '2, 5, 6' },
  ],
  presets: [
    { label: '示例 1', values: { n1: '1, 2, 3, 0, 0, 0', m: '3', n2: '2, 5, 6', n: '3' } },
    { label: '单元素', values: { n1: '1', m: '1', n2: '', n: '0' } },
    { label: 'nums1 全空位', values: { n1: '0, 0, 0', m: '0', n2: '1, 2, 3', n: '3' } },
  ],
  metrics: [
    { id: 'p1', label: 'nums1 指针 p1', color: '#3b82f6' },
    { id: 'p2', label: 'nums2 指针 p2', color: '#10b981' },
    { id: 'k', label: '写入位置 k', color: '#f59e0b' },
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
  ],
  legend: [
    { label: 'p1 比较指针', color: '#3b82f6' },
    { label: 'p2 来源指针', color: '#10b981' },
    { label: 'k 写入位置', color: '#f59e0b' },
  ],
  codeLanguages: MERGE_SORTED_ARRAY_CODE_LANGUAGES,
  problemHtml: MERGE_SORTED_ARRAY_PROBLEM_HTML,
  analysisHtml: MERGE_SORTED_ARRAY_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const n1 = parseNums(String(inputs.n1 ?? '1, 2, 3')).sort((a, b) => a - b);
    const n2 = parseNums(String(inputs.n2 ?? '2, 5, 6')).sort((a, b) => a - b);
    return withMetrics(buildMSASteps(n1.length ? n1 : [1, 2, 3], n2));
  },
  renderCanvas: (container, step) => renderMergeSortedArrayCanvas(container, step as MSAStep),
});
