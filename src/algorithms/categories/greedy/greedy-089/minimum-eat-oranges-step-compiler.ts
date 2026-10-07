import {
  EAT_ORANGES_STAGE1_LINES,
  EAT_ORANGES_STAGE2_LINES,
  EAT_ORANGES_STAGE3_LINES,
} from './greedy-089-stage-codes';
import { Greedy089Step, GreedyTreeNode } from './greedy-089-shared';

export interface EatOrangesStep extends Greedy089Step {
  n: number;
  memoTable?: Array<{ n: number; days: number }>;
  treeRoot?: GreedyTreeNode;
  activeNodeId?: string;
  finalAns?: number;
}

export function buildEatOrangesStage1Steps(targetN: number): EatOrangesStep[] {
  const steps: EatOrangesStep[] = [];
  const lines = EAT_ORANGES_STAGE1_LINES;

  const rootNode: GreedyTreeNode = {
    id: `node-${targetN}`,
    name: `f(${targetN})`,
    val: `?`,
    children: [],
  };

  steps.push({
    n: targetN,
    decision: `主函数入口：开始求解吃完 n=${targetN} 个橘子的最少天数`,
    message: '阶段 1 纯暴力尝试：包含每天只吃 1 个的冗余分支，展示指数级爆炸',
    log: `enter minDaysBrute(n=${targetN})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
    treeRoot: JSON.parse(JSON.stringify(rootNode)),
    activeNodeId: rootNode.id,
  });

  let nodeCounter = 0;
  function dfsBrute(n: number, parentNode: GreedyTreeNode): number {
    if (steps.length > 250) return n;

    if (n <= 1) {
      parentNode.val = `${n}`;
      steps.push({
        n,
        decision: `基底出口：剩余 n=${n} 个橘子，只需 ${n} 天即可吃完，return ${n}`,
        message: '触发边界特判',
        log: `base return ${n}`,
        codeLine: lines.guard,
        line: lines.guard?.java ?? 2,
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: parentNode.id,
      });
      return n;
    }

    const childSub1: GreedyTreeNode = {
      id: `node-sub-${++nodeCounter}`,
      name: `f(${n - 1})`,
      val: `?`,
      edgeLabel: '-1',
      children: [],
    };
    parentNode.children = parentNode.children || [];
    parentNode.children.push(childSub1);

    steps.push({
      n,
      decision: `尝试分支 1：吃 1 个，转移至 f(${n - 1})`,
      message: '花费 1 天吃掉 1 个橘子',
      log: `branch -1 from ${n}`,
      codeLine: lines.subOne,
      line: lines.subOne?.java ?? 3,
      treeRoot: JSON.parse(JSON.stringify(rootNode)),
      activeNodeId: childSub1.id,
    });
    let ans = 1 + dfsBrute(n - 1, childSub1);

    if (n % 2 === 0) {
      const childDiv2: GreedyTreeNode = {
        id: `node-div2-${++nodeCounter}`,
        name: `f(${n / 2})`,
        val: `?`,
        edgeLabel: '/2',
        children: [],
      };
      parentNode.children.push(childDiv2);
      steps.push({
        n,
        decision: `尝试分支 2：能被 2 整除，吃掉 n/2，转移至 f(${n / 2})`,
        message: '花费 1 天吃掉一半橘子',
        log: `branch /2 from ${n}`,
        codeLine: lines.divTwo,
        line: lines.divTwo?.java ?? 4,
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: childDiv2.id,
      });
      ans = Math.min(ans, 1 + dfsBrute(n / 2, childDiv2));
    }

    if (n % 3 === 0) {
      const childDiv3: GreedyTreeNode = {
        id: `node-div3-${++nodeCounter}`,
        name: `f(${n / 3})`,
        val: `?`,
        edgeLabel: '/3',
        children: [],
      };
      parentNode.children.push(childDiv3);
      steps.push({
        n,
        decision: `尝试分支 3：能被 3 整除，吃掉 2*(n/3)，转移至 f(${n / 3})`,
        message: '花费 1 天吃掉三分之二橘子',
        log: `branch /3 from ${n}`,
        codeLine: lines.divThree,
        line: lines.divThree?.java ?? 5,
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: childDiv3.id,
      });
      ans = Math.min(ans, 1 + dfsBrute(n / 3, childDiv3));
    }

    parentNode.val = `${ans}`;
    steps.push({
      n,
      decision: `汇总当前节点 f(${n}) 结果：最少天数 = ${ans}`,
      message: `来自所有可行分支的最小值`,
      log: `done f(${n})=${ans}`,
      codeLine: lines.done,
      line: lines.done?.java ?? 6,
      treeRoot: JSON.parse(JSON.stringify(rootNode)),
      activeNodeId: parentNode.id,
      finalAns: ans,
    });
    return ans;
  }

  const finalDays = dfsBrute(targetN, rootNode);

  steps.push({
    n: targetN,
    decision: `🎉 暴力回溯完成！吃完 ${targetN} 个橘子的最少天数为 ${finalDays} 天`,
    message: '当 n 稍大（如 n=100）时，纯暴力分支将达上亿次，必须采用贪心跨步剪枝！',
    log: `done finalDays=${finalDays}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 8,
    treeRoot: JSON.parse(JSON.stringify(rootNode)),
    finalAns: finalDays,
  });

  return steps;
}

