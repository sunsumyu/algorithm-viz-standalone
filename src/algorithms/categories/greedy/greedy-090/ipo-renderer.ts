/**
 * IPO 项目最大化资本 (LeetCode 502) - 声明式教学级沙盘渲染器
 * 核心贪心：双堆协同——启动资金小根堆（待解锁）+ 纯利润大根堆（已解锁可选），贪心挑选最大利润滚雪球
 * 三阶段：
 *   阶段 1: 暴力排列搜索对比 (Brute-Force DFS)
 *   阶段 2: 双堆协同解锁与利润最大推演 (Two-Heap Greedy)
 *   阶段 3: 单调资本扩张优势支配反证 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  IPO_STAGE1_CODES,
  IPO_STAGE1_LINES,
  IPO_STAGE2_CODES,
  IPO_STAGE2_LINES,
  IPO_STAGE3_CODES,
  IPO_STAGE3_LINES,
} from './greedy-090-stage-codes';
import {
  Greedy090Step,
  renderIPOTwoHeapMarket,
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

// ==========================================
// 辅助解析与步进生成器
// ==========================================

function parseProjectsInput(
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

  // Step 0: 入口帧
  steps.push({
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
    codeLine: {
      java: stage === 1 ? IPO_STAGE1_LINES.java.init : stage === 2 ? IPO_STAGE2_LINES.java.init : IPO_STAGE3_LINES.java.intro,
      cpp: stage === 1 ? IPO_STAGE1_LINES.cpp.init : stage === 2 ? IPO_STAGE2_LINES.cpp.init : IPO_STAGE3_LINES.cpp.intro,
      python: stage === 1 ? IPO_STAGE1_LINES.python.init : stage === 2 ? IPO_STAGE2_LINES.python.init : IPO_STAGE3_LINES.python.intro,
      javascript: stage === 1 ? IPO_STAGE1_LINES.javascript.init : stage === 2 ? IPO_STAGE2_LINES.javascript.init : IPO_STAGE3_LINES.javascript.intro,
    },
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

      steps.push({
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
        codeLine: {
          java: IPO_STAGE1_LINES.java.pick,
          cpp: IPO_STAGE1_LINES.cpp.pick,
          python: IPO_STAGE1_LINES.python.pick,
          javascript: IPO_STAGE1_LINES.javascript.pick,
        },
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
        steps.push({
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
          codeLine: {
            java: IPO_STAGE2_LINES.java.unlock,
            cpp: IPO_STAGE2_LINES.cpp.unlock,
            python: IPO_STAGE2_LINES.python.unlock,
            javascript: IPO_STAGE2_LINES.javascript.unlock,
          },
        });
      }

      // 2. 检查是否有可选项目
      if (profitHeap.size() === 0) {
        steps.push({
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
          codeLine: {
            java: IPO_STAGE2_LINES.java.check,
            cpp: IPO_STAGE2_LINES.cpp.check,
            python: IPO_STAGE2_LINES.python.check,
            javascript: IPO_STAGE2_LINES.javascript.check,
          },
        });
        break;
      }

      // 3. 贪心挑选利润最大的项目
      const best = profitHeap.pop()!;
      curW += best.profit;
      roundsLeft--;
      doneCount++;

      steps.push({
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
        codeLine: {
          java: IPO_STAGE2_LINES.java.invest,
          cpp: IPO_STAGE2_LINES.cpp.invest,
          python: IPO_STAGE2_LINES.python.invest,
          javascript: IPO_STAGE2_LINES.javascript.invest,
        },
      });
    }

    steps.push({
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
      codeLine: {
        java: IPO_STAGE2_LINES.java.ret,
        cpp: IPO_STAGE2_LINES.cpp.ret,
        python: IPO_STAGE2_LINES.python.ret,
        javascript: IPO_STAGE2_LINES.javascript.ret,
      },
    });

    return steps;
  }

  // 阶段3: 单调资本扩张优势支配反证
  steps.push({
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
    codeLine: {
      java: IPO_STAGE3_LINES.java.assume,
      cpp: IPO_STAGE3_LINES.cpp.assume,
      python: IPO_STAGE3_LINES.python.assume,
      javascript: IPO_STAGE3_LINES.javascript.assume,
    },
  });

  steps.push({
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
    codeLine: {
      java: IPO_STAGE3_LINES.java.superset,
      cpp: IPO_STAGE3_LINES.cpp.superset,
      python: IPO_STAGE3_LINES.python.superset,
      javascript: IPO_STAGE3_LINES.javascript.superset,
    },
  });

  steps.push({
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
    codeLine: {
      java: IPO_STAGE3_LINES.java.conclusion,
      cpp: IPO_STAGE3_LINES.cpp.conclusion,
      python: IPO_STAGE3_LINES.python.conclusion,
      javascript: IPO_STAGE3_LINES.javascript.conclusion,
    },
  });

  return steps;
}

// ==========================================
// 声明式沙盘装配
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<IPOStep>({
  id: 'ipo-max-capital',
  name: 'IPO 最大化资本',
  category: 'greedy',
  icon: '💰',
  badge: {
    mode: '双堆协同滚雪球',
    complexity: 'O(n log n) · O(n)',
  },
  card1Title: '💼 IPO 双堆协同资本市场沙盘',
  card2Title: '📈 资本流动与项目解锁监视器',
  card2Desc: '展示成本小根堆门槛筛选、利润大根堆利润套现与资本滚雪球过程',
  legend: [
    { label: '已解锁可投资项目 (利润大根堆)', color: '#10b981' },
    { label: '待解锁受限项目 (成本小根堆)', color: '#ef4444' },
    { label: '当前正在投资项目', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-k',
      label: '最多投资轮数 k',
      type: 'number',
      defaultValue: '2',
      width: '90px',
    },
    {
      id: 'input-w',
      label: '初始资本 w',
      type: 'number',
      defaultValue: '0',
      width: '90px',
    },
    {
      id: 'input-profits',
      label: '各项目纯利润',
      type: 'text',
      defaultValue: '1, 2, 3',
      width: '130px',
    },
    {
      id: 'input-capital',
      label: '各项目启动金',
      type: 'text',
      defaultValue: '0, 1, 1',
      width: '130px',
    },
  ],
  presets: [
    {
      label: '标准用例 (w=0, k=2, profits=[1,2,3], capital=[0,1,1])',
      values: { 'input-k': '2', 'input-w': '0', 'input-profits': '1, 2, 3', 'input-capital': '0, 1, 1' },
    },
    {
      label: '递进解锁 (w=0, k=3, profits=[2,3,5], capital=[0,1,2])',
      values: { 'input-k': '3', 'input-w': '0', 'input-profits': '2, 3, 5', 'input-capital': '0, 1, 2' },
    },
    {
      label: '资本受阻 (w=1, k=3, profits=[10,1,2], capital=[100,1,2])',
      values: { 'input-k': '3', 'input-w': '1', 'input-profits': '10, 1, 2', 'input-capital': '100, 1, 2' },
    },
  ],
  metrics: [
    { id: 'capital-w', label: '当前总资本', color: '#10b981' },
    { id: 'k-left', label: '剩余投资轮数', color: '#38bdf8' },
    { id: 'unlocked-count', label: '可选项目池大小', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力排列搜索对比',
      shortName: '暴力排列',
      card2Desc: '枚举所有可能的分支排列，展示随轮数阶乘级膨胀',
      codeLanguages: IPO_STAGE1_CODES,
      buildSteps: (inputs) => {
        const k = parseInt(inputs?.['input-k'] || '2', 10);
        const w = parseInt(inputs?.['input-w'] || '0', 10);
        const p = inputs?.['input-profits'] || '1, 2, 3';
        const c = inputs?.['input-capital'] || '0, 1, 1';
        return buildIPOSteps(k, w, p, c, 1);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 双堆协同解锁与利润最大推演',
      shortName: '双堆贪心',
      card2Desc: '成本小根堆筛选门槛，利润大根堆锁定最高回报，资本高效滚雪球',
      codeLanguages: IPO_STAGE2_CODES,
      buildSteps: (inputs) => {
        const k = parseInt(inputs?.['input-k'] || '2', 10);
        const w = parseInt(inputs?.['input-w'] || '0', 10);
        const p = inputs?.['input-profits'] || '1, 2, 3';
        const c = inputs?.['input-capital'] || '0, 1, 1';
        return buildIPOSteps(k, w, p, c, 2);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 单调资本扩张支配证明',
      shortName: '贪心证明',
      card2Desc: '由超集支配律证明当前最高纯益对未来候选集合具有严格包含优势',
      codeLanguages: IPO_STAGE3_CODES,
      buildSteps: (inputs) => {
        const k = parseInt(inputs?.['input-k'] || '2', 10);
        const w = parseInt(inputs?.['input-w'] || '0', 10);
        const p = inputs?.['input-profits'] || '1, 2, 3';
        const c = inputs?.['input-capital'] || '0, 1, 1';
        return buildIPOSteps(k, w, p, c, 3);
      },
    },
  ],
  codeLanguages: IPO_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.ipo.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 双堆贪心的运行机理与超集支配</h3>
      <p><b>为什么不能只用一个堆？</b></p>
      <p>因为项目的启动需要满足门槛 $capital[i] \le w$。随着资本 $w$ 的增加，原本不能做的项目会陆续变成“可以做”。如果只有一个大根堆，堆顶的项目可能因为资金不够而无法启动；如果只有一个小根堆，又无法在常数时间内找到利润最大的项目。</p>
      
      <p><b>双堆协同的分工：</b></p>
      <ul>
        <li><b>门槛小根堆（待解锁池）</b>：堆顶是所需启动资金最少的项目。只要堆顶门槛 $\le w$，就不断弹出并转移到利润大根堆。</li>
        <li><b>利润大根堆（可选池）</b>：里面的所有项目资本都已达标。直接弹出堆顶利润最高者变现，让 $w$ 滚雪球式快速增长！</li>
      </ul>
    </div>
  `,
  buildSteps: (inputs) => {
    const k = parseInt(inputs?.['input-k'] || '2', 10);
    const w = parseInt(inputs?.['input-w'] || '0', 10);
    const p = inputs?.['input-profits'] || '1, 2, 3';
    const c = inputs?.['input-capital'] || '0, 1, 1';
    return buildIPOSteps(k, w, p, c, 2);
  },
  renderCanvas: (container, step) => {
    renderIPOTwoHeapMarket(container, {
      capital: step.capital,
      kLeft: step.kLeft,
      lockedProjects: step.lockedProjects,
      unlockedProjects: step.unlockedProjects,
      activeProject: step.activeProject,
    });

    const root = container.closest('.dsp-view-root') || document;
    const capEl = root.querySelector('#metric-capital-w');
    const kEl = root.querySelector('#metric-k-left');
    const poolEl = root.querySelector('#metric-unlocked-count');

    if (capEl) capEl.textContent = `$${step.capital}`;
    if (kEl) kEl.textContent = `${step.kLeft} 轮`;
    if (poolEl) poolEl.textContent = `${step.unlockedProjects.length} 个`;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">当前轮次状态:</span>
          <span style="font-size: 11px; color: #0284c7; font-weight: 700;">${step.decision}</span>
        </div>
        <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11.5px; color: #334155;">
          ${step.message}
        </div>
      </div>
    `;
  },
});

export const ipoRenderer = Visualizer;
registerAlgorithm({
  id: 'ipo-max-capital',
  name: 'IPO 最大化资本 (LeetCode 502)',
  viewId: 'algo-ipo-max-capital-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code05：启动金小根堆 + 纯利润大根堆双堆协同滚雪球',
  icon: '💰',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 905,
  learningGoal: '掌握双堆协同设计模式与超集支配单调扩张性质',
});
