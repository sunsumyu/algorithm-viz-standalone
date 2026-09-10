/**
 * 吃掉 N 个橘子的最少天数 (LeetCode 1553) - 声明式教学级沙盘渲染器
 * 核心贪心：贪心跨步快速除法 (n%2+1+f(n/2) 与 n%3+1+f(n/3)) 与记忆化剪枝
 * 三阶段：
 *   阶段 1: 纯暴力 -1 递归展开对比 (Brute-Force)
 *   阶段 2: 贪心跨步除法记忆化推演 (Greedy + Memo)
 *   阶段 3: 贪心不连续吃 1 个橘子反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  EAT_ORANGES_STAGE1_CODES,
  EAT_ORANGES_STAGE1_LINES,
  EAT_ORANGES_STAGE2_CODES,
  EAT_ORANGES_STAGE2_LINES,
  EAT_ORANGES_STAGE3_CODES,
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

// ==========================================
// 1. 阶段 1：暴力 -1 递归步进生成器
// ==========================================
export function buildEatOrangesStage1Steps(targetN: number): EatOrangesStep[] {
  const steps: EatOrangesStep[] = [];
  const lines = EAT_ORANGES_STAGE1_LINES;

  const rootNode: GreedyTreeNode = {
    id: `node-${targetN}`,
    name: `f(${targetN})`,
    val: `?`,
    children: [],
  };

  // Step 0: 入口
  steps.push({
    n: targetN,
    decision: `主函数入口：开始求解吃完 n=${targetN} 个橘子的最少天数`,
    message: '阶段 1 纯暴力尝试：包含每天只吃 1 个的冗余分支，展示指数级爆炸',
    log: `enter minDaysBrute(n=${targetN})`,
    codeLine: lines.entry,
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
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: parentNode.id,
      });
      return n;
    }

    // 分支 1: 吃 1 个
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
      treeRoot: JSON.parse(JSON.stringify(rootNode)),
      activeNodeId: childSub1.id,
    });
    let ans = 1 + dfsBrute(n - 1, childSub1);

    // 分支 2: 被 2 整除
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
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: childDiv2.id,
      });
      ans = Math.min(ans, 1 + dfsBrute(n / 2, childDiv2));
    }

    // 分支 3: 被 3 整除
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
    treeRoot: JSON.parse(JSON.stringify(rootNode)),
    finalAns: finalDays,
  });

  return steps;
}

// ==========================================
// 2. 阶段 2：贪心跨步除法 + 记忆化搜索
// ==========================================
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

  // Step 0: 入口
  steps.push({
    n: targetN,
    decision: `主函数入口：开始求解吃完 n=${targetN} 个橘子的最少天数（贪心跨步版）`,
    message: '核心贪心：绝不无谓吃 1 个；只吃必需的 (n%2) 或 (n%3) 个凑出倍数后直接整除！',
    log: `enter minDays(n=${targetN})`,
    codeLine: lines.entry,
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
        treeRoot: JSON.parse(JSON.stringify(rootNode)),
        activeNodeId: parentNode.id,
        memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
      });
      return cached;
    }

    // 贪心分支 A: 凑偶数除以 2 ➔ 花费 (n % 2) 天吃 1 个 + 1 天除以 2
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
      treeRoot: JSON.parse(JSON.stringify(rootNode)),
      activeNodeId: childDiv2.id,
      memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
    });
    const ans2 = cost2 + dfsGreedy(next2, childDiv2);

    // 贪心分支 B: 凑 3 倍数除以 3 ➔ 花费 (n % 3) 天吃 1 个 + 1 天除以 3
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
    treeRoot: JSON.parse(JSON.stringify(rootNode)),
    memoTable: Array.from(memo.entries()).map(([k, v]) => ({ n: k, days: v })),
    finalAns: finalRes,
  });

  return steps;
}

// ==========================================
// 3. 阶段 3：贪心反证法证明步进生成器
// ==========================================
export function buildEatOrangesStage3Steps(targetN: number): EatOrangesStep[] {
  const steps: EatOrangesStep[] = [];
  const lines = EAT_ORANGES_STAGE3_LINES;

  steps.push({
    n: targetN,
    decision: '阶段 3：贪心“绝不连续吃 1 个”正确性数学证明',
    message: '定理：如果一个人连续吃 1 个橘子超过 2 次，该方案必然严格劣于先凑倍数后整除的贪心跳跃！',
    log: 'enter analyzeGreedyJump',
    codeLine: lines.entry,
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
  });

  steps.push({
    n: targetN,
    decision: `🎉 反证成立：连续吃 1 属于 O(N) 的线性消耗，而跨步除法是指数级折半，贪心选择性质与最优子结构得证！`,
    message: `推荐优先决策分支：${bestChoice}`,
    log: 'proof verified',
    codeLine: lines.done,
  });

  return steps;
}

// ==========================================
// 4. 声明式可视化器配置
// ==========================================
const { template, Visualizer } = createDeclarativeVisualizer<EatOrangesStep>({
  id: 'minimum-eat-oranges',
  name: '吃橘子的最少天数 (Eat Oranges)',
  category: 'greedy',
  icon: '🍊',
  badge: {
    mode: '贪心跨步+记忆化',
    complexity: 'O((log N)²) · O((log N)²)',
  },
  card1Title: '🌳 递归决策展开树与跳跃沙盘',
  card2Title: '🗄️ 记忆化缓存表与分支收益看板',
  card2Desc: '展示 memo 哈希剪枝表与除以 2 / 除以 3 的天平比对',
  legend: [
    { label: '活跃节点', color: '#3b82f6' },
    { label: '已求解节点', color: '#10b981' },
    { label: '剪枝命中节点', color: '#94a3b8' },
  ],
  inputs: [
    {
      id: 'input-n',
      label: '橘子数量 N',
      type: 'number',
      defaultValue: 10,
      width: '90px',
      placeholder: '整数 N',
    },
  ],
  presets: [
    { label: '经典示例: N=10', values: { 'input-n': 10 } },
    { label: '三倍数测试: N=6', values: { 'input-n': 6 } },
    { label: '质数测试: N=11', values: { 'input-n': 11 } },
  ],
  metrics: [
    { id: 'target-n', label: '剩余橘子数', color: '#f59e0b' },
    { id: 'memo-count', label: '记忆表大小', color: '#3b82f6' },
    { id: 'final-days', label: '最少天数', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力对比',
      shortName: '暴力递归',
      card2Desc: '展示逐个吃橘子的深度 O(N) 递归树退化与状态爆炸',
      codeLanguages: EAT_ORANGES_STAGE1_CODES,
      buildSteps: (inputs) => {
        const n = Math.min(12, parseInt(inputs?.['input-n'] || '10', 10));
        return buildEatOrangesStage1Steps(n);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 贪心跨步推演',
      shortName: '跨步贪心',
      card2Desc: '通过 (n%2)+1+f(n/2) 与 (n%3)+1+f(n/3) 极速跳跃，树深降至 O(log N)',
      codeLanguages: EAT_ORANGES_STAGE2_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '10', 10);
        return buildEatOrangesStage2Steps(n);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 贪心证明',
      shortName: '贪心证明',
      card2Desc: '代数证明连续吃 1 严格劣于跨步整除跳跃',
      codeLanguages: EAT_ORANGES_STAGE3_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '10', 10);
        return buildEatOrangesStage3Steps(n);
      },
    },
  ],
  codeLanguages: EAT_ORANGES_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.minimumEatOranges.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 为什么连续吃 1 必然不是最优？</h3>
      <p>假设当前有 $n$ 个橘子。若我们连续吃 1 个橘子直到凑成偶数，一共吃了 $n \\% 2$ 个，之后吃掉 $n/2$ 个，总耗时：</p>
      <div style="padding: 4px 10px; background: #eff6ff; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #1e40af;">
        \\text{Days} = (n \\% 2) + 1 + f(\\lfloor n/2 \\rfloor)
      </div>
      <p>如果连续吃 1 个橘子超过 2 次，例如连续吃 3 个，剩余 $n - 3$。而只要先除以 2 或除以 3，橘子数量呈指数级锐减，耗时远少于一步步减 1。因此最优解的分支选择必然只在<b>除以 2</b> 与<b>除以 3</b> 之间展开！</p>
    </div>
  `,
  buildSteps: (inputs) => {
    const n = parseInt(inputs?.['input-n'] || '10', 10);
    return buildEatOrangesStage2Steps(n);
  },
  renderCanvas: (container, step) => {
    if (step.treeRoot) {
      RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId, false);
    } else {
      container.innerHTML = `<div style="color: #94a3b8; font-size: 12px; font-style: italic;">等待树生成...</div>`;
    }
  },
  renderCustomMetrics: (container, step) => {
    const memo = step.memoTable || [];
    const rowsHtml = memo.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">记忆表为空</span>'
      : memo.map((item) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: #ffffff; border: 1px solid #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <span style="font-weight: 700; color: #334155;">f(${item.n})</span>
            <span style="font-weight: 800; color: #10b981;">${item.days} 天</span>
          </div>
        `).join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;">
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          <span>🗄️ 记忆化缓存表 (memo)</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #3b82f6;">已缓存: ${memo.length} 项</span>
        </div>
        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
          ${rowsHtml}
        </div>
      </div>
    `;
  },
});

export const MinimumEatOrangesVisualizer = Visualizer;

registerAlgorithm({
  id: 'minimum-eat-oranges',
  name: '吃橘子的最少天数 (Eat Oranges)',
  viewId: 'algo-minimum-eat-oranges-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code03：LeetCode 1553 吃掉N个橘子的最少天数，贪心跨步整除飞跃与记忆化剪枝',
  icon: '🍊',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 893,
  learningGoal: '掌握贪心策略如何大幅压缩递归搜索状态空间，理解 (n%2+1) 跨步跳跃的数学本质',
});