export function buildEatOrangesStage2Steps(targetN: number): EatOrangesStep[] {
  const steps: EatOrangesStep[] = [];
  const lines = EAT_ORANGES_STAGE2_LINES;
  const memo = new Map<number, number>();

  const rootNode: GreedyTreeNode = {
    id: `node-${targetN}`,
    name: `f(${targetN})`,
    val: `?`,
    children: [],
  };

  steps.push({
    n: targetN,
    decision: `主函数入口：开始求解吃完 n=${targetN} 个橘子的最少天数（贪心跨步版）`,
    message: '核心贪心：绝不无谓吃 1 个；只吃必需的 (n%2) 或 (n%3) 个凑出倍数后直接整除！',
    log: `enter minDays(n=${targetN})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
    treeRoot: JSON.parse(JSON.stringify(rootNode)),
    activeNodeId: rootNode.id,
    memoTable: [],
  });

  let nodeCounter = 0;
  function dfsGreedy(n: number, parentNode: GreedyTreeNode): number {
    if (n <= 1) {
      parentNode.val = `${n}`;
      steps.push({
        n,
        decision: `基底特判：n=${n} <= 1，直接返回 ${n} 天`,
        message: '递归出口',
        log: `base return ${n}`,
        codeLine: lines.guard,
        line: lines.guard?.java ?? 2,
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: parentNode.id,
        memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
      });
      return n;
    }

    if (memo.has(n)) {
      const cached = memo.get(n)!;
      parentNode.val = `${cached}`;
      parentNode.status = 'pruned';
      steps.push({
        n,
        decision: `🎯 记忆化缓存命中：f(${n}) 已计算过，直接返回缓存值 ${cached} 天（剪枝）`,
        message: '避免重复递归计算重叠子问题',
        log: `memo hit f(${n})=${cached}`,
        codeLine: lines.memoCheck,
        line: lines.memoCheck?.java ?? 3,
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: parentNode.id,
        memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
      });
      return cached;
    }

    const cost2 = (n % 2) + 1;
    const next2 = Math.floor(n / 2);
    const childDiv2: GreedyTreeNode = {
      id: `node-${++nodeCounter}`,
      name: `f(${next2})`,
      val: `?`,
      edgeLabel: `+${cost2}天`,
      children: [],
    };
    parentNode.children = parentNode.children || [];
    parentNode.children.push(childDiv2);

    steps.push({
      n,
      decision: `贪心跨步决策 1：花费 ${cost2} 天（吃 ${n % 2} 个凑成偶数并除以2），深入子问题 f(${next2})`,
      message: `等价转移方程项: (n % 2) + 1 + f(n / 2)`,
      log: `greedy div2: cost=${cost2}, next=${next2}`,
      codeLine: lines.greedyDiv,
      line: lines.greedyDiv?.java ?? 4,
      treeRoot: JSON.parse(JSON.stringify(rootNode)),
      activeNodeId: childDiv2.id,
      memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
    });
    const ans2 = cost2 + dfsGreedy(next2, childDiv2);

    const cost3 = (n % 3) + 1;
    const next3 = Math.floor(n / 3);
    const childDiv3: GreedyTreeNode = {
      id: `node-${++nodeCounter}`,
      name: `f(${next3})`,
      val: `?`,
      edgeLabel: `+${cost3}天`,
      children: [],
    };
    parentNode.children.push(childDiv3);

    steps.push({
      n,
      decision: `贪心跨步决策 2：花费 ${cost3} 天（吃 ${n % 3} 个凑成3的倍数并除以3），深入子问题 f(${next3})`,
      message: `等价转移方程项: (n % 3) + 1 + f(n / 3)`,
      log: `greedy div3: cost=${cost3}, next=${next3}`,
      codeLine: lines.greedyDiv,
      line: lines.greedyDiv?.java ?? 4,
      treeRoot: JSON.parse(JSON.stringify(rootNode)),
      activeNodeId: childDiv3.id,
      memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
    });
    const ans3 = cost3 + dfsGreedy(next3, childDiv3);

    const minDays = Math.min(ans2, ans3);
    memo.set(n, minDays);
    parentNode.val = `${minDays}`;

    steps.push({
      n,
      decision: `写入记忆表：memo[${n}] = min(分支A=${ans2}, 分支B=${ans3}) = ${minDays} 天`,
      message: `f(${n}) 结果收拢`,
      log: `memo save f(${n})=${minDays}`,
      codeLine: lines.memoSave,
      line: lines.memoSave?.java ?? 5,
      treeRoot: JSON.parse(JSON.stringify(rootNode)),
      activeNodeId: parentNode.id,
      memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
      finalAns: minDays,
    });

    return minDays;
  }

  const finalRes = dfsGreedy(targetN, rootNode);

  steps.push({
    n: targetN,
    decision: `🎉 贪心跨步计算完成！吃完 ${targetN} 个橘子仅需 ${finalRes} 天`,
    message: `总递归树节点数仅 ${memo.size} 个，时间复杂度收敛至 O((log N)^2)`,
    log: `done finalRes=${finalRes}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 6,
    treeRoot: JSON.parse(JSON.stringify(rootNode)),
    memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
    finalAns: finalRes,
  });

  return steps;
}

