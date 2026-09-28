/**
 * 左程云算法通关课 Class 063: 最接近目标值的子序列和 (LeetCode 1755 · Closest Subsequence Sum)
 * 折半搜索 (Meet in the Middle) + 双指针相向逼近
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import {
  CLOSEST_SUBSEQUENCE_SUM_063_CODES,
  CLOSEST_SUBSEQUENCE_SUM_063_LINES,
} from './graph-063-stage-codes';
import { Graph063StepBase, renderMeetInTheMiddleArrayView } from './graph-063-shared';

export interface ClosestSumStep extends Graph063StepBase {
  lsum: number[];
  rsum: number[];
  leftPtr?: number;
  rightPtr?: number;
  curLeftVal?: number;
  curRightVal?: number;
  curSum?: number;
  goal: number;
  bestDiff: number;
  status: 'init' | 'dfs_gen' | 'sort_both' | 'two_pointers' | 'done';
}

export function buildClosestSubsequenceSum063Steps(preset: string = 'leetcode_example_1'): ClosestSumStep[] {
  const steps: ClosestSumStep[] = [];
  const lines = CLOSEST_SUBSEQUENCE_SUM_063_LINES;

  let nums = [5, -7, 3, 5];
  let goal = 6;

  if (preset === 'leetcode_example_2') {
    nums = [7, -9, 15, -2];
    goal = -5;
  } else if (preset === 'positive_only') {
    nums = [1, 2, 4, 8];
    goal = 11;
  }

  const n = nums.length;
  const mid = n >> 1;

  // Step 0: 入口帧
  steps.push({
    lsum: [],
    rsum: [],
    goal,
    bestDiff: Math.abs(goal),
    status: 'init',
    line: lines.entry.java,
    message: `🚀 算法初始化：最接近目标值的子序列和。输入数组=[${nums.join(', ')}], 目标值 goal=${goal}。初始选空序列差值=|0 - (${goal})|=${Math.abs(goal)}。`,
    metrics: { '目标值': goal, '数组长度': n, '当前最小差': Math.abs(goal) },
  });

  // 折半生成 lsum
  const lsum: number[] = [];
  function dfsLeft(i: number, end: number, sum: number) {
    if (i === end) {
      lsum.push(sum);
      return;
    }
    dfsLeft(i + 1, end, sum);
    dfsLeft(i + 1, end, sum + nums[i]);
  }
  dfsLeft(0, mid, 0);

  // 折半生成 rsum
  const rsum: number[] = [];
  function dfsRight(i: number, end: number, sum: number) {
    if (i === end) {
      rsum.push(sum);
      return;
    }
    dfsRight(i + 1, end, sum);
    dfsRight(i + 1, end, sum + nums[i]);
  }
  dfsRight(mid, n, 0);

  steps.push({
    lsum: [...lsum],
    rsum: [...rsum],
    goal,
    bestDiff: Math.abs(goal),
    status: 'dfs_gen',
    line: lines.dfsGen.java,
    message: `📦 双向折半子序列和生成完毕：左侧生成 ${lsum.length} 个和，右侧生成 ${rsum.length} 个和。`,
    metrics: { 'lsum项数': lsum.length, 'rsum项数': rsum.length, '目标值': goal },
  });

  // 左右两侧升序排序
  lsum.sort((a, b) => a - b);
  rsum.sort((a, b) => a - b);

  steps.push({
    lsum: [...lsum],
    rsum: [...rsum],
    goal,
    bestDiff: Math.abs(goal),
    status: 'sort_both',
    line: lines.sortBoth.java,
    message: `📶 双侧集合均已升序排序：lsum=[${lsum.join(', ')}]，rsum=[${rsum.join(', ')}]。准备启动双指针相向逼近。`,
    metrics: { '排序状态': '左右双向升序', '目标值': goal, '当前最小差': Math.abs(goal) },
  });

  // 双指针扫描
  let i = 0;
  let j = rsum.length - 1;
  let ans = Math.abs(goal);

  steps.push({
    lsum: [...lsum],
    rsum: [...rsum],
    leftPtr: i,
    rightPtr: j,
    curLeftVal: lsum[i],
    curRightVal: rsum[j],
    goal,
    bestDiff: ans,
    status: 'two_pointers',
    line: lines.twoPtrInit.java,
    message: `🎯 双指针就绪：左指针 i=0 指向 lsum 最小值 ${lsum[0]}，右指针 j=${j} 指向 rsum 最大值 ${rsum[j]}。`,
    metrics: { '左指针 i': i, '右指针 j': j, '目标值': goal, '当前最小差': ans },
  });

  while (i < lsum.length && j >= 0) {
    const cur = lsum[i] + rsum[j];
    const diff = Math.abs(cur - goal);

    if (diff < ans) {
      ans = diff;
      steps.push({
        lsum: [...lsum],
        rsum: [...rsum],
        leftPtr: i,
        rightPtr: j,
        curLeftVal: lsum[i],
        curRightVal: rsum[j],
        curSum: cur,
        goal,
        bestDiff: ans,
        status: 'two_pointers',
        line: lines.updateAns.java,
        message: `✨ 刷新全局最优差值！lsum[${i}](${lsum[i]}) + rsum[${j}](${rsum[j]}) = ${cur}，与目标 ${goal} 的绝对差缩小为 ${diff}！`,
        metrics: { '当前和': cur, '目标值': goal, '刷新最小差': ans },
      });
    }

    if (cur > goal) {
      steps.push({
        lsum: [...lsum],
        rsum: [...rsum],
        leftPtr: i,
        rightPtr: j,
        curLeftVal: lsum[i],
        curRightVal: rsum[j],
        curSum: cur,
        goal,
        bestDiff: ans,
        status: 'two_pointers',
        line: lines.moveRight.java,
        message: `⬇️ 当前组合和 ${cur} > 目标 ${goal}，数值过大，右指针左移 j-- (${j} -> ${j - 1}) 以尝试更小的累加和。`,
        metrics: { '当前和': cur, '方向': 'j 左移变小', '当前最小差': ans },
      });
      j--;
    } else if (cur < goal) {
      steps.push({
        lsum: [...lsum],
        rsum: [...rsum],
        leftPtr: i,
        rightPtr: j,
        curLeftVal: lsum[i],
        curRightVal: rsum[j],
        curSum: cur,
        goal,
        bestDiff: ans,
        status: 'two_pointers',
        line: lines.moveLeft.java,
        message: `⬆️ 当前组合和 ${cur} < 目标 ${goal}，数值偏小，左指针右移 i++ (${i} -> ${i + 1}) 以尝试更大的累加和。`,
        metrics: { '当前和': cur, '方向': 'i 右移变大', '当前最小差': ans },
      });
      i++;
    } else {
      // 差值为 0，完美命中
      steps.push({
        lsum: [...lsum],
        rsum: [...rsum],
        leftPtr: i,
        rightPtr: j,
        curLeftVal: lsum[i],
        curRightVal: rsum[j],
        curSum: cur,
        goal,
        bestDiff: 0,
        status: 'done',
        line: lines.returnAns.java,
        message: `🎉 完美命中目标！lsum[${i}](${lsum[i]}) + rsum[${j}](${rsum[j]}) = ${goal}，绝对差直接降至 0，提前终止！`,
        metrics: { '当前和': cur, '完美命中': '绝对差 0', '状态': '最优命中' },
      });
      return steps;
    }
  }

  steps.push({
    lsum: [...lsum],
    rsum: [...rsum],
    goal,
    bestDiff: ans,
    status: 'done',
    line: lines.returnAns.java,
    message: `🏁 双指针扫描越界结束，全局最接近目标值 ${goal} 的子序列和绝对差为 ${ans}！`,
    metrics: { '最终最小差': ans, '目标值': goal, '状态': '求解完毕' },
  });

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'closest-subsequence-sum-063',
  name: '最接近目标值的子序列和 (折半搜索)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 063 Code03：折半搜索 Meet in the Middle + 双指针相向逼近，时间复杂度 O(2^(N/2) * log(2^(N/2))) (LeetCode 1755)',
  aliases: ['class063-code03', 'closest-subsequence-sum-063', 'closest-subsequence-sum', 'min-abs-subsequence-sum-1755', 'leetcode-1755'],
  problemHtml: GRAPH_063_PROBLEMS['closest-subsequence-sum-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['closest-subsequence-sum-063'].complexityHtml,
  codeLanguages: CLOSEST_SUBSEQUENCE_SUM_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'leetcode_example_1',
      options: [
        { label: '例题一 ([5, -7, 3, 5], 目标 6)', value: 'leetcode_example_1' },
        { label: '例题二 ([7, -9, 15, -2], 目标 -5)', value: 'leetcode_example_2' },
        { label: '全正数用例 ([1, 2, 4, 8], 目标 11)', value: 'positive_only' },
      ],
    },
  ],
  presets: [
    { label: '例题一 ([5, -7, 3, 5], 目标 6)', values: { preset: 'leetcode_example_1' } },
    { label: '例题二 ([7, -9, 15, -2], 目标 -5)', values: { preset: 'leetcode_example_2' } },
    { label: '全正数用例 ([1, 2, 4, 8], 目标 11)', values: { preset: 'positive_only' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildClosestSubsequenceSum063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: ClosestSumStep) => {
    container.innerHTML = renderMeetInTheMiddleArrayView({
      lsum: step.lsum,
      rsum: step.rsum,
      activeLeftIdx: step.leftPtr,
      activeRightIdx: step.rightPtr,
      curLeftVal: step.curLeftVal,
      curRightVal: step.curRightVal,
      targetOrGoal: step.goal,
      currentAns: `最小差 = ${step.bestDiff}${step.curSum !== undefined ? ` (当前和 ${step.curSum})` : ''}`,
      modeTitle: '最接近目标值子序列和 · 双指针相向逼近沙盘',
    });
  },
});
