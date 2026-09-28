/**
 * 左程云算法通关课 Class 060: 戳印序列 (LeetCode 936 · 逆向拓扑排序)
 * 倒放电影法：最后盖印的区间必然与印章完全一致，扣成通配符 '?' 后为重叠窗口削减入度差异
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import {
  STAMPING_SEQUENCE_060_CODES,
  STAMPING_SEQUENCE_060_LINES,
} from './graph-060-stage-codes';
import { Graph060StepBase } from './graph-060-shared';

export interface StampingStep extends Graph060StepBase {
  stamp: string;
  targetChars: string[];
  inDegree: number[];
  queue: number[];
  curStart: number | null;
  path: number[];
  isSuccess: boolean;
}

function renderStampingBoard(
  stamp: string,
  targetChars: string[],
  inDegree: number[],
  curStart: number | null,
  path: number[],
  queue: number[]
): string {
  const m = stamp.length;

  const targetCells = targetChars.map((ch, idx) => {
    const isStamped = ch === '?';
    const isInCurWindow = curStart !== null && idx >= curStart && idx < curStart + m;

    const bg = isInCurWindow ? '#fef3c7' : isStamped ? '#ede9fe' : '#ffffff';
    const border = isInCurWindow ? '2px solid #f59e0b' : isStamped ? '1.5px solid #8b5cf6' : '1px solid #cbd5e1';
    const textCol = isInCurWindow ? '#b45309' : isStamped ? '#7c3aed' : '#0f172a';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 38px; height: 46px; background: ${bg}; border: ${border}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: ${textCol};">${ch}</span>
        <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
      </div>
    `;
  }).join('');

  const windowCards = inDegree.map((deg, startIdx) => {
    const isCur = curStart === startIdx;
    const isDone = deg === 0 && !queue.includes(startIdx) && path.includes(startIdx);
    const inQ = queue.includes(startIdx);

    const bg = isCur ? '#fef3c7' : isDone ? '#ecfdf5' : inQ ? '#ede9fe' : '#ffffff';
    const border = isCur ? '2px solid #f59e0b' : isDone ? '1px solid #10b981' : inQ ? '1.5px solid #8b5cf6' : '1px solid #cbd5e1';
    const textCol = isCur ? '#b45309' : isDone ? '#047857' : inQ ? '#6d28d9' : '#1e293b';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 72px; padding: 4px 6px; background: ${bg}; border: ${border}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 10px; font-weight: 700; color: ${textCol};">窗口 [${startIdx}..${startIdx + m - 1}]</span>
        <span style="font-size: 11px; font-weight: 800; color: #6366f1; font-family: monospace;">差异度: ${deg}</span>
        <span style="font-size: 8px; color: ${isDone ? '#10b981' : inQ ? '#8b5cf6' : '#94a3b8'};">${isDone ? '已盖印' : inQ ? '就绪' : '等待通配'}</span>
      </div>
    `;
  }).join('');

  const forwardPath = [...path].reverse();

  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; max-width: 520px;">
      <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px; width: 100%; justify-content: space-between; box-sizing: border-box;">
        <span>印章模板 stamp: <strong style="color: #6366f1; font-family: monospace; font-size: 13px;">"${stamp}"</strong> (长 ${m})</span>
        <span>已撤销盖印步骤: <strong style="color: #10b981;">${path.length} / ${inDegree.length}</strong></span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">目标字符串 Target 实时通配符状态 ('?' 表示已被成功擦除/覆盖):</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${targetCells}</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">滑动窗口差异入度表 inDegree[] (差异度为 0 即可逆向揭盖):</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${windowCards}</div>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; background: #ede9fe; padding: 6px 12px; border-radius: 6px; width: 100%; box-sizing: border-box;">
        <span style="font-size: 11px; font-weight: 700; color: #6d28d9;">正向盖印顺序 [Start Indices]:</span>
        <strong style="font-family: monospace; font-size: 12px; color: #4c1d95;">[ ${forwardPath.join(', ') || '推导中...'} ]</strong>
      </div>
    </div>
  `;
}

export function buildStampingSequence060Steps(preset: string = 'classic_ababc'): StampingStep[] {
  const steps: StampingStep[] = [];
  const linesCode = STAMPING_SEQUENCE_060_LINES;

  let stamp = 'abc';
  let target = 'ababc';

  if (preset === 'nested_aabc') {
    stamp = 'abca';
    target = 'aabcaca';
  }

  const m = stamp.length;
  const n = target.length;
  const maxStarts = n - m + 1;
  const inDegree = new Array(maxStarts).fill(m);
  const graph: Array<Array<number>> = Array.from({ length: n }, () => []);
  const targetChars = target.split('');
  const queue: number[] = [];

  // 1. 初始化滑动窗口依赖
  for (let i = 0; i < maxStarts; i++) {
    for (let j = 0; j < m; j++) {
      if (targetChars[i + j] === stamp[j]) {
        inDegree[i]--;
      } else {
        graph[i + j].push(i);
      }
    }
    if (inDegree[i] === 0) queue.push(i);
  }

  steps.push({
    stamp,
    targetChars: [...targetChars],
    inDegree: [...inDegree],
    queue: [...queue],
    curStart: null,
    path: [],
    isSuccess: false,
    decision: `1. 初始化逆向拓扑模型：计算 ${maxStarts} 个滑动窗口与印章 "${stamp}" 的差异度`,
    message: `逆向思想：任何与印章完全相符的窗口（inDegree = 0）都可以作为“最后一步”完成盖印。`,
    log: `Init stamping sequence: stamp="${stamp}", target="${target}"`,
    codeLine: linesCode.init,
    metrics: { '印章长度': m, '目标长度': n, '窗口总数': maxStarts },
    statusBadge: { text: '模型构建', type: 'info' },
  });

  steps.push({
    stamp,
    targetChars: [...targetChars],
    inDegree: [...inDegree],
    queue: [...queue],
    curStart: null,
    path: [],
    isSuccess: false,
    decision: `寻找完美匹配的终局窗口：窗口 [${queue.join(', ')}] 与印章 100% 契合 (差异度 = 0)，入队`,
    message: `这些位置必然是某次最终盖印留下的完整痕迹，可率先逆向“揭盖”。`,
    log: `Zero-degree windows queued: [${queue.join(', ')}]`,
    codeLine: linesCode.matchWindow,
    metrics: { '就绪窗口': queue.length, '就绪列表': queue.join(', ') },
    statusBadge: { text: '发现终局盖印', type: 'info' },
  });

  const visited = new Array(n).fill(false);
  const path: number[] = [];

  // 2. 拓扑逆向扩散
  while (queue.length > 0) {
    const start = queue.shift()!;
    path.push(start);

    steps.push({
      stamp,
      targetChars: [...targetChars],
      inDegree: [...inDegree],
      queue: [...queue],
      curStart: start,
      path: [...path],
      isSuccess: false,
      decision: `逆向揭开窗口 [${start}..${start + m - 1}]：将其覆盖字符转为通配符 '?'`,
      message: `该窗口内的字符是由此次盖印产生的，被揭开后可视为任意通配符，能降低重叠窗口的差异度！`,
      log: `Poll window start=${start}`,
      codeLine: linesCode.pollWindow,
      metrics: { '当前揭开窗口': `[${start}..${start + m - 1}]`, '已逆推步数': path.length },
      statusBadge: { text: `揭开: 窗口 ${start}`, type: 'warning' },
    });

    for (let i = 0; i < m; i++) {
      const idx = start + i;
      if (!visited[idx]) {
        visited[idx] = true;
        targetChars[idx] = '?';

        for (const neighbor of graph[idx]) {
          inDegree[neighbor]--;
          if (inDegree[neighbor] === 0) {
            queue.push(neighbor);
          }
        }
      }
    }

    steps.push({
      stamp,
      targetChars: [...targetChars],
      inDegree: [...inDegree],
      queue: [...queue],
      curStart: start,
      path: [...path],
      isSuccess: false,
      decision: `通配符扩散完成：重叠窗口由于获得 '?' 差异度进一步削减${queue.length > 0 ? `，新窗口 [${queue.join(', ')}] 差异归零入队！` : ''}`,
      message: `目标串当前状态已变为 "${targetChars.join('')}"。`,
      log: `Propagate wildcards from window ${start}`,
      codeLine: linesCode.wildcardPropagate,
      metrics: { '通配符数量': targetChars.filter((c) => c === '?').length, '新就绪窗口': queue.length },
      statusBadge: { text: '依赖削减', type: 'info' },
    });
  }

  // 3. 终态
  const isSuccess = path.length === maxStarts;
  const forwardPath = [...path].reverse();

  steps.push({
    stamp,
    targetChars: [...targetChars],
    inDegree: [...inDegree],
    queue: [],
    curStart: null,
    path: [...path],
    isSuccess,
    decision: isSuccess
      ? `逆向拓扑还原成功！全部 ${maxStarts} 个窗口均被成功解构，正向盖印序列为 [${forwardPath.join(', ')}]`
      : `无法完全盖出目标串：存在不可逆向匹配的字符孤岛，返回空数组 []`,
    message: isSuccess
      ? `将逆向揭盖的顺序反转，即可得到合法的正向盖印步骤序列。`
      : `无法实现 100% 覆盖。`,
    log: `Stamping finished, success=${isSuccess}, ans=[${forwardPath.join(', ')}]`,
    codeLine: linesCode.returnPath,
    metrics: { '正向盖印序列': `[${forwardPath.join(', ')}]`, '执行总步数': forwardPath.length, '判定': isSuccess ? '成功' : '失败' },
    statusBadge: { text: isSuccess ? '盖印还原成功' : '无法还原', type: isSuccess ? 'success' : 'danger' },
  });

  return steps;
}

export const stampingSequence060Visualizer = registerDeclarativeAlgorithm<StampingStep>({
  id: 'stamping-sequence-060',
  aliases: ['stamping-sequence', 'moves-to-stamp', 'leetcode-936', 'class060-code05'],
  name: '戳印序列 (LeetCode 936 · 逆向拓扑排序) (Class 060)',
  category: 'graph',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 6005,
  learningGoal: '掌握逆向思维倒放电影建模、通配符扩散机制与滑动窗口入度削减拓扑驱动',
  problemHtml: GRAPH_060_PROBLEMS.stampingSequence060.html,
  codeLanguages: STAMPING_SEQUENCE_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '目标串用例选择',
      type: 'select',
      defaultValue: 'classic_ababc',
      options: [
        { label: 'stamp="abc", target="ababc" (经典双盖印)', value: 'classic_ababc' },
        { label: 'stamp="abca", target="aabcaca" (三重嵌套重叠)', value: 'nested_aabc' },
      ],
    },
  ],
  presets: [
    { label: '经典双盖印', values: { preset: 'classic_ababc' } },
    { label: '三重嵌套重叠', values: { preset: 'nested_aabc' } },
  ],
  generateSteps: (inputs) => buildStampingSequence060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        ${renderStampingBoard(step.stamp, step.targetChars, step.inDegree, step.curStart, step.path, step.queue)}
      </div>
    `;
  },
});