export function buildEatOrangesStage3Steps(targetN: number): EatOrangesStep[] {
  const steps: EatOrangesStep[] = [];
  const lines = EAT_ORANGES_STAGE3_LINES;

  steps.push({
    n: targetN,
    decision: '阶段 3：贪心“绝不连续吃 1 个”正确性数学证明',
    message: '定理：如果一个人连续吃 1 个橘子超过 2 次，该方案必然严格劣于先凑倍数后整除的贪心跳跃！',
    log: 'enter analyzeGreedyJump',
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  const cost2 = (targetN % 2) + 1;
  const cost3 = (targetN % 3) + 1;
  const bestChoice = cost2 < cost3 ? '除以 2 分支' : '除以 3 分支';

  steps.push({
    n: targetN,
    decision: `计算当前规模 n=${targetN} 的局部整除跳跃花费：`,
    message: `凑偶数花费 (n % 2) + 1 = ${cost2} 天 ➔ 规模骤降至 ${Math.floor(targetN / 2)}；凑3倍数花费 (n % 3) + 1 = ${cost3} 天 ➔ 规模骤降至 ${Math.floor(targetN / 3)}`,
    log: `compute costs: div2=${cost2}, div3=${cost3}`,
    codeLine: lines.costCompute,
    line: lines.costCompute?.java ?? 2,
  });

  steps.push({
    n: targetN,
    decision: `🎉 反证成立：连续吃 1 属于 O(N) 的线性消耗，而跨步除法是指数级折半，贪心选择性质与最优子结构得证！`,
    message: `推荐优先决策分支：${bestChoice}`,
    log: 'proof verified',
    codeLine: lines.done,
    line: lines.done?.java ?? 3,
  });

  return steps;
}

export function parseEatOrangesInput(inputs: Record<string, any>, stage: number): EatOrangesStep[] {
  const n = parseInt(inputs?.['input-n'] || '10', 10);
  const validN = isNaN(n) || n <= 0 ? 10 : n;

  if (stage === 1) return buildEatOrangesStage1Steps(Math.min(12, validN));
  if (stage === 2) return buildEatOrangesStage2Steps(validN);
  return buildEatOrangesStage3Steps(validN);
}
