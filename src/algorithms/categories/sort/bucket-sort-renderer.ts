/**
 * 桶排序可视化器 — 声明式 4-Card 标准架构
 * 极值范围划分、区间分桶映射、桶内单独排序、顺序归拢回填
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BUCKET_SORT_PROBLEM_HTML,
  BUCKET_SORT_ANALYSIS_HTML,
  BUCKET_SORT_CODE_LANGUAGES,
} from './bucket-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';

export interface BucketStep {
  array: (number | null)[];
  buckets: number[][];
  minVal: number;
  maxVal: number;
  bucketCount: number;
  activeBucket: number;
  activeElem: number | null;
  gatherCount: number;
  phase: 'init' | 'find-minmax' | 'scatter' | 'sort-buckets' | 'gather' | 'done';
  status: 'init' | 'find-minmax' | 'scatter' | 'sort-buckets' | 'gather' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function bucketSortSteps(input: number[], bucketCount = 5): BucketStep[] {
  const steps: BucketStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [],
      buckets: Array.from({ length: bucketCount }, () => []),
      minVal: 0,
      maxVal: 0,
      bucketCount,
      activeBucket: -1,
      activeElem: null,
      gatherCount: 0,
      phase: 'done',
      status: 'done',
      message: '数组为空，无需排序。',
      log: '空数组',
      codeLine: 2,
    });
    return steps;
  }

  const minVal = Math.min(...array);
  const maxVal = Math.max(...array);
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  steps.push({
    array: [...array],
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: 0,
    phase: 'find-minmax',
    status: 'find-minmax',
    message: `极值统计：min = ${minVal}, max = ${maxVal}。初始化 ${bucketCount} 个空桶容器。`,
    log: `极值 [${minVal}..${maxVal}], 创建 ${bucketCount} 个桶`,
    codeLine: [3, 4, 5, 6, 7],
  });

  if (minVal === maxVal) {
    steps.push({
      array: [...array],
      buckets: buckets.map((b) => [...b]),
      minVal,
      maxVal,
      bucketCount,
      activeBucket: -1,
      activeElem: null,
      gatherCount: n,
      phase: 'done',
      status: 'done',
      message: `所有元素完全相同 (${minVal})，无需额外分桶排序。`,
      log: '元素完全相同 -> 完成',
      codeLine: 5,
    });
    return steps;
  }

  // 1. Scatter 分桶
  for (let i = 0; i < n; i++) {
    const val = array[i];
    const bIdx = Math.floor(((val - minVal) * (bucketCount - 1)) / (maxVal - minVal));
    buckets[bIdx].push(val);

    steps.push({
      array: [...array],
      buckets: buckets.map((b) => [...b]),
      minVal,
      maxVal,
      bucketCount,
      activeBucket: bIdx,
      activeElem: val,
      gatherCount: 0,
      phase: 'scatter',
      status: 'scatter',
      message: `分桶映射：元素 arr[${i}] = ${val} 根据线性映射分配至桶 [${bIdx}]。`,
      log: `映射 val=${val} -> 桶 [${bIdx}]`,
      codeLine: [9, 10, 11, 12],
    });
  }

  // 2. Sort 桶内排序
  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((x, y) => x - y);
  }

  steps.push({
    array: new Array(n).fill(null),
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: 0,
    phase: 'sort-buckets',
    status: 'sort-buckets',
    message: `桶内排序：已完成各个非空桶内部的单独排序。准备开始顺序归拢回填。`,
    log: `各桶内部排序完毕`,
    codeLine: 16,
  });

  // 3. Gather 归拢回填
  const outArr: (number | null)[] = new Array(n).fill(null);
  let writeIdx = 0;

  for (let b = 0; b < bucketCount; b++) {
    for (let k = 0; k < buckets[b].length; k++) {
      const val = buckets[b][k];
      outArr[writeIdx] = val;
      writeIdx++;

      steps.push({
        array: [...outArr],
        buckets: buckets.map((bkt) => [...bkt]),
        minVal,
        maxVal,
        bucketCount,
        activeBucket: b,
        activeElem: val,
        gatherCount: writeIdx,
        phase: 'gather',
        status: 'gather',
        message: `归拢回填：从桶 [${b}] 取出已排序项 ${val}，写入主数组下标 ${writeIdx - 1}。`,
        log: `归拢: 桶 [${b}] (${val}) -> arr[${writeIdx - 1}]`,
        codeLine: [14, 15, 16, 17, 18],
      });
    }
  }

  steps.push({
    array: [...outArr],
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: n,
    phase: 'done',
    status: 'done',
    message: `🎉 桶排序完成！最终输出数组：[${outArr.join(', ')}]。`,
    log: `✓ 排序完成: [${outArr.join(', ')}]`,
    codeLine: 19,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: BucketStep[]): BucketStep[] {
  return steps.map((s) => {
    let action = 'bIdx = (val - min) * (k - 1) / (max - min)';
    if (s.phase === 'scatter') {
      action = `bIdx = (${s.activeElem} - ${s.minVal}) * ${s.bucketCount - 1} / ${s.maxVal - s.minVal} = ${s.activeBucket}`;
    } else if (s.phase === 'sort-buckets') action = 'sort(bucket[0..k-1]) 桶内排序';
    else if (s.phase === 'gather') action = `arr[${s.gatherCount - 1}] = ${s.activeElem} (来自桶 [${s.activeBucket}])`;
    else if (s.phase === 'done') action = '桶排序完成';

    return {
      ...s,
      metrics: {
        range: `[${s.minVal}, ${s.maxVal}]`,
        'bucket-count': String(s.bucketCount),
        'cur-elem': s.activeElem !== null ? `${s.activeElem}` : '—',
        'gather-count': `${s.gatherCount} / ${s.array.length}`,
        action,
      },
    };
  });
}

export function renderBucketSortCanvas(container: HTMLElement, step: BucketStep): void {
  const { array, buckets, activeBucket, gatherCount, phase } = step;

  const bucketsHtml = buckets
    .map((items, bIdx) => {
      const isActive = bIdx === activeBucket && phase !== 'done';
      const itemsHtml = items
        .map((item) => `<span style="padding: 2px 6px; border-radius: 4px; background: ${isActive ? '#eff6ff' : '#f1f5f9'}; border: 1px solid ${isActive ? '#3b82f6' : '#cbd5e1'}; color: ${isActive ? '#1d4ed8' : '#334155'}; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800;">${item}</span>`)
        .join('');

      return `
        <div style="flex: 1; min-height: 56px; border-radius: 8px; background: ${isActive ? '#eff6ff' : '#ffffff'}; border: 1.5px solid ${isActive ? '#3b82f6' : '#cbd5e1'}; display: flex; flex-direction: column; padding: 4px; gap: 4px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
          <div style="font-size: 9.5px; font-weight: 800; color: #64748b; text-align: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px;">Bucket [${bIdx}]</div>
          <div style="display: flex; flex-wrap: wrap; gap: 3px; align-items: center; justify-content: center; flex: 1;">${itemsHtml || '<span style="font-size:9px;color:#94a3b8;">(空)</span>'}</div>
        </div>
      `;
    })
    .join('');

  const mainHtml = array
    .map((val, idx) => {
      const isGathered = val !== null && (phase === 'gather' || phase === 'done');
      const isActiveElem = idx === gatherCount - 1 && phase === 'gather';

      let bg = '#ffffff';
      let border = '#cbd5e1';
      let color = '#0f172a';
      if (isActiveElem) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      } else if (isGathered) {
        bg = '#f0fdf4';
        border = '#22c55e';
        color = '#15803d';
      }

      return `
        <div style="min-width: 32px; height: 32px; padding: 0 4px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; color: ${color}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;">${val !== null ? val : '—'}</div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 16px 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">分桶容器 (值域线性映射):</div>
        <div style="display: flex; align-items: stretch; justify-content: center; gap: 8px; width: 100%;">${bucketsHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">主数组 arr (归拢回填):</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${mainHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'bucket-sort',
  name: '桶排序',
  category: 'sort',
  description: '逐步演示桶排序：区间映射分流、桶内独立排序、顺序归拢回填',
  icon: '🪣',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握分桶映射思想、数据局部有序化与归拢还原过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '29, 25, 3, 49, 9, 37, 21, 43',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '29, 25, 3, 49, 9, 37, 21, 43' } },
    { label: '均匀分布', values: { array: '10, 20, 30, 40, 50, 60, 70' } },
    { label: '聚集分布', values: { array: '1, 2, 3, 48, 49, 50, 25' } },
    { label: '含重复元素', values: { array: '5, 3, 5, 1, 3, 5' } },
  ],
  metrics: [
    { id: 'range', label: '值域范围', color: '#2563eb' },
    { id: 'bucket-count', label: '桶数量 k', color: '#0f172a' },
    { id: 'cur-elem', label: '当前元素', color: '#3b82f6' },
    { id: 'gather-count', label: '已归拢 / 总数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前分发', color: '#3b82f6' },
    { label: '已归拢回填', color: '#22c55e' },
  ],
  codeLanguages: BUCKET_SORT_CODE_LANGUAGES,
  problemHtml: BUCKET_SORT_PROBLEM_HTML,
  analysisHtml: BUCKET_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(bucketSortSteps(parseArray(String(inputs.array ?? '29, 25, 3, 49, 9, 37, 21, 43')), 5)),
  renderCanvas: (container, step) => renderBucketSortCanvas(container, step as BucketStep),
});
