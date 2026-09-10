/**
 * 一维差分数组 (1D Difference Array / 航班预订统计) - 声明式教学级沙盘渲染器
 * 核心原理：区间加法 diff[L] += val, diff[R+1] -= val，最后一次前缀和扫描还原
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_DIFF_PROBLEMS } from './array-diff-problem-content';
import { DIFF_1D_CODES, DIFF_1D_LINES } from './array-diff-stage-codes';
import { ArrayDiffStep, renderDiff1DView } from './array-diff-shared';

export interface Diff1DStep extends ArrayDiffStep {
  n: number;
  bookings: number[][];
}

export function buildDiff1DSteps(bookings: number[][], n: number): Diff1DStep[] {
  const steps: Diff1DStep[] = [];
  const lines = DIFF_1D_LINES;

  const diff = new Array(n + 2).fill(0);

  // Step 0: 入口
  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [],
    decision: `主函数入口：处理 ${bookings.length} 组区间预订增量，总位置数 n=${n}`,
    message: '利用差分数组，每次区间修改只需 O(1) 标记两端点',
    log: `enter corpFlightBookings(bookings, n=${n})`,
    codeLine: lines.entry,
    metrics: { '区间总数': `${bookings.length}`, '长度 n': `${n}` },
  });

  // Step 1: 初始化差分数组
  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [],
    decision: `分配差分数组：int[] diff = new int[${n + 2}] (1-based 下标便于处理边界)`,
    message: '初始化全为 0',
    log: 'init diff array',
    codeLine: lines.initDiff,
    metrics: { 'diff 长度': `${n + 2}` },
  });

  // Step 2: 循环处理每个区间
  for (const b of bookings) {
    const [l, r, val] = b;

    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [],
      activeRange: { l, r, val },
      decision: `处理预订区间 [${l}, ${r}]：统一增加座位数 ${val}`,
      message: `准备执行 diff[${l}] += ${val}，diff[${r + 1}] -= ${val}`,
      log: `process booking [${l}, ${r}, ${val}]`,
      codeLine: lines.updateLoop,
      metrics: { '左端点 L': `${l}`, '右端点 R': `${r}`, '增量 val': `+${val}` },
    });

    diff[l] += val;
    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [],
      activeRange: { l, r, val },
      decision: `标记左边界：diff[${l}] += ${val} ➔ diff[${l}] 变为 ${diff[l]} (表示从 ${l} 起增量生效)`,
      message: '左端点增加',
      log: `diff[${l}] += ${val} => ${diff[l]}`,
      codeLine: lines.applyAdd,
      metrics: { [`diff[${l}]`]: `${diff[l]}` },
    });

    diff[r + 1] -= val;
    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [],
      activeRange: { l, r, val },
      decision: `标记右边界：diff[${r + 1}] -= ${val} ➔ diff[${r + 1}] 变为 ${diff[r + 1]} (表示从 ${r + 1} 起增量截断抵消)`,
      message: '右端点截断',
      log: `diff[${r + 1}] -= ${val} => ${diff[r + 1]}`,
      codeLine: lines.applySub,
      metrics: { [`diff[${r + 1}]`]: `${diff[r + 1]}` },
    });
  }

  // Step 3: 前缀和还原
  const ans = new Array(n).fill(0);
  ans[0] = diff[1];

  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [...ans],
    decision: `开始前缀和还原：初始化 ans[0] = diff[1] = ${diff[1]}`,
    message: '第 1 项前缀和即为 diff[1]',
    log: 'init ans[0] = diff[1]',
    codeLine: lines.initAns,
    metrics: { 'ans[0]': `${ans[0]}` },
  });

  for (let i = 1; i < n; i++) {
    ans[i] = ans[i - 1] + diff[i + 1];
    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [...ans],
      decision: `累加前缀和：ans[${i}] = ans[${i - 1}] + diff[${i + 1}] = ${ans[i - 1]} + ${diff[i + 1]} = ${ans[i]}`,
      message: `还原出第 ${i + 1} 项真实值`,
      log: `ans[${i}] = ${ans[i]}`,
      codeLine: lines.prefixScan,
      metrics: { [`ans[${i}]`]: `${ans[i]}` },
    });
  }

  // Step 4: 返回
  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [...ans],
    decision: `🎉 前缀和扫描还原完成！最终数组 ans = [${ans.join(', ')}]`,
    message: '全流程仅需 O(n + m) 线性时间',
    log: 'done diff 1D',
    codeLine: lines.returnAns,
    metrics: { '最终结果': `[${ans.join(', ')}]` },
  });

  return steps;
}

export const diffArray1DVisualizer = registerDeclarativeAlgorithm<Diff1DStep>({
  id: 'diff-array-1d-047',
  name: '一维差分数组 (1D Difference Array)',
  category: 'array',
  icon: '🎚️',
  difficulty: 2,
  levelOrder: 471,
  learningGoal: '掌握差分与前缀和互为逆运算的数学本质，实现 O(1) 极速区间修改',
  problemHtml: ARRAY_DIFF_PROBLEMS.diff1D.html,
  analysisHtml: ARRAY_DIFF_PROBLEMS.diff1D.html,
  inputs: [
    {
      id: 'input-bookings',
      label: '预订区间与增量 (L, R, val; 分号隔开)',
      type: 'text',
      defaultValue: '1, 2, 10; 2, 3, 20; 2, 5, 25',
      placeholder: '例如 1, 2, 10; 2, 3, 20; 2, 5, 25',
    },
    {
      id: 'input-n',
      label: '总位置数 n',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 5',
    },
  ],
  codeLanguages: DIFF_1D_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-bookings'] ?? '1, 2, 10; 2, 3, 20; 2, 5, 25');
    const bookings = raw.split(';').map(item =>
      item.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    ).filter(b => b.length === 3);
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '5'), 10) || 5);
    return buildDiff1DSteps(bookings.length > 0 ? bookings : [[1, 2, 10], [2, 3, 20], [2, 5, 25]], n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: Diff1DStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 差分与前缀和双视图
    renderDiff1DView(root, step.diffArray || [], step.ansArray || [], step.activeRange);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
