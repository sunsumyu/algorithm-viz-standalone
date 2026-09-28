/**
 * 左程云算法通关课 Class 063: 牛牛的背包问题 / 世界冰球锦标赛 (洛谷 P4799 · Snacks Ways / Buy Tickets)
 * 折半搜索 (Meet in the Middle) + 二分查找计数
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import {
  SNACKS_WAYS_063_CODES,
  SNACKS_WAYS_063_LINES,
} from './graph-063-stage-codes';
import { Graph063StepBase, renderMeetInTheMiddleArrayView } from './graph-063-shared';

export interface SnacksWaysStep extends Graph063StepBase {
  lsum: number[];
  rsum: number[];
  activeLeftIdx?: number;
  activeRightIdx?: number;
  curLeftVal?: number;
  curRightVal?: number;
  capacity: number;
  totalWays: number;
  status: 'init' | 'dfs_left' | 'dfs_right' | 'sort_right' | 'query' | 'done';
}

export function buildSnacksWays063Steps(preset: string = 'standard_3_snacks'): SnacksWaysStep[] {
  const steps: SnacksWaysStep[] = [];
  const lines = SNACKS_WAYS_063_LINES;

  let v = [1, 2, 4];
  let w = 10;

  if (preset === 'medium_6_snacks') {
    v = [2, 4, 3, 5, 8, 1];
    w = 12;
  } else if (preset === 'tight_capacity') {
    v = [3, 4, 2, 5];
    w = 5;
  }

  const n = v.length;
  const mid = n >> 1;

  // Step 0: 入口帧
  steps.push({
    lsum: [],
    rsum: [],
    capacity: w,
    totalWays: 0,
    status: 'init',
    line: lines.entry.java,
    message: `🚀 算法初始化：开始牛牛的背包问题。零食数量 n=${n}, 背包容量 w=${w}, 每袋体积=[${v.join(', ')}]。`,
    metrics: { '零食袋数': n, '背包容量': w, '已求方案数': 0 },
  });

  // 折半切分
  steps.push({
    lsum: [],
    rsum: [],
    capacity: w,
    totalWays: 0,
    status: 'init',
    line: lines.divide.java,
    message: `✂️ 执行折半拆分：前半部分处理 [0..${mid - 1}]（共 ${mid} 个数），后半部分处理 [${mid}..${n - 1}]（共 ${n - mid} 个数）。`,
    metrics: { '左半区间': `[0..${mid - 1}]`, '右半区间': `[${mid}..${n - 1}]`, '容量': w },
  });

  // DFS 收集左侧和
  const lsum: number[] = [];
  function dfsLeft(i: number, end: number, sum: number) {
    if (sum > w) return;
    if (i === end) {
      lsum.push(sum);
      return;
    }
    dfsLeft(i + 1, end, sum);
    dfsLeft(i + 1, end, sum + v[i]);
  }
  dfsLeft(0, mid, 0);

  steps.push({
    lsum: [...lsum],
    rsum: [],
    capacity: w,
    totalWays: 0,
    status: 'dfs_left',
    line: lines.dfsLeft.java,
    message: `📦 左半部递归收集完毕：共生成 ${lsum.length} 种子序列和，lsum=[${lsum.join(', ')}]。`,
    metrics: { 'lsum项数': lsum.length, '最大左侧和': Math.max(...lsum), '容量': w },
  });

  // DFS 收集右侧和
  const rsum: number[] = [];
  function dfsRight(i: number, end: number, sum: number) {
    if (sum > w) return;
    if (i === end) {
      rsum.push(sum);
      return;
    }
    dfsRight(i + 1, end, sum);
    dfsRight(i + 1, end, sum + v[i]);
  }
  dfsRight(mid, n, 0);

  steps.push({
    lsum: [...lsum],
    rsum: [...rsum],
    capacity: w,
    totalWays: 0,
    status: 'dfs_right',
    line: lines.dfsRight.java,
    message: `📦 右半部递归收集完毕：共生成 ${rsum.length} 种子序列和，未排序 rsum=[${rsum.join(', ')}]。`,
    metrics: { 'lsum项数': lsum.length, 'rsum项数': rsum.length, '容量': w },
  });

  // 对 rsum 排序
  rsum.sort((a, b) => a - b);
  steps.push({
    lsum: [...lsum],
    rsum: [...rsum],
    capacity: w,
    totalWays: 0,
    status: 'sort_right',
    line: lines.sortRight.java,
    message: `📶 右侧集合升序排序就绪：rsum=[${rsum.join(', ')}]，为后续 $O(\\log K)$ 二分查找铺平道路。`,
    metrics: { 'rsum有序性': '升序排列', 'rsum最小': rsum[0], 'rsum最大': rsum[rsum.length - 1] },
  });

  // 二分统计累加方案
  let totalAns = 0;
  for (let i = 0; i < lsum.length; i++) {
    const curLeft = lsum[i];
    const maxAllowedRight = w - curLeft;

    // 二分查找 <= maxAllowedRight 的数量
    let l = 0, r = rsum.length - 1, count = 0;
    let matchIdx = -1;
    while (l <= r) {
      const m = (l + r) >> 1;
      if (rsum[m] <= maxAllowedRight) {
        count = m + 1;
        matchIdx = m;
        l = m + 1;
      } else {
        r = m - 1;
      }
    }

    totalAns += count;

    steps.push({
      lsum: [...lsum],
      rsum: [...rsum],
      activeLeftIdx: i,
      activeRightIdx: matchIdx >= 0 ? matchIdx : undefined,
      curLeftVal: curLeft,
      curRightVal: matchIdx >= 0 ? rsum[matchIdx] : undefined,
      capacity: w,
      totalWays: totalAns,
      status: 'query',
      line: lines.bisect.java,
      message: `🔎 匹配第 ${i + 1}/${lsum.length} 个左侧和：lsum[${i}]=${curLeft}。右侧允许最大值 = w - ${curLeft} = ${maxAllowedRight}。二分求得 rsum 中 <= ${maxAllowedRight} 的项数共 ${count} 个，累计方案增至 ${totalAns}！`,
      metrics: { '当前左和': curLeft, '右允许上限': maxAllowedRight, '本次新增方案': count, '累计总方案': totalAns },
    });
  }

  // 最终完成
  steps.push({
    lsum: [...lsum],
    rsum: [...rsum],
    capacity: w,
    totalWays: totalAns,
    status: 'done',
    line: lines.returnAns.java,
    message: `🎉 折半搜索统计圆满完成！在背包容量不超过 ${w} 时，一共有 ${totalAns} 种合法的零食放法！`,
    metrics: { '最终放法总数': totalAns, '容量': w, '状态': '求解完毕' },
  });

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'snacks-ways-buy-tickets-063',
  name: '牛牛的背包问题 (折半搜索)',
  category: 'graph',
  difficulty: '中等',
  description: '左程云 Class 063 Code02：超大背包容量折半搜索 Meet in the Middle，两路生成 + 二分累计 (洛谷 P4799)',
  aliases: ['class063-code02', 'snacks-ways-buy-tickets-063', 'snacks-ways-063', 'luogu-p4799', 'meet-in-the-middle-backpack'],
  problemHtml: GRAPH_063_PROBLEMS['snacks-ways-buy-tickets-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['snacks-ways-buy-tickets-063'].complexityHtml,
  codeLanguages: SNACKS_WAYS_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'standard_3_snacks',
      options: [
        { label: '标准用例 (3袋零食, 容量10)', value: 'standard_3_snacks' },
        { label: '进阶用例 (6袋零食, 容量12)', value: 'medium_6_snacks' },
        { label: '紧缩容量 (4袋零食, 容量5)', value: 'tight_capacity' },
      ],
    },
  ],
  presets: [
    { label: '标准用例 (3袋零食, 容量10)', values: { preset: 'standard_3_snacks' } },
    { label: '进阶用例 (6袋零食, 容量12)', values: { preset: 'medium_6_snacks' } },
    { label: '紧缩容量 (4袋零食, 容量5)', values: { preset: 'tight_capacity' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildSnacksWays063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: SnacksWaysStep) => {
    container.innerHTML = renderMeetInTheMiddleArrayView({
      lsum: step.lsum,
      rsum: step.rsum,
      activeLeftIdx: step.activeLeftIdx,
      activeRightIdx: step.activeRightIdx,
      curLeftVal: step.curLeftVal,
      curRightVal: step.curRightVal,
      targetOrGoal: step.capacity,
      currentAns: step.totalWays,
      modeTitle: '牛牛的背包问题 · 折半二分计数沙盘',
    });
  },
});
