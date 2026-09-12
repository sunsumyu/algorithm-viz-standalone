/**
 * 划分字母区间可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 763：记录每个字符最后出现下标，遍历维护最远边界，达到边界即贪心切割
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  PARTITION_LABELS_PROBLEM_HTML,
  PARTITION_LABELS_ANALYSIS_HTML,
  PARTITION_LABELS_CODE_LANGUAGES,
} from './partition-labels-problem-content';

export interface PartitionStep {
  str: string;
  currentIndex: number;
  currentChar: string;
  lastOccurrence: Record<string, number>;
  currentEnd: number;
  partitionStart: number;
  partitions: number[];
  cutIndices: number[];
  action: 'init' | 'scan' | 'cut' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export function buildPartitionLabelsSteps(s: string): PartitionStep[] {
  const steps: PartitionStep[] = [];
  const n = s.length;

  if (n === 0) {
    steps.push({
      str: '',
      currentIndex: -1,
      currentChar: '',
      lastOccurrence: {},
      currentEnd: 0,
      partitionStart: 0,
      partitions: [],
      cutIndices: [],
      action: 'done',
      message: '字符串为空，划分片段数为 0',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 统计每个字符最后出现的位置
  const lastOccurrence: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    lastOccurrence[s[i]] = i;
  }

  steps.push({
    str: s,
    currentIndex: -1,
    currentChar: '',
    lastOccurrence: { ...lastOccurrence },
    currentEnd: 0,
    partitionStart: 0,
    partitions: [],
    cutIndices: [],
    action: 'init',
    message: `第 1 步：统计所有 ${Object.keys(lastOccurrence).length} 种不同字符的最后出现下标`,
    codeLine: 7,
  });

  let start = 0;
  let end = 0;
  const partitions: number[] = [];
  const cutIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    const char = s[i];
    const lastPos = lastOccurrence[char];
    const oldEnd = end;
    end = Math.max(end, lastPos);

    steps.push({
      str: s,
      currentIndex: i,
      currentChar: char,
      lastOccurrence: { ...lastOccurrence },
      currentEnd: end,
      partitionStart: start,
      partitions: [...partitions],
      cutIndices: [...cutIndices],
      action: 'scan',
      message: `🔍 扫描 s[${i}]='${char}' (最后出现在 [${lastPos}])，当前片段边界更新为 max(${oldEnd}, ${lastPos}) = ${end}`,
      codeLine: 12,
    });

    if (i === end) {
      const len = end - start + 1;
      partitions.push(len);
      cutIndices.push(i);

      steps.push({
        str: s,
        currentIndex: i,
        currentChar: char,
        lastOccurrence: { ...lastOccurrence },
        currentEnd: end,
        partitionStart: start,
        partitions: [...partitions],
        cutIndices: [...cutIndices],
        action: 'cut',
        message: `✂️ 触碰最远边界 [${i}]！片段 "${s.substring(start, end + 1)}" 内字符后续不再出现，切分出长度为 ${len} 的片段！`,
        codeLine: 14,
      });

      start = i + 1;
    }
  }

  steps.push({
    str: s,
    currentIndex: n - 1,
    currentChar: '',
    lastOccurrence: { ...lastOccurrence },
    currentEnd: n - 1,
    partitionStart: start,
    partitions: [...partitions],
    cutIndices: [...cutIndices],
    action: 'done',
    message: `🎉 字符串划分完成！共划分为 ${partitions.length} 个片段：[${partitions.join(', ')}]`,
    codeLine: 18,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: PartitionStep[]): PartitionStep[] {
  return steps.map((s) => {
    const isCut = s.action === 'cut';

    let action = '🔍 扫描扩展右边界';
    if (isCut) action = '✂️ 触碰右界 (即刻切割)';
    else if (s.action === 'done') action = '🏁 全部切分完成';
    else if (s.action === 'init') action = '初始化';

    const char = s.currentChar;
    const last = char ? s.lastOccurrence[char] : -1;

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-char': char ? `'${char}'` : '—',
        'last-pos': char ? `[${last >= 0 ? last : '-'}]` : '—',
        'cur-partition': `[${s.partitionStart} .. ${s.currentEnd}]`,
        'partition-count': `${s.partitions.length} 个`,
        'partition-list': s.partitions.length ? `[${s.partitions.join(', ')}]` : '—',
        action,
      },
    };
  });
}

export function renderPartitionLabelsCanvas(container: HTMLElement, step: PartitionStep): void {
  const s = step.str;
  const n = s.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">字符串为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const cellsHtml = s
    .split('')
    .map((char, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isEnd = idx === step.currentEnd;
      const isCut = step.cutIndices.includes(idx);
      const isWithinCurrentPartition = idx >= step.partitionStart && idx <= step.currentEnd;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eef2ff';
        borderColor = '#4f46e5';
        textColor = '#4f46e5';
      } else if (isEnd) {
        bg = '#fef3c7';
        borderColor = '#f59e0b';
        textColor = '#b45309';
      } else if (isWithinCurrentPartition) {
        bg = '#f8fafc';
        borderColor = '#c7d2fe';
        textColor = '#4338ca';
      }

      return `
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <span style="font-size: 8.5px; color: ${isCurrent ? '#4f46e5' : isEnd ? '#b45309' : '#94a3b8'}; font-weight: 700;">
              ${isCurrent ? '📍' : isEnd ? '🏁' : `[${idx}]`}
            </span>
            <div style="width: 32px; height: 36px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              ${char}
            </div>
          </div>
          ${isCut ? `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 36px; color: #10b981; font-weight: 800; font-size: 13px;">✂️</div>` : ''}
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 边界信息 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>📍 当前扫描: [${curIdx}]='${step.currentChar || '-'}'</span>
        <span>当前最远边界: <strong style="color: #b45309; font-family: monospace;">[${step.currentEnd}]</strong></span>
      </div>

      <!-- 字符流水平条 -->
      <div style="display: flex; gap: 4px; overflow-x: auto; align-items: center; padding: 6px 0;">
        ${cellsHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'partition-labels',
  name: '划分字母区间',
  category: 'greedy',
  description: '统计各字符最后出现位置，贪心更新最远覆盖边界，到达边界即刻切割',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握字符区间最远右边界贪心切分模型，熟练运用贪心寻找自然边界',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'ababcbacadefegdehijhklij',
      placeholder: '小写字母字符串',
    },
  ],
  presets: [
    { label: '基础示例', values: { s: 'ababcbacadefegdehijhklij' } },
    { label: '全部相同', values: { s: 'aaaa' } },
    { label: '两段划分', values: { s: 'eccbbbbdec' } },
    { label: '单字符流', values: { s: 'abcabcabc' } },
  ],
  metrics: [
    { id: 'cur-char', label: '当前字符', color: '#4f46e5' },
    { id: 'last-pos', label: '最后出现位置', color: '#b45309' },
    { id: 'cur-partition', label: '当前片段边界', color: '#f59e0b' },
    { id: 'partition-count', label: '片段数', color: '#10b981' },
    { id: 'action', label: '贪心动作', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前扫描', color: '#4f46e5' },
    { label: '🏁 当前片段右界', color: '#f59e0b' },
    { label: '✂️ 切割点', color: '#10b981' },
  ],
  codeLanguages: PARTITION_LABELS_CODE_LANGUAGES,
  problemHtml: PARTITION_LABELS_PROBLEM_HTML,
  analysisHtml: PARTITION_LABELS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildPartitionLabelsSteps(String(inputs.s ?? 'ababcbacadefegdehijhklij'))),
  renderCanvas: (container, step) => renderPartitionLabelsCanvas(container, step as PartitionStep),
});
