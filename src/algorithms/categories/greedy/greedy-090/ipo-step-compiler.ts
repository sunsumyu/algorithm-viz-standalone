import { getGreedy090Anchor } from './greedy-090-stage-codes';
import {
  Greedy090Step,
  IPOProjectItem,
  SimpleHeap,
} from './greedy-090-shared';

export interface IPOStep extends Greedy090Step {
  capital: number;
  kLeft: number;
  lockedProjects: IPOProjectItem[];
  unlockedProjects: IPOProjectItem[];
  activeProject?: IPOProjectItem;
  investedCount: number;
  maxCapital: number;
}

export function parseProjectsInput(
  rawProfits: string,
  rawCapitals: string
): { profits: number[]; capital: number[] } {
  const p = rawProfits.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const c = rawCapitals.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const minLen = Math.min(p.length, c.length);
  return {
    profits: minLen > 0 ? p.slice(0, minLen) : [1, 2, 3],
    capital: minLen > 0 ? c.slice(0, minLen) : [0, 1, 1],
  };
}

export function buildIPOSteps(
  k: number,
  w: number,
  rawProfits: string,
  rawCapitals: string,
  stage: number
): IPOStep[] {
  const { profits, capital } = parseProjectsInput(rawProfits, rawCapitals);
  const steps: IPOStep[] = [];

  const allProjects: IPOProjectItem[] = profits.map((p, idx) => ({
    id: `proj-${idx}`,
    name: `项目 P${idx + 1}`,
    cost: capital[idx],
    profit: p,
  }));

  const initAnchor = getGreedy090Anchor(
    'ipo',
    stage === 1 ? 1 : stage === 2 ? 2 : 3,
    stage === 1 ? 'init' : stage === 2 ? 'init' : 'intro'
  );

  // Step 0: 入口帧
  steps.push({
    line: initAnchor.java,
    stepIndex: 0,
    capital: w,
    kLeft: k,
    lockedProjects: allProjects.filter((p) => p.cost > w),
    unlockedProjects: allProjects.filter((p) => p.cost <= w),
    investedCount: 0,
    maxCapital: w,
    decision: '初始化资本与项目市场',
    message: `初始本金 w = $${w}，最多投资 k = ${k} 轮。候选项目总数: ${allProjects.length}`,
    log: `[Init] w=${w}, k=${k}, 项目数=${allProjects.length}`,
    codeLine: initAnchor,
  });

  if (stage === 1) {
    // 阶段1: 暴力搜索演示
    let curW = w;
    let rounds = k;
    let done = 0;
    const available = allProjects.filter((p) => p.cost <= curW);

    for (let r = 0; r < Math.min(k, 3); r++) {
      if (available.length === 0) break;
      const pick = available[r % available.length];
      curW += pick.profit;
      rounds--;
      done++;

      const pickAnchor = getGreedy090Anchor('ipo', 1, 'pick');
      steps.push({
        line: pickAnchor.java,
        stepIndex: steps.length,
        capital: curW,
        kLeft: rounds,
        lockedProjects: allProjects.filter((p) => p.cost > curW),
        unlockedProjects: allProjects.filter((p) => p.cost <= curW && p.id !== pick.id),
        activeProject: pick,
        investedCount: done,
        maxCapital: curW,
        decision: `DFS 递归分支尝试: 投资 ${pick.name}`,
        message: `在当前本金下，暴力探索选择 ${pick.name} (门槛 $${pick.cost}, 纯利 +$${pick.profit})，探索其子树最终收益`,
        log: `[DFS Try] 投资 ${pick.name}, 资本 -> $${curW}`,
        codeLine: pickAnchor,
      });
    }
    return steps;
  }

  if (stage === 2) {
    // 阶段2: 双堆贪心推演
    let curW = w;
    let roundsLeft = k;
    let doneCount = 0;

    // 成本小根堆（门槛升序）
    const costHeap = new SimpleHeap<IPOProjectItem>((a, b) => a.cost - b.cost);
    allProjects.forEach((p) => costHeap.push(p));

    // 利润大根堆（利润降序）
    const profitHeap = new SimpleHeap<IPOProjectItem>((a, b) => b.profit - a.profit);

    for (let round = 0; round < k; round++) {
      // 1. 解锁所有门槛 <= curW 的项目
      let unlockedThisRound = false;
      while (costHeap.size() > 0 && costHeap.peek()!.cost <= curW) {
        const unlocked = costHeap.pop()!;
        profitHeap.push(unlocked);
        unlockedThisRound = true;
      }

      if (unlockedThisRound || round === 0) {
        const unlockAnchor = getGreedy090Anchor('ipo', 2, 'unlock');
        steps.push({
          line: unlockAnchor.java,
          stepIndex: steps.length,
          capital: curW,
          kLeft: roundsLeft,
          lockedProjects: costHeap.toArray(),
          unlockedProjects: profitHeap.toArray(),
          investedCount: doneCount,
          maxCapital: curW,
          decision: `第 ${round + 1} 轮: 解锁可投资项目`,
          message: `当前资本为 $${curW}，从小根堆转移所有启动金 <= $${curW} 的项目到大根堆。目前可投资池有 ${profitHeap.size()} 个项目`,
          log: `[Unlock] 资本 $${curW}, 可选池数量=${profitHeap.size()}`,
          codeLine: unlockAnchor,
        });
      }

      // 2. 检查是否有可选项目
      if (profitHeap.size() === 0) {
        const checkAnchor = getGreedy090Anchor('ipo', 2, 'check');
        steps.push({
          line: checkAnchor.java,
          stepIndex: steps.length,
          capital: curW,
          kLeft: roundsLeft,
          lockedProjects: costHeap.toArray(),
          unlockedProjects: [],
          investedCount: doneCount,
          maxCapital: curW,
          decision: '资本不足，无法解锁更多项目',
          message: `大根堆为空且当前资本 $${curW} 无法启动任何剩余未解锁项目，提前终止投资`,
          log: `[Early Stop] 本金不足以启动任何项目，终止。`,
          codeLine: checkAnchor,
        });
        break;
      }

      // 3. 贪心挑选利润最大的项目
      const best = profitHeap.pop()!;
      curW += best.profit;
      roundsLeft--;
      doneCount++;

      const investAnchor = getGreedy090Anchor('ipo', 2, 'invest');
      steps.push({
        line: investAnchor.java,
        stepIndex: steps.length,
        capital: curW,
        kLeft: roundsLeft,
        lockedProjects: costHeap.toArray(),
        unlockedProjects: profitHeap.toArray(),
        activeProject: best,
        investedCount: doneCount,
        maxCapital: curW,
        decision: `第 ${round + 1} 轮: 投资最优项目 ${best.name}`,
        message: `贪心挑选大根堆堆顶纯利润最大的 ${best.name} (纯利 +$${best.profit})，资本扩充至 $${curW}！`,
        log: `[Invest] 落地 ${best.name}, 资本由 $${curW - best.profit} -> $${curW}`,
        codeLine: investAnchor,
      });
    }

    const retAnchor = getGreedy090Anchor('ipo', 2, 'ret');
    steps.push({
      line: retAnchor.java,
      stepIndex: steps.length,
      capital: curW,
      kLeft: roundsLeft,
      lockedProjects: costHeap.toArray(),
      unlockedProjects: profitHeap.toArray(),
      investedCount: doneCount,
      maxCapital: curW,
      decision: '双堆贪心收敛完成',
      message: `全部投资结束：经过 ${doneCount} 轮投资，最终获得的最大资本为 $${curW}`,
      log: `[Done] 最终最大资本=$${curW}`,
      codeLine: retAnchor,
    });

    return steps;
  }

  // 阶段3: 单调资本扩张优势支配反证
  const assumeAnchor = getGreedy090Anchor('ipo', 3, 'assume');
  steps.push({
    line: assumeAnchor.java,
    stepIndex: steps.length,
    capital: w,
    kLeft: k,
    lockedProjects: allProjects.slice(2),
    unlockedProjects: allProjects.slice(0, 2),
    investedCount: 0,
    maxCapital: w,
    decision: '资本扩张超集支配反证假设',
    message: '反证设问：假设在已解锁集合中，不选利润最大的 p_max，而选择另一项目 p_other (p_other < p_max)',
    log: '[Proof Start] 假设选次优项目 p_other < p_max',
    codeLine: assumeAnchor,
  });

  const supersetAnchor = getGreedy090Anchor('ipo', 3, 'superset');
  steps.push({
    line: supersetAnchor.java,
    stepIndex: steps.length,
    capital: w + 10,
    kLeft: k - 1,
    lockedProjects: allProjects.slice(3),
    unlockedProjects: allProjects.slice(0, 3),
    investedCount: 1,
    maxCapital: w + 10,
    decision: '超集支配律：高资本解锁范围单调占优',
    message: '由于 w + p_max > w + p_other，更高的资本意味着下一次能解锁的项目集合必是超集 (S_other ⊆ S_max)。选 p_max 绝不会损失任何未来机会，且拥有更大的探索自由度！',
    log: '[Proof Invariant] 资本单调递增，高资本解拥有超集支配权。',
    codeLine: supersetAnchor,
  });

  const conclAnchor = getGreedy090Anchor('ipo', 3, 'conclusion');
  steps.push({
    line: conclAnchor.java,
    stepIndex: steps.length,
    capital: w + 10,
    kLeft: k - 1,
    lockedProjects: allProjects.slice(3),
    unlockedProjects: allProjects.slice(0, 3),
    investedCount: 1,
    maxCapital: w + 10,
    decision: '贪心最优性证明成立',
    message: '无论是从本轮纯收益，还是从后续解锁项目的超集支配性来看，贪心选择大根堆堆顶均在所有维度上完全支配其他策略，局部最优必为全局最优！',
    log: '[Proof Verified] IPO 双堆贪心证明成立。',
    codeLine: conclAnchor,
  });

  return steps;
}
