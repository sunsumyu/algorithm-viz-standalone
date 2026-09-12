/**
 * 两个数组的交集可视化器 — 声明式 4-Card 标准架构
 * LeetCode 349：哈希集合 HashSet
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  INTERSECTION_ARRAYS_PROBLEM_HTML,
  INTERSECTION_ARRAYS_ANALYSIS_HTML,
  INTERSECTION_ARRAYS_CODE_LANGUAGES,
} from './intersection-of-two-arrays-problem-content';

export interface IntersectionStep {
  nums1: number[];
  nums2: number[];
  phase: 'build-set1' | 'scan-nums2' | 'done';
  idx1: number;
  idx2: number;
  currentVal: number | null;
  set1: number[];
  resultSet: number[];
  isHit: boolean;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function parseNumArray(input: string, defaultArr: number[]): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : defaultArr;
}

export function buildIntersectionSteps(nums1: number[], nums2: number[]): IntersectionStep[] {
  const steps: IntersectionStep[] = [];
  const set1 = new Set<number>();
  const resultSet = new Set<number>();

  const lines = {
    buildSet1: { java: [7, 8], cpp: 4, python: 3, javascript: 2 },
    scanMiss: { java: [10, 11], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    scanHit: { java: [11, 12], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    done: { java: 15, cpp: 11, python: 8, javascript: 9 },
  };

  // 1. 将 nums1 存入 set1
  for (let i = 0; i < nums1.length; i++) {
    const val = nums1[i];
    set1.add(val);

    steps.push({
      nums1,
      nums2,
      phase: 'build-set1',
      idx1: i,
      idx2: -1,
      currentVal: val,
      set1: Array.from(set1),
      resultSet: [],
      isHit: false,
      message: `遍历 nums1[${i}] = ${val}，将其存入集合 set1。set1 当前大小为 ${set1.size}。`,
      log: `set1.add(${val}) -> [${Array.from(set1).join(', ')}]`,
      codeLine: lines.buildSet1,
    });
  }

  // 2. 遍历 nums2 查询 set1
  for (let j = 0; j < nums2.length; j++) {
    const val = nums2[j];
    const hit = set1.has(val);
    if (hit) {
      resultSet.add(val);
    }

    steps.push({
      nums1,
      nums2,
      phase: 'scan-nums2',
      idx1: -1,
      idx2: j,
      currentVal: val,
      set1: Array.from(set1),
      resultSet: Array.from(resultSet),
      isHit: hit,
      message: hit
        ? `🎉 检查 nums2[${j}] = ${val}：在 set1 中存在！将其存入交集结果集 resultSet (现为 [${Array.from(resultSet).join(', ')}])。`
        : `检查 nums2[${j}] = ${val}：不在 set1 中，跳过。`,
      log: hit ? `✓ 命中交集: ${val}` : `比对 nums2[${j}]=${val} (未命中)`,
      codeLine: hit ? lines.scanHit : lines.scanMiss,
    });
  }

  steps.push({
    nums1,
    nums2,
    phase: 'done',
    idx1: -1,
    idx2: -1,
    currentVal: null,
    set1: Array.from(set1),
    resultSet: Array.from(resultSet),
    isHit: false,
    message: `🎉 交集求解完成！最终交集为 [${Array.from(resultSet).join(', ')}]。`,
    log: `求解完成: 交集共 ${resultSet.size} 个元素`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: IntersectionStep[]): IntersectionStep[] {
  return steps.map((s) => {
    let hit: string;
    if (s.phase === 'scan-nums2') {
      hit = s.isHit ? '✓ 命中' : '✗ 未命中';
    } else {
      hit = '—';
    }
    return {
      ...s,
      metrics: {
        phase:
          s.phase === 'build-set1' ? '构建 set1' : s.phase === 'scan-nums2' ? '遍历 nums2 匹配' : '完成',
        'cur-val': s.currentVal !== null ? String(s.currentVal) : '—',
        hit,
        'res-count': `${s.resultSet.length} 个`,
      },
    };
  });
}

export function renderIntersectionCanvas(container: HTMLElement, step: IntersectionStep): void {
  const { nums1, nums2, phase, idx1, idx2, currentVal, set1, resultSet, isHit } = step;

  // 1. 渲染 nums1 和 nums2 数组卡槽
  const renderCells = (arr: number[], activeIdx: number, ptrLabel: string) =>
    arr
      .map((num, idx) => {
        const isCur = idx === activeIdx;
        const isHitCell = isCur && isHit;
        let border = '#cbd5e1';
        let bg = '#ffffff';
        let boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
        let transform = 'none';
        if (isHitCell) {
          border = '#10b981';
          bg = '#ecfdf5';
          transform = 'scale(1.08)';
          boxShadow = '0 2px 6px rgba(16, 185, 129, 0.25)';
        } else if (isCur) {
          border = '#2563eb';
          bg = '#eff6ff';
          transform = 'scale(1.08)';
          boxShadow = '0 2px 6px rgba(37, 99, 235, 0.2)';
        }
        const ptrTag = isCur ? (isHitCell ? '🎯命中' : `▼${ptrLabel}`) : '';
        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <div style="width: 36px; height: 38px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: ${boxShadow}; transform: ${transform};">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace; line-height: 1.1;">${num}</span>
              <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8;">[${idx}]</span>
            </div>
            <span style="font-size: 8.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #2563eb; height: 12px; line-height: 12px;">${ptrTag}</span>
          </div>
        `;
      })
      .join('');

  // 2. 渲染 set1 与 resultSet 芯片
  const set1Html =
    set1.length === 0
      ? '<span style="color:#94a3b8; font-size:11px; padding: 4px 8px;">(空集合 ∅)</span>'
      : set1
          .map((num) => {
            const isNew = phase === 'build-set1' && num === currentVal;
            const border = isNew ? '#2563eb' : '#bfdbfe';
            const bg = isNew ? '#dbeafe' : '#eff6ff';
            return `<div style="padding: 3px 10px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; color: #1e40af; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; display: inline-flex; align-items: center; gap: 3px; transition: all 0.2s;"><span style="color:#3b82f6;">#</span> ${num}</div>`;
          })
          .join('');

  const resultHtml =
    resultSet.length === 0
      ? '<span style="color:#94a3b8; font-size:11px; padding: 4px 8px;">(暂无交集)</span>'
      : resultSet
          .map((num) => {
            const isNew = phase === 'scan-nums2' && isHit && num === currentVal;
            const border = isNew ? '#10b981' : '#a7f3d0';
            const bg = isNew ? '#d1fae5' : '#ecfdf5';
            return `<div style="padding: 3px 10px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; color: #047857; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; display: inline-flex; align-items: center; gap: 3px; transition: all 0.2s;"><span>✨</span> ${num}</div>`;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">nums1 (遍历建集合)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">${renderCells(nums1, idx1, 'i')}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">nums2 (查询 set1)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">${renderCells(nums2, idx2, 'j')}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px; width: 100%; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; white-space: nowrap;">set1</span>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; min-height: 32px;">${set1Html}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; white-space: nowrap;">resultSet</span>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; min-height: 32px;">${resultHtml}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'intersection-arrays',
  name: '两个数组的交集（哈希集合）',
  category: 'hash-table',
  description: '用哈希集合求两个数组的交集元素',
  icon: '🔀',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握用 Set 去重后高效求交集的思路',
  inputs: [
    {
      id: 'nums1',
      label: 'nums1',
      type: 'text',
      defaultValue: '1, 2, 2, 1',
      placeholder: '逗号分隔',
      width: '80px',
    },
    {
      id: 'nums2',
      label: 'nums2',
      type: 'text',
      defaultValue: '2, 2',
      placeholder: '逗号分隔',
      width: '60px',
    },
  ],
  presets: [
    { label: '示例 1: [1,2,2,1] & [2,2] ➔ [2]', values: { nums1: '1, 2, 2, 1', nums2: '2, 2' } },
    { label: '示例 2: [4,9,5] & [9,4..] ➔ [9,4]', values: { nums1: '4, 9, 5', nums2: '9, 4, 9, 8, 4' } },
    { label: '无交集: [1,2,3] & [4,5,6] ➔ []', values: { nums1: '1, 2, 3', nums2: '4, 5, 6' } },
    { label: '全重复: [7,7,7] & [7,7] ➔ [7]', values: { nums1: '7, 7, 7', nums2: '7, 7' } },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'cur-val', label: '当前元素', color: '#9333ea' },
    { id: 'hit', label: '是否命中 set1', color: '#f59e0b' },
    { id: 'res-count', label: '交集结果数', color: '#10b981' },
  ],
  legend: [
    { label: 'set1 (nums1去重)', color: '#2563eb' },
    { label: 'resultSet (交集结果)', color: '#10b981' },
  ],
  codeLanguages: INTERSECTION_ARRAYS_CODE_LANGUAGES,
  problemHtml: INTERSECTION_ARRAYS_PROBLEM_HTML,
  analysisHtml: INTERSECTION_ARRAYS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildIntersectionSteps(
        parseNumArray(String(inputs.nums1 ?? '1, 2, 2, 1'), [1, 2, 2, 1]),
        parseNumArray(String(inputs.nums2 ?? '2, 2'), [2, 2])
      )
    ),
  renderCanvas: (container, step) => renderIntersectionCanvas(container, step as IntersectionStep),
});
