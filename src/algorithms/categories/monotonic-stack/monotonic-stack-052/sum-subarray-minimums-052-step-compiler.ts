import {
  SUM_SUBARRAY_MINIMUMS_LINES,
} from './stack-052-stage-codes';

export interface SubarrayMinContribution {
  idx: number;
  val: number;
  left: number;
  right: number;
  count: number;
  contribution: number;
}

export interface SumSubarrayMinimumsStep {
  arr: number[];
  stack: number[];
  curI: number;
  popped: number | null;
  contributions: SubarrayMinContribution[];
  currentCalc: SubarrayMinContribution | null;
  totalSum: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildSumSubarrayMinimums052Steps(arr: number[]): SumSubarrayMinimumsStep[] {
  const steps: SumSubarrayMinimumsStep[] = [];
  const lines = SUM_SUBARRAY_MINIMUMS_LINES;
  const n = arr.length;
  const MOD = 1000000007;

  if (n === 0) {
    steps.push({
      arr: [],
      stack: [],
      curI: 0,
      popped: null,
      contributions: [],
      currentCalc: null,
      totalSum: 0,
      decision: '数组为空，子数组最小值之和为 0。',
      message: '输入规模 N=0。',
      log: 'empty array',
      codeLine: lines.returnAns,
      metrics: { '规模 N': 0, '总和': 0 },
    });
    return steps;
  }

  const stack: number[] = [];
  const contributions: SubarrayMinContribution[] = [];
  let totalSum = 0;

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    stack: [],
    curI: -1,
    popped: null,
    contributions: [],
    currentCalc: null,
    totalSum: 0,
    decision: `主函数入口：开始计算数组 [${arr.join(', ')}] 的子数组最小值之和。`,
    message: '核心策略：从枚举子数组转向【贡献法】。利用单调递增栈求解每个元素辐射的最大开闭区间。',
    log: `enter sumSubarrayMins: n=${n}`,
    codeLine: lines.entry,
    metrics: { '规模 N': n, '当前累计和': 0, '已结算贡献': 0 },
  });

  for (let i = 0; i < n; i++) {
    const curVal = arr[i];

    // 循环比对
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      contributions: [...contributions],
      currentCalc: null,
      totalSum,
      decision: `遍历到下标 [${i}] (值=${curVal})：准备与栈顶比对。`,
      message: stack.length > 0
        ? `栈顶为 [${stack[stack.length - 1]}] (值=${arr[stack[stack.length - 1]]})。遇到小于等于当前值的破坏者将触发贡献结算。`
        : '栈为空，当前元素直接入栈。',
      log: `check i=${i} val=${curVal}`,
      codeLine: lines.whileCheck,
      metrics: { '考察下标': `[${i}]`, '考察值': curVal, '当前累计和': totalSum, '已结算数': contributions.length },
    });

    // 弹出结算
    while (stack.length > 0 && arr[stack[stack.length - 1]] >= curVal) {
      const cur = stack.pop()!;
      const curPopVal = arr[cur];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = i;

      const leftWays = cur - left;
      const rightWays = right - cur;
      const count = leftWays * rightWays;
      const contrib = (count * curPopVal) % MOD;
      totalSum = (totalSum + contrib) % MOD;

      const currentCalc: SubarrayMinContribution = {
        idx: cur,
        val: curPopVal,
        left,
        right,
        count,
        contribution: contrib,
      };
      contributions.push(currentCalc);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: i,
        popped: cur,
        contributions: [...contributions],
        currentCalc,
        totalSum,
        decision: `🔥 弹出 [${cur}] (值=${curPopVal}) 结算贡献！左边界 L=${left}, 右边界 R=${right}。`,
        message: `以 arr[${cur}]=${curPopVal} 为最小值的子数组共: (${cur} - ${left}) × (${right} - ${cur}) = ${leftWays} × ${rightWays} = ${count} 个！贡献 = ${count} × ${curPopVal} = ${contrib}。累加后总和 = ${totalSum}。`,
        log: `settle min idx ${cur}: ways=${count}, contrib=${contrib}, total=${totalSum}`,
        codeLine: lines.popCalc,
        metrics: { '结算基准': `[${cur}] (${curPopVal})`, '覆盖子数组数': count, '本次贡献': contrib, '当前累计总和': totalSum },
      });
    }

    // 压栈
    stack.push(i);
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      contributions: [...contributions],
      currentCalc: null,
      totalSum,
      decision: `📥 将下标 [${i}] (值=${curVal}) 压入栈顶，维持单调递增。`,
      message: `栈内下标序列: [${stack.join(', ')}]。`,
      log: `push idx ${i} to stack`,
      codeLine: lines.push,
      metrics: { '入栈下标': `[${i}]`, '栈深': stack.length, '当前累计总和': totalSum },
    });
  }

  // 清算阶段
  if (stack.length > 0) {
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: n,
      popped: null,
      contributions: [...contributions],
      currentCalc: null,
      totalSum,
      decision: '数组遍历完毕，进入清算阶段！右侧边界统一视为数组终点 R = N。',
      message: '栈中剩余元素在其右侧一直到数组末尾都是最小值。',
      log: 'enter clear stack phase',
      codeLine: lines.clearLoop,
      metrics: { '状态': '清算阶段', '剩余栈深': stack.length, '当前累计总和': totalSum },
    });

    while (stack.length > 0) {
      const cur = stack.pop()!;
      const curPopVal = arr[cur];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = n;

      const leftWays = cur - left;
      const rightWays = right - cur;
      const count = leftWays * rightWays;
      const contrib = (count * curPopVal) % MOD;
      totalSum = (totalSum + contrib) % MOD;

      const currentCalc: SubarrayMinContribution = {
        idx: cur,
        val: curPopVal,
        left,
        right,
        count,
        contribution: contrib,
      };
      contributions.push(currentCalc);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: n,
        popped: cur,
        contributions: [...contributions],
        currentCalc,
        totalSum,
        decision: `🧹 清算弹出 [${cur}] (值=${curPopVal})：左边界 L=${left}，右侧延伸至数组末端 R=${right}。`,
        message: `子数组个数 = (${cur} - ${left}) × (${right} - ${cur}) = ${leftWays} × ${rightWays} = ${count} 个！贡献 = ${count} × ${curPopVal} = ${contrib}。累计总和 = ${totalSum}。`,
        log: `clear settle min idx ${cur}: ways=${count}, contrib=${contrib}, total=${totalSum}`,
        codeLine: lines.clearCalc,
        metrics: { '清算基准': `[${cur}] (${curPopVal})`, '覆盖子数组数': count, '本次贡献': contrib, '当前累计总和': totalSum },
      });
    }
  }

  // 终结
  steps.push({
    arr: [...arr],
    stack: [],
    curI: n,
    popped: null,
    contributions: [...contributions],
    currentCalc: null,
    totalSum,
    decision: `🎉 计算完毕！所有子数组最小值之和最终为 ${totalSum} (对 10^9 + 7 取模)。`,
    message: '开闭区间规约确保所有子数组不重不漏被其唯一最小值认领，单调栈 O(N) 优雅求解！',
    log: `sumSubarrayMins complete: ans=${totalSum}`,
    codeLine: lines.returnAns,
    metrics: { '最终结果 ans': totalSum, '结算元素总数': n, '复杂度': 'O(N)' },
  });

  return steps;
}
