/**
 * Class 060: Code05 戳印序列 Step Compiler
 */

import { STAMPING_SEQUENCE_060_LINES } from './graph-060-stage-codes';
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
