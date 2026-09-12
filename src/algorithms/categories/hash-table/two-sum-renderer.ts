/**
 * 两数之和可视化器 — 声明式 4-Card 标准架构
 * LeetCode 1：哈希表一次遍历
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TWO_SUM_PROBLEM_HTML,
  TWO_SUM_ANALYSIS_HTML,
  TWO_SUM_CODE_LANGUAGES,
} from './two-sum-problem-content';

export interface TwoSumStep {
  array: number[];
  currentIndex: number;
  currentVal: number;
  complement: number;
  mapEntries: [number, number][]; // [key, value]
  matchedIndices: [number, number] | null;
  status: 'init' | 'check' | 'found' | 'insert' | 'not-found';
  result?: [number, number];
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function parseArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [2, 7, 11, 15];
}

export function buildTwoSumSteps(nums: number[], target: number): TwoSumStep[] {
  const steps: TwoSumStep[] = [];
  const map = new Map<number, number>();

  const lines = {
    init: { java: 2, cpp: 4, python: 3, javascript: 2 },
    check: { java: [3, 4], cpp: [5, 6], python: [4, 5], javascript: [3, 4] },
    found: { java: [5, 6], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    insert: { java: 8, cpp: 10, python: 8, javascript: 8 },
    notFound: { java: 10, cpp: 12, python: 9, javascript: 10 },
  };

  steps.push({
    array: [...nums],
    currentIndex: -1,
    currentVal: 0,
    complement: 0,
    mapEntries: [],
    matchedIndices: null,
    status: 'init',
    message: `初始化哈希表 Map，准备单次遍历寻找两数之和等于 target = ${target}。`,
    log: `初始化 HashMap，target = ${target}`,
    codeLine: lines.init,
  });

  for (let i = 0; i < nums.length; i++) {
    const cur = nums[i];
    const complement = target - cur;

    steps.push({
      array: [...nums],
      currentIndex: i,
      currentVal: cur,
      complement,
      mapEntries: Array.from(map.entries()),
      matchedIndices: null,
      status: 'check',
      message: `遍历到 i=${i} (nums[${i}]=${cur})，需要补数 complement = ${target} - ${cur} = ${complement}。查询哈希表中是否存在键 ${complement}。`,
      log: `i=${i}: nums[${i}]=${cur}, 查找补数 ${complement}`,
      codeLine: lines.check,
    });

    if (map.has(complement)) {
      const prevIdx = map.get(complement)!;
      steps.push({
        array: [...nums],
        currentIndex: i,
        currentVal: cur,
        complement,
        mapEntries: Array.from(map.entries()),
        matchedIndices: [prevIdx, i],
        status: 'found',
        result: [prevIdx, i],
        message: `🎉 在哈希表中找到补数 ${complement} (位于下标 ${prevIdx})！成功配对：nums[${prevIdx}] (${complement}) + nums[${i}] (${cur}) = ${target}。返回下标 [${prevIdx}, ${i}]。`,
        log: `✓ 命中！找到配对 [${prevIdx}, ${i}]`,
        codeLine: lines.found,
      });
      return steps;
    }

    map.set(cur, i);
    steps.push({
      array: [...nums],
      currentIndex: i,
      currentVal: cur,
      complement,
      mapEntries: Array.from(map.entries()),
      matchedIndices: null,
      status: 'insert',
      message: `哈希表中未找到 ${complement}，将当前键值对 (${cur} -> ${i}) 存入哈希表，继续向后扫描。`,
      log: `存入 HashMap: { ${cur} => ${i} }`,
      codeLine: lines.insert,
    });
  }

  steps.push({
    array: [...nums],
    currentIndex: nums.length,
    currentVal: 0,
    complement: 0,
    mapEntries: Array.from(map.entries()),
    matchedIndices: null,
    status: 'not-found',
    message: `遍历结束，未找到和为 ${target} 的两数对。`,
    log: `未找到有效解`,
    codeLine: lines.notFound,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: TwoSumStep[], target: number): TwoSumStep[] {
  return steps.map((s) => {
    let action = '初始化 HashMap';
    if (s.status === 'check') action = `complement = ${target} - ${s.currentVal} = ${s.complement}`;
    else if (s.status === 'found') action = `命中: ${s.complement} + ${s.currentVal} = ${target}`;
    else if (s.status === 'insert') action = `map.put(${s.currentVal}, ${s.currentIndex})`;
    else if (s.status === 'not-found') action = '遍历结束，无解';

    return {
      ...s,
      metrics: {
        i: s.currentIndex >= 0 ? String(s.currentIndex) : '—',
        'cur-val': s.currentIndex >= 0 ? String(s.currentVal) : '—',
        comp: s.currentIndex >= 0 ? String(s.complement) : '—',
        status:
          s.status === 'found' ? '✓ 命中配对！' : s.status === 'check' ? '查找中...' : s.status === 'insert' ? '存入 Map' : '等待',
        action,
      },
    };
  });
}

export function renderTwoSumCanvas(container: HTMLElement, step: TwoSumStep): void {
  const { array, currentIndex, currentVal, complement, mapEntries, matchedIndices, status } = step;

  // 1. 原数组与指针
  const cellsHtml = array
    .map((num, idx) => {
      const isCurrent = currentIndex === idx && status !== 'found';
      const isMatched = matchedIndices && (matchedIndices[0] === idx || matchedIndices[1] === idx);

      let bg = '#ffffff';
      let border = '#cbd5e1';
      let shadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
      let transform = 'none';
      let badge = '';
      if (isMatched) {
        bg = '#ecfdf5';
        border = '#10b981';
        shadow = '0 0 0 2px rgba(16, 185, 129, 0.25)';
        transform = 'scale(1.08)';
        badge =
          '<span style="background:#22c55e; color:#ffffff; font-size:8.5px; font-weight:700; padding:1px 5px; border-radius:4px; font-family:\'JetBrains Mono\', monospace;">Match</span>';
      } else if (isCurrent) {
        bg = '#eff6ff';
        border = '#2563eb';
        transform = 'scale(1.08)';
        badge =
          '<span style="background:#2563eb; color:#ffffff; font-size:8.5px; font-weight:700; padding:1px 5px; border-radius:4px; font-family:\'JetBrains Mono\', monospace;">i</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          ${badge}
          <div style="width: 38px; height: 40px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: ${shadow}; transform: ${transform};">
            <span style="font-size: 14px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${num}</span>
            <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">[${idx}]</span>
          </div>
        </div>
      `;
    })
    .join('');

  // 2. HashMap 键值对
  const mapHtml =
    mapEntries.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">(哈希表当前为空)</span>'
      : mapEntries
          .map(([key, valIdx]) => {
            const isTarget = (status === 'check' || status === 'found') && key === complement;
            const bg = isTarget ? '#ecfdf5' : '#eff6ff';
            const border = isTarget ? '#a7f3d0' : '#bfdbfe';
            return `
              <div style="padding: 3px 8px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                <span style="color: #3b82f6; font-weight: 700;">Key: ${key}</span>
                <span style="color: #94a3b8;">&rarr;</span>
                <span style="color: #059669; font-weight: 700;">Idx: ${valIdx}</span>
              </div>
            `;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">数组 nums (当前遍历 nums[${currentIndex >= 0 && currentIndex < array.length ? currentIndex : 'i'}] = ${currentIndex >= 0 && currentIndex < array.length ? currentVal : '—'})</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cellsHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">哈希映射 Map (Key: 数值 ➔ Value: 下标)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; min-height: 28px; align-items: center;">${mapHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'two-sum',
  name: '两数之和（哈希表）',
  category: 'hash-table',
  description: '哈希表一次遍历求两数之和',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '理解哈希表如何替代暴力枚举降低时间复杂度',
  inputs: [
    {
      id: 'nums',
      label: '数组',
      type: 'text',
      defaultValue: '2, 7, 11, 15',
      placeholder: '逗号分隔',
      width: '105px',
    },
    {
      id: 'target',
      label: 'target',
      type: 'number',
      defaultValue: 9,
      width: '60px',
    },
  ],
  presets: [
    { label: '示例 1: ([2,7,11,15], target=9)', values: { nums: '2, 7, 11, 15', target: 9 } },
    { label: '示例 2: ([3,2,4], target=6)', values: { nums: '3, 2, 4', target: 6 } },
    { label: '相同元素: ([3,3], target=6)', values: { nums: '3, 3', target: 6 } },
    { label: '跨度匹配: (target=12)', values: { nums: '1, 5, 8, 3, 9', target: 12 } },
  ],
  metrics: [
    { id: 'i', label: '当前下标 i', color: '#2563eb' },
    { id: 'cur-val', label: '当前数值 nums[i]', color: '#9333ea' },
    { id: 'comp', label: '寻找补数 complement', color: '#f59e0b' },
    { id: 'status', label: '匹配状态', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前元素 nums[i]', color: '#2563eb' },
    { label: '目标配对补数', color: '#10b981' },
  ],
  codeLanguages: TWO_SUM_CODE_LANGUAGES,
  problemHtml: TWO_SUM_PROBLEM_HTML,
  analysisHtml: TWO_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseArray(String(inputs.nums ?? '2, 7, 11, 15'));
    const target = parseInt(String(inputs.target ?? '9'), 10);
    return withMetrics(buildTwoSumSteps(nums, isNaN(target) ? 9 : target), isNaN(target) ? 9 : target);
  },
  renderCanvas: (container, step) => renderTwoSumCanvas(container, step as TwoSumStep),
});
